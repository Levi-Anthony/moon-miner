import Phaser from 'phaser';

// A deliberately tiny sandbox for one question only: does driving + laying a
// road + the slide feel good? Nothing else lives here -- no drone, no shifts,
// no quota, no nanobots, no tuning panel.
//
// The road is the owner's idea, not a grid of tiles: lay a lane about 2.5 car
// widths wide, so ordinary driving sits in a free middle band and is NOT
// affected by the road at all (this is what kills the wobble). The lane only
// constrains you near its edges -- you have to steer at a boundary to leave it.
// The lane is drawn as one continuous ribbon (a thick stroked path), so it
// reads as a road with no seams, no transparency stack, no tile-fitting.
//
// Laying vs sliding: the first pass over raw ground is laying (slower). Driving
// back onto road you already laid is the slide (faster). That is the whole
// reward loop, in isolation.

const CAR_LENGTH = 30;
const CAR_WIDTH = 18;

// The lane, in car widths. This is the number the owner asked for -- wide
// enough to decouple the road from the driving line.
const LANE_CAR_WIDTHS = 2.5;
const LANE_WIDTH = CAR_WIDTH * LANE_CAR_WIDTHS;
const LANE_HALF = LANE_WIDTH / 2;

// Fraction of the half-width that is completely free. Inside this the road does
// nothing to your heading; only between here and the edge does it push back.
const FREE_BAND_FRAC = 0.55;

const GROUND_SPEED = 130;
const ROAD_SPEED = 210; // the slide
const TURN_RATE = 2.7; // rad/s at full lock
// The edge push, capped well below TURN_RATE so a deliberate steer always wins:
// the road holds you in, it never traps you.
const BOUNDARY_STEER = 1.7;

// Sample a new road point every this-many world units of travel.
const POINT_SPACING = 7;
// Ignore this much of the freshly laid tail when deciding "am I on old road", so
// the lane you are currently laying under yourself does not count as slide.
const RECENT_SKIP = LANE_WIDTH * 1.6;

interface Vec2 {
  x: number;
  y: number;
}

export class SandboxScene extends Phaser.Scene {
  private graphics!: Phaser.GameObjects.Graphics;
  private hud!: Phaser.GameObjects.Text;

  private rover = { x: 0, y: 0, heading: -Math.PI / 2, speed: 0 };
  private steerInput = 0;
  private path: Vec2[] = [];
  private distanceSinceLastPoint = 0;
  private onRoad = false;

  private keys?: Record<string, Phaser.Input.Keyboard.Key>;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private touch?: { throttle: boolean; steer: number };

  constructor() {
    super('sandbox');
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
  }

  private updateTouch(pointer: Phaser.Input.Pointer): void {
    // Touch anywhere to drive; horizontal position relative to screen centre
    // steers. Simple on purpose.
    const steer = Phaser.Math.Clamp((pointer.x - this.scale.gameSize.width / 2) / (this.scale.gameSize.width / 3), -1, 1);
    this.touch = { throttle: true, steer };
  }

  update(_time: number, deltaMs: number): void {
    const dt = Math.min(deltaMs / 1000, 1 / 30);

    if (this.keys?.R?.isDown) this.resetPath();

    // Smooth the wheel so a digital key does not snap the heading.
    const targetSteer = this.touch ? this.touch.steer : this.keyboardSteer();
    this.steerInput += Phaser.Math.Clamp(targetSteer - this.steerInput, -6 * dt, 6 * dt);

    const throttle = this.touch?.throttle || this.keys?.W?.isDown || this.cursors?.up?.isDown ? 1 : 0;

    const road = this.sampleRoad();
    this.onRoad = road.onRoad;

    const playerTurn = this.steerInput * TURN_RATE;
    const boundaryTurn = road.boundaryPush * BOUNDARY_STEER;
    this.rover.heading += (playerTurn + boundaryTurn) * dt;

    const baseSpeed = road.onRoad ? ROAD_SPEED : GROUND_SPEED;
    this.rover.speed = baseSpeed * throttle;

    if (throttle > 0) {
      const prev = { x: this.rover.x, y: this.rover.y };
      this.rover.x += Math.cos(this.rover.heading) * this.rover.speed * dt;
      this.rover.y += Math.sin(this.rover.heading) * this.rover.speed * dt;
      this.keepInBounds();
      this.recordPath(Phaser.Math.Distance.Between(prev.x, prev.y, this.rover.x, this.rover.y));
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
      // Turn back toward the middle so a boundary hit is a gentle correction.
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

  // Distance from the rover to the nearest laid road segment (ignoring the tail
  // it is currently laying). Returns whether the rover is on road and, if it is
  // near an edge, which way to nudge it back in.
  private sampleRoad(): { onRoad: boolean; boundaryPush: number } {
    const skipPoints = Math.ceil(RECENT_SKIP / POINT_SPACING);
    const limit = this.path.length - skipPoints;
    if (limit < 2) return { onRoad: false, boundaryPush: 0 };

    let bestDist = Infinity;
    let bestSigned = 0;
    for (let i = 1; i < limit; i += 1) {
      const a = this.path[i - 1];
      const b = this.path[i];
      const projected = this.projectPointToSegment(this.rover, a, b);
      if (projected.dist < bestDist) {
        bestDist = projected.dist;
        bestSigned = projected.signed;
      }
    }

    if (bestDist >= LANE_HALF) return { onRoad: false, boundaryPush: 0 };

    const freeRadius = LANE_HALF * FREE_BAND_FRAC;
    let boundaryPush = 0;
    if (bestDist > freeRadius) {
      // How far into the outer band, 0 at the free edge, 1 at the lane edge.
      const over = (bestDist - freeRadius) / (LANE_HALF - freeRadius);
      // Push toward the centreline: opposite the sign of the lateral offset.
      boundaryPush = -Math.sign(bestSigned) * over;
    }
    return { onRoad: true, boundaryPush };
  }

  private projectPointToSegment(p: Vec2, a: Vec2, b: Vec2): { dist: number; signed: number } {
    const abx = b.x - a.x;
    const aby = b.y - a.y;
    const lenSq = abx * abx + aby * aby;
    let t = lenSq > 0 ? ((p.x - a.x) * abx + (p.y - a.y) * aby) / lenSq : 0;
    t = Phaser.Math.Clamp(t, 0, 1);
    const cx = a.x + abx * t;
    const cy = a.y + aby * t;
    const dx = p.x - cx;
    const dy = p.y - cy;
    const dist = Math.hypot(dx, dy);
    // Signed lateral offset using the segment normal, so we know which side.
    const len = Math.sqrt(lenSq) || 1;
    const signed = (dx * -aby + dy * abx) / len;
    return { dist, signed };
  }

  private resetPath(): void {
    this.path = [{ x: this.rover.x, y: this.rover.y }];
    this.distanceSinceLastPoint = 0;
  }

  private draw(): void {
    const g = this.graphics;
    g.clear();

    // Raw ground.
    g.fillStyle(0x0f1420, 1);
    g.fillRect(0, 0, this.scale.gameSize.width, this.scale.gameSize.height);

    if (this.path.length >= 2) {
      // The lane as one continuous ribbon: an outer edge stroke and an inner
      // fill, so it reads as a road with defined shoulders and no seams.
      this.strokePolyline(0x2b3550, LANE_WIDTH + 4);
      this.strokePolyline(0x50607f, LANE_WIDTH);
      this.strokePolyline(0x6f83a6, LANE_WIDTH * FREE_BAND_FRAC * 2 * 0.5);
    }

    this.drawRover();
    this.hud.setText(
      [
        this.onRoad ? 'ON ROAD — slide' : 'raw ground — laying',
        `speed ${this.rover.speed.toFixed(0)}   lane ${LANE_CAR_WIDTHS.toFixed(1)} car-widths`,
        'W/↑ drive · A/D or ←/→ steer · R reset · (touch: hold + drag)'
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
}
