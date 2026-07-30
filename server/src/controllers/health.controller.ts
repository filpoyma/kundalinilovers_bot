import { Request, Response } from 'express';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../constants/status.constants';

export const healthCheck = (_req: Request, res: Response): void => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: SUCCESS_MESSAGES.HEALTH_CHECK,
    timestamp: new Date().toISOString(),
  });
};

