import { describe, expect, it } from 'vitest';
import { getGuidance } from './guidance';
import { pointKey } from './keys';
import {
  applyWinLoss,
  assignReclaimBot,
  canDriveRover,
  canReclaimRail,
  driveRover,
  mineOre,
  moveRover,
  tickWorld
} from './rules';
import { createWorld } from './world';

describe('Moon Miner rules', () => {
  it('creates deterministic maps from the same seed', () => {
    const first = createWorld('same-seed');
    const second = createWorld('same-seed');

    expect(first.tiles).toEqual(second.tiles);
  });

  it('spends nanobots when driving auto-prints new rail', () => {
    const world = createWorld();
    const result = driveRover(world, { x: 1, y: 0 });

    expect(result.ok).toBe(true);
    expect(result.state.nanobots).toBeLessThan(world.nanobots);
    expect(result.state.rails[pointKey({ x: 2, y: 7 })]).toBeDefined();
  });

  it('prevents non-cardinal drive input', () => {
    const world = createWorld();
    const result = driveRover(world, { x: 1, y: 1 });

    expect(result.ok).toBe(false);
    expect(result.state).toBe(world);
  });

  it('keeps moveRover rail-only for internal movement', () => {
    const world = createWorld();
    const blocked = moveRover(world, { x: 1, y: 0 });

    expect(blocked.ok).toBe(false);

    const withRail = driveRover(world, { x: 1, y: 0 }).state;
    const moved = moveRover(withRail, { x: -1, y: 0 });

    expect(moved.ok).toBe(true);
    expect(moved.state.rover).toMatchObject({ x: 1, y: 7 });
  });

  it('auto-prints rail while driving into valid terrain', () => {
    const world = createWorld();
    const result = driveRover(world, { x: 1, y: 0 });

    expect(result.ok).toBe(true);
    expect(result.state.rover).toMatchObject({ x: 2, y: 7 });
    expect(result.state.rails[pointKey({ x: 2, y: 7 })]).toBeDefined();
    expect(result.state.nanobots).toBeLessThan(world.nanobots);
  });

  it('does not spend nanobots when driving on existing rail', () => {
    const outbound = driveRover(createWorld(), { x: 1, y: 0 }).state;
    const beforeReturn = outbound.nanobots;
    const returned = driveRover(outbound, { x: -1, y: 0 });

    expect(returned.ok).toBe(true);
    expect(returned.state.nanobots).toBe(beforeReturn);
    expect(returned.state.rover).toMatchObject({ x: 1, y: 7 });
  });

  it('does not auto-print rail into blocked terrain', () => {
    const world = createWorld();
    const result = driveRover({ ...world, rover: { x: 9, y: 3, ore: 0 } }, { x: 0, y: -1 });

    expect(result.ok).toBe(false);
    expect(result.message).toBe('That terrain cannot hold rail.');
  });

  it('does not auto-print rail when nanobots are exhausted', () => {
    const world = createWorld();
    world.nanobots = 0;
    const result = driveRover(world, { x: 1, y: 0 });

    expect(result.ok).toBe(false);
    expect(result.message).toBe('Not enough nanobots.');
    expect(result.state).toBe(world);
  });

  it('marks the run lost when the rover has no drive or recovery option', () => {
    const world = createWorld();
    world.nanobots = 0;
    world.rails = { [pointKey(world.base)]: { cost: 0 } };
    const result = applyWinLoss(world);

    expect(result.state.phase).toBe('lost');
    expect(result.state.message).toBe('Rover stranded with no recoverable nanobots.');
  });

  it('mines ore from a deposit tile', () => {
    let world = createWorld();
    const route = [
      { x: 2, y: 7 },
      { x: 3, y: 7 },
      { x: 4, y: 7 }
    ];

    for (const point of route) {
      const delta = { x: point.x - world.rover.x, y: point.y - world.rover.y };
      world = driveRover(world, delta).state;
    }

    world.tiles[world.rover.y][world.rover.x].ore = 1;
    const mined = mineOre(world);

    expect(mined.ok).toBe(true);
    expect(mined.state.rover.ore).toBe(1);
    expect(mined.state.tiles[mined.state.rover.y][mined.state.rover.x].ore).toBe(0);
  });

  it('reclaims rail and refunds its nanobot cost', () => {
    let world = createWorld();
    world = driveRover(world, { x: 1, y: 0 }).state;
    world = driveRover(world, { x: -1, y: 0 }).state;
    const afterAutoPrint = world.nanobots;
    world = assignReclaimBot(world, { x: 2, y: 7 }).state;
    world = tickWorld(world, 10);

    expect(world.rails[pointKey({ x: 2, y: 7 })]).toBeUndefined();
    expect(world.nanobots).toBeGreaterThan(afterAutoPrint);
  });

  it('keeps the helper bot route visible until reclaim completes', () => {
    let world = createWorld();
    world = driveRover(world, { x: 1, y: 0 }).state;
    world = driveRover(world, { x: -1, y: 0 }).state;

    const assigned = assignReclaimBot(world, { x: 2, y: 7 }).state;
    const expectedPath = [
      { x: 1, y: 7 },
      { x: 2, y: 7 }
    ];

    expect(assigned.bot.startedAt).toBe(world.elapsedSeconds);
    expect(assigned.bot.busyUntil - assigned.elapsedSeconds).toBeCloseTo(1.2);
    expect(assigned.bot.path).toEqual(expectedPath);

    const enRoute = tickWorld(assigned, 1);
    expect(enRoute.bot.path).toEqual(expectedPath);
    expect(enRoute.bot.target).toEqual({ x: 2, y: 7 });
    expect(enRoute.rails[pointKey({ x: 2, y: 7 })]).toBeDefined();

    const completed = tickWorld(enRoute, 10);
    expect(completed.bot.path).toBeUndefined();
    expect(completed.bot.target).toBeUndefined();
    expect(completed.rails[pointKey({ x: 2, y: 7 })]).toBeUndefined();
  });

  it('prevents the rover from driving onto rail being reclaimed', () => {
    let world = createWorld();
    world = driveRover(world, { x: 1, y: 0 }).state;
    world = driveRover(world, { x: -1, y: 0 }).state;
    world = assignReclaimBot(world, { x: 2, y: 7 }).state;

    const driveCheck = canDriveRover(world, { x: 1, y: 0 });
    const driven = driveRover(world, { x: 1, y: 0 });
    const moved = moveRover(world, { x: 1, y: 0 });

    expect(driveCheck.ok).toBe(false);
    expect(driveCheck.message).toBe('Helper bot is reclaiming that rail.');
    expect(driven.ok).toBe(false);
    expect(driven.state).toBe(world);
    expect(moved.ok).toBe(false);
    expect(moved.state).toBe(world);
    expect(world.rails[pointKey({ x: 2, y: 7 })]).toBeDefined();
  });

  it('keeps the tutorial spur unreclaimable until the first route reaches it', () => {
    let world = createWorld();
    const tutorialSpur = { x: 10, y: 10 };
    const firstOreRoute = [
      { x: 2, y: 7 },
      { x: 3, y: 7 },
      { x: 3, y: 8 },
      { x: 4, y: 8 },
      { x: 4, y: 9 },
      { x: 5, y: 9 },
      { x: 6, y: 9 },
      { x: 7, y: 9 },
      { x: 8, y: 9 },
      { x: 8, y: 10 },
      { x: 8, y: 11 },
      { x: 9, y: 11 },
      { x: 10, y: 11 }
    ];

    expect(world.rails[pointKey(tutorialSpur)]).toBeDefined();
    expect(world.rails[pointKey({ x: 0, y: 7 })]).toBeUndefined();

    const immediateReclaim = canReclaimRail(world, tutorialSpur);
    expect(immediateReclaim.ok).toBe(false);
    expect(immediateReclaim.message).toBe('Helper bot cannot reach that rail.');

    world = driveRoute(world, firstOreRoute);
    world = mineOre(world).state;

    expect(canReclaimRail(world, tutorialSpur).ok).toBe(true);
    expect(getGuidance(world).nudge).toBe('Recover the highlighted old rail near the first deposit before driving farther.');
  });

  it('requires one tutorial-spur reclaim on the default two-ore route', () => {
    let world = createWorld();
    const tutorialSpur = { x: 10, y: 10 };
    const firstOreRoute = [
      { x: 2, y: 7 },
      { x: 3, y: 7 },
      { x: 3, y: 8 },
      { x: 4, y: 8 },
      { x: 4, y: 9 },
      { x: 5, y: 9 },
      { x: 6, y: 9 },
      { x: 7, y: 9 },
      { x: 8, y: 9 },
      { x: 8, y: 10 },
      { x: 8, y: 11 },
      { x: 9, y: 11 },
      { x: 10, y: 11 }
    ];
    const secondOreRoute = [
      { x: 11, y: 11 },
      { x: 11, y: 10 },
      { x: 12, y: 10 },
      { x: 13, y: 10 },
      { x: 14, y: 10 },
      { x: 15, y: 10 },
      { x: 16, y: 10 },
      { x: 17, y: 10 }
    ];
    const returnRoute = [
      { x: 16, y: 10 },
      { x: 15, y: 10 },
      { x: 14, y: 10 },
      { x: 13, y: 10 },
      { x: 12, y: 10 },
      { x: 11, y: 10 },
      { x: 11, y: 11 },
      { x: 10, y: 11 },
      { x: 9, y: 11 },
      { x: 8, y: 11 },
      { x: 8, y: 10 },
      { x: 8, y: 9 },
      { x: 7, y: 9 },
      { x: 6, y: 9 },
      { x: 5, y: 9 },
      { x: 4, y: 9 },
      { x: 4, y: 8 },
      { x: 3, y: 8 },
      { x: 3, y: 7 },
      { x: 2, y: 7 },
      { x: 1, y: 7 }
    ];

    world = driveRoute(world, firstOreRoute);
    world = mineOre(world).state;

    expect(world.nanobots).toBe(7);
    expect(getGuidance(world).objective).toBe('Recover nanobots');

    const stalled = driveUntilBlocked(world, secondOreRoute);
    expect(stalled).toBe('Not enough nanobots.');

    world = assignReclaimBot(world, tutorialSpur).state;
    expect(world.bot.busyUntil - world.elapsedSeconds).toBeCloseTo(4.9);

    world = tickWorld(world, 4.89);
    expect(world.rails[pointKey(tutorialSpur)]).toBeDefined();

    world = tickWorld(world, 0.02);

    expect(world.nanobots).toBe(9);
    expect(world.rails[pointKey(tutorialSpur)]).toBeUndefined();

    world = driveRoute(world, secondOreRoute);
    world = mineOre(world).state;
    world = driveRoute(world, returnRoute);

    expect(world.phase).toBe('won');
    expect(world.rover.ore).toBe(2);
  });

  it('surfaces a recovery objective when nanobots are low', () => {
    const world = createWorld();
    world.nanobots = 4;

    expect(getGuidance(world).objective).toBe('Recover nanobots');
  });
});

function driveRoute(world: ReturnType<typeof createWorld>, route: Array<{ x: number; y: number }>): ReturnType<typeof createWorld> {
  let nextWorld = world;
  for (const point of route) {
    const result = driveRover(nextWorld, { x: point.x - nextWorld.rover.x, y: point.y - nextWorld.rover.y });
    expect(result.ok).toBe(true);
    nextWorld = result.state;
  }
  return nextWorld;
}

function driveUntilBlocked(world: ReturnType<typeof createWorld>, route: Array<{ x: number; y: number }>): string {
  let nextWorld = world;
  for (const point of route) {
    const result = driveRover(nextWorld, { x: point.x - nextWorld.rover.x, y: point.y - nextWorld.rover.y });
    if (!result.ok) return result.message;
    nextWorld = result.state;
  }
  return '';
}
