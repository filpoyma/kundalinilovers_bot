import { DateTime } from 'luxon';

/** Returns "Сегодня ", "Завтра ", or "" for the reminder opening line. */
export function formatReminderLeadPhrase(classStart: DateTime, scheduleTimezone: string): string {
  const now = DateTime.now().setZone(scheduleTimezone);
  const classLocal = classStart.setZone(scheduleTimezone);
  const diffDays = Math.round(
    classLocal.startOf('day').diff(now.startOf('day'), 'days').days,
  );

  if (diffDays === 0) {
    return 'Сегодня ';
  }

  if (diffDays === 1) {
    return 'Завтра ';
  }

  return '';
}
