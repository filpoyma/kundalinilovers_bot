import type { Bot } from 'grammy';
import { DateTime } from 'luxon';
import type { Types } from 'mongoose';
import ClassReminderJob from '../models/class-reminder-job.model';
import ClassReminderSubscription from '../models/class-reminder-subscription.model';
import type { IClassReminderJobDocument } from '../models/class-reminder-job.model';
import type { IOfflineLocationDocument } from '../models';
import type { IScheduleSlot } from '../types/schedule.types';
import { formatOfflineLocationHeaderHtml } from '../bot/utils/formatOfflineLocationHeader';
import { escapeTelegramHtml } from '../bot/utils/telegramHtml';
import { getOfflineLocationById, getActiveOfflineLocations } from './schedule.service';
import {
  formatClassReminderTime,
  getNextClassOccurrence,
  getReminderAt,
  getScheduleTimezone,
} from './timezone.service';
import { findUserByTelegramId } from './user.service';
import { formatReminderLeadPhrase } from '../utils/reminderLead';
import { getReminderBackoffMinutes } from '../utils/reminderBackoff';
import logger from '../config/logger';

const JOB_LOCK_MS = 5 * 60 * 1000;
const MAX_JOBS_PER_RUN = 50;

let onJobsChanged: (() => void) | undefined;

export function setReminderJobsChangedHandler(handler: () => void): void {
  onJobsChanged = handler;
}

function notifyJobsChanged(): void {
  onJobsChanged?.();
}

async function upsertJobForClassStart(
  telegramId: number,
  locationId: Types.ObjectId,
  slot: IScheduleSlot,
  classStart: DateTime,
): Promise<void> {
  if (!slot._id) return;

  const remindAt = getReminderAt(classStart);

  await ClassReminderJob.findOneAndUpdate(
    {
      telegramId,
      locationId,
      slotId: slot._id,
      sentAt: { $exists: false },
    },
    {
      $set: {
        telegramId,
        locationId,
        slotId: slot._id,
        classStartsAt: classStart.toJSDate(),
        remindAt: remindAt.toJSDate(),
        attempts: 0,
      },
      $unset: { lockedUntil: '' },
    },
    { upsert: true, new: true },
  );
}

async function createJobForSlot(
  telegramId: number,
  locationId: Types.ObjectId,
  slot: IScheduleSlot,
  scheduleTimezone: string,
): Promise<void> {
  const classStart = getNextClassOccurrence(slot.dayOfWeek, slot.startTime, scheduleTimezone);
  await upsertJobForClassStart(telegramId, locationId, slot, classStart);
}

async function scheduleJobsForSubscription(
  telegramId: number,
  location: IOfflineLocationDocument,
  scheduleTimezone: string,
): Promise<void> {
  await ClassReminderJob.deleteMany({
    telegramId,
    locationId: location._id,
    sentAt: { $exists: false },
  });

  for (const slot of location.slots) {
    await createJobForSlot(telegramId, location._id, slot, scheduleTimezone);
  }
}

async function claimNextDueJob(now: Date): Promise<IClassReminderJobDocument | null> {
  const lockUntil = new Date(now.getTime() + JOB_LOCK_MS);

  return ClassReminderJob.findOneAndUpdate(
    {
      remindAt: { $lte: now },
      sentAt: { $exists: false },
      $or: [
        { lockedUntil: { $exists: false } },
        { lockedUntil: null },
        { lockedUntil: { $lte: now } },
      ],
    },
    { $set: { lockedUntil: lockUntil } },
    { sort: { remindAt: 1 }, new: true },
  );
}

async function completeJobAndScheduleNext(
  job: IClassReminderJobDocument,
  slot: IScheduleSlot,
  sentAt: Date,
): Promise<void> {
  job.sentAt = sentAt;
  await job.save();

  const nextClassStart = DateTime.fromJSDate(job.classStartsAt).plus({ weeks: 1 });
  await upsertJobForClassStart(job.telegramId, job.locationId, slot, nextClassStart);
}

function buildReminderMessage(
  location: IOfflineLocationDocument,
  slot: IScheduleSlot,
  classStartsAt: Date,
  scheduleTimezone: string,
  userTimezone?: string,
): string {
  const classStart = DateTime.fromJSDate(classStartsAt);
  const lead = formatReminderLeadPhrase(classStart, scheduleTimezone);
  const timeText = formatClassReminderTime(classStart, scheduleTimezone, userTimezone);
  const header = formatOfflineLocationHeaderHtml(location);

  return `${lead}занятие «${escapeTelegramHtml(slot.title)}»\n📍 ${header}\n🕐 ${escapeTelegramHtml(timeText)}`;
}

async function deferJobAfterSendFailure(
  job: IClassReminderJobDocument,
  now: Date,
): Promise<void> {
  const attempts = (job.attempts ?? 0) + 1;
  const backoffMinutes = getReminderBackoffMinutes(attempts);
  const remindAt = new Date(now.getTime() + backoffMinutes * 60 * 1000);

  await ClassReminderJob.updateOne(
    { _id: job._id },
    {
      $set: { attempts, remindAt },
      $unset: { lockedUntil: '' },
    },
  );
}

export async function isSubscribedToLocation(
  telegramId: number,
  locationId: Types.ObjectId | string,
): Promise<boolean> {
  const subscription = await ClassReminderSubscription.findOne({
    telegramId,
    locationId,
    isActive: true,
  });

  return Boolean(subscription);
}

export async function subscribeToLocation(
  telegramId: number,
  locationId: Types.ObjectId | string,
): Promise<IOfflineLocationDocument | null> {
  const location = await getOfflineLocationById(locationId as Types.ObjectId);
  if (!location || !location.isActive) return null;

  const scheduleTimezone = await getScheduleTimezone();

  await ClassReminderSubscription.findOneAndUpdate(
    { telegramId, locationId: location._id },
    { isActive: true },
    { upsert: true, new: true },
  );

  await scheduleJobsForSubscription(telegramId, location, scheduleTimezone);
  notifyJobsChanged();
  return location;
}

export async function unsubscribeFromLocation(
  telegramId: number,
  locationId: Types.ObjectId | string,
): Promise<void> {
  await ClassReminderSubscription.findOneAndUpdate({ telegramId, locationId }, { isActive: false });

  await ClassReminderJob.deleteMany({
    telegramId,
    locationId,
    sentAt: { $exists: false },
  });
  notifyJobsChanged();
}

export async function rescheduleJobsForLocation(
  locationId: Types.ObjectId | string,
): Promise<void> {
  const location = await getOfflineLocationById(locationId as Types.ObjectId);
  if (!location) return;

  const scheduleTimezone = await getScheduleTimezone();
  const subscriptions = await ClassReminderSubscription.find({
    locationId: location._id,
    isActive: true,
  });

  await Promise.all(
    subscriptions.map(subscription =>
      scheduleJobsForSubscription(subscription.telegramId, location, scheduleTimezone),
    ),
  );
  notifyJobsChanged();
}

export async function removeJobsForSlot(slotId: Types.ObjectId | string): Promise<void> {
  await ClassReminderJob.deleteMany({ slotId, sentAt: { $exists: false } });
  notifyJobsChanged();
}

export async function deactivateSubscriptionsForLocation(
  locationId: Types.ObjectId | string,
): Promise<void> {
  await ClassReminderSubscription.updateMany({ locationId }, { isActive: false });
  await ClassReminderJob.deleteMany({ locationId, sentAt: { $exists: false } });
  notifyJobsChanged();
}

export async function processDueReminders(bot: Bot): Promise<void> {
  const now = new Date();
  const scheduleTimezone = await getScheduleTimezone();

  for (let processed = 0; processed < MAX_JOBS_PER_RUN; processed += 1) {
    const job = await claimNextDueJob(now);
    if (!job) return;

    const location = await getOfflineLocationById(job.locationId);
    if (!location || !location.isActive) {
      await ClassReminderJob.deleteOne({ _id: job._id });
      continue;
    }

    const subscription = await ClassReminderSubscription.findOne({
      telegramId: job.telegramId,
      locationId: job.locationId,
      isActive: true,
    });

    if (!subscription) {
      await ClassReminderJob.deleteOne({ _id: job._id });
      continue;
    }

    const slot = location.slots.find(item => item._id?.toString() === job.slotId.toString());
    if (!slot) {
      await ClassReminderJob.deleteOne({ _id: job._id });
      continue;
    }

    const classStartsAt = DateTime.fromJSDate(job.classStartsAt);
    const nowDt = DateTime.now();

    if (classStartsAt <= nowDt) {
      await completeJobAndScheduleNext(job, slot, now);
      continue;
    }

    const user = await findUserByTelegramId(job.telegramId);
    const message = buildReminderMessage(
      location,
      slot,
      job.classStartsAt,
      scheduleTimezone,
      user?.timezone,
    );

    try {
      await bot.api.sendMessage(job.telegramId, message, {
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true },
      });
      await completeJobAndScheduleNext(job, slot, now);
    } catch (error) {
      const description =
        error && typeof error === 'object' && 'description' in error
          ? String(error.description)
          : '';

      if (description.includes('bot was blocked') || description.includes('user is deactivated')) {
        await unsubscribeFromLocation(job.telegramId, job.locationId);
        await ClassReminderJob.deleteOne({ _id: job._id });
        continue;
      }

      logger.error('Failed to send class reminder', { jobId: job._id, error });
      await deferJobAfterSendFailure(job, now);
    }
  }
}

export async function getActiveSubscriptionLocationIds(telegramId: number): Promise<string[]> {
  const subscriptions = await ClassReminderSubscription.find({
    telegramId,
    isActive: true,
  });

  return subscriptions.map(subscription => subscription.locationId.toString());
}

export async function refreshAllReminderJobs(): Promise<void> {
  const scheduleTimezone = await getScheduleTimezone();
  const subscriptions = await ClassReminderSubscription.find({ isActive: true });
  const locations = await getActiveOfflineLocations();
  const locationMap = new Map(locations.map(location => [location._id.toString(), location]));

  for (const subscription of subscriptions) {
    const location = locationMap.get(subscription.locationId.toString());
    if (!location) continue;
    await scheduleJobsForSubscription(subscription.telegramId, location, scheduleTimezone);
  }
  notifyJobsChanged();
}
