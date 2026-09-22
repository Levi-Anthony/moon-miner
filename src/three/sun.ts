// Sun / time of day. The solar window IS the day: as it drains the sun swings
// down toward the horizon and warms, shadows stretch, and the light dims -- so
// you can read how long you have left off the ground itself, which is the whole
// point of a "get home before sunset" run. Pure math; bootstrap applies it to
// the lights and the painted ground shading.

export const SUN_DIST = 900;
const START_ELEV = 1.05; // radians above the horizon at first light
const END_ELEV = 0.1; // just above the horizon at last light
export const START_BEARING = -2.3; // matches the painted crater shading at day start
const SWEEP = 1.1; // radians of bearing travelled over a full day

export interface SunState {
  elev: number;
  bearing: number;
  dusk: number; // 0 at first light, 1 at sunset (eased, so dusk arrives late and fast)
  intensity: number;
  ambientIntensity: number;
  /** Unit direction from the ground toward the sun, scaled to SUN_DIST. */
  offset: { x: number; y: number; z: number };
}

// t = 0 at first light, 1 at sunset.
export function sunState(t: number): SunState {
  const k = Math.max(0, Math.min(1, t));
  const elev = START_ELEV + (END_ELEV - START_ELEV) * k;
  const bearing = START_BEARING + SWEEP * k;
  const dusk = Math.pow(k, 1.6);
  return {
    elev,
    bearing,
    dusk,
    intensity: 0.7 - 0.32 * dusk,
    ambientIntensity: 0.5 - 0.22 * dusk,
    offset: {
      x: Math.cos(bearing) * Math.cos(elev) * SUN_DIST,
      y: Math.sin(elev) * SUN_DIST,
      z: Math.sin(bearing) * Math.cos(elev) * SUN_DIST
    }
  };
}

/** How long a shadow a given height casts -- the visible clock. */
export function shadowLength(height: number, elev: number): number {
  return height / Math.tan(Math.max(0.01, elev));
}
