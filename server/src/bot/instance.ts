import { Bot, type BotError } from 'grammy';
import { logError } from '../config/logger';
import { isDevelopment } from '../constants/system.constants';
import { registerHandlers } from './handlers';

let bot: Bot | undefined;

export function getBot(): Bot {
  if (!bot) {
    bot = createBotInstance();
  }

  return bot;
}

function createBotInstance(): Bot {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN is not set in environment variables');
  }

  const instance = new Bot(token);
  registerHandlers(instance);

  instance.catch((err: BotError) => {
    logError('Telegram bot error', err.error ?? err);

    if (isDevelopment && err.ctx?.update) {
      console.error('Update:', JSON.stringify(err.ctx.update, null, 2));
    }
  });

  return instance;
}
