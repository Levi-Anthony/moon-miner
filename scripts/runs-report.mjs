// Summarise stored run data: data/runs/runs.jsonl on main (DEV-61).
//
// This is where the owner's real runs live. The live game hands each finished
// level to a "[run-data]" GitHub issue, and the ingest-run workflow appends it
// here. Pull main first to see the latest.
//
//   npm run runs               # table of every stored run
//   npm run runs -- --last 20  # only the newest 20
//   npm run runs -- --json     # raw records
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

const runs = readFileSync(RUNS_FILE, 'utf8').split('\n').filter(Boolean).map((line) => JSON.parse(line));
const shown = runs.slice(-last);

if (argv.includes('--json')) {
  console.log(JSON.stringify(shown, null, 2));
  process.exit(0);
}

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
