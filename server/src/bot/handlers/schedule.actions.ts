import type { Context } from 'grammy';
import { formatSchedule } from '../utils/formatSchedule';
import { sendOfflineSchedule } from '../utils/sendOfflineSchedule';
import { MENU_CALLBACKS } from '../keyboards/main.keyboard';
import {
  clearPendingMenuAction,
  getPendingMenuAction,
  type TPendingMenuAction,
} from '../session/adminSession';

export async function showOnlineSchedule(ctx: Context): Promise<void> {
  const { text } = await formatSchedule('online');
  await ctx.reply(text);
}

export async function showOfflineSchedule(ctx: Context): Promise<void> {
  await sendOfflineSchedule(ctx);
}

const SCHEDULE_ACTIONS: TPendingMenuAction[] = [
  MENU_CALLBACKS.ONLINE_SCHEDULE,
  MENU_CALLBACKS.OFFLINE_SCHEDULE,
];

export function isScheduleMenuAction(action: TPendingMenuAction): boolean {
  return SCHEDULE_ACTIONS.includes(action);
}

export async function executeSchedulePendingAction(ctx: Context): Promise<boolean> {
  const from = ctx.from;
  if (!from) return false;

  const pending = await getPendingMenuAction(from.id);
  if (!pending || !isScheduleMenuAction(pending)) return false;

  await clearPendingMenuAction(from.id);

  if (pending === MENU_CALLBACKS.ONLINE_SCHEDULE) {
    await showOnlineSchedule(ctx);
    return true;
  }

  await showOfflineSchedule(ctx);
  return true;
}
