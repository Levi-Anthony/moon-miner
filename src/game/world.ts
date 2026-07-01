import type { Point, Terrain, Tile, WorldState } from './types';
import { pointKey } from './keys';

const WIDTH = 20;
const HEIGHT = 14;
const BASE: Point = { x: 1, y: 7 };
const STARTING_NANOBOTS = 20;
const STARTING_SECONDS = 260;
const OLD_SPUR: Point = { x: 10, y: 10 };

const ORE_DEPOSITS: Point[] = [
  { x: 16, y: 3 },
  { x: 17, y: 10 },
  { x: 10, y: 11 }
];

const CRATERS: Point[] = [
  { x: 5, y: 1 },
  { x: 6, y: 1 },
  { x: 11, y: 2 },
  { x: 12, y: 2 },
  { x: 7, y: 5 },
  { x: 8, y: 5 },
  { x: 14, y: 5 },
  { x: 15, y: 6 },
  { x: 4, y: 10 },
  { x: 5, y: 10 },
  { x: 12, y: 12 },
  { x: 13, y: 12 }
];

const RIDGES: Point[] = [
  { x: 9, y: 0 },
  { x: 9, y: 1 },
  { x: 9, y: 2 },
  { x: 9, y: 4 },
  { x: 9, y: 5 },
  { x: 9, y: 6 },
  { x: 9, y: 8 },
  { x: 9, y: 9 },
  { x: 9, y: 10 },
  { x: 9, y: 12 },
  { x: 9, y: 13 }
];

const ICE: Point[] = [
  { x: 2, y: 3 },
  { x: 3, y: 3 },
  { x: 4, y: 4 },
  { x: 13, y: 8 },
  { x: 14, y: 8 },
  { x: 15, y: 9 },
  { x: 18, y: 5 }
];

export function createWorld(seed = 'apollo-17'): WorldState {
  const random = seededRandom(seed);
  const tiles = Array.from({ length: HEIGHT }, (_unused, y) =>
    Array.from({ length: WIDTH }, (_unusedToo, x): Tile => {
      const roughChance = random();
      const terrain: Terrain = roughChance > 0.78 ? 'rough' : 'regolith';
      return { terrain, ore: 0 };
    })
  );

  for (const point of CRATERS) {
    tiles[point.y][point.x].terrain = 'crater';
  }

  for (const point of RIDGES) {
    tiles[point.y][point.x].terrain = 'ridge';
  }

  for (const point of ICE) {
    tiles[point.y][point.x].terrain = 'ice';
  }

  for (const point of ORE_DEPOSITS) {
    tiles[point.y][point.x].ore = 1;
    if (tiles[point.y][point.x].terrain === 'crater' || tiles[point.y][point.x].terrain === 'ridge') {
      tiles[point.y][point.x].terrain = 'regolith';
    }
  }

  tiles[BASE.y][BASE.x].terrain = 'regolith';
  tiles[OLD_SPUR.y][OLD_SPUR.x].terrain = 'rough';

  return {
    seed,
    width: WIDTH,
    height: HEIGHT,
    tiles,
    base: { ...BASE },
    rover: { ...BASE, ore: 0 },
    bot: { ...BASE, busyUntil: 0 },
    rails: {
      [pointKey(BASE)]: { cost: 0 },
      [pointKey(OLD_SPUR)]: { cost: 2 }
    },
    nanobots: STARTING_NANOBOTS,
    targetOre: 2,
    solarSeconds: STARTING_SECONDS,
    elapsedSeconds: 0,
    phase: 'playing',
    message: 'Drive to ore, auto-print rail, reclaim old track, and return to base.'
  };
}

function seededRandom(seed: string): () => number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return () => {
    hash += 0x6d2b79f5;
    let value = hash;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
