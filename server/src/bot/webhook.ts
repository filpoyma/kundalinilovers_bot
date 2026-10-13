import { webhookCallback } from 'grammy';
import type { RequestHandler } from 'express';
import { telegramWebhookSecret } from '../config/env';
import { getBot } from './instance';

export function getWebhookHandler(): RequestHandler {
  if (!telegramWebhookSecret) {
    throw new Error('TELEGRAM_WEBHOOK_SECRET is required for webhook handler');
  }

  return webhookCallback(getBot(), 'express', { secretToken: telegramWebhookSecret });
}
