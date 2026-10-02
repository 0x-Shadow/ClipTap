import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('cliptap', {
  getClips: () => ipcRenderer.invoke('clips:get'),
  deleteClip: (id) => ipcRenderer.invoke('clips:delete', id),
  clearAll: () => ipcRenderer.invoke('clips:clear'),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),
  wipeData: () => ipcRenderer.invoke('data:wipe'),
  onClipsUpdated: (callback) => ipcRenderer.on('clips:updated', callback),
  onShortcutConflict: (callback) => ipcRenderer.on('shortcut:conflict', callback),
});
