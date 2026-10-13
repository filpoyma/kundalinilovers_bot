import type { TContentPageKey, TScheduleType } from '../../types/schedule.types';
import BotDialogState from '../../models/bot-dialog-state.model';

export type TAdminFlow =
  | { step: 'idle' }
  | { step: 'edit_page_title'; scheduleType: TScheduleType }
  | { step: 'create_section_country'; scheduleType: 'offline' }
  | { step: 'create_section_city'; scheduleType: 'offline'; country: string }
  | { step: 'create_section_address'; scheduleType: 'offline'; country: string; city: string }
  | { step: 'create_section_platform'; scheduleType: 'online' }
  | { step: 'create_section_link'; scheduleType: 'online'; platform: string }
  | { step: 'edit_section_country'; scheduleType: 'offline'; parentId: string }
  | { step: 'edit_section_city'; scheduleType: 'offline'; parentId: string; country: string }
  | {
      step: 'edit_section_address';
      scheduleType: 'offline';
      parentId: string;
      country: string;
      city: string;
    }
  | { step: 'edit_section_platform'; scheduleType: 'online'; parentId: string }
  | { step: 'edit_section_link'; scheduleType: 'online'; parentId: string; platform: string }
  | { step: 'add_slot_pick'; scheduleType: TScheduleType }
  | { step: 'add_slot_day'; scheduleType: TScheduleType; parentId: string }
  | { step: 'add_slot_start'; scheduleType: TScheduleType; parentId: string; dayOfWeek: number }
  | {
      step: 'add_slot_end';
      scheduleType: TScheduleType;
      parentId: string;
      dayOfWeek: number;
      startTime: string;
    }
  | {
      step: 'add_slot_title';
      scheduleType: TScheduleType;
      parentId: string;
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }
  | { step: 'edit_slot_day'; scheduleType: TScheduleType; parentId: string; slotId: string }
  | {
      step: 'edit_slot_start';
      scheduleType: TScheduleType;
      parentId: string;
      slotId: string;
      dayOfWeek: number;
    }
  | {
      step: 'edit_slot_end';
      scheduleType: TScheduleType;
      parentId: string;
      slotId: string;
      dayOfWeek: number;
      startTime: string;
    }
  | {
      step: 'edit_slot_title';
      scheduleType: TScheduleType;
      parentId: string;
      slotId: string;
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }
  | { step: 'edit_content'; contentKey: TContentPageKey }
  | { step: 'edit_content_link'; contentKey: 'private_session'; content: string };

export type TPendingMenuAction =
  | 'menu:services'
  | 'menu:private_session'
  | 'menu:online_schedule'
  | 'menu:offline_schedule';

export async function getAdminSession(userId: number): Promise<TAdminFlow> {
  const doc = await BotDialogState.findOne({ telegramId: userId }).lean();
  return (doc?.adminFlow as TAdminFlow | undefined) ?? { step: 'idle' };
}

export async function setAdminSession(userId: number, flow: TAdminFlow): Promise<void> {
  await BotDialogState.findOneAndUpdate(
    { telegramId: userId },
    { $set: { adminFlow: flow } },
    { upsert: true, new: true },
  );
}

export async function clearAdminSession(userId: number): Promise<void> {
  await BotDialogState.findOneAndUpdate(
    { telegramId: userId },
    { $set: { adminFlow: { step: 'idle' } } },
    { upsert: true },
  );
}

export async function setPendingMenuAction(
  userId: number,
  action: TPendingMenuAction,
): Promise<void> {
  await BotDialogState.findOneAndUpdate(
    { telegramId: userId },
    { $set: { pendingMenuAction: action } },
    { upsert: true, new: true },
  );
}

export async function getPendingMenuAction(
  userId: number,
): Promise<TPendingMenuAction | undefined> {
  const doc = await BotDialogState.findOne({ telegramId: userId }).lean();
  return doc?.pendingMenuAction as TPendingMenuAction | undefined;
}

export async function clearPendingMenuAction(userId: number): Promise<void> {
  await BotDialogState.updateOne(
    { telegramId: userId },
    { $unset: { pendingMenuAction: '' } },
  );
}

export async function pushConsentMessage(
  userId: number,
  chatId: number,
  messageId: number,
): Promise<void> {
  await BotDialogState.findOneAndUpdate(
    { telegramId: userId },
    { $push: { consentMessages: { chatId, messageId } } },
    { upsert: true },
  );
}

export async function getConsentMessages(
  userId: number,
): Promise<Array<{ chatId: number; messageId: number }>> {
  const doc = await BotDialogState.findOne({ telegramId: userId }).lean();
  return doc?.consentMessages ?? [];
}

export async function clearConsentMessages(userId: number): Promise<void> {
  await BotDialogState.updateOne({ telegramId: userId }, { $set: { consentMessages: [] } });
}
