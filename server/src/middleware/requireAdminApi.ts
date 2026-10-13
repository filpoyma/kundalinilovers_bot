import type { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../constants/status.constants';
import { parseAdminSessionToken } from '../services/admin-session.service';
import { isAdmin } from '../bot/utils/isAdmin';

declare global {
  namespace Express {
    interface Request {
      adminTelegramId?: number;
    }
  }
}

export function requireAdminApi(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Требуется авторизация' },
    });
    return;
  }

  const token = header.slice('Bearer '.length).trim();
  const session = parseAdminSessionToken(token);
  if (!session) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: { code: 'INVALID_SESSION', message: 'Сессия недействительна' },
    });
    return;
  }

  if (!isAdmin(session.telegramId)) {
    res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Нет доступа' },
    });
    return;
  }

  req.adminTelegramId = session.telegramId;
  next();
}
