import { describe, expect, it } from 'vitest';
import { hexToWorld } from './hex';
import {
  createContinuousWorld,
  getDroneLiftSet,
  getReclaimPreview,
  getTrackDegree,
  type ContinuousTuning,
  type FieldPatch
} from './continuous';

// Build a world whose reclaim graph we control outright: clear the authored
// starter fields and drop in exactly the patches a test needs.
function world(overrides: Partial<ContinuousTuning>, fields: FieldPatch[], rover: { x: number; y: number; heading?: number }) {
  const w = createContinuousWorld('drone-test', { allowCloseReclaim: true, ...overrides });
  w.fields = fields;
  w.nextFieldId = fields.length + 1;
  w.rover.x = rover.x;
  w.rover.y = rover.y;
  if (rover.heading !== undefined) w.rover.heading = rover.heading;
  return w;
}
const patch = (id: number, x: number, y: number): FieldPatch => ({ id, x, y, radius: 44, value: 3, age: 6 });

describe('drone repurpose — tether / aim / loop protection', () => {
  it('tether: a target beyond droneTetherRange from home is not reclaimable', () => {
    // No extraction on first-run-readable, so home is the start; place one
    // isolated field far out past a short tether.
    const start = createContinuousWorld('drone-test').arena.start;
    const far = patch(1, start.x + 470, start.y);

    const tethered = world({ droneTetherRange: 300 }, [far], { x: start.x, y: start.y });
    expect(getReclaimPreview(tethered)).toBeUndefined();

    const loose = world({ droneTetherRange: 1e9 }, [far], { x: start.x, y: start.y });
    expect(getReclaimPreview(loose)?.targetPatchId).toBe(1);
  });

  it('aim: the rover facing biases which target the drone takes', () => {
    // Two isolated fields equidistant from the rover, dead ahead and behind.
    const behind = patch(1, 150, 300); // -x
    const ahead = patch(2, 450, 300); // +x
    const fields = [behind, ahead];

    // No bias: the deterministic tiebreak (lowest id) wins -> the one behind.
    const neutral = world({ reclaimAimBias: 0 }, fields, { x: 300, y: 300, heading: 0 });
    expect(getReclaimPreview(neutral)?.targetPatchId).toBe(1);

    // Facing +x with a strong bias flips the pick to the target ahead.
    const aimed = world({ reclaimAimBias: 3 }, fields, { x: 300, y: 300, heading: 0 });
    expect(getReclaimPreview(aimed)?.targetPatchId).toBe(2);
  });

  it('loop protection: the drone never lifts the junction that holds a Y together', () => {
    // A degree-3 junction on the hex lattice needs three PAIRWISE-non-adjacent
    // arm directions; these three alternate around the ring, so no two arms
    // touch except at J.
    const J = hexToWorld(0, 0, 16);
    const arm = (dq: number, dr: number, n: number, id0: number): FieldPatch[] =>
      Array.from({ length: n }, (_, i) => {
        const w = hexToWorld(dq * (i + 1), dr * (i + 1), 16);
        return patch(id0 + i, w.x, w.y);
      });
    const j = patch(1, J.x, J.y);
    const armA = arm(1, 0, 2, 2); // ids 2..3, A-end (id 3) is the target
    const armS = arm(0, -1, 7, 4); // ids 4..10
    const armB = arm(-1, 1, 8, 11); // ids 11..18
    const fields = [j, ...armA, ...armS, ...armB];
    const aEnd = armA[armA.length - 1];
    const rover = hexToWorld(3, 0, 16); // just past the A-end, so it's the nearest target

    const on = world({ reclaimProtectLoop: true }, fields, { x: rover.x, y: rover.y });
    expect(getTrackDegree(on, j)).toBe(3); // graph really is a 3-way junction
    const onIds = getDroneLiftSet(on).map((f) => f.id).sort((a, b) => a - b);
    expect(onIds).toContain(aEnd.id); // it does take the loose end it aimed at
    expect(onIds).not.toContain(j.id); // but never the junction -- the loop survives

    // Classic behaviour (protection off) takes the whole radius cluster, junction included.
    const off = world({ reclaimProtectLoop: false }, fields, { x: rover.x, y: rover.y });
    expect(getDroneLiftSet(off).map((f) => f.id)).toContain(j.id);
  });
});
