import { isDevelopment } from '../constants/system.constants';
import { logError } from '../config/logger';

export function registerDevErrorHandlers(): void {
  if (!isDevelopment) return;

  process.on('unhandledRejection', (reason) => {
    logError('Unhandled promise rejection', reason);
  });

  process.on('uncaughtException', (error) => {
    logError('Uncaught exception', error);
    process.exit(1);
  });
}
