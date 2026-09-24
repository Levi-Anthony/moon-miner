import { describe, expect, it } from 'vitest';
import { stickToInput } from './stick';
import { DEFAULT_CONTROLS_CONFIG, type ControlsConfig } from './panel';

const cfg = (patch: Partial<ControlsConfig> = {}): ControlsConfig => ({ ...DEFAULT_CONTROLS_CONFIG, ...patch });
const R = DEFAULT_CONTROLS_CONFIG.stickRadius;

describe('touch stick', () => {
  it('a resting thumb does nothing', () => {
    expect(stickToInput(3, -4, cfg())).toEqual({ steer: 0, throttle: 0, reverse: false });
  });

  it('full forward with sideways drift inside the forward cone drives dead straight', () => {
    const drift = Math.tan((15 * Math.PI) / 180) * R; // 15 degrees off, inside the 20-degree cone
    const out = stickToInput(drift, -R, cfg());
    expect(out.throttle).toBe(1);
    expect(out.steer).toBe(0);
  });

  it('the same drift steers once the cone is narrowed to 0 (old behaviour)', () => {
    const drift = Math.tan((15 * Math.PI) / 180) * R;
    expect(stickToInput(drift, -R, cfg({ forwardCone: 0 })).steer).toBeGreaterThan(0);
  });

  it('steering ramps from zero past the dead zone (no jump) and reaches full lock at the rim', () => {
    const dead = R * DEFAULT_CONTROLS_CONFIG.steerDead;
    expect(stickToInput(dead + 1, 0, cfg()).steer).toBeLessThan(0.05);
    expect(stickToInput(R, 0, cfg()).steer).toBeCloseTo(1);
    expect(stickToInput(-R * 2, 0, cfg()).steer).toBeCloseTo(-1);
  });

  it('you can still reach the rail break-off while pushing fully forward', () => {
    expect(Math.abs(stickToInput(R * 1.2, -R, cfg()).steer)).toBeGreaterThanOrEqual(0.9);
  });

  it('a steer curve above 1 is gentler mid-stick but still full at the rim', () => {
    const mid = stickToInput(R * 0.6, 0, cfg()).steer;
    const curved = stickToInput(R * 0.6, 0, cfg({ steerCurve: 2 })).steer;
    expect(curved).toBeLessThan(mid);
    expect(stickToInput(R, 0, cfg({ steerCurve: 2 })).steer).toBeCloseTo(1);
  });

  it('pull back past the throttle dead zone reverses', () => {
    expect(stickToInput(0, R * 0.1, cfg()).reverse).toBe(false);
    expect(stickToInput(0, R * 0.6, cfg()).reverse).toBe(true);
  });

  it('a bigger stick needs more travel for the same input', () => {
    expect(stickToInput(40, 0, cfg({ stickRadius: 132 })).steer).toBeLessThan(stickToInput(40, 0, cfg()).steer);
  });
});
