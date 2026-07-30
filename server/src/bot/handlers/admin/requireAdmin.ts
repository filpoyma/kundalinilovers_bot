import type { Context } from 'grammy';
import { isAdmin } from '../../utils/isAdmin';

export function requireAdmin(ctx: Context): boolean {
  if (!ctx.from || !isAdmin(ctx.from.id)) {
    void ctx.reply('У вас нет доступа.');
    return false;
  }
  return true;
}
