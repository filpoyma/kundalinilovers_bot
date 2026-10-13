import logger from './logger';

export const adminSessionSecret = process.env.ADMIN_SESSION_SECRET?.trim() ?? '';

export const isAdminApiEnabled = Boolean(adminSessionSecret);

if (!isAdminApiEnabled) {
  logger.warn('ADMIN_SESSION_SECRET is not set — web admin API is disabled');
}
