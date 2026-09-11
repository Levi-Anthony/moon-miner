import Phaser from 'phaser';

// A deliberately tiny sandbox for one question only: does driving + laying a
// road + the slide feel good? No drone, shifts, quota, nanobots, or main-game
// machinery -- just the core, with live sliders so the feel can be locked
// before it is baked into Moon Miner.
//
// The road is the owner's idea, not a grid of tiles: a lane ~2.5 car widths
// wide, drawn as one continuous ribbon. Once you are on laid road it CARRIES
// you -- a pure-pursuit follow steers along the lane so hands-off you slide
// down it, and it eases off the gas in sharp corners so it can actually take
// them. Leaving takes a deliberate turn (the follow is capped below your steer).

const CAR_LENGTH = 30;
const CAR_WIDTH = 18;
const GROUND_SPEED = 130;
const TURN_RATE = 2.7; // rad/s at full manual lock
const FREE_BAND_FRAC = 0.55; // cosmetic: width of the brighter centre stripe
const POINT_SPACING = 7; // sample a road point every this-many units travelled

// Adjustable defaults (all live-tunable from the on-screen panel).
const DEFAULT_LANE_CAR_WIDTHS = 2.5;
const DEFAULT_ROAD_SPEED = 210; // the slide
const DEFAULT_FOLLOW_STEER = 2.5; // how hard the road steers you along itself
const DEFAULT_LOOKAHEAD = 52; // pure-pursuit aim distance; smaller = snappier
const DEFAULT_CORNER_EASE = 0.45; // how much it slows in the sharpest corners

interface Vec2 {
  x: number;
  y: number;
}

function angleDelta(target: number, current: number): number {
  let d = target - current;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export class SandboxScene extends Phaser.Scene {
  private graphics!: Phaser.GameObjects.Graphics;
  private hud!: Phaser.GameObjects.Text;

  private rover = { x: 0, y: 0, heading: -Math.PI / 2, speed: 0 };
  private steerInput = 0;
  private path: Vec2[] = [];
  private distanceSinceLastPoint = 0;
  private onRoad = false;

  // Live-tunable feel.
  private laneWidth = CAR_WIDTH * DEFAULT_LANE_CAR_WIDTHS;
  private roadSpeed = DEFAULT_ROAD_SPEED;
  private followSteer = DEFAULT_FOLLOW_STEER;
  private lookahead = DEFAULT_LOOKAHEAD;
  private cornerEase = DEFAULT_CORNER_EASE;

  private keys?: Record<string, Phaser.Input.Keyboard.Key>;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private touch?: { steer: number };
  private panel?: HTMLElement;
  private panelToggle?: HTMLButtonElement;

  constructor() {
    super('sandbox');
  }

  private get laneHalf(): number {
    return this.laneWidth / 2;
  }

  create(): void {
    this.rover.x = this.scale.gameSize.width / 2;
    this.rover.y = this.scale.gameSize.height / 2;
    this.path = [{ x: this.rover.x, y: this.rover.y }];

    this.graphics = this.add.graphics();
    this.hud = this.add.text(14, 12, '', {
      color: '#eef3f8',
      fontFamily: 'monospace',
      fontSize: '15px'
    });

    this.cursors = this.input.keyboard?.createCursorKeys();
    this.keys = this.input.keyboard?.addKeys('W,A,S,D,R') as Record<string, Phaser.Input.Keyboard.Key>;
    this.input.addPointer(1);
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => this.updateTouch(pointer));
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown) this.updateTouch(pointer);
    });
    this.input.on('pointerup', () => (this.touch = undefined));
    this.input.on('pointerupoutside', () => (this.touch = undefined));

    this.buildControls();
  }

  private updateTouch(pointer: Phaser.Input.Pointer): void {
    // Touch anywhere on the playfield to drive; horizontal position relative to
    // screen centre steers.
    const steer = Phaser.Math.Clamp(
      (pointer.x - this.scale.gameSize.width / 2) / (this.scale.gameSize.width / 3),
      -1,
      1
    );
    this.touch = { steer };
  }

  update(_time: number, deltaMs: number): void {
    const dt = Math.min(deltaMs / 1000, 1 / 30);

    if (this.keys?.R?.isDown) this.resetPath();

    const targetSteer = this.touch ? this.touch.steer : this.keyboardSteer();
    this.steerInput += Phaser.Math.Clamp(targetSteer - this.steerInput, -6 * dt, 6 * dt);

    const throttle = this.touch || this.keys?.W?.isDown || this.cursors?.up?.isDown ? 1 : 0;

    const road = this.sampleRoad();
    this.onRoad = road.onRoad;

    const playerTurn = this.steerInput * TURN_RATE;
    let followTurn = 0;
    let speed = road.onRoad ? this.roadSpeed : GROUND_SPEED;

    if (road.onRoad) {
      // Pure pursuit: steer toward a point further along the road, which both
      // re-centres and follows the curve. Proportional, so it settles rather
      // than hunting. Player steering adds on top and, being stronger, wins.
      const err = angleDelta(road.desiredHeading, this.rover.heading);
      followTurn = Phaser.Math.Clamp(err / 0.5, -1, 1) * this.followSteer;
      // Ease off the gas in sharp corners so a tight bend is actually takeable
      // instead of flinging you off the outside.
      const sharp = Math.min(Math.abs(err) / 0.9, 1);
      speed *= 1 - this.cornerEase * sharp;
    }

    this.rover.heading += (playerTurn + followTurn) * dt;
    this.rover.speed = speed * throttle;

    if (throttle > 0) {
      const prevX = this.rover.x;
      const prevY = this.rover.y;
      this.rover.x += Math.cos(this.rover.heading) * this.rover.speed * dt;
      this.rover.y += Math.sin(this.rover.heading) * this.rover.speed * dt;
      this.keepInBounds();
      this.recordPath(Phaser.Math.Distance.Between(prevX, prevY, this.rover.x, this.rover.y));
    }

    this.draw();
  }

  private keyboardSteer(): number {
    const left = this.keys?.A?.isDown || this.cursors?.left?.isDown;
    const right = this.keys?.D?.isDown || this.cursors?.right?.isDown;
    return (right ? 1 : 0) - (left ? 1 : 0);
  }

  private keepInBounds(): void {
    const margin = 24;
    const w = this.scale.gameSize.width;
    const h = this.scale.gameSize.height;
    const clampedX = Phaser.Math.Clamp(this.rover.x, margin, w - margin);
    const clampedY = Phaser.Math.Clamp(this.rover.y, margin, h - margin);
    if (clampedX !== this.rover.x || clampedY !== this.rover.y) {
      this.rover.x = clampedX;
      this.rover.y = clampedY;
      this.rover.heading = Math.atan2(h / 2 - this.rover.y, w / 2 - this.rover.x);
    }
  }

  private recordPath(moved: number): void {
    this.distanceSinceLastPoint += moved;
    if (this.distanceSinceLastPoint >= POINT_SPACING) {
      this.distanceSinceLastPoint = 0;
      this.path.push({ x: this.rover.x, y: this.rover.y });
      if (this.path.length > 6000) this.path.shift();
    }
  }

  private sampleRoad(): { onRoad: boolean; desiredHeading: number } {
    // Ignore the freshly laid tail so the lane being laid under the rover does
    // not itself count as road to slide on.
    const recentSkip = this.laneWidth * 1.6;
    const skipPoints = Math.ceil(recentSkip / POINT_SPACING);
    const limit = this.path.length - skipPoints;
    if (limit < 2) return { onRoad: false, desiredHeading: this.rover.heading };

    let bestDist = Infinity;
    let best = { cx: this.rover.x, cy: this.rover.y, angle: this.rover.heading };
    for (let i = 1; i < limit; i += 1) {
      const a = this.path[i - 1];
      const b = this.path[i];
      const projected = this.projectPointToSegment(this.rover, a, b);
      if (projected.dist < bestDist) {
        bestDist = projected.dist;
        best = { cx: projected.cx, cy: projected.cy, angle: projected.angle };
      }
    }

    if (bestDist >= this.laneHalf) return { onRoad: false, desiredHeading: this.rover.heading };

    let tangent = best.angle;
    if (Math.cos(tangent) * Math.cos(this.rover.heading) + Math.sin(tangent) * Math.sin(this.rover.heading) < 0) {
      tangent += Math.PI;
    }
    const targetX = best.cx + Math.cos(tangent) * this.lookahead;
    const targetY = best.cy + Math.sin(tangent) * this.lookahead;
    return { onRoad: true, desiredHeading: Math.atan2(targetY - this.rover.y, targetX - this.rover.x) };
  }

  private projectPointToSegment(p: Vec2, a: Vec2, b: Vec2): { dist: number; cx: number; cy: number; angle: number } {
    const abx = b.x - a.x;
    const aby = b.y - a.y;
    const lenSq = abx * abx + aby * aby;
    let t = lenSq > 0 ? ((p.x - a.x) * abx + (p.y - a.y) * aby) / lenSq : 0;
    t = Phaser.Math.Clamp(t, 0, 1);
    const cx = a.x + abx * t;
    const cy = a.y + aby * t;
    const dist = Math.hypot(p.x - cx, p.y - cy);
    const angle = Math.atan2(aby, abx);
    return { dist, cx, cy, angle };
  }

  private resetPath(): void {
    this.path = [{ x: this.rover.x, y: this.rover.y }];
    this.distanceSinceLastPoint = 0;
  }

  private draw(): void {
    const g = this.graphics;
    g.clear();

    g.fillStyle(0x0f1420, 1);
    g.fillRect(0, 0, this.scale.gameSize.width, this.scale.gameSize.height);

    if (this.path.length >= 2) {
      this.strokePolyline(0x2b3550, this.laneWidth + 4);
      this.strokePolyline(0x50607f, this.laneWidth);
      this.strokePolyline(0x6f83a6, this.laneWidth * FREE_BAND_FRAC);
    }

    this.drawRover();
    this.hud.setText(
      [
        this.onRoad ? 'ON ROAD — slide' : 'raw ground — laying',
        `speed ${this.rover.speed.toFixed(0)}`,
        'W/↑ drive · A/D or ←/→ steer · R reset'
      ].join('\n')
    );
  }

  private strokePolyline(color: number, width: number): void {
    const g = this.graphics;
    g.lineStyle(width, color, 1);
    g.beginPath();
    g.moveTo(this.path[0].x, this.path[0].y);
    for (let i = 1; i < this.path.length; i += 1) {
      g.lineTo(this.path[i].x, this.path[i].y);
    }
    g.strokePath();
  }

  private drawRover(): void {
    const g = this.graphics;
    const { x, y, heading } = this.rover;
    const cos = Math.cos(heading);
    const sin = Math.sin(heading);
    const nose = { x: x + cos * CAR_LENGTH * 0.5, y: y + sin * CAR_LENGTH * 0.5 };
    const tailLeft = {
      x: x - cos * CAR_LENGTH * 0.5 - sin * CAR_WIDTH * 0.5,
      y: y - sin * CAR_LENGTH * 0.5 + cos * CAR_WIDTH * 0.5
    };
    const tailRight = {
      x: x - cos * CAR_LENGTH * 0.5 + sin * CAR_WIDTH * 0.5,
      y: y - sin * CAR_LENGTH * 0.5 - cos * CAR_WIDTH * 0.5
    };
    g.fillStyle(this.onRoad ? 0xffd479 : 0xd7e2f0, 1);
    g.beginPath();
    g.moveTo(nose.x, nose.y);
    g.lineTo(tailLeft.x, tailLeft.y);
    g.lineTo(tailRight.x, tailRight.y);
    g.closePath();
    g.fillPath();
  }

  // An on-screen, hide/show-able, touch-friendly panel of the feel knobs. Lives
  // only in the sandbox; it is how the numbers get locked before the port.
  private buildControls(): void {
    const panel = document.createElement('div');
    Object.assign(panel.style, {
      position: 'fixed',
      left: '50%',
      bottom: '10px',
      transform: 'translateX(-50%)',
      zIndex: '50',
      width: 'min(380px, 92vw)',
      boxSizing: 'border-box',
      padding: '12px 14px',
      borderRadius: '14px',
      border: '1px solid rgba(246,248,251,0.25)',
      background: 'rgba(10,14,22,0.9)',
      color: '#eef3f8',
      font: '13px system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    } as CSSStyleDeclaration);

    const header = document.createElement('div');
    Object.assign(header.style, { display: 'flex', justifyContent: 'space-between', alignItems: 'center' });
    const title = document.createElement('strong');
    title.textContent = 'Road feel';
    const hide = document.createElement('button');
    hide.textContent = 'Hide';
    this.styleButton(hide);
    hide.addEventListener('click', () => this.togglePanel(false));
    header.append(title, hide);
    panel.appendChild(header);

    this.addSlider(panel, 'Follow strength', 1.0, TURN_RATE, 0.05, () => this.followSteer, (v) => (this.followSteer = v));
    this.addSlider(panel, 'Look-ahead', 20, 120, 2, () => this.lookahead, (v) => (this.lookahead = v), 0);
    this.addSlider(
      panel,
      'Lane (car widths)',
      1.5,
      4,
      0.1,
      () => this.laneWidth / CAR_WIDTH,
      (v) => (this.laneWidth = v * CAR_WIDTH),
      1
    );
    this.addSlider(panel, 'Slide speed', 150, 320, 5, () => this.roadSpeed, (v) => (this.roadSpeed = v), 0);
    this.addSlider(panel, 'Corner brake', 0, 0.8, 0.05, () => this.cornerEase, (v) => (this.cornerEase = v));

    document.body.appendChild(panel);
    this.panel = panel;

    const toggle = document.createElement('button');
    toggle.textContent = '⚙ Road';
    this.styleButton(toggle);
    Object.assign(toggle.style, {
      position: 'fixed',
      left: '50%',
      bottom: '10px',
      transform: 'translateX(-50%)',
      zIndex: '50',
      display: 'none'
    } as CSSStyleDeclaration);
    toggle.addEventListener('click', () => this.togglePanel(true));
    document.body.appendChild(toggle);
    this.panelToggle = toggle;
  }

  private togglePanel(show: boolean): void {
    if (this.panel) this.panel.style.display = show ? 'flex' : 'none';
    if (this.panelToggle) this.panelToggle.style.display = show ? 'none' : 'block';
  }

  private styleButton(button: HTMLButtonElement): void {
    button.type = 'button';
    Object.assign(button.style, {
      padding: '8px 14px',
      borderRadius: '10px',
      border: '1px solid rgba(246,248,251,0.35)',
      background: 'rgba(28,36,54,0.95)',
      color: '#eef3f8',
      font: '13px system-ui, sans-serif',
      cursor: 'pointer'
    } as CSSStyleDeclaration);
  }

  private addSlider(
    parent: HTMLElement,
    label: string,
    min: number,
    max: number,
    step: number,
    get: () => number,
    set: (value: number) => void,
    decimals = 2
  ): void {
    const row = document.createElement('label');
    Object.assign(row.style, { display: 'flex', alignItems: 'center', gap: '10px' });

    const name = document.createElement('span');
    name.textContent = label;
    Object.assign(name.style, { flex: '0 0 42%' });

    const range = document.createElement('input');
    range.type = 'range';
    range.min = String(min);
    range.max = String(max);
    range.step = String(step);
    range.value = String(get());
    Object.assign(range.style, { flex: '1', height: '28px' });

    const value = document.createElement('span');
    value.textContent = get().toFixed(decimals);
    Object.assign(value.style, { flex: '0 0 44px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' });

    range.addEventListener('input', () => {
      const v = Number(range.value);
      set(v);
      value.textContent = v.toFixed(decimals);
    });

    row.append(name, range, value);
    parent.appendChild(row);
  }
}
