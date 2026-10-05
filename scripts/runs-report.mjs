// Summarise stored run data: data/runs/runs.jsonl on main (DEV-61).
//
// This is where the owner's real runs live. The live game hands each finished
// level to a "[run-data]" GitHub issue, and the ingest-run workflow appends it
// here. Pull main first to see the latest.
//
//   npm run runs               # table of every stored run
//   npm run runs -- --last 20  # only the newest 20
//   npm run runs -- --json     # raw records
//   npm run runs -- --toys     # the throwaway toys' runs instead (toys/README.md)
//   npm run runs -- --routes   # each logged route: trips, how much they bent, time in the dark
import { existsSync, readFileSync } from 'node:fs';
import { RUNS_FILE } from './ingest-run.mjs';

const argv = process.argv.slice(2);
const lastArg = argv.indexOf('--last');
const last = lastArg === -1 ? Infinity : Number(argv[lastArg + 1]);

if (!existsSync(RUNS_FILE)) {
  console.log('No runs stored yet: data/runs/runs.jsonl does not exist on this checkout.');
  console.log('Runs arrive when the owner presses "Send run data" on the end-of-level banner and submits the GitHub issue.');
  console.log('If runs were sent, run `git pull origin main` and check the "Ingest run data" workflow runs.');
  process.exit(0);
}

const all = readFileSync(RUNS_FILE, 'utf8').split('\n').filter(Boolean).map((line) => JSON.parse(line));
// Toy runs (mode 'toy:…') have their own shape; keep them out of main-game stats.
const toys = argv.includes('--toys');
// Endless Night 3D ('endless:3d') shares the toy Endless shape, so it reports with the toys.
const isToy = (r) => String(r.mode).startsWith('toy:') || String(r.mode).startsWith('endless:');
const runs = all.filter((r) => isToy(r) === toys);
const shown = runs.slice(-last);

// Routes (from 2026-10-05): the packed path (src/game/pathLog.ts) and a line per
// trip. Bend = px driven ÷ (2 × farthest px from home): about 1 is a straight
// out and back, more means the route went round something.
if (argv.includes('--routes')) {
  const ALPHA = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
  const withRoute = all.filter((r) => r.path?.s).slice(-last);
  console.log(`${withRoute.length} run(s) with a route`);
  for (const r of withRoute) {
    let qx = 0;
    let qy = 0;
    let len = 0;
    let far = 0;
    let rail = 0;
    let dark = 0;
    const n = Math.floor(r.path.s.length / 2);
    for (let i = 0; i < n; i += 1) {
      if (r.path.f[i] === 'n') {
        qx = 0;
        qy = 0;
      }
      const dx = ALPHA.indexOf(r.path.s[i * 2]) - 32;
      const dy = ALPHA.indexOf(r.path.s[i * 2 + 1]) - 32;
      if (r.path.f[i] !== 'n') len += Math.hypot(dx, dy) * 20;
      qx += dx;
      qy += dy;
      far = Math.max(far, Math.hypot(qx, qy) * 20);
      const f = parseInt(r.path.f[i], 16) || 0;
      if (f & 1) rail += 1;
      if (f & 2) dark += 1;
    }
    const bend = (t) => (t[2] > 0 ? (t[1] / (2 * t[2])).toFixed(2) : '-');
    console.log(`\n${r.at.slice(0, 16).replace('T', ' ')} ${r.mode} ${r.result} · ${r.ore} ore · ${n} s sampled · ${Math.round(len)} px · farthest ${Math.round(far)} px · rail ${Math.round((100 * rail) / Math.max(1, n))}% · dark ${dark} s`);
    for (const [k, t] of (r.tripLog ?? []).entries()) console.log(`  trip ${k + 1}: ${t[0]} s · ${t[1]} px · farthest ${t[2]} px · bend ${bend(t)} · dark ${t[3]} s`);
    if (r.lastLeg) console.log(`  unbanked leg: ${r.lastLeg[0]} s · ${r.lastLeg[1]} px · farthest ${r.lastLeg[2]} px · bend ${bend(r.lastLeg)} · dark ${r.lastLeg[3]} s`);
  }
  process.exit(0);
}

if (argv.includes('--json')) {
  console.log(JSON.stringify(shown, null, 2));
  process.exit(0);
}

if (toys) {
  console.log(`${runs.length} toy run(s)${shown.length < runs.length ? `, newest ${shown.length} shown` : ''}`);
  console.log('| ended (UTC) | build | mode | result | ore/quota | nights | score | peak x | trips | upgrades | daily | hard | secs | distance | rail share | hop-offs | grabs | missed grabs (angle/unarmed) | auto-banks | push mine/bank |');
  console.log('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const r of shown) {
    console.log(`| ${r.at.slice(0, 16).replace('T', ' ')} | ${r.build} | ${r.mode.replace('toy:', '')} | ${r.result} | ${r.ore}${r.quota ? `/${r.quota}` : ''} | ${r.nightsCleared ?? '-'} | ${r.score ?? '-'} | ${r.multPeak ?? '-'} | ${r.trips ?? '-'} | ${(r.upgrades ?? []).join(',') || '-'} | ${r.daily ? 'yes' : 'no'} | ${r.hard ? 'yes' : '-'} | ${r.seconds ?? '-'} | ${r.distance ?? '-'} | ${r.railShare ?? '-'} | ${r.hopOffs ?? '-'} | ${r.grabs ?? '-'} | ${r.missedGrabs ? `${r.missedGrabs.angle}/${r.missedGrabs.unarmed}` : '-'} | ${r.autoBanks ?? '-'} | ${r.pushMine != null ? `${r.pushMine}/${r.pushBank}` : '-'} |`);
  }
  const byMode = new Map();
  for (const r of runs) {
    const e = byMode.get(r.mode) ?? { n: 0, best: 0 };
    e.n += 1;
    e.best = Math.max(e.best, r.score ?? r.ore);
    byMode.set(r.mode, e);
  }
  if (byMode.size) console.log('\nPer mode: runs · best');
  for (const [m, e] of byMode) console.log(`  ${m}: ${e.n} · ${e.best}`);
  process.exit(0);
}
if (all.length > runs.length) console.log(`(${all.length - runs.length} toy run(s) hidden; npm run runs -- --toys)`);
console.log(`${runs.length} stored run(s)${shown.length < runs.length ? `, newest ${shown.length} shown` : ''} — ${RUNS_FILE.replace(process.cwd() + '/', '')}`);
console.log('| ended (UTC) | build | level | result | ore/quota | sun left/window | elapsed | prep/fab/crawl/mine s | drone | min stock | device | knobs changed |');
console.log('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
for (const r of shown) {
  const lvl = r.mode === 'levels' ? `L${r.level} ${r.levelName ?? ''}`.trim() : `sandbox day ${r.day}`;
  const s = r.secs ?? {};
  const knobs = Object.entries(r.knobs ?? {}).map(([g, v]) => `${g}:${Object.keys(v).join(',')}`).join(' ') || '-';
  const dev = r.device ? `${r.device.w}×${r.device.h}${r.device.touch ? ' touch' : ''}` : '-';
  console.log(`| ${r.at.slice(0, 16).replace('T', ' ')} | ${r.build} | ${lvl} | ${r.result} | ${r.ore}/${r.quota} | ${r.sunLeft}/${r.sunWindow} | ${r.elapsed} | ${s.prepared}/${s.fabricating}/${s.crawl}/${s.mining} | ${r.droneLaunches} | ${r.minStock} | ${dev} | ${knobs} |`);
}

const byLevel = new Map();
for (const r of runs.filter((x) => x.mode === 'levels')) {
  const k = `L${r.level}`;
  const e = byLevel.get(k) ?? { runs: 0, cleared: 0, sunLeft: 0 };
  e.runs += 1;
  if (r.result === 'cleared') e.cleared += 1;
  e.sunLeft += r.sunLeft / Math.max(1, r.sunWindow);
  byLevel.set(k, e);
}
if (byLevel.size) {
  console.log('\nPer level: runs · clear rate · mean share of sun left at the end');
  for (const [k, e] of [...byLevel].sort()) console.log(`  ${k}: ${e.runs} · ${Math.round((100 * e.cleared) / e.runs)}% · ${Math.round((100 * e.sunLeft) / e.runs)}%`);
}
