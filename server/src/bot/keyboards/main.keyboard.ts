import { InlineKeyboard } from 'grammy';

export const MENU_CALLBACKS = {
  SERVICES: 'menu:services',
  PRIVATE_SESSION: 'menu:private_session',
  ONLINE_SCHEDULE: 'menu:online_schedule',
  OFFLINE_SCHEDULE: 'menu:offline_schedule',
  MAIN: 'menu:main',
} as const;

export function mainMenuKeyboard(isAdminUser: boolean): InlineKeyboard {
  const keyboard = new InlineKeyboard()
    .text('Мои услуги', MENU_CALLBACKS.SERVICES)
    .row()
    .text('Записаться на личную сессию', MENU_CALLBACKS.PRIVATE_SESSION)
    .row()
    .text('Расписание онлайн', MENU_CALLBACKS.ONLINE_SCHEDULE)
    .row()
    .text('Расписание офлайн', MENU_CALLBACKS.OFFLINE_SCHEDULE);

  if (isAdminUser) {
    keyboard.row().text('⚙️ Админ-панель', 'admin:panel');
  }

  return keyboard;
}

export function backToMenuKeyboard(): InlineKeyboard {
  return new InlineKeyboard().text('← Назад в меню', MENU_CALLBACKS.MAIN);
}
