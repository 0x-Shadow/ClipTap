import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import * as storage from './storage.js';
import { startPolling, stopPolling } from './clipboard.js';
import { registerShortcut, unregisterAll } from './shortcuts.js';
import { applyRetention } from './retention.js';
import { wipeAllData } from './wipe.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  });
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Security: this window only ever shows the local clipboard UI.
  // Block popups and any navigation away from local files.
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('file://')) e.preventDefault();
  });
}

function checkFirstLaunch() {
  const settings = storage.getSettings();
  if (!settings.firstLaunchShown) {
    dialog.showMessageBox({
      type: 'warning',
      title: 'ClipTap',
      message: 'Clipboard contents are stored locally',
      detail:
        'ClipTap stores your clipboard history locally on this device. All data is encrypted and never leaves your machine.',
      buttons: ['OK'],
    });
    settings.firstLaunchShown = true;
    storage.saveSettings(settings);
  }
}

function setupPolling() {
  const settings = storage.getSettings();
  const interval = settings.pollIntervalMs || 1000;
  startPolling(interval, (clip) => {
    const clips = storage.getClips();
    const retained = applyRetention(clips, settings.imageRetentionDays);
    if (retained.length !== clips.length) {
      storage.clearClips();
      for (let i = retained.length - 1; i >= 0; i--) {
        storage.addClip(retained[i]);
      }
    }
    storage.addClip(clip);
    if (mainWindow) {
      mainWindow.webContents.send('clips:updated');
    }
  });
}

function setupShortcut() {
  const result = registerShortcut('CommandOrControl+Shift+V', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
  if (!result.success && mainWindow) {
    mainWindow.webContents.send('shortcut:conflict', result.error);
  }
}

app.whenReady().then(() => {
  storage.initStorage(app.getPath('userData'));
  checkFirstLaunch();
  createWindow();
  setupShortcut();
  setupPolling();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  stopPolling();
  unregisterAll();
});

ipcMain.handle('clips:get', () => storage.getClips());
ipcMain.handle('clips:delete', (_, id) => storage.deleteClip(id));
ipcMain.handle('clips:clear', () => storage.clearClips());
ipcMain.handle('settings:get', () => storage.getSettings());
ipcMain.handle('settings:save', (_, s) => storage.saveSettings(s));
ipcMain.handle('data:wipe', () => {
  wipeAllData(app.getPath('userData'));
  return true;
});
