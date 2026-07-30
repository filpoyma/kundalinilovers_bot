import dotenv from 'dotenv';

dotenv.config();

export const telegramAdmins = (process.env.TELEGRAM_ADMINS ?? '')
  .split(',')
  .map((id) => Number(id.trim()))
  .filter(Boolean);

export const telegramWebhookUrl = process.env.TELEGRAM_WEBHOOK_URL?.trim() ?? '';
export const telegramWebhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim() || undefined;
export const isWebhookMode = Boolean(telegramWebhookUrl);
