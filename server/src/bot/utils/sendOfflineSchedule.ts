import type { Context } from 'grammy';
import { escapeTelegramHtml } from './telegramHtml';
import { formatOfflineScheduleSections } from './formatSchedule';
import { reminderLocationKeyboard } from '../keyboards/timezone.keyboard';
import { getActiveSubscriptionLocationIds } from '../../services/reminder.service';
import { findOrCreateUser } from '../../services/user.service';

export async function sendOfflineSchedule(ctx: Context): Promise<void> {
  if (!ctx.from) return;

  const user = await findOrCreateUser(ctx);
  const { pageTitle, sections, emptyText } = await formatOfflineScheduleSections(user.timezone);
  const subscribedLocationIds = new Set(await getActiveSubscriptionLocationIds(ctx.from.id));

  if (emptyText && sections.length === 0) {
    await ctx.reply(emptyText);
    return;
  }

  if (pageTitle) {
    await ctx.reply(escapeTelegramHtml(pageTitle), {
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: true },
    });
  }

  if (sections.length === 0 && emptyText) {
    await ctx.reply(emptyText);
    return;
  }

  for (const section of sections) {
    await ctx.reply(section.text, {
      parse_mode: section.parseMode,
      link_preview_options: { is_disabled: true },
      reply_markup: reminderLocationKeyboard(
        section.locationId,
        subscribedLocationIds.has(section.locationId),
      ),
    });
  }
}
