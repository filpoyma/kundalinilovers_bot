import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getReminderBackoffMinutes } from './reminderBackoff.js';

describe('getReminderBackoffMinutes', () => {
  it('steps through 1, 5, 15, 60 minutes', () => {
    assert.equal(getReminderBackoffMinutes(1), 1);
    assert.equal(getReminderBackoffMinutes(2), 5);
    assert.equal(getReminderBackoffMinutes(3), 15);
    assert.equal(getReminderBackoffMinutes(4), 60);
    assert.equal(getReminderBackoffMinutes(99), 60);
  });
});
