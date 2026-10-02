// Browser smoke for the Home Run toy (toys/home-run.html). Boots the Vite dev
// server, plays both modes through the toy's test hooks (window.__toy,
// __toySkip, __toyGive) and fails on any page error or a rule that stops
// holding. It guards the rules-core extraction (DEV-66): the toy must play the
// same while its rules move into src/game.
//
//   npm run smoke:toys            (CHROME_PATH=... to pick a Chromium)
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
const base = `http://127.0.0.1:${port}`;
const vite = spawn('npx', ['vite', '--host', '127.0.0.1', '--port', String(port)], { cwd: PROJECT_ROOT, stdio: 'ignore' });

let browser;
const check = (ok, msg) => {
  if (!ok) throw new Error(msg);
};

try {
  await waitForHttp(`${base}/toys/home-run.html`);
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
  const page = await browser.newPage({ viewport: { width: 402, height: 812 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  const st = () => page.evaluate(() => window.__toy());
  const waitFor = async (pred, what, ms = 8000) => {
    const t0 = Date.now();
    for (;;) {
      const s = await st();
      if (pred(s)) return s;
      if (Date.now() - t0 > ms) throw new Error(`timed out waiting for ${what}: ${JSON.stringify({ phase: s.phase, banked: s.banked, carry: s.carry })}`);
      await delay(50);
    }
  };
  const start = async () => {
    await page.keyboard.down('w');
    await delay(80);
    await page.keyboard.up('w');
    await waitFor((s) => s.started, 'the run to start');
  };
  // The cards sit at fixed spots on a 402x812 screen (titleLayout in homeRun.ts).
  const ENDLESS = { x: 200, y: 390 };
  const CONTRACT = { x: 200, y: 265 };
  const END = { x: 40, y: 80 };

  await page.goto(`${base}/toys/home-run.html`);
  await waitFor((s) => s.phase === 'title', 'the title screen');

  // Endless: the clock closes, a bank pushes it back, dawn wins at dawnOre.
  await page.mouse.click(ENDLESS.x, ENDLESS.y);
  let s = await waitFor((q) => q.phase === 'play' && q.mode === 'endless', 'Endless to start');
  check(s.ringR === 1750, `the night should start at 1750, got ${s.ringR}`);
  await start();
  await page.evaluate(() => window.__toySkip(20));
  s = await st();
  check(s.ringR < 1500 && s.closing > 12, `20 s should close the night and heat it: ringR ${s.ringR}, closing ${s.closing}`);
  const before = s.ringR;
  await page.evaluate(() => window.__toyGive(20));
  s = await waitFor((q) => q.banked >= 20, 'a bank at home');
  check(s.mult === 2 && s.score === 20, `a bank at x1 scores 20 and raises the multiplier: mult ${s.mult}, score ${s.score}`);
  check(s.pushBank > 50, `a bank should push the night back: pushBank ${s.pushBank}`);
  await waitFor((q) => q.ringPush < 1, 'the push to play out');
  s = await st();
  check(s.ringR > before, `the border should end farther out than before the bank: ${s.ringR} vs ${before}`);
  await page.evaluate(() => window.__toyGive(140));
  s = await waitFor((q) => q.phase === 'over', 'dawn');
  let runs = await page.evaluate(() => JSON.parse(localStorage.getItem('mm-toy-runs-v1') || '[]'));
  check(runs.at(-1)?.result === 'dawn', `banking 160 should win at dawn, logged ${runs.at(-1)?.result}`);
  check(runs.at(-1)?.dawnOre === 150, `the run log should carry dawnOre 150, got ${runs.at(-1)?.dawnOre}`);
  console.log(`endless OK: night ${before.toFixed(0)} after 20 s, banks pushed ${s.pushBank.toFixed(0)} px in all, dawn at banked ${s.banked}`);

  // END ends a run cleanly and logs it as quit.
  await delay(1000); // the end banner ignores taps for 0.8 s
  await page.mouse.click(200, 400);
  await waitFor((q) => q.phase === 'title', 'the title screen after dawn');
  await page.mouse.click(ENDLESS.x, ENDLESS.y);
  await waitFor((q) => q.phase === 'play', 'a second Endless run');
  await start();
  await page.mouse.click(END.x, END.y);
  await waitFor((q) => q.phase === 'over', 'END to end the run');
  runs = await page.evaluate(() => JSON.parse(localStorage.getItem('mm-toy-runs-v1') || '[]'));
  check(runs.at(-1)?.result === 'quit', `END should log quit, logged ${runs.at(-1)?.result}`);
  console.log('end button OK: logged quit');

  // Contract: night 1 starts, its quota shows, a bank counts toward it.
  await delay(1000);
  await page.mouse.click(200, 400);
  await waitFor((q) => q.phase === 'title', 'the title screen after END');
  await page.mouse.click(CONTRACT.x, CONTRACT.y);
  s = await waitFor((q) => q.phase === 'play' && q.mode === 'contract', 'Contract to start');
  check(s.night === 1, `a contract starts on night 1, got ${s.night}`);
  await start();
  await page.evaluate(() => window.__toyGive(25));
  s = await waitFor((q) => q.banked >= 25, 'a contract bank');
  check(s.mult === 1 && s.score === 0, `Contract has no multiplier or score: mult ${s.mult}, score ${s.score}`);
  console.log(`contract OK: night ${s.night}, banked ${s.banked}`);

  check(errors.length === 0, `page errors: ${errors.join(' | ')}`);
  console.log('TOY SMOKE OK — Home Run boots, Endless banks and wins at dawn, END logs quit, Contract banks.');
  await browser.close();
  vite.kill('SIGTERM');
  process.exit(0);
} catch (e) {
  console.error('TOY SMOKE FAILED:', e.message);
  await browser?.close().catch(() => {});
  vite.kill('SIGTERM');
  process.exit(1);
}
