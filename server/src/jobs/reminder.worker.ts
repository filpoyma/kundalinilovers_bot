import type { Bot } from 'grammy';
import ClassReminderJob from '../models/class-reminder-job.model';
import logger from '../config/logger';
import { processDueReminders } from '../services/reminder.service';

const MAX_TIMEOUT_MS = 2_147_483_647;
const MIN_DELAY_MS = 1_000;

let bot: Bot | null = null;
let timeoutId: ReturnType<typeof setTimeout> | null = null;
let isProcessing = false;

async function getNextRemindAt(): Promise<Date | null> {
  const job = await ClassReminderJob.findOne({ sentAt: { $exists: false } })
    .sort({ remindAt: 1 })
    .select('remindAt')
    .lean();

  return job?.remindAt ?? null;
}

async function scheduleNextWake(): Promise<void> {
  if (!bot) return;

  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }

  const nextRemindAt = await getNextRemindAt();
  if (!nextRemindAt) return;

  const delay = Math.min(
    Math.max(nextRemindAt.getTime() - Date.now(), MIN_DELAY_MS),
    MAX_TIMEOUT_MS,
  );

  timeoutId = setTimeout(() => {
    void runDueReminders();
  }, delay);
}

async function runDueReminders(): Promise<void> {
  if (!bot || isProcessing) return;

  isProcessing = true;
  try {
    await processDueReminders(bot);
  } catch (error) {
    logger.error('Reminder scheduler failed', { error });
  } finally {
    isProcessing = false;
    await scheduleNextWake();
  }
}

export function startReminderWorker(botInstance: Bot): void {
  if (bot) return;

  bot = botInstance;
  void scheduleNextWake();
  logger.info('Reminder scheduler started');
}

export function stopReminderWorker(): void {
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }

  bot = null;
  logger.info('Reminder scheduler stopped');
}

export function wakeReminderScheduler(): void {
  void scheduleNextWake();
}
