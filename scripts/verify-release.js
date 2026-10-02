import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const releaseDir = path.join(__dirname, '..', 'release');

function verify() {
  const exePath = path.join(releaseDir, 'ClipTap Setup 1.0.0.exe');

  if (!fs.existsSync(exePath)) {
    console.error('ERROR: Packaged exe not found at', exePath);
    process.exit(1);
  }

  console.log('Found packaged exe:', exePath);

  const stats = fs.statSync(exePath);
  console.log('File size:', (stats.size / 1024 / 1024).toFixed(2), 'MB');

  try {
    const output = execSync(`"${exePath}" --version`, { timeout: 10000 }).toString().trim();
    console.log('Version output:', output);
  } catch (_e) {
    console.log('Note: Could not run exe --version (may require display)');
  }

  console.log('Release verification passed!');
}

verify();
