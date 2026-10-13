import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  createAdminSessionToken,
  parseAdminSessionToken,
} from './admin-session.service.js';

describe('admin session token', () => {
  const original = process.env.ADMIN_SESSION_SECRET;

  beforeEach(() => {
    process.env.ADMIN_SESSION_SECRET = 'test-admin-session-secret-key';
  });

  afterEach(() => {
    process.env.ADMIN_SESSION_SECRET = original;
  });

  it('creates and parses a valid token', () => {
    const token = createAdminSessionToken(12345);
    const parsed = parseAdminSessionToken(token);
    assert.ok(parsed);
    assert.equal(parsed!.telegramId, 12345);
  });

  it('rejects tampered token', () => {
    const token = createAdminSessionToken(1);
    const parsed = parseAdminSessionToken(`${token}x`);
    assert.equal(parsed, null);
  });
});
