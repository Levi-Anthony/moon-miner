// The lattice the laid road lives on.
//
// Road used to be a bag of overlapping circles pushed at the rover's position
// every frame, at two different sizes depending on whether the machine was
// crawling. That had three consequences the operator felt directly: pieces
// overlapped, pieces landed haphazardly, and there was no well-defined "which
// way does this track run" for the magnet to read -- so the rail pull was noisy
// exactly where it was supposed to feel like a chute.
//
// Tiles fix all three by construction rather than by tuning. One tile per cell,
// every tile the same size, and adjacency is a property of the coordinates
// rather than a linked list that a reclaim can sever.
//
// Axial coordinates on a flat-top hex grid. q runs east, r runs south-east.
// The lattice is a coordinate system for the ROAD only: the rover moves in
// continuous world space and is never snapped, stepped, or steered by it.

export interface HexCoord {
  q: number;
  r: number;
}

// Flat-top hex geometry. `size` is the circumradius: centre to corner.
// Horizontal spacing is 1.5 * size, vertical is sqrt(3) * size.
const SQRT3 = Math.sqrt(3);

export function hexToWorld(q: number, r: number, size: number): { x: number; y: number } {
  return {
    x: size * 1.5 * q,
    y: size * SQRT3 * (r + q / 2)
  };
}

export function worldToHex(x: number, y: number, size: number): HexCoord {
  const q = (2 / 3) * (x / size);
  const r = y / (size * SQRT3) - q / 2;
  return roundHex(q, r);
}

// Cube rounding. Rounding q and r independently lands off-lattice near cell
// corners, which would let two nearby emits disagree about which cell they are
// in and reintroduce the overlap this whole model exists to prevent.
export function roundHex(q: number, r: number): HexCoord {
  const s = -q - r;
  let rq = Math.round(q);
  let rr = Math.round(r);
  const rs = Math.round(s);

  const dq = Math.abs(rq - q);
  const dr = Math.abs(rr - r);
  const ds = Math.abs(rs - s);

  if (dq > dr && dq > ds) rq = -rr - rs;
  else if (dr > ds) rr = -rq - rs;

  return { q: rq, r: rr };
}

export function hexKey(q: number, r: number): string {
  return `${q},${r}`;
}

// The six lattice directions, in order, so a walk can prefer the neighbour best
// aligned with where the machine is heading.
const NEIGHBOUR_OFFSETS: readonly HexCoord[] = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 }
];

export function hexNeighbours(q: number, r: number): HexCoord[] {
  return NEIGHBOUR_OFFSETS.map((offset) => ({ q: q + offset.q, r: r + offset.r }));
}

export function hexEquals(a: HexCoord, b: HexCoord): boolean {
  return a.q === b.q && a.r === b.r;
}

// Lattice distance in cells, which is what "is this the next piece of track"
// means. Euclidean distance between centres would call two cells adjacent
// across a corner where the tiles only touch at a point.
export function hexDistance(a: HexCoord, b: HexCoord): number {
  const dq = a.q - b.q;
  const dr = a.r - b.r;
  const ds = -dq - dr;
  return Math.max(Math.abs(dq), Math.abs(dr), Math.abs(ds));
}

// Corner points for rendering a flat-top hex, starting due east.
export function hexCorners(centerX: number, centerY: number, size: number): { x: number; y: number }[] {
  const corners: { x: number; y: number }[] = [];
  for (let index = 0; index < 6; index += 1) {
    const angle = (Math.PI / 3) * index;
    corners.push({
      x: centerX + size * Math.cos(angle),
      y: centerY + size * Math.sin(angle)
    });
  }
  return corners;
}

// Every cell on the straight line between two cells, inclusive of both ends.
//
// The road needs this because an emit step is measured between emit POINTS, not
// between cell centres. Two points one across-flats apart can sit at opposite
// edges of their cells and land two cells apart -- measured at 11.5% of
// straight-line emits -- which is a diagonal hole in the road roughly one emit
// in nine. Walking the line and filling what it crosses removes that class of
// gap entirely rather than tuning the step to make it rarer.
export function hexLine(from: HexCoord, to: HexCoord): HexCoord[] {
  const steps = hexDistance(from, to);
  if (steps === 0) return [{ ...from }];

  const cells: HexCoord[] = [];
  for (let step = 0; step <= steps; step += 1) {
    const t = step / steps;
    // Nudged off the exact midpoint so a line passing precisely between two
    // cells resolves the same way every time instead of alternating with
    // floating point noise.
    cells.push(
      roundHex(from.q + (to.q - from.q) * t + 1e-6, from.r + (to.r - from.r) * t + 2e-6)
    );
  }
  return cells;
}
