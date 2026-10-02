import { globalShortcut } from 'electron';

export function registerShortcut(accelerator, callback) {
  if (globalShortcut.isRegistered(accelerator)) {
    return { success: false, error: 'Shortcut already registered by another application' };
  }
  const ok = globalShortcut.register(accelerator, callback);
  if (!ok) {
    return { success: false, error: 'Shortcut registration failed - likely conflicts with another application' };
  }
  return { success: true };
}

export function unregisterAll() {
  globalShortcut.unregisterAll();
}
