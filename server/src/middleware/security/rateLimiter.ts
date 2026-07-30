import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import logger from '../../config/logger';
import {ERROR_MESSAGES} from '../../constants/status.constants';

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10); // 15 минут по умолчанию
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10); // 100 запросов по умолчанию

const rateLimitHandler = (_req: Request, res: Response): void => {
  logger.warn(`Rate limit exceeded for IP: ${_req.ip}`);
  res.status(429).json({
    success: false,
    error: {
      message: ERROR_MESSAGES.TOO_MANY_REQUESTS,
    },
  });
};

export const generalRateLimiter = rateLimit({
  windowMs,
  limit: maxRequests,
  message: ERROR_MESSAGES.TOO_MANY_REQUESTS_FROM_IP,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: (req) => req.path === '/api/kundalinilovers-bot/webhook',
});

export const strictRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  limit: 10, // 10 запросов
  message: ERROR_MESSAGES.TOO_MANY_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

