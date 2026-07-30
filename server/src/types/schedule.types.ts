export type TScheduleType = 'online' | 'offline';

export type TContentPageKey = 'services' | 'private_session';

import type { Types } from 'mongoose';

export interface IScheduleSlot {
  _id?: Types.ObjectId;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  title: string;
  sortOrder: number;
}

export const DAY_OF_WEEK_SHORT: Record<number, string> = {
  0: 'вс',
  1: 'пн',
  2: 'вт',
  3: 'ср',
  4: 'чт',
  5: 'пт',
  6: 'сб',
};

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function compareSlotsByStartTime(a: IScheduleSlot, b: IScheduleSlot): number {
  const timeDiff = timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
  if (timeDiff !== 0) return timeDiff;
  return a.dayOfWeek - b.dayOfWeek;
}

const DAY_NAME_TO_VALUE: Record<string, number> = {
  пн: 1,
  вт: 2,
  ср: 3,
  чт: 4,
  пт: 5,
  сб: 6,
  вс: 0,
};

export const DAY_INPUT_HINT = 'пн, вт и тд. или 1–7';

export function parseDayOfWeek(input: string): number | null {
  const trimmed = input.trim().toLowerCase();
  if (trimmed in DAY_NAME_TO_VALUE) return DAY_NAME_TO_VALUE[trimmed];

  const num = Number(trimmed);
  if (num >= 1 && num <= 7) return num === 7 ? 0 : num;

  return null;
}

export function formatSlotLine(slot: IScheduleSlot): string {
  const day = DAY_OF_WEEK_SHORT[slot.dayOfWeek] ?? '?';
  return `${day} | ${slot.startTime}-${slot.endTime} ${slot.title}`;
}

export function dayOfWeekToInputValue(dayOfWeek: number): string {
  return DAY_OF_WEEK_SHORT[dayOfWeek] ?? String(dayOfWeek);
}
