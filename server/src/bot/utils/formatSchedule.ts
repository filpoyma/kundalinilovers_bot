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
import { escapeTelegramHtml } from './telegramHtml';
import { buildGoogleMapsDirectionsUrl, buildOfflineLocationMapsQuery } from './googleMaps';

export type TFormattedSchedule = {
  text: string;
  parseMode?: 'HTML';
};

function formatSlot(slot: IScheduleSlot): string {
  return formatSlotLine(slot);
}

function formatOfflineSection(location: IOfflineLocationDocument): string {
  const header = formatOfflineLocationHeader(location);
  const slots = [...location.slots].sort(compareSlotsByStartTime).map(formatSlot).join('\n');

  return slots ? `${header}\n${slots}` : header;
}

function formatOfflineLocationHeaderHtml(location: IOfflineLocationDocument): string {
  const country = escapeTelegramHtml(location.country);
  const city = escapeTelegramHtml(location.city);
  const address = escapeTelegramHtml(location.address);
  const mapsUrl = buildGoogleMapsDirectionsUrl(buildOfflineLocationMapsQuery(location)).replace(
    /&/g,
    '&amp;',
  );

  return `${country} · ${city} · <a href="${mapsUrl}">${address}</a>`;
}

function formatOfflineSectionHtml(location: IOfflineLocationDocument): string {
  const header = formatOfflineLocationHeaderHtml(location);
  const slots = [...location.slots]
    .sort(compareSlotsByStartTime)
    .map(slot => escapeTelegramHtml(formatSlot(slot)))
    .join('\n');

  return slots ? `${header}\n${slots}` : header;
}

function formatOnlineSection(platform: IOnlinePlatformDocument): string {
  const header = formatOnlinePlatformHeader(platform);
  const slots = [...platform.slots].sort(compareSlotsByStartTime).map(formatSlot).join('\n');

  return slots ? `${header}\n${slots}` : header;
}

export async function formatSchedule(
  type: TScheduleType,
  options?: { linkAddresses?: boolean },
): Promise<TFormattedSchedule> {
  const pageTitle = await getSchedulePageTitle(type);
  const sections =
    type === 'offline' ? await getActiveOfflineLocations() : await getActiveOnlinePlatforms();

  if (sections.length === 0 && !pageTitle) {
    return {
      text:
        type === 'offline'
          ? 'Офлайн-расписание пока не добавлено.'
          : 'Онлайн-расписание пока не добавлено.',
    };
  }

  const useAddressLinks = options?.linkAddresses && type === 'offline' && sections.length > 0;
  const parts: string[] = [];

  if (pageTitle) {
    parts.push(useAddressLinks ? escapeTelegramHtml(pageTitle) : pageTitle);
  }

  if (sections.length === 0) {
    parts.push(useAddressLinks ? escapeTelegramHtml('Секции пока не добавлены.') : 'Секции пока не добавлены.');
  } else if (type === 'offline') {
    parts.push(
      ...(sections as IOfflineLocationDocument[]).map(location =>
        useAddressLinks ? formatOfflineSectionHtml(location) : formatOfflineSection(location),
      ),
    );
  } else {
    parts.push(
      ...(sections as IOnlinePlatformDocument[]).map(platform => formatOnlineSection(platform)),
    );
  }

  return {
    text: parts.join('\n\n'),
    ...(useAddressLinks && { parseMode: 'HTML' as const }),
  };
}

export { formatSlot, formatOfflineSection, formatOnlineSection };
