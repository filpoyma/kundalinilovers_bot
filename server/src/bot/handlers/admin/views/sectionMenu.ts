import { sectionMenuKeyboard } from '../../../keyboards/admin.keyboard';
import { parseObjectId } from '../../../../utils/parseObjectId';
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
  const objectId = parseObjectId(id);
  if (!objectId) {
    return { text: 'Секция не найдена.', keyboard: sectionMenuKeyboard(type, id) };
  }

  if (type === 'offline') {
    const location = await getOfflineLocationById(objectId);
    if (!location) {
      return { text: 'Секция не найдена.', keyboard: sectionMenuKeyboard(type, id) };
    }

    return {
      text: `Секция:\n${formatOfflineLocationHeader(location)}`,
      keyboard: sectionMenuKeyboard(type, id),
    };
  }

  const platform = await getOnlinePlatformById(objectId);
  if (!platform) {
    return { text: 'Секция не найдена.', keyboard: sectionMenuKeyboard(type, id) };
  }

  return {
    text: `Секция:\n${formatOnlinePlatformHeader(platform)}`,
    keyboard: sectionMenuKeyboard(type, id),
  };
}
