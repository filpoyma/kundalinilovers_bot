import { createHmac, timingSafeEqual } from 'node:crypto';

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getAdminSessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET?.trim() ?? '';
}

type TSessionPayload = {
  telegramId: number;
  exp: number;
};

function sign(body: string): string {
  return createHmac('sha256', getAdminSessionSecret()).update(body).digest('base64url');
}

export function createAdminSessionToken(telegramId: number): string {
  const payload: TSessionPayload = {
    telegramId,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${sign(body)}`;
}

export function parseAdminSessionToken(token: string): TSessionPayload | null {
  const [body, signature] = token.split('.');
  if (!body || !signature) {
    return null;
  }

  const expected = sign(body);
  try {
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return null;
    }
  } catch {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as TSessionPayload;
    if (!payload.telegramId || !payload.exp || payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
