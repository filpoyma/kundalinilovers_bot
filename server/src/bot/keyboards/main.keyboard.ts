import { InlineKeyboard, Keyboard } from 'grammy';

export const MENU_CALLBACKS = {
  SERVICES: 'menu:services',
  PRIVATE_SESSION: 'menu:private_session',
  ONLINE_SCHEDULE: 'menu:online_schedule',
  OFFLINE_SCHEDULE: 'menu:offline_schedule',
  MAIN: 'menu:main',
} as const;

export const MENU_LABELS = {
  SERVICES: 'Обо мне',
  PRIVATE_SESSION: 'Записаться на личную сессию',
  SCHEDULES: 'Регулярные расписания',
  ONLINE_SCHEDULE: 'Расписание онлайн',
  OFFLINE_SCHEDULE: 'Расписание офлайн',
  ADMIN: '⚙️ Админ-панель',
} as const;

export type TMenuAction =
  | (typeof MENU_CALLBACKS)[keyof typeof MENU_CALLBACKS]
  | 'admin'
  | 'schedules';

export function mainMenuReplyKeyboard(isAdminUser: boolean): Keyboard {
  const keyboard = new Keyboard()
    .text(MENU_LABELS.SCHEDULES)
    .row()
    .text(MENU_LABELS.SERVICES)
    .row()
    .text(MENU_LABELS.PRIVATE_SESSION);

  if (isAdminUser) {
    keyboard.row().text(MENU_LABELS.ADMIN);
  }

  return keyboard.resized().persistent();
}

export function scheduleMenuKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text(MENU_LABELS.ONLINE_SCHEDULE, MENU_CALLBACKS.ONLINE_SCHEDULE)
    .text(MENU_LABELS.OFFLINE_SCHEDULE, MENU_CALLBACKS.OFFLINE_SCHEDULE);
}

export function removeReplyKeyboardMarkup(): { remove_keyboard: true } {
  return { remove_keyboard: true };
}

export function getMenuActionByLabel(text: string): TMenuAction | null {
  switch (text) {
    case MENU_LABELS.SERVICES:
      return MENU_CALLBACKS.SERVICES;
    case MENU_LABELS.PRIVATE_SESSION:
      return MENU_CALLBACKS.PRIVATE_SESSION;
    case MENU_LABELS.SCHEDULES:
      return 'schedules';
    case MENU_LABELS.ONLINE_SCHEDULE:
      return MENU_CALLBACKS.ONLINE_SCHEDULE;
    case MENU_LABELS.OFFLINE_SCHEDULE:
      return MENU_CALLBACKS.OFFLINE_SCHEDULE;
    case MENU_LABELS.ADMIN:
      return 'admin';
    default:
      return null;
  }
}

export function isMenuLabel(text: string): boolean {
  return getMenuActionByLabel(text) !== null;
}
