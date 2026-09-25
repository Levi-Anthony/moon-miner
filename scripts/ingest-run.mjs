// Ingest run records from a "[run-data]" GitHub issue into data/runs/runs.jsonl.
//
// The live build can't write to the repo (a static page can't hold a token), so
// the game opens a pre-filled issue and the owner submits it. The ingest-run
// workflow runs this against the issue event; it validates the fenced JSON the
// game wrote (src/three/runRecord.ts), appends new records one per line, and
// skips any already stored (same id), so re-submitting an issue is harmless.
//
//   node scripts/ingest-run.mjs                 # reads the issue from $GITHUB_EVENT_PATH
//   node scripts/ingest-run.mjs --body file.md  # or from a file, for local testing
import { existsSync, mkdirSync, readFileSync, appendFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = fileURLToPath(new URL('..', import.meta.url));
export const RUNS_FILE = path.join(PROJECT_ROOT, 'data', 'runs', 'runs.jsonl');
// Must match RUN_JSON_MARKER in src/three/runRecord.ts.
const MARKER = 'moon-miner-runs';
const REQUIRED = { v: 'number', id: 'string', at: 'string', seed: 'string', mode: 'string', result: 'string', ore: 'number', quota: 'number' };

export function parseRunIssueBody(body) {
  const fence = new RegExp('```json ' + MARKER + '\\s*\\n([\\s\\S]*?)\\n```');
  const hit = String(body ?? '').match(fence);
  if (!hit) throw new Error(`no \`\`\`json ${MARKER} block found in the issue body`);
  let parsed;
  try {
    parsed = JSON.parse(hit[1]);
  } catch (e) {
    throw new Error(`run data is not valid JSON: ${e.message}`);
  }
  const records = Array.isArray(parsed) ? parsed : [parsed];
  if (!records.length) throw new Error('run data block is empty');
  records.forEach((record, i) => {
    if (!record || typeof record !== 'object') throw new Error(`record ${i + 1} is not an object`);
    for (const [key, type] of Object.entries(REQUIRED)) {
      if (typeof record[key] !== type) throw new Error(`record ${i + 1}: "${key}" should be a ${type}`);
    }
    if (record.v !== 1) throw new Error(`record ${i + 1}: unsupported version ${record.v}`);
    if (Number.isNaN(Date.parse(record.at))) throw new Error(`record ${i + 1}: "at" is not a date`);
  });
  return records;
}

export function storedIds(file = RUNS_FILE) {
  if (!existsSync(file)) return new Set();
  return new Set(
    readFileSync(file, 'utf8')
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line).id;
        } catch {
          return undefined;
        }
      })
      .filter(Boolean)
  );
}

// Returns { added, skipped }. `source` is stamped on each stored line so a
// record can be traced back to the issue it came from.
export function appendRuns(records, source, file = RUNS_FILE) {
  mkdirSync(path.dirname(file), { recursive: true });
  const have = storedIds(file);
  const fresh = records.filter((record) => !have.has(record.id));
  if (fresh.length) appendFileSync(file, fresh.map((record) => JSON.stringify({ ...record, source })).join('\n') + '\n');
  return { added: fresh.length, skipped: records.length - fresh.length };
}

function arg(name) {
  const hit = process.argv.indexOf(`--${name}`);
  return hit === -1 ? undefined : process.argv[hit + 1];
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  // The workflow posts this file back to the issue with `gh --body-file`. It can
  // contain text from the issue (JSON parse errors quote their input), so it goes
  // through a file and is never interpolated into a shell command.
  const messageFile = arg('message-file');
  const report = (message) => {
    if (messageFile) writeFileSync(messageFile, message + '\n');
  };
  try {
    let body;
    let source = 'local';
    const bodyFile = arg('body');
    if (bodyFile) {
      body = readFileSync(bodyFile, 'utf8');
    } else {
      const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
      body = event.issue?.body;
      source = `issue #${Number(event.issue?.number)}`;
    }
    const records = parseRunIssueBody(body);
    const { added, skipped } = appendRuns(records, source);
    const message = `Stored ${added} run record(s) in \`data/runs/runs.jsonl\`${skipped ? ` (${skipped} already stored)` : ''}.`;
    console.log(message);
    report(message);
    if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `added=${added}\n`);
  } catch (e) {
    const message = `Could not store this run data: ${e.message}`;
    console.error(message);
    report(message);
    process.exit(1);
  }
}
