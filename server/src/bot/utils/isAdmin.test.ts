import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { isAdmin } from './isAdmin.js';

describe('isAdmin', () => {
  const original = process.env.TELEGRAM_ADMINS;

  afterEach(() => {
    process.env.TELEGRAM_ADMINS = original;
  });

  it('reads TELEGRAM_ADMINS from env on each call', () => {
    process.env.TELEGRAM_ADMINS = '111,222';
    assert.equal(isAdmin(111), true);
    assert.equal(isAdmin(333), false);

    process.env.TELEGRAM_ADMINS = '333';
    assert.equal(isAdmin(111), false);
    assert.equal(isAdmin(333), true);
  });
});
