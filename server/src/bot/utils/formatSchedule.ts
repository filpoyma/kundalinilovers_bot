import {
  compareSlotsByStartTime,
  formatSlotLine,
  type IScheduleSlot,
} from '../../types/schedule.types';
import type { IOfflineLocationDocument } from '../../models/offline-location.model';
import type { IOnlinePlatformDocument } from '../../models/online-platform.model';
import {
  getActiveOfflineLocations,
  getActiveOnlinePlatforms,
  getSchedulePageTitle,
  formatOfflineLocationHeader,
  formatOnlinePlatformHeader,
} from '../../services/schedule.service';
import type { TScheduleType } from '../../types/schedule.types';

function formatSlot(slot: IScheduleSlot): string {
  return formatSlotLine(slot);
}

function formatOfflineSection(location: IOfflineLocationDocument): string {
  const header = formatOfflineLocationHeader(location);
  const slots = [...location.slots].sort(compareSlotsByStartTime).map(formatSlot).join('\n');

  return slots ? `${header}\n${slots}` : header;
}

function formatOnlineSection(platform: IOnlinePlatformDocument): string {
  const header = formatOnlinePlatformHeader(platform);
  const slots = [...platform.slots].sort(compareSlotsByStartTime).map(formatSlot).join('\n');

  return slots ? `${header}\n${slots}` : header;
}

export async function formatSchedule(type: TScheduleType): Promise<string> {
  const pageTitle = await getSchedulePageTitle(type);
  const sections =
    type === 'offline' ? await getActiveOfflineLocations() : await getActiveOnlinePlatforms();

  if (sections.length === 0 && !pageTitle) {
    return type === 'offline'
      ? 'Офлайн-расписание пока не добавлено.'
      : 'Онлайн-расписание пока не добавлено.';
  }

  const parts: string[] = [];

  if (pageTitle) {
    parts.push(pageTitle);
  }

  if (sections.length === 0) {
    parts.push('Секции пока не добавлены.');
  } else if (type === 'offline') {
    parts.push(
      ...(sections as IOfflineLocationDocument[]).map((location) => formatOfflineSection(location)),
    );
  } else {
    parts.push(
      ...(sections as IOnlinePlatformDocument[]).map((platform) => formatOnlineSection(platform)),
    );
  }

  return parts.join('\n\n');
}

export { formatSlot, formatOfflineSection, formatOnlineSection };
