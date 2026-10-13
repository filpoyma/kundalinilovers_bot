import type { Bot } from 'grammy';
import { isAdmin } from '../../utils/isAdmin';
import { getAdminSession } from '../../session/adminSession';
import { registerAdminPanelHandler } from './panel.handler';
import { registerAdminContentHandler, handleContentTextMessage } from './content.handler';
import { registerAdminScheduleHandler, handleScheduleTextMessage } from './schedule.handler';
import { registerAdminSectionsHandler, handleSectionTextMessage } from './sections.handler';
import { registerAdminSlotsHandler, handleSlotTextMessage } from './slots.handler';

export function registerAdminHandler(bot: Bot): void {
  registerAdminPanelHandler(bot);
  registerAdminContentHandler(bot);
  registerAdminScheduleHandler(bot);
  registerAdminSectionsHandler(bot);
  registerAdminSlotsHandler(bot);

  bot.on('message:text', async (ctx, next) => {
    if (!ctx.from || !isAdmin(ctx.from.id)) {
      return next();
    }

    const session = await getAdminSession(ctx.from.id);
    const text = ctx.message.text.trim();

    if (session.step === 'idle') {
      return next();
    }

    const handlers = [
      handleScheduleTextMessage,
      handleContentTextMessage,
      handleSectionTextMessage,
      handleSlotTextMessage,
    ];

    for (const handler of handlers) {
      if (await handler(ctx, session, text)) {
        return;
      }
    }

    return next();
  });
}
