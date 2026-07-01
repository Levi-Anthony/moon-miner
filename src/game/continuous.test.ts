import { describe, expect, it } from 'vitest';
import {
  createContinuousWorld,
  getReclaimPreview,
  launchReclaimDrone,
  tickContinuousWorld,
  type ContinuousWorldState
} from './continuous';
import { CONTINUOUS_ARENAS } from './continuousArena';
import {
  createContinuousLoopTrace,
  getContinuousLoopSummary,
  recordContinuousLoopDroneLaunch,
  recordContinuousLoopTick
} from './continuousTrace';
import { runContinuousSelfPlay } from './continuousSelfPlay';

const straightInput = { steer: 0, throttle: 1 };
const idleInput = { steer: 0, throttle: 0, driveIntent: false };

describe('continuous Moon Miner spike rules', () => {
  it('creates deterministic continuous worlds from the same seed', () => {
    const first = createContinuousWorld('same-seed');
    const second = createContinuousWorld('same-seed');

    expect(first.fields).toEqual(second.fields);
    expect(first.fertileZones).toEqual(second.fertileZones);
  });

  it('stages the starter level as runway, temptation, and recovery pockets', () => {
    const world = createContinuousWorld();

    expect(world.arenaId).toBe('first-run-readable');
    expect(world.arena.label).toBe('Readable First Run');
    expect(world.fields.length).toBeGreaterThanOrEqual(9);
    expect(world.fields[0].x).toBeLessThan(world.rover.x);
    expect(world.fields[world.fields.length - 1].x).toBeGreaterThan(400);
    expect(world.fertileZones.map((zone) => zone.id)).toEqual([
      'runway-pocket',
      'temptation-lobe',
      'recovery-pocket'
    ]);
    expect(world.fertileZones[0].x).toBeGreaterThan(world.rover.x);
    expect(world.fertileZones[1].y).toBeLessThan(world.fertileZones[0].y - 80);
    expect(world.fertileZones[2].y).toBeGreaterThan(world.fertileZones[0].y + 90);
    expect(world.fertileZones.every((zone) => zone.vein)).toBe(true);
    expect(world.fertileZones[1].vein?.to.x).toBeGreaterThan(world.fertileZones[1].vein?.from.x ?? 0);
    expect(world.arena.ridges.length).toBeLessThanOrEqual(3);
  });

  it('can create named arena variants without mixing them into dynamics tuning', () => {
    const readable = createContinuousWorld('same-seed', { preparedSpeed: 125 }, 'first-run-readable');
    const tight = createContinuousWorld('same-seed', { preparedSpeed: 125 }, 'first-run-tight');

    expect(Object.keys(CONTINUOUS_ARENAS)).toEqual(['first-run-readable', 'first-run-tight']);
    expect(readable.tuning.preparedSpeed).toBe(125);
    expect(tight.tuning.preparedSpeed).toBe(125);
    expect(readable.arenaId).toBe('first-run-readable');
    expect(tight.arenaId).toBe('first-run-tight');
    expect(readable.fields).not.toEqual(tight.fields);
    expect(readable.fertileZones[1].x).toBeGreaterThan(tight.fertileZones[1].x);
    expect(readable.fertileZones[1].vein).not.toEqual(tight.fertileZones[1].vein);
  });

  it('treats authored fertile seams as directional bands instead of circular mining blobs', () => {
    const world = createContinuousWorld();
    const seam = world.fertileZones[1];
    expect(seam.vein).toBeDefined();

    world.rover.x = seam.vein?.from.x ?? seam.x;
    world.rover.y = seam.vein?.from.y ?? seam.y;
    expect(tickContinuousWorld(world, { steer: 0, throttle: 0, brake: true }, 0.1).lastYieldRate).toBeGreaterThan(0);

    world.rover.x = seam.x + seam.radius * 0.72;
    world.rover.y = seam.y + seam.radius * 0.72;
    expect(tickContinuousWorld(world, { steer: 0, throttle: 0, brake: true }, 0.1).lastYieldRate).toBe(0);
  });

  it('idles on raw terrain without moving, printing field, or mining when there is no drive intent', () => {
    const world = createContinuousWorld();
    const seam = world.fertileZones[0];
    const veinStart = seam.vein?.from ?? seam;
    world.fields = [];
    world.rover.x = veinStart.x;
    world.rover.y = veinStart.y;
    world.rover.heading = seam.vein ? Math.atan2(seam.vein.to.y - seam.vein.from.y, seam.vein.to.x - seam.vein.from.x) : 0;
    const start = { ...world.rover };
    const nanobots = world.nanobots;

    const next = tickContinuousWorld(world, { steer: 1, throttle: 1, driveIntent: false }, 0.6);

    expect(next.rover.x).toBe(start.x);
    expect(next.rover.y).toBe(start.y);
    expect(next.rover.speed).toBe(0);
    expect(next.rover.ore).toBe(start.ore);
    expect(next.lastYieldRate).toBe(0);
    expect(next.fields).toEqual([]);
    expect(next.nanobots).toBe(nanobots);
    expect(next.solarSeconds).toBeLessThan(world.solarSeconds);
  });

  it('infers no drive intent from omitted intent when throttle is zero', () => {
    const world = createContinuousWorld();
    world.fields = [];
    world.rover.heading = 0;
    const start = { ...world.rover };

    const next = tickContinuousWorld(world, { steer: 1, throttle: 0 }, 0.6);

    expect(next.rover.x).toBe(start.x);
    expect(next.rover.y).toBe(start.y);
    expect(next.rover.heading).toBe(start.heading);
    expect(next.rover.speed).toBe(0);
    expect(next.fields).toEqual([]);
  });

  it('moves and fabricates only when explicit throttle creates drive intent', () => {
    const world = createContinuousWorld();
    world.fields = [];
    world.nanobots = 6;
    const start = { ...world.rover };

    const next = tickContinuousWorld(world, { steer: 0, throttle: 1 }, 0.7);

    expect(next.rover.x).toBeGreaterThan(start.x);
    expect(next.rover.speed).toBeGreaterThan(0);
    expect(next.nanobots).toBeLessThan(6);
    expect(next.fields.length).toBeGreaterThan(0);
  });

  it('keeps mining while parked on a prepared seam', () => {
    const world = placeRoverAtVeinStart(createContinuousWorld(), 0);
    const start = { ...world.rover };
    const fieldCount = world.fields.length;

    const next = tickContinuousWorld(world, { steer: 0, throttle: 0, driveIntent: false }, 0.8);

    expect(next.speedState).toBe('prepared');
    expect(next.rover.x).toBe(start.x);
    expect(next.rover.y).toBe(start.y);
    expect(next.rover.speed).toBe(0);
    expect(next.fields.length).toBe(fieldCount);
    expect(next.rover.ore).toBeGreaterThan(start.ore);
    expect(next.lastYieldRate).toBeGreaterThan(0);
    expect(next.message).toBe('Mining arms harvesting while parked on prepared field.');
  });

  it('rewards fast aligned vein passes more than slow crosswise loitering', () => {
    const aligned = placeRoverInSecondFertileZone(createContinuousWorld());
    const crosswise = placeRoverInSecondFertileZone(createContinuousWorld());
    const vein = aligned.fertileZones[1].vein;
    if (!vein) throw new Error('expected authored vein');

    aligned.rover.heading = Math.atan2(vein.to.y - vein.from.y, vein.to.x - vein.from.x);
    crosswise.rover.heading = aligned.rover.heading + Math.PI / 2;

    const alignedNext = tickContinuousWorld(aligned, { steer: 0, throttle: 1 }, 0.1);
    const crosswiseNext = tickContinuousWorld(crosswise, { steer: 0, throttle: 0, brake: true }, 0.1);

    expect(alignedNext.lastYieldRate).toBeGreaterThan(crosswiseNext.lastYieldRate * 5);
  });

  it('lets a clean rally pass mostly sweep an average deposit', () => {
    const world = placeRoverAtVeinStart(createContinuousWorld(), 0);
    makeRawTraversalWorld(world);
    const zone = world.fertileZones[0];
    const startRemaining = zone.remaining;

    const next = driveAlongCurrentVein(world, 0, 0.35, 'fabricating');

    expect(startRemaining).toBeLessThanOrEqual(10);
    expect(next.fertileZones[0].remaining).toBeLessThan(startRemaining * 0.28);
    expect(next.rover.ore).toBeGreaterThan(startRemaining * 0.7);
  });

  it('leaves a readable choice on the larger temptation deposit after one pass', () => {
    const world = placeRoverAtVeinStart(createContinuousWorld(), 1);
    makeRawTraversalWorld(world);
    const startRemaining = world.fertileZones[1].remaining;

    const next = driveAlongCurrentVein(world, 1, 0.35, 'fabricating');

    expect(startRemaining).toBeGreaterThan(12);
    expect(next.fertileZones[1].remaining).toBeGreaterThan(1);
    expect(next.fertileZones[1].remaining).toBeLessThan(startRemaining * 0.45);
  });

  it('sprints on prepared field without spending nanobots', () => {
    const world = createContinuousWorld();
    world.fields = [
      {
        id: 99,
        x: world.rover.x,
        y: world.rover.y,
        radius: 600,
        value: 1,
        age: 4
      }
    ];
    const nanobots = world.nanobots;

    const next = tickContinuousWorld(world, straightInput, 0.4);

    expect(next.speedState).toBe('prepared');
    expect(next.rover.speed).toBeGreaterThan(80);
    expect(next.rover.speed).toBeLessThan(95);
    expect(next.nanobots).toBe(nanobots);
  });

  it('magnetizes prepared field enough to hold a passive line', () => {
    const world = createPreparedLaneWorld(30);
    const startY = world.rover.y;

    const next = tickContinuousWorld(world, straightInput, 0.42);

    expect(next.speedState).toBe('prepared');
    expect(next.rover.y).toBeLessThan(startY - 4);
    expect(next.rover.heading).toBeLessThan(-0.04);
  });

  it('lets active steering pull away from prepared field while resisting the turn', () => {
    const centered = createPreparedLaneWorld(0);
    const offset = createPreparedLaneWorld(30);

    const freeTurn = tickContinuousWorld(centered, { steer: 1, throttle: 1 }, 0.22);
    const resistedTurn = tickContinuousWorld(offset, { steer: 1, throttle: 1 }, 0.22);

    expect(resistedTurn.rover.heading).toBeGreaterThan(0.05);
    expect(resistedTurn.rover.heading).toBeLessThan(freeTurn.rover.heading - 0.03);
  });

  it('uses supplied tuning values for continuous dynamics', () => {
    const world = createContinuousWorld('tuned-speed', {
      startingNanobots: 9,
      startingSolarSeconds: 80,
      preparedSpeed: 132
    });
    world.fields = [
      {
        id: 99,
        x: world.rover.x,
        y: world.rover.y,
        radius: 600,
        value: 1,
        age: 4
      }
    ];

    const next = tickContinuousWorld(world, straightInput, 0.1);

    expect(world.nanobots).toBe(9);
    expect(world.solarSeconds).toBe(80);
    expect(next.rover.speed).toBeCloseTo(132);
  });

  it('fabricates field on raw terrain by spending nanobots', () => {
    const world = createContinuousWorld();
    world.fields = [];
    world.nanobots = 6;

    const next = tickContinuousWorld(world, straightInput, 0.7);

    expect(next.nanobots).toBeLessThan(6);
    expect(next.fields.length).toBeGreaterThan(0);
    expect(next.fields.some((field) => field.value > 0)).toBe(true);
  });

  it('falls into emergency crawl instead of a hard stop when field-starved', () => {
    const world = createContinuousWorld();
    world.fields = [];
    world.nanobots = 0;

    const next = tickContinuousWorld(world, straightInput, 0.7);

    expect(next.phase).toBe('playing');
    expect(next.speedState).toBe('crawl');
    expect(next.rover.speed).toBeLessThan(30);
    expect(next.nanobots).toBeGreaterThan(0);
  });

  it('lets the autonomous drone reclaim old field and deliver payload to the moving rover', () => {
    const world = createContinuousWorld();
    world.nanobots = 8;
    world.fields = [
      { id: 1, x: world.rover.x - 160, y: world.rover.y, radius: 44, value: 5, age: 6 },
      { id: 2, x: world.rover.x - 184, y: world.rover.y + 8, radius: 44, value: 3, age: 5 }
    ];
    world.nextFieldId = 3;

    let next = launchReclaimDrone(world).state;
    expect(next.drone.status).toBe('outbound');

    for (let index = 0; index < 240 && next.drone.status !== 'ready'; index += 1) {
      next = tickContinuousWorld(next, idleInput, 0.05);
    }

    expect(next.drone.status).toBe('ready');
    expect(next.nanobots).toBeGreaterThan(world.nanobots);
    expect(next.fields.some((field) => field.id === 1 || field.id === 2)).toBe(false);
  });

  it('keeps valuable laid field persistent even beyond the emergency residue cap', () => {
    const world = createContinuousWorld();
    world.fields = Array.from({ length: 1220 }, (_, index) => ({
      id: index + 1,
      x: 80 + (index % 80) * 10,
      y: 160 + Math.floor(index / 80) * 12,
      radius: 44,
      value: 0.9,
      age: 30 + index * 0.01
    }));
    world.nextFieldId = 1221;
    const oldFieldId = world.fields[0].id;

    const next = tickContinuousWorld(world, idleInput, 0.1);

    expect(next.fields.some((field) => field.id === oldFieldId)).toBe(true);
    expect(next.fields.length).toBe(1220);
  });

  it('previews the same reclaim target and payload that launch commits to', () => {
    const world = createDroneRouteWorld();

    const preview = getReclaimPreview(world);
    const launched = launchReclaimDrone(world).state;

    expect(preview).toBeDefined();
    expect(preview?.targetPatchId).toBe(launched.drone.targetPatchId);
    expect(preview?.fieldCount).toBe(2);
    expect(preview?.payload).toBeCloseTo(9);
    expect(preview?.etaSeconds).toBeCloseTo(distance(world.rover, launched.drone.target ?? world.rover) / world.tuning.droneSpeed);
  });

  it('does not preview nearby, fresh, or low-value field as reclaimable', () => {
    const world = createContinuousWorld();
    world.fields = [
      { id: 1, x: world.rover.x - 120, y: world.rover.y, radius: 44, value: 1, age: 1 },
      { id: 2, x: world.rover.x - 40, y: world.rover.y, radius: 44, value: 1, age: 8 },
      { id: 3, x: world.rover.x - 180, y: world.rover.y, radius: 26, value: 0.025, age: 8 }
    ];
    world.nextFieldId = 4;

    expect(getReclaimPreview(world)).toBeUndefined();
  });

  it('reclaims only the selected old field cluster and leaves distant field in place', () => {
    const world = createContinuousWorld();
    world.nanobots = 8;
    world.fields = [
      { id: 1, x: world.rover.x - 170, y: world.rover.y, radius: 44, value: 5, age: 6 },
      { id: 2, x: world.rover.x - 206, y: world.rover.y + 10, radius: 44, value: 4, age: 6 },
      { id: 3, x: world.rover.x + 260, y: world.rover.y, radius: 44, value: 3, age: 6 }
    ];
    world.nextFieldId = 4;

    let next = launchReclaimDrone(world).state;
    for (let index = 0; index < 240 && next.drone.status !== 'ready'; index += 1) {
      next = tickContinuousWorld(next, idleInput, 0.05);
    }

    expect(next.drone.status).toBe('ready');
    expect(next.fields.some((field) => field.id === 1 || field.id === 2)).toBe(false);
    expect(next.fields.some((field) => field.id === 3)).toBe(true);
  });

  it('makes drone return slower when the rover keeps driving away', () => {
    const parkedTicks = ticksUntilDroneReady(
      launchReclaimDrone(createDroneRouteWorld()).state,
      () => idleInput,
      260
    );
    const fleeingTicks = ticksUntilDroneReady(
      launchReclaimDrone(createDroneRouteWorld()).state,
      (world) => tickInputToward(world, { x: 910, y: 240 }),
      260
    );

    expect(parkedTicks).toBeGreaterThan(0);
    expect(fleeingTicks).toBeGreaterThan(parkedTicks + 3);
  });

  it('mines faster when prepared field frees arm capacity', () => {
    const prepared = placeRoverInFirstFertileZone(createContinuousWorld());
    prepared.fields = [
      {
        id: 50,
        x: prepared.rover.x,
        y: prepared.rover.y,
        radius: 500,
        value: 1,
        age: 4
      }
    ];

    const raw = placeRoverInFirstFertileZone(createContinuousWorld());
    raw.fields = [];
    raw.nanobots = 20;

    const preparedNext = tickContinuousWorld(prepared, straightInput, 0.1);
    const rawNext = tickContinuousWorld(raw, straightInput, 0.1);

    expect(preparedNext.rover.ore).toBeGreaterThan(rawNext.rover.ore);
    expect(preparedNext.arms.mining).toBeGreaterThan(rawNext.arms.mining);
  });

  it('loses when the solar window closes before quota', () => {
    const world = createContinuousWorld();
    world.solarSeconds = 0.1;

    const next = tickContinuousWorld(world, straightInput, 0.2);

    expect(next.phase).toBe('lost');
    expect(next.message).toBe('Solar window closed before the extraction quota.');
  });

  it('can demonstrate abundance, overextension, crawl, and drone recovery in the starter route', () => {
    const result = runContinuousSelfPlay();
    const speedKinds = new Set(result.trace.events.map((event) => event.speedState));

    expect(result.summary.hitLoop).toBe(true);
    expect(result.summary.droneLaunches).toBe(1);
    expect(result.summary.droneDeliveries).toBeGreaterThan(0);
    expect(result.summary.elapsedSeconds).toBeGreaterThanOrEqual(75);
    expect(result.summary.elapsedSeconds).toBeLessThanOrEqual(90);
    expect(result.summary.speedSeconds.fabricating).toBeGreaterThan(10);
    expect(result.summary.speedSeconds.crawl).toBeGreaterThan(8);
    expect(speedKinds.has('prepared')).toBe(true);
    expect(speedKinds.has('fabricating')).toBe(true);
    expect(speedKinds.has('crawl')).toBe(true);
    expect(result.state.rover.ore).toBeGreaterThan(1);
  });

  it('records whether the starter self-play route hits the intended loop', () => {
    const { summary, trace } = runContinuousSelfPlay();

    expect(summary.hitLoop).toBe(true);
    expect(summary.milestones.map((milestone) => [milestone.id, milestone.hit])).toEqual([
      ['preparedAbundance', true],
      ['overextension', true],
      ['emergencyCrawl', true],
      ['droneRecovery', true]
    ]);
    expect(summary.droneLaunches).toBe(1);
    expect(summary.droneDeliveries).toBeGreaterThan(0);
    expect(summary.deliveredNanobotsAfterCrawl).toBeGreaterThan(0);
    expect(trace.events.map((event) => event.kind)).toContain('droneRecovery');
  });

  it('runs the self-play route against the requested arena variant', () => {
    const result = runContinuousSelfPlay({ arenaId: 'first-run-tight' });

    expect(result.state.arenaId).toBe('first-run-tight');
    expect(result.summary.droneLaunches).toBe(1);
    expect(result.summary.milestones.some((milestone) => milestone.id === 'preparedAbundance' && milestone.hit)).toBe(true);
  });
});

function placeRoverInFirstFertileZone(world: ContinuousWorldState): ContinuousWorldState {
  const zone = world.fertileZones[0];
  world.rover.x = zone.x;
  world.rover.y = zone.y;
  world.rover.heading = 0;
  return world;
}

function placeRoverInSecondFertileZone(world: ContinuousWorldState): ContinuousWorldState {
  const zone = world.fertileZones[1];
  world.rover.x = zone.x;
  world.rover.y = zone.y;
  world.rover.heading = 0;
  return world;
}

function placeRoverAtVeinStart(world: ContinuousWorldState, zoneIndex: number): ContinuousWorldState {
  const zone = world.fertileZones[zoneIndex];
  if (!zone.vein) throw new Error('expected authored vein');

  world.rover.x = zone.vein.from.x;
  world.rover.y = zone.vein.from.y;
  world.rover.heading = Math.atan2(zone.vein.to.y - zone.vein.from.y, zone.vein.to.x - zone.vein.from.x);
  world.fields = [
    {
      id: 99,
      x: world.rover.x,
      y: world.rover.y,
      radius: 520,
      value: 1,
      age: 4
    }
  ];
  world.nextFieldId = 100;
  return world;
}

function createPreparedLaneWorld(offsetY: number): ContinuousWorldState {
  const world = createContinuousWorld();
  const laneY = world.rover.y;
  world.rover.x = 280;
  world.rover.y = laneY + offsetY;
  world.rover.heading = 0;
  world.fields = Array.from({ length: 8 }, (_, index) => ({
    id: index + 1,
    x: 140 + index * 42,
    y: laneY,
    radius: 44,
    value: 1,
    age: 4
  }));
  world.nextFieldId = 9;
  return world;
}

function makeRawTraversalWorld(world: ContinuousWorldState): ContinuousWorldState {
  world.fields = [];
  world.nanobots = world.maxNanobots;
  world.nextFieldId = 1;
  return world;
}

function driveAlongCurrentVein(
  world: ContinuousWorldState,
  zoneIndex: number,
  extraSeconds: number,
  speedState: 'prepared' | 'fabricating' = 'prepared'
): ContinuousWorldState {
  const zone = world.fertileZones[zoneIndex];
  if (!zone.vein) throw new Error('expected authored vein');

  const traversalSpeed = speedState === 'prepared' ? world.tuning.preparedSpeed : world.tuning.fabricatingSpeed;
  const passSeconds = Math.hypot(zone.vein.to.x - zone.vein.from.x, zone.vein.to.y - zone.vein.from.y) / traversalSpeed;
  return tickContinuousWorld(world, { steer: 0, throttle: 1 }, passSeconds + extraSeconds);
}

function createDroneRouteWorld(): ContinuousWorldState {
  const world = createContinuousWorld();
  world.nanobots = 8;
  world.fields = [
    { id: 1, x: world.rover.x - 170, y: world.rover.y, radius: 44, value: 5, age: 6 },
    { id: 2, x: world.rover.x - 206, y: world.rover.y + 10, radius: 44, value: 4, age: 6 }
  ];
  world.nextFieldId = 3;
  return world;
}

function ticksUntilDroneReady(
  world: ContinuousWorldState,
  inputForWorld: (world: ContinuousWorldState) => { steer: number; throttle: number; brake?: boolean },
  maxTicks: number
): number {
  let next = world;
  for (let tick = 1; tick <= maxTicks; tick += 1) {
    next = tickContinuousWorld(next, inputForWorld(next), 0.05);
    if (next.drone.status === 'ready') return tick;
  }
  return maxTicks;
}

function tickToward(
  world: ContinuousWorldState,
  target: { x: number; y: number },
  deltaSeconds: number
): ContinuousWorldState {
  return tickContinuousWorld(world, tickInputToward(world, target), deltaSeconds);
}

function tickInputToward(
  world: ContinuousWorldState,
  target: { x: number; y: number }
): { steer: number; throttle: number } {
  const targetAngle = Math.atan2(target.y - world.rover.y, target.x - world.rover.x);
  return {
    steer: clamp(angleDifference(targetAngle, world.rover.heading) / 0.85, -1, 1),
    throttle: 1
  };
}

function angleDifference(target: number, current: number): number {
  const twoPi = Math.PI * 2;
  return ((target - current + Math.PI) % twoPi + twoPi) % twoPi - Math.PI;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
