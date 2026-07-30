import type { Bot } from 'grammy';
import { WELCOME_MESSAGE } from '../../constants/consent.constants';
import { findOrCreateUser } from '../../services/user.service';
import { isAdmin } from '../utils/isAdmin';
import { mainMenuKeyboard } from '../keyboards/main.keyboard';
import { adminMenuKeyboard } from '../keyboards/admin.keyboard';

export function registerStartHandler(bot: Bot): void {
  bot.command('start', async (ctx) => {
    if (ctx.from) {
      await findOrCreateUser(ctx);
    }

    const admin = ctx.from ? isAdmin(ctx.from.id) : false;

    await ctx.reply(WELCOME_MESSAGE, {
      reply_markup: mainMenuKeyboard(admin),
    });
  });

  bot.command('admin', async (ctx) => {
    if (!ctx.from || !isAdmin(ctx.from.id)) {
      await ctx.reply('У вас нет доступа к админ-панели.');
      return;
    }

    await ctx.reply('Админ-панель', { reply_markup: adminMenuKeyboard() });
  });
}
