import type { Bot, Context } from 'grammy';
import { timezoneKeyboard } from '../keyboards/timezone.keyboard';
import {
  clearPendingMenuAction,
} from '../session/adminSession';
import { getTimezoneLabel, isValidTimezone } from '../../services/timezone.service';
import { findOrCreateUser, setUserTimezone } from '../../services/user.service';
import { executeSchedulePendingAction } from './schedule.actions';

async function completeTimezoneSelection(ctx: Context, timezone: string): Promise<void> {
  if (!ctx.from) return;

  await setUserTimezone(ctx.from.id, timezone);

  const openedSchedule = await executeSchedulePendingAction(ctx);
  if (openedSchedule) {
    await ctx.reply(`Часовой пояс сохранён: ${getTimezoneLabel(timezone)}`);
    return;
  }

  await ctx.reply(`Часовой пояс сохранён: ${getTimezoneLabel(timezone)}`);
}

export async function sendTimezonePrompt(ctx: Context, text?: string): Promise<void> {
  await ctx.reply(
    text ??
      'Выберите ваш часовой пояс. Время в расписании будет показано с учётом выбранной зоны.',
    { reply_markup: timezoneKeyboard() },
  );
}

export function registerTimezoneHandler(bot: Bot): void {
  bot.command('timezone', async ctx => {
    if (!ctx.from) return;

    const user = await findOrCreateUser(ctx);
    const current = user.timezone
      ? `Текущий часовой пояс: ${getTimezoneLabel(user.timezone)}\n\n`
      : 'Часовой пояс не задан.\n\n';

    await sendTimezonePrompt(ctx, `${current}Выберите часовой пояс:`);
  });

  bot.callbackQuery(/^tz:page:(\d+)$/, async ctx => {
    await ctx.answerCallbackQuery();
    const page = Number(ctx.match![1]);
    await ctx.editMessageReplyMarkup({ reply_markup: timezoneKeyboard(page) });
  });

  bot.callbackQuery(/^tz:set:(.+)$/, async ctx => {
    await ctx.answerCallbackQuery();
    if (!ctx.from) return;

    const timezone = ctx.match![1];
    if (!isValidTimezone(timezone)) {
      await ctx.reply('Некорректный часовой пояс. Попробуйте снова.');
      return;
    }

    await completeTimezoneSelection(ctx, timezone);

    try {
      await ctx.deleteMessage();
    } catch {
      // Message may already be deleted.
    }
  });

  bot.callbackQuery('tz:cancel', async ctx => {
    await ctx.answerCallbackQuery();
    if (ctx.from) {
      clearPendingMenuAction(ctx.from.id);
    }

    try {
      await ctx.deleteMessage();
    } catch {
      // Message may already be deleted.
    }

    await ctx.reply('Выбор часового пояса отменён.');
  });
}
