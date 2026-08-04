import type { Bot } from 'grammy';
import { registerStartHandler } from './start.handler';
import { registerMenuHandler } from './menu.handler';
import { registerAdminHandler } from './admin';
import { registerTimezoneHandler } from './timezone.handler';
import { registerReminderHandler } from './reminder.handler';
import { ensureUser } from '../middleware/requireConsent';

export function registerHandlers(bot: Bot): void {
  bot.use(ensureUser);

  registerStartHandler(bot);
  registerMenuHandler(bot);
  registerTimezoneHandler(bot);
  registerReminderHandler(bot);
  registerAdminHandler(bot);
}
