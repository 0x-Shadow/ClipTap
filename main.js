const { app, BrowserWindow, globalShortcut, ipcMain, clipboard, screen, nativeImage, Tray, Menu, ClipboardItem } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

let buttonWindow = null;
let panelWindow = null;
let tray = null;

const APP_NAME = 'ClipTap';
const POLL_MS = 400;
const MAX_TEXT_BYTES = 100 * 1024; // skip monster dumps, don't blow up the json
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const OWN_WRITE_GRACE_MS = 1200;

// ─── Storage ───
function dataDir() {
  const dir = path.join(app.getPath('userData'), 'clips');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function imagesDir() {
  const dir = path.join(dataDir(), 'images');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function clipsPath() {
  return path.join(dataDir(), 'clips.json');
}

function settingsPath() {
  return path.join(app.getPath('userData'), 'settings.json');
}

const DEFAULT_SETTINGS = { maxItems: 50, launchAtLogin: false, monitoring: true };

function getSettings() {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(fs.readFileSync(settingsPath(), 'utf8')) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings(s) {
  try {
    fs.writeFileSync(settingsPath(), JSON.stringify(s, null, 2));
  } catch (err) {
    console.error('Save settings failed:', err.message);
  }
}

let clips = []; // newest first: { id, kind: 'text'|'image', text?, file?, pinned, time, preview }
let nextId = 1;

function loadClips() {
  try {
    const raw = JSON.parse(fs.readFileSync(clipsPath(), 'utf8'));
    if (!Array.isArray(raw)) return;
    clips = raw.filter(c =>
      c && Number.isInteger(c.id) && (c.kind === 'text' || c.kind === 'image') &&
      typeof c.time === 'number' && c.pinned !== undefined
    ).slice(0, 500);
    for (const c of clips) {
      if (c.kind === 'text' && typeof c.text !== 'string') c.text = '';
      if (c.kind === 'image' && !isSafeImageFile(c.file)) { c.broken = true; }
      if (c.id >= nextId) nextId = c.id + 1;
    }
  } catch { clips = []; }
}

let saveTimer = null;
function persistClips() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    try {
      fs.writeFileSync(clipsPath(), JSON.stringify(clips.slice(0, 500)));
    } catch (err) {
      console.error('Persist failed:', err.message);
    }
  }, 300);
}

function isSafeImageFile(file) {
  if (typeof file !== 'string' || !/^img-\d+\.png$/.test(file)) return false;
  const resolved = path.resolve(imagesDir(), file);
  return resolved.startsWith(path.resolve(imagesDir()) + path.sep);
}

function publicClips() {
  return clips.map(c => ({
    id: c.id,
    kind: c.kind,
    text: c.kind === 'text' ? c.text.slice(0, 2000) : undefined,
    file: c.kind === 'image' ? c.file : undefined,
    broken: !!c.broken,
    pinned: !!c.pinned,
    time: c.time
  }));
}

// ─── Clipboard watcher ───
let lastSig = null;
let ownWriteSig = null;
let ownWriteAt = 0;

function sigOfText(text) {
  return 'T' + crypto.createHash('sha1').update(text, 'utf8').digest('hex');
}

let pollBusy = false;

async function pollClipboard() {
  if (pollBusy || !getSettings().monitoring) return;
  pollBusy = true;
  try {
    const text = await clipboard.readText();
    if (text && text.length > 0) {
      if (Buffer.byteLength(text, 'utf8') > MAX_TEXT_BYTES) { lastSig = 'T-oversize'; return; }
      addClip({ kind: 'text', text, sig: sigOfText(text) });
      return;
    }
    // Electron 40+: images come back as ClipboardItems — read image/* as bytes
    const items = await clipboard.read();
    const item = (items || []).find(i => i.types && i.types.some(t => t.startsWith('image/')));
    if (!item) return;
    const mime = item.types.find(t => t.startsWith('image/'));
    const blob = await item.getType(mime);
    const buf = Buffer.from(await blob.arrayBuffer());
    if (buf.length === 0 || buf.length > MAX_IMAGE_BYTES) { lastSig = 'I-oversize'; return; }
    const image = nativeImage.createFromBuffer(buf);
    if (image.isEmpty()) return;
    const size = image.getSize();
    if (size.width < 8 || size.height < 8) return;
    const png = image.toPNG();
    addClip({
      kind: 'image', png,
      sig: 'I' + crypto.createHash('sha1').update(png).digest('hex')
    });
  } catch (err) {
    console.error('Poll failed:', err.message);
  } finally {
    pollBusy = false;
  }
}

function addClip({ kind, text, png, sig }) {
  const now = Date.now();
  // ignore our own programmatic writes for a grace period
  if (sig === ownWriteSig && now - ownWriteAt < OWN_WRITE_GRACE_MS) return;
  // same content re-copied → bump to top, don't duplicate
  const existing = clips.findIndex(c => c.sig === sig);
  if (existing !== -1) {
    const [c] = clips.splice(existing, 1);
    c.time = now;
    clips.unshift(c);
    lastSig = sig;
    persistClips();
    sendClips();
    return;
  }
  lastSig = sig;
  const clip = { id: nextId++, kind, pinned: false, time: now, sig };
  if (kind === 'text') {
    clip.text = text;
  } else {
    const file = `img-${clip.id}.png`;
    try {
      fs.writeFileSync(path.join(imagesDir(), file), png);
      clip.file = file;
    } catch (err) {
      console.error('Image save failed:', err.message);
      return;
    }
  }
  clips.unshift(clip);
  enforceLimit();
  persistClips();
  sendClips();
}

function enforceLimit() {
  const max = Math.max(10, Math.min(500, getSettings().maxItems || 50));
  const unpinned = clips.filter(c => !c.pinned);
  if (unpinned.length > max) {
    const drop = unpinned.slice(max);
    for (const c of drop) deleteImageFile(c);
    const dropIds = new Set(drop.map(c => c.id));
    clips = clips.filter(c => !dropIds.has(c.id));
  }
}

function deleteImageFile(c) {
  if (c.kind === 'image' && c.file && isSafeImageFile(c.file)) {
    try { fs.unlinkSync(path.join(imagesDir(), c.file)); } catch { /* gone */ }
  }
}

async function copyClip(id) {
  const clip = clips.find(c => c.id === id);
  if (!clip) return false;
  try {
    if (clip.kind === 'text') {
      await clipboard.writeText(clip.text);
      ownWriteSig = sigOfText(clip.text);
    } else {
      if (!clip.file || !isSafeImageFile(clip.file)) return false;
      const filePath = path.join(imagesDir(), clip.file);
      if (!fs.existsSync(filePath)) { clip.broken = true; sendClips(); return false; }
      const png = fs.readFileSync(filePath);
      const image = nativeImage.createFromBuffer(png);
      if (image.isEmpty()) return false;
      await clipboard.write([new ClipboardItem({ 'image/png': new Blob([png], { type: 'image/png' }) })]);
      ownWriteSig = 'I' + crypto.createHash('sha1').update(png).digest('hex');
    }
    ownWriteAt = Date.now();
    lastSig = ownWriteSig;
    return true;
  } catch (err) {
    console.error('Copy clip failed:', err.message);
    return false;
  }
}

// ─── Button window ───
function createButtonWindow() {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  try {
    buttonWindow = new BrowserWindow({
      width: 50,
      height: 50,
      x: screenWidth - 60,
      y: Math.floor(screenHeight / 2) - 25,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      resizable: false,
      skipTaskbar: true,
      hasShadow: false,
      focusable: false,
      title: APP_NAME,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true
      }
    });
  } catch (err) {
    console.error('Button window failed:', err.message);
    return;
  }
  buttonWindow.loadFile(path.join(__dirname, 'renderer', 'button.html'));
  buttonWindow.setVisibleOnAllWorkspaces(true);
}

// ─── Panel window (single reused instance) ───
let panelReady = false;

function togglePanel() {
  if (panelWindow && !panelWindow.isDestroyed()) {
    panelWindow.close();
    panelWindow = null;
    return;
  }
  createPanelWindow();
}

function createPanelWindow() {
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
  const w = 420, h = 560;
  panelReady = false;
  try {
    panelWindow = new BrowserWindow({
      width: w,
      height: h,
      x: Math.floor(sw / 2) - Math.floor(w / 2),
      y: Math.floor(sh / 2) - Math.floor(h / 2),
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      resizable: false,
      skipTaskbar: true,
      hasShadow: true,
      title: APP_NAME,
      backgroundColor: '#00000000',
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true
      }
    });
  } catch (err) {
    console.error('Panel window failed:', err.message);
    panelWindow = null;
    return;
  }
  panelWindow.loadFile(path.join(__dirname, 'renderer', 'panel.html'));
  panelWindow.setVisibleOnAllWorkspaces(true);
  panelWindow.webContents.once('did-finish-load', () => {
    panelReady = true;
    sendClips();
  });
  panelWindow.on('closed', () => {
    panelWindow = null;
    panelReady = false;
  });
}

function sendClips() {
  if (panelWindow && !panelWindow.isDestroyed() && panelReady) {
    try {
      panelWindow.webContents.send('load-clips', publicClips());
    } catch { /* best effort */ }
  }
  updateTrayMenu();
}

// ─── Tray ───
function createTray() {
  try {
    tray = new Tray(path.join(__dirname, 'assets', 'icon.png'));
    updateTrayMenu();
    tray.setToolTip(APP_NAME);
    tray.on('click', togglePanel);
  } catch (err) {
    console.error('Tray failed:', err.message);
  }
}

function updateTrayMenu() {
  if (!tray || tray.isDestroyed()) return;
  try {
    buildTrayMenu();
  } catch (err) {
    console.error('Tray menu failed:', err.message);
  }
}

function buildTrayMenu() {
  const settings = getSettings();
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Open ClipTap (Ctrl+Shift+V)', click: togglePanel },
    {
      label: 'Pause monitoring',
      type: 'checkbox',
      checked: !settings.monitoring,
      click: (item) => saveSettings({ ...getSettings(), monitoring: !item.checked })
    },
    {
      label: 'Launch at login',
      type: 'checkbox',
      checked: !!settings.launchAtLogin,
      click: (item) => {
        saveSettings({ ...getSettings(), launchAtLogin: item.checked });
        try { app.setLoginItemSettings({ openAtLogin: item.checked }); } catch {}
      }
    },
    {
      label: 'Max items',
      submenu: [25, 50, 100, 200].map(n => ({
        label: String(n),
        type: 'radio',
        checked: (settings.maxItems || 50) === n,
        click: () => { saveSettings({ ...getSettings(), maxItems: n }); enforceLimit(); persistClips(); sendClips(); }
      }))
    },
    { type: 'separator' },
    { label: `Clips: ${clips.length}`, enabled: false },
    { label: 'Clear history', click: clearHistory },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() }
  ]));
}

function clearHistory() {
  for (const c of clips) {
    if (!c.pinned) deleteImageFile(c);
  }
  clips = clips.filter(c => c.pinned);
  lastSig = null;
  persistClips();
  sendClips();
}

// ─── App ───
app.whenReady().then(() => {
  loadClips();
  const s = getSettings();
  try { app.setLoginItemSettings({ openAtLogin: !!s.launchAtLogin }); } catch {}

  createButtonWindow();
  createTray();

  globalShortcut.register('Ctrl+Shift+V', togglePanel);

  setInterval(pollClipboard, POLL_MS);

  ipcMain.on('toggle-panel', togglePanel);
  ipcMain.on('close-panel', () => {
    if (panelWindow && !panelWindow.isDestroyed()) {
      panelWindow.close();
      panelWindow = null;
    }
  });

  ipcMain.on('get-clips', (event) => {
    event.returnValue = publicClips();
  });

  ipcMain.on('get-images-dir', (event) => {
    event.returnValue = imagesDir();
  });

  ipcMain.on('copy-clip', (event, id) => {
    if (!Number.isInteger(id)) return;
    copyClip(id);
  });

  ipcMain.on('delete-clip', (event, id) => {
    if (!Number.isInteger(id)) return;
    const i = clips.findIndex(c => c.id === id);
    if (i === -1) return;
    deleteImageFile(clips[i]);
    clips.splice(i, 1);
    persistClips();
    sendClips();
  });

  ipcMain.on('toggle-pin', (event, id) => {
    if (!Number.isInteger(id)) return;
    const clip = clips.find(c => c.id === id);
    if (!clip) return;
    clip.pinned = !clip.pinned;
    // pinned first, then by time
    clips.sort((a, b) => (b.pinned - a.pinned) || (b.time - a.time));
    persistClips();
    sendClips();
  });

  ipcMain.on('clear-history', clearHistory);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception (contained):', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection (contained):', reason);
});

app.on('render-process-gone', (event, webContents, details) => {
  console.error('Renderer gone:', details && details.reason);
  if (buttonWindow && webContents === buttonWindow.webContents) {
    try { buttonWindow.destroy(); } catch { /* dead */ }
    buttonWindow = null;
    try { createButtonWindow(); } catch (err) {
      console.error('Button rebuild failed:', err.message);
    }
  } else if (panelWindow && webContents === panelWindow.webContents) {
    panelWindow = null;
    panelReady = false;
  }
});

app.on('window-all-closed', (e) => e.preventDefault());
app.on('will-quit', () => globalShortcut.unregisterAll());
