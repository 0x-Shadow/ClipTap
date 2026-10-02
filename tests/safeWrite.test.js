import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { safeWrite } from '../src/main/safeWrite.js';

describe('safeWrite', () => {
  let tmpDir;
  let testFile;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cliptap-test-'));
    testFile = path.join(tmpDir, 'test.txt');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('writes data correctly', () => {
    safeWrite(testFile, 'hello world');
    expect(fs.readFileSync(testFile, 'utf8')).toBe('hello world');
  });

  it('does not leave temp files behind', () => {
    safeWrite(testFile, 'data');
    const files = fs.readdirSync(tmpDir);
    expect(files).toEqual(['test.txt']);
  });

  it('overwrites existing files', () => {
    safeWrite(testFile, 'first');
    safeWrite(testFile, 'second');
    expect(fs.readFileSync(testFile, 'utf8')).toBe('second');
  });
});
