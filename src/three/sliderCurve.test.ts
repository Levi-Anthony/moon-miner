import { describe, expect, it } from 'vitest';
import { sliderCurve } from './sliderCurve';

describe('slider curve: full range kept, default at mid-travel', () => {
  const cases: Array<[string, number, number, number]> = [
    ['grip', 50, 20000, 1500],
    ['road top speed', 10, 3000, 236],
    ['tether', 20, 12000, 560],
    ['mining trickle (min 0)', 0, 10, 0.3],
    ['eraser reach (min 0)', 0, 1500, 320],
    ['high default (break-off steer-like)', 0, 100, 92]
  ];
  for (const [name, min, max, mid] of cases) {
    it(`${name}: ends are the real extremes and the default is at the middle`, () => {
      const c = sliderCurve(min, max, mid);
      expect(c.curved).toBe(true);
      expect(c.toValue(0)).toBeCloseTo(min, 6);
      expect(c.toValue(1)).toBeCloseTo(max, 6);
      expect(c.toValue(0.5)).toBeCloseTo(mid, 6);
      for (const u of [0.1, 0.25, 0.5, 0.8, 0.95]) expect(c.toSlider(c.toValue(u))).toBeCloseTo(u, 6);
      // Monotonic.
      let prev = -Infinity;
      for (let u = 0; u <= 1.0001; u += 0.01) { const v = c.toValue(u); expect(v).toBeGreaterThanOrEqual(prev - 1e-9); prev = v; }
    });
  }

  it('the useful band gets real travel: grip 1000..3000 spans far more than the 10% it had', () => {
    const c = sliderCurve(50, 20000, 1500);
    expect(c.toSlider(3000) - c.toSlider(1000)).toBeGreaterThan(0.2);
  });

  it('stays linear for toggles, mid-range defaults and missing defaults', () => {
    expect(sliderCurve(0, 1, 1, 1).curved).toBe(false);
    expect(sliderCurve(0, 4, 0, 4).curved).toBe(false);
    expect(sliderCurve(0, 1, 0.5).curved).toBe(false);
    expect(sliderCurve(0, 100, undefined).curved).toBe(false);
    expect(sliderCurve(20, 12000, 1e9).curved).toBe(false); // default off the scale
  });
});
