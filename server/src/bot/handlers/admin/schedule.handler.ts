import type { Bot, Context } from 'grammy';
import { adminMenuKeyboard, adminScheduleKeyboard } from '../../keyboards/admin.keyboard';
import { timezoneKeyboard } from '../../keyboards/timezone.keyboard';
import {
  clearAdminSession,
  setAdminSession,
  type TAdminFlow,
} from '../../session/adminSession';
import { getSchedulePageTitle, upsertSchedulePageTitle } from '../../../services/schedule.service';
import { adminSetScheduleTimezone } from '../../../services/admin-schedule.service';
import { formatSchedule } from '../../utils/formatSchedule';
import { getScheduleTimezone, getTimezoneLabel, isValidTimezone } from '../../../services/timezone.service';
import { requireAdmin } from './requireAdmin';

export function registerAdminScheduleHandler(bot: Bot): void {
  bot.callbackQuery(/^admin:edit:(online|offline)$/, async ctx => {
    await ctx.answerCallbackQuery();
    if (!requireAdmin(ctx)) return;
    const type = ctx.match![1] as 'online' | 'offline';
    const { text } = await formatSchedule(type);
    await ctx.editMessageText(
      `Текущее ${type === 'offline' ? 'офлайн' : 'онлайн'}-расписание:\n\n${text}`,
      {
        reply_markup: adminScheduleKeyboard(type),
      },
    );
  });

  bot.callbackQuery(/^admin:(online|offline):page:title$/, async ctx => {
    await ctx.answerCallbackQuery();
    if (!requireAdmin(ctx)) return;
    const type = ctx.match![1] as 'online' | 'offline';
    const currentTitle = await getSchedulePageTitle(type);
    await setAdminSession(ctx.from!.id, { step: 'edit_page_title', scheduleType: type });
    await ctx.reply(
      `Текущий заголовок: ${currentTitle || '(не задан)'}\n\nВведите новый заголовок страницы (например: «Регулярные классы»):`,
    );
  });

  bot.callbackQuery('admin:timezone', async ctx => {
    await ctx.answerCallbackQuery();
    if (!requireAdmin(ctx)) return;

    const currentTimezone = await getScheduleTimezone();
    await ctx.reply(
      `Текущая таймзона для ввода времени в расписании: ${getTimezoneLabel(currentTimezone)}\n\nВыберите таймзону, в которой вы указываете время занятий:`,
      { reply_markup: timezoneKeyboard(0, 'admin') },
    );
  });

  bot.callbackQuery('admin:timezone:cancel', async ctx => {
    await ctx.answerCallbackQuery();
    if (!requireAdmin(ctx)) return;

    try {
      await ctx.deleteMessage();
    } catch {
      // Message may already be deleted.
    }

    await ctx.reply('Админ-панель', { reply_markup: adminMenuKeyboard() });
  });

  bot.callbackQuery(/^admin:tz:page:(\d+)$/, async ctx => {
    await ctx.answerCallbackQuery();
    if (!requireAdmin(ctx)) return;
    const page = Number(ctx.match![1]);
    await ctx.editMessageReplyMarkup({ reply_markup: timezoneKeyboard(page, 'admin') });
  });

  bot.callbackQuery(/^admin:tz:set:(.+)$/, async ctx => {
    await ctx.answerCallbackQuery();
    if (!requireAdmin(ctx)) return;

    const timezone = ctx.match![1];
    if (!isValidTimezone(timezone)) {
      await ctx.reply('Некорректный часовой пояс.');
      return;
    }

    const label = await adminSetScheduleTimezone(timezone);

    try {
      await ctx.deleteMessage();
    } catch {
      // Message may already be deleted.
    }

    await ctx.reply(`Таймзона для расписания обновлена: ${label}`, {
      reply_markup: adminMenuKeyboard(),
    });
  });
}

export async function handleScheduleTextMessage(
  ctx: Context,
  session: TAdminFlow,
  text: string,
): Promise<boolean> {
  if (session.step !== 'edit_page_title' || !ctx.from) {
    return false;
  }

  await upsertSchedulePageTitle(session.scheduleType, text);
  await clearAdminSession(ctx.from.id);
  await ctx.reply(`Заголовок страницы обновлён: «${text}»`, {
    reply_markup: adminScheduleKeyboard(session.scheduleType),
  });

  return true;
}
