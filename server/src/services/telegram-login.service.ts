import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

const MAX_AUTH_AGE_SEC = 24 * 60 * 60;

export type TTelegramLoginData = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

function buildDataCheckString(data: Record<string, string>): string {
  return Object.keys(data)
    .sort()
    .map(key => `${key}=${data[key]}`)
    .join('\n');
}

export function verifyTelegramLogin(
  payload: TTelegramLoginData,
  botToken: string,
  nowSec = Math.floor(Date.now() / 1000),
): boolean {
  if (!botToken || !payload.hash) {
    return false;
  }

  if (nowSec - payload.auth_date > MAX_AUTH_AGE_SEC) {
    return false;
  }

  const fields: Record<string, string> = {
    auth_date: String(payload.auth_date),
    id: String(payload.id),
  };

  if (payload.first_name) fields.first_name = payload.first_name;
  if (payload.last_name) fields.last_name = payload.last_name;
  if (payload.username) fields.username = payload.username;
  if (payload.photo_url) fields.photo_url = payload.photo_url;

  const checkString = buildDataCheckString(fields);
  const secretKey = createHash('sha256').update(botToken).digest();
  const computed = createHmac('sha256', secretKey).update(checkString).digest('hex');

  try {
    return timingSafeEqual(Buffer.from(computed, 'utf8'), Buffer.from(payload.hash, 'utf8'));
  } catch {
    return false;
  }
}
