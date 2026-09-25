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

  // Phone layout: the HUD wraps on a narrow screen, and the objective line must
  // sit under it, not over its readouts (DEV-56).
  const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  phone.on('pageerror', (e) => errors.push(String(e)));
  await phone.goto(url, { waitUntil: 'load' });
  await delay(1800);
  const covered = await phone.evaluate(() => {
    const line = document.getElementById('line');
    if (!line || !line.textContent) return null;
    const l = line.getBoundingClientRect();
    return [...document.querySelectorAll('#hud .vital, #hud .chip')]
      .filter((e) => {
        const r = e.getBoundingClientRect();
        return r.left < l.right && r.right > l.left && r.top < l.bottom && r.bottom > l.top;
      })
      .map((e) => e.querySelector('b')?.textContent ?? e.id);
  });
  if (covered === null) fail('phone: objective line did not render');
  if (covered.length) fail(`phone: objective line covers HUD readouts: ${covered.join(', ')}`);
  await phone.close();

  // Run capture (DEV-61): end the run by running out the sun, then a run record
  // must be saved and the banner must offer to send it. This is the check that
  // was missing every previous time run data quietly disappeared.
  await page.evaluate(() => {
    window.__mm3d.getState().solarSeconds = 0.05;
  });
  await page.waitForFunction(() => window.__mm3d.getState().phase !== 'playing', null, { timeout: 15000 });
  await delay(300);
  const capture = await page.evaluate(() => {
    const runs = window.__mm3d.runs?.() ?? [];
    const btn = document.getElementById('send-runs');
    const url = window.__mm3d.runIssue?.()?.url ?? '';
    return {
      saved: runs.length,
      seed: runs[runs.length - 1]?.seed,
      worldSeed: window.__mm3d.getState().seed,
      button: Boolean(btn && btn.offsetParent !== null && !btn.disabled),
      url
    };
  });
  if (!capture.saved) fail('run capture: no run record saved after the run ended');
  if (capture.seed !== capture.worldSeed) fail(`run capture: saved record is for ${capture.seed}, not this run (${capture.worldSeed})`);
  if (!capture.button) fail('run capture: the Send run data button is not shown on the end banner');
  if (!capture.url.startsWith('https://github.com/') || !decodeURIComponent(capture.url).includes('```json moon-miner-runs')) {
    fail('run capture: the GitHub issue URL is missing or has no run data block');
  }

  if (errors.length) fail(`page errors:\n${errors.join('\n')}`);

  console.log(`SMOKE OK — booted clean, HUD up, rover drove ${moved.toFixed(0)} units, phone HUD clear, run captured.`);
  await browser.close();
  vite.kill('SIGTERM');
  process.exit(0);
} catch (err) {
  console.error(`SMOKE FAILED — ${err.message}`);
  if (browser) await browser.close().catch(() => {});
  vite.kill('SIGTERM');
  process.exit(1);
}
