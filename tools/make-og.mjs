// Draws the 1200 x 630 social preview (src/assets/og.png) in the site's own
// style, using the built fonts. Run `npm run build` first, then `npm run og`.
// The PNG is committed, so CI does not need to run this.
import { existsSync, writeFileSync, rmSync } from 'node:fs';
import puppeteer from 'puppeteer-core';
import { serve } from './serve.mjs';
import { mulberry32, buildNetwork, nearest } from '../src/js/lib/network-math.js';

const PORT = Number(process.env.PORT || 4353);
const chrome = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome']
  .find((p) => p && existsSync(p));
if (!chrome) throw new Error('Chrome not found. Set CHROME_PATH.');

const net = buildNetwork(46, 1200, 630, mulberry32(20250620));
const you = { x: 1010, y: 470 };
const lines = net.edges.map(([a, b]) => `<line x1="${net.nodes[a].x.toFixed(0)}" y1="${net.nodes[a].y.toFixed(0)}" x2="${net.nodes[b].x.toFixed(0)}" y2="${net.nodes[b].y.toFixed(0)}"/>`).join('');
const dots = net.nodes.map((n) => `<circle cx="${n.x.toFixed(0)}" cy="${n.y.toFixed(0)}" r="${(n.r * 1.3).toFixed(1)}" fill="${n.accent ? '#fa2d1a' : '#182748'}"/>`).join('');
const mine = nearest(net.nodes, you.x, you.y, 5).map((i) => `<line x1="${you.x}" y1="${you.y}" x2="${net.nodes[i].x.toFixed(0)}" y2="${net.nodes[i].y.toFixed(0)}"/>`).join('');

const html = `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="css/styles.css"><style>
  html, body { width: 1200px; height: 630px; overflow: hidden; }
  .og { position: relative; width: 1200px; height: 630px; padding: 70px 44px 0; }
  .og h1 { font-family: var(--display); font-weight: 900; font-stretch: 50%; text-transform: uppercase; }
  .og svg.net { position: absolute; inset: 0; mix-blend-mode: multiply; }
  .og .tape { z-index: 2; position: absolute; inset: 0 0 auto 0; height: 54px; padding: 0 44px; display: flex; align-items: center; justify-content: space-between; background: var(--navy); color: var(--cream); font: 600 22px var(--body); }
  .og .tape b { font: 900 34px var(--display); font-stretch: 62%; text-transform: uppercase; }
</style></head><body><div class="og">
  <div class="tape"><b>Exortium</b><span>A concept agency. Team, clients and results are illustrative.</span></div>
  <h1 class="fit">
    <span class="fit__line" style="--k:.2060">We connect you</span>
    <span class="fit__line band" style="--k:.2232">to clients who</span>
    <span class="fit__line" style="--k:.1945">weren&rsquo;t looking.</span>
  </h1>
  <svg class="net" viewBox="0 0 1200 630" width="1200" height="630">
    <g stroke="#182748" stroke-width="1.6" opacity=".55">${lines}</g>
    <g stroke="#fa2d1a" stroke-width="4" stroke-linecap="round">${mine}</g>
    ${dots}
    <circle cx="${you.x}" cy="${you.y}" r="17" fill="#fa2d1a"/>
    <circle cx="${you.x + 4}" cy="${you.y + 4}" r="17" fill="none" stroke="#182748" stroke-width="3"/>
  </svg>
</div></body></html>`;

const server = await serve('dist', PORT, '/');
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  writeFileSync('dist/og.html', html); // served from dist so the fonts and stylesheet resolve
  await page.goto(`http://127.0.0.1:${PORT}/og.html`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: 'src/assets/og.png', type: 'png', optimizeForSpeed: false });
  console.log('Wrote src/assets/og.png');
} finally {
  rmSync('dist/og.html', { force: true });
  await browser.close();
  server.close();
}
