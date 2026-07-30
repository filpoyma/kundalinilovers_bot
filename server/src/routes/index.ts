import { Router } from 'express';
import healthRoutes from './health.routes';
import webhookRoutes from './webhook.routes';
import { isWebhookMode } from '../config/env';

const router: Router = Router();

router.use('/health', healthRoutes);

if (isWebhookMode) {
  router.use('/', webhookRoutes);
}

export default router;
