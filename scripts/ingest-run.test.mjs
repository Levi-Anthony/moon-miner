import { describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { appendRuns, parseRunIssueBody } from './ingest-run.mjs';
import { buildRunRecord, createRunStats, runIssueBody } from '../src/three/runRecord';

// The game writes the issue body (src/three/runRecord.ts); this script reads
// it back in the ingest-run workflow. If either side drifts, runs are lost
// again (DEV-61), so the round trip is tested end to end.
function gameRecord(second) {
  return buildRunRecord({
    state: {
      seed: 'g-roundtrip', phase: 'won', speedState: 'prepared', arms: { mining: 0 }, nanobots: 2,
      rover: { ore: 7.2 }, arena: { extraction: { oreRequired: 6 } }, targetOre: 6,
      solarSeconds: 20, solarWindowSeconds: 43, elapsedSeconds: 23
    },
    stats: createRunStats(4),
    build: 'abc1234',
    mode: 'levels',
    level: { index: 1, name: 'Two stops', startStock: 5, parSeconds: 30, parSeams: 2 },
    cleared: true,
    day: 1,
    bonus: 0,
    slide: 0,
    device: { w: 1280, h: 800, touch: false },
    knobs: { terrain: { daylight: 3 } },
    now: new Date(Date.UTC(2026, 8, 25, 2, 0, second))
  });
}

describe('ingest-run', () => {
  it('parses exactly what the game writes', () => {
    const records = [gameRecord(1), gameRecord(2)];
    const parsed = parseRunIssueBody(runIssueBody(records));
    expect(parsed.map((r) => r.id)).toEqual(records.map((r) => r.id));
    expect(parsed[0].knobs).toEqual({ terrain: { daylight: 3 } });
  });

  it('appends one line per new record and skips ones already stored', () => {
    const file = path.join(mkdtempSync(path.join(tmpdir(), 'runs-')), 'runs.jsonl');
    const first = appendRuns([gameRecord(1), gameRecord(2)], 'issue #1', file);
    const again = appendRuns([gameRecord(2), gameRecord(3)], 'issue #2', file);
    expect(first).toEqual({ added: 2, skipped: 0 });
    expect(again).toEqual({ added: 1, skipped: 1 });
    const lines = readFileSync(file, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
    expect(lines).toHaveLength(3);
    expect(lines[2].source).toBe('issue #2');
  });

  it('rejects bodies it cannot trust, with a reason', () => {
    expect(() => parseRunIssueBody('hello')).toThrow(/no ```json moon-miner-runs block/);
    expect(() => parseRunIssueBody('```json moon-miner-runs\n{oops\n```')).toThrow(/not valid JSON/);
    expect(() => parseRunIssueBody('```json moon-miner-runs\n[{"v":1}]\n```')).toThrow(/"id" should be a string/);
    const bad = { ...gameRecord(1), v: 2 };
    expect(() => parseRunIssueBody(runIssueBody([bad]))).toThrow(/unsupported version/);
  });
});
