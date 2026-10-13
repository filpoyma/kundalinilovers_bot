import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { DateTime, Settings } from 'luxon';
import { formatReminderLeadPhrase } from './reminderLead.js';

describe('formatReminderLeadPhrase', () => {
  const tz = 'Asia/Makassar';

  afterEach(() => {
    Settings.now = () => Date.now();
  });

  it('returns Сегодня for class on the same calendar day', () => {
    const now = DateTime.fromISO('2025-06-10T10:00:00', { zone: tz });
    const classStart = DateTime.fromISO('2025-06-10T19:00:00', { zone: tz });

    Settings.now = () => now.toMillis();

    assert.equal(formatReminderLeadPhrase(classStart, tz), 'Сегодня ');
  });

  it('returns Завтра for class on the next calendar day', () => {
    const now = DateTime.fromISO('2025-06-10T10:00:00', { zone: tz });
    const classStart = DateTime.fromISO('2025-06-11T19:00:00', { zone: tz });

    Settings.now = () => now.toMillis();

    assert.equal(formatReminderLeadPhrase(classStart, tz), 'Завтра ');
  });

  it('returns empty prefix for class further out', () => {
    const now = DateTime.fromISO('2025-06-10T10:00:00', { zone: tz });
    const classStart = DateTime.fromISO('2025-06-13T19:00:00', { zone: tz });

    Settings.now = () => now.toMillis();

    assert.equal(formatReminderLeadPhrase(classStart, tz), '');
  });
});
