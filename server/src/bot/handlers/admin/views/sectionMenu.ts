import { Types } from 'mongoose';
import { sectionMenuKeyboard } from '../../../keyboards/admin.keyboard';
import {
  getOfflineLocationById,
  getOnlinePlatformById,
  formatOfflineLocationHeader,
  formatOnlinePlatformHeader,
} from '../../../../services/schedule.service';
import type { TScheduleType } from '../../../../types/schedule.types';

export async function buildSectionMenu(
  type: TScheduleType,
  id: string,
): Promise<{
  text: string;
  keyboard: ReturnType<typeof sectionMenuKeyboard>;
}> {
  if (type === 'offline') {
    const location = await getOfflineLocationById(new Types.ObjectId(id));
    if (!location) {
      return { text: 'Секция не найдена.', keyboard: sectionMenuKeyboard(type, id) };
    }

    return {
      text: `Секция:\n${formatOfflineLocationHeader(location)}`,
      keyboard: sectionMenuKeyboard(type, id),
    };
  }

  const platform = await getOnlinePlatformById(new Types.ObjectId(id));
  if (!platform) {
    return { text: 'Секция не найдена.', keyboard: sectionMenuKeyboard(type, id) };
  }

  return {
    text: `Секция:\n${formatOnlinePlatformHeader(platform)}`,
    keyboard: sectionMenuKeyboard(type, id),
  };
}
