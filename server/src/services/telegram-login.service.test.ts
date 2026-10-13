import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHash, createHmac } from 'node:crypto';
import { verifyTelegramLogin } from './telegram-login.service.js';

function signPayload(
  data: Record<string, string>,
  botToken: string,
): string {
  const checkString = Object.keys(data)
    .sort()
    .map(key => `${key}=${data[key]}`)
    .join('\n');
  const secretKey = createHash('sha256').update(botToken).digest();
  return createHmac('sha256', secretKey).update(checkString).digest('hex');
}

describe('verifyTelegramLogin', () => {
  const botToken = '123456:ABC-DEF';
  const nowSec = 1_700_000_000;

  it('accepts valid login data', () => {
    const fields = {
      auth_date: String(nowSec),
      id: '42',
      first_name: 'Test',
    };
    const hash = signPayload(fields, botToken);

    assert.equal(
      verifyTelegramLogin(
        {
          id: 42,
          auth_date: nowSec,
          hash,
          first_name: 'Test',
        },
        botToken,
        nowSec,
      ),
      true,
    );
  });

  it('rejects invalid hash', () => {
    assert.equal(
      verifyTelegramLogin(
        {
          id: 42,
          auth_date: nowSec,
          hash: 'deadbeef',
        },
        botToken,
        nowSec,
      ),
      false,
    );
  });

  it('rejects expired auth_date', () => {
    const old = nowSec - 25 * 60 * 60;
    const fields = { auth_date: String(old), id: '42' };
    const hash = signPayload(fields, botToken);

    assert.equal(
      verifyTelegramLogin({ id: 42, auth_date: old, hash }, botToken, nowSec),
      false,
    );
  });
});
