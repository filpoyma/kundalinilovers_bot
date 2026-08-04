import { InlineKeyboard } from 'grammy';
import { TIMEZONE_OPTIONS, TIMEZONES_PER_PAGE } from '../../constants/timezone.constants';

export type TTimezoneKeyboardContext = 'user' | 'admin';

function timezoneSetCallback(context: TTimezoneKeyboardContext, timezone: string): string {
  return context === 'admin' ? `admin:tz:set:${timezone}` : `tz:set:${timezone}`;
}

function timezonePageCallback(context: TTimezoneKeyboardContext, page: number): string {
  return context === 'admin' ? `admin:tz:page:${page}` : `tz:page:${page}`;
}

export function timezoneKeyboard(
  page = 0,
  context: TTimezoneKeyboardContext = 'user',
): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  const totalPages = Math.ceil(TIMEZONE_OPTIONS.length / TIMEZONES_PER_PAGE);
  const start = page * TIMEZONES_PER_PAGE;
  const items = TIMEZONE_OPTIONS.slice(start, start + TIMEZONES_PER_PAGE);

  for (const item of items) {
    keyboard.text(item.label, timezoneSetCallback(context, item.id)).row();
  }

  if (page > 0) {
    keyboard.text('← Назад', timezonePageCallback(context, page - 1));
  }
  if (page < totalPages - 1) {
    keyboard.text('Далее →', timezonePageCallback(context, page + 1));
  }
  if (page > 0 || page < totalPages - 1) {
    keyboard.row();
  }

  if (context === 'user') {
    keyboard.text('Отмена', 'tz:cancel');
  } else {
    keyboard.text('← Назад', 'admin:timezone:cancel');
  }

  return keyboard;
}

export function reminderLocationKeyboard(
  locationId: string,
  isSubscribed: boolean,
): InlineKeyboard {
  const label = isSubscribed ? '🔕 Отключить напоминание' : '🔔 Напомнить за день';
  return new InlineKeyboard().text(label, `remind:loc:${locationId}`);
}
