import type { Types } from 'mongoose';
import type { IScheduleSlot, TScheduleType } from '../types/schedule.types';
import {
  addSlotToOfflineLocation,
  addSlotToOnlinePlatform,
  createOfflineLocation,
  createOnlinePlatform,
  deleteOfflineLocation,
  deleteOnlinePlatform,
  deleteOfflineSlot,
  deleteOnlineSlot,
  getAllOfflineLocations,
  getAllOnlinePlatforms,
  getOfflineLocationById,
  getOnlinePlatformById,
  getSchedulePageTitle,
  getSortedSlots,
  updateOfflineLocation,
  updateOnlinePlatform,
  updateOfflineSlot,
  updateOnlineSlot,
  upsertSchedulePageTitle,
  upsertSchedulePageTimezone,
} from './schedule.service';
import {
  deactivateSubscriptionsForLocation,
  refreshAllReminderJobs,
  removeJobsForSlot,
  rescheduleJobsForLocation,
} from './reminder.service';
import { getScheduleTimezone, getTimezoneLabel, isValidTimezone } from './timezone.service';
import { TIMEZONE_OPTIONS } from '../constants/timezone.constants';

export async function adminDeleteOfflineSection(locationId: Types.ObjectId): Promise<void> {
  await deactivateSubscriptionsForLocation(locationId);
  await deleteOfflineLocation(locationId);
}

export async function adminDeleteOnlineSection(platformId: Types.ObjectId): Promise<void> {
  await deleteOnlinePlatform(platformId);
}

export async function adminAddOfflineSlot(
  locationId: Types.ObjectId,
  slot: IScheduleSlot,
): Promise<void> {
  await addSlotToOfflineLocation(locationId, slot);
  await rescheduleJobsForLocation(locationId);
}

export async function adminUpdateOfflineSlot(
  locationId: Types.ObjectId,
  slotId: Types.ObjectId,
  slot: Omit<IScheduleSlot, '_id'>,
): Promise<void> {
  await updateOfflineSlot(locationId, slotId, slot);
  await rescheduleJobsForLocation(locationId);
}

export async function adminDeleteOfflineSlot(
  locationId: Types.ObjectId,
  slotId: Types.ObjectId,
): Promise<void> {
  await removeJobsForSlot(slotId);
  await deleteOfflineSlot(locationId, slotId);
  await rescheduleJobsForLocation(locationId);
}

export async function adminSetScheduleTimezone(timezone: string): Promise<string> {
  if (!isValidTimezone(timezone)) {
    throw new Error('INVALID_TIMEZONE');
  }
  await upsertSchedulePageTimezone('offline', timezone);
  await upsertSchedulePageTimezone('online', timezone);
  await refreshAllReminderJobs();
  return getTimezoneLabel(timezone);
}

export async function getAdminScheduleOverview(type: TScheduleType) {
  const title = await getSchedulePageTitle(type);

  if (type === 'offline') {
    const sections = await getAllOfflineLocations();
    return {
      type,
      title,
      sections: sections.map(section => ({
        id: section._id.toString(),
        country: section.country,
        city: section.city,
        address: section.address,
        slots: getSortedSlots(section.slots).map(slot => ({
          id: slot._id!.toString(),
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          title: slot.title,
        })),
      })),
    };
  }

  const sections = await getAllOnlinePlatforms();
  return {
    type,
    title,
    sections: sections.map(section => ({
      id: section._id.toString(),
      platform: section.platform,
      link: section.link,
      slots: getSortedSlots(section.slots).map(slot => ({
        id: slot._id!.toString(),
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        title: slot.title,
      })),
    })),
  };
}

export async function getAdminTimezoneState() {
  const timezone = await getScheduleTimezone();
  return {
    timezone,
    label: getTimezoneLabel(timezone),
    options: TIMEZONE_OPTIONS,
  };
}

export {
  createOfflineLocation,
  createOnlinePlatform,
  updateOfflineLocation,
  updateOnlinePlatform,
  getOfflineLocationById,
  getOnlinePlatformById,
  addSlotToOnlinePlatform,
  updateOnlineSlot,
  deleteOnlineSlot,
  upsertSchedulePageTitle,
};
