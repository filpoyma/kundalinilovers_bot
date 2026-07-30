import type { Context } from 'grammy';
import { adminScheduleKeyboard, sectionsListKeyboard } from '../../../keyboards/admin.keyboard';
import {
  getAllOfflineLocations,
  getAllOnlinePlatforms,
  formatOfflineLocationHeader,
  formatOnlinePlatformHeader,
} from '../../../../services/schedule.service';
import type { TScheduleType } from '../../../../types/schedule.types';

export async function buildSectionsList(type: TScheduleType): Promise<{
  text: string;
  keyboard: ReturnType<typeof sectionsListKeyboard> | ReturnType<typeof adminScheduleKeyboard>;
}> {
  if (type === 'offline') {
    const locations = await getAllOfflineLocations();
    if (locations.length === 0) {
      return { text: 'Секций пока нет.', keyboard: adminScheduleKeyboard(type) };
    }

    const list = locations
      .map((loc, i) => `${i + 1}. ${formatOfflineLocationHeader(loc)}`)
      .join('\n');

    return {
      text: `Офлайн-секции:\n${list}\n\nРедактировать:\n📍 - секцию, 📋 - слот`,
      keyboard: sectionsListKeyboard(
        type,
        locations.map((loc, i) => ({ index: i + 1, id: loc._id.toString() })),
      ),
    };
  }

  const platforms = await getAllOnlinePlatforms();
  if (platforms.length === 0) {
    return { text: 'Секций пока нет.', keyboard: adminScheduleKeyboard(type) };
  }

  const list = platforms
    .map((p, i) => `${i + 1}. ${formatOnlinePlatformHeader(p).replace('\n', ' — ')}`)
    .join('\n');

  return {
    text: `Онлайн-секции:\n${list}\n\nРедактировать:\n🌐 - секцию, 📋 - слот`,
    keyboard: sectionsListKeyboard(
      type,
      platforms.map((p, i) => ({ index: i + 1, id: p._id.toString() })),
    ),
  };
}

export async function showSectionsList(ctx: Context, type: TScheduleType): Promise<void> {
  const { text, keyboard } = await buildSectionsList(type);
  await ctx.editMessageText(text, { reply_markup: keyboard });
}
