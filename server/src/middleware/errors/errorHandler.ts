import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import logger, { logError } from '../../config/logger';
import { HTTP_STATUS, ERROR_MESSAGES } from '../../constants/status.constants';
import { isDevelopment } from '../../constants/system.constants';
import { IAppError } from '../../types/errors.types';

const errorHandler = (
  err: IAppError | MongooseError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response => {
  let statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message: string = ERROR_MESSAGES.INTERNAL_SERVER_ERROR;

  if (err instanceof MongooseError.ValidationError) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = ERROR_MESSAGES.VALIDATION_ERROR;
    logger.warn(`Validation Error: ${err.message}`);
  } else if (err instanceof MongooseError.CastError) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = `Invalid ${err.path}: ${err.value}`;
    logger.warn(`Cast Error: ${err.message}`);
  } else if ('statusCode' in err && err.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message;
  }

  if (statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    logError('Unhandled HTTP error', err);
  }

  return res.status(statusCode).json({
    success: false,
    error: {
      message: isDevelopment ? message : ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      ...(isDevelopment && {
        stack: err.stack,
        details: err instanceof Error ? err.message : String(err),
      }),
      ...(isDevelopment && _req.id && { requestId: _req.id }),
    },
  });
};

export default errorHandler;
