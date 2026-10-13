import type { TContentPageKey, TScheduleType } from '../types/schedule.types';
import { isValidTimeHHmm } from './timeFormat';

const MAX_TEXT = 8000;
const MAX_SHORT = 500;

export function parseScheduleType(value: string): TScheduleType | null {
  if (value === 'online' || value === 'offline') {
    return value;
  }
  return null;
}

export function parseContentKey(value: string): TContentPageKey | null {
  if (value === 'services' || value === 'private_session') {
    return value;
  }
  return null;
}

export function requireNonEmptyString(value: unknown, max = MAX_SHORT): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) return null;
  return trimmed;
}

export function parseSlotBody(body: unknown): {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  title: string;
} | null {
  if (!body || typeof body !== 'object') return null;
  const data = body as Record<string, unknown>;
  const dayOfWeek = data.dayOfWeek;
  const startTime = requireNonEmptyString(data.startTime, 8);
  const endTime = requireNonEmptyString(data.endTime, 8);
  const title = requireNonEmptyString(data.title, MAX_SHORT);

  if (typeof dayOfWeek !== 'number' || dayOfWeek < 0 || dayOfWeek > 6) return null;
  if (!startTime || !endTime || !title) return null;
  if (!isValidTimeHHmm(startTime) || !isValidTimeHHmm(endTime)) return null;

  return { dayOfWeek, startTime, endTime, title };
}

export function parseContentBody(body: unknown): { content: string; contactLink?: string } | null {
  if (!body || typeof body !== 'object') return null;
  const data = body as Record<string, unknown>;
  const content = requireNonEmptyString(data.content, MAX_TEXT);
  if (!content) return null;

  const linkRaw = data.contactLink;
  if (linkRaw === undefined || linkRaw === null || linkRaw === '') {
    return { content };
  }

  const contactLink = requireNonEmptyString(linkRaw, MAX_SHORT);
  if (!contactLink) return null;
  return { content, contactLink };
}
