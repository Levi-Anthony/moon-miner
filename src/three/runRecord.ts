// Run records: what one finished level looked like, in a form that survives the
// browser it was played in.
//
// Run data has been lost three times (DEV-61): an Artifact DB the static Pages
// build never had, a clipboard button that stored nothing, and then the Phaser
// rebuild dropped both without a trace. So this module is pure and tested, and
// the record leaves the browser the one way a static site can hand data to the
// repo without holding a secret: a pre-filled GitHub issue. The owner presses
// Submit; `.github/workflows/ingest-run.yml` appends the record to
// `data/runs/runs.jsonl` on main, where any later session can read it.
import type { ContinuousWorldState, SpeedState } from '../game/continuous';

export const RUN_RECORD_VERSION = 1;
export const RUN_ISSUE_TITLE_PREFIX = '[run-data]';
// Fences the JSON in the issue body; the ingest script looks for exactly this.
export const RUN_JSON_MARKER = 'moon-miner-runs';
export const RUN_HISTORY_KEY = 'mm3d-runs-v1';
export const RUN_HISTORY_MAX = 50;
// GitHub rejects very long new-issue URLs; stay well under the practical limit.
export const RUN_ISSUE_URL_MAX = 7500;

export type RunResult = 'cleared' | 'under-quota' | 'lost' | 'won' | 'sandbox-lost';

export interface RunStats {
  seconds: Record<SpeedState, number>;
  miningSeconds: number;
  droneLaunches: number;
  minStock: number;
  distance: number;
}

export interface RunRecord {
  v: number;
  id: string;
  at: string; // ISO time the run ended
  build: string; // commit the live build was made from ('dev' locally)
  seed: string;
  mode: 'levels' | 'sandbox';
  level: number | null; // 1-based level number in Levels mode
  levelName: string | null;
  day: number;
  result: RunResult;
  ore: number;
  quota: number;
  sunLeft: number;
  sunWindow: number;
  elapsed: number;
  startStock: number | null;
  parSeconds: number | null;
  parSeams: number | null;
  bonus: number;
  slide: number;
  secs: Record<SpeedState, number> & { mining: number };
  droneLaunches: number;
  minStock: number;
  distance: number;
  device: { w: number; h: number; touch: boolean };
  // Only settings that differ from the shipped defaults, so a record says what
  // was changed without carrying every knob.
  knobs: Record<string, Record<string, unknown>>;
  sent?: boolean; // set locally once it has been handed to GitHub
}

export function createRunStats(stock: number): RunStats {
  return { seconds: { prepared: 0, fabricating: 0, crawl: 0 }, miningSeconds: 0, droneLaunches: 0, minStock: stock, distance: 0 };
}

// Call once per frame while playing, after the sim tick.
export function accumulateRunStats(stats: RunStats, state: ContinuousWorldState, dt: number, moved: number): void {
  if (state.phase !== 'playing') return;
  stats.seconds[state.speedState] += dt;
  if (state.arms.mining > 0) stats.miningSeconds += dt;
  stats.minStock = Math.min(stats.minStock, state.nanobots);
  stats.distance += moved;
}

// Shallow per-group diff against defaults. Numbers are rounded so float noise
// from sliders doesn't show up as a change.
export function diffKnobs(
  groups: Record<string, { current: object; defaults: object }>
): Record<string, Record<string, unknown>> {
  const out: Record<string, Record<string, unknown>> = {};
  for (const [name, { current, defaults }] of Object.entries(groups)) {
    const cur = current as Record<string, unknown>;
    const def = defaults as Record<string, unknown>;
    const changed: Record<string, unknown> = {};
    for (const key of Object.keys(cur)) {
      const a = cur[key];
      const b = def[key];
      const same = typeof a === 'number' && typeof b === 'number' ? Math.abs(a - b) < 1e-6 : JSON.stringify(a) === JSON.stringify(b);
      if (!same) changed[key] = typeof a === 'number' ? round(a, 4) : a;
    }
    if (Object.keys(changed).length) out[name] = changed;
  }
  return out;
}

export interface RunRecordInput {
  state: ContinuousWorldState;
  stats: RunStats;
  build: string;
  mode: 'levels' | 'sandbox';
  level: { index: number; name: string; startStock: number; parSeconds: number; parSeams: number } | null;
  cleared: boolean;
  day: number;
  bonus: number;
  slide: number;
  device: { w: number; h: number; touch: boolean };
  knobs: Record<string, Record<string, unknown>>;
  now?: Date;
}

export function buildRunRecord(input: RunRecordInput): RunRecord {
  const { state, stats, level } = input;
  const now = input.now ?? new Date();
  const quota = state.arena.extraction?.oreRequired ?? state.targetOre;
  const result: RunResult = input.mode === 'levels'
    ? input.cleared ? 'cleared' : state.phase === 'won' ? 'under-quota' : 'lost'
    : state.phase === 'won' ? 'won' : 'sandbox-lost';
  return {
    v: RUN_RECORD_VERSION,
    id: `${now.getTime().toString(36)}-${state.seed}`.slice(0, 64),
    at: now.toISOString(),
    build: input.build,
    seed: state.seed,
    mode: input.mode,
    level: level ? level.index + 1 : null,
    levelName: level?.name ?? null,
    day: input.day,
    result,
    ore: round(state.rover.ore, 2),
    quota,
    sunLeft: round(state.solarSeconds, 1),
    sunWindow: round(state.solarWindowSeconds, 1),
    elapsed: round(state.elapsedSeconds, 1),
    startStock: level ? round(level.startStock, 1) : null,
    parSeconds: level ? round(level.parSeconds, 1) : null,
    parSeams: level?.parSeams ?? null,
    bonus: Math.floor(input.bonus),
    slide: Math.round(input.slide),
    secs: {
      prepared: round(stats.seconds.prepared, 1),
      fabricating: round(stats.seconds.fabricating, 1),
      crawl: round(stats.seconds.crawl, 1),
      mining: round(stats.miningSeconds, 1)
    },
    droneLaunches: stats.droneLaunches,
    minStock: round(stats.minStock, 2),
    distance: Math.round(stats.distance),
    device: input.device,
    knobs: input.knobs
  };
}

// Local history, newest last. Storage can be missing or full; never throw.
export function loadRunHistory(storage: Pick<Storage, 'getItem'> | undefined): RunRecord[] {
  try {
    const raw = storage?.getItem(RUN_HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as RunRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveRunHistory(storage: Pick<Storage, 'setItem'> | undefined, runs: RunRecord[]): boolean {
  try {
    storage?.setItem(RUN_HISTORY_KEY, JSON.stringify(runs.slice(-RUN_HISTORY_MAX)));
    return Boolean(storage);
  } catch {
    return false;
  }
}

export function appendRun(runs: RunRecord[], record: RunRecord): RunRecord[] {
  return [...runs, record].slice(-RUN_HISTORY_MAX);
}

export function unsentRuns(runs: RunRecord[]): RunRecord[] {
  return runs.filter((run) => !run.sent);
}

// The issue body: a short human line, then the records as fenced JSON the
// ingest script parses. `sent` is local bookkeeping and stays out of it.
export function runIssueBody(records: RunRecord[]): string {
  const clean = records.map(({ sent: _sent, ...rest }) => rest);
  const summary = records
    .map((r) => `- ${r.at.slice(0, 16).replace('T', ' ')} · ${r.mode === 'levels' ? `L${r.level} ${r.levelName}` : `day ${r.day}`} · ${r.result} · ${r.ore}/${r.quota} ore · ${r.sunLeft}s sun left`)
    .join('\n');
  return `${summary}\n\n\`\`\`json ${RUN_JSON_MARKER}\n${JSON.stringify(clean)}\n\`\`\`\n`;
}

export function runIssueTitle(records: RunRecord[]): string {
  const last = records[records.length - 1];
  const what = records.length === 1 && last
    ? `${last.mode === 'levels' ? `L${last.level}` : `day ${last.day}`} ${last.result}`
    : `${records.length} runs`;
  return `${RUN_ISSUE_TITLE_PREFIX} ${what}`;
}

// Build the new-issue URL, dropping the oldest records until it fits. Returns
// the URL and how many records made it in (the newest ones).
export function runIssueUrl(repo: string, records: RunRecord[]): { url: string; count: number } {
  let batch = records.slice();
  for (;;) {
    const url = `https://github.com/${repo}/issues/new?title=${encodeURIComponent(runIssueTitle(batch))}&body=${encodeURIComponent(runIssueBody(batch))}`;
    if (url.length <= RUN_ISSUE_URL_MAX || batch.length <= 1) return { url, count: batch.length };
    batch = batch.slice(1);
  }
}

function round(value: number, places: number): number {
  const f = 10 ** places;
  return Math.round(value * f) / f;
}
