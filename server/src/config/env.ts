import dotenv from 'dotenv';

dotenv.config();

export const telegramAdmins = (process.env.TELEGRAM_ADMINS ?? '')
  .split(',')
  .map((id) => Number(id.trim()))
  .filter(Boolean);
