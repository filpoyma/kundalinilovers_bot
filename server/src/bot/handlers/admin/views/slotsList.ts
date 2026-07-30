import { Types } from 'mongoose';
import {
  adminScheduleKeyboard,
  slotsListKeyboard,
} from '../../../keyboards/admin.keyboard';
import {
  getOfflineLocationById,
  getOnlinePlatformById,
  getSortedSlots,
  formatOfflineLocationHeader,
  formatSlotLine,
} from '../../../../services/schedule.service';
import type { TScheduleType } from '../../../../types/schedule.types';

export async function buildSlotsList(
  type: TScheduleType,
  parentId: string,
): Promise<{
  text: string;
  keyboard: ReturnType<typeof slotsListKeyboard> | ReturnType<typeof adminScheduleKeyboard>;
}> {
  if (type === 'offline') {
    const location = await getOfflineLocationById(new Types.ObjectId(parentId));
    if (!location) {
      return { text: 'Секция не найдена.', keyboard: adminScheduleKeyboard(type) };
    }

    const slots = getSortedSlots(location.slots).filter(slot => slot._id);
    if (slots.length === 0) {
      return {
        text: `Слоты секции:\n${formatOfflineLocationHeader(location)}\n\nСлотов пока нет.`,
        keyboard: slotsListKeyboard(type, []),
      };
    }

    const list = slots.map((slot, i) => `${i + 1}. ${formatSlotLine(slot)}`).join('\n');

    return {
      text: `Слоты секции:\n${formatOfflineLocationHeader(location)}\n\n${list}`,
      keyboard: slotsListKeyboard(
        type,
        slots.map((slot, i) => ({ index: i + 1, slotId: slot._id!.toString() })),
      ),
    };
  }

  const platform = await getOnlinePlatformById(new Types.ObjectId(parentId));
  if (!platform) {
    return { text: 'Секция не найдена.', keyboard: adminScheduleKeyboard(type) };
  }

  const slots = getSortedSlots(platform.slots).filter(slot => slot._id);
  if (slots.length === 0) {
    return {
      text: `Слоты секции:\n${platform.platform}\n\nСлотов пока нет.`,
      keyboard: slotsListKeyboard(type, []),
    };
  }

  const list = slots.map((slot, i) => `${i + 1}. ${formatSlotLine(slot)}`).join('\n');

  return {
    text: `Слоты секции:\n${platform.platform}\n\n${list}`,
    keyboard: slotsListKeyboard(
      type,
      slots.map((slot, i) => ({ index: i + 1, slotId: slot._id!.toString() })),
    ),
  };
}
