import { describe, expect, it } from 'vitest';
import { hexDistance, hexKey, hexNeighbours, hexToWorld, worldToHex } from './hex';

const SIZE = 24;

describe('hex lattice', () => {
  it('round-trips a cell centre back to the same cell', () => {
    for (let q = -12; q <= 12; q += 1) {
      for (let r = -12; r <= 12; r += 1) {
        const world = hexToWorld(q, r, SIZE);
        const back = worldToHex(world.x, world.y, SIZE);
        expect(hexKey(back.q, back.r)).toBe(hexKey(q, r));
      }
    }
  });

  it('tiles the plane with no gaps and no cell claimed twice', () => {
    // Every sampled world point resolves to exactly one cell, and that cell's
    // centre is never further away than the circumradius. A point that landed
    // outside its own cell would mean the lattice overlaps or leaves holes --
    // which is the defect the tile model exists to make impossible.
    for (let x = -300; x <= 300; x += 7) {
      for (let y = -300; y <= 300; y += 7) {
        const cell = worldToHex(x, y, SIZE);
        const centre = hexToWorld(cell.q, cell.r, SIZE);
        const offset = Math.hypot(centre.x - x, centre.y - y);
        expect(offset).toBeLessThanOrEqual(SIZE + 1e-9);
      }
    }
  });

  it('makes neighbours mutual and exactly one cell apart', () => {
    const neighbours = hexNeighbours(3, -2);
    expect(neighbours).toHaveLength(6);
    for (const neighbour of neighbours) {
      expect(hexDistance({ q: 3, r: -2 }, neighbour)).toBe(1);
      const back = hexNeighbours(neighbour.q, neighbour.r);
      expect(back.some((cell) => cell.q === 3 && cell.r === -2)).toBe(true);
    }
  });

  it('separates adjacent cell centres by the full tile width', () => {
    // Adjacent centres sit sqrt(3) * size apart. If they were closer than the
    // tile's own extent the tiles would overlap, which is the thing being ruled
    // out by construction rather than by tuning.
    const a = hexToWorld(0, 0, SIZE);
    for (const neighbour of hexNeighbours(0, 0)) {
      const b = hexToWorld(neighbour.q, neighbour.r, SIZE);
      expect(Math.hypot(b.x - a.x, b.y - a.y)).toBeCloseTo(Math.sqrt(3) * SIZE, 6);
    }
  });
});
