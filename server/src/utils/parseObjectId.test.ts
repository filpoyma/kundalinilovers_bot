import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseObjectId } from './parseObjectId.js';

describe('parseObjectId', () => {
  it('parses valid ids', () => {
    const id = '507f1f77bcf86cd799439011';
    const parsed = parseObjectId(id);
    assert.ok(parsed);
    assert.equal(parsed!.toString(), id);
  });

  it('returns null for invalid ids', () => {
    assert.equal(parseObjectId('not-an-id'), null);
    assert.equal(parseObjectId(''), null);
  });
});
