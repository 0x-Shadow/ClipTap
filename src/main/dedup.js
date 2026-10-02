import crypto from 'crypto';

export function hashContent(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

export function isDuplicate(entry, existingEntries) {
  return existingEntries.some((e) => e.hash === entry.hash);
}
