export function isAdmin(telegramId: number): boolean {
  const admins = (process.env.TELEGRAM_ADMINS ?? '')
    .split(',')
    .map(id => Number(id.trim()))
    .filter(Boolean);

  return admins.includes(telegramId);
}
