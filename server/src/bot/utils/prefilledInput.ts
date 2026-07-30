import { Keyboard, type Context } from 'grammy';

export function prefilledInputMessage(label: string, currentValue: string): string {
  return `${label}\n\nТекущее значение: ${currentValue}\n\nОтправьте новое значение или нажмите кнопку ниже:`;
}

export function prefilledInputKeyboard(currentValue: string): Keyboard {
  return new Keyboard().text(currentValue).resized().oneTime();
}

export async function askPrefilledInput(
  ctx: Context,
  label: string,
  currentValue: string,
): Promise<void> {
  await ctx.reply(prefilledInputMessage(label, currentValue), {
    reply_markup: prefilledInputKeyboard(currentValue),
  });
}

export async function replyAndRemoveInputKeyboard(
  ctx: Context,
  text: string,
  inlineKeyboard?: Parameters<Context['reply']>[1],
): Promise<void> {
  await ctx.reply(text, { reply_markup: { remove_keyboard: true } });

  if (inlineKeyboard) {
    await ctx.reply('Меню:', inlineKeyboard);
  }
}
