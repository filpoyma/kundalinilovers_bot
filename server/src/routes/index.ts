import { Router } from 'express';
import healthRoutes from './health.routes';
import webhookRoutes from './webhook.routes';
import adminRoutes from './admin.routes';
import { isWebhookMode } from '../config/env';
import { isAdminApiEnabled } from '../config/admin';

const router: Router = Router();

router.use('/health', healthRoutes);

if (isAdminApiEnabled) {
  router.use('/admin', adminRoutes);
}

if (isWebhookMode) {
  router.use('/', webhookRoutes);
}

export default router;
