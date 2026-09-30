import { describe, expect, it } from 'vitest';
// @ts-expect-error plain .mjs script without types
import { parseRunIssueBody } from '../../scripts/ingest-run.mjs';
import { MAIN_RUNS_KEY, RUN_ISSUE_URL_MAX, TOY_RUNS_KEY, markSentAll, sendAllUrl, sendLabel, unsentAll, type AnyRun } from './sendAll';

function fakeStorage(init: Record<string, unknown>): Pick<Storage, 'getItem' | 'setItem'> & { data: Map<string, string> } {
  const data = new Map(Object.entries(init).map(([k, v]) => [k, JSON.stringify(v)]));
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) };
}

const run = (id: string, at: string, mode: string, sent = false): AnyRun => ({
  v: 1, id, at, seed: 's', mode, result: 'won', ore: 10, quota: 8, level: mode === 'levels' ? 3 : null, ...(sent ? { sent: true } : {})
});

function seeded() {
  return fakeStorage({
    [MAIN_RUNS_KEY]: [run('m0', '2026-09-30T10:00:00Z', 'levels', true), run('m1', '2026-09-30T10:05:00Z', 'levels'), run('m2', '2026-09-30T10:20:00Z', 'levels')],
    [TOY_RUNS_KEY]: [run('t1', '2026-09-30T10:01:00Z', 'toy:home-run:contract'), run('t2', '2026-09-30T10:10:00Z', 'toy:home-run:endless'), run('t3', '2026-09-30T10:30:00Z', 'toy:terminator')]
  });
}

describe('one send for all runs', () => {
  it('collects unsent runs from both stores in time order', () => {
    expect(unsentAll(seeded()).map((r) => r.id)).toEqual(['t1', 'm1', 't2', 'm2', 't3']);
  });

  it('builds a link the ingest reads back as both kinds', async () => {
    const records = unsentAll(seeded());
    const { url, count, toys } = await sendAllUrl(records);
    expect(count).toBe(5);
    expect(toys).toBe(3);
    expect(url.length).toBeLessThanOrEqual(RUN_ISSUE_URL_MAX);
    const params = new URL(url).searchParams;
    expect(params.get('title')).toBe('[run-data] 5 runs (3 toy)');
    const parsed = parseRunIssueBody(params.get('body')) as AnyRun[];
    expect(parsed.map((r) => r.id)).toEqual(['t1', 'm1', 't2', 'm2', 't3']);
    expect(parsed.every((r) => !('sent' in r))).toBe(true);
  });

  it('marks sent in whichever store holds the run', () => {
    const s = seeded();
    markSentAll(s, new Set(['m1', 't2']));
    const main = JSON.parse(s.data.get(MAIN_RUNS_KEY)!) as AnyRun[];
    const toys = JSON.parse(s.data.get(TOY_RUNS_KEY)!) as AnyRun[];
    expect(main.filter((r) => r.sent).map((r) => r.id)).toEqual(['m0', 'm1']);
    expect(toys.filter((r) => r.sent).map((r) => r.id)).toEqual(['t2']);
    expect(unsentAll(s).map((r) => r.id)).toEqual(['t1', 'm2', 't3']);
  });

  it('labels the button with both kinds', () => {
    expect(sendLabel(0, 0, 0)).toBe('No unsent runs');
    expect(sendLabel(1, 1, 0)).toBe('Send run data');
    expect(sendLabel(1, 1, 1)).toBe('Send 1 toy run');
    expect(sendLabel(5, 5, 3)).toBe('Send 5 runs (3 toy)');
    expect(sendLabel(60, 40, 3)).toBe('Send 40 of 60 runs (3 toy)');
  });
});
