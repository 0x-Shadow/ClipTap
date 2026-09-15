const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('clipAPI', {
  togglePanel: () => ipcRenderer.send('toggle-panel'),
  closePanel: () => ipcRenderer.send('close-panel'),
  getClips: () => ipcRenderer.sendSync('get-clips'),
  getImagesDir: () => ipcRenderer.sendSync('get-images-dir'),
  copyClip: (id) => ipcRenderer.send('copy-clip', id),
  deleteClip: (id) => ipcRenderer.send('delete-clip', id),
  togglePin: (id) => ipcRenderer.send('toggle-pin', id),
  clearHistory: () => ipcRenderer.send('clear-history'),
  onClips: (cb) => ipcRenderer.on('load-clips', (e, clips) => cb(clips))
});
