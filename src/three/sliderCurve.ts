// Slider travel -> value. Many knobs span silly-wide ranges on purpose (the
// extremes are for bracketing), which on a linear slider crams the useful range
// into a sliver at one end. Keep the full range, but curve the travel so the
// default sits at the MIDDLE of the slider: half the travel covers min..default,
// half covers default..max, each on a log-like curve (fine near the default,
// coarse toward the silly extremes). Pure, so it's testable.

export interface SliderCurve {
  toValue: (u: number) => number; // u in 0..1 -> value in min..max
  toSlider: (v: number) => number; // value -> u in 0..1
  curved: boolean;
}

export function sliderCurve(min: number, max: number, mid?: number, discreteSteps = Infinity): SliderCurve {
  const span = max - min;
  const linear: SliderCurve = {
    toValue: (u) => min + span * clamp01(u),
    toSlider: (v) => (span > 0 ? clamp01((v - min) / span) : 0),
    curved: false
  };
  // Leave alone: toggles / pickers, a default that's already comfortably
  // mid-range, or no usable default.
  if (!(span > 0) || discreteSteps <= 12 || mid === undefined || !Number.isFinite(mid) || mid <= min || mid >= max) return linear;
  const f = (mid - min) / span;
  if (f >= 0.3 && f <= 0.7) return linear;
  // Offset-log mapping with its geometric middle at the default. For a default
  // in the LOW part: v = (min + c) * ((max + c) / (min + c))^u - c, with c chosen
  // so u = 0.5 lands exactly on mid. A default in the HIGH part is the mirror.
  const low = f < 0.5;
  const a = low ? min : -max; // work in mirrored coordinates for a high default
  const b = low ? max : -min;
  const d = low ? mid : -mid;
  const c = (a * b - d * d) / (2 * d - a - b);
  const lo = a + c;
  const ratio = (b + c) / lo;
  if (!(lo > 0) || !(ratio > 1)) return linear;
  const lnR = Math.log(ratio);
  const fwd = (u: number) => lo * Math.pow(ratio, clamp01(u)) - c;
  const inv = (x: number) => clamp01(Math.log(Math.max(lo, x + c) / lo) / lnR);
  return {
    toValue: (u) => (low ? fwd(u) : -fwd(1 - clamp01(u))),
    toSlider: (v) => (low ? inv(v) : 1 - inv(-v)),
    curved: true
  };
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}
