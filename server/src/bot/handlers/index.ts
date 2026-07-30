import type { Bot } from 'grammy';
import { registerStartHandler } from './start.handler';
import { registerMenuHandler } from './menu.handler';
import { registerAdminHandler } from './admin';
import { ensureUser } from '../middleware/requireConsent';

export function registerHandlers(bot: Bot): void {
  bot.use(ensureUser);

  registerStartHandler(bot);
  registerMenuHandler(bot);
  registerAdminHandler(bot);
}
