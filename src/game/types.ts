export type Terrain = 'regolith' | 'rough' | 'crater' | 'ridge' | 'ice';

export type Mode = 'drive' | 'reclaim';

export type Phase = 'playing' | 'won' | 'lost';

export interface Point {
  x: number;
  y: number;
}

export interface Tile {
  terrain: Terrain;
  ore: number;
}

export interface RailSegment {
  cost: number;
}

export interface RoverState extends Point {
  ore: number;
}

export interface BotState extends Point {
  busyUntil: number;
  startedAt?: number;
  target?: Point;
  path?: Point[];
}

export interface WorldState {
  seed: string;
  width: number;
  height: number;
  tiles: Tile[][];
  base: Point;
  rover: RoverState;
  bot: BotState;
  rails: Record<string, RailSegment>;
  nanobots: number;
  targetOre: number;
  solarSeconds: number;
  elapsedSeconds: number;
  phase: Phase;
  message: string;
}

export interface CommandResult {
  ok: boolean;
  message: string;
  state: WorldState;
}
