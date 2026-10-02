// One send for every run this browser has saved (owner, 2026-09-30).
//
// Runs live in two stores: the main game's history (mm3d-runs-v1, written by
// src/three/runRecord.ts) and the toys' log (mm-toy-runs-v1, src/toys/kit.ts).
// They used to have separate Send buttons, and a send from the main game left
// the owner's Contract/Endless runs behind (issue #62). Every Send button now
// goes through here and sends all unsent runs from both stores, newest first,
// in the packed format scripts/ingest-run.mjs reads.
//
// Lives outside src/three and src/toys so both can import it (the toys may
// import nothing from src/three).

export const MAIN_RUNS_KEY = 'mm3d-runs-v1';
export const TOY_RUNS_KEY = 'mm-toy-runs-v1';
export const RUN_REPO = 'Levi-Anthony/moon-miner';
export const RUN_ISSUE_TITLE_PREFIX = '[run-data]';
export const RUN_PACKED_MARKER = 'moon-miner-runs-z';
// GitHub rejects very long new-issue URLs; stay well under the practical limit.
export const RUN_ISSUE_URL_MAX = 7500;
const SUMMARY_LINES = 8;

// The fields every stored run has, whichever store it came from.
export interface AnyRun {
  id: string;
  at: string;
  mode: string;
  result: string;
  ore: number;
  quota: number;
  level?: number | null;
  levelName?: string | null;
  day?: number;
  sent?: boolean;
  [k: string]: unknown;
}

type Store = Pick<Storage, 'getItem' | 'setItem'>;

export const isToyRun = (r: AnyRun): boolean => String(r.mode).startsWith('toy:');
// Endless Night in 3D (night.html) logs to the toys' store in the toy Endless
// shape, under mode 'endless:3d'.
export const isEndless3d = (r: AnyRun): boolean => String(r.mode).startsWith('endless:');

function read(storage: Store | undefined, key: string): AnyRun[] {
  try {
    const raw = JSON.parse(storage?.getItem(key) ?? '[]');
    return Array.isArray(raw) ? (raw as AnyRun[]) : [];
  } catch {
    return [];
  }
}

function write(storage: Store | undefined, key: string, runs: AnyRun[]): void {
  try {
    storage?.setItem(key, JSON.stringify(runs));
  } catch {
    /* storage full or blocked: the runs stay unsent and ride along next time */
  }
}

// Every unsent run from both stores, oldest first.
export function unsentAll(storage: Store | undefined): AnyRun[] {
  return [...read(storage, MAIN_RUNS_KEY), ...read(storage, TOY_RUNS_KEY)]
    .filter((r) => !r.sent)
    .sort((a, b) => a.at.localeCompare(b.at));
}

// Every run from both stores, sent or not (the panel's "Send saved runs").
export function allRuns(storage: Store | undefined): AnyRun[] {
  return [...read(storage, MAIN_RUNS_KEY), ...read(storage, TOY_RUNS_KEY)].sort((a, b) => a.at.localeCompare(b.at));
}

// Mark these ids sent in whichever store holds them.
export function markSentAll(storage: Store | undefined, ids: Set<string>): void {
  for (const key of [MAIN_RUNS_KEY, TOY_RUNS_KEY]) {
    const runs = read(storage, key);
    if (runs.some((r) => ids.has(r.id))) write(storage, key, runs.map((r) => (ids.has(r.id) ? { ...r, sent: true } : r)));
  }
}

// deflate-raw + base64url of the records' JSON, local bookkeeping stripped.
// CompressionStream is in every current browser and in Node 18+.
export async function packRecords(records: AnyRun[]): Promise<string> {
  const json = JSON.stringify(records.map(({ sent: _sent, ...rest }) => rest));
  const stream = new Blob([json]).stream().pipeThrough(new CompressionStream('deflate-raw'));
  const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function what(r: AnyRun): string {
  if (isToyRun(r)) return String(r.mode).replace(/^toy:/, 'toy ').replace(':', ' ');
  if (isEndless3d(r)) return 'Endless Night 3D';
  if (r.mode === 'levels') return `L${r.level} ${r.levelName ?? ''}`.trim();
  return `day ${r.day ?? '?'}`;
}

export function sendTitle(records: AnyRun[]): string {
  const toys = records.filter(isToyRun).length;
  if (records.length === 1) return `${RUN_ISSUE_TITLE_PREFIX} ${what(records[0])} ${records[0].result}`;
  return `${RUN_ISSUE_TITLE_PREFIX} ${records.length} runs${toys ? ` (${toys} toy)` : ''}`;
}

export function sendBody(records: AnyRun[], packed: string): string {
  const shown = records.slice(-SUMMARY_LINES);
  const lines = shown.map((r) => `- ${r.at.slice(0, 16).replace('T', ' ')} · ${what(r)} · ${r.result} · ${r.ore}${r.quota ? `/${r.quota}` : ''} ore`);
  if (records.length > shown.length) lines.unshift(`- …and ${records.length - shown.length} earlier run${records.length - shown.length === 1 ? '' : 's'}`);
  return `${lines.join('\n')}\n\n\`\`\`${RUN_PACKED_MARKER}\n${packed}\n\`\`\`\n`;
}

// The newest runs that fit one new-issue link, and how many made it.
export async function sendAllUrl(records: AnyRun[], repo = RUN_REPO): Promise<{ url: string; count: number; toys: number }> {
  let n = records.length;
  for (;;) {
    const batch = records.slice(-n);
    const url = `https://github.com/${repo}/issues/new?title=${encodeURIComponent(sendTitle(batch))}&body=${encodeURIComponent(sendBody(batch, await packRecords(batch)))}`;
    // One at a time: compression gets better per run as the batch grows.
    if (url.length <= RUN_ISSUE_URL_MAX || n <= 1) return { url, count: n, toys: batch.filter(isToyRun).length };
    n -= 1;
  }
}

// "Send 12 runs (3 toy)" / "Send run data".
export function sendLabel(total: number, fits: number, toys: number): string {
  if (total === 0) return 'No unsent runs';
  const toyNote = toys ? ` (${toys} toy)` : '';
  if (total === 1) return toys ? 'Send 1 toy run' : 'Send run data';
  return fits < total ? `Send ${fits} of ${total} runs${toyNote}` : `Send ${total} runs${toyNote}`;
}
