import { InlineKeyboard } from 'grammy';

export function consentKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('✅ Принимаю соглашение', 'consent:terms')
    .row()
    .text('✅ Принимаю политику конфиденциальности', 'consent:privacy');
}
