// Engine-agnostic meta-loop: day -> shift -> game, the per-day economy (quota +
// soft/hard fail), banked ore, road carried within a shift, arena regen every N
// shifts, and persistence. Ported from the tuned Phaser scene; pure over the sim
// + a carried road trail, so it drives the 3D app. Its own localStorage keys
// (mm3d-*) so it never collides with the old Phaser save.
import {
  createContinuousWorld,
  resolveContinuousTuning,
  carryFieldsOvernight,
  carryDepletionOvernight,
  applyRailCapacity,
  type ContinuousTuning,
  type ContinuousWorldState,
  type FieldPatch
} from '../game/continuous';
import type { ContinuousArenaId } from '../game/continuousArena';
import { levelBudget, levelSpec, planPar, type LevelBudget, type LevelSpec } from '../game/level';
import type { RoadEdgeQuad } from './road';

export interface LoopConfig {
  // 0 = LEVELS: authored levels, one route question each, with quota / sun /
  //     starting stock derived from the map (see game/level.ts). Win to go on;
  //     miss and you retry the same map.
  // 1 = SANDBOX: the open day -> shift -> game loop, every number a panel knob.
  mode: number;
  // Levels only: multipliers on each level's own slack (1 = as authored).
  levelSunSlack: number;
  levelStockSlack: number;
  levelQuotaShare: number;
  daysPerShift: number;
  shiftsPerGame: number;
  arenaRegenShifts: number;
  quota: number;
  underQuotaFeePct: number;
  hardFailRoadResetPct: number;
  arenaScale: number;
  // WS4: what the laid network does at a SHIFT boundary (within a shift it
  // always carries). 0 = reset (wipe), 1 = decay (shed shiftDecayPct from the
  // fringe, keep the trunk), 2 = persist (carry intact). A map regen always
  // wipes -- the old road would sit on a different moon.
  networkPersistence: number;
  shiftDecayPct: number;
}

export const PERSISTENCE_MODES = ['Reset each shift', 'Decay at shift', 'Persist'] as const;

export const LOOP_MODES = ['Levels', 'Sandbox'] as const;

export const DEFAULT_LOOP_CONFIG: LoopConfig = {
  mode: 0,
  levelSunSlack: 1,
  levelStockSlack: 1,
  levelQuotaShare: 1,
  daysPerShift: 3,
  shiftsPerGame: 4,
  arenaRegenShifts: 2,
  quota: 12,
  underQuotaFeePct: 0.5,
  hardFailRoadResetPct: 0,
  // A genuinely big moon by default (2x the old slab). The Level-size knob now
  // resizes the world live, so this is just the fresh-game starting point.
  arenaScale: 2,
  networkPersistence: 1,
  shiftDecayPct: 0.4
};

const SAVE_KEY = 'mm3d-campaign-v1';
const SEED_KEY = 'mm3d-seed-v1';
const LEVEL_KEY = 'mm3d-level-v1';
const LEVEL_CARRY_KEY = 'mm3d-level-carry-v1';

// What a Levels-mode day inherits from the day before it in the same shift:
// the road you laid, the field under it, and which seams you emptied. Tagged
// with the shift's map seed and the day it is the START of, so a retry, a
// level jump or a new shift can never pick up road from a different map.
interface LevelCarry {
  mapSeed: string;
  dayInShift: number; // 0-based: this carry is the starting state of that day
  road: RoadEdgeQuad[];
  fields: FieldPatch[];
  depletion: Record<string, number>;
}

export interface LevelRun {
  index: number; // 0-based
  spec: LevelSpec;
  budget: LevelBudget;
  shift: number; // 1-based shift this level's day belongs to
  dayInShift: number; // 1-based day within that shift
  daysPerShift: number;
}

interface Save {
  day: number;
  fields: FieldPatch[];
  depletion: Record<string, number>;
  banked: number;
  road: RoadEdgeQuad[];
  railGrowth?: number;
  bonus?: number;
}

export interface CampaignSnapshot {
  gameSeed: string;
  dayNumber: number;
  bankedOre: number;
  bankedBonus: number;
  carriedFields: FieldPatch[];
  carriedDepletion: Record<string, number>;
  carriedRoad: RoadEdgeQuad[];
  carriedRailGrowth: number;
  levelIndex: number;
  levelCarry: LevelCarry | null;
}

function structuredCloneSafe<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

export class Campaign {
  config: LoopConfig;
  arenaId: ContinuousArenaId = 'last-light-return';
  dayNumber = 1;
  gameSeed = 'apollo-17';
  bankedOre = 0;
  carriedFields: FieldPatch[] = [];
  carriedDepletion: Record<string, number> = {};
  carriedRoad: RoadEdgeQuad[] = [];
  // WS3: rail capacity grown so far this game (the quiet "snake" escalation).
  // Carried across days AND shifts; only a new game resets it.
  carriedRailGrowth = 0;
  // Bonus score banked this game (surplus ore + clean rail slides). Mastery
  // acknowledgement only -- the win stays "bank the quota, get home".
  bankedBonus = 0;
  // Live sim-tuning overrides from the control panel, applied to every world we
  // build so panel tweaks persist across days.
  tuningOverrides: Partial<ContinuousTuning> = {};
  // The shipped tuning the app starts from (bootstrap's APP_TUNING). Level
  // budgets are derived from THIS, not from tuningOverrides, so a panel change
  // makes a level easier or harder instead of being re-balanced away.
  baseTuning: Partial<ContinuousTuning> = {};
  // Levels: the road/field/depletion the current day starts from (see LevelCarry).
  levelCarry: LevelCarry | null = null;
  // Levels mode: which level you're on (persisted), and the last one built.
  levelIndex = 0;
  lastLevelCleared = false;
  level: LevelRun | null = null;

  constructor(config: LoopConfig = DEFAULT_LOOP_CONFIG) {
    this.config = { ...config };
    this.gameSeed = this.loadSeed();
    this.loadSave();
    this.levelIndex = this.loadLevel();
    this.levelCarry = this.loadLevelCarry();
  }

  // The campaign as it stood when the current day was built: what Reset Day
  // returns to. endRun banks the haul and stores tomorrow's carry the moment a
  // day ends, so without this a Reset Day pressed on the result banner replayed
  // the day with tomorrow's road and banked it twice (Sandbox), or quietly
  // skipped to the next level (Levels, after a clear).
  snapshot(): CampaignSnapshot {
    return structuredCloneSafe({
      gameSeed: this.gameSeed,
      dayNumber: this.dayNumber,
      bankedOre: this.bankedOre,
      bankedBonus: this.bankedBonus,
      carriedFields: this.carriedFields,
      carriedDepletion: this.carriedDepletion,
      carriedRoad: this.carriedRoad,
      carriedRailGrowth: this.carriedRailGrowth,
      levelIndex: this.levelIndex,
      levelCarry: this.levelCarry
    });
  }
  restore(snap: CampaignSnapshot): void {
    const s = structuredCloneSafe(snap);
    this.gameSeed = s.gameSeed;
    this.dayNumber = s.dayNumber;
    this.bankedOre = s.bankedOre;
    this.bankedBonus = s.bankedBonus;
    this.carriedRailGrowth = s.carriedRailGrowth;
    this.lastLevelCleared = false;
    this.setLevel(s.levelIndex);
    this.saveLevelCarry(s.levelCarry);
    this.persist(s.dayNumber, s.carriedFields, s.carriedDepletion, s.carriedRoad);
    try {
      window.localStorage.setItem(SEED_KEY, this.gameSeed);
    } catch {
      /* storage may be unavailable */
    }
  }

  levelsMode(): boolean {
    return Math.round(this.config.mode ?? 0) === 0;
  }
  setLevel(index: number): void {
    this.levelIndex = Math.max(0, Math.floor(index));
    this.saveLevel();
  }

  private clampInt(n: number): number {
    return Math.max(1, Math.floor(n));
  }
  shiftOfDay(day = this.dayNumber): number {
    return Math.floor((day - 1) / this.clampInt(this.config.daysPerShift)) + 1;
  }
  dayInShiftOf(day = this.dayNumber): number {
    return ((day - 1) % this.clampInt(this.config.daysPerShift)) + 1;
  }
  private blockOfShift(shift: number): number {
    return Math.floor((shift - 1) / this.clampInt(this.config.arenaRegenShifts));
  }
  private worldSeedFor(day: number): string {
    return `${this.gameSeed}:blk${this.blockOfShift(this.shiftOfDay(day))}`;
  }
  gameComplete(): boolean {
    if (this.levelsMode()) return false; // levels run on (the last one keeps tightening)
    return this.dayNumber >= this.config.daysPerShift * this.config.shiftsPerGame;
  }

  // Build the world for the current day (block seed + quota override + level
  // scale + carried road/depletion). Returns the state and the carried road
  // lattice to seed/repaint the road with.
  buildWorld(): { state: ContinuousWorldState; road: RoadEdgeQuad[] } {
    if (this.levelsMode()) return this.buildLevel();
    this.level = null;
    const state = createContinuousWorld(
      this.worldSeedFor(this.dayNumber),
      this.tuningOverrides,
      this.arenaId,
      this.carriedFields,
      this.carriedDepletion,
      this.config.arenaScale
    );
    if (state.arena.extraction) {
      state.arena = {
        ...state.arena,
        extraction: { ...state.arena.extraction, oreRequired: this.config.quota }
      };
    }
    if (this.carriedRailGrowth > 0) {
      state.railCapacityGrown = this.carriedRailGrowth;
      applyRailCapacity(state);
      // Start the day with the grown stock too, so the growth is felt at once.
      state.nanobots = Math.min(state.maxNanobots, state.nanobots + this.carriedRailGrowth);
    }
    return { state, road: this.carriedRoad.map((q) => [...q] as RoadEdgeQuad) };
  }

  // Levels are the days of a shift (owner, 2026-09-27). Every day in a shift
  // is played on the same map, and the road you laid, the field under it and
  // the seams you emptied carry into the next day. Your nanobot stock does not:
  // each day starts from its own derived stock. A new shift is a new map.
  levelDaysPerShift(): number {
    return this.clampInt(this.config.daysPerShift);
  }
  private levelMapSeed(index = this.levelIndex): string {
    return `${this.gameSeed}:S${Math.floor(index / this.levelDaysPerShift())}`;
  }

  // Levels: this day's map (fixed per game + shift, so a retry and the rest of
  // the shift are the same moon), the panel's ore knobs as they are, and the
  // quota / sun / starting stock derived from a par route on that map.
  private buildLevel(): { state: ContinuousWorldState; road: RoadEdgeQuad[] } {
    const spec = levelSpec(this.levelIndex);
    const perShift = this.levelDaysPerShift();
    const dayInShift = this.levelIndex % perShift;
    const mapSeed = this.levelMapSeed();
    const carry = this.levelCarry && this.levelCarry.mapSeed === mapSeed && this.levelCarry.dayInShift === dayInShift ? this.levelCarry : null;
    const state = createContinuousWorld(mapSeed, this.tuningOverrides, this.arenaId, carry?.fields ?? [], carry?.depletion ?? {}, this.config.arenaScale);
    const home = state.arena.extraction ?? state.arena.start;
    // Budgets come from the SHIPPED tuning, so the sliders bite. Before this a
    // faster rover got a proportionally shorter sun, cheaper road got a
    // proportionally smaller stock, and Sun window was overwritten outright (and
    // Start stock too: a run with Start stock 50 began on 4).
    const base = resolveContinuousTuning(this.baseTuning);
    const par = planPar(home, state.fertileZones, spec.seams, base, spec.target);
    // Ore amount scales every seam, so a quota taken as a share of the par ore
    // would scale with it and cancel the knob. Quote the par ore at base amount.
    const amountRatio = Math.max(1e-6, state.tuning.oreAmount) / Math.max(1e-6, base.oreAmount);
    const budget = levelBudget(spec, { ...par, ore: par.ore / amountRatio }, base, {
      sun: (this.config.levelSunSlack ?? 1) * (state.tuning.startingSolarSeconds / Math.max(1e-6, base.startingSolarSeconds)),
      stock: this.config.levelStockSlack ?? 1,
      quota: this.config.levelQuotaShare ?? 1
    });
    if (state.arena.extraction) {
      state.arena = { ...state.arena, extraction: { ...state.arena.extraction, oreRequired: budget.quota } };
    }
    // Every day starts with a FULL tank (owner, 2026-09-27: stock resets each
    // day). The tank is your cap (Base max stock), raised when this level's par
    // route needs more. Before this a day opened at its derived stock -- often
    // the floor of 4 -- against a cap of 24, and "4/24" read as yesterday's
    // leftovers rather than a reset.
    state.maxNanobots = Math.max(state.maxNanobots, budget.startStock);
    state.nanobots = state.maxNanobots;
    state.solarWindowSeconds = budget.sunSeconds;
    state.solarSeconds = budget.sunSeconds;
    this.level = { index: this.levelIndex, spec, budget, shift: Math.floor(this.levelIndex / perShift) + 1, dayInShift: dayInShift + 1, daysPerShift: perShift };
    return { state, road: (carry?.road ?? []).map((q) => [...q] as RoadEdgeQuad) };
  }

  // A run ended: bank the day's haul (full on a clean win, minus the fee on an
  // under-quota return, nothing on a sunset loss), compute what carries into the
  // next day (road persists within a shift, wiped at a shift boundary; a hard
  // fail can shed a tunable fraction), and persist. Does NOT advance the day --
  // the banner shows this day's result; advance() moves on.
  endRun(state: ContinuousWorldState, road: RoadEdgeQuad[], bonus = 0): void {
    const won = state.phase === 'won';
    if (this.levelsMode()) {
      // Clear the level (home with the quota) to move on; anything else retries it.
      // A miss replays the day from the same starting road (the carry for this
      // day is left as it was), so a failed attempt never builds tomorrow's road.
      const cleared = won && !state.returnedUnderQuota;
      if (cleared) {
        this.bankedOre += state.rover.ore;
        this.bankedBonus += bonus;
        const next = this.levelIndex + 1;
        const sameMap = this.levelMapSeed(next) === this.levelMapSeed();
        this.saveLevelCarry(sameMap
          ? {
              mapSeed: this.levelMapSeed(next),
              dayInShift: next % this.levelDaysPerShift(),
              road,
              fields: carryFieldsOvernight(state.fields, state.tuning),
              depletion: carryDepletionOvernight(state.fertileZones)
            }
          : null);
        this.setLevel(next);
      }
      this.lastLevelCleared = cleared;
      return;
    }
    const fee = state.returnedUnderQuota ? 1 - this.config.underQuotaFeePct : 1;
    this.bankedOre += won ? state.rover.ore * fee : 0;
    this.bankedBonus += won ? bonus : 0;
    this.carriedRailGrowth = Math.max(0, state.railCapacityGrown ?? 0);
    if (this.gameComplete()) {
      this.persist(this.dayNumber, [], {}, []); // last day: nothing carries; new game next
      return;
    }
    const nextDay = this.dayNumber + 1;
    const sameShift = this.shiftOfDay(nextDay) === this.shiftOfDay(this.dayNumber);
    const sameMap = this.worldSeedFor(nextDay) === this.worldSeedFor(this.dayNumber);
    // Within a shift everything carries. At a shift boundary the persistence
    // mode decides; a regenerated map always starts clean.
    let keep = 1;
    if (!sameMap) keep = 0;
    else if (!sameShift) {
      const mode = Math.round(this.config.networkPersistence ?? 0);
      keep = mode >= 2 ? 1 : mode === 1 ? 1 - clamp01(this.config.shiftDecayPct ?? 0) : 0;
    }
    // A hard fail can shed a further fraction on top.
    if (!won && this.config.hardFailRoadResetPct > 0) keep *= 1 - clamp01(this.config.hardFailRoadResetPct);
    // Road/fields are stored oldest-first, so keeping a prefix keeps the trunk
    // (laid out from home) and sheds the fringe -- the network stays connected.
    const allFields = keep > 0 ? carryFieldsOvernight(state.fields, state.tuning) : [];
    const fields = allFields.slice(0, Math.round(allFields.length * keep));
    const carriedRoad = road.slice(0, Math.round(road.length * keep));
    this.persist(nextDay, fields, carryDepletionOvernight(state.fertileZones), carriedRoad);
  }

  // Advance to the next day (or a fresh game after the last day), loading
  // whatever carried.
  advance(): void {
    if (this.levelsMode()) return; // buildWorld reads the (possibly advanced) level
    if (this.gameComplete()) {
      this.newGame();
      return;
    }
    this.loadSave();
  }

  newGame(): void {
    this.gameSeed = this.mintSeed();
    this.dayNumber = 1;
    this.setLevel(0);
    this.bankedOre = 0;
    this.carriedFields = [];
    this.carriedDepletion = {};
    this.carriedRoad = [];
    this.carriedRailGrowth = 0;
    this.bankedBonus = 0;
    this.saveLevelCarry(null);
    try {
      window.localStorage.setItem(SEED_KEY, this.gameSeed);
      window.localStorage.removeItem(SAVE_KEY);
    } catch {
      /* storage may be unavailable */
    }
  }

  // --- persistence ---
  private loadLevel(): number {
    try {
      const n = Number(window.localStorage.getItem(LEVEL_KEY));
      return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
    } catch {
      return 0;
    }
  }
  private saveLevel(): void {
    try {
      window.localStorage.setItem(LEVEL_KEY, String(this.levelIndex));
    } catch {
      /* storage may be unavailable */
    }
  }
  private loadLevelCarry(): LevelCarry | null {
    try {
      const raw = window.localStorage.getItem(LEVEL_CARRY_KEY);
      const p = raw ? (JSON.parse(raw) as Partial<LevelCarry>) : null;
      if (!p || typeof p.mapSeed !== 'string' || typeof p.dayInShift !== 'number') return null;
      return {
        mapSeed: p.mapSeed,
        dayInShift: p.dayInShift,
        road: Array.isArray(p.road) ? p.road : [],
        fields: Array.isArray(p.fields) ? p.fields : [],
        depletion: p.depletion && typeof p.depletion === 'object' ? p.depletion : {}
      };
    } catch {
      return null;
    }
  }
  private saveLevelCarry(carry: LevelCarry | null): void {
    this.levelCarry = carry;
    try {
      if (carry) window.localStorage.setItem(LEVEL_CARRY_KEY, JSON.stringify(carry));
      else window.localStorage.removeItem(LEVEL_CARRY_KEY);
    } catch {
      /* storage may be unavailable */
    }
  }
  private mintSeed(): string {
    return `g-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
  }
  private loadSeed(): string {
    try {
      const s = window.localStorage.getItem(SEED_KEY);
      if (s) return s;
      const fresh = this.mintSeed();
      window.localStorage.setItem(SEED_KEY, fresh);
      return fresh;
    } catch {
      return 'apollo-17';
    }
  }
  private loadSave(): void {
    try {
      const raw = window.localStorage.getItem(SAVE_KEY);
      const p = raw ? (JSON.parse(raw) as Partial<Save>) : undefined;
      this.dayNumber = typeof p?.day === 'number' && p.day >= 1 ? p.day : 1;
      this.carriedFields = Array.isArray(p?.fields) ? (p!.fields as FieldPatch[]) : [];
      this.carriedDepletion = p?.depletion && typeof p.depletion === 'object' ? p.depletion : {};
      this.bankedOre = typeof p?.banked === 'number' ? p.banked : 0;
      this.carriedRoad = Array.isArray(p?.road) ? (p!.road as RoadEdgeQuad[]) : [];
      this.carriedRailGrowth = typeof p?.railGrowth === 'number' ? p.railGrowth : 0;
      this.bankedBonus = typeof p?.bonus === 'number' ? p.bonus : 0;
    } catch {
      this.dayNumber = 1;
      this.carriedFields = [];
      this.carriedDepletion = {};
      this.bankedOre = 0;
      this.carriedRoad = [];
      this.carriedRailGrowth = 0;
      this.bankedBonus = 0;
    }
  }
  private persist(day: number, fields: FieldPatch[], depletion: Record<string, number>, road: RoadEdgeQuad[]): void {
    // Update in-memory carry too, so advance() reflects it even if storage fails.
    this.carriedFields = fields;
    this.carriedDepletion = depletion;
    this.carriedRoad = road;
    try {
      window.localStorage.setItem(SAVE_KEY, JSON.stringify({ day, fields, depletion, banked: this.bankedOre, road, railGrowth: this.carriedRailGrowth, bonus: this.bankedBonus } satisfies Save));
    } catch {
      /* storage may be unavailable */
    }
  }
}
