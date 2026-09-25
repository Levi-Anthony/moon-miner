import { describe, expect, it } from 'vitest';
import type { ContinuousWorldState } from '../game/continuous';
import {
  RUN_HISTORY_MAX,
  RUN_ISSUE_TITLE_PREFIX,
  RUN_ISSUE_URL_MAX,
  RUN_JSON_MARKER,
  accumulateRunStats,
  appendRun,
  buildRunRecord,
  createRunStats,
  diffKnobs,
  loadRunHistory,
  runIssueBody,
  runIssueUrl,
  saveRunHistory,
  unsentRuns,
  type RunRecord
} from './runRecord';

// Run data has vanished three times without anyone noticing (DEV-61). These
// tests pin the record's shape and the path out of the browser, so removing or
// breaking capture fails CI instead of failing silently.

function fakeState(over: Partial<Record<string, unknown>> = {}): ContinuousWorldState {
  return {
    seed: 'g-test',
    phase: 'won',
    speedState: 'fabricating',
    arms: { mining: 0 },
    nanobots: 3.2,
    rover: { x: 0, y: 0, heading: 0, ore: 6.66 },
    arena: { extraction: { oreRequired: 6 } },
    targetOre: 6,
    solarSeconds: 31.52,
    solarWindowSeconds: 43,
    elapsedSeconds: 11.48,
    ...over
  } as unknown as ContinuousWorldState;
}

function record(i: number, extra: Partial<RunRecord> = {}): RunRecord {
  return {
    ...buildRunRecord({
      state: fakeState(),
      stats: createRunStats(4),
      build: 'abc1234',
      mode: 'levels',
      level: { index: 0, name: 'First haul', startStock: 4, parSeconds: 20.4, parSeams: 1 },
      cleared: true,
      day: 1,
      bonus: 12.7,
      slide: 300.4,
      device: { w: 390, h: 844, touch: true },
      knobs: {},
      now: new Date(Date.UTC(2026, 8, 25, 1, 0, i))
    }),
    ...extra
  };
}

describe('run record', () => {
  it('captures the level outcome in plain fields', () => {
    const r = record(0);
    expect(r).toMatchObject({
      v: 1,
      build: 'abc1234',
      seed: 'g-test',
      mode: 'levels',
      level: 1,
      levelName: 'First haul',
      result: 'cleared',
      ore: 6.66,
      quota: 6,
      sunLeft: 31.5,
      sunWindow: 43,
      bonus: 12,
      slide: 300,
      parSeams: 1
    });
    expect(r.at).toBe('2026-09-25T01:00:00.000Z');
  });

  it('names a miss by how it ended', () => {
    const base = { stats: createRunStats(4), build: 'x', level: null, day: 2, bonus: 0, slide: 0, device: { w: 1, h: 1, touch: false }, knobs: {} };
    expect(buildRunRecord({ ...base, state: fakeState({ phase: 'won' }), mode: 'levels', cleared: false }).result).toBe('under-quota');
    expect(buildRunRecord({ ...base, state: fakeState({ phase: 'lost' }), mode: 'levels', cleared: false }).result).toBe('lost');
    expect(buildRunRecord({ ...base, state: fakeState({ phase: 'lost' }), mode: 'sandbox', cleared: false }).result).toBe('sandbox-lost');
  });

  it('accumulates time per speed state, mining time, lowest stock and distance while playing', () => {
    const stats = createRunStats(4);
    accumulateRunStats(stats, fakeState({ phase: 'playing', speedState: 'prepared', nanobots: 2 }), 0.5, 10);
    accumulateRunStats(stats, fakeState({ phase: 'playing', speedState: 'crawl', arms: { mining: 1 }, nanobots: 1 }), 0.25, 1);
    accumulateRunStats(stats, fakeState({ phase: 'won', speedState: 'crawl', nanobots: 0 }), 5, 99); // ignored: run over
    expect(stats.seconds).toEqual({ prepared: 0.5, fabricating: 0, crawl: 0.25 });
    expect(stats.miningSeconds).toBe(0.25);
    expect(stats.minStock).toBe(1);
    expect(stats.distance).toBe(11);
  });

  it('keeps only knobs that differ from the defaults', () => {
    const knobs = diffKnobs({
      terrain: { current: { roadShadow: 0.6, daylight: 3 }, defaults: { roadShadow: 0.6, daylight: 5 } },
      road: { current: { a: 1 }, defaults: { a: 1 } }
    });
    expect(knobs).toEqual({ terrain: { daylight: 3 } });
  });
});

describe('run history', () => {
  it('caps history and tracks what is unsent', () => {
    let runs: RunRecord[] = [];
    for (let i = 0; i < RUN_HISTORY_MAX + 5; i += 1) runs = appendRun(runs, record(i, { sent: i < 10 }));
    expect(runs).toHaveLength(RUN_HISTORY_MAX);
    expect(unsentRuns(runs).every((r) => !r.sent)).toBe(true);
  });

  it('survives missing or broken storage', () => {
    expect(loadRunHistory(undefined)).toEqual([]);
    expect(loadRunHistory({ getItem: () => '{not json' })).toEqual([]);
    expect(saveRunHistory(undefined, [record(0)])).toBe(false);
    expect(saveRunHistory({ setItem: () => { throw new Error('full'); } }, [record(0)])).toBe(false);
    const mem = new Map<string, string>();
    const store = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v) };
    expect(saveRunHistory(store, [record(0)])).toBe(true);
    expect(loadRunHistory(store)).toHaveLength(1);
  });
});

describe('issue hand-off', () => {
  it('fences the records as JSON and drops local bookkeeping', () => {
    const body = runIssueBody([record(0, { sent: true })]);
    expect(body).toContain('```json ' + RUN_JSON_MARKER);
    const json = body.split('```json ' + RUN_JSON_MARKER + '\n')[1].split('\n```')[0];
    const parsed = JSON.parse(json);
    expect(parsed[0].sent).toBeUndefined();
    expect(parsed[0].id).toBe(record(0).id);
  });

  it('builds a new-issue URL under the length limit, keeping the newest runs', () => {
    const many = Array.from({ length: 40 }, (_, i) => record(i));
    const { url, count } = runIssueUrl('Levi-Anthony/moon-miner', many);
    expect(url.startsWith('https://github.com/Levi-Anthony/moon-miner/issues/new?title=')).toBe(true);
    expect(url.length).toBeLessThanOrEqual(RUN_ISSUE_URL_MAX);
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(40);
    const title = decodeURIComponent(new URL(url).searchParams.get('title') ?? '');
    expect(title.startsWith(RUN_ISSUE_TITLE_PREFIX)).toBe(true);
    const body = new URL(url).searchParams.get('body') ?? '';
    expect(body).toContain(many[39].id); // newest kept
    expect(body).not.toContain(many[0].id); // oldest dropped
  });
});
