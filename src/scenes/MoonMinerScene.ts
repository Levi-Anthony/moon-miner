import Phaser from 'phaser';
import { neighbors, pointKey, samePoint } from '../game/keys';
import { getGuidance } from '../game/guidance';
import {
  assignReclaimBot,
  canDriveRover,
  canReclaimRail,
  driveRover,
  getRailCost,
  mineOre,
  tickWorld
} from '../game/rules';
import type { Mode, Point, Terrain, WorldState } from '../game/types';
import { createWorld } from '../game/world';

const TILE_SIZE = 40;
const MAP_LEFT = 36;
const MAP_TOP = 96;
const HUD_TOP = 20;
const RECLAIM_HINT_NANOBOTS = 8;
const HELD_DRIVE_INTERVAL_MS = 120;
const QUEUED_DRIVE_INTERVAL_MS = 120;
const ROVER_MOVE_ANIMATION_MS = 100;
const RECLAIM_MIN_SECONDS = 1.2;
const RECLAIM_SECONDS_PER_TILE = 0.35;

const TERRAIN_COLORS: Record<Terrain, number> = {
  regolith: 0x7d8491,
  rough: 0x5d6570,
  crater: 0x1e2430,
  ridge: 0x373c45,
  ice: 0x87b8c7
};

interface Button {
  id: Mode | 'mine' | 'reset' | 'brief';
  rect: Phaser.Geom.Rectangle;
  label: string;
}

type EffectKind = 'print' | 'move' | 'mine' | 'reclaim' | 'blocked' | 'win' | 'loss';

interface VisualEffect {
  kind: EffectKind;
  point: Point;
  startedAt: number;
  durationMs: number;
}

interface RoverMoveAnimation {
  from: Point;
  to: Point;
  startedAt: number;
  durationMs: number;
}

interface DrivePathNode {
  point: Point;
  cost: number;
  steps: number;
  path: Point[];
}

interface MoonMinerDebug {
  getState: () => WorldState;
  getMode: () => Mode;
  getDriveQueue: () => Point[];
  getTileCenter: (point: Point) => Point;
  getBriefDismissCenter: () => Point;
}

interface MoonMinerDebugSnapshot {
  state: WorldState;
  mode: Mode;
  driveQueue: Point[];
  briefDismissCenter: Point;
  gameSize: Point;
}

declare global {
  interface Window {
    __moonMiner?: MoonMinerDebug;
  }
}

export class MoonMinerScene extends Phaser.Scene {
  private state!: WorldState;
  private mode: Mode = 'drive';
  private grid!: Phaser.GameObjects.Graphics;
  private overlay!: Phaser.GameObjects.Graphics;
  private hud!: Phaser.GameObjects.Text;
  private message!: Phaser.GameObjects.Text;
  private buttons: Button[] = [];
  private briefDismissRect = new Phaser.Geom.Rectangle(418, 470, 200, 42);
  private missionBriefVisible = true;
  private facing: Point = { x: 1, y: 0 };
  private roverMove?: RoverMoveAnimation;
  private effects: VisualEffect[] = [];
  private driveQueue: Point[] = [];
  private nextDriveAt = 0;
  private nextQueuedDriveAt = 0;
  private debugStateElement?: HTMLScriptElement;
  private audioContext?: AudioContext;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys?: Record<string, Phaser.Input.Keyboard.Key>;

  constructor() {
    super('moon-miner');
  }

  create(): void {
    this.state = createWorld();
    this.grid = this.add.graphics();
    this.overlay = this.add.graphics();

    this.hud = this.add.text(24, HUD_TOP, '', {
      color: '#f4f7fb',
      fontFamily: 'monospace',
      fontSize: '18px'
    });

    this.message = this.add.text(24, 665, '', {
      color: '#dce4ef',
      fontFamily: 'monospace',
      fontSize: '18px',
      wordWrap: { width: 980 }
    });

    this.buttons = [
      { id: 'drive', rect: new Phaser.Geom.Rectangle(566, 18, 82, 34), label: 'Drive' },
      { id: 'reclaim', rect: new Phaser.Geom.Rectangle(657, 18, 98, 34), label: 'Reclaim' },
      { id: 'mine', rect: new Phaser.Geom.Rectangle(764, 18, 72, 34), label: 'Mine' },
      { id: 'brief', rect: new Phaser.Geom.Rectangle(845, 18, 70, 34), label: 'Brief' },
      { id: 'reset', rect: new Phaser.Geom.Rectangle(924, 18, 76, 34), label: 'Reset' }
    ];

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.ensureAudio();
      this.handlePointer(pointer);
    });
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.keys = this.input.keyboard?.addKeys('W,A,S,D,B,V,R,SPACE') as Record<string, Phaser.Input.Keyboard.Key>;
    this.input.keyboard?.on('keydown', () => this.ensureAudio());

    this.exposeDebugHook();
    this.draw();
  }

  update(timeMs: number, deltaMs: number): void {
    if (this.missionBriefVisible) {
      this.draw();
      return;
    }

    const previousBotTarget = this.state.bot.target ? { ...this.state.bot.target } : undefined;
    const previousBotBusyUntil = this.state.bot.busyUntil;
    const previousElapsedSeconds = this.state.elapsedSeconds;
    this.state = tickWorld(this.state, deltaMs / 1000);
    this.handleCompletedReclaim(previousBotTarget, previousBotBusyUntil, previousElapsedSeconds);
    this.handleKeyboard(timeMs);
    this.handleDriveQueue(timeMs);
    this.effects = this.effects.filter((effect) => timeMs - effect.startedAt <= effect.durationMs);
    this.draw();
  }

  private handleKeyboard(timeMs: number): void {
    if (!this.keys || !this.cursors) return;
    if (this.missionBriefVisible) return;

    if (Phaser.Input.Keyboard.JustDown(this.keys.B) || Phaser.Input.Keyboard.JustDown(this.keys.V)) {
      this.mode = 'drive';
      this.clearDriveQueue();
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.R)) {
      this.mode = 'reclaim';
      this.clearDriveQueue();
    }
    if (this.state.phase !== 'playing') return;
    if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
      this.clearDriveQueue();
      this.mineWithFeedback();
    }

    const delta = this.getHeldDriveDelta();
    if (!delta) {
      this.nextDriveAt = 0;
      return;
    }

    if (timeMs >= this.nextDriveAt) {
      this.mode = 'drive';
      this.clearDriveQueue();
      this.driveWithFeedback(delta);
      this.nextDriveAt = timeMs + HELD_DRIVE_INTERVAL_MS;
    }
  }

  private handlePointer(pointer: Phaser.Input.Pointer): void {
    if (this.missionBriefVisible) {
      if (Phaser.Geom.Rectangle.Contains(this.briefDismissRect, pointer.x, pointer.y)) {
        this.missionBriefVisible = false;
        this.draw(true);
      }
      return;
    }

    const button = this.buttons.find((candidate) => Phaser.Geom.Rectangle.Contains(candidate.rect, pointer.x, pointer.y));
    if (button) {
      this.clearDriveQueue();
      if (button.id === 'drive' || button.id === 'reclaim') {
        this.mode = button.id;
      } else if (button.id === 'mine') {
        this.mineWithFeedback();
      } else if (button.id === 'brief') {
        this.missionBriefVisible = true;
      } else {
        this.state = createWorld(this.state.seed);
        this.mode = 'drive';
        this.missionBriefVisible = true;
        this.roverMove = undefined;
        this.effects = [];
        this.facing = { x: 1, y: 0 };
      }
      this.draw(true);
      return;
    }

    const tile = this.pointerToTile(pointer);
    if (!tile) return;

    if (this.mode === 'drive') {
      const delta = this.deltaFromRover(tile);
      if (this.shouldReclaimHintFromDrive(tile)) {
        this.clearDriveQueue();
        this.applyReclaimWithFeedback(tile);
        return;
      }

      if (delta) {
        this.clearDriveQueue();
        this.driveWithFeedback(delta);
      } else {
        this.startDriveQueue(tile);
      }
    } else {
      this.clearDriveQueue();
      this.applyReclaimWithFeedback(tile);
    }
  }

  private pointerToTile(pointer: Phaser.Input.Pointer): Point | undefined {
    const x = Math.floor((pointer.x - MAP_LEFT) / TILE_SIZE);
    const y = Math.floor((pointer.y - MAP_TOP) / TILE_SIZE);
    if (x < 0 || y < 0 || x >= this.state.width || y >= this.state.height) return undefined;
    return { x, y };
  }

  private exposeDebugHook(): void {
    if (!import.meta.env.DEV) return;

    window.__moonMiner = {
      getState: () => JSON.parse(JSON.stringify(this.state)) as WorldState,
      getMode: () => this.mode,
      getDriveQueue: () => this.driveQueue.map((point) => ({ ...point })),
      getTileCenter: (point: Point) => this.tileCenter(point),
      getBriefDismissCenter: () => ({ x: this.briefDismissRect.centerX, y: this.briefDismissRect.centerY })
    };

    const existing = document.getElementById('moon-miner-debug-state') as HTMLScriptElement | null;
    this.debugStateElement = existing ?? document.createElement('script');
    this.debugStateElement.id = 'moon-miner-debug-state';
    this.debugStateElement.type = 'application/json';
    if (!existing) document.body.appendChild(this.debugStateElement);
    this.updateDebugState();
  }

  private updateDebugState(): void {
    if (!this.debugStateElement) return;

    const snapshot: MoonMinerDebugSnapshot = {
      state: JSON.parse(JSON.stringify(this.state)) as WorldState,
      mode: this.mode,
      driveQueue: this.driveQueue.map((point) => ({ ...point })),
      briefDismissCenter: { x: this.briefDismissRect.centerX, y: this.briefDismissRect.centerY },
      gameSize: { x: 1040, y: 720 }
    };
    this.debugStateElement.textContent = JSON.stringify(snapshot);
  }

  private startDriveQueue(target: Point): void {
    this.clearDriveQueue();
    if (this.state.phase !== 'playing') return;

    const path = this.findDrivePath(target);
    if (path.length < 2) {
      this.state.message = samePoint(target, this.state.rover)
        ? 'Rover is already there.'
        : 'No affordable drive path to that tile.';
      this.addEffect('blocked', target);
      this.playSound('blocked');
      this.draw(true);
      return;
    }

    this.mode = 'drive';
    this.driveQueue = path.slice(1);
    this.nextQueuedDriveAt = this.time.now;
    this.state.message = `Route queued: ${this.driveQueue.length} tile${this.driveQueue.length === 1 ? '' : 's'}.`;
    this.handleDriveQueue(this.time.now);
    this.draw(true);
  }

  private handleDriveQueue(timeMs: number): void {
    if (this.driveQueue.length === 0) return;

    if (this.missionBriefVisible || this.mode !== 'drive' || this.state.phase !== 'playing') {
      this.clearDriveQueue();
      return;
    }

    if (timeMs < this.nextQueuedDriveAt) return;

    const nextPoint = this.driveQueue[0];
    const delta = this.deltaFromRover(nextPoint);
    if (!delta) {
      this.clearDriveQueue();
      this.state.message = 'Queued route interrupted.';
      this.addEffect('blocked', this.state.rover);
      this.playSound('blocked');
      this.draw(true);
      return;
    }

    const moved = this.driveWithFeedback(delta);
    if (!moved) {
      this.clearDriveQueue();
      return;
    }

    this.driveQueue.shift();
    this.nextQueuedDriveAt = timeMs + QUEUED_DRIVE_INTERVAL_MS;
  }

  private findDrivePath(target: Point): Point[] {
    if (!this.isTileOnMap(target) || this.isActiveReclaimTarget(target)) return [];
    if (!Number.isFinite(this.getDriveStepCost(target))) return [];

    const start = { x: this.state.rover.x, y: this.state.rover.y };
    const startKey = pointKey(start);
    const targetKey = pointKey(target);
    const best = new Map<string, { cost: number; steps: number }>([[startKey, { cost: 0, steps: 0 }]]);
    const queue: DrivePathNode[] = [{ point: start, cost: 0, steps: 0, path: [start] }];

    while (queue.length > 0) {
      queue.sort((a, b) => a.cost - b.cost || a.steps - b.steps);
      const current = queue.shift();
      if (!current) break;

      const currentKey = pointKey(current.point);
      const currentBest = best.get(currentKey);
      if (!currentBest || current.cost > currentBest.cost || current.steps > currentBest.steps) continue;
      if (currentKey === targetKey) return current.path;

      for (const neighbor of neighbors(current.point)) {
        if (!this.isTileOnMap(neighbor) || this.isActiveReclaimTarget(neighbor)) continue;

        const stepCost = this.getDriveStepCost(neighbor);
        if (!Number.isFinite(stepCost)) continue;

        const nextCost = current.cost + stepCost;
        if (nextCost > this.state.nanobots) continue;

        const nextSteps = current.steps + 1;
        const neighborKey = pointKey(neighbor);
        const previousBest = best.get(neighborKey);
        if (previousBest && (nextCost > previousBest.cost || (nextCost === previousBest.cost && nextSteps >= previousBest.steps))) {
          continue;
        }

        best.set(neighborKey, { cost: nextCost, steps: nextSteps });
        queue.push({
          point: { ...neighbor },
          cost: nextCost,
          steps: nextSteps,
          path: [...current.path, { ...neighbor }]
        });
      }
    }

    return [];
  }

  private getDriveStepCost(point: Point): number {
    if (pointKey(point) in this.state.rails) return 0;
    return getRailCost(this.state, point);
  }

  private clearDriveQueue(): void {
    this.driveQueue = [];
    this.nextQueuedDriveAt = 0;
  }

  private driveWithFeedback(delta: Point): boolean {
    const previousState = this.state;
    const previousPhase = previousState.phase;
    const from = { x: previousState.rover.x, y: previousState.rover.y };
    const target = { x: from.x + delta.x, y: from.y + delta.y };
    const hadRail = pointKey(target) in previousState.rails;
    const result = driveRover(previousState, delta);

    this.facing = { ...delta };
    this.state = result.state;

    if (!result.ok) {
      this.state.message = result.message;
      this.addEffect('blocked', this.isTileOnMap(target) ? target : from);
      this.playSound('blocked');
      this.draw(true);
      return false;
    }

    if (!samePoint(from, this.state.rover)) {
      this.roverMove = {
        from,
        to: { x: this.state.rover.x, y: this.state.rover.y },
        startedAt: this.time.now,
        durationMs: ROVER_MOVE_ANIMATION_MS
      };
      this.addEffect(hadRail ? 'move' : 'print', this.state.rover);
      this.playSound(hadRail ? 'move' : 'print');
    }

    this.playPhaseSound(previousPhase, this.state.phase);
    this.draw(true);
    return true;
  }

  private mineWithFeedback(): void {
    const previousPhase = this.state.phase;
    const result = mineOre(this.state);
    this.state = result.state;

    if (!result.ok) {
      this.state.message = result.message;
      this.addEffect('blocked', this.state.rover);
      this.playSound('blocked');
      this.draw(true);
      return;
    }

    this.addEffect('mine', this.state.rover);
    this.playSound('mine');
    this.playPhaseSound(previousPhase, this.state.phase);
    this.draw(true);
  }

  private applyReclaimWithFeedback(point: Point): void {
    const previousPhase = this.state.phase;
    const result = assignReclaimBot(this.state, point);
    this.state = result.state;

    if (!result.ok) {
      this.state.message = result.message;
      this.addEffect('blocked', point);
      this.playSound('blocked');
      this.draw(true);
      return;
    }

    this.mode = 'drive';
    this.addEffect('reclaim', point);
    this.playSound('reclaim');
    this.playPhaseSound(previousPhase, this.state.phase);
    this.draw(true);
  }

  private handleCompletedReclaim(previousTarget: Point | undefined, previousBusyUntil: number, previousElapsedSeconds: number): void {
    const completed =
      previousTarget &&
      previousBusyUntil > previousElapsedSeconds &&
      previousBusyUntil <= this.state.elapsedSeconds &&
      !this.state.bot.target;

    if (completed) {
      this.addEffect('reclaim', previousTarget);
      this.playSound('reclaim');
    }
  }

  private draw(_messageChanged = false): void {
    this.grid.clear();
    this.overlay.clear();
    this.drawBackdrop();
    this.drawTiles();
    this.drawRails();
    this.drawDriveQueue();
    this.drawReclaimRoute();
    this.drawActors();
    this.drawEffects();
    this.drawHud();
    this.updateDebugState();
  }

  private drawBackdrop(): void {
    this.grid.fillStyle(0x10131c, 1);
    this.grid.fillRoundedRect(18, 76, 840, 600, 8);
    this.grid.lineStyle(1, 0x293040, 1);
    this.grid.strokeRoundedRect(18, 76, 840, 600, 8);
  }

  private drawTiles(): void {
    for (let y = 0; y < this.state.height; y += 1) {
      for (let x = 0; x < this.state.width; x += 1) {
        const tile = this.state.tiles[y][x];
        const px = MAP_LEFT + x * TILE_SIZE;
        const py = MAP_TOP + y * TILE_SIZE;
        this.grid.fillStyle(TERRAIN_COLORS[tile.terrain], 1);
        this.grid.fillRect(px, py, TILE_SIZE - 2, TILE_SIZE - 2);
        this.grid.lineStyle(1, 0x202737, 0.7);
        this.grid.strokeRect(px, py, TILE_SIZE - 2, TILE_SIZE - 2);

        if (tile.terrain === 'crater') {
          this.grid.fillStyle(0x0d1119, 0.8);
          this.grid.fillCircle(px + 20, py + 20, 13);
        }

        if (tile.terrain === 'ridge') {
          this.grid.lineStyle(4, 0x818893, 0.7);
          this.grid.lineBetween(px + 8, py + 30, px + 32, py + 10);
        }

        if (tile.ore > 0) {
          this.grid.fillStyle(0xf0c85a, 1);
          this.grid.fillCircle(px + 20, py + 20, 7);
          this.grid.fillStyle(0xffffff, 0.65);
          this.grid.fillCircle(px + 17, py + 17, 2);
        }
      }
    }
  }

  private drawRails(): void {
    for (const key of Object.keys(this.state.rails)) {
      const [x, y] = key.split(',').map(Number);
      const px = MAP_LEFT + x * TILE_SIZE;
      const py = MAP_TOP + y * TILE_SIZE;
      const isBase = samePoint({ x, y }, this.state.base);
      this.drawRailSegment({ x, y }, px, py, isBase);
    }

    this.drawReclaimHints();

    const hovered = this.input.activePointer ? this.pointerToTile(this.input.activePointer) : undefined;
    if (hovered) {
      const delta = this.deltaFromRover(hovered);
      const activeReclaimTarget = this.isActiveReclaimTarget(hovered);
      const driveModeReclaim = this.shouldReclaimHintFromDrive(hovered);
      const queuedDrivePath = this.mode === 'drive' && !delta && !driveModeReclaim && this.findDrivePath(hovered).length > 1;
      const check =
        activeReclaimTarget
          ? { ok: true }
          : driveModeReclaim || queuedDrivePath
          ? { ok: true }
          : this.mode === 'drive'
          ? delta
            ? canDriveRover(this.state, delta)
            : { ok: false }
          : canReclaimRail(this.state, hovered);
      const px = MAP_LEFT + hovered.x * TILE_SIZE;
      const py = MAP_TOP + hovered.y * TILE_SIZE;
      this.overlay.lineStyle(3, activeReclaimTarget || driveModeReclaim ? 0xffd1b8 : check.ok ? 0x9fffcf : 0xff6f78, 1);
      this.overlay.strokeRect(px + 2, py + 2, TILE_SIZE - 6, TILE_SIZE - 6);
    }
  }

  private drawReclaimHints(): void {
    if (this.mode !== 'reclaim' && this.state.nanobots > RECLAIM_HINT_NANOBOTS) return;

    for (const key of Object.keys(this.state.rails)) {
      const [x, y] = key.split(',').map(Number);
      const point = { x, y };
      if (!this.isReclaimHint(point)) continue;

      const center = this.tileCenter(point);
      this.overlay.lineStyle(2, 0xffd1b8, 0.95);
      this.overlay.strokeCircle(center.x, center.y, 13);
    }
  }

  private drawDriveQueue(): void {
    if (this.driveQueue.length === 0) return;

    const path = [{ x: this.state.rover.x, y: this.state.rover.y }, ...this.driveQueue];
    this.overlay.lineStyle(3, 0x8ffff2, 0.46);

    for (let index = 0; index < path.length - 1; index += 1) {
      const from = this.tileCenter(path[index]);
      const to = this.tileCenter(path[index + 1]);
      this.overlay.lineBetween(from.x, from.y, to.x, to.y);
    }

    this.overlay.fillStyle(0x8ffff2, 0.72);
    for (const point of this.driveQueue) {
      const center = this.tileCenter(point);
      this.overlay.fillCircle(center.x, center.y, 3);
    }
  }

  private drawActors(): void {
    const roverPosition = this.getRoverDrawPosition();
    const roverX = roverPosition.x;
    const roverY = roverPosition.y;
    const horizontal = this.facing.x !== 0;
    const bodyWidth = horizontal ? 28 : 20;
    const bodyHeight = horizontal ? 20 : 28;

    this.grid.fillStyle(0xf6f7ff, 1);
    this.grid.fillRoundedRect(roverX - bodyWidth / 2, roverY - bodyHeight / 2, bodyWidth, bodyHeight, 5);
    this.grid.fillStyle(0x22334a, 1);
    this.grid.fillCircle(roverX + this.facing.x * 11, roverY + this.facing.y * 11, 5);
    this.grid.fillStyle(0x111827, 1);
    if (horizontal) {
      this.grid.fillCircle(roverX - 9, roverY - 10, 4);
      this.grid.fillCircle(roverX + 9, roverY - 10, 4);
      this.grid.fillCircle(roverX - 9, roverY + 10, 4);
      this.grid.fillCircle(roverX + 9, roverY + 10, 4);
    } else {
      this.grid.fillCircle(roverX - 10, roverY - 9, 4);
      this.grid.fillCircle(roverX - 10, roverY + 9, 4);
      this.grid.fillCircle(roverX + 10, roverY - 9, 4);
      this.grid.fillCircle(roverX + 10, roverY + 9, 4);
    }

    this.grid.fillStyle(0x8ffff2, 0.75);
    this.grid.fillCircle(roverX + this.facing.x * 16, roverY + this.facing.y * 16, 3);

    const botPosition = this.getBotDrawPosition();
    const botX = botPosition.x;
    const botY = botPosition.y;
    this.grid.fillStyle(0xff8d5c, 1);
    this.grid.fillCircle(botX, botY, 5);
    this.grid.lineStyle(2, 0xffd1b8, 1);
    this.grid.strokeCircle(botX, botY, 9);
  }

  private drawEffects(): void {
    const now = this.time.now;
    for (const effect of this.effects) {
      const progress = Phaser.Math.Clamp((now - effect.startedAt) / effect.durationMs, 0, 1);
      const center = this.tileCenter(effect.point);
      const alpha = 1 - progress;

      if (effect.kind === 'blocked') {
        this.overlay.lineStyle(3, 0xff6f78, alpha);
        const shake = Math.sin(progress * Math.PI * 8) * 3;
        this.overlay.strokeRect(center.x - 18 + shake, center.y - 18, 36, 36);
        continue;
      }

      const color = this.effectColor(effect.kind);
      const radius = effect.kind === 'print' ? 9 + progress * 22 : 6 + progress * 16;
      this.overlay.lineStyle(effect.kind === 'print' ? 4 : 3, color, alpha);
      this.overlay.strokeCircle(center.x, center.y, radius);

      if (effect.kind === 'print') {
        this.overlay.fillStyle(color, 0.18 * alpha);
        this.overlay.fillCircle(center.x, center.y, 18);
      }
    }
  }

  private drawHud(): void {
    const seconds = Math.ceil(this.state.solarSeconds);
    const solarLabel = seconds > 80 ? 'HIGH' : seconds > 35 ? 'LOW' : 'CRITICAL';
    const guidance = getGuidance(this.state);
    this.hud.setText(
      `Nanobots ${this.state.nanobots}   Ore ${this.state.rover.ore}/${this.state.targetOre}   Sun ${seconds}s ${solarLabel}   Mode ${this.mode.toUpperCase()}`
    );
    this.message.setText(this.state.message);

    for (const button of this.buttons) {
      const active = button.id === this.mode;
      this.grid.fillStyle(active ? 0x315a6b : 0x1a2230, 1);
      this.grid.fillRoundedRect(button.rect.x, button.rect.y, button.rect.width, button.rect.height, 6);
      this.grid.lineStyle(1, active ? 0x88e6ff : 0x445061, 1);
      this.grid.strokeRoundedRect(button.rect.x, button.rect.y, button.rect.width, button.rect.height, 6);
      this.addButtonLabel(button);
    }

    this.drawLegend();
    this.drawObjectivePanel(guidance.objective, guidance.nudge);
    this.drawPhaseBanner();
    this.drawMissionBrief();
  }

  private addButtonLabel(button: Button): void {
    const label = this.children.getByName(`button-${button.id}`) as Phaser.GameObjects.Text | null;
    if (label) {
      label.setText(button.label);
      label.setPosition(button.rect.centerX, button.rect.centerY);
      return;
    }

    const created = this.add
      .text(button.rect.centerX, button.rect.centerY, button.label, {
        color: '#edf7ff',
        fontFamily: 'monospace',
        fontSize: '15px'
      })
      .setOrigin(0.5);
    created.setName(`button-${button.id}`);
  }

  private drawLegend(): void {
    const panelX = 880;
    this.grid.fillStyle(0x10131c, 1);
    this.grid.fillRoundedRect(panelX, 96, 132, 272, 8);
    this.grid.lineStyle(1, 0x293040, 1);
    this.grid.strokeRoundedRect(panelX, 96, 132, 272, 8);

    const labels: Array<[string, number, string]> = [
      ['regolith', TERRAIN_COLORS.regolith, 'cost 1'],
      ['rough', TERRAIN_COLORS.rough, 'cost 2'],
      ['ice', TERRAIN_COLORS.ice, 'cost 2'],
      ['crater', TERRAIN_COLORS.crater, 'blocked'],
      ['ridge', TERRAIN_COLORS.ridge, 'blocked']
    ];

    labels.forEach(([name, color, note], index) => {
      const y = 116 + index * 42;
      this.grid.fillStyle(color, 1);
      this.grid.fillRect(panelX + 14, y, 22, 22);
      this.drawStaticText(`legend-${name}`, panelX + 46, y - 1, name, 13, '#f3f6fb');
      this.drawStaticText(`legend-${name}-note`, panelX + 46, y + 15, note, 12, '#aeb9c8');
    });

    const hovered = this.input.activePointer ? this.pointerToTile(this.input.activePointer) : undefined;
    if (hovered) {
      const cost = getRailCost(this.state, hovered);
      const value = Number.isFinite(cost) ? String(cost) : '-';
      this.drawStaticText('tile-readout', panelX + 14, 332, `tile ${hovered.x},${hovered.y}  cost ${value}`, 12, '#dce4ef');
    } else {
      this.drawStaticText('tile-readout', panelX + 14, 332, '', 12, '#dce4ef');
    }
  }

  private drawObjectivePanel(objective: string, nudge: string): void {
    const panelX = 880;
    this.grid.fillStyle(0x10131c, 1);
    this.grid.fillRoundedRect(panelX, 386, 132, 136, 8);
    this.grid.lineStyle(1, 0x293040, 1);
    this.grid.strokeRoundedRect(panelX, 386, 132, 136, 8);
    this.drawStaticText('objective-label', panelX + 14, 404, 'objective', 12, '#8fb8c9');
    this.drawStaticText('objective-title', panelX + 14, 423, objective, 14, '#ffffff');
    this.drawWrappedText('objective-nudge', panelX + 14, 454, nudge, 12, '#c5d2df', 20, 4);
  }

  private drawPhaseBanner(): void {
    if (this.state.phase === 'playing') {
      this.drawStaticText('phase-title', 518, 306, '', 28, '#ffffff', 0.5);
      this.drawStaticText('phase-body', 518, 350, '', 17, '#dfe8f2', 0.5);
      this.drawStaticText('phase-reset', 518, 376, '', 14, '#b9c6d6', 0.5);
      return;
    }

    const won = this.state.phase === 'won';
    this.overlay.fillStyle(won ? 0x12382f : 0x401e28, 0.94);
    this.overlay.fillRoundedRect(248, 268, 540, 132, 8);
    this.overlay.lineStyle(2, won ? 0x77f2ca : 0xff8491, 1);
    this.overlay.strokeRoundedRect(248, 268, 540, 132, 8);
    this.drawStaticText('phase-title', 518, 306, won ? 'EXTRACTION COMPLETE' : 'RUN FAILED', 28, '#ffffff', 0.5);
    this.drawStaticText('phase-body', 518, 350, this.state.message, 17, '#dfe8f2', 0.5);
    this.drawStaticText('phase-reset', 518, 376, 'Use Reset to start the same seed again.', 14, '#b9c6d6', 0.5);
  }

  private drawMissionBrief(): void {
    const names = [
      'brief-title',
      'brief-line-1',
      'brief-line-2',
      'brief-line-3',
      'brief-line-4',
      'brief-line-5',
      'brief-dismiss'
    ];

    if (!this.missionBriefVisible) {
      for (const name of names) {
        this.drawStaticText(name, 0, 0, '', 1, '#ffffff');
      }
      return;
    }

    this.overlay.fillStyle(0x05070d, 0.78);
    this.overlay.fillRect(0, 0, 1040, 720);
    this.overlay.fillStyle(0x121722, 0.97);
    this.overlay.fillRoundedRect(272, 174, 492, 352, 8);
    this.overlay.lineStyle(2, 0x69d7d0, 1);
    this.overlay.strokeRoundedRect(272, 174, 492, 352, 8);
    this.drawStaticText('brief-title', 518, 210, 'MOON MINER BRIEFING', 25, '#ffffff', 0.5);
    this.drawStaticText('brief-line-1', 316, 260, 'Click a destination, or drive with WASD/arrows.', 16, '#dce8f2');
    this.drawStaticText('brief-line-2', 316, 294, 'Rail auto-prints, spending nanobots.', 16, '#dce8f2');
    this.drawStaticText('brief-line-3', 316, 328, 'Craters and ridges block rail.', 16, '#dce8f2');
    this.drawStaticText('brief-line-4', 316, 362, 'Mine 2 ore and return before sunset.', 16, '#dce8f2');
    this.drawStaticText('brief-line-5', 316, 408, 'When low, click highlighted old rail to reclaim.', 15, '#9fb2c5');

    this.overlay.fillStyle(0x22394a, 1);
    this.overlay.fillRoundedRect(
      this.briefDismissRect.x,
      this.briefDismissRect.y,
      this.briefDismissRect.width,
      this.briefDismissRect.height,
      6
    );
    this.overlay.lineStyle(1, 0x87f6dc, 1);
    this.overlay.strokeRoundedRect(
      this.briefDismissRect.x,
      this.briefDismissRect.y,
      this.briefDismissRect.width,
      this.briefDismissRect.height,
      6
    );
    this.drawStaticText('brief-dismiss', 518, 481, 'Begin Run', 16, '#ffffff', 0.5);
  }

  private drawRailSegment(point: Point, px: number, py: number, isBase: boolean): void {
    const centerX = px + TILE_SIZE / 2;
    const centerY = py + TILE_SIZE / 2;
    const color = isBase ? 0x62f6c8 : 0xb9d7ff;
    const connected = neighbors(point).filter((neighbor) => pointKey(neighbor) in this.state.rails);

    this.grid.lineStyle(isBase ? 8 : 6, color, 1);
    if (connected.length === 0) {
      this.grid.lineBetween(centerX - 12, centerY, centerX + 12, centerY);
    } else {
      for (const neighbor of connected) {
        this.grid.lineBetween(centerX, centerY, MAP_LEFT + neighbor.x * TILE_SIZE + 20, MAP_TOP + neighbor.y * TILE_SIZE + 20);
      }
    }

    this.grid.fillStyle(0x13263a, 1);
    this.grid.fillCircle(centerX, centerY, isBase ? 6 : 4);
    this.grid.lineStyle(2, 0x13263a, 0.95);
    this.grid.strokeCircle(centerX, centerY, isBase ? 9 : 7);
  }

  private drawReclaimRoute(): void {
    const path = this.getActiveBotPath();
    if (path.length < 2) return;

    const progress = this.getBotTravelProgress() * (path.length - 1);
    for (let index = 0; index < path.length - 1; index += 1) {
      const from = this.tileCenter(path[index]);
      const to = this.tileCenter(path[index + 1]);
      this.grid.lineStyle(5, 0xff8d5c, index <= progress ? 0.72 : 0.28);
      this.grid.lineBetween(from.x, from.y, to.x, to.y);
    }

    const target = this.tileCenter(path[path.length - 1]);
    this.grid.lineStyle(2, 0xffd1b8, 0.95);
    this.grid.strokeCircle(target.x, target.y, 12);
  }

  private getRoverDrawPosition(): Point {
    if (!this.roverMove) return this.tileCenter(this.state.rover);

    const progress = Phaser.Math.Clamp((this.time.now - this.roverMove.startedAt) / this.roverMove.durationMs, 0, 1);
    if (progress >= 1) {
      this.roverMove = undefined;
      return this.tileCenter(this.state.rover);
    }

    const eased = Phaser.Math.Easing.Sine.Out(progress);
    const from = this.tileCenter(this.roverMove.from);
    const to = this.tileCenter(this.roverMove.to);
    return {
      x: Phaser.Math.Linear(from.x, to.x, eased),
      y: Phaser.Math.Linear(from.y, to.y, eased)
    };
  }

  private getBotDrawPosition(): Point {
    const path = this.getActiveBotPath();
    if (path.length >= 2) {
      return this.interpolateAlongPath(path, this.getBotTravelProgress());
    }

    if (this.isBotBusy() && this.state.bot.target) {
      return this.tileCenter(this.state.bot.target);
    }

    const base = this.tileCenter(this.state.base);
    return { x: base.x + 10, y: base.y - 10 };
  }

  private interpolateAlongPath(path: Point[], progress: number): Point {
    const segmentCount = path.length - 1;
    const scaledProgress = Phaser.Math.Clamp(progress, 0, 1) * segmentCount;
    const segmentIndex = Math.min(segmentCount - 1, Math.floor(scaledProgress));
    const segmentProgress = Phaser.Math.Clamp(scaledProgress - segmentIndex, 0, 1);
    const from = this.tileCenter(path[segmentIndex]);
    const to = this.tileCenter(path[segmentIndex + 1]);

    return {
      x: Phaser.Math.Linear(from.x, to.x, segmentProgress),
      y: Phaser.Math.Linear(from.y, to.y, segmentProgress)
    };
  }

  private getActiveBotPath(): Point[] {
    if (!this.isBotBusy() || !this.state.bot.path) return [];
    return this.state.bot.path;
  }

  private getBotTravelProgress(): number {
    const pathDistance = Math.max(0, (this.state.bot.path?.length ?? 1) - 1);
    const fallbackStartedAt = this.state.bot.busyUntil - Math.max(RECLAIM_MIN_SECONDS, pathDistance * RECLAIM_SECONDS_PER_TILE);
    const startedAt = this.state.bot.startedAt ?? fallbackStartedAt;
    const duration = this.state.bot.busyUntil - startedAt;

    if (duration <= 0) return 1;
    return Phaser.Math.Clamp((this.state.elapsedSeconds - startedAt) / duration, 0, 1);
  }

  private isBotBusy(): boolean {
    return Boolean(this.state.bot.target && this.state.bot.busyUntil > this.state.elapsedSeconds);
  }

  private isActiveReclaimTarget(point: Point): boolean {
    return Boolean(this.isBotBusy() && this.state.bot.target && samePoint(this.state.bot.target, point));
  }

  private isReclaimHint(point: Point): boolean {
    const railNeighbors = neighbors(point).filter((neighbor) => pointKey(neighbor) in this.state.rails);
    return railNeighbors.length <= 1 && canReclaimRail(this.state, point).ok;
  }

  private shouldReclaimHintFromDrive(point: Point): boolean {
    return (
      this.mode === 'drive' &&
      this.state.nanobots <= RECLAIM_HINT_NANOBOTS &&
      !this.isActiveReclaimTarget(point) &&
      this.isReclaimHint(point)
    );
  }

  private addEffect(kind: EffectKind, point: Point): void {
    this.effects.push({
      kind,
      point: { ...point },
      startedAt: this.time.now,
      durationMs: kind === 'blocked' ? 260 : 420
    });
  }

  private playPhaseSound(previous: WorldState['phase'], next: WorldState['phase']): void {
    if (previous === next) return;
    if (next === 'won') {
      this.addEffect('win', this.state.rover);
      this.playSound('win');
    }
    if (next === 'lost') {
      this.addEffect('loss', this.state.rover);
      this.playSound('loss');
    }
  }

  private playSound(kind: EffectKind): void {
    if (!this.audioContext) return;

    const context = this.ensureAudio();
    if (!context) return;

    const now = context.currentTime;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + this.soundDuration(kind));
    gain.connect(context.destination);

    for (const [index, frequency] of this.soundFrequencies(kind).entries()) {
      const oscillator = context.createOscillator();
      oscillator.type = kind === 'blocked' || kind === 'loss' ? 'sawtooth' : 'triangle';
      oscillator.frequency.setValueAtTime(frequency, now + index * 0.035);
      oscillator.connect(gain);
      oscillator.start(now + index * 0.035);
      oscillator.stop(now + this.soundDuration(kind));
    }
  }

  private ensureAudio(): AudioContext | undefined {
    if (this.audioContext) {
      if (this.audioContext.state === 'suspended') {
        void this.audioContext.resume();
      }
      return this.audioContext;
    }

    const audioWindow = window as Window & { webkitAudioContext?: typeof AudioContext };
    const AudioCtor = window.AudioContext ?? audioWindow.webkitAudioContext;
    if (!AudioCtor) return undefined;

    this.audioContext = new AudioCtor();
    return this.audioContext;
  }

  private soundFrequencies(kind: EffectKind): number[] {
    switch (kind) {
      case 'print':
        return [420, 610, 840];
      case 'move':
        return [180, 230];
      case 'mine':
        return [260, 190, 320];
      case 'reclaim':
        return [520, 390];
      case 'win':
        return [440, 660, 880];
      case 'loss':
        return [220, 165, 110];
      case 'blocked':
        return [130];
    }
  }

  private soundDuration(kind: EffectKind): number {
    return kind === 'win' || kind === 'loss' ? 0.32 : 0.16;
  }

  private effectColor(kind: EffectKind): number {
    switch (kind) {
      case 'print':
        return 0x78f7ff;
      case 'move':
        return 0xf6f7ff;
      case 'mine':
        return 0xf0c85a;
      case 'reclaim':
        return 0xff8d5c;
      case 'win':
        return 0x77f2ca;
      case 'loss':
      case 'blocked':
        return 0xff6f78;
    }
  }

  private tileCenter(point: Point): Point {
    return {
      x: MAP_LEFT + point.x * TILE_SIZE + TILE_SIZE / 2,
      y: MAP_TOP + point.y * TILE_SIZE + TILE_SIZE / 2
    };
  }

  private isTileOnMap(point: Point): boolean {
    return point.x >= 0 && point.y >= 0 && point.x < this.state.width && point.y < this.state.height;
  }

  private getHeldDriveDelta(): Point | undefined {
    if (!this.keys || !this.cursors) return undefined;
    if (this.cursors.left.isDown || this.keys.A.isDown) return { x: -1, y: 0 };
    if (this.cursors.right.isDown || this.keys.D.isDown) return { x: 1, y: 0 };
    if (this.cursors.up.isDown || this.keys.W.isDown) return { x: 0, y: -1 };
    if (this.cursors.down.isDown || this.keys.S.isDown) return { x: 0, y: 1 };
    return undefined;
  }

  private deltaFromRover(point: Point): Point | undefined {
    const delta = { x: point.x - this.state.rover.x, y: point.y - this.state.rover.y };
    if (Math.abs(delta.x) + Math.abs(delta.y) !== 1) return undefined;
    return delta;
  }

  private drawStaticText(
    name: string,
    x: number,
    y: number,
    text: string,
    fontSize: number,
    color: string,
    originX = 0
  ): void {
    const existing = this.children.getByName(name) as Phaser.GameObjects.Text | null;
    if (existing) {
      existing.setPosition(x, y);
      existing.setText(text);
      existing.setOrigin(originX, 0);
      return;
    }

    const created = this.add
      .text(x, y, text, {
        color,
        fontFamily: 'monospace',
        fontSize: `${fontSize}px`
      })
      .setOrigin(originX, 0);
    created.setName(name);
  }

  private drawWrappedText(
    name: string,
    x: number,
    y: number,
    text: string,
    fontSize: number,
    color: string,
    maxChars: number,
    maxLines: number
  ): void {
    const words = text.split(' ');
    const lines: string[] = [];
    let current = '';

    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (next.length > maxChars && current) {
        lines.push(current);
        current = word;
      } else {
        current = next;
      }
    }

    if (current) lines.push(current);

    for (let index = 0; index < maxLines; index += 1) {
      this.drawStaticText(`${name}-${index}`, x, y + index * 16, lines[index] ?? '', fontSize, color);
    }
  }
}
