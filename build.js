import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function build() {
  await esbuild.build({
    entryPoints: ['src/main/index.js', 'src/preload/index.js'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    external: ['electron'],
    outdir: 'dist',
    format: 'esm',
  });

  const rendererSrc = path.join(__dirname, 'src', 'renderer');
  const rendererDst = path.join(__dirname, 'dist', 'renderer');
  fs.mkdirSync(rendererDst, { recursive: true });
  for (const file of fs.readdirSync(rendererSrc)) {
    fs.copyFileSync(path.join(rendererSrc, file), path.join(rendererDst, file));
  }
}

build().catch(() => process.exit(1));
