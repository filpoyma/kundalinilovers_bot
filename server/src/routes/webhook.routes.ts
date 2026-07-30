import { Router } from 'express';
import { isWebhookMode } from '../config/env';
import { getWebhookHandler } from '../bot/webhook';

const router: Router = Router();

if (isWebhookMode) {
  router.post('/webhook', getWebhookHandler());
}

export default router;
