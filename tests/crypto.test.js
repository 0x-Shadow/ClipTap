import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { encrypt, decrypt } from '../src/main/crypto.js';

describe('crypto', () => {
  it('encrypts and decrypts text correctly', () => {
    const key = crypto.randomBytes(32);
    const plaintext = 'Hello, ClipTap!';
    const encrypted = encrypt(plaintext, key);
    const decrypted = decrypt(encrypted, key);
    expect(decrypted.toString('utf8')).toBe(plaintext);
  });

  it('produces different ciphertexts for same plaintext (random IV)', () => {
    const key = crypto.randomBytes(32);
    const plaintext = 'test data';
    const e1 = encrypt(plaintext, key);
    const e2 = encrypt(plaintext, key);
    expect(e1.toString('hex')).not.toBe(e2.toString('hex'));
  });

  it('fails to decrypt with wrong key', () => {
    const key1 = crypto.randomBytes(32);
    const key2 = crypto.randomBytes(32);
    const encrypted = encrypt('secret', key1);
    expect(() => decrypt(encrypted, key2)).toThrow();
  });

  it('handles binary data (image buffers)', () => {
    const key = crypto.randomBytes(32);
    const binaryData = crypto.randomBytes(1024);
    const encrypted = encrypt(binaryData, key);
    const decrypted = decrypt(encrypted, key);
    expect(decrypted.equals(binaryData)).toBe(true);
  });
});
