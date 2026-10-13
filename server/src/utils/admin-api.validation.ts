import { isBotContentMessageWithinLimit } from '../constants/telegram.constants';
import type { TContentPageKey, TScheduleType } from '../types/schedule.types';
import { isValidTimeHHmm } from './timeFormat';

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

export type TParseContentBodyResult =
  | { ok: true; content: string; contactLink?: string }
  | { ok: false; reason: 'invalid' | 'too_long' };

export function parseContentBody(
  key: TContentPageKey,
  body: unknown,
): TParseContentBodyResult {
  if (!body || typeof body !== 'object') {
    return { ok: false, reason: 'invalid' };
  }
  const data = body as Record<string, unknown>;
  const content = requireNonEmptyString(data.content, Number.MAX_SAFE_INTEGER);
  if (!content) {
    return { ok: false, reason: 'invalid' };
  }

  let contactLink: string | undefined;
  const linkRaw = data.contactLink;
  if (linkRaw !== undefined && linkRaw !== null && linkRaw !== '') {
    const parsedLink = requireNonEmptyString(linkRaw, MAX_SHORT);
    if (!parsedLink) {
      return { ok: false, reason: 'invalid' };
    }
    contactLink = parsedLink;
  }

  if (!isBotContentMessageWithinLimit(key, content, contactLink)) {
    return { ok: false, reason: 'too_long' };
  }

  return contactLink ? { ok: true, content, contactLink } : { ok: true, content };
}
