import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../constants/status.constants';

export const healthCheck = (_req: Request, res: Response): void => {
  const dbReady = mongoose.connection.readyState === 1;

  if (!dbReady) {
    res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({
      success: false,
      message: 'MongoDB is not connected',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: SUCCESS_MESSAGES.HEALTH_CHECK,
    timestamp: new Date().toISOString(),
  });
};
