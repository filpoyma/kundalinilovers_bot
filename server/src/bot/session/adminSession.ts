import type { TContentPageKey, TScheduleType } from '../../types/schedule.types';

export type TAdminFlow =
  | { step: 'idle' }
  | { step: 'edit_page_title'; scheduleType: TScheduleType }
  | { step: 'create_offline_section_country' }
  | { step: 'create_offline_section_city'; country: string }
  | { step: 'create_offline_section_address'; country: string; city: string }
  | { step: 'create_online_section_platform' }
  | { step: 'create_online_section_link'; platform: string }
  | { step: 'edit_offline_section_country'; locationId: string }
  | { step: 'edit_offline_section_city'; locationId: string; country: string }
  | {
      step: 'edit_offline_section_address';
      locationId: string;
      country: string;
      city: string;
    }
  | { step: 'edit_online_section_platform'; platformId: string }
  | { step: 'edit_online_section_link'; platformId: string; platform: string }
  | { step: 'add_offline_slot' }
  | { step: 'add_offline_slot_day'; locationId: string }
  | { step: 'add_offline_slot_start'; locationId: string; dayOfWeek: number }
  | { step: 'add_offline_slot_end'; locationId: string; dayOfWeek: number; startTime: string }
  | {
      step: 'add_offline_slot_title';
      locationId: string;
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }
  | { step: 'add_online_slot' }
  | { step: 'add_online_slot_day'; platformId: string }
  | { step: 'add_online_slot_start'; platformId: string; dayOfWeek: number }
  | { step: 'add_online_slot_end'; platformId: string; dayOfWeek: number; startTime: string }
  | {
      step: 'add_online_slot_title';
      platformId: string;
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }
  | { step: 'edit_offline_slot_day'; locationId: string; slotId: string }
  | { step: 'edit_offline_slot_start'; locationId: string; slotId: string; dayOfWeek: number }
  | {
      step: 'edit_offline_slot_end';
      locationId: string;
      slotId: string;
      dayOfWeek: number;
      startTime: string;
    }
  | {
      step: 'edit_offline_slot_title';
      locationId: string;
      slotId: string;
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }
  | { step: 'edit_online_slot_day'; platformId: string; slotId: string }
  | { step: 'edit_online_slot_start'; platformId: string; slotId: string; dayOfWeek: number }
  | {
      step: 'edit_online_slot_end';
      platformId: string;
      slotId: string;
      dayOfWeek: number;
      startTime: string;
    }
  | {
      step: 'edit_online_slot_title';
      platformId: string;
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

const adminSessions = new Map<number, TAdminFlow>();
const pendingMenuActions = new Map<number, TPendingMenuAction>();

export function getAdminSession(userId: number): TAdminFlow {
  return adminSessions.get(userId) ?? { step: 'idle' };
}

export function setAdminSession(userId: number, flow: TAdminFlow): void {
  adminSessions.set(userId, flow);
}

export function clearAdminSession(userId: number): void {
  adminSessions.delete(userId);
}

export function setPendingMenuAction(userId: number, action: TPendingMenuAction): void {
  pendingMenuActions.set(userId, action);
}

export function getPendingMenuAction(userId: number): TPendingMenuAction | undefined {
  return pendingMenuActions.get(userId);
}

export function clearPendingMenuAction(userId: number): void {
  pendingMenuActions.delete(userId);
}
