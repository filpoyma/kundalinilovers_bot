import type { Bot, Context } from 'grammy';
import { reminderLocationKeyboard } from '../keyboards/timezone.keyboard';
import {
  isSubscribedToLocation,
  subscribeToLocation,
  unsubscribeFromLocation,
} from '../../services/reminder.service';
import { formatOfflineLocationHeaderHtml } from '../utils/formatOfflineLocationHeader';

export function registerReminderHandler(bot: Bot): void {
  bot.callbackQuery(/^remind:loc:([a-f0-9]{24})$/, async ctx => {
    await ctx.answerCallbackQuery();
    if (!ctx.from) return;

    const locationId = ctx.match![1];

    if (await isSubscribedToLocation(ctx.from.id, locationId)) {
      await unsubscribeFromLocation(ctx.from.id, locationId);
      await ctx.reply('Напоминания отключены для этой секции.');
      await updateReminderButton(ctx, locationId, false);
      return;
    }

    const location = await subscribeToLocation(ctx.from.id, locationId);
    if (!location) {
      await ctx.reply('Не удалось включить напоминания для этой секции.');
      return;
    }

    await ctx.reply(`Напоминания включены для:\n${formatOfflineLocationHeaderHtml(location)}`, {
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: true },
    });
    await updateReminderButton(ctx, locationId, true);
  });
}

async function updateReminderButton(
  ctx: Context,
  locationId: string,
  isSubscribed: boolean,
): Promise<void> {
  try {
    await ctx.editMessageReplyMarkup({
      reply_markup: reminderLocationKeyboard(locationId, isSubscribed),
    });
  } catch {
    // Message may be unchanged or unavailable.
  }
}
