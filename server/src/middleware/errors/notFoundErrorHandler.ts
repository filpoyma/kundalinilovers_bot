import { Request, Response } from 'express';
import { HTTP_STATUS, ERROR_MESSAGES } from '../../constants/status.constants';

const notFoundErrorHandler = (_req: Request, res: Response): Response => {
  return res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: {
      message: ERROR_MESSAGES.NOT_FOUND,
    },
  });
};

export default notFoundErrorHandler;

