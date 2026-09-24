// Levels: a map posed as ONE route question, with its budgets derived from the
// map's own geometry instead of fixed numbers.
//
// Before this, every day had the same quota (12), sun (75 s) and starting stock
// (9) whatever the seed rolled, while the nearest seam could sit anywhere from
// ~200 to ~530 units from home and the farthest from ~660 to ~1560 -- so
// difficulty was mostly the dice, and a 12-ore quota on a 95-ore map was met by
// the first two seams. Here each level says what it teaches and how much slack
// it gives; the numbers come from a PAR route planned on the actual map:
//
//   par  = the shortest road out from home that visits `seams` seams -- the
//          nearest, or the richest -- (then you ride that same road home: the
//          out-and-back the whole game is about), with a winding allowance
//   sun  = sunSlack  x (lay it out + mine each seam parked + ride it home)
//   stock= stockSlack x (nanobots to lay it, less the mining trickle you earn)
//   quota= quotaShare x the ore those par seams hold
//
// So a bigger map, a slower rover or leaner seams all move the budgets with
// them, and difficulty is the slack ratios. Richer seams off the par route are
// the greed option: bonus, at the risk of the sun.
import type { ContinuousTuning, FertileZone, Vec2 } from './continuous';
import { parkedMineRate } from './continuous';

export interface LevelOre {
  layout?: number; // 1 scatter | 2 ridge | 3 clusters | 4 belt (unset = seeded)
  count?: number; // pool-count multiplier
  amount?: number;
  poolSize?: number;
  spread?: number;
}

export interface LevelSpec {
  name: string;
  teaches: string; // one line, shown when the level starts
  seams: number; // seams on the par route
  target?: 'nearest' | 'richest'; // par visits the k nearest seams (default) or the k richest
  quotaShare: number; // quota as a share of the par seams' ore
  sunSlack: number; // sun window as a multiple of par time
  stockSlack: number; // starting stock as a multiple of par stock
  ore: LevelOre;
}

export const LEVELS: LevelSpec[] = [
  {
    name: 'First haul',
    teaches: 'Lay road out to a seam, park on it to mine, then ride your own road home.',
    seams: 1, quotaShare: 0.8, sunSlack: 2.4, stockSlack: 1.7,
    ore: { layout: 3, count: 0.6 }
  },
  {
    name: 'Two stops',
    teaches: 'Chain two seams on one road, then ride the whole thing home on the rail.',
    seams: 2, quotaShare: 0.8, sunSlack: 2, stockSlack: 1.5,
    ore: { count: 0.8 }
  },
  {
    name: 'The long lode',
    teaches: 'Seams strung along a line: lay it once, ride it fast. Charge the slurp (Rail ⚡) and blast a seam on the way back.',
    seams: 3, quotaShare: 0.85, sunSlack: 1.7, stockSlack: 1.4,
    ore: { layout: 2 }
  },
  {
    name: 'Branch lines',
    teaches: 'Your road is a network: branch off it (it joins itself) and any branch rides you home.',
    seams: 3, quotaShare: 0.85, sunSlack: 1.6, stockSlack: 1.3,
    ore: { layout: 1 }
  },
  {
    name: 'Rich and far',
    teaches: 'The rich seams are the far ones. Get there, get paid, get home before sunset.',
    seams: 2, target: 'richest', quotaShare: 0.85, sunSlack: 1.45, stockSlack: 1.2,
    ore: { layout: 3 }
  },
  {
    name: 'Last light',
    teaches: 'Everything, tight. Every second out is a second back.',
    seams: 4, quotaShare: 0.9, sunSlack: 1.3, stockSlack: 1,
    ore: { layout: 4 }
  }
];

// Past the authored set the game keeps going: the last level's shape, a little
// tighter each time, down to a floor that is still winnable.
export function levelSpec(index: number): LevelSpec {
  const i = Math.max(0, Math.floor(index));
  if (i < LEVELS.length) return LEVELS[i];
  const base = LEVELS[LEVELS.length - 1];
  const extra = i - (LEVELS.length - 1);
  return {
    ...base,
    name: `Last light +${extra}`,
    teaches: 'Tighter again. Same moon, less daylight.',
    seams: Math.min(6, base.seams + Math.floor(extra / 3)),
    sunSlack: Math.max(1.1, base.sunSlack - 0.03 * extra),
    stockSlack: Math.max(0.85, base.stockSlack - 0.02 * extra),
    ore: {}
  };
}

export interface ParPlan {
  seams: string[]; // ids in visiting order
  length: number; // road laid out from home through them
  ore: number; // ore those seams hold
  mineSeconds: number; // parked mining to empty them
}

// The shortest road out from home that visits k seams, in any order: any k of
// the ~10 nearest (target 'nearest'), or exactly the k richest ('richest').
// Out-and-back: you ride the same road home.
export function planPar(home: Vec2, zones: FertileZone[], k: number, tuning: ContinuousTuning, target: 'nearest' | 'richest' = 'nearest'): ParPlan {
  const live = zones.filter((z) => z.remaining > 0);
  const want = Math.max(1, Math.min(Math.floor(k), live.length));
  const near = target === 'richest'
    ? [...live].sort((a, b) => b.remaining - a.remaining).slice(0, want)
    : [...live].sort((a, b) => Math.hypot(a.x - home.x, a.y - home.y) - Math.hypot(b.x - home.x, b.y - home.y)).slice(0, 10);
  let best: { order: FertileZone[]; length: number } | null = null;
  const used = new Array(near.length).fill(false);
  const order: FertileZone[] = [];
  const walk = (from: Vec2, length: number): void => {
    if (best && length >= best.length) return; // can't beat it
    if (order.length === want) { best = { order: [...order], length }; return; }
    for (let i = 0; i < near.length; i += 1) {
      if (used[i]) continue;
      used[i] = true;
      order.push(near[i]);
      walk(near[i], length + Math.hypot(near[i].x - from.x, near[i].y - from.y));
      order.pop();
      used[i] = false;
    }
  };
  walk(home, 0);
  const plan = best as { order: FertileZone[]; length: number } | null;
  if (!plan) return { seams: [], length: 0, ore: 0, mineSeconds: 0 };
  return {
    seams: plan.order.map((z) => z.id),
    length: plan.length,
    ore: plan.order.reduce((s, z) => s + z.remaining, 0),
    mineSeconds: plan.order.reduce((s, z) => s + z.remaining / Math.max(1e-6, parkedMineRate(z.richness, tuning)), 0)
  };
}

export interface LevelSlack {
  sun: number; // multipliers on the level's own slack (panel knobs; 1 = as authored)
  stock: number;
  quota: number;
}
export const DEFAULT_LEVEL_SLACK: LevelSlack = { sun: 1, stock: 1, quota: 1 };

export interface LevelBudget {
  quota: number;
  sunSeconds: number;
  startStock: number;
  parSeconds: number;
  parStock: number;
  par: ParPlan;
}

// Riding home isn't flat-out: the rail winds up and brakes for bends.
const RIDE_HOME_EFFICIENCY = 0.75;
// A driven road is never the straight line between seams: it swings to line up
// on each seam and around craters. Par road length = straight line x this.
const ROUTE_WINDING = 1.35;
// Reading the map and turning out of the depot before the route starts.
const ORIENT_SECONDS = 5;
const MIN_START_STOCK = 4;

export function levelBudget(spec: LevelSpec, par: ParPlan, tuning: ContinuousTuning, slack: LevelSlack = DEFAULT_LEVEL_SLACK): LevelBudget {
  const lay = Math.max(1, tuning.fabricatingSpeed);
  const ride = Math.max(lay, tuning.railSpeed * RIDE_HOME_EFFICIENCY);
  const road = par.length * ROUTE_WINDING;
  const parSeconds = ORIENT_SECONDS + road / lay + par.mineSeconds + road / ride;
  // Nanobots to lay the par road, less the flat trickle you earn while mining
  // (earned before the last leg, so only the seams before the last count).
  const costPerUnit = tuning.fabricateCostPerSecond / lay;
  const lastSeamShare = par.seams.length > 0 ? 1 / par.seams.length : 1;
  const trickle = Math.max(0, tuning.railTricklePerSecond) * par.mineSeconds * (1 - lastSeamShare);
  const parStock = Math.max(road * costPerUnit * 0.5, road * costPerUnit - trickle);
  return {
    quota: Math.max(1, Math.round(par.ore * clamp(spec.quotaShare * slack.quota, 0.05, 1))),
    sunSeconds: Math.max(10, Math.ceil(parSeconds * spec.sunSlack * slack.sun)),
    startStock: Math.max(MIN_START_STOCK, Math.ceil(parStock * spec.stockSlack * slack.stock)),
    parSeconds,
    parStock,
    par
  };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
