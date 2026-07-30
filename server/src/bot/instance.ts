import { Bot } from 'grammy';
import logger from '../config/logger';
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

  instance.catch((err) => {
    logger.error('Telegram bot error:', err);
  });

  return instance;
}
