import './src/config/env';
import mongoose from 'mongoose';
import app from './app';
import connectDatabase from './src/config/database';
import logger, { logError } from './src/config/logger';
import { registerDevErrorHandlers } from './src/config/devErrors';
import { getBot, startTelegramBot, stopBot } from './src/bot';
import { isWebhookMode } from './src/config/env';
import { startReminderWorker, stopReminderWorker, wakeReminderScheduler } from './src/jobs/reminder.worker';
import { setReminderJobsChangedHandler } from './src/services/reminder.service';

const PORT = process.env.PORT || 5000;

registerDevErrorHandlers();

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    const bot = getBot();

    const server = app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`Telegram mode: ${isWebhookMode ? 'webhook' : 'long polling'}`);
    });

    await startTelegramBot();
    setReminderJobsChangedHandler(wakeReminderScheduler);
    startReminderWorker(bot);

    const gracefulShutdown = (signal: string): void => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      server.close(() => {
        logger.info('HTTP server closed');

        void stopBot(bot)
          .then(() => {
            stopReminderWorker();
            return mongoose.connection.close();
          })
          .then(() => {
            logger.info('MongoDB connection closed');
            process.exit(0);
          })
          .catch(err => {
            logger.error('Error during graceful shutdown:', err);
            process.exit(1);
          });
      });

      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logError('Failed to start server', error);
    process.exit(1);
  }
};

void startServer();
