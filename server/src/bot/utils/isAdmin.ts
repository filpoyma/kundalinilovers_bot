import { telegramAdmins } from '../../config/env';

export function isAdmin(telegramId: number): boolean {
  return telegramAdmins.includes(telegramId);
}
