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
  addRailStock,
  applyRailCapacity,
  type ContinuousInput,
  type ContinuousTuning,
  type ContinuousWorldState,
  type Vec2
} from '../game/continuous';
import { RoadModel, DEFAULT_ROAD_CONFIG, type RoadConfig, type RoadEdge, type RoadEdgeQuad, type RoadReclaimPlan, type SlurpEvent } from './road';
import { Campaign, DEFAULT_LOOP_CONFIG, type LoopConfig } from './loop';
import { pushOutOfCraters } from './craters';
import { START_BEARING, sunState } from './sun';
import { createPanel, DEFAULT_CAMERA_CONFIG, DEFAULT_CONTROLS_CONFIG, DEFAULT_TERRAIN_CONFIG, type CameraConfig, type ControlsConfig, type TerrainConfig } from './panel';
import { stickToInput } from './stick';
import { LEVELS, levelSpec } from '../game/level';

// --- Persisted config (loop + road + sim-tuning overrides + camera + look + controls)
const CONFIG_KEY = 'mm3d-config-v1';
function loadConfig(): { loop: LoopConfig; road: RoadConfig; tuning: Partial<ContinuousTuning>; cam: CameraConfig; terrain: TerrainConfig; controls: ControlsConfig } {
  try {
    const raw = window.localStorage.getItem(CONFIG_KEY);
    const p = raw ? JSON.parse(raw) : {};
    return {
      loop: { ...DEFAULT_LOOP_CONFIG, ...(p.loop ?? {}) },
      road: { ...DEFAULT_ROAD_CONFIG, ...(p.road ?? {}) },
      tuning: p.tuning ?? {},
      cam: { ...DEFAULT_CAMERA_CONFIG, ...(p.cam ?? {}) },
      terrain: { ...DEFAULT_TERRAIN_CONFIG, ...(p.terrain ?? {}) },
      controls: { ...DEFAULT_CONTROLS_CONFIG, ...(p.controls ?? {}) }
    };
  } catch {
    return { loop: { ...DEFAULT_LOOP_CONFIG }, road: { ...DEFAULT_ROAD_CONFIG }, tuning: {}, cam: { ...DEFAULT_CAMERA_CONFIG }, terrain: { ...DEFAULT_TERRAIN_CONFIG }, controls: { ...DEFAULT_CONTROLS_CONFIG } };
  }
}
const savedConfig = loadConfig();
const camCfg = savedConfig.cam;
const terrainCfg = savedConfig.terrain;
const controlsCfg: ControlsConfig = savedConfig.controls;
function saveConfig(): void {
  try {
    window.localStorage.setItem(CONFIG_KEY, JSON.stringify({ loop: campaign.config, road: road.config, tuning: campaign.tuningOverrides, cam: camCfg, terrain: terrainCfg, controls: controlsCfg }));
  } catch {
    /* storage may be unavailable */
  }
}

// --- World <-> scene mapping -------------------------------------------------
// Sim world is x in [0,W], y in [0,H] (top-down). We lay it on the XZ ground
// plane centred at the origin: X = x - W/2, Z = y - H/2, Y is up. W/H are ADOPTED
// from the sim's state.width/height in applyWorld, so a bigger Level size (which
// scales the sim world) enlarges the ground, canvas, meshes and camera to match.
let W = 1040;
let H = 720;
const PX = 1.5; // road-canvas pixels per world unit (density at Level size 1)
// The whole road canvas is re-uploaded to the GPU whenever road is laid. Two
// levers keep that from either (a) blurring the road or (b) dropping frames:
//  - paintPX holds full density (PX) until the world is big enough that W*PX or
//    H*PX would exceed CANVAS_BUDGET, then eases down. The budget is generous
//    (crisp road through ~2.6x Level size) but capped under the WebGL texture
//    limit; only a very big moon softens.
//  - the upload itself is THROTTLED (roadDirty + ROAD_FLUSH_MS below): strokes
//    draw to the 2D canvas every frame, but the GPU re-upload fires at most
//    ~30x/s, so a bigger canvas no longer jitters while laying.
const CANVAS_BUDGET = 2600; // max canvas px per side (crisp road, under the 4096 WebGL cap)
let paintPX = PX;
let roadDirty = false; // a stroke changed the canvas since the last GPU upload
let lastRoadFlush = 0; // performance.now() of the last upload
const ROAD_FLUSH_MS = 33; // throttle road-texture uploads to ~30/s (coalesce strokes)
const GROUND_BASE = '#0e1520'; // dark lunar ground so the neon road/seams carry the light

// The road: the driven trail + carry (lock) + rail boost + slurp, ported from
// the tuned game (engine-agnostic). It decides where the road goes and what to
// feed back into the sim; the canvas below paints what it lays.
const road = new RoadModel(savedConfig.road);

// --- Sim + campaign (day / shift / game loop, economy, carried road) ---------
const campaign = new Campaign(savedConfig.loop);
// The 3D app opts the drone into its repurposed role (the sim defaults preserve
// the classic behaviour for tests). Saved values win, so panel tweaks persist.
const APP_TUNING: Partial<ContinuousTuning> = {
  reclaimProtectLoop: true, // never cut the loop
  droneTetherRange: 560, // keep a line home
  reclaimAimBias: 3, // your facing aims the drone
  ribbonEconomy: true, // build cost + rail key off the ribbon you see, not hidden fields
  trackSpine: true, // no off-road: out of stock => emergency (cannibalise your own rail)
  // WS3 background rail growth, independent of ore: a flat trickle while mining
  // + per slurp, and a slow ceiling climb that carries across days (the quiet
  // escalation -- reach grows while you're busy plotting the next route).
  railTricklePerSecond: 0.3,
  railTricklePerSlurp: 2,
  railCapacityGrowthPerMinute: 3,
  railCapacityMax: 72,
  // Pace so the loop is completable/legible: move at a real clip on bare ground
  // and give a learnable day length (the arena's fixed 36s "last light" is
  // brutal). Both are panel knobs; these are just gentler defaults.
  fabricatingSpeed: 130,
  startingSolarSeconds: 75
};
campaign.tuningOverrides = { ...APP_TUNING, ...savedConfig.tuning };
let state!: ContinuousWorldState;
let runEnded = false; // guards the once-per-run bank/persist
// Bonus (mastery acknowledgement, never the win): distance ridden on cured rail
// at speed with no steering input -- the zero-steer slide -- plus surplus ore
// over quota, scored at extraction.
let slideDistance = 0;
const SLIDE_PER_POINT = 50; // rail units per bonus point
const SURPLUS_ORE_POINTS = 5; // bonus points per ore over quota
function surplusOre(): number {
  const quota = state.arena.extraction?.oreRequired ?? state.targetOre;
  return Math.max(0, state.rover.ore - quota);
}
function bonusScore(): number {
  return slideDistance / SLIDE_PER_POINT + surplusOre() * SURPLUS_ORE_POINTS;
}

// --- Renderer / scene / camera ----------------------------------------------
const mount = document.getElementById('app3d') as HTMLDivElement;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
// Real cast shadows: the single strongest read of "the sun is moving".
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
mount.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x03040a);
// Deep-space haze: things fade into the dark instead of ending on a hard edge.
scene.fog = new THREE.Fog(0x03040a, 520, 1500); // fades to the black sky (airless moon); near/far set per world by fitVista

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 4000);

// Moody key + a cool rim from behind, low ambient so the dark reads as dark and
// the neon road/seams carry the light.
const ambient = new THREE.AmbientLight(0x2a3550, 0.5);
scene.add(ambient);
const sun = new THREE.DirectionalLight(0xbfd0ff, 0.7);
sun.position.set(-300, 500, -260);
// The sun casts; its shadow box follows the rover so the map size doesn't cost
// shadow resolution (a world-sized box would be a smear at Level size 4).
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.normalBias = 0.6; // the ground is displaced relief; keeps it from shadowing itself in stripes
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 3000;
const SHADOW_HALF = 520; // world units either side of the rover
sun.shadow.camera.left = -SHADOW_HALF;
sun.shadow.camera.right = SHADOW_HALF;
sun.shadow.camera.top = SHADOW_HALF;
sun.shadow.camera.bottom = -SHADOW_HALF;
sun.shadow.bias = -0.002;
scene.add(sun);
scene.add(sun.target);
const rim = new THREE.DirectionalLight(0x7fe9ff, 0.9);
// Low, from behind: it edges the rover and drone, but stays near-grazing on the
// ground so its constant light doesn't wash out the day/night change there.
rim.position.set(220, 60, 420);
scene.add(rim);

// --- Sun / time of day -------------------------------------------------------
// The solar window IS the day: as it drains the sun swings down toward the
// horizon and warms, shadows stretch, and the light dims. You can read how long
// you have left off the ground without looking at the HUD -- which is the whole
// point of a "get home before sunset" run.
const DAY_COLOR = new THREE.Color(0xbfd0ff); // cold high-sun white
const DUSK_COLOR = new THREE.Color(0xff9a54); // low-sun amber
const AMBIENT_DAY = new THREE.Color(0x2a3550);
const AMBIENT_DUSK = new THREE.Color(0x1a1526);
// sunState() gives a 0..1-ish intensity curve; terrainCfg.sunGain ("Sun
// intensity", 3 by default) scales it so sunlight reads on the dark painted
// ground (see the ground material below).
// How the moon surface answers light -- shared by the playfield AND the vista
// skirt, so they always match and the arena's edge never shows (a tint or
// material on one but not the other is exactly what draws that seam):
//   - SURFACE_FILL: the painted surface glows at this fraction on its own. At 1
//     that's exactly the original dark-moon look: what you see in shadow and
//     after sunset, and the road's steady glow.
//   - terrainCfg.daylight ("Daylight strength"): how strongly the sun lights the
//     terrain on top of that. Bright at first light, fading to the dark moon by
//     sunset -- the ground itself tells the time.
const SURFACE_FILL = 1;
let paintedSunBearing = START_BEARING; // bearing the ground canvas was painted at

// The sun itself, in the sky: a glowing disk that sits along the light's real
// direction and sinks toward the horizon as the day drains, warming as it goes.
// Kept at a fixed far distance from the camera so it behaves like it's at
// infinity (no parallax as you drive). Visible whenever the horizon is in view.
const SUN_DISK_DIST = 3200;
const sunDisk = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g2 = c.getContext('2d') as CanvasRenderingContext2D;
  const grad = g2.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.18, 'rgba(255,255,255,1)');
  grad.addColorStop(0.3, 'rgba(255,255,255,0.35)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g2.fillStyle = grad;
  g2.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, transparent: true });
  const s = new THREE.Sprite(mat);
  s.scale.setScalar(420);
  return s;
})();
scene.add(sunDisk);
const sunDir = new THREE.Vector3();

// t = 0 at first light, 1 at sunset.
function updateSun(t: number): void {
  const sky = sunState(t, { startElev: terrainCfg.sunHigh, endElev: terrainCfg.sunLow, sweep: terrainCfg.sunSweep });
  const rx = state.rover.x - W / 2;
  const rz = state.rover.y - H / 2;
  // Keep the light (and so its shadow box) over the rover: the box is small for
  // resolution, so a fixed world-centre sun would drop shadows entirely far out.
  sun.position.set(rx + sky.offset.x, sky.offset.y, rz + sky.offset.z);
  sun.target.position.set(rx, 0, rz);
  sun.target.updateMatrixWorld();
  // Dusk: warmer and dimmer, with the ambient falling faster so the dark closes in.
  sun.color.copy(DAY_COLOR).lerp(DUSK_COLOR, sky.dusk);
  sun.intensity = sky.intensity * Math.max(0, terrainCfg.sunGain);
  // The visible sun: along the light's direction, far from the camera, warming
  // and dimming with the day.
  sunDir.set(sky.offset.x, sky.offset.y, sky.offset.z).normalize();
  sunDisk.position.copy(camera.position).addScaledVector(sunDir, SUN_DISK_DIST);
  sunDisk.material.color.copy(DAY_COLOR).lerp(DUSK_COLOR, sky.dusk).multiplyScalar(0.6 + 0.8 * sky.intensity);
  ambient.color.copy(AMBIENT_DAY).lerp(AMBIENT_DUSK, sky.dusk);
  ambient.intensity = sky.ambientIntensity * Math.max(0, terrainCfg.ambient);
  // No sky tint: the moon has no atmosphere, so the sky stays black all day.
  // The day/dusk read comes from the sun itself on the ground and skirt alike.
  // The painted crater/rille shading is lit from the same bearing. Repaint only
  // when it has moved enough to see (the canvas upload is the expensive part).
  if (Math.abs(sky.bearing - paintedSunBearing) > 0.12) {
    paintedSunBearing = sky.bearing;
    terrainFeatures = { ...terrainFeatures, sun: sky.bearing };
    repaintCanvas(road.edgesForPaint());
  }
}

function sunDayFraction(): number {
  const win = Math.max(1, state.solarWindowSeconds);
  return 1 - Math.max(0, Math.min(1, state.solarSeconds / win));
}

// --- Starfield backdrop ------------------------------------------------------
// A dome that rides with the camera, so the stars behave as if at infinity:
// no parallax, and always ABOVE the horizon. They used to sit at fixed world
// points only ~120 units up, so a camera raised (zoomed out, overhead view) or
// looking across the far plain saw them below eye level -- scattered across the
// ground like they were on the surface. The dome radius stays inside the
// camera's far plane (fitVista floors it at 6000).
const STAR_DOME = 3000;
const STAR_MIN_ELEV = 0.035; // ~2 degrees: clear of the horizon line and any relief near it
const STAR_COLOR = new THREE.Color(0x9fb6d8);
const starGeo = new THREE.BufferGeometry();
const starN = 900;
const starPos = new Float32Array(starN * 3);
for (let i = 0; i < starN; i += 1) {
  // Uniform over the sky above STAR_MIN_ELEV (uniform in sin(elevation)).
  const lo = Math.sin(STAR_MIN_ELEV);
  const el = Math.asin(lo + Math.random() * (1 - lo));
  const th = Math.random() * Math.PI * 2;
  starPos[i * 3] = STAR_DOME * Math.cos(el) * Math.cos(th);
  starPos[i * 3 + 1] = STAR_DOME * Math.sin(el);
  starPos[i * 3 + 2] = STAR_DOME * Math.cos(el) * Math.sin(th);
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
const starMat = new THREE.PointsMaterial({ color: STAR_COLOR, size: 3, sizeAttenuation: false, fog: false, depthWrite: false });
const stars = new THREE.Points(starGeo, starMat);
stars.frustumCulled = false; // it's re-centred on the camera every frame
stars.renderOrder = -1; // behind everything it shares pixels with
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
roadCanvas.width = Math.round(W * paintPX);
roadCanvas.height = Math.round(H * paintPX);
const rctx = roadCanvas.getContext('2d') as CanvasRenderingContext2D;
// Base lunar ground fill; the road is painted on top of this same canvas.
rctx.fillStyle = GROUND_BASE;
rctx.fillRect(0, 0, roadCanvas.width, roadCanvas.height);
const roadTexture = new THREE.CanvasTexture(roadCanvas);
roadTexture.colorSpace = THREE.SRGBColorSpace;
// Terrain-only canvas: the same base + craters/mare/rilles, but NO road. This
// is what the sun lights, so daylight can be strong enough to read without ever
// touching the road's glow. Half the road canvas's density -- it's broad terrain
// shading, and it's only repainted with the terrain (world build, sun bearing).
const TERRAIN_PX_SCALE = 0.5;
const terrainCanvas = document.createElement('canvas');
terrainCanvas.width = Math.max(1, Math.round(W * paintPX * TERRAIN_PX_SCALE));
terrainCanvas.height = Math.max(1, Math.round(H * paintPX * TERRAIN_PX_SCALE));
const tctx = terrainCanvas.getContext('2d') as CanvasRenderingContext2D;
tctx.fillStyle = GROUND_BASE;
tctx.fillRect(0, 0, terrainCanvas.width, terrainCanvas.height);
const terrainTexture = new THREE.CanvasTexture(terrainCanvas);
terrainTexture.colorSpace = THREE.SRGBColorSpace;

// The ground is two layers of the same painted world (see SURFACE_FILL):
//   - emissive: the full road canvas (terrain + road) glowing at SURFACE_FILL.
//     This is the original moon look, and the road's steady glow.
//   - diffuse: the terrain-only canvas, lit by the sun at the Daylight strength.
//     Sunlight brightens the craters/mare and their shadows fall on them, but it
//     never reaches the road, so the road can't blow out at midday.
// Receives shadows directly.
const groundMat = new THREE.MeshLambertMaterial({
  map: terrainTexture,
  color: new THREE.Color().setScalar(terrainCfg.daylight),
  emissiveMap: roadTexture,
  emissive: 0xffffff,
  emissiveIntensity: SURFACE_FILL
});
const ground = new THREE.Mesh(new THREE.PlaneGeometry(W, H), groundMat);
ground.rotation.x = -Math.PI / 2; // lie flat on XZ
ground.receiveShadow = true;
scene.add(ground);

// --- Moon vista: sell scale WITHOUT a bigger playfield ------------------------
// The playfield is a finite textured plane; without this you SEE it end into
// black, which reads as a cramped arena. A large dark ground "skirt" ring
// extends the surface far past the playfield so it recedes into fog instead of
// ending on a hard edge, and a distant Earth gives the eye a real scale anchor.
// Both are cheap static meshes; fitVista() sizes the ring + fog depth per world
// so the playfield stays clear while its edge melts into the horizon.
const skirt = new THREE.Mesh(
  new THREE.RingGeometry(500, 12000, 96),
  // The SAME surface as the playfield ground -- same base tone AND the same
  // response to the sun (SURFACE_FILL + Daylight strength on GROUND_BASE) -- so it
  // reads as one continuous surface to the horizon at every time of day, not a
  // separate island. If the ground's lighting changes, this must change with it.
  new THREE.MeshLambertMaterial({
    color: new THREE.Color(GROUND_BASE).multiplyScalar(terrainCfg.daylight),
    emissive: new THREE.Color(GROUND_BASE),
    emissiveIntensity: SURFACE_FILL,
    side: THREE.DoubleSide
  })
);
const skirtMat = skirt.material as THREE.MeshLambertMaterial;
skirt.rotation.x = -Math.PI / 2;
skirt.position.y = -0.3; // just under the play ground; its inner edge underlaps so there's no seam
scene.add(skirt);

// Earth hanging in the black -- the single strongest "you are on the moon" cue,
// and a fixed far landmark that anchors scale as you drive.
const earth = new THREE.Mesh(
  new THREE.SphereGeometry(340, 40, 40),
  new THREE.MeshStandardMaterial({ color: 0x2b5c96, emissive: 0x1b3f66, emissiveIntensity: 1.15, roughness: 0.85, metalness: 0 })
);
earth.material.fog = false; // a celestial body doesn't sit in the ground haze
earth.position.set(-1500, 1200, -3200); // far, high, off to one side (dist ~3700, inside the far plane at every scale)
scene.add(earth);

// Size the skirt, fog fade AND camera far-plane to the current world, so the
// ground fully fades to the black sky BEFORE the far plane would clip it (no
// hard clip circle) and the playfield stays clear. Called at init + every
// rebuild.
function fitVista(): void {
  const span = Math.max(W, H);
  const inner = Math.min(W, H) * 0.42; // underlap the nearest play edge
  const outer = Math.max(12000, span * 6);
  skirt.geometry.dispose();
  skirt.geometry = new THREE.RingGeometry(inner, outer, 96);
  // Far plane grows with the world (floor keeps the Earth + stars in view).
  camera.far = Math.max(6000, span * 3.4);
  camera.updateProjectionMatrix();
  if (scene.fog instanceof THREE.Fog) {
    scene.fog.near = span * 1.3; // ground fully solid across the playfield and well beyond
    scene.fog.far = camera.far * 0.92; // fully black by just inside the far plane -> a clean distant horizon
  }
}
fitVista();

// --- Terrain features (craters, rilles, mare blotches, relief) ----------------
// The field was an empty dark sheet. This gives it actual lunar features: a
// seeded set of craters, hairline rilles, and broad mare/highland value patches
// painted into the ground canvas (so they composite UNDER the road, guaranteed
// aligned), plus an optional low-amplitude displacement of the ground mesh so
// the same features read with real parallax against the fog. All seeded per
// world, so each map's terrain is its own and regenerates on regen / New Game.
interface Crater { x: number; y: number; r: number; block: boolean } // block = a wall you drive around
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

// Places blocking craters must stay clear of: home/extraction and every ore
// pool (plus a margin), so a crater never walls off the base or a seam.
interface KeepOut { x: number; y: number; r: number }
function keepOutsFor(st: ContinuousWorldState | undefined): KeepOut[] {
  if (!st) return [];
  const out: KeepOut[] = [{ x: st.arena.start.x, y: st.arena.start.y, r: 160 }];
  if (st.arena.extraction) out.push({ x: st.arena.extraction.x, y: st.arena.extraction.y, r: st.arena.extraction.radius + 140 });
  for (const z of st.fertileZones) out.push({ x: z.x, y: z.y, r: z.radius + 70 });
  return out;
}

function generateTerrain(seed: string, keepOuts: KeepOut[] = []): TerrainFeatures {
  const rnd = mulberry32(hashSeed(`${seed}:terrain-v1`));
  const density = Math.max(0, terrainCfg.craterDensity);
  const craterSize = Math.max(0, terrainCfg.craterSize ?? 1);
  const craterSpread = Math.max(0, terrainCfg.craterSpread ?? 1);
  const blockMin = terrainCfg.craterBlockSize ?? DEFAULT_TERRAIN_CONFIG.craterBlockSize;
  const craters: Crater[] = [];
  // Count scales with the world's AREA (vs the original 1040x720 slab), so a
  // bigger moon is as cratered as a small one instead of emptier.
  const areaScale = Math.max(0.25, (W * H) / (1040 * 720));
  const nC = Math.round((10 + rnd() * 10) * density * areaScale);
  for (let i = 0; i < nC; i += 1) {
    // Spread scatters craters out from the map centre: at 1 this is exactly the
    // old uniform [0,W]x[0,H]; <1 clusters mid-map, >1 pushes to the edges (clamped).
    const pick = () => ({
      x: Math.max(0, Math.min(W, W / 2 + (rnd() - 0.5) * W * craterSpread)),
      y: Math.max(0, Math.min(H, H / 2 + (rnd() - 0.5) * H * craterSpread))
    });
    let { x: cx, y: cy } = pick();
    const r = (14 + rnd() * rnd() * 84) * craterSize; // rnd^2 => many small, few big
    const block = r >= blockMin;
    // A blocking crater re-rolls its spot (a few tries) off home and the pools;
    // if it can't find one it stays as harmless decoration there instead.
    let clear = !block || keepOuts.every((k) => Math.hypot(cx - k.x, cy - k.y) > k.r + r);
    for (let tries = 0; !clear && tries < 8; tries += 1) {
      ({ x: cx, y: cy } = pick());
      clear = keepOuts.every((k) => Math.hypot(cx - k.x, cy - k.y) > k.r + r);
    }
    craters.push({ x: cx, y: cy, r, block: block && clear });
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

function resolveCraterCollision(): boolean {
  return pushOutOfCraters(state.rover, terrainFeatures.craters);
}

// Paint the terrain features into a canvas: the road canvas (under the road, as
// the emissive layer) and the terrain-only canvas (what the sun lights).
function paintTerrain(feat: TerrainFeatures, c2d: CanvasRenderingContext2D = rctx, px: number = paintPX): void {
  // Broad mare (dark) / highland (light) value patches to break up the flat fill.
  for (const b of feat.blotches) {
    const g = c2d.createRadialGradient(b.x * px, b.y * px, 0, b.x * px, b.y * px, b.r * px);
    const rgb = b.light > 0 ? '38,50,72' : '5,8,15';
    g.addColorStop(0, `rgba(${rgb},${0.06 + Math.abs(b.light) * 0.16})`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    c2d.fillStyle = g;
    c2d.beginPath();
    c2d.arc(b.x * px, b.y * px, b.r * px, 0, Math.PI * 2);
    c2d.fill();
  }
  // Rilles: thin dark meandering cracks.
  c2d.lineCap = 'round';
  c2d.lineJoin = 'round';
  for (const pts of feat.rilles) {
    c2d.strokeStyle = 'rgba(3,5,10,0.75)';
    c2d.lineWidth = 2.4 * px;
    c2d.beginPath();
    c2d.moveTo(pts[0].x * px, pts[0].y * px);
    for (let i = 1; i < pts.length; i += 1) c2d.lineTo(pts[i].x * px, pts[i].y * px);
    c2d.stroke();
  }
  // Craters: a darker bowl, a shadow crescent on the far side, a faint lit rim
  // on the sun side -- enough shading to read as a depression on flat ground.
  for (const c of feat.craters) {
    const cx = c.x * px;
    const cy = c.y * px;
    const rp = c.r * px;
    const bowl = c2d.createRadialGradient(cx, cy, rp * 0.1, cx, cy, rp);
    bowl.addColorStop(0, 'rgba(4,7,13,0.62)');
    bowl.addColorStop(0.7, 'rgba(7,11,19,0.34)');
    bowl.addColorStop(1, 'rgba(20,28,42,0)');
    c2d.fillStyle = bowl;
    c2d.beginPath();
    c2d.arc(cx, cy, rp, 0, Math.PI * 2);
    c2d.fill();
    // shadow crescent (far side, away from sun)
    c2d.lineWidth = rp * 0.2;
    c2d.strokeStyle = 'rgba(2,4,8,0.7)';
    c2d.beginPath();
    c2d.arc(cx, cy, rp * 0.86, feat.sun + 0.5, feat.sun + Math.PI * 2 - 0.5);
    c2d.stroke();
    // lit rim (sun side) -- faint, so a crater reads as a shallow dent in the
    // ground and never as a ring-shaped marker like HOME.
    c2d.lineWidth = rp * 0.1;
    c2d.strokeStyle = 'rgba(90,105,130,0.22)';
    c2d.beginPath();
    c2d.arc(cx, cy, rp * 0.95, feat.sun - 0.9, feat.sun + 0.9);
    c2d.stroke();
    if (c.block) {
      // A blocking crater reads as a WALL: a full raised rim all the way round
      // (brighter on the sun side), so you can see where you can't drive.
      c2d.lineWidth = Math.max(3 * px, rp * 0.09);
      c2d.strokeStyle = 'rgba(130,145,172,0.55)';
      c2d.beginPath();
      c2d.arc(cx, cy, rp * 0.9, 0, Math.PI * 2);
      c2d.stroke();
      c2d.strokeStyle = 'rgba(190,205,230,0.75)';
      c2d.beginPath();
      c2d.arc(cx, cy, rp * 0.9, feat.sun - 1.3, feat.sun + 1.3);
      c2d.stroke();
    }
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
  let minZ = 0;
  for (let i = 0; i < pos.count; i += 1) {
    const sx = pos.getX(i) + W / 2; // sim x
    const sy = H / 2 - pos.getY(i); // sim y (see world<->plane mapping note)
    // Gentle rolling swell (a few offset sines), mostly shallow.
    let h = Math.sin(sx * 0.011 + 1.3) * 2.4 + Math.sin(sy * 0.013 - 0.7) * 2.2 + Math.sin((sx + sy) * 0.006) * 1.6;
    h -= 3; // bias the whole sheet a touch below the driving plane
    for (const c of feat.craters) {
      const d = Math.hypot(sx - c.x, sy - c.y);
      if (d < c.r) h -= Math.cos((d / c.r) * (Math.PI / 2)) * c.r * (c.block ? 0.28 : 0.16); // bowl (walls dig deeper)
      else if (c.block && d < c.r * 1.25) h += Math.sin(((d - c.r) / (c.r * 0.25)) * Math.PI) * c.r * 0.05; // raised rim
    }
    const z = Math.min(4, h) * relief;
    if (z < minZ) minZ = z;
    pos.setZ(i, z); // local Z -> world Y after the -90deg X rotation
  }
  // The vista skirt underlaps the playfield; wherever relief dips the ground
  // below it (craters, the downward bias) the opaque skirt would cut straight-
  // edged holes through the ground AND the road painted on it. Keep it under the
  // deepest point so the playfield always wins the depth test.
  skirt.position.y = Math.min(-0.3, minZ - 1.5);
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
const ROAD_TEAL: [number, number, number] = [0x37, 0xf2, 0xd8]; // neon teal so bloom picks it up
// The road's paint colour at the current Road brightness (0..1 of full neon).
function roadPaint(): string {
  const k = Math.max(0, Math.min(1, terrainCfg.roadBrightness));
  return `rgb(${ROAD_TEAL.map((c) => Math.round(c * k)).join(',')})`;
}
function strokeRoadSeg(ax: number, ay: number, bx: number, by: number): void {
  rctx.strokeStyle = roadPaint();
  rctx.lineWidth = road.halfWidth() * 2 * paintPX;
  rctx.lineCap = 'round';
  rctx.lineJoin = 'round';
  rctx.beginPath();
  rctx.moveTo(ax * paintPX, ay * paintPX);
  rctx.lineTo(bx * paintPX, by * paintPX);
  rctx.stroke();
  roadDirty = true; // flushed to the GPU at most ~30x/s by the frame loop (avoids per-stroke upload jitter)
}

// Stroke one lattice edge as a round-capped segment. Round caps mean edges meet
// cleanly at shared nodes (intersections) with no gaps or beading.
function paintEdge(e: RoadEdge): void {
  strokeRoadSeg(e.ax, e.ay, e.bx, e.by);
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
// A CRISP ore-deposit sprite: a solid filled core with a hard bright rim and a
// clean edge, so a seam reads as a defined "ore here" marker rather than the
// out-of-focus smudge the old soft glow gave. Tinted white so the mesh colour
// sets the hue.
function makeOreTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d') as CanvasRenderingContext2D;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,255,255,0.95)');
  grad.addColorStop(0.6, 'rgba(255,255,255,0.8)');
  grad.addColorStop(0.82, 'rgba(255,255,255,0.85)'); // solid body
  grad.addColorStop(0.9, 'rgba(255,255,255,1)'); // bright hard rim
  grad.addColorStop(0.94, 'rgba(255,255,255,0)'); // clean cut edge
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}
const seamGlowTexture = makeOreTexture();

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
    // Solid gold ore deposit with a crisp rim (normal blending, not additive)
    // so it reads as a distinct "go mine here" marker, not a fuzzy light.
    const disc = new THREE.Mesh(
      new THREE.PlaneGeometry(r * 2, r * 2),
      new THREE.MeshBasicMaterial({ map: seamGlowTexture, color: 0xffb020, transparent: true, opacity: 0.95, depthWrite: false })
    );
    disc.rotation.x = -Math.PI / 2;
    disc.position.set(zone.x - W / 2, 4, zone.y - H / 2);
    disc.userData.zoneId = zone.id;
    seamGroup.add(disc);
  }
  clearGroup(extractionGroup);
  if (state.arena.extraction) {
    const ex = state.arena.extraction;
    const px = ex.x - W / 2;
    const pz = ex.y - H / 2;
    // HOME is its own colour (magenta) -- used by nothing else, so it can't be
    // confused with the teal road, the gold ore, or the grey craters -- plus a
    // tall beacon you can see from anywhere on the map.
    const pad = new THREE.Mesh(
      new THREE.CircleGeometry(ex.radius, 40),
      new THREE.MeshBasicMaterial({ color: 0x1a0f2a, transparent: true, opacity: 0.9 })
    );
    pad.rotation.x = -Math.PI / 2;
    pad.position.set(px, 3.5, pz);
    extractionGroup.add(pad);
    const rim = new THREE.Mesh(
      new THREE.RingGeometry(ex.radius - 6, ex.radius, 40),
      new THREE.MeshBasicMaterial({ color: 0xc06cff, transparent: true, opacity: 0.95, side: THREE.DoubleSide })
    );
    rim.rotation.x = -Math.PI / 2;
    rim.position.set(px, 4, pz);
    extractionGroup.add(rim);
    const beacon = new THREE.Mesh(
      new THREE.CylinderGeometry(3, 3, 150, 8),
      new THREE.MeshStandardMaterial({ color: 0xc06cff, emissive: 0xa83bff, emissiveIntensity: 1.4, roughness: 0.5 })
    );
    beacon.position.set(px, 75, pz);
    beacon.castShadow = true; // a 150-tall pole: its shadow is a sundial across the field
    extractionGroup.add(beacon);
  }
}

// Clear the ground to the lunar base + terrain, then stroke every laid lattice
// edge. Round caps make edges meet cleanly at shared nodes (intersections).
function repaintCanvas(edges: RoadEdge[]): void {
  rctx.fillStyle = GROUND_BASE;
  rctx.fillRect(0, 0, roadCanvas.width, roadCanvas.height);
  paintTerrain(terrainFeatures); // features composite under the road
  for (const e of edges) paintEdge(e);
  roadTexture.needsUpdate = true; // a full repaint is rare (world build / emergency) -> upload now
  roadDirty = false;
  // The terrain-only layer the sun lights: same base + features, no road.
  tctx.fillStyle = GROUND_BASE;
  tctx.fillRect(0, 0, terrainCanvas.width, terrainCanvas.height);
  paintTerrain(terrainFeatures, tctx, paintPX * TERRAIN_PX_SCALE);
  terrainTexture.needsUpdate = true;
}

// Install a freshly built world (start of day, next day, or new game): adopt the
// sim state, seed the road lattice with the carried edges (so inherited road is
// drivable and painted), and rebuild the seam/extraction meshes for this layout.
function applyWorld(built: { state: ContinuousWorldState; road: RoadEdgeQuad[] }): void {
  state = built.state;
  // Adopt the (possibly scaled) world size from the sim. Everything else (ground
  // plane, terrain mesh, seam/home meshes, camera mapping) reads W/H live, so it
  // all follows. The road canvas is kept within CANVAS_BUDGET px per side rather
  // than growing with the world: it is re-uploaded to the GPU on every road
  // stroke, so a world-sized canvas dropped frames at big Level sizes. paintPX
  // eases the density down on a big moon (a touch softer, but a fixed, cheap
  // upload) and stays at PX at Level size 1.
  W = state.width;
  H = state.height;
  paintPX = Math.min(PX, CANVAS_BUDGET / Math.max(W, H));
  const cw = Math.max(1, Math.round(W * paintPX));
  const ch = Math.max(1, Math.round(H * paintPX));
  if (roadCanvas.width !== cw || roadCanvas.height !== ch) {
    roadCanvas.width = cw;
    roadCanvas.height = ch;
  }
  const tw = Math.max(1, Math.round(cw * TERRAIN_PX_SCALE));
  const th = Math.max(1, Math.round(ch * TERRAIN_PX_SCALE));
  if (terrainCanvas.width !== tw || terrainCanvas.height !== th) {
    terrainCanvas.width = tw;
    terrainCanvas.height = th;
  }
  fitVista(); // resize the horizon skirt + fog fade to this world
  paintedSunBearing = START_BEARING; // a new day starts at first light
  // Sandbox: the day length is the Sun-window knob, not the arena's fixed 36s
  // (so the panel knob bites and the default is learnable). Levels set their
  // own sun (derived from the map) in the campaign.
  if (!campaign.level) {
    state.solarWindowSeconds = state.tuning.startingSolarSeconds;
    state.solarSeconds = state.tuning.startingSolarSeconds;
  } else {
    const lv = campaign.level;
    flash = { text: `Level ${lv.index + 1} · ${lv.spec.name} — ${lv.spec.teaches}`, until: performance.now() + 9000 };
  }
  road.seed(built.road);
  road.boost = 0;
  road.locked = false;
  terrainFeatures = generateTerrain(state.seed, keepOutsFor(state)); // this world's own terrain
  applyRelief(terrainFeatures);
  repaintCanvas(road.edgesForPaint());
  rebuildWorldMeshes();
  runEnded = false;
  slideDistance = 0;
}

// --- Rover --------------------------------------------------------------------
const rover = new THREE.Group();
const body = new THREE.Mesh(
  new THREE.BoxGeometry(40, 18, 54),
  new THREE.MeshStandardMaterial({ color: 0xd2a044, roughness: 0.7 })
);
body.position.y = 12;
body.castShadow = true;
rover.add(body);
const nose = new THREE.Mesh(
  new THREE.BoxGeometry(20, 12, 14),
  // Glowing cyan cab -- reads as a headlight and gives the rover a bloom accent.
  new THREE.MeshStandardMaterial({ color: 0x8fdcf5, emissive: 0x2fb6d6, emissiveIntensity: 1.1, roughness: 0.5 })
);
nose.position.set(0, 18, 22); // toward +Z (forward)
nose.castShadow = true;
rover.add(nose);
scene.add(rover);

// --- Reclaim drone (a cyan flyer above the ground while committed) -----------
const drone = new THREE.Mesh(
  new THREE.OctahedronGeometry(12),
  new THREE.MeshStandardMaterial({ color: 0x78f7df, emissive: 0x1c6f5c, roughness: 0.4 })
);
drone.visible = false;
drone.castShadow = true;
scene.add(drone);

// The drone's line home: a faint tether from the depot to the drone while it's
// out, so "it keeps a connection back" is something you can see.
const tether = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
  new THREE.LineBasicMaterial({ color: 0x59d6c4, transparent: true, opacity: 0.5 })
);
tether.visible = false;
scene.add(tether);

// Eraser target: a warm ring on the road the drone will erase. Shows once
// you've been stopped (aiming, pivoting in place is fine) for the aim delay;
// Launch then erases that patch instead of reclaiming an end.
const eraseMarker = new THREE.Mesh(
  new THREE.RingGeometry(0.86, 1, 56),
  new THREE.MeshBasicMaterial({ color: 0xff6a4d, transparent: true, opacity: 0.8, depthTest: false, depthWrite: false, side: THREE.DoubleSide, fog: false })
);
eraseMarker.rotation.x = -Math.PI / 2;
eraseMarker.renderOrder = 5;
eraseMarker.visible = false;
scene.add(eraseMarker);
let stillSeconds = 0; // how long the rover has been stopped (not driving, not reversing)
let eraseTarget: RoadReclaimPlan | null = null; // the armed eraser plan (marker showing)
let eraseProbeTimer = 0;

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
// Stick size is a panel knob (Controls); the ring on screen matches it.
function stickRadius(): number {
  return Math.max(1, controlsCfg.stickRadius);
}
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
  const R = stickRadius();
  stickEl.style.width = stickEl.style.height = `${R * 2}px`;
  stickEl.style.margin = `${-R}px 0 0 ${-R}px`;
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
  const R = stickRadius();
  const kx = Math.max(-R, Math.min(R, touch.dx));
  const ky = Math.max(-R, Math.min(R, touch.dy));
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
    // Same grammar as the keyboard; dead zones + forward cone + curve are the
    // Controls knobs (see stick.ts).
    const st = stickToInput(touch.dx, touch.dy, controlsCfg);
    if (st.steer !== 0) steer = st.steer;
    if (st.throttle > 0) throttle = st.throttle;
    reverse = st.reverse;
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
let emergencyShake = 0; // 0..1, ramps while the arms cannibalise rail (WS2 emergency)
let emergencyActive = false; // set each frame; drives the HUD mode label
function updateCamera(dt: number): void {
  const rx = state.rover.x - W / 2;
  const rz = state.rover.y - H / 2;
  const lag = Math.max(0, camCfg.lag ?? DEFAULT_CAMERA_CONFIG.lag);
  const k = lag <= 0 ? 1 : 1 - Math.exp(-dt / lag); // smooth follow (Follow lag knob)
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
    // Look angle tilts the aim up toward the horizon: at 0 it looks down at the
    // ground just ahead (today's chase feel); higher lifts and pushes the aim
    // out so the horizon skirt + Earth come into frame.
    const h = camCfg.horizon ?? 0;
    const ahead = 120 + h * 360;
    const aimY = 8 + h * camCfg.height * 0.95;
    look = new THREE.Vector3(rx + fx * ahead, aimY, rz + fz * ahead);
  }
  camPos.lerp(target, k);
  camera.position.copy(camPos);
  if (emergencyShake > 0.001) {
    // Grinding-arms judder while cannibalising rail: a small escalating jitter.
    const amp = emergencyShake * emergencyShake * 6;
    camera.position.x += (Math.random() - 0.5) * amp;
    camera.position.y += (Math.random() - 0.5) * amp * 0.6;
    camera.position.z += (Math.random() - 0.5) * amp;
  }
  camLook.lerp(look, k);
  camera.lookAt(camLook);
  if (camera.fov !== camCfg.fov) {
    camera.fov = camCfg.fov;
    camera.updateProjectionMatrix();
  }
}

// Zoom: wheel (desktop) and pinch (mobile) scale the camera distance+height.
function zoomBy(factor: number): void {
  // Let the zoom-out ceiling grow with the world so a big moon is actually
  // viewable; at Level size 1 this is the original 520 (unchanged).
  const ceil = 520 * Math.max(1, campaign.config.arenaScale);
  camCfg.dist = Math.max(80, Math.min(ceil, camCfg.dist * factor));
  camCfg.height = Math.max(60, Math.min(ceil, camCfg.height * factor));
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
  day: el('hud-day'), bonus: el('hud-bonus'), mode: el('hud-mode'), line: el('line'),
  banner: el('banner'), bannerTitle: el('banner-title'), bannerBody: el('banner-body')
};
const MODE_LABEL: Record<string, string> = { fabricating: 'Building', prepared: 'Prepared', crawl: 'Crawl' };

function updateHud(): void {
  const quota = state.arena.extraction?.oreRequired ?? state.targetOre;
  hud.nano.textContent = `${state.nanobots.toFixed(1)}/${Math.floor(state.maxNanobots)}`;
  hud.nanoBar.style.width = `${Math.min(100, (state.nanobots / state.maxNanobots) * 100)}%`;
  hud.nanoBar.style.background = state.nanobots / state.maxNanobots < 0.18 ? '#ff765f' : '#78f7df';
  hud.ore.textContent = `${state.rover.ore.toFixed(1)}/${quota}`;
  hud.oreBar.style.width = `${Math.min(100, (state.rover.ore / Math.max(1, quota)) * 100)}%`;
  hud.sun.textContent = `${Math.ceil(state.solarSeconds)}s`;
  hud.sunBar.style.width = `${Math.min(100, (state.solarSeconds / Math.max(1, state.solarWindowSeconds)) * 100)}%`;
  hud.sunBar.style.background = state.solarSeconds / state.solarWindowSeconds < 0.25 ? '#ffb066' : '#8fb2ff';
  (hud.day.previousElementSibling as HTMLElement).textContent = campaign.level ? 'LEVEL' : 'SHIFT';
  hud.day.textContent = campaign.level
    ? (campaign.level.index < LEVELS.length ? `${campaign.level.index + 1}/${LEVELS.length}` : `${campaign.level.index + 1}`) // the name is in the start line + banner
    : `D${campaign.dayInShiftOf()}/${campaign.config.daysPerShift} · S${campaign.shiftOfDay()}/${campaign.config.shiftsPerGame}`;
  hud.bonus.textContent = `+${Math.floor(bonusScore())}`;
  const onRoad = road.locked;
  hud.mode.textContent = state.arms.mining > 0
    ? 'Mining'
    : emergencyActive
      ? 'Emergency ⚠'
      : state.speedState === 'crawl'
        ? 'Crawl'
      : onRoad && road.boost > 0.5
        ? (road.slurpArmed() ? 'Rail ⚡' : 'Rail') // ⚡ = slurp charged and armed
        : (MODE_LABEL[state.speedState] ?? state.speedState);
  const flashing = flash && performance.now() < flash.until;
  hud.line.textContent = flashing ? flash!.text : state.phase === 'playing' ? getContinuousGuidance(state).objective : '';
  launchBtn.disabled = state.phase !== 'playing' || (state.tuning.ribbonEconomy ? ribbonDrone !== null : state.drone.status !== 'ready');
}

const cta = hud.banner.querySelector('.cta') as HTMLElement;
function showBanner(): void {
  const won = state.phase === 'won';
  const finale = campaign.gameComplete();
  hud.banner.className = won ? 'win' : 'lose';
  hud.banner.style.display = 'flex';
  hud.bannerTitle.textContent = finale ? 'GAME OVER' : won ? 'EXTRACTION REACHED' : 'RUN OVER';
  const lv = campaign.level;
  if (lv) {
    const cleared = campaign.lastLevelCleared;
    hud.banner.className = cleared ? 'win' : 'lose';
    hud.bannerTitle.textContent = cleared ? `LEVEL ${lv.index + 1} CLEARED` : won ? 'UNDER QUOTA' : 'RUN OVER';
    const b = lv.budget;
    const par = `par ${Math.round(b.parSeconds)}s · ${b.par.seams.length} seam${b.par.seams.length === 1 ? '' : 's'}`;
    const bonus = cleared ? `  ·  bonus +${Math.floor(bonusScore())} (${surplusOre().toFixed(1)} surplus ore, ${Math.round(slideDistance)} hands-off rail)` : '';
    hud.bannerBody.textContent = `${state.message}  ·  ${par}${bonus}`;
    const next = levelSpec(campaign.levelIndex);
    cta.textContent = cleared ? `Tap for level ${campaign.levelIndex + 1}: ${next.name}` : `Tap to retry level ${lv.index + 1}`;
    return;
  }
  const bonusLine = won
    ? `  ·  bonus +${Math.floor(bonusScore())} (${surplusOre().toFixed(1)} surplus ore, ${Math.round(slideDistance)} hands-off rail) · ${Math.floor(campaign.bankedBonus)} total`
    : '';
  hud.bannerBody.textContent = `${state.message}  ·  ${campaign.bankedOre.toFixed(0)} ore banked${bonusLine}`;
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
// --- Ribbon reclaim (ribbonEconomy): the drone lifts the VISIBLE ribbon and
// refunds nanobots for the road it carries home. Runs in the presentation
// (the ribbon lives here); the sim drone stays idle in this mode. --------------
interface RibbonDrone { phase: 'out' | 'back'; pos: { x: number; y: number }; home: { x: number; y: number }; plan: RoadReclaimPlan; refund: number; lifted: boolean }
let ribbonDrone: RibbonDrone | null = null;

function launchRibbonReclaim(): void {
  if (ribbonDrone) { flash = { text: 'Drone is already out.', until: performance.now() + 1500 }; return; }
  const home = state.arena.extraction ?? state.arena.start;
  // Stopped and aimed (the marker is showing): the drone is an ERASER for the
  // road you're pointing at. Otherwise (driving, or just stopped): the usual
  // cleanup, peeling one end.
  const erase = eraseTarget ? road.eraserPlan(state.rover, state.rover.heading, home, state.tuning.droneTetherRange) : null; // fresh indices
  eraseTarget = null;
  const plan = erase ?? road.reclaimPlan(home, state.tuning.droneTetherRange, road.config.reclaimBite, {
    heading: state.rover.heading,
    bias: state.tuning.reclaimAimBias
  });
  if (!plan) { flash = { text: 'No road within tether range to reclaim.', until: performance.now() + 1800 }; return; }
  const perUnit = state.tuning.fabricateCostPerSecond / Math.max(1, state.tuning.fabricatingSpeed);
  ribbonDrone = { phase: 'out', pos: { x: home.x, y: home.y }, home: { x: home.x, y: home.y }, plan, refund: plan.length * perUnit, lifted: false };
  flash = { text: erase ? `Drone erasing ${plan.length.toFixed(0)} of road ahead…` : `Drone reclaiming ${plan.length.toFixed(0)} of road…`, until: performance.now() + 2000 };
}

// Fly the reclaim drone out to the lift point, lift the ribbon, and carry the
// refunded nanobots home. Drives the shared drone mesh + tether.
function updateRibbonDrone(dt: number): void {
  if (!ribbonDrone) { drone.visible = false; tether.visible = false; return; }
  const rd = ribbonDrone;
  const goal = rd.phase === 'out' ? rd.plan.point : rd.home;
  const dx = goal.x - rd.pos.x;
  const dy = goal.y - rd.pos.y;
  const dist = Math.hypot(dx, dy);
  const step = state.tuning.droneSpeed * dt;
  if (dist <= step || dist === 0) {
    rd.pos.x = goal.x;
    rd.pos.y = goal.y;
    if (rd.phase === 'out') {
      if (!rd.lifted) { road.removeSegments(rd.plan.indices); repaintCanvas(road.edgesForPaint()); rd.lifted = true; }
      rd.phase = 'back';
    } else {
      state.nanobots = Math.min(state.maxNanobots, state.nanobots + rd.refund);
      flash = { text: `Drone delivered ${rd.refund.toFixed(1)} nanobots.`, until: performance.now() + 1800 };
      ribbonDrone = null;
      drone.visible = false;
      tether.visible = false;
      return;
    }
  } else {
    rd.pos.x += (dx / dist) * step;
    rd.pos.y += (dy / dist) * step;
  }
  drone.visible = true;
  tether.visible = true;
  drone.position.set(rd.pos.x - W / 2, 60, rd.pos.y - H / 2);
  drone.rotation.y += dt * 3;
  (tether.geometry as THREE.BufferGeometry).setFromPoints([
    new THREE.Vector3(rd.home.x - W / 2, 8, rd.home.y - H / 2),
    new THREE.Vector3(rd.pos.x - W / 2, 60, rd.pos.y - H / 2)
  ]);
}

// Stopped long enough to be aiming -> arm the eraser on the road straight ahead
// (re-probed ~10x/s as you pivot) and show where it will land.
function updateEraserAim(dt: number, moving: boolean): void {
  stillSeconds = moving || state.rover.speed > 1 ? 0 : stillSeconds + dt;
  const aiming = state.phase === 'playing' && !ribbonDrone && road.config.eraserReach > 0 && stillSeconds >= road.config.eraserAimDelay;
  if (!aiming) {
    eraseTarget = null;
    eraseProbeTimer = 0;
  } else if ((eraseProbeTimer -= dt) <= 0) {
    eraseProbeTimer = 0.1;
    const home = state.arena.extraction ?? state.arena.start;
    eraseTarget = road.eraserPlan(state.rover, state.rover.heading, home, state.tuning.droneTetherRange);
  }
  eraseMarker.visible = Boolean(eraseTarget);
  if (eraseTarget) {
    eraseMarker.position.set(eraseTarget.point.x - W / 2, 6, eraseTarget.point.y - H / 2);
    eraseMarker.scale.setScalar(Math.max(1, road.config.eraserRadius));
    (eraseMarker.material as THREE.MeshBasicMaterial).opacity = 0.55 + 0.3 * Math.sin(performance.now() / 160);
  }
  const label = eraseTarget ? 'Erase' : 'Launch';
  if (launchBtn.firstChild && launchBtn.firstChild.textContent !== label) launchBtn.firstChild.textContent = label;
}

function launch(): void {
  if (state.phase !== 'playing') return;
  if (state.tuning.ribbonEconomy) { launchRibbonReclaim(); return; }
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
  // WS2 EMERGENCY (trackSpine): out of fresh stock (crawl), off your cured rail,
  // still pushing forward. You never roll free on bare ground -- either you
  // cannibalise your own rail to inch ahead, or (nothing left to eat) you halt.
  const emergency = Boolean(
    state.tuning.trackSpine &&
      state.tuning.ribbonEconomy &&
      !reversing &&
      base.driveIntent &&
      state.speedState === 'crawl' &&
      !road.locked
  );
  const emergencyStuck = emergency && !road.canCannibalise(state);
  emergencyActive = emergency;
  let input: ContinuousInput = reversing
    ? base
    : { ...base, assistSteer: road.locked ? road.carrySteer(state, dt, true) : 0, roadRunway: road.boost, onRoad: road.locked };
  if (emergencyStuck) {
    input = { ...input, throttle: 0, driveIntent: false }; // out of rail to eat -> stall
    if (!flash || performance.now() > flash.until) flash = { text: 'Out of rail — mine or reclaim to move', until: performance.now() + 1200 };
  }

  const prevX = state.rover.x;
  const prevY = state.rover.y;
  state = tickContinuousWorld(state, input, dt);
  resolveCraterCollision(); // blocking craters are walls (before laying, so rail hugs the rim)
  // Zero-steer slide: riding cured rail at speed without touching the wheel.
  if (base.steer === 0 && !reversing && road.locked && road.boost > 0.5) {
    slideDistance += Math.hypot(state.rover.x - prevX, state.rover.y - prevY);
  }

  // Lay the road. Normal drive paints the new stroke; in emergency the arms lay a
  // stub AND eat older rail (net shrink), so we repaint the whole ribbon to show
  // it being drawn ahead and vanishing behind.
  if (emergency && !emergencyStuck) {
    const adv = road.emergencyAdvance(state);
    if (adv.advanced) repaintCanvas(road.edgesForPaint());
    emergencyShake = Math.min(1, emergencyShake + dt * 0.9);
  } else {
    for (const e of road.sample(state)) paintEdge(e);
    emergencyShake = Math.max(0, emergencyShake - dt * 2.5);
  }
  // Flush new strokes to the GPU at most ~30x/s (see ROAD_FLUSH_MS): the road
  // stays crisp (full-res canvas) without a per-stroke texture upload stalling frames.
  if (roadDirty && now - lastRoadFlush >= ROAD_FLUSH_MS) {
    roadTexture.needsUpdate = true;
    roadDirty = false;
    lastRoadFlush = now;
  }
  // The rail: lock on/off (hard steer is the one way off) and its speed (winds
  // up on the lock, brakes for bends ahead). Feeds next frame's input.
  road.update(state, base.steer, dt, !reversing);
  const onRoadNow = road.locked;
  // Slurp charge builds while you ride the rail at speed, so the slurp is earned
  // by a sustained run; it only fires while you're driving through, so it can't
  // grab the pool you're parked on.
  road.updateCharge(dt, onRoadNow && Boolean(base.driveIntent) && road.boost >= road.config.slurpMinBoost);
  const slurped = base.driveIntent ? road.slurp(state) : null;
  if (slurped) {
    addRailStock(state, state.tuning.railTricklePerSlurp); // WS3: flat refuel, not ore-scaled
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

  // Drone flies above the ground while committed, trailing a tether back home.
  // In ribbon-economy mode it reclaims the visible ribbon (presentation-driven);
  // otherwise it runs the sim's field reclaim.
  if (state.tuning.ribbonEconomy) {
    updateRibbonDrone(dt);
    updateEraserAim(dt, Boolean(base.driveIntent) || reversing);
  } else {
    drone.visible = state.drone.status !== 'ready';
    tether.visible = drone.visible;
    if (drone.visible) {
      drone.position.set(state.drone.x - W / 2, 60, state.drone.y - H / 2);
      drone.rotation.y += dt * 3;
      const home = state.arena.extraction ?? state.arena.start;
      (tether.geometry as THREE.BufferGeometry).setFromPoints([
        new THREE.Vector3(home.x - W / 2, 8, home.y - H / 2),
        new THREE.Vector3(state.drone.x - W / 2, 60, state.drone.y - H / 2)
      ]);
    }
  }
  updateBursts(now);

  rover.position.set(state.rover.x - W / 2, 0, state.rover.y - H / 2);
  rover.rotation.y = -state.rover.heading + Math.PI / 2; // +Z is the model's nose

  // Run just ended: bank + compute carry once, then show the result banner.
  if (state.phase !== 'playing' && !runEnded) {
    runEnded = true;
    campaign.endRun(state, road.serialize(), bonusScore());
    showBanner();
  }

  updateHud();

  updateSun(sunDayFraction());
  updateCamera(dt);
  stars.position.copy(camera.position); // at infinity: rides with the camera
  stars.rotation.y += dt * 0.005; // a barely-there drift so the dark feels alive
  composer.render();
  requestAnimationFrame(frame);
}

// Apply a sim-tuning change from the panel: to the live world now, and to the
// campaign overrides so it persists into future days.
function applyTuning(patch: Partial<ContinuousTuning>): void {
  campaign.tuningOverrides = { ...campaign.tuningOverrides, ...patch };
  state.tuning = resolveContinuousTuning({ ...state.tuning, ...patch });
  applyRailCapacity(state); // base capacity + grown ceiling (WS3)
  if (campaign.level) {
    // A level's sun and stock come from its map, not the Sandbox knobs.
    state.maxNanobots = Math.max(state.maxNanobots, campaign.level.budget.startStock);
    return;
  }
  state.solarWindowSeconds = state.tuning.startingSolarSeconds;
  state.solarSeconds = Math.min(state.solarSeconds, state.solarWindowSeconds);
}

// Install the first day's world, mount the control panel, then start the loop.
applyWorld(campaign.buildWorld());
// Terrain-knob change: regenerate this world's features and redraw the ground
// (relief + painted craters), keeping the current road lattice.
function applyTerrain(): void {
  terrainFeatures = generateTerrain(state.seed, keepOutsFor(state));
  applyRelief(terrainFeatures);
  repaintCanvas(road.edgesForPaint());
}
// Light-knob change: road brightness needs the road re-stroked; daylight just
// retunes how strongly the terrain (and the matching skirt) take the sun.
// The rest are cheap live properties (the sun's own intensity/path, fill light
// and sun sweep are read per frame in updateSun).
function applyLook(repaint = true): void {
  const d = Math.max(0, terrainCfg.daylight);
  groundMat.color.setScalar(d);
  skirtMat.color.set(GROUND_BASE).multiplyScalar(d);
  sun.castShadow = terrainCfg.shadows >= 0.5;
  rim.intensity = Math.max(0, terrainCfg.rimLight);
  bloom.strength = Math.max(0, terrainCfg.bloom);
  bloom.threshold = Math.max(0, Math.min(1, terrainCfg.bloomThreshold));
  starMat.color.copy(STAR_COLOR).multiplyScalar(Math.max(0, terrainCfg.stars));
  stars.visible = terrainCfg.stars > 0;
  sunDisk.scale.setScalar(Math.max(0, terrainCfg.sunDiskSize));
  sunDisk.visible = terrainCfg.sunDiskSize > 0;
  if (repaint) repaintCanvas(road.edgesForPaint());
}
applyLook(false); // saved look knobs take effect before the first frame
createPanel({
  campaign,
  road,
  cam: camCfg,
  terrain: terrainCfg,
  controls: controlsCfg,
  tuningDefaults: resolveContinuousTuning(APP_TUNING),
  getState: () => state,
  applyTuning,
  rebuildDay: () => applyWorld(campaign.buildWorld()),
  newGame: () => { campaign.newGame(); applyWorld(campaign.buildWorld()); },
  applyTerrain,
  applyLook: () => applyLook(),
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
