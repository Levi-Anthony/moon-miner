// Blocking craters are walls: the rover can't enter the bowl. Push it back out
// to the wall radius; its heading is untouched, so driving into a crater at an
// angle slides you round the rim (and the rail you lay follows the rim), while
// driving straight in stops you against it.
export interface WallCrater { x: number; y: number; r: number; block: boolean }
interface Rover { x: number; y: number; heading: number; speed: number }

export const CRATER_WALL = 0.85; // fraction of the radius that is impassable

export function pushOutOfCraters(rover: Rover, craters: readonly WallCrater[]): boolean {
  let hit = false;
  for (const c of craters) {
    if (!c.block) continue;
    const wall = c.r * CRATER_WALL;
    const dx = rover.x - c.x;
    const dy = rover.y - c.y;
    const d = Math.hypot(dx, dy);
    if (d >= wall) continue;
    const ux = d > 1e-6 ? dx / d : Math.cos(rover.heading + Math.PI);
    const uy = d > 1e-6 ? dy / d : Math.sin(rover.heading + Math.PI);
    rover.x = c.x + ux * wall;
    rover.y = c.y + uy * wall;
    // Scrub the speed you drove into the wall (the along-rim part keeps).
    const into = -(Math.cos(rover.heading) * ux + Math.sin(rover.heading) * uy);
    if (into > 0) rover.speed *= 1 - into * 0.6;
    hit = true;
  }
  return hit;
}
