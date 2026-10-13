import type { Context } from 'grammy';
import {
  clearConsentMessages,
  getConsentMessages,
  pushConsentMessage,
} from './adminSession';

export async function trackConsentMessage(
  userId: number,
  chatId: number,
  messageId: number,
): Promise<void> {
  await pushConsentMessage(userId, chatId, messageId);
}

export async function deleteConsentMessages(ctx: Context): Promise<void> {
  if (!ctx.from) return;

  const messages = await getConsentMessages(ctx.from.id);
  await Promise.all(
    messages.map(async ({ chatId, messageId }) => {
      try {
        await ctx.api.deleteMessage(chatId, messageId);
      } catch {
        // Message may already be deleted.
      }
    }),
  );

  await clearConsentMessages(ctx.from.id);
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
