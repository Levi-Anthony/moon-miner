import { hexKey, hexToWorld, worldToHex } from './hex';
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
  // The opening runway, authored as road.
  //
  // This was empty, which under conservation means the map holds no material
  // at all beyond what is in the tank -- and a machine that can only ever lay
  // its own six units spends the run crawling (measured: 61 of 96 seconds, and
  // the drone could not rebound stock far enough to count as a recovery). The
  // multiply was hiding that: it let a bare map refill itself out of nothing.
  //
  // Reach is a property of the map now, so every map has to say what it starts
  // with. Here it is the calibration runway the level's own three-beat shape
  // already describes: enough road to teach the loop and to give the drone
  // something worth fetching, stopping short of the first seam so the ground
  // that pays is still ground you have to reach for.
  starterFieldPoints: roadChain([
    { x: 150, y: 516 },
    { x: 268, y: 500 }
  ]),
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

// The safe road is the near ring: out to the flats and back, which is the trip
// that always works and never pays. It used to run west to the map edge, which
// was the old field's shape and left the near seams off-corridor entirely.
// An authored road, as a chain of points about one lattice step apart so
// consecutive points land in neighbouring cells and the result is a connected
// piece of track rather than a dotted line. Spacing sits just under the
// across-flats distance (sqrt(3) * tileSize) for the shipped grain; the cell
// dedup in createArenaStarterFields absorbs the rest.
function roadChain(corners: Vec2[], spacing = 26): Vec2[] {
  const points: Vec2[] = [];
  for (let index = 0; index < corners.length - 1; index += 1) {
    const from = corners[index];
    const to = corners[index + 1];
    const steps = Math.max(1, Math.round(Math.hypot(to.x - from.x, to.y - from.y) / spacing));
    for (let step = 0; step < steps; step += 1) {
      points.push({
        x: from.x + ((to.x - from.x) * step) / steps,
        y: from.y + ((to.y - from.y) * step) / steps
      });
    }
  }
  points.push(corners[corners.length - 1]);
  return points;
}

// THE LOWER PATH.
//
// Under conservation an authored road is not scenery and not a hint. Every
// tile is stock parked on the ground, so this corridor is at once the map's
// material endowment and a second way home -- and the drone can spend one to
// get the other. That is the whole design of this level.
//
// Levi's target moment, verbatim: "should I turn back and go super fast down
// the long route, or do I have enough rail or time to crawl in desperation
// down to the lower path then zoom directly to the exit portal??" This is the
// lower path. The long route is the road you laid getting to the seams.
//
// It runs from the depot southwest, and it is one connected chain anchored at
// the depot, so its only loose end is the far western tip. The drone therefore
// eats it inward from the far end, which means the lower path stops being
// available from a long way out FIRST -- the reach you spend is the reach you
// lose, and it degrades in the order that makes that legible.
const LAST_LIGHT_LOWER_PATH: Vec2[] = roadChain([
  { x: 876, y: 552 },
  { x: 700, y: 604 },
  { x: 520, y: 638 },
  { x: 356, y: 626 }
]);

// A short stub out of the depot on the northern bearing, so the first day
// starts on something in the direction the seams actually are.
const LAST_LIGHT_DEPOT_APRON: Vec2[] = roadChain([
  { x: 878, y: 526 },
  { x: 792, y: 502 }
]);

// The safe road is the cautious near-ring trip: out of the depot to the flats
// and back. That is what `leftSafeCorridor` is for -- did this route stray
// from the trip that always works and never pays -- so it has to trace the
// route the safeReturn rung actually drives.
//
// Briefly pointed at the lower path while that was being authored, which read
// well and measured wrong: the near seams sit north, so the cautious route
// showed up as leaving its own corridor. The lower path is the second way
// HOME, which is a different job from the safe outbound trip.
// Runs a little past the far end of the flats' vein, because the cautious trip
// includes the turn: the rover sweeps to the end of the seam and swings round,
// and that swing is part of the route rather than a departure from it.
const LAST_LIGHT_SAFE_PATH: Vec2[] = [
  { x: 900, y: 535 },
  { x: 800, y: 518 },
  { x: 700, y: 505 },
  { x: 634, y: 494 }
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
  // A depot apron. Every fresh start recorded so far has lost -- 10.7, 12.0,
  // 5.5 and 8.1 ore against a quota of 12, four for four -- while shift two
  // onward wins six times in seven. Day one was the only day played on
  // genuinely bare ground, and bare ground plus six nanobots cannot reach two
  // near seams and get home.
  //
  // A depot that has been operating has road around it. This lays a short arm
  // out toward the near flats, which is the direction the safe road already
  // goes, so the first day starts the way every later day does: on something.
  starterFieldPoints: [...LAST_LIGHT_DEPOT_APRON, ...LAST_LIGHT_LOWER_PATH],
  // Redesigned once ore began carrying its depletion overnight. The old field
  // put every seam west-northwest, so every good day drove the same way and
  // route shape was not really a choice; and it held about 47 ore in total,
  // which a depleting map strips in two or three shifts.
  //
  // Three rings, spread around the depot on different bearings. The near ring
  // is cheap to reach and poor, which is the tension stated as geography: it
  // is the ground you will road first and empty first. The far ring pays best
  // per unit of distance, so reach is rewarded -- but only if you can afford
  // to get there, which is what the road is for. Total ore roughly doubled to
  // 95 so the cycle of strip, move on, and come back has room to run.
  // The seams sit NORTH of the lower path, deliberately.
  //
  // A route decision needs the two ways home to be different ground, and that
  // only happens if the ground you work is not the ground you would drive home
  // along. Working the field lays road across the north; the lower path stays
  // where it was authored. So the trip home is a real question -- back along
  // your own northern track, or south across raw regolith onto the lower path
  // and run it home fast.
  //
  // Value climbs with distance from the depot on the northern bearing, so the
  // deeper you go for ore the further you are from both ways home, and the
  // sharper the question gets. `deep-south` is the exception on purpose: rich,
  // far, and sitting ON the lower path's western end, so it is the seam that
  // tempts you into spending the very road you would come home on.
  fertileZones: [
    {
      // Sits almost due west of the depot, so the cautious trip is a straight
      // out-and-back. Offset north of that line, the same route acquired a
      // diagonal and a wide turn at prepared speed, and swung 134 units off
      // its own corridor -- the rung that is supposed to never leave it.
      id: 'depot-flats',
      x: 700,
      y: 505,
      radius: 54,
      vein: { from: { x: 766, y: 516 }, to: { x: 634, y: 494 }, width: 40 },
      richness: 0.85,
      remaining: 7
    },
    {
      id: 'north-shelf',
      x: 812,
      y: 268,
      radius: 52,
      vein: { from: { x: 860, y: 330 }, to: { x: 764, y: 208 }, width: 38 },
      richness: 0.95,
      remaining: 7
    },
    {
      // Held clear of the lower path on purpose. Sat on it in the first cut of
      // this layout, and that let the cautious route work a seam while driving
      // free authored road the whole way -- so it won with no drone at all,
      // which is DEV-14's property breaking. A route home must not double as a
      // seam highway: the lower path carries no ore, so reaching it is travel
      // and never profit.
      id: 'south-bench',
      x: 552,
      y: 512,
      radius: 52,
      vein: { from: { x: 620, y: 494 }, to: { x: 484, y: 528 }, width: 38 },
      // Sits further from the depot than north-shelf, so it pays at least as
      // well -- the level's rule is that richness rises with distance, and a
      // seam that breaks it is a longer errand for the same money.
      richness: 1,
      remaining: 7
    },
    {
      id: 'west-cut',
      x: 452,
      y: 396,
      radius: 72,
      vein: { from: { x: 516, y: 340 }, to: { x: 388, y: 452 }, width: 50 },
      richness: 1.7,
      remaining: 14
    },
    {
      id: 'north-lobe',
      x: 606,
      y: 282,
      radius: 70,
      vein: { from: { x: 682, y: 302 }, to: { x: 530, y: 262 }, width: 48 },
      richness: 1.5,
      remaining: 13
    },
    {
      // Pulled in from (252, 254). Under conservation the northwest bearing
      // carries no authored material -- the lower path runs south -- so a seam
      // 706 units out on it was not a tempting reach, it was unreachable, and
      // the route built around it came home poorer than the shallower one.
      // Still the furthest and richest seam on the map, which is the rule.
      id: 'far-shelf',
      x: 330,
      y: 290,
      radius: 86,
      vein: { from: { x: 398, y: 232 }, to: { x: 262, y: 350 }, width: 58 },
      richness: 3.1,
      remaining: 24
    },
    {
      // Sits PAST the western end of the lower path, not on it. On it, working
      // this seam handed the route a fast road home and the sloppiest rung
      // came home rich -- which is the one rung that must not. Past the end it
      // does the job it is for: it is the richest thing on the map and getting
      // it means leaving the road, so it tempts you into spending the very
      // track you would have come home on.
      id: 'deep-south',
      x: 250,
      y: 640,
      radius: 84,
      vein: { from: { x: 320, y: 600 }, to: { x: 182, y: 688 }, width: 56 },
      richness: 3.2,
      remaining: 23
    }
  ],
  ridges: [
    { id: 'north-shelf-shadow', from: { x: 872, y: 168 }, to: { x: 690, y: 196 } },
    { id: 'west-cut-wall', from: { x: 520, y: 330 }, to: { x: 372, y: 352 } },
    { id: 'far-shelf-rim', from: { x: 330, y: 132 }, to: { x: 158, y: 158 } },
    { id: 'south-divide', from: { x: 500, y: 700 }, to: { x: 336, y: 690 } }
  ],
  // Named for what they are. The old field had a seam called "recovery seam"
  // that was the second-worst return per unit distance on the map, so the
  // level was promising safety exactly where it punished you hardest.
  beats: [
    { id: 'start', label: 'depot', x: 900, y: 535 },
    { id: 'depot-flats', label: 'near flats', x: 640, y: 500 },
    { id: 'north-shelf', label: 'north shelf', x: 830, y: 250 },
    { id: 'south-bench', label: 'south bench', x: 660, y: 660 },
    { id: 'west-cut', label: 'west cut', x: 450, y: 470 },
    { id: 'north-lobe', label: 'north lobe', x: 600, y: 280 },
    { id: 'far-shelf', label: 'far shelf', x: 250, y: 250 },
    { id: 'deep-south', label: 'deep south', x: 230, y: 640 }
  ]};

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
  tileSize: number,
  fieldRadius: number
): FieldPatch[] {
  // The apron is track like any other, so it goes on the same lattice the
  // tractor lays onto. That is what lets the rail follow the apron out of the
  // depot and straight onto the first tile the machine puts down: they are
  // neighbours on one grid, not two sets of pieces that happen to be near each
  // other. Authored points falling in one cell collapse to one tile, which is
  // the invariant -- a cell is occupied or it is not.
  const fields: FieldPatch[] = [];
  const taken = new Set<string>();
  for (const point of arena.starterFieldPoints) {
    const cell = worldToHex(point.x, point.y, tileSize);
    const key = hexKey(cell.q, cell.r);
    if (taken.has(key)) continue;
    taken.add(key);
    const centre = hexToWorld(cell.q, cell.r, tileSize);
    fields.push({
      id: fields.length + 1,
      x: centre.x,
      y: centre.y,
      radius: fieldRadius,
      value: startingFieldValue,
      age: 5.4 - fields.length * 0.18
    });
  }
  return fields;
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
