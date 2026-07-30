import type { Bot, Context } from 'grammy';
import { adminScheduleKeyboard } from '../../keyboards/admin.keyboard';
import {
  clearAdminSession,
  setAdminSession,
  type TAdminFlow,
} from '../../session/adminSession';
import { getSchedulePageTitle, upsertSchedulePageTitle } from '../../../services/schedule.service';
import { formatSchedule } from '../../utils/formatSchedule';
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
    setAdminSession(ctx.from!.id, { step: 'edit_page_title', scheduleType: type });
    await ctx.reply(
      `Текущий заголовок: ${currentTitle || '(не задан)'}\n\nВведите новый заголовок страницы (например: «Регулярные классы»):`,
    );
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
  clearAdminSession(ctx.from.id);
  await ctx.reply(`Заголовок страницы обновлён: «${text}»`, {
    reply_markup: adminScheduleKeyboard(session.scheduleType),
  });

  return true;
}
