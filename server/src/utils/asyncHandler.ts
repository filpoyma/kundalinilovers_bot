import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';

export { asyncHandler };

export type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response>;

