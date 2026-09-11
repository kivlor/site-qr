import test from 'node:test';
import assert from 'node:assert/strict';
import jsQR from 'jsqr';
import { createQr, drawQr } from '../src/qr.js';

// Decode the rendered pixels with an independent QR implementation.
for (const url of [
  'https://example.com/',
  'https://example.com/a?token=a%2Bb&other=one+two#section-2',
  'https://example.com/こんにちは?q=café&emoji=🎉',
  `https://example.com/?q=${'abcdef0123456789'.repeat(100)}`,
]) {
  test(`QR preserves ${url.slice(0, 75)}`, () => {
    let pixels;
    const canvas = {
      style: {},
      getContext() {
        pixels = new Uint8ClampedArray(canvas.width * canvas.height * 4);
        return {
          fillStyle: '#fff',
          fillRect(x, y, width, height) {
            const color = this.fillStyle === '#fff' ? 255 : 0;
            for (let row = y; row < y + height; row++) {
              for (let col = x; col < x + width; col++) {
                const i = (row * canvas.width + col) * 4;
                pixels.set([color, color, color, 255], i);
              }
            }
          },
        };
      },
    };
    drawQr(canvas, createQr(url), 2);
    assert.equal(jsQR(pixels, canvas.width, canvas.height)?.data, url);
  });
}

test('unsupported tabs give a useful message', () => {
  for (const url of [undefined, '', 'about:blank', 'file:///tmp/a.html', 'javascript:alert(1)']) {
    assert.throws(() => createQr(url), /Open a website first/);
  }
});

test('oversized links give a useful message', () => {
  assert.throws(() => createQr(`https://example.com/?q=${'a'.repeat(5000)}`), /too long/);
});
