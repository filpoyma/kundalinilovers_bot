import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { Settings } from 'luxon';
import { formatSlotForUser, getNextClassOccurrence } from './timezone.service.js';

describe('getNextClassOccurrence', () => {
  const tz = 'UTC';

  afterEach(() => {
    Settings.now = () => Date.now();
  });

  it('returns upcoming slot in the same week', () => {
    const fixedNowMs = Date.UTC(2025, 5, 9, 10, 0, 0);
    Settings.now = () => fixedNowMs;

    const next = getNextClassOccurrence(1, '19:00', tz);
    assert.equal(next.toISO(), '2025-06-09T19:00:00.000Z');
  });

  it('rolls to next week when time already passed', () => {
    const fixedNowMs = Date.UTC(2025, 5, 9, 20, 0, 0);
    Settings.now = () => fixedNowMs;

    const next = getNextClassOccurrence(1, '19:00', tz);
    assert.equal(next.toISO(), '2025-06-16T19:00:00.000Z');
  });
});

describe('formatSlotForUser', () => {
  const tz = 'UTC';

  it('extends end time past midnight on the occurrence day', () => {
    const fixedNowMs = Date.UTC(2025, 5, 9, 10, 0, 0);
    Settings.now = () => fixedNowMs;

    const line = formatSlotForUser(1, '23:00', '01:00', 'Night class', tz);
    assert.match(line, /23:00-01:00/);
  });
});
