import type { Bot } from 'grammy';
import { adminMenuKeyboard } from '../../keyboards/admin.keyboard';
import { clearAdminSession } from '../../session/adminSession';
import { requireAdmin } from './requireAdmin';

export function registerAdminPanelHandler(bot: Bot): void {
  bot.callbackQuery('admin:panel', async ctx => {
    await ctx.answerCallbackQuery();
    if (!requireAdmin(ctx)) return;
    clearAdminSession(ctx.from!.id);
    await ctx.editMessageText('Админ-панель', { reply_markup: adminMenuKeyboard() });
  });
}
