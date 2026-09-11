import QRCode from 'qrcode';

export function pageUrl(value) {
  let url;
  try { url = new URL(value); } catch { throw new Error('Open a website first, then try again.'); }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Open a website first, then try again.');
  }
  // Keep the original string, including query parameters and fragments.
  return value;
}

export function createQr(value) {
  const url = pageUrl(value);
  try { return QRCode.create(url, { errorCorrectionLevel: 'M' }); }
  catch { throw new Error('This link is too long for a QR code. Try a shorter link.'); }
}

export function drawQr(canvas, code, pixelRatio = 1) {
  const quietZone = 4;
  const size = code.modules.size;
  const scale = Math.max(1, Math.ceil(280 * pixelRatio / (size + quietZone * 2)));
  canvas.width = canvas.height = (size + quietZone * 2) * scale;
  canvas.style.width = '280px';
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#000';
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (code.modules.get(y, x)) ctx.fillRect((x + quietZone) * scale, (y + quietZone) * scale, scale, scale);
    }
  }
}
