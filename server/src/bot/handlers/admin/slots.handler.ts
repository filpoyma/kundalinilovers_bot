import type { Bot, Context } from 'grammy';
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
import { removeJobsForSlot, rescheduleJobsForLocation } from '../../../services/reminder.service';
import { buildSlotsList } from './views/slotsList';
import { parseObjectId } from '../../../utils/parseObjectId';
import { replyInvalidAdminLink } from '../../utils/invalidAdminLink';
import { isValidTimeHHmm } from '../../../utils/timeFormat';

const SLOT_STEPS = new Set<TAdminFlow['step']>([
  'add_slot_pick',
  'add_slot_day',
  'add_slot_start',
  'add_slot_end',
  'add_slot_title',
  'edit_slot_day',
  'edit_slot_start',
  'edit_slot_end',
  'edit_slot_title',
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
      await setAdminSession(ctx.from!.id, { step: 'add_slot_pick', scheduleType: 'offline' });
      await ctx.reply(`Выберите секцию (введите номер):\n${list}`);
    } else {
      const platforms = await getAllOnlinePlatforms();
      if (platforms.length === 0) {
        await ctx.reply('Сначала создайте секцию.');
        return;
      }
      const list = platforms.map((p, i) => `${i + 1}. ${p.platform}`).join('\n');
      await setAdminSession(ctx.from!.id, { step: 'add_slot_pick', scheduleType: 'online' });
      await ctx.reply(`Выберите секцию (введите номер):\n${list}`);
    }
  });

  bot.callbackQuery(ADMIN_CB_PATTERNS.slotsList, async ctx => {
    await ctx.answerCallbackQuery();
    if (!requireAdmin(ctx)) return;

    const type = parseTypeCode(ctx.match![1]);
    const parentId = ctx.match![2];
    if (!parseObjectId(parentId)) {
      await replyInvalidAdminLink(ctx);
      return;
    }

    const { text, keyboard } = await buildSlotsList(type, parentId);
    await ctx.editMessageText(text, { reply_markup: keyboard });
  });

  bot.callbackQuery(ADMIN_CB_PATTERNS.slotDelete, async ctx => {
    await ctx.answerCallbackQuery();
    if (!requireAdmin(ctx)) return;

    const type = parseTypeCode(ctx.match![1]);
    const slotId = ctx.match![2];
    const slotObjectId = parseObjectId(slotId);
    if (!slotObjectId) {
      await replyInvalidAdminLink(ctx);
      return;
    }

    let parentId: string;
    if (type === 'offline') {
      const location = await findOfflineLocationBySlotId(slotObjectId);
      if (!location) {
        await ctx.reply('Слот не найден.');
        return;
      }
      parentId = location._id.toString();
      await removeJobsForSlot(slotObjectId);
      await deleteOfflineSlot(location._id, slotObjectId);
      await rescheduleJobsForLocation(location._id);
    } else {
      const platform = await findOnlinePlatformBySlotId(slotObjectId);
      if (!platform) {
        await ctx.reply('Слот не найден.');
        return;
      }
      parentId = platform._id.toString();
      await deleteOnlineSlot(platform._id, slotObjectId);
    }

    const { text, keyboard } = await buildSlotsList(type, parentId);
    await ctx.editMessageText(text, { reply_markup: keyboard });
  });

  bot.callbackQuery(ADMIN_CB_PATTERNS.slotEdit, async ctx => {
    await ctx.answerCallbackQuery();
    if (!requireAdmin(ctx)) return;

    const type = parseTypeCode(ctx.match![1]);
    const slotId = ctx.match![2];
    const slotObjectId = parseObjectId(slotId);
    if (!slotObjectId) {
      await replyInvalidAdminLink(ctx);
      return;
    }

    if (type === 'offline') {
      const location = await findOfflineLocationBySlotId(slotObjectId);
      const slot = location ? findSlotById(location.slots, slotId) : undefined;
      if (!slot || !location) {
        await ctx.reply('Слот не найден.');
        return;
      }

      const parentId = location._id.toString();
      await setAdminSession(ctx.from!.id, {
        step: 'edit_slot_day',
        scheduleType: 'offline',
        parentId,
        slotId,
      });
      await askPrefilledInput(
        ctx,
        `Редактирование слота:\n${formatSlotLine(slot)}\n\nВведите день недели (${DAY_INPUT_HINT}):`,
        dayOfWeekToInputValue(slot.dayOfWeek),
      );
      return;
    }

    const platform = await findOnlinePlatformBySlotId(slotObjectId);
    const slot = platform ? findSlotById(platform.slots, slotId) : undefined;
    if (!slot || !platform) {
      await ctx.reply('Слот не найден.');
      return;
    }

    const parentId = platform._id.toString();
    await setAdminSession(ctx.from!.id, {
      step: 'edit_slot_day',
      scheduleType: 'online',
      parentId,
      slotId,
    });
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
    case 'add_slot_pick': {
      if (session.scheduleType === 'offline') {
        const locations = await getAllOfflineLocations();
        const index = Number(text) - 1;

        if (Number.isNaN(index) || index < 0 || index >= locations.length) {
          await ctx.reply('Секция не найдена. Введите номер из списка.');
          return true;
        }

        const location = locations[index];
        await setAdminSession(ctx.from.id, {
          step: 'add_slot_day',
          scheduleType: 'offline',
          parentId: location._id.toString(),
        });
        await ctx.reply(
          `Секция: ${formatOfflineLocationHeader(location)}\n\nВведите день недели (${DAY_INPUT_HINT}):`,
        );
        break;
      }

      const platforms = await getAllOnlinePlatforms();
      const index = Number(text) - 1;

      if (Number.isNaN(index) || index < 0 || index >= platforms.length) {
        await ctx.reply('Секция не найдена. Введите номер из списка.');
        return true;
      }

      const platform = platforms[index];
      await setAdminSession(ctx.from.id, {
        step: 'add_slot_day',
        scheduleType: 'online',
        parentId: platform._id.toString(),
      });
      await ctx.reply(`Секция: ${platform.platform}\n\nВведите день недели (${DAY_INPUT_HINT}):`);
      break;
    }

    case 'add_slot_day': {
      const day = parseDayOfWeek(text);
      if (day === null) {
        await ctx.reply(`Неверный день. Используйте: ${DAY_INPUT_HINT}.`);
        return true;
      }
      await setAdminSession(ctx.from.id, {
        step: 'add_slot_start',
        scheduleType: session.scheduleType,
        parentId: session.parentId,
        dayOfWeek: day,
      });
      await ctx.reply('Введите время начала (например: 19:00):');
      break;
    }

    case 'add_slot_start': {
      if (!isValidTimeHHmm(text)) {
        await ctx.reply('Неверное время. Используйте формат ЧЧ:ММ (например: 19:00).');
        return true;
      }
      await setAdminSession(ctx.from.id, {
        step: 'add_slot_end',
        scheduleType: session.scheduleType,
        parentId: session.parentId,
        dayOfWeek: session.dayOfWeek,
        startTime: text.trim(),
      });
      await ctx.reply('Введите время окончания (например: 20:00):');
      break;
    }

    case 'add_slot_end': {
      if (!isValidTimeHHmm(text)) {
        await ctx.reply('Неверное время. Используйте формат ЧЧ:ММ (например: 20:00).');
        return true;
      }
      await setAdminSession(ctx.from.id, {
        step: 'add_slot_title',
        scheduleType: session.scheduleType,
        parentId: session.parentId,
        dayOfWeek: session.dayOfWeek,
        startTime: session.startTime,
        endTime: text.trim(),
      });
      await ctx.reply('Введите название занятия:');
      break;
    }

    case 'add_slot_title': {
      const parentId = parseObjectId(session.parentId);
      if (!parentId) {
        await replyInvalidAdminLink(ctx);
        return true;
      }

      const slotPayload = {
        dayOfWeek: session.dayOfWeek,
        startTime: session.startTime,
        endTime: session.endTime,
        title: text,
        sortOrder: 0,
      };

      if (session.scheduleType === 'offline') {
        await addSlotToOfflineLocation(parentId, slotPayload);
        await rescheduleJobsForLocation(parentId);
      } else {
        await addSlotToOnlinePlatform(parentId, slotPayload);
      }

      await clearAdminSession(ctx.from.id);
      await ctx.reply(`Слот добавлен: ${text}`, {
        reply_markup: adminScheduleKeyboard(session.scheduleType),
      });
      break;
    }

    case 'edit_slot_day': {
      const day = parseDayOfWeek(text);
      if (day === null) {
        await ctx.reply(`Неверный день. Используйте: ${DAY_INPUT_HINT}.`);
        return true;
      }

      const parentId = parseObjectId(session.parentId);
      const slotObjectId = parseObjectId(session.slotId);
      if (!parentId || !slotObjectId) {
        await replyInvalidAdminLink(ctx);
        return true;
      }

      const parent =
        session.scheduleType === 'offline'
          ? await getOfflineLocationById(parentId)
          : await getOnlinePlatformById(parentId);
      const slot = parent ? findSlotById(parent.slots, session.slotId) : undefined;

      await setAdminSession(ctx.from.id, {
        step: 'edit_slot_start',
        scheduleType: session.scheduleType,
        parentId: session.parentId,
        slotId: session.slotId,
        dayOfWeek: day,
      });
      await askPrefilledInput(ctx, 'Введите время начала:', slot?.startTime ?? text);
      break;
    }

    case 'edit_slot_start': {
      if (!isValidTimeHHmm(text)) {
        await ctx.reply('Неверное время. Используйте формат ЧЧ:ММ (например: 19:00).');
        return true;
      }

      const parentId = parseObjectId(session.parentId);
      const slotObjectId = parseObjectId(session.slotId);
      if (!parentId || !slotObjectId) {
        await replyInvalidAdminLink(ctx);
        return true;
      }

      const parent =
        session.scheduleType === 'offline'
          ? await getOfflineLocationById(parentId)
          : await getOnlinePlatformById(parentId);
      const slot = parent ? findSlotById(parent.slots, session.slotId) : undefined;

      await setAdminSession(ctx.from.id, {
        step: 'edit_slot_end',
        scheduleType: session.scheduleType,
        parentId: session.parentId,
        slotId: session.slotId,
        dayOfWeek: session.dayOfWeek,
        startTime: text.trim(),
      });
      await askPrefilledInput(ctx, 'Введите время окончания:', slot?.endTime ?? text);
      break;
    }

    case 'edit_slot_end': {
      if (!isValidTimeHHmm(text)) {
        await ctx.reply('Неверное время. Используйте формат ЧЧ:ММ (например: 20:00).');
        return true;
      }

      const parentId = parseObjectId(session.parentId);
      const slotObjectId = parseObjectId(session.slotId);
      if (!parentId || !slotObjectId) {
        await replyInvalidAdminLink(ctx);
        return true;
      }

      const parent =
        session.scheduleType === 'offline'
          ? await getOfflineLocationById(parentId)
          : await getOnlinePlatformById(parentId);
      const slot = parent ? findSlotById(parent.slots, session.slotId) : undefined;

      await setAdminSession(ctx.from.id, {
        step: 'edit_slot_title',
        scheduleType: session.scheduleType,
        parentId: session.parentId,
        slotId: session.slotId,
        dayOfWeek: session.dayOfWeek,
        startTime: session.startTime,
        endTime: text.trim(),
      });
      await askPrefilledInput(ctx, 'Введите название занятия:', slot?.title ?? text);
      break;
    }

    case 'edit_slot_title': {
      const parentId = parseObjectId(session.parentId);
      const slotObjectId = parseObjectId(session.slotId);
      if (!parentId || !slotObjectId) {
        await replyInvalidAdminLink(ctx);
        return true;
      }

      const slotPayload = {
        dayOfWeek: session.dayOfWeek,
        startTime: session.startTime,
        endTime: session.endTime,
        title: text,
        sortOrder: 0,
      };

      if (session.scheduleType === 'offline') {
        await updateOfflineSlot(parentId, slotObjectId, slotPayload);
        await rescheduleJobsForLocation(parentId);
      } else {
        await updateOnlineSlot(parentId, slotObjectId, slotPayload);
      }

      await clearAdminSession(ctx.from.id);
      const { text: slotsText, keyboard } = await buildSlotsList(
        session.scheduleType,
        session.parentId,
      );
      await replyAndRemoveInputKeyboard(ctx, `Слот обновлён: ${text}`);
      await ctx.reply(slotsText, { reply_markup: keyboard });
      break;
    }
  }

  return true;
}
