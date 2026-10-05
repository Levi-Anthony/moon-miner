// Endless Night in 3D (DEV-66, step 3). The run is the rules core's
// (src/game/run.ts): the same `stepRun` Home Run's 2D toy steps, with the same
// numbers. This file is only a view of it: a chase camera over the field, the
// road you lay, the seams, the closing night as a wall, the HUD and minimap,
// sound, and the run log.
//
// The core works in the toy's px; this view draws 1 px as 1 world unit. A 3D
// tuning is a different `RunRules` (RESERVE_RUN in run.ts), not a change here. The
// title's toggles switch each 2026-10-05 rule back to Home Run's, to compare.
//
// The old 3D game (Levels and Sandbox, with nanobots, drone reclaim, the eraser
// and slurp charge) is untouched at index.html: quarantined behind the Levels
// mode, not deleted (owner, 2026-10-02).

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { RING0, closingSpeed, ringAt } from '../../game/night';
import { HOME_RUN, RESERVE_RUN, baseMods, createRun, routeForLog, stepRun, timeToDark, type RunEvent, type RunRules, type RunState } from '../../game/run';
import type { Line, RoadTree } from '../../game/roadTree';
import { onOwnRoad } from '../../game/rover';
import type { Seam } from '../../game/seams';
import { layFactor, type Terrain } from '../../game/terrain';
import { markSentAll, sendAllUrl, sendLabel, unsentAll } from '../../runs/sendAll';
// The toys' input, sound and run log: the same stick and blips the owner played
// the 2D toy with.
import { Hum, Stick, blip, loadStats, logToyRun, loop, recordPlay } from '../../toys/kit';

const GAME = 'night-3d';
const WARN_S = 8; // border cues start this many seconds before the dark reaches you
const TAU = Math.PI * 2;
const RING_STEPS = 144;
const WALL_H = 150;

// Colours, matching the toy.
const TEAL = 0x37f2d8;
const GOLD = 0xe8b04a;
const NIGHT = 0x9670ff;
const PALE = 0xe0d0ff;

type Phase = 'title' | 'play' | 'over';

// --- state ------------------------------------------------------------------------
let phase: Phase = 'title';
let daily = false;
let hard = false;
let seed = 1;
// The 2026-10-05 rules, each on by default: the dark reserve, seams that stay
// live in the dark, and ore beside your road.
const rulesOn = { reserve: true, liveSeams: true, sideOre: true, terrain: true };
function rulesNow(): RunRules {
  return {
    ...RESERVE_RUN,
    ...(rulesOn.reserve ? {} : { darkReserve: 0, hardReserve: 0, reserveRefill: 0 }),
    ...(rulesOn.liveSeams ? {} : { liveDarkSeams: false }),
    ...(rulesOn.sideOre ? {} : { sideOre: HOME_RUN.sideOre }),
    ...(rulesOn.terrain ? {} : { terrain: null })
  };
}
let RULES: RunRules = rulesNow();
let run: RunState = createRun('endless', seed, hard, RULES);
let mods = baseMods();
let runLogged = false;
let time = 0;
let shake = 0;
let mapReach = RING0 * 1.3;
let camYaw = -Math.PI / 2;
let overAt = -1; // time the run ended
// Getting on a road snaps the rover up to 30 px onto it (the rule). The model
// glides there instead (the feel): this is the gap still to close, in px.
const glide = { x: 0, y: 0 };

function dailySeed(): number {
  const d = new Date().toISOString().slice(0, 10);
  let h = 2166136261;
  for (let i = 0; i < d.length; i += 1) h = Math.imul(h ^ d.charCodeAt(i), 16777619);
  return h >>> 0;
}

// --- renderer, scene, camera ---------------------------------------------------------
const mount = document.getElementById('app') as HTMLDivElement;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
mount.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05070c);
scene.fog = new THREE.Fog(0x05070c, 1100, 3200);
const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 1, 6000);
scene.add(new THREE.HemisphereLight(0x8fa3ba, 0x05070c, 0.7));
const moon = new THREE.DirectionalLight(0xbfd0ff, 0.9);
moon.position.set(-400, 900, -300);
scene.add(moon);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.6, 0.5, 0.7);
composer.addPass(bloom);

// The ground: dark regolith with speckle, and faint distance rings every 250 px
// around home, so how far out you are reads at a glance.
function speckleTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d') as CanvasRenderingContext2D;
  g.fillStyle = '#0e1520';
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 900; i += 1) {
    const v = 20 + Math.floor(Math.random() * 30);
    g.fillStyle = `rgb(${v},${v + 6},${v + 16})`;
    g.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(40, 40);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const ground = new THREE.Mesh(new THREE.CircleGeometry(4200, 96), new THREE.MeshLambertMaterial({ map: speckleTexture() }));
ground.rotation.x = -Math.PI / 2;
scene.add(ground);
for (let r = 250; r <= RING0; r += 250) {
  const pts: THREE.Vector3[] = [];
  for (let k = 0; k <= 96; k += 1) pts.push(new THREE.Vector3(Math.cos((k / 96) * TAU) * r, 0.2, Math.sin((k / 96) * TAU) * r));
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x1c2738, transparent: true, opacity: 0.8 })));
}

// Home: the bank ring and a beacon you can find from anywhere.
const home = new THREE.Group();
const homeRing = new THREE.Mesh(new THREE.RingGeometry(RULES.depotR - 6, RULES.depotR, 64), new THREE.MeshBasicMaterial({ color: TEAL, side: THREE.DoubleSide }));
homeRing.rotation.x = -Math.PI / 2;
homeRing.position.y = 0.8;
home.add(homeRing);
const beacon = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 260, 8), new THREE.MeshBasicMaterial({ color: TEAL, transparent: true, opacity: 0.55 }));
beacon.position.y = 130;
home.add(beacon);
scene.add(home);

// --- the road: one ribbon per line of the tree ---------------------------------------
// Dimmer than the toy's line: up close a ribbon fills the screen, and bloom does the glow.
const roadMat = new THREE.MeshBasicMaterial({ color: 0x1fb8a4, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false });
const roadGroup = new THREE.Group();
scene.add(roadGroup);
let roadOf: RoadTree | null = null;
const ribbons: { mesh: THREE.Mesh; n: number }[] = [];

function ribbon(line: Line, w: number): THREE.BufferGeometry {
  const p = line.pts;
  const pos = new Float32Array(p.length * 2 * 3);
  const idx: number[] = [];
  for (let i = 0; i < p.length; i += 1) {
    const a = p[Math.max(0, i - 1)];
    const b = p[Math.min(p.length - 1, i + 1)];
    const L = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const nx = -(b.y - a.y) / L;
    const ny = (b.x - a.x) / L;
    pos.set([p[i].x + nx * w, 0.6, p[i].y + ny * w, p[i].x - nx * w, 0.6, p[i].y - ny * w], i * 6);
    if (i) idx.push(i * 2 - 2, i * 2 - 1, i * 2, i * 2 - 1, i * 2 + 1, i * 2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setIndex(idx);
  return g;
}

function syncRoad(): void {
  if (roadOf !== run.road) {
    for (const r of ribbons) {
      roadGroup.remove(r.mesh);
      r.mesh.geometry.dispose();
    }
    ribbons.length = 0;
    roadOf = run.road;
  }
  const lines = run.road.lines;
  while (ribbons.length > lines.length) {
    const r = ribbons.pop()!;
    roadGroup.remove(r.mesh);
    r.mesh.geometry.dispose();
  }
  lines.forEach((line, i) => {
    if (!ribbons[i]) {
      const mesh = new THREE.Mesh(new THREE.BufferGeometry(), roadMat);
      mesh.renderOrder = 2;
      roadGroup.add(mesh);
      ribbons[i] = { mesh, n: 0 };
    }
    const r = ribbons[i];
    if (r.n === line.pts.length) return;
    r.n = line.pts.length;
    r.mesh.geometry.dispose();
    r.mesh.geometry = line.pts.length >= 2 ? ribbon(line, RULES.rover.roadW / 2) : new THREE.BufferGeometry();
  });
}

// The switch coming up on the rail (rover.ahead): a ring where it is, and the
// road it leads to lit up when the stick is set to take it.
const roadHot = new THREE.MeshBasicMaterial({ color: 0xbffff4, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false });
const switchRing = new THREE.Mesh(new THREE.RingGeometry(16, 21, 32), new THREE.MeshBasicMaterial({ color: TEAL, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false }));
switchRing.rotation.x = -Math.PI / 2;
switchRing.position.y = 1.2;
switchRing.renderOrder = 3;
scene.add(switchRing);

function syncSwitch(): void {
  const a = phase === 'play' ? run.rs.ahead : null;
  for (const [i, r] of ribbons.entries()) r.mesh.material = a?.set && a.to.line === i ? roadHot : roadMat;
  switchRing.visible = !!a;
  if (!a) return;
  switchRing.position.x = a.x;
  switchRing.position.z = a.y;
  const m = switchRing.material as THREE.MeshBasicMaterial;
  m.color.setHex(a.set ? 0xffffff : TEAL);
  m.opacity = a.set ? 0.9 : 0.35 + 0.2 * Math.sin(time * 6);
  switchRing.scale.setScalar(a.set ? 1.25 : 1);
}

// --- seams: a glowing patch and nuggets that go as you dig --------------------------
const seamGroup = new THREE.Group();
scene.add(seamGroup);
const nuggetGeo = new THREE.IcosahedronGeometry(1, 0);
const discGeo = new THREE.CircleGeometry(1, 40);
interface SeamView {
  seam: Seam;
  disc: THREE.Mesh;
  discMat: THREE.MeshBasicMaterial;
  nuggets: THREE.InstancedMesh;
  count: number;
}
const seamViews: SeamView[] = [];
let seamsOf: Seam[] | null = null;

function addSeamView(s: Seam, k: number): void {
  const discMat = new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.4, depthWrite: false });
  const disc = new THREE.Mesh(discGeo, discMat);
  disc.rotation.x = -Math.PI / 2;
  disc.rotation.z = -s.a;
  disc.scale.set(s.len / 2, s.w / 2, 1);
  disc.position.set(s.x, 0.4, s.y);
  const count = Math.max(4, Math.min(16, Math.round(s.max / 2)));
  const nuggets = new THREE.InstancedMesh(nuggetGeo, new THREE.MeshLambertMaterial({ color: GOLD, emissive: 0x7a4a10 }), count);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  let h = (k + 1) * 2654435761;
  const rand = () => ((h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0) / 4294967296);
  for (let i = 0; i < count; i += 1) {
    const u = (rand() - 0.5) * s.len * 0.8;
    const v = (rand() - 0.5) * s.w * 0.7;
    const x = s.x + u * Math.cos(s.a) - v * Math.sin(s.a);
    const z = s.y + u * Math.sin(s.a) + v * Math.cos(s.a);
    const size = 2.5 + rand() * 4;
    q.setFromEuler(new THREE.Euler(rand() * 3, rand() * 3, rand() * 3));
    m.compose(new THREE.Vector3(x, size * 0.5, z), q, new THREE.Vector3(size, size * 0.8, size));
    nuggets.setMatrixAt(i, m);
  }
  seamGroup.add(disc, nuggets);
  seamViews.push({ seam: s, disc, discMat, nuggets, count });
}

function syncSeams(): void {
  if (seamsOf !== run.seams) {
    for (const v of seamViews) seamGroup.remove(v.disc, v.nuggets);
    seamViews.length = 0;
    seamsOf = run.seams;
  }
  while (seamViews.length < run.seams.length) addSeamView(run.seams[seamViews.length], seamViews.length);
  for (const v of seamViews) {
    const s = v.seam;
    const left = s.max > 0 ? Math.max(0, s.ore) / s.max : 0;
    v.nuggets.count = Math.ceil(v.count * left);
    if (s.gone > 0) {
      v.discMat.color.setHex(NIGHT);
      v.discMat.opacity = 0.5 * s.gone;
    } else {
      v.discMat.color.setHex(GOLD);
      v.discMat.opacity = s.ore > 0 ? 0.18 + 0.4 * left : 0.06;
    }
  }
}

// --- terrain: rock you drive round, rubble and rough ground that slow laying --------
// Rebuilt whenever the terrain changes (a fresh map, or a bank that grows more).
const terrainGroup = new THREE.Group();
scene.add(terrainGroup);
const rockGeo = new THREE.DodecahedronGeometry(1, 0);
const rockMat = new THREE.MeshLambertMaterial({ color: 0x8a93a3, flatShading: true });
const rubbleMat = new THREE.MeshLambertMaterial({ color: 0x9a7b5c, flatShading: true });
const roughMat = new THREE.MeshBasicMaterial({ color: 0x3a2c22, transparent: true, opacity: 0.55, depthWrite: false });
let terrainOf: Terrain | null = null;
let terrainKey = '';

function syncTerrain(): void {
  const t = run.terrain;
  const key = t ? `${t.rocks.length}:${t.rough.length}:${t.ridges}:${t.clusters}` : '';
  if (t === terrainOf && key === terrainKey) return;
  terrainOf = t;
  terrainKey = key;
  for (const c of [...terrainGroup.children]) {
    terrainGroup.remove(c);
    if (c instanceof THREE.InstancedMesh) c.dispose();
    else if (c instanceof THREE.Mesh) c.geometry.dispose();
  }
  if (!t) return;
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  for (const block of [true, false]) {
    const rocks = t.rocks.filter((k) => k.block === block);
    if (!rocks.length) continue;
    const mesh = new THREE.InstancedMesh(rockGeo, block ? rockMat : rubbleMat, rocks.length);
    rocks.forEach((k, i) => {
      let h = Math.imul(Math.round(k.x * 13 + k.y * 7), 2654435761) >>> 0;
      const rand = () => ((h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0) / 4294967296);
      e.set(rand() * 3, rand() * 3, rand() * 3);
      q.setFromEuler(e);
      // Rock stands tall enough to read as a wall; rubble lies low.
      const up = block ? k.r * (1.1 + rand() * 0.6) : k.r * 0.35;
      m.compose(new THREE.Vector3(k.x, up * 0.45, k.y), q, new THREE.Vector3(k.r, up, k.r));
      mesh.setMatrixAt(i, m);
    });
    terrainGroup.add(mesh);
  }
  for (const g of t.rough) {
    const disc = new THREE.Mesh(new THREE.CircleGeometry(1, 40), roughMat);
    disc.rotation.x = -Math.PI / 2;
    disc.rotation.z = -g.a;
    disc.scale.set(g.rx, g.ry, 1);
    disc.position.set(g.x, 0.25, g.y);
    disc.renderOrder = -2;
    terrainGroup.add(disc);
  }
}

// --- the night: a wall where the border is, and the dark beyond it --------------------
function gradientTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 4;
  c.height = 64;
  const g = c.getContext('2d') as CanvasRenderingContext2D;
  const grd = g.createLinearGradient(0, 64, 0, 0);
  grd.addColorStop(0, 'rgba(255,255,255,0.9)');
  grd.addColorStop(0.25, 'rgba(255,255,255,0.35)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 4, 64);
  return new THREE.CanvasTexture(c);
}
const wallPos = new Float32Array((RING_STEPS + 1) * 2 * 3);
const wallUv = new Float32Array((RING_STEPS + 1) * 2 * 2);
const darkPos = new Float32Array((RING_STEPS + 1) * 2 * 3);
const stripIdx: number[] = [];
for (let k = 0; k < RING_STEPS; k += 1) {
  const a = k * 2;
  stripIdx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  wallUv.set([k / RING_STEPS, 0, k / RING_STEPS, 1], k * 4);
}
wallUv.set([1, 0, 1, 1], RING_STEPS * 4);
const wallGeo = new THREE.BufferGeometry();
wallGeo.setAttribute('position', new THREE.BufferAttribute(wallPos, 3));
wallGeo.setAttribute('uv', new THREE.BufferAttribute(wallUv, 2));
wallGeo.setIndex(stripIdx);
const wallMat = new THREE.MeshBasicMaterial({ color: NIGHT, map: gradientTexture(), transparent: true, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
const wall = new THREE.Mesh(wallGeo, wallMat);
wall.frustumCulled = false;
scene.add(wall);
const darkGeo = new THREE.BufferGeometry();
darkGeo.setAttribute('position', new THREE.BufferAttribute(darkPos, 3));
darkGeo.setIndex(stripIdx);
const dark = new THREE.Mesh(darkGeo, new THREE.MeshBasicMaterial({ color: 0x020208, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false }));
dark.frustumCulled = false;
// Drawn first among the see-through layers: your road and seams sit on top of
// it, so you can see your way through the dark and the ore still in it.
dark.renderOrder = -1;
scene.add(dark);
// The nearest point of the border: a beam that brightens as the dark gets close.
const beamMat = new THREE.MeshBasicMaterial({ color: PALE, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
const beam = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 320, 8), beamMat);
beam.position.y = 160;
scene.add(beam);

const wallColor = new THREE.Color();
function syncNight(urgency: number): void {
  const ns = run.ns;
  for (let k = 0; k <= RING_STEPS; k += 1) {
    const a = (k / RING_STEPS) * TAU;
    const r = ringAt(ns, a);
    const c = Math.cos(a);
    const s = Math.sin(a);
    wallPos.set([c * r, 0, s * r, c * r, WALL_H * (1 + 0.6 * ns.ringFlash), s * r], k * 6);
    darkPos.set([c * r, 0.3, s * r, c * 5000, 0.3, s * 5000], k * 6);
  }
  wallGeo.attributes.position.needsUpdate = true;
  darkGeo.attributes.position.needsUpdate = true;
  wallGeo.computeBoundingSphere();
  // The wall flares pale while a push-back plays out, so you see the night fall back.
  wallMat.color.copy(wallColor.setHex(NIGHT).lerp(new THREE.Color(PALE), Math.min(1, ns.ringFlash)));
  const n = run.nearest;
  beam.visible = Number.isFinite(n.gap);
  beam.position.x = n.x;
  beam.position.z = n.y;
  beamMat.opacity = 0.15 + 0.6 * urgency;
}

// --- the rover --------------------------------------------------------------------
const rover = new THREE.Group();
const bodyMat = new THREE.MeshLambertMaterial({ color: 0xdfe8f2, emissive: TEAL, emissiveIntensity: 0 });
const body = new THREE.Mesh(new THREE.BoxGeometry(22, 7, 14), bodyMat);
body.position.y = 6;
rover.add(body);
const nose = new THREE.Mesh(new THREE.ConeGeometry(5, 9, 4), new THREE.MeshBasicMaterial({ color: 0xfff1c4 }));
nose.rotation.z = -Math.PI / 2;
nose.position.set(15, 6, 0);
rover.add(nose);
const cargo = new THREE.Mesh(new THREE.BoxGeometry(10, 6, 10), new THREE.MeshLambertMaterial({ color: GOLD, emissive: 0x6a3a08 }));
cargo.position.set(-4, 12, 0);
rover.add(cargo);
for (const [x, z] of [[7, 8], [7, -8], [-7, 8], [-7, -8]]) {
  const wheel = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.5, 3, 10), new THREE.MeshLambertMaterial({ color: 0x3a4658 }));
  wheel.rotation.x = Math.PI / 2;
  wheel.position.set(x, 3.5, z);
  rover.add(wheel);
}
scene.add(rover);

// --- particles ----------------------------------------------------------------------
const MAX_P = 800;
const pPos = new Float32Array(MAX_P * 3);
const pCol = new Float32Array(MAX_P * 3);
const pVel = new Float32Array(MAX_P * 3);
const pLife = new Float32Array(MAX_P);
let pNext = 0;
const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
const points = new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 5, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
points.frustumCulled = false;
scene.add(points);
const tmpColor = new THREE.Color();
function burst(x: number, z: number, n: number, color: number, speed: number, life = 0.9): void {
  tmpColor.setHex(color);
  for (let i = 0; i < n; i += 1) {
    const k = pNext;
    pNext = (pNext + 1) % MAX_P;
    const a = Math.random() * TAU;
    const v = speed * (0.3 + Math.random() * 0.7);
    pPos.set([x, 4, z], k * 3);
    pVel.set([Math.cos(a) * v, 40 + Math.random() * speed * 0.5, Math.sin(a) * v], k * 3);
    pCol.set([tmpColor.r, tmpColor.g, tmpColor.b], k * 3);
    pLife[k] = life * (0.6 + Math.random() * 0.4);
  }
}
function stepParticles(dt: number): void {
  for (let k = 0; k < MAX_P; k += 1) {
    if (pLife[k] <= 0) {
      pPos[k * 3 + 1] = -1000;
      continue;
    }
    pLife[k] -= dt;
    pVel[k * 3 + 1] -= 160 * dt;
    for (let j = 0; j < 3; j += 1) pPos[k * 3 + j] += pVel[k * 3 + j] * dt;
    if (pPos[k * 3 + 1] < 0.5) {
      pPos[k * 3 + 1] = 0.5;
      pVel[k * 3 + 1] *= -0.3;
    }
  }
  pGeo.attributes.position.needsUpdate = true;
  pGeo.attributes.color.needsUpdate = true;
}

// --- input, sound, overlay -----------------------------------------------------------
const stick = new Stick(renderer.domElement);
const hum = new Hum();
const darkHum = new Hum();
const overlay = document.getElementById('overlay') as HTMLCanvasElement;
const octx = overlay.getContext('2d') as CanvasRenderingContext2D;
const el = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;
const hud = { dawn: el('h-dawn'), dawnBar: el('h-dawn-bar'), carry: el('h-carry'), mult: el('h-mult'), score: el('h-score'), dark: el('h-dark'), res: el('h-res'), resBar: el('h-res-bar') };
const endBtn = el<HTMLButtonElement>('end');
const titleScreen = el('title');
const overScreen = el('over');

interface Pop {
  x: number;
  z: number;
  text: string;
  t: number;
  color: string;
}
let pops: Pop[] = [];
const pop = (x: number, z: number, text: string, color = '#ffd27a'): void => {
  pops.push({ x, z, text, t: 1.4, color });
};

function resize(): void {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  composer.setSize(w, h);
  bloom.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  const dpr = Math.min(window.devicePixelRatio, 2);
  overlay.width = w * dpr;
  overlay.height = h * dpr;
  overlay.style.width = `${w}px`;
  overlay.style.height = `${h}px`;
  octx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize);
resize();

// --- screens -------------------------------------------------------------------------
function showTitle(): void {
  phase = 'title';
  const s = loadStats(GAME);
  el('best').textContent = s.plays ? `played ${s.plays} · best score ${s.best}` : '';
  titleScreen.style.display = 'flex';
  overScreen.style.display = 'none';
  endBtn.style.display = 'none';
}

function start(): void {
  seed = daily ? (dailySeed() ^ 0x3d3d3d3d) >>> 0 : (Math.random() * 1e9) | 0;
  mods = baseMods();
  RULES = rulesNow();
  run = createRun('endless', seed, hard, RULES);
  runLogged = false;
  glide.x = 0;
  glide.y = 0;
  pops = [];
  mapReach = RING0 * 1.3;
  camYaw = run.rs.rover.h;
  phase = 'play';
  titleScreen.style.display = 'none';
  overScreen.style.display = 'none';
  endBtn.style.display = 'block';
  stick.consumeTap();
  blip(520, 0.1, 'triangle', 0.2, 780);
}

const toggleText = (b: HTMLElement, name: string, on: boolean): void => {
  b.textContent = `${name}: ${on ? 'on' : 'off'}`;
  b.classList.toggle('on', on);
};
el('start').addEventListener('click', start);
el('again').addEventListener('click', start);
el('daily').addEventListener('click', (e) => {
  daily = !daily;
  toggleText(e.currentTarget as HTMLElement, 'Daily map', daily);
});
el('hard').addEventListener('click', (e) => {
  hard = !hard;
  toggleText(e.currentTarget as HTMLElement, 'Hard', hard);
});
for (const [id, key, name] of [['r-reserve', 'reserve', 'Dark reserve'], ['r-seams', 'liveSeams', 'Live seams in the dark'], ['r-side', 'sideOre', 'Ore beside your road'], ['r-terrain', 'terrain', 'Terrain']] as const) {
  el(id).addEventListener('click', (e) => {
    rulesOn[key] = !rulesOn[key];
    toggleText(e.currentTarget as HTMLElement, name, rulesOn[key]);
  });
}
endBtn.addEventListener('click', () => {
  if (phase === 'play') gameOver('quit');
});

const RESULT_TEXT: Record<string, [string, string]> = {
  dawn: ['DAWN', 'You held out. The night lifts.'],
  stranded: ['STRANDED', 'The night reached home with you out in it.'],
  nightfall: ['NIGHTFALL', 'The night reached home.'],
  caught: ['CAUGHT', 'Your dark reserve ran out.'],
  quit: ['ENDED', 'Run ended.']
};

function gameOver(result: string): void {
  phase = 'over';
  overAt = time;
  hum.mute();
  darkHum.mute();
  logRun(result);
  const [title, line] = result === 'caught' && run.reserveMax === 0 ? ['CAUGHT', 'Hard: off your road in the dark.'] : RESULT_TEXT[result] ?? [result.toUpperCase(), ''];
  const t = el('over-title');
  t.textContent = title;
  t.classList.toggle('win', result === 'dawn');
  el('over-body').innerHTML = `${line}<br>banked ${Math.round(run.banked)}/${RULES.night.dawnOre} · score ${Math.round(run.ns.score)} · best x${run.ns.multPeak} · ${Math.round(run.elapsed)} s`;
  endBtn.style.display = 'none';
  // Let the end land before the screen covers it.
  setTimeout(() => {
    if (phase === 'over') overScreen.style.display = 'flex';
  }, result === 'quit' ? 0 : 900);
  shake = result === 'dawn' ? 12 : run.stranded ? 14 : 6;
  if (result !== 'dawn') blip(run.stranded ? 170 : 660, 0.6, run.stranded ? 'sawtooth' : 'triangle', 0.3, run.stranded ? 55 : 990);
  void prepareSend();
}

// --- the run log (sent with every other run: src/runs/sendAll.ts) --------------------
function logRun(result: string): void {
  if (runLogged) return;
  runLogged = true;
  const rs = run.rs;
  logToyRun({
    seed: `${GAME}:${seed}${daily ? ':daily' : ''}`,
    mode: 'endless:3d',
    level: null,
    levelName: null,
    day: 1,
    result,
    ore: Math.round(run.banked),
    quota: 0,
    daily,
    hard,
    score: Math.round(run.ns.score),
    multPeak: run.ns.multPeak,
    trips: run.trips,
    seconds: Math.round(run.elapsed),
    distance: Math.round(run.dist),
    railShare: run.dist > 0 ? +(run.railDist / run.dist).toFixed(2) : 0,
    hopOffs: rs.hopOffs,
    grabs: rs.grabs,
    missedGrabs: { ...rs.missedGrabs },
    misses: rs.misses.slice(),
    lostInDark: Math.round(run.lostTotal),
    dawnOre: RULES.night.dawnOre,
    strandLoad: Math.round(run.strandLoad),
    autoBanks: run.autoBanks,
    pushMine: Math.round(run.ns.pushMine),
    pushBank: Math.round(run.ns.pushBank),
    closingEnd: Math.round(closingSpeed(run.ns, RULES.night)),
    reserve: run.reserveMax,
    reserveLow: run.reserveMax > 0 ? +(Number.isFinite(run.reserveLow) ? run.reserveLow : run.reserveMax).toFixed(1) : null,
    darkSeconds: +run.darkTime.toFixed(1),
    darkDips: run.darkDips,
    ...routeForLog(run),
    roughSeconds: +run.roughTime.toFixed(1),
    bumps: rs.bumps,
    transfers: rs.transfers,
    switches: rs.switches,
    terrain: run.terrain
      ? {
          ridges: run.terrain.ridges,
          gates: run.terrain.gates,
          craters: run.terrain.craters,
          clusters: run.terrain.clusters,
          rough: run.terrain.rough.length,
          rocks: run.terrain.rocks.length,
          rubble: run.terrain.rocks.filter((k) => !k.block).length,
          blockShare: +run.terrain.profile.blockShare.toFixed(2),
          rubbleSlow: +run.terrain.profile.rubbleSlow.toFixed(2),
          roughSlow: +run.terrain.profile.roughSlow.toFixed(2)
        }
      : null,
    ...(Object.values(rulesOn).every(Boolean) ? {} : { knobs: { ...rulesOn } })
  });
  recordPlay(GAME, run.ns.score);
}
window.addEventListener('pagehide', () => {
  if (phase === 'play' && run.started) logRun('abandoned');
});

const sendBtn = el<HTMLButtonElement>('send');
let prepared: { url: string; count: number; ids: string[] } | null = null;
// Built ahead of the tap: window.open has to run inside the tap itself.
async function prepareSend(): Promise<void> {
  const unsent = unsentAll(localStorage);
  if (!unsent.length) {
    sendBtn.disabled = true;
    sendBtn.textContent = sendLabel(0, 0, 0);
    prepared = null;
    return;
  }
  const r = await sendAllUrl(unsent);
  prepared = { url: r.url, count: r.count, ids: unsent.map((x) => x.id) };
  sendBtn.disabled = false;
  sendBtn.textContent = sendLabel(unsent.length, r.count, r.toys);
}
sendBtn.addEventListener('click', () => {
  if (!prepared) return;
  const w = window.open(prepared.url, '_blank');
  if (w) w.opener = null;
  else window.location.href = prepared.url;
  markSentAll(localStorage, new Set(prepared.ids.slice(-prepared.count)));
  el('send-note').textContent = 'Opened GitHub. Press Submit there to store them.';
  void prepareSend();
});

// --- what each run event looks and sounds like ----------------------------------------
function effect(e: RunEvent): void {
  const r = run.rs.rover;
  switch (e.kind) {
    case 'hopOff':
      shake = Math.max(shake, 5);
      blip(230, 0.1, 'triangle', 0.18, 150);
      break;
    case 'flip':
      blip(420, 0.08, 'triangle', 0.15, 300);
      break;
    case 'tip':
      blip(300, 0.06, 'triangle', 0.12);
      break;
    case 'grab':
      blip(520, 0.07, 'triangle', 0.18, 780);
      glide.x = rover.position.x - r.x;
      glide.y = rover.position.z - r.y;
      break;
    case 'switch':
      // Took a branch from the rail: the points click, a touch brighter.
      blip(990, 0.04, 'square', 0.14);
      setTimeout(() => blip(740, 0.05, 'triangle', 0.14), 40);
      burst(r.x, r.y, 10, 0xbffff4, 110, 0.45);
      break;
    case 'transfer':
      // Through a junction onto another road: a click of the points.
      blip(880, 0.04, 'square', 0.14);
      setTimeout(() => blip(660, 0.05, 'triangle', 0.14), 45);
      glide.x = rover.position.x - r.x;
      glide.y = rover.position.z - r.y;
      burst(r.x, r.y, 12, TEAL, 120, 0.5);
      break;
    case 'bump':
      shake = Math.max(shake, 6);
      burst(r.x + Math.cos(r.h) * 14, r.y + Math.sin(r.h) * 14, 10, 0xb7c0cc, 90, 0.5);
      blip(110, 0.12, 'square', 0.2, 70);
      break;
    case 'scoop':
      burst(e.seam.x, e.seam.y, 40, 0xffcf5a, 260);
      shake = Math.max(shake, 8 + e.chain * 2);
      blip(440 * Math.pow(1.19, Math.min(e.chain, 8)), 0.18, 'square', 0.28, 1400);
      pop(r.x, r.y, e.chain > 1 ? `SCOOP x${e.chain}  +${e.gain.toFixed(0)}` : `SCOOP +${e.gain.toFixed(0)}`);
      break;
    case 'nibble':
      if (Math.random() < 0.3) burst(r.x, r.y, 1, GOLD, 60, 0.5);
      if (Math.random() < 0.08) blip(300 + Math.random() * 60, 0.03, 'square', 0.06);
      break;
    case 'leak':
      if (Math.random() < 0.4) burst(r.x, r.y, 1, 0xb48cff, 50, 0.6);
      break;
    case 'darkIn':
      if (run.reserveMax > 0) blip(150, 0.25, 'sawtooth', 0.14, 90);
      break;
    case 'darkOut':
      if (run.reserveMax > 0) {
        burst(r.x, r.y, 24, PALE, 140);
        [392, 523, 659].forEach((f, i) => setTimeout(() => blip(f, 0.1, 'triangle', 0.16), i * 60));
      }
      break;
    case 'bank':
      if (e.won > 1) pop(e.wonAt.x, e.wonAt.y, `+${e.won.toFixed(0)}m`, '#b8a8ff');
      blip(180, 0.5, 'sawtooth', 0.12, 520);
      if (e.dawn) break;
      pop(e.at.x, e.at.y, `${e.auto ? 'AUTO-BANK' : 'BANKED'} +${e.load.toFixed(0)} x${e.mult}`, '#78f7df');
      burst(e.at.x, e.at.y, 50, TEAL, 220);
      shake = Math.max(shake, e.auto ? 10 : 7);
      [523, 659, 784].forEach((f, i) => setTimeout(() => blip(f, 0.12, 'triangle', 0.22), i * 70));
      break;
    case 'strand':
      if (e.load > 0.5) pop(e.at.x, e.at.y, `STRANDED -${e.load.toFixed(0)}`, '#ff8a5c');
      break;
    case 'dawn':
      burst(0, 0, 160, 0xffe7a8, 380, 1.4);
      [523, 659, 784, 1046, 1318].forEach((f, i) => setTimeout(() => blip(f, 0.22, 'triangle', 0.24), i * 110));
      break;
    case 'over':
      gameOver(e.result);
      break;
    default:
      break;
  }
}

// --- each frame ----------------------------------------------------------------------
function urgencyNow(): number {
  if (phase !== 'play' || !run.started) return 0;
  return run.inDark ? 1 : Math.max(0, 1 - timeToDark(run, RULES, mods) / WARN_S);
}

function update(dt: number): void {
  time += dt;
  // On the title and end screens, taps go to the buttons; Enter or space starts.
  if (phase !== 'play') {
    // (Taps are read and dropped every frame, so one from the end of a run never
    // starts the next; the end screen shows at 0.9 s.)
    if (stick.consumeTap() && time - overAt > 1) start();
    return;
  }
  for (const e of stepRun(run, stick.axes(), dt, RULES, mods)) effect(e);
  if (phase !== 'play' || !run.started) return;
  // Border cues: they build as the dark gets closer in seconds.
  const u = urgencyNow();
  darkHum.set(u, 38, 70, 0);
  if (!run.inDark && u > 0) {
    const rate = 1 + 7 * u;
    if (Math.floor(time * rate) !== Math.floor((time - dt) * rate)) blip(520 + 520 * u, 0.04, 'square', 0.05 + 0.08 * u);
  }
  // In the dark on a reserve: a low tick that speeds up and drops as it runs down.
  if (run.inDark && run.reserveMax > 0) {
    const spent = 1 - run.reserve / run.reserveMax;
    const rate = 1.5 + 8 * spent;
    if (Math.floor(time * rate) !== Math.floor((time - dt) * rate)) blip(330 - 160 * spent, 0.06, 'square', 0.08 + 0.12 * spent);
  }
  const rs = run.rs;
  // Laying through rough ground or rubble kicks up dust.
  if (!rs.rail && run.terrain && Math.abs(rs.rover.v) > 10 && layFactor(run.terrain, rs.rover.x, rs.rover.y) < 1 && Math.random() < 0.5) burst(rs.rover.x, rs.rover.y, 1, 0x9a7b5c, 40, 0.5);
  if (rs.rail && rs.rover.v > 200 && Math.random() < 0.5) burst(rs.rover.x - Math.cos(rs.rover.h) * 14, rs.rover.y - Math.sin(rs.rover.h) * 14, 1, TEAL, 30, 0.35);
  hum.set(Math.min(1, Math.abs(rs.rover.v) / (mods.railBase + mods.railBonus)), 50, rs.rail ? 160 : 70);
}

const look = new THREE.Vector3();
const want = new THREE.Vector3();
function syncView(dt: number): void {
  syncRoad();
  syncSeams();
  syncTerrain();
  syncSwitch();
  const u = urgencyNow();
  syncNight(u);
  stepParticles(dt);
  const rs = run.rs;
  const r = rs.rover;
  const fade = Math.exp(-dt * 30); // about 0.1 s to close the gap
  glide.x *= fade;
  glide.y *= fade;
  rover.position.set(r.x + glide.x, 0, r.y + glide.y);
  rover.rotation.y = -r.h;
  bodyMat.emissiveIntensity = rs.rail ? 0.25 + 0.6 * rs.charge : 0;
  const load = Math.min(1, rs.carry / 60);
  cargo.visible = rs.carry > 0.5;
  cargo.scale.setScalar(0.5 + load);
  // Chase camera, heading-up like the toy: it swings round behind the rover and
  // pulls back with speed.
  let d = r.h - camYaw;
  while (d > Math.PI) d -= TAU;
  while (d < -Math.PI) d += TAU;
  camYaw += d * Math.min(1, dt * 4);
  const k = Math.min(1, Math.abs(r.v) / 400);
  const back = 150 + 110 * k;
  const up = 80 + 50 * k;
  want.set(r.x - Math.cos(camYaw) * back, up, r.y - Math.sin(camYaw) * back);
  camera.position.lerp(want, 1 - Math.exp(-dt * 6));
  shake = Math.max(0, shake - dt * 30);
  if (shake > 0) camera.position.add(new THREE.Vector3((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake));
  look.set(r.x + Math.cos(camYaw) * 90, 0, r.y + Math.sin(camYaw) * 90);
  camera.lookAt(look);
  // The beacon is for finding home from afar; it fades out as you get close.
  const near = Math.min(1, Math.max(0, (Math.hypot(r.x, r.y) - 80) / 300));
  (beacon.material as THREE.MeshBasicMaterial).opacity = near * (0.35 + 0.25 * Math.sin(time * 3) ** 2);
}

// --- HUD, minimap, pops, stick ---------------------------------------------------------
function updateHud(): void {
  const dawnOre = RULES.night.dawnOre;
  hud.dawn.textContent = `${Math.round(run.banked)}/${dawnOre}`;
  hud.dawnBar.style.width = `${Math.min(100, (run.banked / dawnOre) * 100)}%`;
  hud.carry.textContent = `${Math.round(run.rs.carry)}${run.rs.chain > 1 ? ` · x${run.rs.chain}` : ''}`;
  hud.mult.textContent = `x${run.ns.mult}`;
  hud.score.textContent = `${Math.round(run.ns.score)}`;
  const ttd = timeToDark(run, RULES, mods);
  const safe = onOwnRoad(run.rs, run.road, RULES.rover);
  const reserve = run.reserveMax > 0;
  hud.dark.textContent = run.inDark ? (reserve ? 'IN IT' : safe ? 'ON ROAD' : 'IN IT') : Number.isFinite(ttd) && run.started ? `${Math.ceil(ttd)} s` : '–';
  hud.dark.style.color = run.inDark ? (safe && !reserve ? '#78f7df' : '#ff8a5c') : ttd < WARN_S ? '#b8a8ff' : '#dfe8f2';
  // The two numbers the route turns on: seconds until the dark, and seconds you can last in it.
  const left = reserve ? run.reserve / run.reserveMax : 0;
  hud.res.textContent = reserve ? `${run.reserve.toFixed(1)} s` : '–';
  hud.res.style.color = !reserve ? '#6b7d92' : left > 0.5 ? '#78f7df' : left > 0.25 ? '#ffd27a' : '#ff8a5c';
  hud.resBar.style.width = `${left * 100}%`;
  hud.resBar.style.background = left > 0.5 ? '#78f7df' : left > 0.25 ? '#ffd27a' : '#ff8a5c';
}

const proj = new THREE.Vector3();
function drawOverlay(dt: number): void {
  const w = window.innerWidth;
  const h = window.innerHeight;
  octx.clearRect(0, 0, w, h);
  if (phase === 'title') return;
  // The dark's edge creeps in from the screen's rim as it gets closer.
  const u = urgencyNow();
  if (u > 0) {
    // In the dark on a reserve, the rim warms toward orange and pulses as it runs down.
    const spent = run.inDark && run.reserveMax > 0 ? 1 - run.reserve / run.reserveMax : 0;
    const pulse = spent > 0 ? 0.15 * spent * (0.5 + 0.5 * Math.sin(time * (4 + 10 * spent))) : 0;
    const rgb = `${Math.round(60 + 160 * spent)},${Math.round(30 + 40 * spent)},${Math.round(120 - 90 * spent)}`;
    const g = octx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * (0.3 - 0.1 * spent), w / 2, h / 2, Math.max(w, h) * 0.75);
    g.addColorStop(0, `rgba(${rgb},0)`);
    g.addColorStop(1, `rgba(${rgb},${0.55 * u + pulse})`);
    octx.fillStyle = g;
    octx.fillRect(0, 0, w, h);
  }
  pops = pops.filter((p) => (p.t -= dt) > 0);
  octx.textAlign = 'center';
  octx.font = 'bold 15px ui-monospace, monospace';
  for (const p of pops) {
    proj.set(p.x, 30 + (1.4 - p.t) * 30, p.z).project(camera);
    if (proj.z > 1) continue;
    octx.globalAlpha = Math.min(1, p.t * 2);
    octx.fillStyle = p.color;
    octx.fillText(p.text, (proj.x * 0.5 + 0.5) * w, (-proj.y * 0.5 + 0.5) * h);
  }
  octx.globalAlpha = 1;
  // Off the rail on rough ground or rubble: how fast you're laying here.
  if (phase === 'play' && !run.rs.rail && run.terrain) {
    const f = layFactor(run.terrain, run.rs.rover.x, run.rs.rover.y);
    if (f < 1) {
      octx.font = 'bold 14px ui-monospace, monospace';
      octx.fillStyle = '#d9b48a';
      octx.fillText(`ROUGH · laying ${Math.round(f * 100)}%`, w / 2, h - 90);
    }
  }
  drawMinimap(w, h);
  if (stick.down) {
    octx.save();
    octx.globalAlpha = 0.5;
    octx.strokeStyle = '#8fd9c9';
    octx.lineWidth = 2;
    octx.beginPath();
    octx.arc(stick.origin.x, stick.origin.y, stick.radius, 0, TAU);
    octx.stroke();
    octx.globalAlpha = 0.8;
    octx.fillStyle = '#8fd9c9';
    octx.beginPath();
    octx.arc(stick.at.x, stick.at.y, 22, 0, TAU);
    octx.fill();
    octx.restore();
  }
}

// The whole field around home, turned like the view (up = the way you face), as
// in the toy.
function drawMinimap(w: number, h: number): void {
  const ctx = octx;
  const r = 54;
  const cx = w - 14 - r;
  const cy = Math.min(h - r - 14, 120 + r);
  const rs = run.rs;
  const goal = Math.max(run.ns.ringR * 1.3, Math.hypot(rs.rover.x, rs.rover.y) * 1.15, 360);
  mapReach += (goal - mapReach) * 0.08;
  const k = r / mapReach;
  const rot = -Math.PI / 2 - camYaw;
  const cs = Math.cos(rot);
  const sn = Math.sin(rot);
  const at = (x: number, y: number) => ({ x: cx + (x * cs - y * sn) * k, y: cy + (x * sn + y * cs) * k });
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.fillStyle = 'rgba(16,20,28,0.85)';
  ctx.fill();
  ctx.clip();
  ctx.beginPath();
  ctx.rect(cx - r, cy - r, r * 2, r * 2);
  for (let j = 0; j <= 72; j += 1) {
    const a = (j / 72) * TAU;
    const p = at(Math.cos(a) * ringAt(run.ns, a), Math.sin(a) * ringAt(run.ns, a));
    if (j) ctx.lineTo(p.x, p.y);
    else ctx.moveTo(p.x, p.y);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(3,3,10,0.9)';
  ctx.fill('evenodd');
  ctx.strokeStyle = run.ns.ringFlash > 0.05 ? '#e0d0ff' : '#9670ff';
  ctx.lineWidth = 1.5 + 2 * run.ns.ringFlash;
  ctx.stroke();
  if (run.terrain) {
    ctx.fillStyle = 'rgba(154,123,92,0.35)';
    for (const g of run.terrain.rough) {
      const q = at(g.x, g.y);
      ctx.beginPath();
      ctx.ellipse(q.x, q.y, Math.max(1, g.rx * k), Math.max(1, g.ry * k), g.a + rot, 0, TAU);
      ctx.fill();
    }
    for (const rock of run.terrain.rocks) {
      const q = at(rock.x, rock.y);
      ctx.fillStyle = rock.block ? '#9aa3b2' : '#9a7b5c';
      ctx.beginPath();
      ctx.arc(q.x, q.y, Math.max(1, rock.r * k), 0, TAU);
      ctx.fill();
    }
  }
  ctx.strokeStyle = 'rgba(120,247,223,0.8)';
  ctx.lineWidth = 1.5;
  for (const line of run.road.lines) {
    if (line.pts.length < 2) continue;
    ctx.beginPath();
    line.pts.forEach((p, j) => {
      const q = at(p.x, p.y);
      if (j) ctx.lineTo(q.x, q.y);
      else ctx.moveTo(q.x, q.y);
    });
    ctx.stroke();
  }
  ctx.fillStyle = '#e8b04a';
  for (const s of run.seams) {
    if (s.ore <= 0.5) continue;
    const q = at(s.x, s.y);
    ctx.beginPath();
    ctx.arc(q.x, q.y, 1.5 + Math.min(3, s.ore / 10), 0, TAU);
    ctx.fill();
  }
  ctx.strokeStyle = '#78f7df';
  const hq = at(0, 0);
  ctx.beginPath();
  ctx.arc(hq.x, hq.y, 3, 0, TAU);
  ctx.stroke();
  const me = at(rs.rover.x, rs.rover.y);
  ctx.fillStyle = '#fff1c4';
  ctx.beginPath();
  ctx.moveTo(me.x, me.y - 5);
  ctx.lineTo(me.x + 3.5, me.y + 4);
  ctx.lineTo(me.x - 3.5, me.y + 4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#263041';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.stroke();
}

// --- headless hooks (read-only state, plus test shortcuts) -----------------------------
const W = window as unknown as Record<string, unknown>;
W.__night = () => ({
  phase, seed, daily, hard, started: run.started, over: run.over, inDark: run.inDark, onRail: run.rs.rail !== null,
  x: run.rs.rover.x, y: run.rs.rover.y, h: run.rs.rover.h, v: run.rs.rover.v, carry: run.rs.carry, banked: run.banked, score: run.ns.score,
  mult: run.ns.mult, trips: run.trips, ringR: run.ns.ringR, pushMine: run.ns.pushMine, pushBank: run.ns.pushBank, lines: run.road.lines.length,
  seams: run.seams.length, ribbons: ribbons.length, seamViews: seamViews.length, toDark: timeToDark(run, RULES, mods),
  reserve: run.reserve, reserveMax: run.reserveMax, darkTime: run.darkTime,
  rocks: run.terrain?.rocks.length ?? 0, rough: run.terrain?.rough.length ?? 0, terrainMeshes: terrainGroup.children.length, bumps: run.rs.bumps, roughTime: run.roughTime
});
// Put the border just inside the rover (it's then in the dark) without reaching home.
W.__nightDarkHere = () => {
  const d = Math.hypot(run.rs.rover.x, run.rs.rover.y);
  run.ns.ringR = Math.max(RULES.depotR / run.ns.minFactor + 5, d / 1.4);
  run.ns.ringPush = 0;
};
W.__nightSkip = (s: number) => {
  run.elapsed += s;
  run.ns.heat += s;
  run.ns.ringR -= closingSpeed(run.ns, RULES.night) * s;
};
// Set the title's rule toggles (they apply from the next run).
W.__nightRulesOn = (o: Partial<typeof rulesOn>) => {
  Object.assign(rulesOn, o);
};
W.__nightGive = (n: number) => {
  run.rs.carry += n;
};

showTitle();
loop((dt) => {
  update(dt);
  syncView(dt);
  composer.render();
  updateHud();
  drawOverlay(dt);
});
