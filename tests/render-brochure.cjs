// Rebuild the customer-facing PDF using the existing Docker browser and brand fonts.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');

const website = path.resolve(__dirname, '..');
const fontRoot = path.resolve(__dirname, '../../brand/fonts');
const fonts = [
  ['Plus Jakarta Sans', 'plus-jakarta-sans/PlusJakartaSans-Variable.ttf'],
  ['Inter', 'inter/Inter-Variable.ttf'],
  ['Geist Mono', 'geist-mono/GeistMono-Variable.ttf'],
];
const types = { '.html': 'text/html', '.css': 'text/css', '.svg': 'image/svg+xml', '.ttf': 'font/ttf' };
const server = http.createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const root = pathname.startsWith('/__fonts/') ? fontRoot : website;
  const file = path.resolve(root, `.${pathname.replace(/^\/__fonts/, '')}`);
  if (!file.startsWith(`${root}${path.sep}`)) { res.writeHead(403).end(); return; }
  try {
    const body = await fs.readFile(file);
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }).end(body);
  } catch { res.writeHead(404).end(); }
});

(async () => {
  let browser;
  try {
    for (const [, file] of fonts) await fs.access(path.join(fontRoot, file));
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const origin = `http://127.0.0.1:${server.address().port}`;
    const css = fonts.map(([family, file]) => `@font-face { font-family: '${family}'; src: url('${origin}/__fonts/${file}'); font-weight: 100 900; font-style: normal; }`).join('\n');
    browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.hostname === 'fonts.googleapis.com') return route.fulfill({ contentType: 'text/css', body: css });
      return url.origin === origin ? route.continue() : route.abort();
    });
    await page.goto(`${origin}/benchmarking-brochure.html`);
    await page.emulateMedia({ media: 'print' });
    await page.evaluate(() => document.fonts.ready);
    const fontState = await page.evaluate(() => [...document.fonts].map(font => ({ family: font.family, status: font.status })));
    assert.equal(fontState.length, 3, 'All three brand font families must be registered');
    assert.ok(fontState.every(font => font.status === 'loaded'), 'All brand fonts must load before export');
    const height = await page.locator('.brochure-page').evaluate(el => el.getBoundingClientRect().height);
    assert.ok(height <= 1056, `Brochure exceeds one US Letter page (${height}px)`);
    const output = path.join(website, 'assets/cohi-benchmarking.pdf');
    await page.pdf({ path: output, printBackground: true, preferCSSPageSize: true, tagged: true });
    console.log(`Exported one-page brochure: ${output}`);
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
