import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

const requestId = (req: Request, res: Response, next: NextFunction): void => {
  req.id = randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
};

export default requestId;

