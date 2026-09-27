import { describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { appendRuns, parseRunIssueBody } from './ingest-run.mjs';
import { RUN_ISSUE_URL_MAX, buildRunRecord, createRunStats, packRuns, runIssueBody, runIssueUrlPacked } from '../src/three/runRecord';

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
    expect(() => parseRunIssueBody('hello')).toThrow(/no ```json moon-miner-runs or ```moon-miner-runs-z block/);
    expect(() => parseRunIssueBody('```moon-miner-runs-z\nAAAA\n```')).toThrow(/could not be decompressed|not valid JSON/);
    expect(() => parseRunIssueBody('```json moon-miner-runs\n{oops\n```')).toThrow(/not valid JSON/);
    expect(() => parseRunIssueBody('```json moon-miner-runs\n[{"v":1}]\n```')).toThrow(/"id" should be a string/);
    const bad = { ...gameRecord(1), v: 2 };
    expect(() => parseRunIssueBody(runIssueBody([bad]))).toThrow(/unsupported version/);
  });

  // Issue #55: the button said "Send 30 runs" and the issue carried 3. Plain
  // JSON of one real run is ~2 KB URL-encoded (its knobs diff is most of it),
  // so a 7.5 KB link held 3. The game now packs the records.
  it('reads the packed block the game writes', async () => {
    const records = [gameRecord(1), gameRecord(2)];
    const parsed = parseRunIssueBody(runIssueBody(records, await packRuns(records)));
    expect(parsed.map((r) => r.id)).toEqual(records.map((r) => r.id));
    expect(parsed[0].knobs).toEqual({ terrain: { daylight: 3 } });
  });

  it('fits a session of 30 real-sized runs in one issue link', async () => {
    const knobs = {
      loop: { levelStockSlack: 2, arenaRegenShifts: 3, arenaScale: 2.5, shiftDecayPct: 0 },
      road: { roadWidthCars: 0.9, slurpBandPct: 0.76, slurpMinBoost: 0.3, laneGapCars: 2.6, railAccel: 710, cornerBraking: 0.8, reclaimBite: 50, lockAlign: 0.66, trackRate: 18.5 },
      tuning: { droneTetherRange: 12000, reclaimAimBias: 8.5, fabricatingSpeed: 87, railSpeed: 945, railGrip: 20000, oreSpread: 8, startingNanobots: 50, oreCount: 5.3, fabricateCostPerSecond: 0.15 },
      terrain: { craterSize: 2.25, daylight: 6, sunGain: 4.7 }
    };
    const runs = Array.from({ length: 30 }, (_, i) => {
      const r = buildRunRecord({
        state: {
          seed: `g-mukcmur0-4a68:S${Math.floor(i / 3)}`, phase: 'won', speedState: 'prepared', arms: { mining: 0 }, nanobots: 20,
          rover: { ore: 40 + i * 3.17 }, arena: { extraction: { oreRequired: 20 + (i % 7) } }, targetOre: 6,
          solarSeconds: 10 + ((i * 7.3) % 30), solarWindowSeconds: 60 + (i % 5) * 4, elapsedSeconds: 30 + ((i * 5.1) % 25)
        },
        stats: createRunStats(24),
        build: '0db8095', mode: 'levels',
        level: { index: i, name: `Last light +${i}`, startStock: 24, parSeconds: 50 + i * 0.7, parSeams: 4 },
        cleared: i % 4 !== 0, day: (i % 3) + 1, bonus: 100 + i * 13, slide: 2000 + i * 97,
        device: { w: 402, h: 812, touch: true }, knobs,
        now: new Date(Date.UTC(2026, 8, 27, 23, i, 0))
      });
      return r;
    });
    const { url, count } = await runIssueUrlPacked('Levi-Anthony/moon-miner', runs);
    expect(url.length).toBeLessThanOrEqual(RUN_ISSUE_URL_MAX);
    expect(count).toBe(30);
    const body = new URL(url).searchParams.get('body');
    expect(parseRunIssueBody(body).map((r) => r.id)).toEqual(runs.map((r) => r.id));
  });
});
