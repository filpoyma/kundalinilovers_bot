import type { Bot, Context } from 'grammy';
import { Types } from 'mongoose';
import { adminScheduleKeyboard } from '../../keyboards/admin.keyboard';
import {
  clearAdminSession,
  setAdminSession,
  type TAdminFlow,
} from '../../session/adminSession';
import {
  getAllOfflineLocations,
  getAllOnlinePlatforms,
  addSlotToOfflineLocation,
  addSlotToOnlinePlatform,
  findOfflineLocationBySlotId,
  findOnlinePlatformBySlotId,
  getOfflineLocationById,
  getOnlinePlatformById,
  deleteOfflineSlot,
  deleteOnlineSlot,
  updateOfflineSlot,
  updateOnlineSlot,
  formatOfflineLocationHeader,
  formatSlotLine,
  findSlotById,
} from '../../../services/schedule.service';
import { ADMIN_CB_PATTERNS, parseTypeCode } from '../../utils/adminCallbacks';
import type { TScheduleType } from '../../../types/schedule.types';
import { DAY_INPUT_HINT, parseDayOfWeek, dayOfWeekToInputValue } from '../../../types/schedule.types';
import { askPrefilledInput, replyAndRemoveInputKeyboard } from '../../utils/prefilledInput';
import { requireAdmin } from './requireAdmin';
import { buildSlotsList } from './views/slotsList';

const SLOT_STEPS = new Set<TAdminFlow['step']>([
  'add_offline_slot',
  'add_offline_slot_day',
  'add_offline_slot_start',
  'add_offline_slot_end',
  'add_offline_slot_title',
  'add_online_slot',
  'add_online_slot_day',
  'add_online_slot_start',
  'add_online_slot_end',
  'add_online_slot_title',
  'edit_offline_slot_day',
  'edit_offline_slot_start',
  'edit_offline_slot_end',
  'edit_offline_slot_title',
  'edit_online_slot_day',
  'edit_online_slot_start',
  'edit_online_slot_end',
  'edit_online_slot_title',
]);

export function registerAdminSlotsHandler(bot: Bot): void {
  bot.callbackQuery(/^admin:(online|offline):slot:create$/, async ctx => {
    await ctx.answerCallbackQuery();
    if (!requireAdmin(ctx)) return;
    const type = ctx.match![1] as TScheduleType;

    if (type === 'offline') {
      const locations = await getAllOfflineLocations();
      if (locations.length === 0) {
        await ctx.reply('Сначала создайте секцию.');
        return;
      }
      const list = locations
        .map((loc, i) => `${i + 1}. ${formatOfflineLocationHeader(loc)}`)
        .join('\n');
      setAdminSession(ctx.from!.id, { step: 'add_offline_slot' });
      await ctx.reply(`Выберите секцию (введите номер):\n${list}`);
    } else {
      const platforms = await getAllOnlinePlatforms();
      if (platforms.length === 0) {
        await ctx.reply('Сначала создайте секцию.');
        return;
      }
      const list = platforms.map((p, i) => `${i + 1}. ${p.platform}`).join('\n');
      setAdminSession(ctx.from!.id, { step: 'add_online_slot' });
      await ctx.reply(`Выберите секцию (введите номер):\n${list}`);
    }
  });

  bot.callbackQuery(ADMIN_CB_PATTERNS.slotsList, async ctx => {
    await ctx.answerCallbackQuery();
    if (!requireAdmin(ctx)) return;

    const type = parseTypeCode(ctx.match![1]);
    const parentId = ctx.match![2];
    const { text, keyboard } = await buildSlotsList(type, parentId);
    await ctx.editMessageText(text, { reply_markup: keyboard });
  });

  bot.callbackQuery(ADMIN_CB_PATTERNS.slotDelete, async ctx => {
    await ctx.answerCallbackQuery();
    if (!requireAdmin(ctx)) return;

    const type = parseTypeCode(ctx.match![1]);
    const slotId = ctx.match![2];

    let parentId: string;
    if (type === 'offline') {
      const location = await findOfflineLocationBySlotId(new Types.ObjectId(slotId));
      if (!location) {
        await ctx.reply('Слот не найден.');
        return;
      }
      parentId = location._id.toString();
      await deleteOfflineSlot(location._id, new Types.ObjectId(slotId));
    } else {
      const platform = await findOnlinePlatformBySlotId(new Types.ObjectId(slotId));
      if (!platform) {
        await ctx.reply('Слот не найден.');
        return;
      }
      parentId = platform._id.toString();
      await deleteOnlineSlot(platform._id, new Types.ObjectId(slotId));
    }

    const { text, keyboard } = await buildSlotsList(type, parentId);
    await ctx.editMessageText(text, { reply_markup: keyboard });
  });

  bot.callbackQuery(ADMIN_CB_PATTERNS.slotEdit, async ctx => {
    await ctx.answerCallbackQuery();
    if (!requireAdmin(ctx)) return;

    const type = parseTypeCode(ctx.match![1]);
    const slotId = ctx.match![2];

    if (type === 'offline') {
      const location = await findOfflineLocationBySlotId(new Types.ObjectId(slotId));
      const slot = location ? findSlotById(location.slots, slotId) : undefined;
      if (!slot) {
        await ctx.reply('Слот не найден.');
        return;
      }

      const parentId = location!._id.toString();
      setAdminSession(ctx.from!.id, {
        step: 'edit_offline_slot_day',
        locationId: parentId,
        slotId,
      });
      await askPrefilledInput(
        ctx,
        `Редактирование слота:\n${formatSlotLine(slot)}\n\nВведите день недели (${DAY_INPUT_HINT}):`,
        dayOfWeekToInputValue(slot.dayOfWeek),
      );
      return;
    }

    const platform = await findOnlinePlatformBySlotId(new Types.ObjectId(slotId));
    const slot = platform ? findSlotById(platform.slots, slotId) : undefined;
    if (!slot) {
      await ctx.reply('Слот не найден.');
      return;
    }

    const parentId = platform!._id.toString();
    setAdminSession(ctx.from!.id, { step: 'edit_online_slot_day', platformId: parentId, slotId });
    await askPrefilledInput(
      ctx,
      `Редактирование слота:\n${formatSlotLine(slot)}\n\nВведите день недели (${DAY_INPUT_HINT}):`,
      dayOfWeekToInputValue(slot.dayOfWeek),
    );
  });
}

export async function handleSlotTextMessage(
  ctx: Context,
  session: TAdminFlow,
  text: string,
): Promise<boolean> {
  if (!SLOT_STEPS.has(session.step) || !ctx.from) {
    return false;
  }

  switch (session.step) {
    case 'add_offline_slot': {
      const locations = await getAllOfflineLocations();
      const index = Number(text) - 1;

      if (Number.isNaN(index) || index < 0 || index >= locations.length) {
        await ctx.reply('Секция не найдена. Введите номер из списка.');
        return true;
      }

      const location = locations[index];
      setAdminSession(ctx.from.id, {
        step: 'add_offline_slot_day',
        locationId: location._id.toString(),
      });
      await ctx.reply(
        `Секция: ${formatOfflineLocationHeader(location)}\n\nВведите день недели (${DAY_INPUT_HINT}):`,
      );
      break;
    }

    case 'add_offline_slot_day': {
      const day = parseDayOfWeek(text);
      if (day === null) {
        await ctx.reply(`Неверный день. Используйте: ${DAY_INPUT_HINT}.`);
        return true;
      }
      setAdminSession(ctx.from.id, {
        step: 'add_offline_slot_start',
        locationId: session.locationId,
        dayOfWeek: day,
      });
      await ctx.reply('Введите время начала (например: 19:00):');
      break;
    }

    case 'add_offline_slot_start': {
      setAdminSession(ctx.from.id, {
        step: 'add_offline_slot_end',
        locationId: session.locationId,
        dayOfWeek: session.dayOfWeek,
        startTime: text,
      });
      await ctx.reply('Введите время окончания (например: 20:00):');
      break;
    }

    case 'add_offline_slot_end': {
      setAdminSession(ctx.from.id, {
        step: 'add_offline_slot_title',
        locationId: session.locationId,
        dayOfWeek: session.dayOfWeek,
        startTime: session.startTime,
        endTime: text,
      });
      await ctx.reply('Введите название занятия:');
      break;
    }

    case 'add_offline_slot_title': {
      await addSlotToOfflineLocation(new Types.ObjectId(session.locationId), {
        dayOfWeek: session.dayOfWeek,
        startTime: session.startTime,
        endTime: session.endTime,
        title: text,
        sortOrder: 0,
      });
      clearAdminSession(ctx.from.id);
      await ctx.reply(`Слот добавлен: ${text}`, {
        reply_markup: adminScheduleKeyboard('offline'),
      });
      break;
    }

    case 'add_online_slot': {
      const platforms = await getAllOnlinePlatforms();
      const index = Number(text) - 1;

      if (Number.isNaN(index) || index < 0 || index >= platforms.length) {
        await ctx.reply('Секция не найдена. Введите номер из списка.');
        return true;
      }

      const platform = platforms[index];
      setAdminSession(ctx.from.id, {
        step: 'add_online_slot_day',
        platformId: platform._id.toString(),
      });
      await ctx.reply(`Секция: ${platform.platform}\n\nВведите день недели (${DAY_INPUT_HINT}):`);
      break;
    }

    case 'add_online_slot_day': {
      const day = parseDayOfWeek(text);
      if (day === null) {
        await ctx.reply(`Неверный день. Используйте: ${DAY_INPUT_HINT}.`);
        return true;
      }
      setAdminSession(ctx.from.id, {
        step: 'add_online_slot_start',
        platformId: session.platformId,
        dayOfWeek: day,
      });
      await ctx.reply('Введите время начала (например: 10:00):');
      break;
    }

    case 'add_online_slot_start': {
      setAdminSession(ctx.from.id, {
        step: 'add_online_slot_end',
        platformId: session.platformId,
        dayOfWeek: session.dayOfWeek,
        startTime: text,
      });
      await ctx.reply('Введите время окончания (например: 11:00):');
      break;
    }

    case 'add_online_slot_end': {
      setAdminSession(ctx.from.id, {
        step: 'add_online_slot_title',
        platformId: session.platformId,
        dayOfWeek: session.dayOfWeek,
        startTime: session.startTime,
        endTime: text,
      });
      await ctx.reply('Введите название занятия:');
      break;
    }

    case 'add_online_slot_title': {
      await addSlotToOnlinePlatform(new Types.ObjectId(session.platformId), {
        dayOfWeek: session.dayOfWeek,
        startTime: session.startTime,
        endTime: session.endTime,
        title: text,
        sortOrder: 0,
      });
      clearAdminSession(ctx.from.id);
      await ctx.reply(`Слот добавлен: ${text}`, {
        reply_markup: adminScheduleKeyboard('online'),
      });
      break;
    }

    case 'edit_offline_slot_day': {
      const day = parseDayOfWeek(text);
      if (day === null) {
        await ctx.reply(`Неверный день. Используйте: ${DAY_INPUT_HINT}.`);
        return true;
      }

      const location = await getOfflineLocationById(new Types.ObjectId(session.locationId));
      const slot = location ? findSlotById(location.slots, session.slotId) : undefined;

      setAdminSession(ctx.from.id, {
        step: 'edit_offline_slot_start',
        locationId: session.locationId,
        slotId: session.slotId,
        dayOfWeek: day,
      });
      await askPrefilledInput(ctx, 'Введите время начала:', slot?.startTime ?? text);
      break;
    }

    case 'edit_offline_slot_start': {
      const location = await getOfflineLocationById(new Types.ObjectId(session.locationId));
      const slot = location ? findSlotById(location.slots, session.slotId) : undefined;

      setAdminSession(ctx.from.id, {
        step: 'edit_offline_slot_end',
        locationId: session.locationId,
        slotId: session.slotId,
        dayOfWeek: session.dayOfWeek,
        startTime: text,
      });
      await askPrefilledInput(ctx, 'Введите время окончания:', slot?.endTime ?? text);
      break;
    }

    case 'edit_offline_slot_end': {
      const location = await getOfflineLocationById(new Types.ObjectId(session.locationId));
      const slot = location ? findSlotById(location.slots, session.slotId) : undefined;

      setAdminSession(ctx.from.id, {
        step: 'edit_offline_slot_title',
        locationId: session.locationId,
        slotId: session.slotId,
        dayOfWeek: session.dayOfWeek,
        startTime: session.startTime,
        endTime: text,
      });
      await askPrefilledInput(ctx, 'Введите название занятия:', slot?.title ?? text);
      break;
    }

    case 'edit_offline_slot_title': {
      await updateOfflineSlot(
        new Types.ObjectId(session.locationId),
        new Types.ObjectId(session.slotId),
        {
          dayOfWeek: session.dayOfWeek,
          startTime: session.startTime,
          endTime: session.endTime,
          title: text,
          sortOrder: 0,
        },
      );
      clearAdminSession(ctx.from.id);
      const { text: slotsText, keyboard } = await buildSlotsList('offline', session.locationId);
      await replyAndRemoveInputKeyboard(ctx, `Слот обновлён: ${text}`);
      await ctx.reply(slotsText, { reply_markup: keyboard });
      break;
    }

    case 'edit_online_slot_day': {
      const day = parseDayOfWeek(text);
      if (day === null) {
        await ctx.reply(`Неверный день. Используйте: ${DAY_INPUT_HINT}.`);
        return true;
      }

      const platform = await getOnlinePlatformById(new Types.ObjectId(session.platformId));
      const slot = platform ? findSlotById(platform.slots, session.slotId) : undefined;

      setAdminSession(ctx.from.id, {
        step: 'edit_online_slot_start',
        platformId: session.platformId,
        slotId: session.slotId,
        dayOfWeek: day,
      });
      await askPrefilledInput(ctx, 'Введите время начала:', slot?.startTime ?? text);
      break;
    }

    case 'edit_online_slot_start': {
      const platform = await getOnlinePlatformById(new Types.ObjectId(session.platformId));
      const slot = platform ? findSlotById(platform.slots, session.slotId) : undefined;

      setAdminSession(ctx.from.id, {
        step: 'edit_online_slot_end',
        platformId: session.platformId,
        slotId: session.slotId,
        dayOfWeek: session.dayOfWeek,
        startTime: text,
      });
      await askPrefilledInput(ctx, 'Введите время окончания:', slot?.endTime ?? text);
      break;
    }

    case 'edit_online_slot_end': {
      const platform = await getOnlinePlatformById(new Types.ObjectId(session.platformId));
      const slot = platform ? findSlotById(platform.slots, session.slotId) : undefined;

      setAdminSession(ctx.from.id, {
        step: 'edit_online_slot_title',
        platformId: session.platformId,
        slotId: session.slotId,
        dayOfWeek: session.dayOfWeek,
        startTime: session.startTime,
        endTime: text,
      });
      await askPrefilledInput(ctx, 'Введите название занятия:', slot?.title ?? text);
      break;
    }

    case 'edit_online_slot_title': {
      await updateOnlineSlot(
        new Types.ObjectId(session.platformId),
        new Types.ObjectId(session.slotId),
        {
          dayOfWeek: session.dayOfWeek,
          startTime: session.startTime,
          endTime: session.endTime,
          title: text,
          sortOrder: 0,
        },
      );
      clearAdminSession(ctx.from.id);
      const { text: slotsText, keyboard } = await buildSlotsList('online', session.platformId);
      await replyAndRemoveInputKeyboard(ctx, `Слот обновлён: ${text}`);
      await ctx.reply(slotsText, { reply_markup: keyboard });
      break;
    }
  }

  return true;
}
