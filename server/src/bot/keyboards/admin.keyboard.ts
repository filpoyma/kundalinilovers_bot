import { InlineKeyboard } from 'grammy';
import type { TScheduleType } from '../../types/schedule.types';
import { AdminCb } from '../utils/adminCallbacks';

export function adminMenuKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('Редактировать онлайн-расписание', 'admin:edit:online')
    .row()
    .text('Редактировать офлайн-расписание', 'admin:edit:offline')
    .row()
    .text('Редактировать «Обо мне»', 'admin:edit:services')
    .row()
    .text('Редактировать «Личная сессия»', 'admin:edit:private_session')
    .row()
    .text('🕐 Установить таймзону', 'admin:timezone')
    .row()
    .text('← Назад в меню', 'menu:main');
}

export function adminScheduleKeyboard(type: TScheduleType): InlineKeyboard {
  const prefix = `admin:${type}`;
  return new InlineKeyboard()
    .text('✏️ Заголовок страницы', `${prefix}:page:title`)
    .row()
    .text('➕ Создать секцию', `${prefix}:section:create`)
    .row()
    .text('➕ Добавить слот', `${prefix}:slot:create`)
    .row()
    .text('📋 Редактировать / Удалить', AdminCb.sectionsList(type))
    .row()
    .text('← Назад', 'admin:panel');
}

export function adminContentKeyboard(key: 'services' | 'private_session'): InlineKeyboard {
  return new InlineKeyboard()
    .text('✏️ Изменить текст', `admin:content:${key}:edit`)
    .row()
    .text('← Назад', 'admin:panel');
}

const SECTION_EMOJI: Record<TScheduleType, string> = {
  offline: '📍',
  online: '🌐',
};

export function sectionsListKeyboard(
  type: TScheduleType,
  items: Array<{ index: number; id: string }>,
): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  const sectionEmoji = SECTION_EMOJI[type];

  for (const item of items) {
    keyboard.text(`${item.index} ${sectionEmoji}`, AdminCb.sectionMenu(type, item.id));
  }

  keyboard.row();

  for (const item of items) {
    keyboard.text(`${item.index} 📋`, AdminCb.slotsList(type, item.id));
  }

  keyboard.row().text('← Назад', `admin:edit:${type}`);
  return keyboard;
}

export function sectionMenuKeyboard(type: TScheduleType, id: string): InlineKeyboard {
  return new InlineKeyboard()
    .text('✏️ Редактировать', AdminCb.sectionEdit(type, id))
    .row()
    .text('🗑️ Удалить', AdminCb.sectionDelete(type, id))
    .row()
    .text('← К секциям', AdminCb.sectionsList(type));
}

export function slotsListKeyboard(
  type: TScheduleType,
  items: Array<{ index: number; slotId: string }>,
): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  if (items.length > 0) {
    for (const item of items) {
      keyboard.text(`${item.index} 🗑️`, AdminCb.slotDelete(type, item.slotId));
    }

    keyboard.row();

    for (const item of items) {
      keyboard.text(`${item.index} ✏️`, AdminCb.slotEdit(type, item.slotId));
    }

    keyboard.row();
  }

  keyboard.text('← К секциям', AdminCb.sectionsList(type));
  return keyboard;
}
