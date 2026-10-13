import type { Context } from 'grammy';

export async function replyInvalidAdminLink(ctx: Context): Promise<void> {
  await ctx.reply('Некорректная ссылка.');
}
