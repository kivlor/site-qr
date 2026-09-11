import { pageUrl, createQr, drawQr } from './qr.js';

const status = document.querySelector('#status');
const canvas = document.querySelector('#qr');
const site = document.querySelector('#site');

async function showPage() {
  let tab;
  try {
    [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  } catch {
    status.textContent = 'Couldn’t read this tab. Reopen the popup and try again.';
    return;
  }
  try {
    const url = pageUrl(tab?.url);
    drawQr(canvas, createQr(url), window.devicePixelRatio);
    canvas.hidden = false;
    site.textContent = new URL(url).hostname;
    site.title = url;
    site.hidden = false;
    status.textContent = 'Scan with your phone’s camera.';
  } catch (error) {
    status.textContent = error.message;
  }
}

showPage();
