import type { FieldPatch, FertileZone, Vec2 } from './continuous';

export type ContinuousArenaId = 'first-run-readable' | 'first-run-tight';

export interface ContinuousArenaRidge {
  id: string;
  from: Vec2;
  to: Vec2;
}

export interface ContinuousArenaBeat extends Vec2 {
  id: string;
  label: string;
}

export interface ContinuousArenaDefinition {
  id: ContinuousArenaId;
  label: string;
  description: string;
  start: Vec2;
  startHeading: number;
  starterFieldPoints: Vec2[];
  fertileZones: FertileZone[];
  ridges: ContinuousArenaRidge[];
  beats: ContinuousArenaBeat[];
}

const FIRST_RUN_READABLE: ContinuousArenaDefinition = {
  id: 'first-run-readable',
  label: 'Readable First Run',
  description: 'Calibration runway, obvious rich overextension lobe, and lower recovery seam for the continuous loop bet.',
  start: { x: 150, y: 520 },
  startHeading: -0.18,
  starterFieldPoints: [
    { x: 112, y: 528 },
    { x: 150, y: 520 },
    { x: 188, y: 512 },
    { x: 226, y: 505 },
    { x: 264, y: 499 },
    { x: 302, y: 494 },
    { x: 340, y: 491 },
    { x: 378, y: 489 },
    { x: 416, y: 490 }
  ],
  fertileZones: [
    {
      id: 'runway-pocket',
      x: 342,
      y: 492,
      radius: 88,
      vein: {
        from: { x: 250, y: 506 },
        to: { x: 442, y: 488 },
        width: 76
      },
      richness: 1.25,
      remaining: 5.8
    },
    {
      id: 'temptation-lobe',
      x: 590,
      y: 358,
      radius: 116,
      vein: {
        from: { x: 496, y: 448 },
        to: { x: 668, y: 306 },
        width: 72
      },
      richness: 1.95,
      remaining: 13
    },
    {
      id: 'recovery-pocket',
      x: 368,
      y: 596,
      radius: 102,
      vein: {
        from: { x: 286, y: 594 },
        to: { x: 476, y: 624 },
        width: 74
      },
      richness: 1.7,
      remaining: 13.5
    }
  ],
  ridges: [
    { id: 'left-horizon', from: { x: 76, y: 392 }, to: { x: 188, y: 368 } },
    { id: 'temptation-backstop', from: { x: 706, y: 276 }, to: { x: 866, y: 318 } },
    { id: 'lower-boundary', from: { x: 612, y: 648 }, to: { x: 812, y: 660 } }
  ],
  beats: [
    { id: 'runway', label: 'prepared runway', x: 342, y: 492 },
    { id: 'temptation', label: 'rich side seam', x: 590, y: 358 },
    { id: 'recovery', label: 'recovery seam', x: 368, y: 596 }
  ]
};

const FIRST_RUN_TIGHT: ContinuousArenaDefinition = {
  ...FIRST_RUN_READABLE,
  id: 'first-run-tight',
  label: 'Tighter First Run',
  description: 'A compact comparison variant with a shorter overextension leg.',
  starterFieldPoints: [
    { x: 116, y: 526 },
    { x: 150, y: 520 },
    { x: 184, y: 514 },
    { x: 218, y: 508 },
    { x: 252, y: 502 },
    { x: 286, y: 497 },
    { x: 320, y: 493 },
    { x: 354, y: 490 },
    { x: 388, y: 488 }
  ],
  fertileZones: [
    {
      id: 'runway-pocket',
      x: 326,
      y: 492,
      radius: 76,
      vein: {
        from: { x: 244, y: 505 },
        to: { x: 394, y: 488 },
        width: 68
      },
      richness: 1.6,
      remaining: 8
    },
    {
      id: 'temptation-lobe',
      x: 548,
      y: 374,
      radius: 94,
      vein: {
        from: { x: 476, y: 438 },
        to: { x: 620, y: 322 },
        width: 66
      },
      richness: 2.1,
      remaining: 13
    },
    {
      id: 'recovery-pocket',
      x: 360,
      y: 582,
      radius: 88,
      vein: {
        from: { x: 292, y: 578 },
        to: { x: 434, y: 606 },
        width: 68
      },
      richness: 1.75,
      remaining: 9
    }
  ],
  ridges: [
    { id: 'left-horizon', from: { x: 88, y: 404 }, to: { x: 188, y: 382 } },
    { id: 'upper-horizon', from: { x: 650, y: 260 }, to: { x: 824, y: 306 } },
    { id: 'lower-boundary', from: { x: 650, y: 640 }, to: { x: 820, y: 660 } }
  ],
  beats: [
    { id: 'runway', label: 'prepared runway', x: 326, y: 492 },
    { id: 'temptation', label: 'rich side lobe', x: 548, y: 374 },
    { id: 'recovery', label: 'recovery pocket', x: 360, y: 582 }
  ]
};

export const CONTINUOUS_ARENAS = {
  'first-run-readable': FIRST_RUN_READABLE,
  'first-run-tight': FIRST_RUN_TIGHT
} satisfies Record<ContinuousArenaId, ContinuousArenaDefinition>;

export const DEFAULT_CONTINUOUS_ARENA_ID: ContinuousArenaId = 'first-run-readable';

export function getContinuousArena(arenaId: ContinuousArenaId = DEFAULT_CONTINUOUS_ARENA_ID): ContinuousArenaDefinition {
  return CONTINUOUS_ARENAS[arenaId];
}

export function createArenaStarterFields(
  arena: ContinuousArenaDefinition,
  startingFieldValue: number,
  fieldRadius: number
): FieldPatch[] {
  return arena.starterFieldPoints.map((point, index) => ({
    id: index + 1,
    x: point.x,
    y: point.y,
    radius: fieldRadius,
    value: startingFieldValue,
    age: 5.4 - index * 0.18
  }));
}

export function createArenaFertileZones(arena: ContinuousArenaDefinition, seed: string): FertileZone[] {
  const random = seededRandom(`${seed}:${arena.id}`);
  const offset = () => (random() - 0.5) * 7;
  return arena.fertileZones.map((zone) => {
    const offsetX = offset();
    const offsetY = offset();
    return {
      ...zone,
      x: zone.x + offsetX,
      y: zone.y + offsetY,
      vein: zone.vein
        ? {
            ...zone.vein,
            from: {
              x: zone.vein.from.x + offsetX,
              y: zone.vein.from.y + offsetY
            },
            to: {
              x: zone.vein.to.x + offsetX,
              y: zone.vein.to.y + offsetY
            }
          }
        : undefined
    };
  });
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
