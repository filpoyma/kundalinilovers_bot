import type { Bot } from 'grammy';
import { WELCOME_MESSAGE } from '../../constants/consent.constants';
import { findOrCreateUser, hasAcceptedConsent } from '../../services/user.service';
import { isAdmin } from '../utils/isAdmin';
import { mainMenuReplyKeyboard, removeReplyKeyboardMarkup } from '../keyboards/main.keyboard';
import { adminMenuKeyboard } from '../keyboards/admin.keyboard';
import { sendConsentPrompt } from '../middleware/requireConsent';

export function registerStartHandler(bot: Bot): void {
  bot.command('start', async (ctx) => {
    if (!ctx.from) return;

    const user = await findOrCreateUser(ctx);
    const admin = isAdmin(ctx.from.id);

    if (hasAcceptedConsent(user)) {
      await ctx.reply(WELCOME_MESSAGE, {
        reply_markup: mainMenuReplyKeyboard(admin),
      });
    } else {
      await ctx.reply(WELCOME_MESSAGE, {
        reply_markup: removeReplyKeyboardMarkup(),
      });
      await sendConsentPrompt(ctx);
    }
  });

  bot.command('admin', async (ctx) => {
    if (!ctx.from || !isAdmin(ctx.from.id)) {
      await ctx.reply('У вас нет доступа к админ-панели.');
      return;
    }

    await ctx.reply('Админ-панель', { reply_markup: adminMenuKeyboard() });
  });
}
