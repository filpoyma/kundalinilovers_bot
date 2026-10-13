const BACKOFF_MINUTES = [1, 5, 15, 60] as const;

export function getReminderBackoffMinutes(attempts: number): number {
  const index = Math.min(Math.max(attempts - 1, 0), BACKOFF_MINUTES.length - 1);
  return BACKOFF_MINUTES[index];
}
