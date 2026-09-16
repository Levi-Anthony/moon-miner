// Moon Miner — 3D substrate vertical slice.
//
// The point of this file: prove the CORRECT substrate. The road is not vector
// geometry redrawn every frame; it is PAINTED into a canvas texture that lives
// on a real ground plane, under a real perspective camera. Overlap composites in
// raster (no flashing, no pinch, no bowties -- structurally impossible), and
// perspective/occlusion come from the camera for free. The simulation
// (src/game/continuous.ts) is reused untouched -- it has no engine coupling.
import * as THREE from 'three';
import {
  createContinuousWorld,
  tickContinuousWorld,
  type ContinuousInput,
  type ContinuousWorldState
} from '../game/continuous';

// --- World <-> scene mapping -------------------------------------------------
// Sim world is x in [0,W], y in [0,H] (top-down). We lay it on the XZ ground
// plane centred at the origin: X = x - W/2, Z = y - H/2, Y is up.
const W = 1040;
const H = 720;
const CAR_WIDTH = 54;
const ROAD_HALF = (2.2 * CAR_WIDTH) / 2; // world units, matches the sim-side road width
const PX = 1.5; // road-canvas pixels per world unit

// --- Sim ---------------------------------------------------------------------
let state: ContinuousWorldState = createContinuousWorld('three-slice', {}, 'last-light-return');

// --- Renderer / scene / camera ----------------------------------------------
const mount = document.getElementById('app3d') as HTMLDivElement;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
mount.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05070c);
scene.fog = new THREE.Fog(0x05070c, 700, 1600);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 4000);

scene.add(new THREE.AmbientLight(0x8090b0, 0.9));
const sun = new THREE.DirectionalLight(0xfff2d0, 1.1);
sun.position.set(-300, 600, -200);
scene.add(sun);

// --- Ground with a painted road texture --------------------------------------
const roadCanvas = document.createElement('canvas');
roadCanvas.width = Math.round(W * PX);
roadCanvas.height = Math.round(H * PX);
const rctx = roadCanvas.getContext('2d') as CanvasRenderingContext2D;
// Base lunar ground fill; the road is painted on top of this same canvas.
rctx.fillStyle = '#3a4a55';
rctx.fillRect(0, 0, roadCanvas.width, roadCanvas.height);
const roadTexture = new THREE.CanvasTexture(roadCanvas);
roadTexture.colorSpace = THREE.SRGBColorSpace;

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(W, H),
  new THREE.MeshStandardMaterial({ map: roadTexture, roughness: 1, metalness: 0 })
);
ground.rotation.x = -Math.PI / 2; // lie flat on XZ
scene.add(ground);

// World (x,y) -> road-canvas pixel. Plane is centred, UVs run 0..1 across it.
function paintRoadDab(x: number, y: number): void {
  const cx = x * PX;
  const cy = y * PX;
  // Dark bed, then teal deck a touch narrower so re-drives read as one lane.
  rctx.fillStyle = '#1b2a29';
  rctx.beginPath();
  rctx.arc(cx, cy, (ROAD_HALF + 4) * PX, 0, Math.PI * 2);
  rctx.fill();
  rctx.fillStyle = '#4f9f92';
  rctx.beginPath();
  rctx.arc(cx, cy, ROAD_HALF * PX, 0, Math.PI * 2);
  rctx.fill();
  roadTexture.needsUpdate = true;
}

// --- Seams (gold discs sitting ON the ground, so the road never hides them) ---
const seamGroup = new THREE.Group();
scene.add(seamGroup);
for (const zone of state.fertileZones) {
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(Math.max(28, zone.radius * 0.7), 24),
    new THREE.MeshBasicMaterial({ color: 0xffcf5a, transparent: true, opacity: 0.85 })
  );
  disc.rotation.x = -Math.PI / 2;
  disc.position.set(zone.x - W / 2, 1.2, zone.y - H / 2);
  disc.userData.zoneId = zone.id;
  seamGroup.add(disc);
}

// --- Extraction ring ----------------------------------------------------------
if (state.arena.extraction) {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(state.arena.extraction.radius - 4, state.arena.extraction.radius, 40),
    new THREE.MeshBasicMaterial({ color: 0x77f2ca, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(state.arena.extraction.x - W / 2, 1.5, state.arena.extraction.y - H / 2);
  scene.add(ring);
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
  new THREE.MeshStandardMaterial({ color: 0x8fdcf5, roughness: 0.5 })
);
nose.position.set(0, 18, 22); // toward +Z (forward)
rover.add(nose);
scene.add(rover);

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

function beginTouch(e: PointerEvent): void {
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
  if (!touch.active || e.pointerId !== touch.id) return;
  touch.dx = e.clientX - touch.ox;
  touch.dy = e.clientY - touch.oy;
  const kx = Math.max(-STICK_RADIUS, Math.min(STICK_RADIUS, touch.dx));
  const ky = Math.max(-STICK_RADIUS, Math.min(STICK_RADIUS, touch.dy));
  knobEl.style.transform = `translate(${kx}px, ${ky}px)`;
}
function endTouch(e: PointerEvent): void {
  if (e.pointerId !== touch.id) return;
  touch.active = false;
  touch.id = -1;
  touch.dx = 0;
  touch.dy = 0;
  stickEl.style.display = 'none';
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
  const fx = Math.cos(state.rover.heading);
  const fz = Math.sin(state.rover.heading);
  const target = new THREE.Vector3(rx - fx * 210, 190, rz - fz * 210);
  const k = 1 - Math.pow(0.001, dt); // smooth follow
  camPos.lerp(target, k);
  camera.position.copy(camPos);
  camLook.lerp(new THREE.Vector3(rx + fx * 120, 8, rz + fz * 120), k);
  camera.lookAt(camLook);
}

// --- Loop ---------------------------------------------------------------------
let last = performance.now();
let lastPaint = { x: state.rover.x, y: state.rover.y };
paintRoadDab(state.rover.x, state.rover.y);

function frame(now: number): void {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;

  state = tickContinuousWorld(state, readInput(), dt);

  // Paint the road wherever the rover has moved far enough (skip while crawling
  // -- out of nanobots lays nothing, same rule as the sim's trail).
  const moved = Math.hypot(state.rover.x - lastPaint.x, state.rover.y - lastPaint.y);
  if (moved >= 6 && state.speedState !== 'crawl') {
    // Dab along the segment so fast movement leaves a continuous ribbon.
    const steps = Math.ceil(moved / 6);
    for (let i = 1; i <= steps; i += 1) {
      const t = i / steps;
      paintRoadDab(lastPaint.x + (state.rover.x - lastPaint.x) * t, lastPaint.y + (state.rover.y - lastPaint.y) * t);
    }
    lastPaint = { x: state.rover.x, y: state.rover.y };
  }

  // Update seam visibility as ore is taken.
  for (const disc of seamGroup.children) {
    const zone = state.fertileZones.find((z) => z.id === (disc as THREE.Mesh).userData.zoneId);
    (disc as THREE.Mesh).visible = !!zone && zone.remaining > 0.01;
  }

  rover.position.set(state.rover.x - W / 2, 0, state.rover.y - H / 2);
  rover.rotation.y = -state.rover.heading + Math.PI / 2; // +Z is the model's nose

  updateCamera(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Expose for headless verification.
(window as unknown as { __mm3d?: unknown }).__mm3d = {
  getState: () => state,
  keys
};
