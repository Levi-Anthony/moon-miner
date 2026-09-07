import type { FieldPatch, FertileZone, Vec2 } from './continuous';

export type ContinuousArenaId = 'first-run-readable' | 'first-run-tight' | 'last-light-return';

export interface ContinuousArenaRidge {
  id: string;
  from: Vec2;
  to: Vec2;
}

export interface ContinuousArenaBeat extends Vec2 {
  id: string;
  label: string;
}

export interface ContinuousExtractionZone extends Vec2 {
  id: string;
  label: string;
  radius: number;
  // Arriving is not an achievement on its own. You have to bring something.
  oreRequired: number;
}

export interface ContinuousArenaDefinition {
  id: ContinuousArenaId;
  label: string;
  description: string;
  start: Vec2;
  startHeading: number;
  extraction?: ContinuousExtractionZone;
  safePath?: Vec2[];
  solarWindowSeconds?: number;
  starterFieldPoints: Vec2[];
  fertileZones: FertileZone[];
  ridges: ContinuousArenaRidge[];
  beats: ContinuousArenaBeat[];
}

const FIRST_RUN_READABLE: ContinuousArenaDefinition = {
  id: 'first-run-readable',
  label: 'Readable First Run',
  description: 'Raw-field start with separated opening, upper, lower, and far-east seams for route-shape testing.',
  start: { x: 128, y: 520 },
  startHeading: -0.1,
  starterFieldPoints: [],
  fertileZones: [
    {
      id: 'runway-pocket',
      x: 320,
      y: 492,
      radius: 82,
      vein: {
        from: { x: 240, y: 512 },
        to: { x: 408, y: 466 },
        width: 64
      },
      richness: 1.18,
      remaining: 6.5
    },
    {
      id: 'temptation-lobe',
      x: 690,
      y: 342,
      radius: 120,
      vein: {
        from: { x: 590, y: 414 },
        to: { x: 784, y: 280 },
        width: 70
      },
      richness: 1.95,
      remaining: 13
    },
    {
      id: 'recovery-pocket',
      x: 392,
      y: 640,
      radius: 108,
      vein: {
        from: { x: 286, y: 624 },
        to: { x: 514, y: 672 },
        width: 72
      },
      richness: 1.65,
      remaining: 12
    },
    {
      id: 'upper-shelf',
      x: 484,
      y: 256,
      radius: 90,
      vein: {
        from: { x: 382, y: 294 },
        to: { x: 592, y: 226 },
        width: 58
      },
      richness: 1.45,
      remaining: 9
    },
    {
      id: 'east-saddle',
      x: 846,
      y: 496,
      radius: 112,
      vein: {
        from: { x: 734, y: 548 },
        to: { x: 958, y: 448 },
        width: 68
      },
      richness: 1.55,
      remaining: 12
    },
    {
      id: 'south-east-pocket',
      x: 782,
      y: 632,
      radius: 94,
      vein: {
        from: { x: 676, y: 628 },
        to: { x: 900, y: 664 },
        width: 62
      },
      richness: 1.45,
      remaining: 9
    }
  ],
  ridges: [
    { id: 'left-horizon', from: { x: 76, y: 392 }, to: { x: 188, y: 368 } },
    { id: 'north-backstop', from: { x: 664, y: 210 }, to: { x: 884, y: 268 } },
    { id: 'south-boundary', from: { x: 610, y: 674 }, to: { x: 844, y: 682 } }
  ],
  beats: [
    { id: 'runway', label: 'opening seam', x: 320, y: 492 },
    { id: 'upper-shelf', label: 'upper shelf', x: 484, y: 256 },
    { id: 'temptation', label: 'rich far seam', x: 690, y: 342 },
    { id: 'recovery', label: 'lower recovery', x: 392, y: 640 },
    { id: 'east-saddle', label: 'east saddle', x: 846, y: 496 },
    { id: 'south-east', label: 'south-east pocket', x: 782, y: 632 }
  ]
};

const FIRST_RUN_TIGHT: ContinuousArenaDefinition = {
  ...FIRST_RUN_READABLE,
  id: 'first-run-tight',
  label: 'Tighter First Run',
  description: 'A compact comparison variant with no starter field and shorter gaps between separated seams.',
  starterFieldPoints: [],
  fertileZones: [
    {
      id: 'runway-pocket',
      x: 310,
      y: 500,
      radius: 74,
      vein: {
        from: { x: 236, y: 514 },
        to: { x: 382, y: 474 },
        width: 58
      },
      richness: 1.35,
      remaining: 7
    },
    {
      id: 'temptation-lobe',
      x: 640,
      y: 354,
      radius: 100,
      vein: {
        from: { x: 552, y: 416 },
        to: { x: 720, y: 300 },
        width: 64
      },
      richness: 2.1,
      remaining: 13
    },
    {
      id: 'recovery-pocket',
      x: 386,
      y: 618,
      radius: 90,
      vein: {
        from: { x: 300, y: 604 },
        to: { x: 478, y: 642 },
        width: 64
      },
      richness: 1.75,
      remaining: 9.5
    },
    {
      id: 'upper-shelf',
      x: 444,
      y: 288,
      radius: 76,
      vein: {
        from: { x: 362, y: 316 },
        to: { x: 526, y: 264 },
        width: 54
      },
      richness: 1.45,
      remaining: 7
    },
    {
      id: 'east-saddle',
      x: 786,
      y: 500,
      radius: 92,
      vein: {
        from: { x: 694, y: 536 },
        to: { x: 880, y: 464 },
        width: 60
      },
      richness: 1.6,
      remaining: 9
    },
    {
      id: 'south-east-pocket',
      x: 736,
      y: 616,
      radius: 78,
      vein: {
        from: { x: 654, y: 606 },
        to: { x: 820, y: 638 },
        width: 56
      },
      richness: 1.5,
      remaining: 7.5
    }
  ],
  ridges: [
    { id: 'left-horizon', from: { x: 88, y: 404 }, to: { x: 188, y: 382 } },
    { id: 'upper-horizon', from: { x: 604, y: 238 }, to: { x: 806, y: 288 } },
    { id: 'lower-boundary', from: { x: 596, y: 658 }, to: { x: 808, y: 676 } }
  ],
  beats: [
    { id: 'runway', label: 'opening seam', x: 310, y: 500 },
    { id: 'upper-shelf', label: 'upper shelf', x: 444, y: 288 },
    { id: 'temptation', label: 'rich far seam', x: 640, y: 354 },
    { id: 'recovery', label: 'lower recovery', x: 386, y: 618 },
    { id: 'east-saddle', label: 'east saddle', x: 786, y: 500 },
    { id: 'south-east', label: 'south-east pocket', x: 736, y: 616 }
  ]
};

const LAST_LIGHT_SAFE_PATH: Vec2[] = [
  { x: 900, y: 535 },
  { x: 745, y: 565 },
  { x: 570, y: 530 },
  { x: 390, y: 585 },
  { x: 150, y: 610 }
];

const LAST_LIGHT_RETURN: ContinuousArenaDefinition = {
  id: 'last-light-return',
  label: 'Last Light Return',
  description: 'A round trip from the depot into the seam field and back. Every second outbound is a second you also have to spend coming home.',
  start: { x: 900, y: 535 },
  startHeading: Math.PI - 0.2,
  extraction: {
    id: 'extraction-home',
    label: 'depot',
    // The depot is where the run starts. A one-way trip pointed the laid road
    // permanently away from the goal, so reusing it always meant driving the
    // wrong way and the game's central mechanic could not matter.
    x: 900,
    y: 535,
    radius: 52,
    oreRequired: 12
  },
  safePath: LAST_LIGHT_SAFE_PATH,
  solarWindowSeconds: 36,
  starterFieldPoints: [],
  fertileZones: [
    {
      id: 'safe-route-scrap',
      x: 655,
      y: 548,
      radius: 48,
      vein: {
        from: { x: 735, y: 558 },
        to: { x: 585, y: 536 },
        width: 34
      },
      richness: 0.42,
      remaining: 1.6
    },
    {
      id: 'shallow-lobe',
      x: 615,
      y: 442,
      radius: 76,
      vein: {
        from: { x: 690, y: 430 },
        to: { x: 540, y: 455 },
        width: 52
      },
      richness: 1.22,
      remaining: 7.8
    },
    {
      id: 'northern-lobe',
      x: 632,
      y: 300,
      radius: 112,
      vein: {
        from: { x: 720, y: 285 },
        to: { x: 545, y: 315 },
        width: 66
      },
      richness: 2.35,
      remaining: 18
    },
    {
      id: 'late-pocket',
      x: 400,
      y: 330,
      radius: 82,
      vein: {
        from: { x: 462, y: 340 },
        to: { x: 342, y: 320 },
        width: 58
      },
      richness: 2.35,
      remaining: 11
    },
    {
      id: 'lower-recovery',
      x: 400,
      y: 675,
      radius: 74,
      vein: {
        from: { x: 500, y: 684 },
        to: { x: 300, y: 666 },
        width: 34
      },
      richness: 1.38,
      remaining: 8.6
    }
  ],
  ridges: [
    { id: 'official-return-cut', from: { x: 860, y: 610 }, to: { x: 592, y: 590 } },
    { id: 'north-lobe-shadow', from: { x: 736, y: 238 }, to: { x: 514, y: 252 } },
    { id: 'late-pocket-wall', from: { x: 474, y: 278 }, to: { x: 300, y: 296 } }
  ],
  beats: [
    { id: 'start', label: 'shift end', x: 900, y: 535 },
    { id: 'safe-turn-1', label: 'safe road', x: 745, y: 565 },
    { id: 'shallow-lobe', label: 'shallow seam', x: 615, y: 442 },
    { id: 'northern-lobe', label: 'rich high lobe', x: 632, y: 300 },
    { id: 'late-pocket', label: 'one more seam', x: 400, y: 330 },
    { id: 'lower-recovery', label: 'recovery seam', x: 400, y: 675 },
    { id: 'home', label: 'depot', x: 900, y: 535 }
  ]
};

export const CONTINUOUS_ARENAS = {
  'first-run-readable': FIRST_RUN_READABLE,
  'first-run-tight': FIRST_RUN_TIGHT,
  'last-light-return': LAST_LIGHT_RETURN
} satisfies Record<ContinuousArenaId, ContinuousArenaDefinition>;

export const DEFAULT_CONTINUOUS_ARENA_ID: ContinuousArenaId = 'last-light-return';

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
