// Browser smoke for the Home Run toy (toys/home-run.html) and Endless Night in
// 3D (night.html). Boots the Vite dev server, plays both through their test
// hooks (window.__toy / __night, ...Skip, ...Give) and fails on any page error
// or a rule that stops holding. It guards the rules core (DEV-66): the toy must
// play the same while its rules move into src/game, and the 3D view must step
// the same run.
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
  const waitFor = async (pred, what, ms = 8000, read = st) => {
    const t0 = Date.now();
    for (;;) {
      const s = await read();
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
  // The dark reserve runs out mid-night (owner, 2026-10-05: "B for contract"): the
  // night ends stranded, and with quota met the contract goes on to the shop.
  await page.evaluate(() => window.__toyCatch());
  s = await waitFor((q) => q.phase === 'shop', 'a stranded night with quota met to reach the shop');
  check(s.strandedNights === 1 && s.totalBanked === 25, `an empty reserve should strand the night: stranded ${s.strandedNights}, banked ${s.totalBanked}`);
  console.log(`contract OK: night ${s.night}, banked ${s.totalBanked}, an empty reserve stranded the night and the contract went on`);

  // Endless Night 3D: the same run, drawn in Three.js.
  const nt = () => page.evaluate(() => window.__night());
  const waitN = (pred, what, ms = 8000) => waitFor(pred, what, ms, nt);
  await page.goto(`${base}/night.html`);
  await waitN((q) => q.phase === 'title', 'the 3D title screen', 15000);
  await page.click('#start');
  s = await waitN((q) => q.phase === 'play', 'the 3D run to start');
  check(s.ringR === 1750 && s.seamViews === s.seams && s.seams === 16, `a fresh 3D run: ringR ${s.ringR}, seams ${s.seams}, drawn ${s.seamViews}`);
  check(s.rocks > 0 && s.terrainMeshes > 0, `a fresh 3D map should have terrain drawn: ${s.rocks} rocks, ${s.terrainMeshes} meshes`);
  await start3d();
  await page.evaluate(() => window.__nightSkip(20));
  s = await nt();
  check(s.ringR < 1500, `20 s should close the night: ringR ${s.ringR}`);
  await page.evaluate(() => window.__nightGive(20));
  s = await waitN((q) => q.banked >= 20, 'a bank at home in 3D');
  check(s.mult === 2 && s.score === 20 && s.pushBank > 50 && s.seamViews === s.seams, `a 3D bank: mult ${s.mult}, score ${s.score}, pushBank ${s.pushBank}, seams ${s.seams} drawn ${s.seamViews}`);
  const pushed = s.pushBank;
  await page.evaluate(() => window.__nightGive(140));
  await waitN((q) => q.phase === 'over', '3D dawn');
  runs = await page.evaluate(() => JSON.parse(localStorage.getItem('mm-toy-runs-v1') || '[]'));
  check(runs.at(-1)?.mode === 'endless:3d' && runs.at(-1)?.result === 'dawn', `3D dawn logged as ${runs.at(-1)?.mode} ${runs.at(-1)?.result}`);
  // A second run: drive out laying road, then END.
  await page.waitForSelector('#again', { state: 'visible' });
  await page.click('#again');
  await waitN((q) => q.phase === 'play' && !q.started, 'a second 3D run');
  await page.keyboard.down('w');
  await delay(1500);
  await page.keyboard.up('w');
  s = await waitN((q) => q.started && Math.hypot(q.x, q.y) > 60, 'the rover to drive out');
  check(s.ribbons === s.lines, `every road line drawn: ${s.ribbons} of ${s.lines}`);
  await page.click('#end');
  await waitN((q) => q.phase === 'over', 'END in 3D');
  runs = await page.evaluate(() => JSON.parse(localStorage.getItem('mm-toy-runs-v1') || '[]'));
  check(runs.at(-1)?.result === 'quit', `3D END should log quit, logged ${runs.at(-1)?.result}`);
  const droveOut = Math.hypot(s.x, s.y);
  // A third run: drive out, put the border just inside the rover, and the dark
  // reserve runs down (on your road or off) until the run ends caught. Terrain
  // off for this one, so a rock in the way can't stop the drive out.
  await page.evaluate(() => window.__nightRulesOn({ terrain: false }));
  await page.waitForSelector('#again', { state: 'visible' });
  await page.click('#again');
  await waitN((q) => q.phase === 'play' && !q.started, 'a third 3D run');
  s = await nt();
  check(s.reserveMax === 8 && s.reserve === 8, `the 3D run should start with an 8 s reserve, got ${s.reserve}/${s.reserveMax}`);
  // Far enough out that the night can't reach home while the reserve runs down.
  await page.keyboard.down('w');
  await delay(5000);
  await page.keyboard.up('w');
  await waitN((q) => q.started && Math.hypot(q.x, q.y) > 300, 'the rover to drive out again');
  await page.evaluate(() => window.__nightDarkHere());
  s = await waitN((q) => q.inDark && q.reserve < 7.5, 'the reserve to run down in the dark');
  s = await waitN((q) => q.phase === 'over', 'the reserve to run out', 15000);
  check(s.over === 'caught' && s.darkTime > 7, `an empty reserve should end the run caught: ${s.over}, ${s.darkTime.toFixed(1)} s in the dark`);
  runs = await page.evaluate(() => JSON.parse(localStorage.getItem('mm-toy-runs-v1') || '[]'));
  check(runs.at(-1)?.result === 'caught' && runs.at(-1)?.reserveLow === 0 && runs.at(-1)?.darkSeconds > 7, `caught logged with the reserve: ${JSON.stringify(runs.at(-1))}`);
  console.log(`endless 3d OK: bank pushed ${pushed.toFixed(0)} px, dawn logged, drove out ${droveOut.toFixed(0)} px, END logged quit, reserve ran out after ${s.darkTime.toFixed(1)} s in the dark`);

  async function start3d() {
    await page.keyboard.down('w');
    await delay(80);
    await page.keyboard.up('w');
    await waitN((q) => q.started, 'the 3D run to start');
  }

  check(errors.length === 0, `page errors: ${errors.join(' | ')}`);
  console.log('TOY SMOKE OK — Home Run boots, Endless banks and wins at dawn, END logs quit, Contract banks; Endless Night 3D drives, banks, wins at dawn, ends, and runs out of dark reserve.');
  await browser.close();
  vite.kill('SIGTERM');
  process.exit(0);
} catch (e) {
  console.error('TOY SMOKE FAILED:', e.message);
  await browser?.close().catch(() => {});
  vite.kill('SIGTERM');
  process.exit(1);
}
