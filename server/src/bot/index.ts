import type { Bot } from 'grammy';
import logger from '../config/logger';
import { telegramWebhookUrl, telegramWebhookSecret, isWebhookMode } from '../config/env';
import { getBot } from './instance';

export { getBot } from './instance';
export { getWebhookHandler } from './webhook';

let pollingStarted = false;

export async function startBot(bot: Bot): Promise<void> {
  const webhookInfo = await bot.api.getWebhookInfo();

  if (webhookInfo.url) {
    logger.warn(`Removing active Telegram webhook before polling: ${webhookInfo.url}`);
    await bot.api.deleteWebhook({ drop_pending_updates: false });
  }

  pollingStarted = true;

  await bot.start({
    onStart: (botInfo) => {
      logger.info(`Telegram bot @${botInfo.username} started (long polling)`);
    },
  });
}

export async function registerWebhook(): Promise<void> {
  if (!telegramWebhookUrl) {
    throw new Error('TELEGRAM_WEBHOOK_URL is not set in environment variables');
  }

  const bot = getBot();
  const me = await bot.api.getMe();

  await bot.api.setWebhook(telegramWebhookUrl, {
    secret_token: telegramWebhookSecret,
    drop_pending_updates: true,
  });

  logger.info(`Telegram bot @${me.username} webhook registered: ${telegramWebhookUrl}`);
}

export async function stopBot(bot: Bot): Promise<void> {
  if (isWebhookMode) {
    await bot.api.deleteWebhook({ drop_pending_updates: false });
    logger.info('Telegram webhook removed');
    return;
  }

  if (pollingStarted) {
    await bot.stop();
    logger.info('Telegram bot stopped');
  }
}

export async function startTelegramBot(): Promise<void> {
  const bot = getBot();

  if (isWebhookMode) {
    await registerWebhook();
    return;
  }

  logger.warn('TELEGRAM_WEBHOOK_URL is not set — starting long polling (dev only)');
  await startBot(bot);
}
