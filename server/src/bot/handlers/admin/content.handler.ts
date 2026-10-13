import type { Bot, Context } from 'grammy';
import { adminContentKeyboard } from '../../keyboards/admin.keyboard';
import {
  clearAdminSession,
  setAdminSession,
  type TAdminFlow,
} from '../../session/adminSession';
import { getContentPage, upsertContentPage } from '../../../services/content.service';
import type { TContentPageKey } from '../../../types/schedule.types';
import { requireAdmin } from './requireAdmin';

export function registerAdminContentHandler(bot: Bot): void {
  bot.callbackQuery('admin:edit:services', async ctx => {
    await ctx.answerCallbackQuery();
    if (!requireAdmin(ctx)) return;
    const page = await getContentPage('services');
    await ctx.editMessageText(
      `Редактирование «Обо мне»\n\nТекущий текст:\n${page?.content || '(пусто)'}`,
      { reply_markup: adminContentKeyboard('services') },
    );
  });

  bot.callbackQuery('admin:edit:private_session', async ctx => {
    await ctx.answerCallbackQuery();
    if (!requireAdmin(ctx)) return;
    const page = await getContentPage('private_session');
    await ctx.editMessageText(
      `Редактирование «Личная сессия»\n\nТекущий текст:\n${page?.content || '(пусто)'}\n\nСсылка: ${page?.contactLink || '(нет)'}`,
      { reply_markup: adminContentKeyboard('private_session') },
    );
  });

  bot.callbackQuery(/^admin:content:(services|private_session):edit$/, async ctx => {
    await ctx.answerCallbackQuery();
    if (!requireAdmin(ctx)) return;
    const key = ctx.match![1] as TContentPageKey;
    await setAdminSession(ctx.from!.id, { step: 'edit_content', contentKey: key });
    await ctx.reply('Введите новый текст:');
  });
}

export async function handleContentTextMessage(
  ctx: Context,
  session: TAdminFlow,
  text: string,
): Promise<boolean> {
  if (session.step !== 'edit_content' && session.step !== 'edit_content_link') {
    return false;
  }

  if (!ctx.from) return true;

  switch (session.step) {
    case 'edit_content': {
      if (session.contentKey === 'private_session') {
        await setAdminSession(ctx.from.id, {
          step: 'edit_content_link',
          contentKey: 'private_session',
          content: text,
        });
        await ctx.reply('Введите ссылку для записи (или «-» чтобы пропустить):');
      } else {
        await upsertContentPage(session.contentKey, {
          content: text,
          updatedByTelegramId: ctx.from.id,
        });
        await clearAdminSession(ctx.from.id);
        await ctx.reply('Текст «Обо мне» обновлён.', {
          reply_markup: adminContentKeyboard('services'),
        });
      }
      break;
    }

    case 'edit_content_link': {
      const contactLink = text === '-' ? undefined : text;
      await upsertContentPage('private_session', {
        content: session.content,
        contactLink,
        updatedByTelegramId: ctx.from.id,
      });
      await clearAdminSession(ctx.from.id);
      await ctx.reply('«Личная сессия» обновлена.', {
        reply_markup: adminContentKeyboard('private_session'),
      });
      break;
    }
  }

  return true;
}
