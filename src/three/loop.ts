// Engine-agnostic meta-loop: day -> shift -> game, the per-day economy (quota +
// soft/hard fail), banked ore, road carried within a shift, arena regen every N
// shifts, and persistence. Ported from the tuned Phaser scene; pure over the sim
// + a carried road trail, so it drives the 3D app. Its own localStorage keys
// (mm3d-*) so it never collides with the old Phaser save.
import {
  createContinuousWorld,
  carryFieldsOvernight,
  carryDepletionOvernight,
  type ContinuousTuning,
  type ContinuousWorldState,
  type FieldPatch
} from '../game/continuous';
import type { ContinuousArenaId } from '../game/continuousArena';
import type { RoadEdgeQuad } from './road';

export interface LoopConfig {
  daysPerShift: number;
  shiftsPerGame: number;
  arenaRegenShifts: number;
  quota: number;
  underQuotaFeePct: number;
  hardFailRoadResetPct: number;
  arenaScale: number;
}

export const DEFAULT_LOOP_CONFIG: LoopConfig = {
  daysPerShift: 3,
  shiftsPerGame: 4,
  arenaRegenShifts: 2,
  quota: 12,
  underQuotaFeePct: 0.5,
  hardFailRoadResetPct: 0,
  arenaScale: 1.5
};

const SAVE_KEY = 'mm3d-campaign-v1';
const SEED_KEY = 'mm3d-seed-v1';

interface Save {
  day: number;
  fields: FieldPatch[];
  depletion: Record<string, number>;
  banked: number;
  road: RoadEdgeQuad[];
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
  // Live sim-tuning overrides from the control panel, applied to every world we
  // build so panel tweaks persist across days.
  tuningOverrides: Partial<ContinuousTuning> = {};

  constructor(config: LoopConfig = DEFAULT_LOOP_CONFIG) {
    this.config = { ...config };
    this.gameSeed = this.loadSeed();
    this.loadSave();
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
    return this.dayNumber >= this.config.daysPerShift * this.config.shiftsPerGame;
  }

  // Build the world for the current day (block seed + quota override + level
  // scale + carried road/depletion). Returns the state and the carried road
  // lattice to seed/repaint the road with.
  buildWorld(): { state: ContinuousWorldState; road: RoadEdgeQuad[] } {
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
    return { state, road: this.carriedRoad.map((q) => [...q] as RoadEdgeQuad) };
  }

  // A run ended: bank the day's haul (full on a clean win, minus the fee on an
  // under-quota return, nothing on a sunset loss), compute what carries into the
  // next day (road persists within a shift, wiped at a shift boundary; a hard
  // fail can shed a tunable fraction), and persist. Does NOT advance the day --
  // the banner shows this day's result; advance() moves on.
  endRun(state: ContinuousWorldState, road: RoadEdgeQuad[]): void {
    const won = state.phase === 'won';
    const fee = state.returnedUnderQuota ? 1 - this.config.underQuotaFeePct : 1;
    this.bankedOre += won ? state.rover.ore * fee : 0;
    if (this.gameComplete()) {
      this.persist(this.dayNumber, [], {}, []); // last day: nothing carries; new game next
      return;
    }
    const nextDay = this.dayNumber + 1;
    const sameShift = this.shiftOfDay(nextDay) === this.shiftOfDay(this.dayNumber);
    let fields = sameShift ? carryFieldsOvernight(state.fields, state.tuning) : [];
    let carriedRoad = sameShift ? road.slice() : [];
    if (!won && sameShift && this.config.hardFailRoadResetPct > 0) {
      const keepF = Math.round(fields.length * (1 - this.config.hardFailRoadResetPct));
      const keepR = Math.round(carriedRoad.length * (1 - this.config.hardFailRoadResetPct));
      fields = fields.slice(0, Math.max(0, keepF));
      carriedRoad = carriedRoad.slice(0, Math.max(0, keepR));
    }
    this.persist(nextDay, fields, carryDepletionOvernight(state.fertileZones), carriedRoad);
  }

  // Advance to the next day (or a fresh game after the last day), loading
  // whatever carried.
  advance(): void {
    if (this.gameComplete()) {
      this.newGame();
      return;
    }
    this.loadSave();
  }

  newGame(): void {
    this.gameSeed = this.mintSeed();
    this.dayNumber = 1;
    this.bankedOre = 0;
    this.carriedFields = [];
    this.carriedDepletion = {};
    this.carriedRoad = [];
    try {
      window.localStorage.setItem(SEED_KEY, this.gameSeed);
      window.localStorage.removeItem(SAVE_KEY);
    } catch {
      /* storage may be unavailable */
    }
  }

  // --- persistence ---
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
    } catch {
      this.dayNumber = 1;
      this.carriedFields = [];
      this.carriedDepletion = {};
      this.bankedOre = 0;
      this.carriedRoad = [];
    }
  }
  private persist(day: number, fields: FieldPatch[], depletion: Record<string, number>, road: RoadEdgeQuad[]): void {
    // Update in-memory carry too, so advance() reflects it even if storage fails.
    this.carriedFields = fields;
    this.carriedDepletion = depletion;
    this.carriedRoad = road;
    try {
      window.localStorage.setItem(SAVE_KEY, JSON.stringify({ day, fields, depletion, banked: this.bankedOre, road } satisfies Save));
    } catch {
      /* storage may be unavailable */
    }
  }
}
