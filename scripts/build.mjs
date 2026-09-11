import { cp, mkdir, copyFile, readFile, writeFile } from 'node:fs/promises';
import { build } from 'esbuild';

const firefox = process.argv.includes('--firefox');
const out = firefox ? 'build/firefox' : 'dist';
await mkdir(out, { recursive: true });
await cp('extension', out, { recursive: true });
await build({ entryPoints: ['src/popup.js'], outfile: `${out}/popup.js`, bundle: true, minify: true, platform: 'browser', target: firefox ? ['firefox140'] : ['safari15'] });
await copyFile('node_modules/qrcode/license', `${out}/QRCODE-LICENSE.txt`);
if (firefox) {
  const manifest = JSON.parse(await readFile('extension/manifest.json', 'utf8'));
  manifest.browser_specific_settings = {
    gecko: {
      id: 'site-qr@site-qr.local',
      strict_min_version: '142.0',
      data_collection_permissions: { required: ['none'] },
    },
  };
  await writeFile(`${out}/manifest.json`, `${JSON.stringify(manifest, null, 2)}\n`);
}
