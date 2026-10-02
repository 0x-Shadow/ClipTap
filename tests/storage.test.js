import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import * as storage from '../src/main/storage.js';

describe('storage', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cliptap-storage-'));
    storage.initStorage(tmpDir);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('adds and retrieves clips', () => {
    storage.addClip({ type: 'text', content: 'hello', hash: 'h1' });
    const clips = storage.getClips();
    expect(clips.length).toBe(1);
    expect(clips[0].content).toBe('hello');
  });

  it('prevents duplicate clips', () => {
    storage.addClip({ type: 'text', content: 'hello', hash: 'h1' });
    const result = storage.addClip({ type: 'text', content: 'hello', hash: 'h1' });
    expect(result).toBe(false);
    expect(storage.getClips().length).toBe(1);
  });

  it('enforces storage limit', () => {
    for (let i = 0; i < 105; i++) {
      storage.addClip({ type: 'text', content: `clip${i}`, hash: `h${i}` });
    }
    expect(storage.getClips().length).toBe(100);
  });

  it('deletes clips by id', () => {
    storage.addClip({ type: 'text', content: 'hello', hash: 'h1' });
    const clips = storage.getClips();
    storage.deleteClip(clips[0].id);
    expect(storage.getClips().length).toBe(0);
  });

  it('persists data across reinit', () => {
    storage.addClip({ type: 'text', content: 'persistent', hash: 'h1' });
    storage.initStorage(tmpDir);
    const clips = storage.getClips();
    expect(clips.length).toBe(1);
    expect(clips[0].content).toBe('persistent');
  });
});
