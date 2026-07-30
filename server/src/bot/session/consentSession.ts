import type { Context } from 'grammy';

type TConsentMessage = {
  chatId: number;
  messageId: number;
};

const consentMessages = new Map<number, TConsentMessage[]>();

export function trackConsentMessage(userId: number, chatId: number, messageId: number): void {
  const messages = consentMessages.get(userId) ?? [];
  messages.push({ chatId, messageId });
  consentMessages.set(userId, messages);
}

export async function deleteConsentMessages(ctx: Context): Promise<void> {
  if (!ctx.from) return;

  const messages = consentMessages.get(ctx.from.id) ?? [];
  await Promise.all(
    messages.map(async ({ chatId, messageId }) => {
      try {
        await ctx.api.deleteMessage(chatId, messageId);
      } catch {
        // Message may already be deleted.
      }
    }),
  );

  consentMessages.delete(ctx.from.id);
}

export async function deleteCallbackMessage(ctx: Context): Promise<void> {
  if (!ctx.callbackQuery?.message) return;

  try {
    await ctx.deleteMessage();
  } catch {
    // Message may already be deleted.
  }
}

export async function clearConsentMessagesFromChat(ctx: Context): Promise<void> {
  await deleteConsentMessages(ctx);
  await deleteCallbackMessage(ctx);
}
