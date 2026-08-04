import {
  compareSlotsByStartTime,
  formatSlotLine,
  type IScheduleSlot,
} from '../../types/schedule.types';
import type { IOfflineLocationDocument } from '../../models';
import type { IOnlinePlatformDocument } from '../../models';
import {
  getActiveOfflineLocations,
  getActiveOnlinePlatforms,
  getSchedulePageTitle,
  formatOfflineLocationHeader,
  formatOnlinePlatformHeader,
} from '../../services/schedule.service';
import type { TScheduleType } from '../../types/schedule.types';
import { formatSlotForUser, getScheduleTimezone } from '../../services/timezone.service';
import { escapeTelegramHtml } from './telegramHtml';
import { buildGoogleMapsDirectionsUrl, buildOfflineLocationMapsQuery } from './googleMaps';

export type TFormattedSchedule = {
  text: string;
  parseMode?: 'HTML';
};

export type TOfflineScheduleSection = {
  locationId: string;
  text: string;
  parseMode: 'HTML';
};

export type TOfflineScheduleMessages = {
  pageTitle: string | null;
  sections: TOfflineScheduleSection[];
  emptyText?: string;
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

async function formatOfflineSectionHtml(
  location: IOfflineLocationDocument,
  userTimezone?: string,
): Promise<string> {
  const header = formatOfflineLocationHeaderHtml(location);
  const scheduleTimezone = await getScheduleTimezone();
  const slots = [...location.slots]
    .sort(compareSlotsByStartTime)
    .map(slot =>
      escapeTelegramHtml(
        formatSlotForUser(
          slot.dayOfWeek,
          slot.startTime,
          slot.endTime,
          slot.title,
          scheduleTimezone,
          userTimezone,
        ),
      ),
    )
    .join('\n');

  return slots ? `${header}\n${slots}` : header;
}

function formatOfflineSectionHtmlLegacy(location: IOfflineLocationDocument): string {
  const header = formatOfflineLocationHeaderHtml(location);
  const slots = [...location.slots]
    .sort(compareSlotsByStartTime)
    .map(slot => escapeTelegramHtml(formatSlot(slot)))
    .join('\n');

  return slots ? `${header}\n${slots}` : header;
}

export async function formatOfflineScheduleSections(
  userTimezone?: string,
): Promise<TOfflineScheduleMessages> {
  const pageTitle = await getSchedulePageTitle('offline');
  const locations = await getActiveOfflineLocations();

  if (locations.length === 0 && !pageTitle) {
    return {
      pageTitle: null,
      sections: [],
      emptyText: 'Офлайн-расписание пока не добавлено.',
    };
  }

  if (locations.length === 0) {
    return {
      pageTitle,
      sections: [],
      emptyText: 'Секции пока не добавлены.',
    };
  }

  const sections = await Promise.all(
    locations.map(async location => ({
      locationId: location._id.toString(),
      text: await formatOfflineSectionHtml(location, userTimezone),
      parseMode: 'HTML' as const,
    })),
  );

  return { pageTitle, sections };
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
    parts.push(
      useAddressLinks
        ? escapeTelegramHtml('Секции пока не добавлены.')
        : 'Секции пока не добавлены.',
    );
  } else if (type === 'offline') {
    parts.push(
      ...(sections as IOfflineLocationDocument[]).map(location =>
        useAddressLinks ? formatOfflineSectionHtmlLegacy(location) : formatOfflineSection(location),
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
