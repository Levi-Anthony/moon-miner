// Plays complete levels in the real build, through the real input path, and
// reports what actually happened.
//
// The self-play routes in src/game/continuousSelfPlay.ts follow scripted
// waypoints in a headless simulation. Useful, but it cannot answer "is this
// playable" or "what does a level ask of a player", because it never touches
// the browser, the render loop, or the keyboard. This drives the shipped 3D
// game with held keys and reads the same state the HUD is drawn from, through
// `window.__mm3d` (src/three/bootstrap.ts).
//
//   node scripts/playthrough.mjs [--levels 3] [--campaigns 1] [--seed <seed>]
//                                [--reserve 1.6] [--greed 1] [--timeout 480]
//                                [--json] [--dump-runs runs.json]
//
// Each campaign starts from cleared campaign storage (level 1, fresh seed, or
// --seed), plays a level to its banner, records it, then presses R for the
// next level (or the retry, if the level was missed).
//
// The headless sim runs slower than real time: frames are slow under
// SwiftShader and the loop caps dt at 0.05 s, so a 45 s sun can take several
// wall-clock minutes. The small default viewport keeps frames cheap.
import { spawn } from 'node:child_process';
import { existsSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const PROJECT_ROOT = fileURLToPath(new URL('..', import.meta.url));
// Campaign storage owned by src/three/loop.ts. Clearing it starts a new game at
// level 1; the panel's tuning (mm3d-config-v1) is left alone on purpose, so a
// run measures whatever the build ships with unless the caller changed it.
const CAMPAIGN_KEYS = ['mm3d-campaign-v1', 'mm3d-level-v1', 'mm3d-seed-v1'];
const SEED_KEY = 'mm3d-seed-v1';

function arg(name, fallback) {
  const hit = process.argv.indexOf(`--${name}`);
  return hit === -1 ? fallback : process.argv[hit + 1];
}
for (const retired of ['arena', 'mode']) {
  if (process.argv.includes(`--${retired}`)) {
    console.error(`--${retired} belonged to the Phaser build and has no 3D equivalent; the 3D build plays its level campaign.`);
    process.exit(2);
  }
}
// --shifts is the pre-3D name for the same count.
const LEVELS = Number(arg('levels', arg('shifts', 3)));
const CAMPAIGNS = Number(arg('campaigns', 1));
const SEED = arg('seed', undefined);
const TIMEOUT_SECONDS = Number(arg('timeout', 480));
const AS_JSON = process.argv.includes('--json');
// Write the run records the game saved (src/three/runRecord.ts) to a file, e.g.
// to feed harness runs through `scripts/ingest-run.mjs` like the owner's.
const DUMP_RUNS = arg('dump-runs', undefined);
const dumped = [];
// How much light to keep back for the trip home, as a multiple of the
// estimated return time. Higher turns for home earlier. This is the whole
// risk dial: ore mined on a run that misses the deadline counts for nothing.
const RESERVE = Number(arg('reserve', 1.6));
// How much ore to chase, as a multiple of quota. At 1 the policy heads home
// the moment it has enough; above 1 it keeps working seams for bonus.
const GREED = Number(arg('greed', 1));

// Same resolution order as before: explicit override, system browser, whatever
// sits in PLAYWRIGHT_BROWSERS_PATH, then Playwright's own install.
function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium'
  ].filter(Boolean);
  const direct = candidates.find((candidate) => existsSync(candidate));
  if (direct) return direct;

  const root = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!root || !existsSync(root)) return undefined;
  const ranked = readdirSync(root)
    .filter((name) => name.startsWith('chromium'))
    .sort((a, b) => Number(a.startsWith('chromium_headless_shell')) - Number(b.startsWith('chromium_headless_shell')));
  for (const name of ranked) {
    for (const rel of [['chrome-linux', 'chrome'], ['chrome-linux', 'headless_shell']]) {
      const candidate = path.join(root, name, ...rel);
      if (existsSync(candidate)) return candidate;
    }
  }
  return undefined;
}

async function openPort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

async function waitForHttp(url, ms = 30000) {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      /* not up yet */
    }
    await delay(250);
  }
  throw new Error('dev server did not come up');
}

// The whole policy, evaluated in page so it sees the live world rather than a
// copy that is already a frame old. It also returns the few numbers the
// harness accumulates between calls.
const decide = (page) =>
  page.evaluate(([reserve, greed]) => {
    const api = window.__mm3d;
    if (!api) return null;
    const state = api.getState();
    const rover = state.rover;
    const extraction = state.arena.extraction;
    const quota = extraction?.oreRequired ?? state.targetOre;
    const gap = quota * greed - rover.ore;
    const span = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const launch = document.getElementById('launch');
    const sample = {
      phase: state.phase,
      elapsed: state.elapsedSeconds,
      speedState: state.speedState,
      nanobots: state.nanobots
    };

    // Leave enough light to get home. Underestimating speed here is safer than
    // overestimating it, because arriving late scores nothing at all.
    const homeSeconds = extraction ? span(rover, extraction) / 70 : 0;
    const headHome = Boolean(extraction) && (gap <= 0 || state.solarSeconds < homeSeconds * reserve + 3);

    let target = extraction ?? rover;
    let seam = null;
    if (!headHome) {
      const live = (state.fertileZones ?? []).filter((zone) => zone.remaining > 0.4);
      if (live.length) {
        // Nearest seam per unit of ore left in it.
        live.sort((a, b) => span(rover, a) / Math.max(a.remaining, 0.1) - span(rover, b) / Math.max(b.remaining, 0.1));
        seam = live[0];
        target = seam;
      }
    }

    // Mining is stop-to-mine: the arms only harvest while the rover is parked
    // on the seam. So inside the seam's core, let go of everything and wait.
    if (seam && span(rover, seam) < seam.radius * 0.6) {
      return { ...sample, steer: null, throttle: false, launch: false, parked: true };
    }

    let turn = Math.atan2(target.y - rover.y, target.x - rover.x) - rover.heading;
    while (turn > Math.PI) turn -= 2 * Math.PI;
    while (turn < -Math.PI) turn += 2 * Math.PI;

    // Launch only while moving. Launched after standing still for the eraser
    // aim delay, the drone erases the road ahead instead of reclaiming.
    const eraser = /erase/i.test(launch?.textContent ?? '');
    const canLaunch = Boolean(launch) && !launch.disabled && !eraser && Math.abs(rover.speed) > 20;

    return {
      ...sample,
      steer: turn > 0.09 ? 'd' : turn < -0.09 ? 'a' : null,
      // Do not drive hard while pointing the wrong way; turn first.
      throttle: Math.abs(turn) < 1.15,
      launch: canLaunch && state.nanobots < 2.2,
      parked: false
    };
  }, [RESERVE, GREED]);

const readOutcome = (page) =>
  page.evaluate(() => {
    const state = window.__mm3d.getState();
    const zones = state.fertileZones ?? [];
    const text = (id) => document.getElementById(id)?.textContent?.trim() ?? '';
    return {
      level: text('hud-day'),
      result: state.phase,
      banner: text('banner-title'),
      ore: Number(state.rover.ore.toFixed(2)),
      required: state.arena.extraction?.oreRequired ?? state.targetOre,
      solarLeft: Number(state.solarSeconds.toFixed(2)),
      solarWindow: Number(state.solarWindowSeconds.toFixed(2)),
      elapsed: Number(state.elapsedSeconds.toFixed(2)),
      seamOreLeft: Number(zones.reduce((total, zone) => total + zone.remaining, 0).toFixed(2)),
      seamsAlive: zones.filter((zone) => zone.remaining > 0.4).length,
      seamsTotal: zones.length,
      message: state.message
    };
  });

async function playLevel(page, campaign, index) {
  await page.waitForFunction(
    () => window.__mm3d?.getState().phase === 'playing' && document.getElementById('banner')?.style.display !== 'flex',
    null,
    { timeout: 30000 }
  );
  // Pressing R swaps the world at once, but the HUD only redraws on the next
  // frame; read the level label after two frames or it is the previous one.
  await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
  const opening = await page.evaluate(() => ({
    level: document.getElementById('hud-day')?.textContent?.trim() ?? '',
    seed: window.localStorage.getItem('mm3d-seed-v1'),
    worldSeed: window.__mm3d.getState().seed
  }));

  const held = new Set();
  const hold = async (key, want) => {
    if (want && !held.has(key)) {
      await page.keyboard.down(key);
      held.add(key);
    }
    if (!want && held.has(key)) {
      await page.keyboard.up(key);
      held.delete(key);
    }
  };

  const seconds = { prepared: 0, fabricating: 0, crawl: 0, parked: 0 };
  let lowestNanobots = Infinity;
  let launches = 0;
  let lastElapsed = null;
  let timedOut = false;

  const deadline = Date.now() + TIMEOUT_SECONDS * 1000;
  for (;;) {
    if (Date.now() > deadline) {
      timedOut = true;
      break;
    }
    const plan = await decide(page);
    if (!plan || plan.phase !== 'playing') break;

    if (lastElapsed !== null && plan.elapsed > lastElapsed) {
      const step = plan.elapsed - lastElapsed;
      seconds[plan.speedState] = (seconds[plan.speedState] ?? 0) + step;
      if (plan.parked) seconds.parked += step;
    }
    lastElapsed = plan.elapsed;
    lowestNanobots = Math.min(lowestNanobots, plan.nanobots);

    await hold('w', plan.throttle);
    await hold('a', plan.steer === 'a');
    await hold('d', plan.steer === 'd');
    if (plan.launch) {
      await page.keyboard.press(' ');
      launches += 1;
    }
    await delay(60);
  }
  for (const key of [...held]) await page.keyboard.up(key);

  const outcome = await readOutcome(page);
  // Every finished level must leave a run record (DEV-61); a missing one fails the run.
  const recorded = timedOut
    ? null
    : await page.evaluate(() => {
        const runs = window.__mm3d?.runs?.() ?? [];
        return runs[runs.length - 1] ?? null;
      });
  const row = {
    campaign,
    run: index,
    seed: opening.seed,
    ...outcome,
    level: opening.level,
    result: timedOut ? 'timeout' : outcome.result,
    crawl: Number(seconds.crawl.toFixed(1)),
    fabricating: Number(seconds.fabricating.toFixed(1)),
    prepared: Number(seconds.prepared.toFixed(1)),
    parked: Number(seconds.parked.toFixed(1)),
    droneLaunches: launches,
    lowestNanobots: Number((Number.isFinite(lowestNanobots) ? lowestNanobots : 0).toFixed(2)),
    recorded: Boolean(recorded && recorded.seed === opening.worldSeed && Math.abs(recorded.ore - outcome.ore) < 0.011)
  };

  if (!timedOut) {
    // The scene writes the campaign on the phase change; give it a beat, then
    // continue (R advances after a clear and retries after a miss).
    await delay(400);
    await page.keyboard.press('r');
  }
  return { row, timedOut };
}

const port = await openPort();
const vite = spawn(process.execPath, [`${PROJECT_ROOT}node_modules/vite/bin/vite.js`, '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
  cwd: PROJECT_ROOT,
  stdio: 'ignore'
});
const appUrl = `http://127.0.0.1:${port}/`;
const chromePath = findChrome();

const rows = [];
let browser;
try {
  await waitForHttp(appUrl);
  browser = await chromium.launch({
    ...(chromePath ? { executablePath: chromePath } : {}),
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage', '--mute-audio']
  });
  for (let campaign = 1; campaign <= CAMPAIGNS; campaign += 1) {
    const page = await browser.newPage({ viewport: { width: 640, height: 420 } });
    await page.goto(appUrl);
    await page.evaluate(
      ([keys, seedKey, seed]) => {
        for (const key of keys) window.localStorage.removeItem(key);
        if (seed) window.localStorage.setItem(seedKey, seed);
      },
      [CAMPAIGN_KEYS, SEED_KEY, SEED ?? null]
    );
    await page.reload();
    await page.waitForFunction(() => Boolean(window.__mm3d), null, { timeout: 30000 });
    for (let run = 1; run <= LEVELS; run += 1) {
      const { row, timedOut } = await playLevel(page, campaign, run);
      rows.push(row);
      if (!AS_JSON) console.error(`campaign ${campaign} run ${run}: ${row.level} ${row.result} (${row.ore}/${row.required} ore, ${row.solarLeft}s sun left)`);
      if (timedOut) break;
    }
    if (DUMP_RUNS) dumped.push(...(await page.evaluate(() => window.__mm3d?.runs?.() ?? [])));
    await page.close();
  }
} finally {
  await browser?.close();
  vite.kill();
}

if (DUMP_RUNS) writeFileSync(DUMP_RUNS, JSON.stringify(dumped, null, 2) + '\n');
if (AS_JSON) {
  console.log(JSON.stringify(rows, null, 2));
} else {
  console.log(`Playthrough — reserve ${RESERVE}, greed ${GREED}, ${CAMPAIGNS} campaign(s) x ${LEVELS} level run(s)${SEED ? `, seed ${SEED}` : ''}`);
  console.log('| camp | run | level | result | banner | ore/req | sun left/window | seams alive | seam ore left | crawl | fab | prep | parked | DL | lowNb | recorded |');
  console.log('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const row of rows) {
    console.log(
      `| ${row.campaign} | ${row.run} | ${row.level} | ${row.result} | ${row.banner || '-'} | ${row.ore}/${row.required} | ${row.solarLeft}/${row.solarWindow} | ${row.seamsAlive}/${row.seamsTotal} | ${row.seamOreLeft} | ${row.crawl} | ${row.fabricating} | ${row.prepared} | ${row.parked} | ${row.droneLaunches} | ${row.lowestNanobots} | ${row.recorded ? 'yes' : 'NO'} |`
    );
  }
}
// A timed-out level means the harness could not finish it, which is a failure
// of the run, not a result about the game.
// A level that ends without a run record means run capture broke (DEV-61).
const missing = rows.filter((row) => row.result !== 'timeout' && !row.recorded);
if (missing.length) console.error(`${missing.length} finished level(s) left no run record — run capture is broken (DEV-61).`);
process.exit(rows.some((row) => row.result === 'timeout') || missing.length ? 1 : 0);
