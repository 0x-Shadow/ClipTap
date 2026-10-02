import fs from 'fs';
import path from 'path';

export function wipeAllData(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    try {
      fs.unlinkSync(filePath);
    } catch (_e) {
      // ignore individual file errors
    }
  }
}
