import fs from 'fs';
import path from 'path';
import { loadOrCreateKey, encrypt, decrypt } from './crypto.js';
import { safeWrite } from './safeWrite.js';
import { isDuplicate } from './dedup.js';

const MAX_ENTRIES = 100;
const STORAGE_FILE = 'clips.dat';
const SETTINGS_FILE = 'settings.json';

let dataDir = null;
let encryptionKey = null;

export function initStorage(dir) {
  dataDir = dir;
  encryptionKey = loadOrCreateKey(dir);
}

function getStoragePath() {
  return path.join(dataDir, STORAGE_FILE);
}

function getSettingsPath() {
  return path.join(dataDir, SETTINGS_FILE);
}

function loadClips() {
  const filePath = getStoragePath();
  if (!fs.existsSync(filePath)) return [];
  const encrypted = fs.readFileSync(filePath);
  const decrypted = decrypt(encrypted, encryptionKey);
  return JSON.parse(decrypted.toString('utf8'));
}

function saveClips(clips) {
  const json = JSON.stringify(clips);
  const encrypted = encrypt(json, encryptionKey);
  safeWrite(getStoragePath(), encrypted);
}

export function addClip(clip) {
  const clips = loadClips();
  if (isDuplicate(clip, clips)) return false;
  clip.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  clip.timestamp = Date.now();
  clips.unshift(clip);
  if (clips.length > MAX_ENTRIES) {
    clips.splice(MAX_ENTRIES);
  }
  saveClips(clips);
  return true;
}

export function getClips() {
  return loadClips();
}

export function deleteClip(id) {
  const clips = loadClips();
  const filtered = clips.filter((c) => c.id !== id);
  saveClips(filtered);
}

export function clearClips() {
  saveClips([]);
}

export function getSettings() {
  const filePath = getSettingsPath();
  if (!fs.existsSync(filePath)) {
    return {
      firstLaunchShown: false,
      pollIntervalMs: 1000,
      imageRetentionDays: 30,
      maxEntries: MAX_ENTRIES,
    };
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export function saveSettings(settings) {
  safeWrite(getSettingsPath(), JSON.stringify(settings, null, 2));
}

export { MAX_ENTRIES };
