// Smoke-Test: wichtigste Screens laden, Konsolenfehler sammeln, Screenshots (375 px) in Hell und Dunkel.
// Aufruf: node scripts/smoke-test.mjs [Ausgabeordner]   (startet selbst einen lokalen Server)
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = fileURLToPath(new URL('../', import.meta.url));
const out = process.argv[2] || join(root, '.smoke');
await mkdir(out, { recursive: true });

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
const server = createServer(async (req, res) => {
  try {
    const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
    const file = join(root, path.endsWith('/') ? path + 'index.html' : path);
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}/`;

const errors = [];
const browser = await chromium.launch();
const SCREENS = [
  ['onboarding-1', '#/onboarding/1', false],
  ['onboarding-2', '#/onboarding/2', false],
  ['onboarding-3', '#/onboarding/3', false],
  ['entdecken', '#/feed', true],
  ['artikel', '#/article/black-holes?len=10', true],
  ['merkliste', '#/saved', true],
  ['fortschritt', '#/progress', true],
  ['einstellungen', '#/settings', true]
];

for (const scheme of ['dark', 'light']) {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, colorScheme: scheme, locale: 'de-DE' });
  const page = await ctx.newPage();
  page.on('console', (m) => m.type() === 'error' && errors.push(`[${scheme}] ${m.text()}`));
  page.on('pageerror', (e) => errors.push(`[${scheme}] ${e.message}`));
  for (const [name, hash, onboarded] of SCREENS) {
    await page.goto(base + 'index.html');
    await page.evaluate((o) => {
      const s = {
        onboarded: o, lang: 'de', favorites: o ? ['black-holes'] : [],
        progress: o ? { 'black-holes': { 10: { status: 'started', scroll: 0.3 } } } : {},
        history: o ? [{ id: 'black-holes', len: 10, at: new Date(Date.now() - 864e5).toISOString(), minutes: 10, mode: 'listen' }, { id: 'black-holes', len: 5, at: new Date().toISOString(), minutes: 5, mode: 'read' }] : []
      };
      localStorage.setItem('brainbite:v1', JSON.stringify(s));
    }, onboarded);
    await page.goto(base + 'index.html' + hash);
    await page.waitForTimeout(600);
    if (name === 'artikel') await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: join(out, `${scheme}-${name}.png`) });
  }
  await ctx.close();
}

await browser.close();
server.close();
if (errors.length) {
  console.error('✗ Konsolenfehler:\n- ' + errors.join('\n- '));
  process.exit(1);
}
console.log(`✓ ${SCREENS.length * 2} Screens ohne Konsolenfehler. Screenshots in ${out}`);
