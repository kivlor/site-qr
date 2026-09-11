import { cp, mkdir, copyFile } from 'node:fs/promises';
import { build } from 'esbuild';

await mkdir('dist', { recursive: true });
await cp('extension', 'dist', { recursive: true });
await build({ entryPoints: ['src/popup.js'], outfile: 'dist/popup.js', bundle: true, minify: true, platform: 'browser', target: ['safari15'] });
await copyFile('node_modules/qrcode/license', 'dist/QRCODE-LICENSE.txt');
