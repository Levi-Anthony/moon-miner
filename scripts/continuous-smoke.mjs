// Browser smoke for the 3D Moon Miner build. Boots the Vite dev server, loads
// the app in headless Chromium, drives the rover via the real sim, and asserts
// the core loop is wired: the app boots without console/page errors, the HUD
// renders, and driving actually moves the rover. (The old Phaser-scene smoke
// was retired with the substrate flip; this replaces it.)
import { spawn } from 'node:child_process';
import net from 'node:net';
import http from 'node:http';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const PROJECT_ROOT = fileURLToPath(new URL('..', import.meta.url));

function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

async function waitForHttp(url, attempts = 200) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
          res.resume();
          resolve();
        });
        req.on('error', reject);
      });
      return;
    } catch {
      await delay(400);
    }
  }
  throw new Error('dev server did not come up');
}

const port = await freePort();
const url = `http://127.0.0.1:${port}/`;
const vite = spawn('npx', ['vite', '--host', '127.0.0.1', '--port', String(port)], {
  cwd: PROJECT_ROOT,
  stdio: 'ignore'
});

let browser;
const fail = (msg) => {
  throw new Error(msg);
};

try {
  await waitForHttp(url);
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || undefined,
    headless: true,
    args: [
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader',
      '--disable-dev-shm-usage',
      '--no-sandbox',
      '--mute-audio'
    ]
  });
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`);
  });

  await page.goto(url, { waitUntil: 'load' });
  await delay(1800);

  // HUD present.
  const hasHud = await page.evaluate(() => Boolean(document.getElementById('hud-ore') && document.getElementById('launch')));
  if (!hasHud) fail('HUD did not render');

  // The sim is live and playing.
  const before = await page.evaluate(() => {
    const api = window.__mm3d;
    if (!api) return null;
    const s = api.getState();
    return { x: s.rover.x, y: s.rover.y, phase: s.phase };
  });
  if (!before) fail('window.__mm3d not exposed');
  if (before.phase !== 'playing') fail(`expected phase 'playing', got '${before.phase}'`);

  // Driving moves the rover.
  await page.keyboard.down('w');
  await delay(4000);
  await page.keyboard.up('w');
  const after = await page.evaluate(() => {
    const s = window.__mm3d.getState();
    return { x: s.rover.x, y: s.rover.y };
  });
  const moved = Math.hypot(after.x - before.x, after.y - before.y);
  if (moved < 20) fail(`driving did not move the rover (moved ${moved.toFixed(1)} units)`);

  if (errors.length) fail(`page errors:\n${errors.join('\n')}`);

  console.log(`SMOKE OK — booted clean, HUD up, rover drove ${moved.toFixed(0)} units.`);
  await browser.close();
  vite.kill('SIGTERM');
  process.exit(0);
} catch (err) {
  console.error(`SMOKE FAILED — ${err.message}`);
  if (browser) await browser.close().catch(() => {});
  vite.kill('SIGTERM');
  process.exit(1);
}
