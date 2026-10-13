import type { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/status.constants';
import { isAdmin } from '../bot/utils/isAdmin';
import { createAdminSessionToken } from '../services/admin-session.service';
import { verifyTelegramLogin, type TTelegramLoginData } from '../services/telegram-login.service';
import { getContentPage, upsertContentPage } from '../services/content.service';
import {
  adminAddOfflineSlot,
  adminDeleteOfflineSection,
  adminDeleteOfflineSlot,
  adminDeleteOnlineSection,
  adminSetScheduleTimezone,
  adminUpdateOfflineSlot,
  createOfflineLocation,
  createOnlinePlatform,
  getAdminScheduleOverview,
  getAdminTimezoneState,
  updateOfflineLocation,
  updateOnlinePlatform,
  upsertSchedulePageTitle,
  addSlotToOnlinePlatform,
  updateOnlineSlot,
  deleteOnlineSlot,
} from '../services/admin-schedule.service';
import {
  parseContentBody,
  parseContentKey,
  parseScheduleType,
  parseSlotBody,
  requireNonEmptyString,
} from '../utils/admin-api.validation';
import { parseObjectId } from '../utils/parseObjectId';
import { isValidTimezone } from '../services/timezone.service';

function sendError(res: Response, status: number, code: string, message: string): void {
  res.status(status).json({ success: false, error: { code, message } });
}

export async function postTelegramAuth(req: Request, res: Response): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'CONFIG', 'Bot token not configured');
    return;
  }

  const body = req.body as Partial<TTelegramLoginData>;
  if (
    typeof body.id !== 'number' ||
    typeof body.auth_date !== 'number' ||
    typeof body.hash !== 'string'
  ) {
    sendError(res, HTTP_STATUS.BAD_REQUEST, 'VALIDATION', 'Некорректные данные Telegram');
    return;
  }

  const payload: TTelegramLoginData = {
    id: body.id,
    auth_date: body.auth_date,
    hash: body.hash,
    first_name: body.first_name,
    last_name: body.last_name,
    username: body.username,
    photo_url: body.photo_url,
  };

  if (!verifyTelegramLogin(payload, botToken)) {
    sendError(res, HTTP_STATUS.UNAUTHORIZED, 'INVALID_HASH', 'Не удалось проверить вход Telegram');
    return;
  }

  if (!isAdmin(payload.id)) {
    sendError(res, HTTP_STATUS.FORBIDDEN, 'FORBIDDEN', 'Нет доступа к админ-панели');
    return;
  }

  const token = createAdminSessionToken(payload.id);
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      token,
      telegramId: payload.id,
      username: payload.username,
      firstName: payload.first_name,
    },
  });
}

export async function getMe(req: Request, res: Response): Promise<void> {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: { telegramId: req.adminTelegramId },
  });
}

export async function getSchedule(req: Request, res: Response): Promise<void> {
  const type = parseScheduleType(req.params.type);
  if (!type) {
    sendError(res, HTTP_STATUS.BAD_REQUEST, 'VALIDATION', 'Некорректный тип расписания');
    return;
  }

  const data = await getAdminScheduleOverview(type);
  res.status(HTTP_STATUS.OK).json({ success: true, data });
}

export async function putScheduleTitle(req: Request, res: Response): Promise<void> {
  const type = parseScheduleType(req.params.type);
  const title = requireNonEmptyString(req.body?.title);
  if (!type || !title) {
    sendError(res, HTTP_STATUS.BAD_REQUEST, 'VALIDATION', 'Некорректные данные');
    return;
  }

  await upsertSchedulePageTitle(type, title);
  res.status(HTTP_STATUS.OK).json({ success: true, data: { title } });
}

export async function postSection(req: Request, res: Response): Promise<void> {
  const type = parseScheduleType(req.params.type);
  if (!type) {
    sendError(res, HTTP_STATUS.BAD_REQUEST, 'VALIDATION', 'Некорректный тип');
    return;
  }

  if (type === 'offline') {
    const country = requireNonEmptyString(req.body?.country);
    const city = requireNonEmptyString(req.body?.city);
    const address = requireNonEmptyString(req.body?.address);
    if (!country || !city || !address) {
      sendError(res, HTTP_STATUS.BAD_REQUEST, 'VALIDATION', 'Заполните страну, город и адрес');
      return;
    }
    const section = await createOfflineLocation({ country, city, address });
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: { id: section._id.toString() } });
    return;
  }

  const platform = requireNonEmptyString(req.body?.platform);
  const link = requireNonEmptyString(req.body?.link);
  if (!platform || !link) {
    sendError(res, HTTP_STATUS.BAD_REQUEST, 'VALIDATION', 'Заполните платформу и ссылку');
    return;
  }
  const section = await createOnlinePlatform({ platform, link });
  res.status(HTTP_STATUS.CREATED).json({ success: true, data: { id: section._id.toString() } });
}

export async function putSection(req: Request, res: Response): Promise<void> {
  const type = parseScheduleType(req.params.type);
  const id = parseObjectId(req.params.id);
  if (!type || !id) {
    sendError(res, HTTP_STATUS.BAD_REQUEST, 'VALIDATION', 'Некорректные данные');
    return;
  }

  if (type === 'offline') {
    const country = requireNonEmptyString(req.body?.country);
    const city = requireNonEmptyString(req.body?.city);
    const address = requireNonEmptyString(req.body?.address);
    if (!country || !city || !address) {
      sendError(res, HTTP_STATUS.BAD_REQUEST, 'VALIDATION', 'Заполните страну, город и адрес');
      return;
    }
    await updateOfflineLocation(id, { country, city, address });
  } else {
    const platform = requireNonEmptyString(req.body?.platform);
    const link = requireNonEmptyString(req.body?.link);
    if (!platform || !link) {
      sendError(res, HTTP_STATUS.BAD_REQUEST, 'VALIDATION', 'Заполните платформу и ссылку');
      return;
    }
    await updateOnlinePlatform(id, { platform, link });
  }

  res.status(HTTP_STATUS.OK).json({ success: true, data: { id: id.toString() } });
}

export async function deleteSection(req: Request, res: Response): Promise<void> {
  const type = parseScheduleType(req.params.type);
  const id = parseObjectId(req.params.id);
  if (!type || !id) {
    sendError(res, HTTP_STATUS.BAD_REQUEST, 'VALIDATION', 'Некорректные данные');
    return;
  }

  if (type === 'offline') {
    await adminDeleteOfflineSection(id);
  } else {
    await adminDeleteOnlineSection(id);
  }

  res.status(HTTP_STATUS.OK).json({ success: true, data: null });
}

export async function postSlot(req: Request, res: Response): Promise<void> {
  const type = parseScheduleType(req.params.type);
  const sectionId = parseObjectId(req.params.id);
  const slot = parseSlotBody(req.body);
  if (!type || !sectionId || !slot) {
    sendError(res, HTTP_STATUS.BAD_REQUEST, 'VALIDATION', 'Некорректные данные слота');
    return;
  }

  const payload = { ...slot, sortOrder: 0 };
  if (type === 'offline') {
    await adminAddOfflineSlot(sectionId, payload);
  } else {
    await addSlotToOnlinePlatform(sectionId, payload);
  }

  res.status(HTTP_STATUS.CREATED).json({ success: true, data: null });
}

export async function putSlot(req: Request, res: Response): Promise<void> {
  const type = parseScheduleType(req.params.type);
  const sectionId = parseObjectId(req.params.id);
  const slotId = parseObjectId(req.params.slotId);
  const slot = parseSlotBody(req.body);
  if (!type || !sectionId || !slotId || !slot) {
    sendError(res, HTTP_STATUS.BAD_REQUEST, 'VALIDATION', 'Некорректные данные слота');
    return;
  }

  const payload = { ...slot, sortOrder: 0 };
  if (type === 'offline') {
    await adminUpdateOfflineSlot(sectionId, slotId, payload);
  } else {
    await updateOnlineSlot(sectionId, slotId, payload);
  }

  res.status(HTTP_STATUS.OK).json({ success: true, data: null });
}

export async function deleteSlot(req: Request, res: Response): Promise<void> {
  const type = parseScheduleType(req.params.type);
  const sectionId = parseObjectId(req.params.id);
  const slotId = parseObjectId(req.params.slotId);
  if (!type || !sectionId || !slotId) {
    sendError(res, HTTP_STATUS.BAD_REQUEST, 'VALIDATION', 'Некорректные данные');
    return;
  }

  if (type === 'offline') {
    await adminDeleteOfflineSlot(sectionId, slotId);
  } else {
    await deleteOnlineSlot(sectionId, slotId);
  }

  res.status(HTTP_STATUS.OK).json({ success: true, data: null });
}

export async function getContent(req: Request, res: Response): Promise<void> {
  const key = parseContentKey(req.params.key);
  if (!key) {
    sendError(res, HTTP_STATUS.BAD_REQUEST, 'VALIDATION', 'Некорректный ключ');
    return;
  }

  const page = await getContentPage(key);
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      key,
      content: page?.content ?? '',
      contactLink: page?.contactLink ?? '',
    },
  });
}

export async function putContent(req: Request, res: Response): Promise<void> {
  const key = parseContentKey(req.params.key);
  if (!key || !req.adminTelegramId) {
    sendError(res, HTTP_STATUS.BAD_REQUEST, 'VALIDATION', 'Некорректные данные');
    return;
  }

  const parsed = parseContentBody(key, req.body);
  if (!parsed.ok) {
    const message =
      parsed.reason === 'too_long'
        ? 'Текст превышает лимит Telegram (4096 символов в одном сообщении бота).'
        : 'Некорректные данные';
    sendError(res, HTTP_STATUS.BAD_REQUEST, 'VALIDATION', message);
    return;
  }

  await upsertContentPage(key, {
    content: parsed.content,
    contactLink: parsed.contactLink,
    updatedByTelegramId: req.adminTelegramId,
  });

  res.status(HTTP_STATUS.OK).json({ success: true, data: null });
}

export async function getTimezone(_req: Request, res: Response): Promise<void> {
  const data = await getAdminTimezoneState();
  res.status(HTTP_STATUS.OK).json({ success: true, data });
}

export async function putTimezone(req: Request, res: Response): Promise<void> {
  const timezone = requireNonEmptyString(req.body?.timezone, 64);
  if (!timezone || !isValidTimezone(timezone)) {
    sendError(res, HTTP_STATUS.BAD_REQUEST, 'VALIDATION', 'Некорректная таймзона');
    return;
  }

  try {
    const label = await adminSetScheduleTimezone(timezone);
    res.status(HTTP_STATUS.OK).json({ success: true, data: { timezone, label } });
  } catch {
    sendError(res, HTTP_STATUS.BAD_REQUEST, 'VALIDATION', 'Некорректная таймзона');
  }
}
