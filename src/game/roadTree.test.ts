import { describe, expect, it } from 'vitest';
import { addPoint, advanceRail, createRoadTree, dropStubLine, farthestPoint, nearestRoad, railPoint, roadTips, startLine, type Rail } from './roadTree';

// A root line from home straight up (screen y is down) to y = -200, and a branch
// off its midpoint heading right to x = 150.
function tree() {
  const t = createRoadTree(64);
  const root = startLine(t, null, { x: 0, y: 0 });
  for (let y = -20; y >= -200; y -= 20) addPoint(t, root, { x: 0, y });
  const branch = startLine(t, { line: root, i: 4, t: 0.5 }, { x: 0, y: -90 });
  for (let x = 15; x <= 150; x += 15) addPoint(t, branch, { x, y: -90 });
  return { t, root, branch };
}

describe('road tree', () => {
  it('indexes each segment in the grid', () => {
    const { t } = tree();
    const refs = [...t.grid.values()].flat();
    expect(refs.some((r) => r.line === 0 && r.i === 0)).toBe(true);
    expect(refs.some((r) => r.line === 1 && r.i === 9)).toBe(true);
  });

  it('finds the nearest road and the point on it', () => {
    const { t } = tree();
    const hit = nearestRoad(t, { x: 10, y: -50 }, 0, -1, 12)!;
    expect(hit.line).toBe(0);
    expect(hit.d).toBeCloseTo(10);
    expect(hit.px).toBeCloseTo(0);
    expect(hit.py).toBeCloseTo(-50);
  });

  it('ignores the fresh end of the line being laid while heading on, not once turned back', () => {
    const t = createRoadTree(64);
    const line = startLine(t, null, { x: 0, y: 0 });
    for (let y = -14; y >= -140; y -= 14) addPoint(t, line, { x: 0, y });
    const up = -Math.PI / 2;
    expect(nearestRoad(t, { x: 0, y: -140 }, up, line, 12)).toBeNull();
    expect(nearestRoad(t, { x: 0, y: -140 }, -up, line, 12)?.d).toBeCloseTo(0);
    // Not laying it: it counts either way.
    expect(nearestRoad(t, { x: 0, y: -140 }, up, -1, 12)?.d).toBeCloseTo(0);
  });

  it('rides inward through the branch point to home', () => {
    const { t, branch } = tree();
    const r: Rail = { line: branch, i: 9, t: 1, dir: -1 };
    expect(advanceRail(t, r, 100)).toBe('ok');
    expect(r.line).toBe(branch);
    expect(advanceRail(t, r, 60)).toBe('ok');
    expect(r.line).toBe(0); // handed over to the root
    expect(railPoint(t, r).y).toBeCloseTo(-80);
    expect(advanceRail(t, r, 500)).toBe('home');
    expect(railPoint(t, r)).toMatchObject({ x: 0, y: 0 });
  });

  it('rides outward to the tip, heading along the line', () => {
    const { t, branch } = tree();
    const r: Rail = { line: branch, i: 0, t: 0, dir: 1 };
    expect(railPoint(t, r).ang).toBeCloseTo(0);
    expect(advanceRail(t, r, 1000)).toBe('tip');
    expect(railPoint(t, r).x).toBeCloseTo(150);
    r.dir = -1;
    expect(Math.abs(railPoint(t, r).ang)).toBeCloseTo(Math.PI);
  });

  it('drops a branch that never got a second point, and nothing else', () => {
    const { t, root } = tree();
    expect(dropStubLine(t, root)).toBe(false); // not the last line
    const stub = startLine(t, { line: root, i: 2, t: 0 }, { x: 0, y: -40 });
    expect(dropStubLine(t, stub)).toBe(true);
    expect(t.lines.length).toBe(2);
    expect(dropStubLine(t, 1)).toBe(false); // has segments
    const lone = createRoadTree();
    expect(dropStubLine(lone, startLine(lone, null, { x: 0, y: 0 }))).toBe(false); // the root stays
  });

  it('lists tips farthest first and finds the farthest point', () => {
    const { t } = tree();
    const tips = roadTips(t, 50, 4);
    expect(tips).toEqual([{ x: 0, y: -200 }, { x: 150, y: -90 }]);
    expect(roadTips(t, 190, 4)).toEqual([{ x: 0, y: -200 }]);
    expect(farthestPoint(t)).toEqual({ x: 0, y: -200 });
    expect(farthestPoint(createRoadTree())).toEqual({ x: 0, y: 0 });
  });
});
