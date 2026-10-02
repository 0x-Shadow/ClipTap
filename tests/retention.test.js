import { describe, it, expect } from 'vitest';
import { applyRetention } from '../src/main/retention.js';

describe('retention', () => {
  it('removes old image clips', () => {
    const now = Date.now();
    const clips = [
      { type: 'image', timestamp: now - 40 * 24 * 60 * 60 * 1000 },
      { type: 'image', timestamp: now - 10 * 24 * 60 * 60 * 1000 },
      { type: 'text', timestamp: now - 40 * 24 * 60 * 60 * 1000 },
    ];
    const result = applyRetention(clips, 30);
    expect(result.length).toBe(2);
    expect(result[0].type).toBe('image');
    expect(result[1].type).toBe('text');
  });

  it('keeps all clips when retention is 0', () => {
    const clips = [
      { type: 'image', timestamp: 0 },
      { type: 'text', timestamp: 0 },
    ];
    const result = applyRetention(clips, 0);
    expect(result.length).toBe(2);
  });
});
