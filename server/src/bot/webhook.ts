import { webhookCallback } from 'grammy';
import type { RequestHandler } from 'express';
import { telegramWebhookSecret } from '../config/env';
import { getBot } from './instance';

export function getWebhookHandler(): RequestHandler {
  const options = telegramWebhookSecret ? { secretToken: telegramWebhookSecret } : undefined;

  return webhookCallback(getBot(), 'express', options);
}
