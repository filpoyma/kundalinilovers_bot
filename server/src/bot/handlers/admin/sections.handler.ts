import type { Bot, Context } from 'grammy';
import { Types } from 'mongoose';
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
import { buildSectionMenu } from './views/sectionMenu';
import { showSectionsList } from './views/sectionsList';

const SECTION_STEPS = new Set<TAdminFlow['step']>([
  'create_offline_section_country',
  'create_offline_section_city',
  'create_offline_section_address',
  'create_online_section_platform',
  'create_online_section_link',
  'edit_offline_section_country',
  'edit_offline_section_city',
  'edit_offline_section_address',
  'edit_online_section_platform',
  'edit_online_section_link',
]);

export function registerAdminSectionsHandler(bot: Bot): void {
  bot.callbackQuery(/^admin:(online|offline):section:create$/, async ctx => {
    await ctx.answerCallbackQuery();
    if (!requireAdmin(ctx)) return;
    const type = ctx.match![1] as TScheduleType;
    if (type === 'offline') {
      setAdminSession(ctx.from!.id, { step: 'create_offline_section_country' });
      await ctx.reply('Создание секции.\n\nВведите страну (например: Бали):');
    } else {
      setAdminSession(ctx.from!.id, { step: 'create_online_section_platform' });
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
    const { text, keyboard } = await buildSectionMenu(type, id);
    await ctx.editMessageText(text, { reply_markup: keyboard });
  });

  bot.callbackQuery(ADMIN_CB_PATTERNS.sectionDelete, async ctx => {
    await ctx.answerCallbackQuery();
    if (!requireAdmin(ctx)) return;

    const type = parseTypeCode(ctx.match![1]);
    const id = ctx.match![2];

    if (type === 'offline') {
      await deleteOfflineLocation(new Types.ObjectId(id));
    } else {
      await deleteOnlinePlatform(new Types.ObjectId(id));
    }

    await showSectionsList(ctx, type);
  });

  bot.callbackQuery(ADMIN_CB_PATTERNS.sectionEdit, async ctx => {
    await ctx.answerCallbackQuery();
    if (!requireAdmin(ctx)) return;

    const type = parseTypeCode(ctx.match![1]);
    const id = ctx.match![2];

    if (type === 'offline') {
      const location = await getOfflineLocationById(new Types.ObjectId(id));
      if (!location) {
        await ctx.reply('Секция не найдена.');
        return;
      }

      setAdminSession(ctx.from!.id, { step: 'edit_offline_section_country', locationId: id });
      await askPrefilledInput(ctx, 'Введите страну:', location.country);
      return;
    }

    const platform = await getOnlinePlatformById(new Types.ObjectId(id));
    if (!platform) {
      await ctx.reply('Секция не найдена.');
      return;
    }

    setAdminSession(ctx.from!.id, { step: 'edit_online_section_platform', platformId: id });
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
    case 'create_offline_section_country': {
      setAdminSession(ctx.from.id, {
        step: 'create_offline_section_city',
        country: text,
      });
      await ctx.reply('Введите город (например: Убуд):');
      break;
    }

    case 'create_offline_section_city': {
      setAdminSession(ctx.from.id, {
        step: 'create_offline_section_address',
        country: session.country,
        city: text,
      });
      await ctx.reply('Введите адрес (например: Arco Studio):');
      break;
    }

    case 'create_offline_section_address': {
      const location = await createOfflineLocation({
        country: session.country,
        city: session.city,
        address: text,
      });
      clearAdminSession(ctx.from.id);
      await ctx.reply(`Секция создана:\n${formatOfflineLocationHeader(location)}`, {
        reply_markup: adminScheduleKeyboard('offline'),
      });
      break;
    }

    case 'edit_offline_section_country': {
      const location = await getOfflineLocationById(new Types.ObjectId(session.locationId));
      setAdminSession(ctx.from.id, {
        step: 'edit_offline_section_city',
        locationId: session.locationId,
        country: text,
      });
      await askPrefilledInput(ctx, 'Введите город:', location?.city ?? text);
      break;
    }

    case 'edit_offline_section_city': {
      const location = await getOfflineLocationById(new Types.ObjectId(session.locationId));
      setAdminSession(ctx.from.id, {
        step: 'edit_offline_section_address',
        locationId: session.locationId,
        country: session.country,
        city: text,
      });
      await askPrefilledInput(ctx, 'Введите адрес:', location?.address ?? text);
      break;
    }

    case 'edit_offline_section_address': {
      const location = await updateOfflineLocation(new Types.ObjectId(session.locationId), {
        country: session.country,
        city: session.city,
        address: text,
      });
      clearAdminSession(ctx.from.id);
      await replyAndRemoveInputKeyboard(
        ctx,
        `Секция обновлена:\n${formatOfflineLocationHeader(location ?? { country: session.country, city: session.city, address: text })}`,
        { reply_markup: adminScheduleKeyboard('offline') },
      );
      break;
    }

    case 'create_online_section_platform': {
      setAdminSession(ctx.from.id, {
        step: 'create_online_section_link',
        platform: text,
      });
      await ctx.reply('Введите ссылку на трансляцию:');
      break;
    }

    case 'create_online_section_link': {
      const platform = await createOnlinePlatform({
        platform: session.platform,
        link: text,
      });
      clearAdminSession(ctx.from.id);
      await ctx.reply(`Секция создана:\n${formatOnlinePlatformHeader(platform)}`, {
        reply_markup: adminScheduleKeyboard('online'),
      });
      break;
    }

    case 'edit_online_section_platform': {
      const platform = await getOnlinePlatformById(new Types.ObjectId(session.platformId));
      setAdminSession(ctx.from.id, {
        step: 'edit_online_section_link',
        platformId: session.platformId,
        platform: text,
      });
      await askPrefilledInput(ctx, 'Введите ссылку на трансляцию:', platform?.link ?? text);
      break;
    }

    case 'edit_online_section_link': {
      const platform = await updateOnlinePlatform(new Types.ObjectId(session.platformId), {
        platform: session.platform,
        link: text,
      });
      clearAdminSession(ctx.from.id);
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
