import { readFile, writeFile } from 'node:fs/promises';
import { Resvg } from '@resvg/resvg-js';

// Keep the native app artwork derived from the same SVG as the toolbar.
const source = await readFile('extension/icon.svg', 'utf8');
const glyph = source.replace(/<svg\b[^>]*>/, '').replace(/<\/svg>\s*$/, '');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect x="64" y="64" width="896" height="896" rx="200" fill="#202020"/>
  <g transform="translate(192,192) scale(26.6666667,26.6666667)" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${glyph}</g>
</svg>`;
const root = 'safari/Site QR/Site QR';
const catalog = `${root}/Assets.xcassets/AppIcon.appiconset`;
const { images } = JSON.parse(await readFile(`${catalog}/Contents.json`, 'utf8'));
for (const entry of [...images, { filename: '../../Resources/Icon.png', size: '256x256', scale: '2x' }]) {
  const pixels = Number(entry.size.split('x')[0]) * Number(entry.scale.replace('x', ''));
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: pixels } }).render().asPng();
  await writeFile(`${catalog}/${entry.filename}`, png);
}
