import type { Bot, Context } from 'grammy';
import { adminScheduleKeyboard } from '../../keyboards/admin.keyboard';
import {
  clearAdminSession,
  setAdminSession,
  type TAdminFlow,
} from '../../session/adminSession';
import {
  createOfflineLocation,
  createOnlinePlatform,
  deleteOfflineLocation,
  deleteOnlinePlatform,
  getOfflineLocationById,
  getOnlinePlatformById,
  updateOfflineLocation,
  updateOnlinePlatform,
  formatOfflineLocationHeader,
  formatOnlinePlatformHeader,
} from '../../../services/schedule.service';
import { ADMIN_CB_PATTERNS, parseTypeCode } from '../../utils/adminCallbacks';
import type { TScheduleType } from '../../../types/schedule.types';
import { askPrefilledInput, replyAndRemoveInputKeyboard } from '../../utils/prefilledInput';
import { requireAdmin } from './requireAdmin';
import { deactivateSubscriptionsForLocation } from '../../../services/reminder.service';
import { buildSectionMenu } from './views/sectionMenu';
import { showSectionsList } from './views/sectionsList';
import { parseObjectId } from '../../../utils/parseObjectId';
import { replyInvalidAdminLink } from '../../utils/invalidAdminLink';

const SECTION_STEPS = new Set<TAdminFlow['step']>([
  'create_section_country',
  'create_section_city',
  'create_section_address',
  'create_section_platform',
  'create_section_link',
  'edit_section_country',
  'edit_section_city',
  'edit_section_address',
  'edit_section_platform',
  'edit_section_link',
]);

export function registerAdminSectionsHandler(bot: Bot): void {
  bot.callbackQuery(/^admin:(online|offline):section:create$/, async ctx => {
    await ctx.answerCallbackQuery();
    if (!requireAdmin(ctx)) return;
    const type = ctx.match![1] as TScheduleType;
    if (type === 'offline') {
      await setAdminSession(ctx.from!.id, { step: 'create_section_country', scheduleType: 'offline' });
      await ctx.reply('Создание секции.\n\nВведите страну (например: Бали):');
    } else {
      await setAdminSession(ctx.from!.id, { step: 'create_section_platform', scheduleType: 'online' });
      await ctx.reply('Создание секции.\n\nВведите название платформы (например: Zoom):');
    }
  });

  const showSectionsListHandler = async (ctx: Context, type: TScheduleType) => {
    await ctx.answerCallbackQuery();
    if (!requireAdmin(ctx)) return;
    await showSectionsList(ctx, type);
  };

  bot.callbackQuery(ADMIN_CB_PATTERNS.sectionsList, async ctx => {
    const type = parseTypeCode(ctx.match![1]);
    await showSectionsListHandler(ctx, type);
  });

  bot.callbackQuery(/^admin:(online|offline):sections:list$/, async ctx => {
    const type = ctx.match![1] as TScheduleType;
    await showSectionsListHandler(ctx, type);
  });

  bot.callbackQuery(ADMIN_CB_PATTERNS.sectionMenu, async ctx => {
    await ctx.answerCallbackQuery();
    if (!requireAdmin(ctx)) return;

    const type = parseTypeCode(ctx.match![1]);
    const id = ctx.match![2];
    if (!parseObjectId(id)) {
      await replyInvalidAdminLink(ctx);
      return;
    }

    const { text, keyboard } = await buildSectionMenu(type, id);
    await ctx.editMessageText(text, { reply_markup: keyboard });
  });

  bot.callbackQuery(ADMIN_CB_PATTERNS.sectionDelete, async ctx => {
    await ctx.answerCallbackQuery();
    if (!requireAdmin(ctx)) return;

    const type = parseTypeCode(ctx.match![1]);
    const id = ctx.match![2];
    const objectId = parseObjectId(id);
    if (!objectId) {
      await replyInvalidAdminLink(ctx);
      return;
    }

    if (type === 'offline') {
      await deactivateSubscriptionsForLocation(objectId);
      await deleteOfflineLocation(objectId);
    } else {
      await deleteOnlinePlatform(objectId);
    }

    await showSectionsList(ctx, type);
  });

  bot.callbackQuery(ADMIN_CB_PATTERNS.sectionEdit, async ctx => {
    await ctx.answerCallbackQuery();
    if (!requireAdmin(ctx)) return;

    const type = parseTypeCode(ctx.match![1]);
    const id = ctx.match![2];
    const objectId = parseObjectId(id);
    if (!objectId) {
      await replyInvalidAdminLink(ctx);
      return;
    }

    if (type === 'offline') {
      const location = await getOfflineLocationById(objectId);
      if (!location) {
        await ctx.reply('Секция не найдена.');
        return;
      }

      await setAdminSession(ctx.from!.id, {
        step: 'edit_section_country',
        scheduleType: 'offline',
        parentId: id,
      });
      await askPrefilledInput(ctx, 'Введите страну:', location.country);
      return;
    }

    const platform = await getOnlinePlatformById(objectId);
    if (!platform) {
      await ctx.reply('Секция не найдена.');
      return;
    }

    await setAdminSession(ctx.from!.id, {
      step: 'edit_section_platform',
      scheduleType: 'online',
      parentId: id,
    });
    await askPrefilledInput(ctx, 'Введите название платформы:', platform.platform);
  });
}

export async function handleSectionTextMessage(
  ctx: Context,
  session: TAdminFlow,
  text: string,
): Promise<boolean> {
  if (!SECTION_STEPS.has(session.step) || !ctx.from) {
    return false;
  }

  switch (session.step) {
    case 'create_section_country': {
      await setAdminSession(ctx.from.id, {
        step: 'create_section_city',
        scheduleType: 'offline',
        country: text,
      });
      await ctx.reply('Введите город (например: Убуд):');
      break;
    }

    case 'create_section_city': {
      await setAdminSession(ctx.from.id, {
        step: 'create_section_address',
        scheduleType: 'offline',
        country: session.country,
        city: text,
      });
      await ctx.reply('Введите адрес (например: Arco Studio):');
      break;
    }

    case 'create_section_address': {
      const location = await createOfflineLocation({
        country: session.country,
        city: session.city,
        address: text,
      });
      await clearAdminSession(ctx.from.id);
      await ctx.reply(`Секция создана:\n${formatOfflineLocationHeader(location)}`, {
        reply_markup: adminScheduleKeyboard('offline'),
      });
      break;
    }

    case 'edit_section_country': {
      const parentId = parseObjectId(session.parentId);
      if (!parentId) {
        await replyInvalidAdminLink(ctx);
        return true;
      }
      const location = await getOfflineLocationById(parentId);
      await setAdminSession(ctx.from.id, {
        step: 'edit_section_city',
        scheduleType: 'offline',
        parentId: session.parentId,
        country: text,
      });
      await askPrefilledInput(ctx, 'Введите город:', location?.city ?? text);
      break;
    }

    case 'edit_section_city': {
      const parentId = parseObjectId(session.parentId);
      if (!parentId) {
        await replyInvalidAdminLink(ctx);
        return true;
      }
      const location = await getOfflineLocationById(parentId);
      await setAdminSession(ctx.from.id, {
        step: 'edit_section_address',
        scheduleType: 'offline',
        parentId: session.parentId,
        country: session.country,
        city: text,
      });
      await askPrefilledInput(ctx, 'Введите адрес:', location?.address ?? text);
      break;
    }

    case 'edit_section_address': {
      const parentId = parseObjectId(session.parentId);
      if (!parentId) {
        await replyInvalidAdminLink(ctx);
        return true;
      }
      const location = await updateOfflineLocation(parentId, {
        country: session.country,
        city: session.city,
        address: text,
      });
      await clearAdminSession(ctx.from.id);
      await replyAndRemoveInputKeyboard(
        ctx,
        `Секция обновлена:\n${formatOfflineLocationHeader(location ?? { country: session.country, city: session.city, address: text })}`,
        { reply_markup: adminScheduleKeyboard('offline') },
      );
      break;
    }

    case 'create_section_platform': {
      await setAdminSession(ctx.from.id, {
        step: 'create_section_link',
        scheduleType: 'online',
        platform: text,
      });
      await ctx.reply('Введите ссылку на трансляцию:');
      break;
    }

    case 'create_section_link': {
      const platform = await createOnlinePlatform({
        platform: session.platform,
        link: text,
      });
      await clearAdminSession(ctx.from.id);
      await ctx.reply(`Секция создана:\n${formatOnlinePlatformHeader(platform)}`, {
        reply_markup: adminScheduleKeyboard('online'),
      });
      break;
    }

    case 'edit_section_platform': {
      const parentId = parseObjectId(session.parentId);
      if (!parentId) {
        await replyInvalidAdminLink(ctx);
        return true;
      }
      const platform = await getOnlinePlatformById(parentId);
      await setAdminSession(ctx.from.id, {
        step: 'edit_section_link',
        scheduleType: 'online',
        parentId: session.parentId,
        platform: text,
      });
      await askPrefilledInput(ctx, 'Введите ссылку на трансляцию:', platform?.link ?? text);
      break;
    }

    case 'edit_section_link': {
      const parentId = parseObjectId(session.parentId);
      if (!parentId) {
        await replyInvalidAdminLink(ctx);
        return true;
      }
      const platform = await updateOnlinePlatform(parentId, {
        platform: session.platform,
        link: text,
      });
      await clearAdminSession(ctx.from.id);
      await replyAndRemoveInputKeyboard(
        ctx,
        `Секция обновлена:\n${formatOnlinePlatformHeader(platform ?? { platform: session.platform, link: text })}`,
        { reply_markup: adminScheduleKeyboard('online') },
      );
      break;
    }
  }

  return true;
}
