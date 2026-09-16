// Moon Miner — 3D substrate vertical slice.
//
// The point of this file: prove the CORRECT substrate. The road is not vector
// geometry redrawn every frame; it is PAINTED into a canvas texture that lives
// on a real ground plane, under a real perspective camera. Overlap composites in
// raster (no flashing, no pinch, no bowties -- structurally impossible), and
// perspective/occlusion come from the camera for free. The simulation
// (src/game/continuous.ts) is reused untouched -- it has no engine coupling.
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {
  tickContinuousWorld,
  getContinuousGuidance,
  launchReclaimDrone,
  findFertileZoneAt,
  resolveContinuousTuning,
  type ContinuousInput,
  type ContinuousTuning,
  type ContinuousWorldState,
  type Vec2
} from '../game/continuous';
import { RoadModel, DEFAULT_ROAD_CONFIG, type RoadConfig, type TrailPoint, type SlurpEvent } from './road';
import { Campaign, DEFAULT_LOOP_CONFIG, type LoopConfig } from './loop';
import { createPanel, DEFAULT_CAMERA_CONFIG, DEFAULT_TERRAIN_CONFIG, type CameraConfig, type TerrainConfig } from './panel';

// --- Persisted config (loop + road + sim-tuning overrides + camera) ----------
const CONFIG_KEY = 'mm3d-config-v1';
function loadConfig(): { loop: LoopConfig; road: RoadConfig; tuning: Partial<ContinuousTuning>; cam: CameraConfig; terrain: TerrainConfig } {
  try {
    const raw = window.localStorage.getItem(CONFIG_KEY);
    const p = raw ? JSON.parse(raw) : {};
    return {
      loop: { ...DEFAULT_LOOP_CONFIG, ...(p.loop ?? {}) },
      road: { ...DEFAULT_ROAD_CONFIG, ...(p.road ?? {}) },
      tuning: p.tuning ?? {},
      cam: { ...DEFAULT_CAMERA_CONFIG, ...(p.cam ?? {}) },
      terrain: { ...DEFAULT_TERRAIN_CONFIG, ...(p.terrain ?? {}) }
    };
  } catch {
    return { loop: { ...DEFAULT_LOOP_CONFIG }, road: { ...DEFAULT_ROAD_CONFIG }, tuning: {}, cam: { ...DEFAULT_CAMERA_CONFIG }, terrain: { ...DEFAULT_TERRAIN_CONFIG } };
  }
}
const savedConfig = loadConfig();
const camCfg = savedConfig.cam;
const terrainCfg = savedConfig.terrain;
function saveConfig(): void {
  try {
    window.localStorage.setItem(CONFIG_KEY, JSON.stringify({ loop: campaign.config, road: road.config, tuning: campaign.tuningOverrides, cam: camCfg, terrain: terrainCfg }));
  } catch {
    /* storage may be unavailable */
  }
}

// --- World <-> scene mapping -------------------------------------------------
// Sim world is x in [0,W], y in [0,H] (top-down). We lay it on the XZ ground
// plane centred at the origin: X = x - W/2, Z = y - H/2, Y is up.
const W = 1040;
const H = 720;
const PX = 1.5; // road-canvas pixels per world unit
const GROUND_BASE = '#0e1520'; // dark lunar ground so the neon road/seams carry the light

// The road: the driven trail + carry (lock) + rail boost + slurp, ported from
// the tuned game (engine-agnostic). It decides where the road goes and what to
// feed back into the sim; the canvas below paints what it lays.
const road = new RoadModel(savedConfig.road);

// --- Sim + campaign (day / shift / game loop, economy, carried road) ---------
const campaign = new Campaign(savedConfig.loop);
campaign.tuningOverrides = savedConfig.tuning;
let state!: ContinuousWorldState;
let runEnded = false; // guards the once-per-run bank/persist

// --- Renderer / scene / camera ----------------------------------------------
const mount = document.getElementById('app3d') as HTMLDivElement;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
mount.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x03040a);
// Deep-space haze: things fade into the dark instead of ending on a hard edge.
scene.fog = new THREE.Fog(0x04060e, 520, 1500);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 4000);

// Moody key + a cool rim from behind, low ambient so the dark reads as dark and
// the neon road/seams carry the light.
scene.add(new THREE.AmbientLight(0x2a3550, 0.5));
const sun = new THREE.DirectionalLight(0xbfd0ff, 0.7);
sun.position.set(-300, 500, -260);
scene.add(sun);
const rim = new THREE.DirectionalLight(0x7fe9ff, 0.9);
rim.position.set(220, 240, 420);
scene.add(rim);

// --- Starfield backdrop ------------------------------------------------------
const starGeo = new THREE.BufferGeometry();
const starN = 900;
const starPos = new Float32Array(starN * 3);
for (let i = 0; i < starN; i += 1) {
  const r = 2200 + Math.random() * 1200;
  const th = Math.random() * Math.PI * 2;
  const ph = Math.acos(2 * Math.random() - 1);
  starPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
  starPos[i * 3 + 1] = Math.abs(r * Math.cos(ph)) * 0.6 + 120;
  starPos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x9fb6d8, size: 3, sizeAttenuation: false, fog: false }));
scene.add(stars);

// --- Bloom post-processing (the neon glow) -----------------------------------
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
// strength 0.55 (glow, not blowout), radius 0.5, threshold 0.72 so only the
// neon cores bloom -- seams read as glowing edges, not solid white plates.
const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.55, 0.5, 0.72);
composer.addPass(bloom);
composer.setSize(window.innerWidth, window.innerHeight);

// --- Ground with a painted road texture --------------------------------------
const roadCanvas = document.createElement('canvas');
roadCanvas.width = Math.round(W * PX);
roadCanvas.height = Math.round(H * PX);
const rctx = roadCanvas.getContext('2d') as CanvasRenderingContext2D;
// Base lunar ground fill; the road is painted on top of this same canvas.
rctx.fillStyle = GROUND_BASE;
rctx.fillRect(0, 0, roadCanvas.width, roadCanvas.height);
const roadTexture = new THREE.CanvasTexture(roadCanvas);
roadTexture.colorSpace = THREE.SRGBColorSpace;

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(W, H),
  // Unlit, so the painted canvas shows its true colours (teal road, gold seams)
  // instead of being tinted olive by the warm sun. The rover/drone stay lit.
  new THREE.MeshBasicMaterial({ map: roadTexture })
);
ground.rotation.x = -Math.PI / 2; // lie flat on XZ
scene.add(ground);

// --- Terrain features (craters, rilles, mare blotches, relief) ----------------
// The field was an empty dark sheet. This gives it actual lunar features: a
// seeded set of craters, hairline rilles, and broad mare/highland value patches
// painted into the ground canvas (so they composite UNDER the road, guaranteed
// aligned), plus an optional low-amplitude displacement of the ground mesh so
// the same features read with real parallax against the fog. All seeded per
// world, so each map's terrain is its own and regenerates on regen / New Game.
interface Crater { x: number; y: number; r: number }
interface Blotch { x: number; y: number; r: number; light: number }
interface TerrainFeatures { craters: Crater[]; rilles: Vec2[][]; blotches: Blotch[]; sun: number }

function hashSeed(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i += 1) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateTerrain(seed: string): TerrainFeatures {
  const rnd = mulberry32(hashSeed(`${seed}:terrain-v1`));
  const density = Math.max(0, terrainCfg.craterDensity);
  const craters: Crater[] = [];
  const nC = Math.round((10 + rnd() * 10) * density);
  for (let i = 0; i < nC; i += 1) {
    craters.push({ x: rnd() * W, y: rnd() * H, r: 14 + rnd() * rnd() * 84 }); // rnd^2 => many small, few big
  }
  const blotches: Blotch[] = [];
  const nB = 4 + Math.floor(rnd() * 4);
  for (let i = 0; i < nB; i += 1) blotches.push({ x: rnd() * W, y: rnd() * H, r: 150 + rnd() * 260, light: rnd() - 0.5 });
  const rilles: Vec2[][] = [];
  const nR = Math.round((2 + rnd() * 3) * Math.min(1.5, density));
  for (let i = 0; i < nR; i += 1) {
    const pts: Vec2[] = [];
    let x = rnd() * W;
    let y = rnd() * H;
    let a = rnd() * Math.PI * 2;
    const segs = 8 + Math.floor(rnd() * 12);
    for (let j = 0; j < segs; j += 1) {
      pts.push({ x, y });
      a += (rnd() - 0.5) * 0.9;
      const step = 26 + rnd() * 46;
      x += Math.cos(a) * step;
      y += Math.sin(a) * step;
    }
    rilles.push(pts);
  }
  return { craters, rilles, blotches, sun: -2.3 }; // sun bearing (lit rim direction), matches the scene key light
}

let terrainFeatures: TerrainFeatures = generateTerrain('init');

// Paint the terrain into the ground canvas (called by repaintCanvas before the
// road, so the road always sits on top).
function paintTerrain(feat: TerrainFeatures): void {
  // Broad mare (dark) / highland (light) value patches to break up the flat fill.
  for (const b of feat.blotches) {
    const g = rctx.createRadialGradient(b.x * PX, b.y * PX, 0, b.x * PX, b.y * PX, b.r * PX);
    const rgb = b.light > 0 ? '38,50,72' : '5,8,15';
    g.addColorStop(0, `rgba(${rgb},${0.06 + Math.abs(b.light) * 0.16})`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    rctx.fillStyle = g;
    rctx.beginPath();
    rctx.arc(b.x * PX, b.y * PX, b.r * PX, 0, Math.PI * 2);
    rctx.fill();
  }
  // Rilles: thin dark meandering cracks.
  rctx.lineCap = 'round';
  rctx.lineJoin = 'round';
  for (const pts of feat.rilles) {
    rctx.strokeStyle = 'rgba(3,5,10,0.75)';
    rctx.lineWidth = 2.4 * PX;
    rctx.beginPath();
    rctx.moveTo(pts[0].x * PX, pts[0].y * PX);
    for (let i = 1; i < pts.length; i += 1) rctx.lineTo(pts[i].x * PX, pts[i].y * PX);
    rctx.stroke();
  }
  // Craters: a darker bowl, a shadow crescent on the far side, a faint lit rim
  // on the sun side -- enough shading to read as a depression on flat ground.
  for (const c of feat.craters) {
    const cx = c.x * PX;
    const cy = c.y * PX;
    const rp = c.r * PX;
    const bowl = rctx.createRadialGradient(cx, cy, rp * 0.1, cx, cy, rp);
    bowl.addColorStop(0, 'rgba(4,7,13,0.62)');
    bowl.addColorStop(0.7, 'rgba(7,11,19,0.34)');
    bowl.addColorStop(1, 'rgba(20,28,42,0)');
    rctx.fillStyle = bowl;
    rctx.beginPath();
    rctx.arc(cx, cy, rp, 0, Math.PI * 2);
    rctx.fill();
    // shadow crescent (far side, away from sun)
    rctx.lineWidth = rp * 0.2;
    rctx.strokeStyle = 'rgba(2,4,8,0.7)';
    rctx.beginPath();
    rctx.arc(cx, cy, rp * 0.86, feat.sun + 0.5, feat.sun + Math.PI * 2 - 0.5);
    rctx.stroke();
    // lit rim (sun side)
    rctx.lineWidth = rp * 0.14;
    rctx.strokeStyle = 'rgba(120,140,170,0.5)';
    rctx.beginPath();
    rctx.arc(cx, cy, rp * 0.95, feat.sun - 0.9, feat.sun + 0.9);
    rctx.stroke();
  }
}

// Displace the ground mesh so the painted features have real relief. Amplitude
// is biased DOWNWARD (craters/rilles/mare dip below the y=0 driving plane, only
// gentle rises), scaled by the relief knob, so the rover never visibly clips.
const GROUND_SEG_X = 150;
const GROUND_SEG_Z = 104;
function applyRelief(feat: TerrainFeatures): void {
  const geo = new THREE.PlaneGeometry(W, H, GROUND_SEG_X, GROUND_SEG_Z);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const relief = Math.max(0, terrainCfg.relief);
  for (let i = 0; i < pos.count; i += 1) {
    const sx = pos.getX(i) + W / 2; // sim x
    const sy = H / 2 - pos.getY(i); // sim y (see world<->plane mapping note)
    // Gentle rolling swell (a few offset sines), mostly shallow.
    let h = Math.sin(sx * 0.011 + 1.3) * 2.4 + Math.sin(sy * 0.013 - 0.7) * 2.2 + Math.sin((sx + sy) * 0.006) * 1.6;
    h -= 3; // bias the whole sheet a touch below the driving plane
    for (const c of feat.craters) {
      const d = Math.hypot(sx - c.x, sy - c.y);
      if (d < c.r) h -= Math.cos((d / c.r) * (Math.PI / 2)) * c.r * 0.16; // bowl
    }
    pos.setZ(i, Math.min(4, h) * relief); // local Z -> world Y after the -90deg X rotation
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  ground.geometry.dispose();
  ground.geometry = geo;
}

// Road paint: a CONTINUOUS round-capped stroke into the ground canvas -- not a
// chain of stamped circles. Round caps/joins bridge consecutive points into a
// smooth ribbon with no beading; the raster composite means overlaps (loops,
// re-drives) never flash. One teal pass on the lunar ground; the lane-gap rule
// keeps separate lanes apart, so the dark ground between them is the channel.
const ROAD_TEAL = '#37f2d8'; // neon teal so bloom picks it up
function strokeRoadSeg(ax: number, ay: number, bx: number, by: number): void {
  rctx.strokeStyle = ROAD_TEAL;
  rctx.lineWidth = road.halfWidth() * 2 * PX;
  rctx.lineCap = 'round';
  rctx.lineJoin = 'round';
  rctx.beginPath();
  rctx.moveTo(ax * PX, ay * PX);
  rctx.lineTo(bx * PX, by * PX);
  rctx.stroke();
  roadTexture.needsUpdate = true;
}

// Stroke the segment from the previous laid point to a newly laid one. A big
// jump means a skipped stretch (junction / lane-gap): don't bridge it, just cap
// a round end at the new point so the ribbon stays clean and separate.
function paintTrailPoint(added: TrailPoint): void {
  const prev = road.trail[road.trail.length - 2];
  const jump = road.halfWidth() * 3;
  if (!prev || Math.hypot(added.x - prev.x, added.y - prev.y) > jump) {
    strokeRoadSeg(added.x, added.y, added.x, added.y); // round dot cap
    return;
  }
  strokeRoadSeg(prev.x, prev.y, added.x, added.y);
}

// The slurp's visible cue is the 3D gold burst (spawnBurst); no permanent scar.
function paintSlurp(_ev: SlurpEvent): void {
  /* intentionally empty -- kept for call-site clarity; the burst is the cue */
}

// --- Seams + extraction, rebuilt per world (the layout regenerates on regen
// days), gold discs on the ground so the road never hides them. ---------------
const seamGroup = new THREE.Group();
scene.add(seamGroup);
const extractionGroup = new THREE.Group();
scene.add(extractionGroup);

// A soft radial-glow sprite (bright core -> transparent rim) shared by every
// seam disc. Additively blended + tinted, seams read as glowing ore pools that
// give the bloom a bright core to catch without flattening into solid plates.
function makeGlowTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d') as CanvasRenderingContext2D;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.35, 'rgba(255,255,255,0.75)');
  grad.addColorStop(0.7, 'rgba(255,255,255,0.22)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}
const seamGlowTexture = makeGlowTexture();

function clearGroup(group: THREE.Group): void {
  for (const child of group.children) {
    const mesh = child as THREE.Mesh;
    mesh.geometry.dispose();
    (mesh.material as THREE.Material).dispose();
  }
  group.clear();
}

function rebuildWorldMeshes(): void {
  clearGroup(seamGroup);
  for (const zone of state.fertileZones) {
    const r = Math.max(40, zone.radius * 1.05);
    const disc = new THREE.Mesh(
      new THREE.PlaneGeometry(r * 2, r * 2),
      new THREE.MeshBasicMaterial({
        map: seamGlowTexture,
        color: 0xffb340,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    disc.rotation.x = -Math.PI / 2;
    disc.position.set(zone.x - W / 2, 4, zone.y - H / 2);
    disc.userData.zoneId = zone.id;
    seamGroup.add(disc);
  }
  clearGroup(extractionGroup);
  if (state.arena.extraction) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(state.arena.extraction.radius - 4, state.arena.extraction.radius, 40),
      new THREE.MeshBasicMaterial({ color: 0x77f2ca, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(state.arena.extraction.x - W / 2, 4.5, state.arena.extraction.y - H / 2);
    extractionGroup.add(ring);
  }
}

// Clear the ground to the lunar base and stroke an inherited road trail as one
// continuous ribbon, breaking the path across skip-gaps so junctions stay clean.
function repaintCanvas(trail: TrailPoint[]): void {
  rctx.fillStyle = GROUND_BASE;
  rctx.fillRect(0, 0, roadCanvas.width, roadCanvas.height);
  paintTerrain(terrainFeatures); // features composite under the road
  if (trail.length > 0) {
    const jump = road.halfWidth() * 3;
    rctx.strokeStyle = ROAD_TEAL;
    rctx.lineWidth = road.halfWidth() * 2 * PX;
    rctx.lineCap = 'round';
    rctx.lineJoin = 'round';
    rctx.beginPath();
    rctx.moveTo(trail[0].x * PX, trail[0].y * PX);
    for (let i = 1; i < trail.length; i += 1) {
      const prev = trail[i - 1];
      const p = trail[i];
      if (Math.hypot(p.x - prev.x, p.y - prev.y) > jump) rctx.moveTo(p.x * PX, p.y * PX);
      else rctx.lineTo(p.x * PX, p.y * PX);
    }
    rctx.stroke();
  }
  roadTexture.needsUpdate = true;
}

// Install a freshly built world (start of day, next day, or new game): adopt the
// sim state, seed the road with the carried trail (so inherited road is drivable
// and painted), and rebuild the seam/extraction meshes for this layout.
function applyWorld(built: { state: ContinuousWorldState; trail: TrailPoint[] }): void {
  state = built.state;
  road.reset();
  road.trail.push(...built.trail);
  road.boost = 0;
  terrainFeatures = generateTerrain(state.seed); // this world's own terrain
  applyRelief(terrainFeatures);
  repaintCanvas(built.trail);
  rebuildWorldMeshes();
  runEnded = false;
}

// --- Rover --------------------------------------------------------------------
const rover = new THREE.Group();
const body = new THREE.Mesh(
  new THREE.BoxGeometry(40, 18, 54),
  new THREE.MeshStandardMaterial({ color: 0xd2a044, roughness: 0.7 })
);
body.position.y = 12;
rover.add(body);
const nose = new THREE.Mesh(
  new THREE.BoxGeometry(20, 12, 14),
  // Glowing cyan cab -- reads as a headlight and gives the rover a bloom accent.
  new THREE.MeshStandardMaterial({ color: 0x8fdcf5, emissive: 0x2fb6d6, emissiveIntensity: 1.1, roughness: 0.5 })
);
nose.position.set(0, 18, 22); // toward +Z (forward)
rover.add(nose);
scene.add(rover);

// --- Reclaim drone (a cyan flyer above the ground while committed) -----------
const drone = new THREE.Mesh(
  new THREE.OctahedronGeometry(12),
  new THREE.MeshStandardMaterial({ color: 0x78f7df, emissive: 0x1c6f5c, roughness: 0.4 })
);
drone.visible = false;
scene.add(drone);

// --- Transient 3D bursts (slurp, mining tick) --------------------------------
interface Burst { mesh: THREE.Mesh; born: number; ttl: number; grow: number }
const bursts: Burst[] = [];
function spawnBurst(x: number, y: number, color: number, r0: number, grow: number, ttl: number): void {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(r0, r0 + 4, 32),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(x - W / 2, 3, y - H / 2);
  scene.add(ring);
  bursts.push({ mesh: ring, born: performance.now(), ttl, grow });
}
function updateBursts(now: number): void {
  for (let i = bursts.length - 1; i >= 0; i -= 1) {
    const b = bursts[i];
    const p = (now - b.born) / b.ttl;
    if (p >= 1) {
      scene.remove(b.mesh);
      b.mesh.geometry.dispose();
      (b.mesh.material as THREE.Material).dispose();
      bursts.splice(i, 1);
      continue;
    }
    b.mesh.scale.setScalar(1 + p * b.grow);
    (b.mesh.material as THREE.MeshBasicMaterial).opacity = 0.9 * (1 - p);
  }
}

// --- Input --------------------------------------------------------------------
const keys = new Set<string>();
window.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) e.preventDefault();
  keys.add(k);
});
window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));

// --- Touch / pointer drive: drag anywhere = a virtual stick -------------------
const stickEl = document.getElementById('stick') as HTMLDivElement;
const knobEl = stickEl.querySelector('.knob') as HTMLDivElement;
const STICK_RADIUS = 66;
const touch = { active: false, id: -1, ox: 0, oy: 0, dx: 0, dy: 0 };
// All active pointers on the canvas, so a second finger switches from driving
// (one finger = the stick) to pinch-zoom (two fingers).
const pointers = new Map<number, { x: number; y: number }>();
let pinchPrev = 0;
const pinchDist = () => {
  const [a, b] = [...pointers.values()];
  return Math.hypot(a.x - b.x, a.y - b.y);
};
function stopDrive(): void {
  touch.active = false;
  touch.id = -1;
  touch.dx = 0;
  touch.dy = 0;
  stickEl.style.display = 'none';
}

function beginTouch(e: PointerEvent): void {
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pointers.size >= 2) {
    stopDrive(); // second finger -> pinch, not drive
    pinchPrev = pinchDist();
    return;
  }
  touch.active = true;
  touch.id = e.pointerId;
  touch.ox = e.clientX;
  touch.oy = e.clientY;
  touch.dx = 0;
  touch.dy = 0;
  stickEl.style.left = `${e.clientX}px`;
  stickEl.style.top = `${e.clientY}px`;
  stickEl.style.display = 'block';
  knobEl.style.transform = 'translate(0px, 0px)';
}
function moveTouch(e: PointerEvent): void {
  const pt = pointers.get(e.pointerId);
  if (pt) {
    pt.x = e.clientX;
    pt.y = e.clientY;
  }
  if (pointers.size >= 2) {
    const d = pinchDist();
    if (pinchPrev > 0 && d > 0) zoomBy(pinchPrev / d); // spread fingers -> zoom in
    pinchPrev = d;
    return;
  }
  if (!touch.active || e.pointerId !== touch.id) return;
  touch.dx = e.clientX - touch.ox;
  touch.dy = e.clientY - touch.oy;
  const kx = Math.max(-STICK_RADIUS, Math.min(STICK_RADIUS, touch.dx));
  const ky = Math.max(-STICK_RADIUS, Math.min(STICK_RADIUS, touch.dy));
  knobEl.style.transform = `translate(${kx}px, ${ky}px)`;
}
function endTouch(e: PointerEvent): void {
  pointers.delete(e.pointerId);
  if (pointers.size < 2) pinchPrev = 0;
  if (e.pointerId === touch.id) stopDrive();
}
renderer.domElement.addEventListener('pointerdown', beginTouch);
renderer.domElement.addEventListener('pointermove', moveTouch);
window.addEventListener('pointerup', endTouch);
window.addEventListener('pointercancel', endTouch);

function readInput(): ContinuousInput {
  const up = keys.has('w') || keys.has('arrowup');
  const down = keys.has('s') || keys.has('arrowdown');
  const left = keys.has('a') || keys.has('arrowleft');
  const right = keys.has('d') || keys.has('arrowright');
  let steer = 0;
  if (left) steer -= 1;
  if (right) steer += 1;
  let throttle = up ? 1 : 0;
  let reverse = down && !up;

  if (touch.active) {
    // Same grammar as the keyboard: push up to drive, pull down to reverse,
    // left/right to steer. A small deadzone so a resting thumb does nothing.
    const dead = STICK_RADIUS * 0.2;
    const span = STICK_RADIUS - dead;
    const sx = Math.max(-1, Math.min(1, touch.dx / STICK_RADIUS));
    if (Math.abs(touch.dx) > dead) steer = sx;
    const forward = Math.max(0, (-touch.dy - dead) / span);
    const back = Math.max(0, (touch.dy - dead) / span);
    if (forward > 0) throttle = Math.min(1, forward);
    reverse = back > 0 && forward === 0;
  }

  const driveIntent = throttle > 0;
  return {
    steer,
    throttle,
    reverseIntent: reverse && !driveIntent,
    driveIntent,
    pivotIntent: !driveIntent && !reverse && steer !== 0
  };
}

// --- Camera follow ------------------------------------------------------------
const camPos = new THREE.Vector3(0, 220, 320);
const camLook = new THREE.Vector3();
function updateCamera(dt: number): void {
  const rx = state.rover.x - W / 2;
  const rz = state.rover.y - H / 2;
  const k = 1 - Math.pow(0.001, dt); // smooth follow
  let target: THREE.Vector3;
  let look: THREE.Vector3;
  if (camCfg.overhead) {
    // Top-down, north-up (does not spin with the rover). Distance drives how
    // high; a hair of Z so lookAt has a stable up vector.
    target = new THREE.Vector3(rx, camCfg.height + camCfg.dist, rz + 0.001);
    look = new THREE.Vector3(rx, 0, rz);
  } else {
    const fx = Math.cos(state.rover.heading);
    const fz = Math.sin(state.rover.heading);
    target = new THREE.Vector3(rx - fx * camCfg.dist, camCfg.height, rz - fz * camCfg.dist);
    look = new THREE.Vector3(rx + fx * 120, 8, rz + fz * 120);
  }
  camPos.lerp(target, k);
  camera.position.copy(camPos);
  camLook.lerp(look, k);
  camera.lookAt(camLook);
  if (camera.fov !== camCfg.fov) {
    camera.fov = camCfg.fov;
    camera.updateProjectionMatrix();
  }
}

// Zoom: wheel (desktop) and pinch (mobile) scale the camera distance+height.
function zoomBy(factor: number): void {
  camCfg.dist = Math.max(80, Math.min(520, camCfg.dist * factor));
  camCfg.height = Math.max(60, Math.min(520, camCfg.height * factor));
  saveConfig();
}
renderer.domElement.addEventListener(
  'wheel',
  (e) => {
    e.preventDefault();
    zoomBy(e.deltaY > 0 ? 1.08 : 0.925);
  },
  { passive: false }
);

// --- HUD ----------------------------------------------------------------------
const el = (id: string) => document.getElementById(id) as HTMLElement;
const hud = {
  nano: el('hud-nano'), nanoBar: el('hud-nano-bar'),
  ore: el('hud-ore'), oreBar: el('hud-ore-bar'),
  sun: el('hud-sun'), sunBar: el('hud-sun-bar'),
  day: el('hud-day'), mode: el('hud-mode'), line: el('line'),
  banner: el('banner'), bannerTitle: el('banner-title'), bannerBody: el('banner-body')
};
const MODE_LABEL: Record<string, string> = { fabricating: 'Building', prepared: 'Prepared', crawl: 'Crawl' };

function updateHud(): void {
  const quota = state.arena.extraction?.oreRequired ?? state.targetOre;
  hud.nano.textContent = `${state.nanobots.toFixed(1)}/${state.maxNanobots}`;
  hud.nanoBar.style.width = `${Math.min(100, (state.nanobots / state.maxNanobots) * 100)}%`;
  hud.nanoBar.style.background = state.nanobots / state.maxNanobots < 0.18 ? '#ff765f' : '#78f7df';
  hud.ore.textContent = `${state.rover.ore.toFixed(1)}/${quota}`;
  hud.oreBar.style.width = `${Math.min(100, (state.rover.ore / Math.max(1, quota)) * 100)}%`;
  hud.sun.textContent = `${Math.ceil(state.solarSeconds)}s`;
  hud.sunBar.style.width = `${Math.min(100, (state.solarSeconds / Math.max(1, state.solarWindowSeconds)) * 100)}%`;
  hud.sunBar.style.background = state.solarSeconds / state.solarWindowSeconds < 0.25 ? '#ffb066' : '#8fb2ff';
  hud.day.textContent = `D${campaign.dayInShiftOf()}/${campaign.config.daysPerShift} · S${campaign.shiftOfDay()}/${campaign.config.shiftsPerGame}`;
  const onRoad = road.isOnLaidRoad(state);
  hud.mode.textContent = state.arms.mining > 0
    ? 'Mining'
    : state.speedState === 'crawl'
      ? 'Crawl'
      : onRoad && road.boost > 0.5
        ? (road.slurpArmed() ? 'Rail ⚡' : 'Rail') // ⚡ = slurp charged and armed
        : (MODE_LABEL[state.speedState] ?? state.speedState);
  const flashing = flash && performance.now() < flash.until;
  hud.line.textContent = flashing ? flash!.text : state.phase === 'playing' ? getContinuousGuidance(state).objective : '';
  launchBtn.disabled = state.phase !== 'playing' || state.drone.status !== 'ready';
}

const cta = hud.banner.querySelector('.cta') as HTMLElement;
function showBanner(): void {
  const won = state.phase === 'won';
  const finale = campaign.gameComplete();
  hud.banner.className = won ? 'win' : 'lose';
  hud.banner.style.display = 'flex';
  hud.bannerTitle.textContent = finale ? 'GAME OVER' : won ? 'EXTRACTION REACHED' : 'RUN OVER';
  hud.bannerBody.textContent = `${state.message}  ·  ${campaign.bankedOre.toFixed(0)} ore banked`;
  cta.textContent = finale ? 'Tap for a new game' : 'Tap for the next day';
}

function onContinue(): void {
  if (state.phase === 'playing') return;
  campaign.advance();
  applyWorld(campaign.buildWorld());
  hud.banner.style.display = 'none';
}
window.addEventListener('keydown', (e) => { if (e.key.toLowerCase() === 'r') onContinue(); });
hud.banner.addEventListener('pointerdown', onContinue);

// --- Drone launch + transient message flash ----------------------------------
let flash: { text: string; until: number } | null = null;
const launchBtn = document.getElementById('launch') as HTMLButtonElement;
function launch(): void {
  if (state.phase !== 'playing') return;
  const res = launchReclaimDrone(state);
  state = res.state;
  flash = { text: res.message, until: performance.now() + 2000 };
}
launchBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); launch(); });
window.addEventListener('keydown', (e) => { if (e.key === ' ') { e.preventDefault(); launch(); } });

// --- Loop ---------------------------------------------------------------------
let last = performance.now();

function frame(now: number): void {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;

  // Build the input: base drive + the road's carry/boost/onRoad (the lock),
  // exactly what the sim expects, so the 3D drive feels like the tuned game.
  const base = readInput();
  const reversing = Boolean(base.reverseIntent);
  const input: ContinuousInput = reversing
    ? base
    : { ...base, assistSteer: road.carrySteer(state), roadRunway: road.boost, onRoad: road.isOnLaidRoad(state) };

  state = tickContinuousWorld(state, input, dt);

  // Lay the road by the sim's own rules and paint what was laid.
  const added = road.sample(state);
  if (added) paintTrailPoint(added);
  const onRoadNow = road.isOnLaidRoad(state);
  road.updateBoost(dt, onRoadNow);
  // Slurp charge: only builds while genuinely at rail top speed on road, so the
  // slurp is earned by a sustained run and can't grab the pool you're sitting on.
  road.updateCharge(dt, onRoadNow && state.rover.speed >= state.tuning.railSpeed * 0.9);
  const slurped = road.slurp(state);
  if (slurped) {
    paintSlurp(slurped);
    spawnBurst(slurped.x, slurped.y, 0xffe66a, 20, 6, 700); // gold rail-slurp burst
  }

  // Mining: while parked and extracting, pulse the seam under the rover so the
  // stop-to-mine read is unmistakable (the sim ticks the ore up; this shows it).
  const miningZone = state.arms.mining > 0 ? findFertileZoneAt(state, state.rover) : undefined;
  const pulse = 0.5 + Math.sin(now / 140) * 0.5;
  for (const child of seamGroup.children) {
    const disc = child as THREE.Mesh;
    const zone = state.fertileZones.find((z) => z.id === disc.userData.zoneId);
    disc.visible = !!zone && zone.remaining > 0.01;
    const mat = disc.material as THREE.MeshBasicMaterial;
    const isMining = !!miningZone && zone?.id === miningZone.id;
    mat.opacity = isMining ? 0.7 + pulse * 0.55 : 0.9;
    disc.scale.setScalar(isMining ? 1 + pulse * 0.14 : 1);
  }

  // Drone flies above the ground while committed.
  drone.visible = state.drone.status !== 'ready';
  if (drone.visible) {
    drone.position.set(state.drone.x - W / 2, 60, state.drone.y - H / 2);
    drone.rotation.y += dt * 3;
  }
  updateBursts(now);

  rover.position.set(state.rover.x - W / 2, 0, state.rover.y - H / 2);
  rover.rotation.y = -state.rover.heading + Math.PI / 2; // +Z is the model's nose

  // Run just ended: bank + compute carry once, then show the result banner.
  if (state.phase !== 'playing' && !runEnded) {
    runEnded = true;
    campaign.endRun(state, road.trail);
    showBanner();
  }

  updateHud();

  updateCamera(dt);
  stars.rotation.y += dt * 0.005; // a barely-there drift so the dark feels alive
  composer.render();
  requestAnimationFrame(frame);
}

// Apply a sim-tuning change from the panel: to the live world now, and to the
// campaign overrides so it persists into future days.
function applyTuning(patch: Partial<ContinuousTuning>): void {
  campaign.tuningOverrides = { ...campaign.tuningOverrides, ...patch };
  state.tuning = resolveContinuousTuning({ ...state.tuning, ...patch });
  state.maxNanobots = state.tuning.maxNanobots;
  state.nanobots = Math.min(state.nanobots, state.maxNanobots);
  state.solarWindowSeconds = state.arena.solarWindowSeconds ?? state.tuning.startingSolarSeconds;
  state.solarSeconds = Math.min(state.solarSeconds, state.solarWindowSeconds);
}

// Install the first day's world, mount the control panel, then start the loop.
applyWorld(campaign.buildWorld());
// Terrain-knob change: regenerate this world's features and redraw the ground
// (relief + painted craters), keeping the current road trail.
function applyTerrain(): void {
  terrainFeatures = generateTerrain(state.seed);
  applyRelief(terrainFeatures);
  repaintCanvas(road.trail);
}
createPanel({
  campaign,
  road,
  cam: camCfg,
  terrain: terrainCfg,
  getState: () => state,
  applyTuning,
  rebuildDay: () => applyWorld(campaign.buildWorld()),
  newGame: () => { campaign.newGame(); applyWorld(campaign.buildWorld()); },
  applyTerrain,
  save: saveConfig
});
requestAnimationFrame(frame);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  bloom.setSize(window.innerWidth, window.innerHeight);
});

// Expose for headless verification.
(window as unknown as { __mm3d?: unknown }).__mm3d = {
  getState: () => state,
  road,
  keys
};
