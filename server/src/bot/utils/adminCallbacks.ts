import type { TScheduleType } from '../../types/schedule.types';

const TYPE_CODE: Record<TScheduleType, string> = {
  offline: 'o',
  online: 'n',
};

export function parseTypeCode(code: string): TScheduleType {
  return code === 'o' ? 'offline' : 'online';
}

function typeCode(type: TScheduleType): string {
  return TYPE_CODE[type];
}

/** Короткие callback_data (лимит Telegram — 64 байта) */
export const AdminCb = {
  sectionsList: (type: TScheduleType) => `a:${typeCode(type)}:slst`,
  sectionMenu: (type: TScheduleType, id: string) => `a:${typeCode(type)}:sm:${id}`,
  slotsList: (type: TScheduleType, id: string) => `a:${typeCode(type)}:sll:${id}`,
  sectionEdit: (type: TScheduleType, id: string) => `a:${typeCode(type)}:sce:${id}`,
  sectionDelete: (type: TScheduleType, id: string) => `a:${typeCode(type)}:scd:${id}`,
  slotDelete: (type: TScheduleType, slotId: string) => `a:${typeCode(type)}:sd:${slotId}`,
  slotEdit: (type: TScheduleType, slotId: string) => `a:${typeCode(type)}:se:${slotId}`,
};

export const ADMIN_CB_PATTERNS = {
  sectionsList: /^a:(o|n):slst$/,
  sectionMenu: /^a:(o|n):sm:([a-f0-9]{24})$/,
  slotsList: /^a:(o|n):sll:([a-f0-9]{24})$/,
  sectionEdit: /^a:(o|n):sce:([a-f0-9]{24})$/,
  sectionDelete: /^a:(o|n):scd:([a-f0-9]{24})$/,
  slotDelete: /^a:(o|n):sd:([a-f0-9]{24})$/,
  slotEdit: /^a:(o|n):se:([a-f0-9]{24})$/,
};
