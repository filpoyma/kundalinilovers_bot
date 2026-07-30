import { Bot } from 'grammy';
import logger from '../config/logger';
import { registerHandlers } from './handlers';

export function createBot(): Bot {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN is not set in environment variables');
  }

  const bot = new Bot(token);
  registerHandlers(bot);

  return bot;
}

export async function startBot(bot: Bot): Promise<void> {
  bot.catch((err) => {
    logger.error('Telegram bot error:', err);
  });

  await bot.start({
    onStart: (botInfo) => {
      logger.info(`Telegram bot @${botInfo.username} started`);
    },
  });
}

export async function stopBot(bot: Bot): Promise<void> {
  await bot.stop();
  logger.info('Telegram bot stopped');
}
