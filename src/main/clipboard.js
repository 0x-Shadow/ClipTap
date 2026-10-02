import { clipboard } from 'electron';
import { hashContent } from './dedup.js';

let lastHash = null;
let intervalId = null;

export function startPolling(intervalMs, onNewClip) {
  stopPolling();
  intervalId = setInterval(() => {
    pollOnce(onNewClip);
  }, intervalMs);
}

export function stopPolling() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

export function pollOnce(onNewClip) {
  try {
    const text = clipboard.readText();
    if (text && text.trim()) {
      const hash = hashContent(text);
      if (hash !== lastHash) {
        lastHash = hash;
        onNewClip({ type: 'text', content: text, hash });
        return;
      }
    }
    const image = clipboard.readImage();
    if (!image.isEmpty()) {
      const png = image.toPNG();
      const hash = hashContent(png);
      if (hash !== lastHash) {
        lastHash = hash;
        onNewClip({ type: 'image', content: png.toString('base64'), hash });
      }
    }
  } catch (_e) {
    // clipboard read can fail transiently
  }
}
