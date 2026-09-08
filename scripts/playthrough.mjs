// Plays complete runs in the real build, through the real input path, and
// reports what actually happened.
//
// The self-play routes in src/game/continuousSelfPlay.ts follow scripted
// waypoints in a headless simulation. Useful, but it cannot answer "is this
// playable" or "what does a shift campaign do to the seams", because it never
// touches the browser, the render loop, or the keyboard. This drives the
// shipped game with held keys and reads the same debug snapshot the player's
// HUD is drawn from.
//
//   node scripts/playthrough.mjs [--shifts 3] [--arena last-light-return]
//                                [--mode keys|selfplay] [--campaigns 1] [--json]
import { spawn } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const PROJECT_ROOT = fileURLToPath(new URL('..', import.meta.url));
const SNAPSHOT_ID = 'moon-miner-continuous-debug-state';
const CARRY_KEY = 'moon-miner-carried-road-v1';
const ARENA_KEY = 'moon-miner-continuous-arena-v1';

function arg(name, fallback) {
  const hit = process.argv.indexOf(`--${name}`);
  return hit === -1 ? fallback : process.argv[hit + 1];
}
const SHIFTS = Number(arg('shifts', 3));
const CAMPAIGNS = Number(arg('campaigns', 1));
const ARENA = arg('arena', 'last-light-return');
const MODE = arg('mode', 'keys');
const AS_JSON = process.argv.includes('--json');
// How much light to keep back for the trip home, as a multiple of the
// estimated return time. Higher turns for home earlier. This is the whole
// risk dial: the score is all-or-nothing at extraction, so ore mined on a run
// that misses the deadline counts for exactly nothing.
const RESERVE = Number(arg('reserve', 1.6));
// How much ore to chase, as a multiple of quota. At 1 the policy banks the
// moment it has enough and leaves, which is why sweeping RESERVE alone could
// never produce greed: the reserve only governs a quota not yet met. Above 1
// the rover keeps working a field that always has more in it, which is the
// decision the recorded human runs were actually making.
const GREED = Number(arg('greed', 1));

// Same resolution order as the smoke check: explicit override, system browser,
// whatever sits in PLAYWRIGHT_BROWSERS_PATH, then Playwright's own install.
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

const read = (page) =>
  page.evaluate((id) => {
    const el = document.getElementById(id);
    return el ? JSON.parse(el.textContent) : null;
  }, SNAPSHOT_ID);

// The whole policy, evaluated in page so it sees the live world rather than a
// snapshot that is already a frame old.
const decide = (page) =>
  page.evaluate(([id, reserve, greed]) => {
    const el = document.getElementById(id);
    const snapshot = el ? JSON.parse(el.textContent) : null;
    if (!snapshot) return null;
    const state = snapshot.state;
    const rover = state.rover;
    const extraction = state.arena.extraction;
    const quota = extraction?.oreRequired ?? state.targetOre;
    const gap = quota * greed - rover.ore;
    const span = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

    // Leave enough light to get home. Underestimating speed here is safer than
    // overestimating it, because arriving late scores nothing at all.
    const homeSeconds = extraction ? span(rover, extraction) / 70 : 0;
    const headHome = Boolean(extraction) && (gap <= 0 || state.solarSeconds < homeSeconds * reserve + 3);

    let target = extraction ?? rover;
    if (!headHome) {
      const live = (state.fertileZones ?? []).filter((zone) => zone.remaining > 0.4);
      if (live.length) {
        // Nearest seam per unit of ore left in it.
        live.sort((a, b) => span(rover, a) / Math.max(a.remaining, 0.1) - span(rover, b) / Math.max(b.remaining, 0.1));
        target = live[0];
      }
    }

    let turn = Math.atan2(target.y - rover.y, target.x - rover.x) - rover.heading;
    while (turn > Math.PI) turn -= 2 * Math.PI;
    while (turn < -Math.PI) turn += 2 * Math.PI;

    return {
      phase: state.phase,
      steer: turn > 0.09 ? 'd' : turn < -0.09 ? 'a' : null,
      // Do not drive hard while pointing the wrong way; turn first.
      throttle: Math.abs(turn) < 1.15,
      launch: state.drone.status === 'ready' && state.nanobots < 2.2,
      headHome
    };
  }, [SNAPSHOT_ID, RESERVE, GREED]);

function summarise(snapshot, loop) {
  const state = snapshot.state;
  const zones = state.fertileZones ?? [];
  const remaining = zones.reduce((total, zone) => total + zone.remaining, 0);
  return {
    result: state.phase,
    ore: Number(state.rover.ore.toFixed(2)),
    required: state.arena.extraction?.oreRequired ?? state.targetOre,
    solarLeft: Number(state.solarSeconds.toFixed(2)),
    elapsed: Number(state.elapsedSeconds.toFixed(2)),
    seamOreLeft: Number(remaining.toFixed(2)),
    seamsAlive: zones.filter((zone) => zone.remaining > 0.4).length,
    seamsTotal: zones.length,
    lowestNanobots: Number((loop?.lowestNanobots ?? 0).toFixed(2)),
    droneLaunches: loop?.droneLaunches ?? 0,
    droneDeliveries: loop?.droneDeliveries ?? 0,
    crawl: Number((loop?.speedSeconds?.crawl ?? 0).toFixed(1)),
    fabricating: Number((loop?.speedSeconds?.fabricating ?? 0).toFixed(1)),
    prepared: Number((loop?.speedSeconds?.prepared ?? 0).toFixed(1)),
    hitLoop: Boolean(loop?.hitLoop)
  };
}

async function playShift(page, appUrl, shiftIndex) {
  await page.goto(appUrl);
  await page.waitForFunction((id) => Boolean(document.getElementById(id)), SNAPSHOT_ID, { timeout: 30000 });
  await delay(600);

  const opening = await read(page);
  const carriedIn = (opening.state.fields ?? []).length;
  const seamsAtDawn = (opening.state.fertileZones ?? []).reduce((total, zone) => total + zone.remaining, 0);

  if (MODE === 'selfplay') {
    await page.evaluate(() => window.__moonMinerContinuous?.startSelfPlay());
  }

  const held = new Set();
  const hold = async (key, want) => {
    if (want && !held.has(key)) { await page.keyboard.down(key); held.add(key); }
    if (!want && held.has(key)) { await page.keyboard.up(key); held.delete(key); }
  };

  const deadline = Date.now() + 120000;
  let phase = 'playing';
  while (phase === 'playing' && Date.now() < deadline) {
    if (MODE === 'keys') {
      const plan = await decide(page);
      if (!plan) break;
      phase = plan.phase;
      if (phase !== 'playing') break;
      await hold('w', plan.throttle);
      await hold('a', plan.steer === 'a');
      await hold('d', plan.steer === 'd');
      if (plan.launch) await page.keyboard.press('Space');
    } else {
      const snapshot = await read(page);
      phase = snapshot?.state.phase ?? 'playing';
      if (phase !== 'playing') break;
    }
    await delay(60);
  }
  for (const key of [...held]) await page.keyboard.up(key);

  const closing = await read(page);
  const loop = await page.evaluate(() => window.__moonMinerContinuous?.getLoopSummary());
  // The scene writes the carry on the phase change; give it a beat to land.
  await delay(400);
  return { shift: shiftIndex, carriedIn, seamsAtDawn: Number(seamsAtDawn.toFixed(2)), ...summarise(closing, loop) };
}

const port = await openPort();
const vite = spawn(process.execPath, [`${PROJECT_ROOT}node_modules/vite/bin/vite.js`, '--port', String(port), '--strictPort'], {
  cwd: PROJECT_ROOT,
  stdio: 'ignore'
});
const appUrl = `http://127.0.0.1:${port}/`;
const chromePath = findChrome();
const browser = await chromium.launch({
  ...(chromePath ? { executablePath: chromePath } : {}),
  headless: true,
  args: ['--disable-gpu', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage', '--mute-audio']
});

const rows = [];
try {
  await delay(3500);
  for (let campaign = 1; campaign <= CAMPAIGNS; campaign += 1) {
    const page = await browser.newPage({ viewport: { width: 1040, height: 720 } });
    await page.goto(appUrl);
    await page.evaluate(
      ([carry, arenaKey, arena]) => {
        window.localStorage.removeItem(carry);
        window.localStorage.setItem(arenaKey, arena);
      },
      [CARRY_KEY, ARENA_KEY, ARENA]
    );
    for (let shift = 1; shift <= SHIFTS; shift += 1) {
      rows.push({ campaign, ...(await playShift(page, appUrl, shift)) });
    }
    await page.close();
  }
} finally {
  await browser.close();
  vite.kill();
}

if (AS_JSON) {
  console.log(JSON.stringify(rows, null, 2));
} else {
  console.log(`Playthrough — arena ${ARENA}, mode ${MODE}, reserve ${RESERVE}, greed ${GREED}, ${CAMPAIGNS} campaign(s) x ${SHIFTS} shifts`);
  console.log(
    '| camp | shift | carried | seam ore at dawn | result | ore/req | sun left | seams alive | seam ore left | crawl | fab | prep | DL/DD | lowNb |'
  );
  console.log('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const row of rows) {
    console.log(
      `| ${row.campaign} | ${row.shift} | ${row.carriedIn} | ${row.seamsAtDawn} | ${row.result} | ${row.ore}/${row.required} | ${row.solarLeft} | ${row.seamsAlive}/${row.seamsTotal} | ${row.seamOreLeft} | ${row.crawl} | ${row.fabricating} | ${row.prepared} | ${row.droneLaunches}/${row.droneDeliveries} | ${row.lowestNanobots} |`
    );
  }
}
