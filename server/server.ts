import './src/config/env';
import mongoose from 'mongoose';
import app from './app';
import connectDatabase from './src/config/database';
import logger from './src/config/logger';
import { createBot, startBot, stopBot } from './src/bot';

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    const bot = createBot();
    await startBot(bot);

    const server = app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });

    const gracefulShutdown = (signal: string): void => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      server.close(() => {
        logger.info('HTTP server closed');

        void stopBot(bot)
          .then(() =>
            mongoose.connection.close().then(() => {
              logger.info('MongoDB connection closed');
              process.exit(0);
            }),
          )
          .catch((err) => {
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
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
