import 'dotenv/config';
import winston from 'winston';
import path from 'node:path';
import { isDevelopment } from '../constants/system.constants';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat,
  ),
  defaultMeta: { service: 'kundalinilovers-server' },
  transports: [
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
    }),
  ],
});

if (isDevelopment) {
  logger.add(
    new winston.transports.Console({
      format: combine(colorize(), errors({ stack: true }), logFormat),
    }),
  );
}

export function logError(message: string, error: unknown): void {
  if (error instanceof Error) {
    logger.error(`${message}: ${error.message}`, { stack: error.stack });
    if (isDevelopment) {
      console.error(message, error);
    }
    return;
  }

  logger.error(`${message}: ${String(error)}`);
  if (isDevelopment) {
    console.error(message, error);
  }
}

export default logger;
