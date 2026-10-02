import { describe, it, expect } from 'vitest';
import { hashContent, isDuplicate } from '../src/main/dedup.js';

describe('dedup', () => {
  it('produces consistent hashes for same content', () => {
    const h1 = hashContent('test');
    const h2 = hashContent('test');
    expect(h1).toBe(h2);
  });

  it('produces different hashes for different content', () => {
    const h1 = hashContent('test1');
    const h2 = hashContent('test2');
    expect(h1).not.toBe(h2);
  });

  it('detects duplicates', () => {
    const entries = [{ hash: 'abc123' }, { hash: 'def456' }];
    expect(isDuplicate({ hash: 'abc123' }, entries)).toBe(true);
    expect(isDuplicate({ hash: 'ghi789' }, entries)).toBe(false);
  });
});
