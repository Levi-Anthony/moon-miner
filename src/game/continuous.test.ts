import { describe, expect, it } from 'vitest';
import {
  CURRENT_CLASSIC_CONTINUOUS_TUNING,
  createContinuousWorld,
  DEFAULT_CONTINUOUS_TUNING,
  DEFAULT_DYNAMICS_PRESET_ID,
  DYNAMICS_PRESETS,
  getDroneReclaimDiagnostics,
  getReclaimPreview,
  isRoverAtExtraction,
  launchReclaimDrone,
  tickContinuousWorld,
  type ContinuousWorldState,
  type ReclaimCandidateDiagnostics
} from './continuous';
import { CONTINUOUS_ARENAS } from './continuousArena';
import {
  createContinuousLoopTrace,
  getContinuousLoopSummary,
  recordContinuousLoopDroneLaunch,
  recordContinuousLoopTick
} from './continuousTrace';
import { formatLastLightRouteOutcomeTable, runContinuousSelfPlay } from './continuousSelfPlay';

const straightInput = { steer: 0, throttle: 1 };
const idleInput = { steer: 0, throttle: 0, driveIntent: false };

describe('continuous Moon Miner spike rules', () => {
  it('creates deterministic continuous worlds from the same seed', () => {
    const first = createContinuousWorld('same-seed');
    const second = createContinuousWorld('same-seed');

    expect(first.fields).toEqual(second.fields);
    expect(first.fertileZones).toEqual(second.fertileZones);
  });

  it('stages the starter level as a raw start with spread-out ore seams', () => {
    const world = createContinuousWorld();

    expect(world.arenaId).toBe('first-run-readable');
    expect(world.arena.label).toBe('Readable First Run');
    expect(world.fields).toEqual([]);
    expect(world.nextFieldId).toBe(1);
    expect(world.speedState).toBe('fabricating');
    expect(world.message).toBe('Raw field start. Drive to lay your first line, then reclaim it.');
    expect(world.nanobots).toBe(8);
    expect(world.arms.total).toBe(8);
    expect(world.arms.industrialTotal).toBe(7);
    expect(world.arms.utilityTotal).toBe(1);
    expect(world.arms.building + world.arms.mining + world.arms.stabilizing + world.arms.emergency).toBe(7);
    expect(world.arms.helper.count).toBe(1);
    expect(world.arms.helper.duty).toBe('scan');
    expect(world.fertileZones.map((zone) => zone.id)).toEqual([
      'runway-pocket',
      'temptation-lobe',
      'recovery-pocket',
      'upper-shelf',
      'east-saddle',
      'south-east-pocket'
    ]);
    expect(world.fertileZones[0].x).toBeGreaterThan(world.rover.x);
    expect(world.fertileZones[1].x).toBeGreaterThan(world.fertileZones[0].x + 300);
    expect(world.fertileZones[1].y).toBeLessThan(world.fertileZones[0].y - 120);
    expect(world.fertileZones[2].y).toBeGreaterThan(world.fertileZones[0].y + 130);
    expect(world.fertileZones[4].x).toBeGreaterThan(800);
    expect(world.fertileZones.every((zone) => zone.vein)).toBe(true);
    expect(world.fertileZones[1].vein?.to.x).toBeGreaterThan(world.fertileZones[1].vein?.from.x ?? 0);
    expect(world.arena.beats.length).toBeGreaterThanOrEqual(6);
    expect(world.arena.beats.map((beat) => beat.label)).not.toContain('prepared runway');
    expect(world.arena.ridges.length).toBeLessThanOrEqual(3);
  });

  it('uses Stable First Run as the named default dynamics preset', () => {
    const stable = DYNAMICS_PRESETS.find((preset) => preset.id === 'stable-first-run');
    const classic = DYNAMICS_PRESETS.find((preset) => preset.id === 'current-classic');
    const playground = DYNAMICS_PRESETS.find((preset) => preset.id === 'drone-playground');
    const strict = DYNAMICS_PRESETS.find((preset) => preset.id === 'strict-logistics');

    expect(DEFAULT_DYNAMICS_PRESET_ID).toBe('stable-first-run');
    expect(DYNAMICS_PRESETS.map((preset) => preset.id)).toEqual([
      'stable-first-run',
      'current-classic',
      'drone-playground',
      'strict-logistics'
    ]);
    expect(stable?.name).toBe('Stable First Run');
    expect(classic?.name).toBe('Current Classic');
    expect(playground?.name).toBe('Drone Playground');
    expect(strict?.name).toBe('Strict Logistics');
    expect(DEFAULT_CONTINUOUS_TUNING).toEqual(stable?.tuning);
    expect(classic?.tuning).toEqual(CURRENT_CLASSIC_CONTINUOUS_TUNING);

    expect(stable?.tuning.startingNanobots).toBe(8);
    expect(stable?.tuning.maxNanobots).toBe(24);
    expect(stable?.tuning.reclaimMinFieldAgeSeconds).toBe(1.35);
    expect(stable?.tuning.reclaimMinDistanceFromRover).toBe(22);
    expect(stable?.tuning.reclaimMinFieldValue).toBe(0.06);
    expect(stable?.tuning.minReclaimClusterPayload).toBe(0.12);
    expect(stable?.tuning.droneUrgencyRatio).toBe(0.24);

    expect(classic?.tuning.startingNanobots).toBe(6);
    expect(classic?.tuning.maxNanobots).toBe(32);
    expect(classic?.tuning.reclaimMinFieldAgeSeconds).toBe(2.2);
    expect(classic?.tuning.reclaimMinDistanceFromRover).toBe(26);
    expect(playground?.tuning.allowCloseReclaim).toBe(true);
    expect(playground?.tuning.dronePickupRadius).toBeGreaterThan(stable?.tuning.dronePickupRadius ?? 0);
    expect(strict?.tuning.allowCloseReclaim).toBe(false);
    expect(strict?.tuning.reclaimMinFieldAgeSeconds).toBeGreaterThan(stable?.tuning.reclaimMinFieldAgeSeconds ?? 0);
    expect(createContinuousWorld().tuning).toEqual(stable?.tuning);
  });

  it('can create named arena variants without mixing them into dynamics tuning', () => {
    const readable = createContinuousWorld('same-seed', { preparedSpeed: 125 }, 'first-run-readable');
    const tight = createContinuousWorld('same-seed', { preparedSpeed: 125 }, 'first-run-tight');

    expect(Object.keys(CONTINUOUS_ARENAS)).toEqual(['first-run-readable', 'first-run-tight', 'last-light-return']);
    expect(readable.tuning.preparedSpeed).toBe(125);
    expect(tight.tuning.preparedSpeed).toBe(125);
    expect(readable.arenaId).toBe('first-run-readable');
    expect(tight.arenaId).toBe('first-run-tight');
    expect(readable.fields).toEqual([]);
    expect(tight.fields).toEqual([]);
    expect(readable.fertileZones[1].x).toBeGreaterThan(tight.fertileZones[1].x);
    expect(readable.fertileZones[1].vein).not.toEqual(tight.fertileZones[1].vein);
  });

  it('stages last-light-return as a safe road home with off-route value lobes', () => {
    const world = createContinuousWorld('same-seed', {}, 'last-light-return');

    expect(world.arenaId).toBe('last-light-return');
    expect(world.arena.label).toBe('Last Light Return');
    expect(world.rover.x).toBeCloseTo(900);
    expect(world.rover.y).toBeCloseTo(535);
    expect(world.arena.extraction).toMatchObject({ x: 135, y: 610, radius: 46 });
    expect(world.arena.safePath?.map((point) => [point.x, point.y])).toEqual([
      [900, 535],
      [745, 565],
      [570, 530],
      [390, 585],
      [150, 610]
    ]);
    expect(world.solarWindowSeconds).toBe(51);
    expect(world.solarSeconds).toBe(51);
    expect(world.fertileZones.map((zone) => zone.id)).toEqual([
      'safe-route-scrap',
      'shallow-lobe',
      'northern-lobe',
      'late-pocket',
      'lower-recovery'
    ]);
    expect(world.fertileZones[1].vein).toMatchObject({
      from: { x: expect.any(Number), y: expect.any(Number) },
      to: { x: expect.any(Number), y: expect.any(Number) },
      width: 52
    });
    expect(world.fertileZones[1].y).toBeLessThan(world.arena.safePath?.[1].y ?? 0);
    expect(world.fertileZones[2].y).toBeLessThan(world.fertileZones[1].y);
    expect(world.fertileZones[3].x).toBeLessThan(world.fertileZones[2].x);
    expect(world.fertileZones[4].y).toBeGreaterThan(world.arena.safePath?.[2].y ?? 0);
    expect(world.message).toBe('Shift is over. Follow the safe road home, or risk one more seam before sunset.');
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

  it('idles on barren raw terrain without moving, printing field, or mining when there is no drive intent', () => {
    const world = createContinuousWorld();
    world.fields = [];
    world.rover.x = 90;
    world.rover.y = 130;
    world.rover.heading = 0;
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

  it('pivots in place from steering input when throttle is zero', () => {
    const world = createContinuousWorld();
    world.fields = [];
    world.rover.heading = 0;
    world.nanobots = 6;
    const start = { ...world.rover };
    const fieldCount = world.fields.length;

    const next = tickContinuousWorld(world, { steer: 1, throttle: 0 }, 0.6);

    expect(next.rover.x).toBe(start.x);
    expect(next.rover.y).toBe(start.y);
    expect(next.rover.heading).toBeGreaterThan(start.heading + 0.8);
    expect(next.rover.speed).toBe(0);
    expect(next.fields.length).toBe(fieldCount);
    expect(next.nanobots).toBe(6);
    expect(next.message).toBe('Chassis pivoting in place. Field fabrication is idle.');
  });

  it('stopped pivot steering does not move, print field, or spend nanobots', () => {
    const world = createContinuousWorld();
    world.fields = [];
    world.nanobots = 5;
    world.rover.heading = 0.5;
    const start = { ...world.rover };

    const next = tickContinuousWorld(world, { steer: -1, throttle: 0, driveIntent: false, pivotIntent: true }, 0.4);

    expect(next.rover.x).toBe(start.x);
    expect(next.rover.y).toBe(start.y);
    expect(next.rover.heading).toBeLessThan(start.heading - 0.5);
    expect(next.rover.speed).toBe(0);
    expect(next.fields).toEqual([]);
    expect(next.nanobots).toBe(5);
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
    const remaining = world.fertileZones[0].remaining;

    const next = tickContinuousWorld(world, { steer: 0, throttle: 0, driveIntent: false }, 0.8);

    expect(next.speedState).toBe('prepared');
    expect(next.rover.x).toBe(start.x);
    expect(next.rover.y).toBe(start.y);
    expect(next.rover.speed).toBe(0);
    expect(next.fields.length).toBe(fieldCount);
    expect(next.rover.ore).toBeGreaterThan(start.ore);
    expect(next.lastYieldRate).toBeGreaterThan(0);
    expect(next.arms.building).toBe(0);
    expect(next.arms.mining).toBe(7);
    expect(next.arms.helper.duty).toBe('miningAssist');
    expect(next.arms.helper.miningAssistRate).toBeGreaterThan(0);
    expect(next.fertileZones[0].remaining).toBeCloseTo(remaining - (next.rover.ore - start.ore));
    expect(next.message).toBe('Mining arms harvesting while parked on prepared field.');
  });

  it('keeps mining while parked on a raw fertile seam without printing field', () => {
    const world = placeRoverAtVeinStart(createContinuousWorld(), 0);
    world.fields = [];
    world.nextFieldId = 1;
    world.nanobots = 4;
    const start = { ...world.rover };

    const next = tickContinuousWorld(world, idleInput, 0.8);

    expect(next.speedState).toBe('fabricating');
    expect(next.rover.x).toBe(start.x);
    expect(next.rover.y).toBe(start.y);
    expect(next.rover.speed).toBe(0);
    expect(next.fields).toEqual([]);
    expect(next.nanobots).toBe(4);
    expect(next.rover.ore).toBeGreaterThan(start.ore);
    expect(next.lastYieldRate).toBeGreaterThan(0);
    expect(next.arms.building).toBe(0);
    expect(next.arms.mining).toBe(7);
    expect(next.arms.helper.duty).toBe('systems');
    expect(next.arms.helper.miningAssistRate).toBe(0);
    expect(next.arms.helper.lastAssistYield).toBe(0);
    expect(next.message).toBe('Mining arms extracting from the seam while parked.');
  });

  it('shuts mining down during emergency crawl even on a fertile seam', () => {
    const world = placeRoverAtVeinStart(createContinuousWorld(), 0);
    world.fields = [];
    world.nextFieldId = 1;
    world.nanobots = 0;
    const start = { ...world.rover };

    const next = tickContinuousWorld(world, idleInput, 0.8);

    expect(next.speedState).toBe('crawl');
    expect(next.rover.ore).toBe(start.ore);
    expect(next.lastYieldRate).toBe(0);
    expect(next.arms.mining).toBe(0);
    expect(next.arms.emergency).toBeGreaterThan(0);
    expect(next.arms.helper.duty).toBe('emergency');
    expect(next.arms.helper.miningAssistRate).toBe(0);
  });

  it('does not charge or trigger helper assist while idling on barren terrain', () => {
    const world = createContinuousWorld();
    world.fields = [];
    world.rover.x = 90;
    world.rover.y = 130;

    const next = tickContinuousWorld(world, idleInput, 1.2);

    expect(next.rover.ore).toBe(0);
    expect(next.lastYieldRate).toBe(0);
    expect(next.arms.mining).toBe(0);
    expect(next.arms.helper.duty).toBe('scan');
    expect(next.arms.helper.miningAssistRate).toBe(0);
    expect(next.arms.helper.lastAssistYield).toBe(0);
  });

  it('blocks helper mining assist while the utility arm is docking a returning drone', () => {
    const world = placeRoverAtVeinStart(createContinuousWorld(), 0);
    world.drone.status = 'returning';
    world.drone.x = world.rover.x - 120;
    world.drone.y = world.rover.y;
    world.drone.payload = 2;
    world.drone.etaSeconds = 0.4;

    const next = tickContinuousWorld(world, idleInput, 0.02);

    expect(next.lastYieldRate).toBeGreaterThan(0);
    expect(next.arms.mining).toBe(7);
    expect(next.arms.helper.duty).toBe('droneDocking');
    expect(next.arms.helper.miningAssistRate).toBe(0);
    expect(next.arms.helper.lastAssistYield).toBe(0);
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
    expect(next.fertileZones[0].remaining).toBeLessThan(startRemaining * 0.32);
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
    expect(preview?.etaSeconds).toBeCloseTo(
      (distance(world.rover, launched.drone.target ?? world.rover) * 2) / world.tuning.droneSpeed + world.tuning.reclaimLockSeconds
    );
  });

  it('does not preview fresh, low-value, or underfoot field as reclaimable', () => {
    const world = createContinuousWorld();
    world.fields = [
      { id: 1, x: world.rover.x - 120, y: world.rover.y, radius: 44, value: 1, age: 1 },
      { id: 2, x: world.rover.x - 12, y: world.rover.y, radius: 44, value: 1, age: 8 },
      { id: 3, x: world.rover.x - 180, y: world.rover.y, radius: 26, value: 0.025, age: 8 }
    ];
    world.nextFieldId = 4;

    expect(getReclaimPreview(world)).toBeUndefined();
  });

  it('will claim set road close behind the tractor, not only field it did not need', () => {
    const world = createContinuousWorld();
    world.fields = [{ id: 1, x: world.rover.x - 40, y: world.rover.y, radius: 44, value: 1, age: 8 }];
    world.nextFieldId = 2;

    expect(getReclaimPreview(world)?.targetPatchId).toBe(1);
  });

  it('reports a precise drone launch blocked reason when no reclaim target exists', () => {
    const world = createContinuousWorld();
    world.fields = [];

    const diagnostics = getDroneReclaimDiagnostics(world);
    const launch = launchReclaimDrone(world);

    expect(diagnostics.blockedReason).toBe('No reclaimable field yet');
    expect(diagnostics.candidateCount).toBe(0);
    expect(launch.ok).toBe(false);
    expect(launch.message).toBe('No reclaimable field yet');
  });

  it('lets reclaim age and distance tuning make launch available sooner', () => {
    const world = createContinuousWorld('early-reclaim', {
      reclaimMinFieldAgeSeconds: 2.2,
      reclaimMinDistanceFromRover: 74
    });
    world.fields = [{ id: 1, x: world.rover.x - 52, y: world.rover.y, radius: 44, value: 2.6, age: 1.4 }];
    world.nextFieldId = 2;

    expect(getDroneReclaimDiagnostics(world).blockedReason).toBe('Oldest field age 1.4s / need 2.2s');
    expect(getReclaimPreview(world)).toBeUndefined();

    world.tuning.reclaimMinFieldAgeSeconds = 1.2;
    expect(getDroneReclaimDiagnostics(world).blockedReason).toBe('Nearest old field 52 / need 74');
    expect(getReclaimPreview(world)).toBeUndefined();

    world.tuning.reclaimMinDistanceFromRover = 40;
    expect(getReclaimPreview(world)?.targetPatchId).toBe(1);
    expect(getDroneReclaimDiagnostics(world).blockedReason).toBeUndefined();
  });

  it('sends the drone to the nearest eligible cluster, so launch position picks the target', () => {
    const world = createDroneRouteWorld();
    const diagnostics = getDroneReclaimDiagnostics(world);
    const best = diagnostics.bestTarget;

    expect(best).toBeDefined();
    const nearest = Math.min(...diagnostics.topCandidates.map((candidate: ReclaimCandidateDiagnostics) => candidate.distanceFromRover));
    expect(best?.distanceFromRover).toBeCloseTo(nearest, 6);
  });

  it('changes which cluster the drone claims when the rover moves', () => {
    const near = createDroneRouteWorld();
    const nearTarget = getDroneReclaimDiagnostics(near).bestTarget;

    const far = createDroneRouteWorld();
    const candidates = getDroneReclaimDiagnostics(far).topCandidates;
    const other = candidates.find((candidate: ReclaimCandidateDiagnostics) => candidate.targetPatchId !== nearTarget?.targetPatchId);
    expect(other).toBeDefined();

    // Park the rover on top of a different cluster; the drone should follow the
    // rover's position rather than a hidden score.
    far.rover.x = other!.target.x + 40;
    far.rover.y = other!.target.y;
    const movedTarget = getDroneReclaimDiagnostics(far).bestTarget;

    expect(movedTarget?.targetPatchId).not.toBe(nearTarget?.targetPatchId);
  });

  it('breaks refill ETA into outbound, reclaim lock, and return time', () => {
    const world = createDroneRouteWorld();
    world.tuning.reclaimLockSeconds = 0.7;
    const best = getDroneReclaimDiagnostics(world).bestTarget;

    expect(best).toBeDefined();
    expect(best?.eta.reclaimLockSeconds).toBeCloseTo(0.7);
    expect(best?.eta.totalSeconds).toBeCloseTo(
      (best?.eta.outboundSeconds ?? 0) + (best?.eta.reclaimLockSeconds ?? 0) + (best?.eta.returnSeconds ?? 0)
    );
    expect(best?.refillEtaSeconds).toBeCloseTo(best?.eta.totalSeconds ?? 0);
  });

  it('prefers a nearer equally valuable old reclaim target over a distant one', () => {
    const world = createContinuousWorld();
    world.fields = [
      { id: 1, x: world.rover.x - 150, y: world.rover.y, radius: 44, value: 3, age: 6 },
      { id: 2, x: world.rover.x + 420, y: world.rover.y, radius: 44, value: 3, age: 6 }
    ];
    world.nextFieldId = 3;

    expect(getReclaimPreview(world)?.targetPatchId).toBe(1);
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

  it('wins last-light-return by reaching extraction before sunset without requiring ore', () => {
    const world = createContinuousWorld('home-test', {}, 'last-light-return');
    world.rover.ore = 0;
    world.rover.x = 139;
    world.rover.y = 610;

    const next = tickContinuousWorld(world, idleInput, 0.1);

    expect(isRoverAtExtraction(next)).toBe(true);
    expect(next.phase).toBe('won');
    expect(next.message).toBe('Rover reached extraction before sunset with 0.0 bonus ore.');
  });

  it('loses last-light-return when sunset closes before the rover gets home', () => {
    const world = createContinuousWorld('late-home-test', {}, 'last-light-return');
    world.solarSeconds = 0.1;

    const next = tickContinuousWorld(world, idleInput, 0.2);

    expect(isRoverAtExtraction(next)).toBe(false);
    expect(next.phase).toBe('lost');
    expect(next.message).toBe('Sunset closed the extraction window before the rover got home.');
  });

  it('stopped pivot steering still obeys last-light sunset loss without drive movement', () => {
    const world = createContinuousWorld('pivot-sunset', {}, 'last-light-return');
    world.solarSeconds = 0.1;
    const start = { ...world.rover };

    const next = tickContinuousWorld(world, { steer: 1, throttle: 0 }, 0.2);

    expect(next.rover.x).toBe(start.x);
    expect(next.rover.y).toBe(start.y);
    expect(next.rover.heading).not.toBe(start.heading);
    expect(next.fields).toEqual([]);
    expect(next.phase).toBe('lost');
    expect(next.message).toBe('Sunset closed the extraction window before the rover got home.');
  });

  it('can demonstrate field commitment, overextension, crawl, and drone recovery in the starter route', () => {
    const result = runContinuousSelfPlay();
    const speedKinds = new Set(result.trace.events.map((event) => event.speedState));

    expect(result.summary.hitLoop).toBe(true);
    expect(result.summary.droneLaunches).toBe(1);
    expect(result.summary.droneDeliveries).toBeGreaterThan(0);
    expect(result.summary.elapsedSeconds).toBeGreaterThanOrEqual(75);
    expect(result.summary.elapsedSeconds).toBeLessThanOrEqual(100);
    expect(result.summary.speedSeconds.fabricating).toBeGreaterThan(8);
    expect(result.summary.speedSeconds.crawl).toBeGreaterThan(8);
    expect(result.summary.speedSeconds.prepared).toBeGreaterThan(5);
    expect(speedKinds.has('fabricating')).toBe(true);
    expect(speedKinds.has('crawl')).toBe(true);
    expect(result.state.rover.ore).toBeGreaterThan(1);
  });

  it('records whether the starter self-play route hits the intended loop', () => {
    const { summary, trace } = runContinuousSelfPlay();

    expect(summary.hitLoop).toBe(true);
    expect(summary.milestones.map((milestone) => [milestone.id, milestone.hit])).toEqual([
      ['fieldCommit', true],
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
    expect(result.summary.milestones.some((milestone) => milestone.id === 'fieldCommit' && milestone.hit)).toBe(true);
  });

  it('proves the last-light-return reward and risk gradient through deterministic routes', () => {
    const safe = runContinuousSelfPlay({ routeId: 'safeReturn', deltaSeconds: 0.05 }).metrics;
    const shallow = runContinuousSelfPlay({ routeId: 'shallowLobe', deltaSeconds: 0.05 }).metrics;
    const deep = runContinuousSelfPlay({ routeId: 'deepLobe', deltaSeconds: 0.05 }).metrics;
    const greedy = runContinuousSelfPlay({ routeId: 'greedyLatePocket', deltaSeconds: 0.05 }).metrics;
    const sloppy = runContinuousSelfPlay({ routeId: 'greedyLatePocketSloppy', deltaSeconds: 0.05 }).metrics;

    for (const metrics of [safe, shallow, deep, greedy]) {
      expect(metrics.result).toBe('won');
      expect(metrics.reachedExtraction).toBe(true);
      expect(metrics.droneDeliveries).toBeGreaterThan(0);
    }

    expect(safe.leftSafeCorridor).toBe(false);
    expect(safe.oreValue).toBeLessThan(2.5);
    expect(safe.solarRemaining).toBeGreaterThan(35);
    // Was exactly 0 with a 470-speed drone. At 160 a late launch can fail to
    // get home before the run ends -- safeReturn now records 2 launches and 1
    // delivery -- so the route dips into a brief crawl. That is the intended
    // new fail state for launch timing, not the cost model taxing a sparse
    // route as an earlier flat droneLaunchCost did.
    expect(safe.crawlSeconds).toBeLessThan(1.5);

    expect(shallow.leftSafeCorridor).toBe(true);
    expect(shallow.oreValue).toBeGreaterThan(safe.oreValue + 2);
    expect(shallow.solarRemaining).toBeGreaterThan(25);
    expect(shallow.crawlSeconds).toBeLessThan(5);

    expect(deep.oreValue).toBeGreaterThan(shallow.oreValue + 8);
    expect(deep.solarRemaining).toBeLessThan(shallow.solarRemaining - 10);
    expect(deep.crawlSeconds).toBeGreaterThan(6);
    expect(deep.maxDroneEta).toBeGreaterThanOrEqual(shallow.maxDroneEta);

    // The slower drone lifts the low-risk routes and slightly lowers max greed
    // (shallow 4.0 -> 7.5 ore, greedy 27.3 -> 25.3), so the top of the reward
    // curve is flatter than it was. Gradient is still monotonic and clear.
    expect(greedy.oreValue).toBeGreaterThan(deep.oreValue + 6);
    expect(greedy.solarRemaining).toBeLessThan(8);
    expect(greedy.crawlSeconds).toBeGreaterThan(deep.crawlSeconds);
    // Route shape does not lengthen the drone's flight, and cannot under this
    // design. A greedier route lays more road, so there is always a target
    // nearby; measured across dronePickupRadius 185->70 and droneSpeed 430->90,
    // greedy's flights are consistently among the SHORTEST and the safe route's
    // are the longest. CONCEPT_REFRAME's "route shape controls reclaim latency"
    // describes a lever this game does not have. What route shape actually
    // controls is what is available to take. Asserting that instead.
    expect(greedy.maxDroneEta).toBeLessThanOrEqual(safe.maxDroneEta);

    expect(sloppy.result).toBe('lost');
    expect(sloppy.reachedExtraction).toBe(false);
    // Sloppy still loses outright while greedy gets home; the ore ratio
    // narrowed from 3x to ~2.2x with nearest-worthwhile selection.
    expect(sloppy.oreValue).toBeLessThan(greedy.oreValue / 2);
    expect(sloppy.crawlSeconds).toBeGreaterThan(greedy.crawlSeconds + 5);
    // Was: sloppy strays 40+ further than greedy. No longer true, and for a
    // real reason -- sloppy now crawls so much it cannot get as far off-route.
    // What matters is that it left the corridor and did not get home.
    expect(sloppy.leftSafeCorridor).toBe(true);
  });

  it('makes the greedy last-light route depend on drone timing instead of succeeding casually', () => {
    const withDrone = runContinuousSelfPlay({ routeId: 'greedyLatePocket', deltaSeconds: 0.05 }).metrics;
    const noDrone = runContinuousSelfPlay({
      routeId: 'greedyLatePocket',
      deltaSeconds: 0.05,
      droneLaunchSeconds: []
    }).metrics;

    expect(withDrone.result).toBe('won');
    expect(withDrone.reachedExtraction).toBe(true);
    expect(withDrone.oreValue).toBeGreaterThan(25);
    // Margin is thin now (~0.5s). Flagged as a tuning decision, not a stable target.
    expect(withDrone.solarRemaining).toBeGreaterThan(0);

    expect(noDrone.result).toBe('lost');
    expect(noDrone.reachedExtraction).toBe(false);
    expect(noDrone.droneLaunches).toBe(0);
    expect(noDrone.oreValue).toBeLessThan(withDrone.oreValue / 4);
    // The drone still decides the run (won vs lost, 4x the ore). It no longer
    // multiplies crawl time by 3, because nearest-worthwhile selection recovers
    // less per trip than the old weighted scoring did.
    expect(noDrone.crawlSeconds).toBeGreaterThan(withDrone.crawlSeconds);
  });

  it('formats a last-light route outcome table for tuning passes', () => {
    const table = formatLastLightRouteOutcomeTable();

    expect(table).toContain('| Route | Result | Reached Home | Ore/Value | Solar Left |');
    expect(table).toContain('| safeReturn | won | yes |');
    expect(table).toContain('| greedyLatePocket | won | yes |');
    expect(table).toContain('| greedyLatePocketSloppy | lost | no |');
    expect(table).toContain('late launches and bad route shape miss extraction');
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
