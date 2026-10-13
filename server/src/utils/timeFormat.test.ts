import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isValidTimeHHmm } from './timeFormat.js';

describe('isValidTimeHHmm', () => {
  it('accepts valid times', () => {
    assert.equal(isValidTimeHHmm('09:30'), true);
    assert.equal(isValidTimeHHmm('23:59'), true);
    assert.equal(isValidTimeHHmm('00:00'), true);
  });

  it('rejects invalid times', () => {
    assert.equal(isValidTimeHHmm('24:00'), false);
    assert.equal(isValidTimeHHmm('9:30'), false);
    assert.equal(isValidTimeHHmm('ab:cd'), false);
    assert.equal(isValidTimeHHmm(''), false);
  });
});
