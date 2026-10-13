import { DateTime } from 'luxon';
import SchedulePage from '../models/schedule-page.model';
import { DEFAULT_SCHEDULE_TIMEZONE, TIMEZONE_OPTIONS } from '../constants/timezone.constants';
import { DAY_OF_WEEK_SHORT } from '../types/schedule.types';

export function isValidTimezone(timezone: string): boolean {
  if (!timezone) return false;

  const supported = Intl.supportedValuesOf('timeZone');
  if (!supported.includes(timezone)) return false;

  return DateTime.now().setZone(timezone).isValid;
}

export function dayOfWeekToLuxonWeekday(dayOfWeek: number): number {
  return dayOfWeek === 0 ? 7 : dayOfWeek;
}

export function luxonWeekdayToDayOfWeek(weekday: number): number {
  return weekday === 7 ? 0 : weekday;
}

export async function getScheduleTimezone(): Promise<string> {
  const offlinePage = await SchedulePage.findOne({ type: 'offline' });
  const offlineTimezone = offlinePage?.timezone;
  if (offlineTimezone && isValidTimezone(offlineTimezone)) {
    return offlineTimezone;
  }

  const onlinePage = await SchedulePage.findOne({ type: 'online' });
  const onlineTimezone = onlinePage?.timezone;
  if (onlineTimezone && isValidTimezone(onlineTimezone)) {
    return onlineTimezone;
  }

  return DEFAULT_SCHEDULE_TIMEZONE;
}

export function getTimezoneLabel(timezone: string): string {
  const option = TIMEZONE_OPTIONS.find(item => item.id === timezone);
  if (option) return option.label;

  const dt = DateTime.now().setZone(timezone);
  if (!dt.isValid) return timezone;

  return `${timezone} (${dt.toFormat('ZZ')})`;
}

export function getNextClassOccurrence(
  dayOfWeek: number,
  startTime: string,
  scheduleTimezone: string,
): DateTime {
  const [hour, minute] = startTime.split(':').map(Number);
  const targetWeekday = dayOfWeekToLuxonWeekday(dayOfWeek);
  const now = DateTime.now().setZone(scheduleTimezone);

  let candidate = now.set({
    weekday: targetWeekday as 1 | 2 | 3 | 4 | 5 | 6 | 7,
    hour,
    minute,
    second: 0,
    millisecond: 0,
  });

  if (candidate <= now) {
    candidate = candidate.plus({ weeks: 1 });
  }

  return candidate;
}

export function getReminderAt(classStart: DateTime): DateTime {
  return classStart.minus({ hours: 24 });
}

function getSlotEndOnOccurrence(
  occurrenceStart: DateTime,
  endTime: string,
  scheduleTimezone: string,
): DateTime {
  const [endHour, endMinute] = endTime.split(':').map(Number);
  let end = occurrenceStart.set({
    hour: endHour,
    minute: endMinute,
    second: 0,
    millisecond: 0,
  });

  if (end <= occurrenceStart) {
    end = end.plus({ days: 1 });
  }

  return end.setZone(scheduleTimezone);
}

export function formatSlotForUser(
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  title: string,
  scheduleTimezone: string,
  userTimezone?: string,
): string {
  const occurrence = getNextClassOccurrence(dayOfWeek, startTime, scheduleTimezone);
  const displayTz = userTimezone && isValidTimezone(userTimezone) ? userTimezone : scheduleTimezone;
  const local = occurrence.setZone(displayTz);
  const endOnOccurrence = getSlotEndOnOccurrence(occurrence, endTime, scheduleTimezone);
  const day = DAY_OF_WEEK_SHORT[luxonWeekdayToDayOfWeek(local.weekday)] ?? '?';
  const base = `${day} | ${local.toFormat('HH:mm')}-${endOnOccurrence.setZone(displayTz).toFormat('HH:mm')} ${title}`;

  if (!userTimezone || !isValidTimezone(userTimezone) || userTimezone === scheduleTimezone) {
    return base;
  }

  const scheduleDay =
    DAY_OF_WEEK_SHORT[luxonWeekdayToDayOfWeek(occurrence.weekday)] ?? '?';
  return `${base} (${scheduleDay} ${startTime}, ${getTimezoneLabel(scheduleTimezone)})`;
}

export function formatClassReminderTime(
  classStart: DateTime,
  scheduleTimezone: string,
  userTimezone?: string,
): string {
  const scheduleLocal = classStart.setZone(scheduleTimezone);
  const scheduleDay =
    DAY_OF_WEEK_SHORT[luxonWeekdayToDayOfWeek(scheduleLocal.weekday)] ?? '?';
  const scheduleTime = `${scheduleDay} ${scheduleLocal.toFormat('HH:mm')}`;

  if (!userTimezone || !isValidTimezone(userTimezone) || userTimezone === scheduleTimezone) {
    return scheduleTime;
  }

  const userLocal = classStart.setZone(userTimezone);
  const userDay = DAY_OF_WEEK_SHORT[luxonWeekdayToDayOfWeek(userLocal.weekday)] ?? '?';
  return `${scheduleTime} (ваше время: ${userDay} ${userLocal.toFormat('HH:mm')})`;
}
