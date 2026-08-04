import { InlineKeyboard } from 'grammy';

export function consentKeyboard(): InlineKeyboard {
  return new InlineKeyboard().text(
    '✅ Принимаю условия и политику конфиденциальности',
    'consent:accept',
  );
}
