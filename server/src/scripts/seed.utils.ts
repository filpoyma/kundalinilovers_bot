import type { TSeedScheduleSlot } from './seed.types';

export function stripSlot(slot: Record<string, unknown>): TSeedScheduleSlot {
  return {
    dayOfWeek: slot.dayOfWeek as number,
    startTime: String(slot.startTime),
    endTime: String(slot.endTime),
    title: String(slot.title),
    sortOrder: Number(slot.sortOrder ?? 0),
  };
}

export function stripSlots(slots: unknown): TSeedScheduleSlot[] {
  if (!Array.isArray(slots)) return [];

  return slots.map((slot) => stripSlot(slot as Record<string, unknown>));
}
