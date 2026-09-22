// Control panel for the 3D build: a gear toggle + a scrollable overlay of live
// knobs (loop/economy, road/slurp, drive feel). Self-contained DOM (no HTML
// changes needed). Every change applies live and persists via ctx.save().
import type { ContinuousWorldState, ContinuousTuning } from '../game/continuous';
import type { Campaign } from './loop';
import type { RoadModel } from './road';

export interface CameraConfig {
  dist: number; // how far behind the rover (chase)
  height: number; // camera height
  fov: number; // field of view
  horizon: number; // 0 = look down at the ground (chase), 1 = tilt up toward the horizon
  overhead: boolean; // top-down (north-up) vs chase
}
export const DEFAULT_CAMERA_CONFIG: CameraConfig = { dist: 210, height: 190, fov: 55, horizon: 0, overhead: false };

export interface TerrainConfig {
  relief: number; // 0 = flat painted-only, 1 = full displacement height
  craterDensity: number; // scales how many craters/features the ground carries
  craterSize: number; // scales each crater's radius (1 = current)
  craterSpread: number; // how far craters scatter from map centre (1 = uniform, <1 clustered, >1 pushed to edges)
}
export const DEFAULT_TERRAIN_CONFIG: TerrainConfig = { relief: 0.7, craterDensity: 0.6, craterSize: 1, craterSpread: 1 };

export interface PanelCtx {
  campaign: Campaign;
  road: RoadModel;
  cam: CameraConfig;
  terrain: TerrainConfig;
  getState: () => ContinuousWorldState;
  applyTuning: (patch: Partial<ContinuousTuning>) => void;
  rebuildDay: () => void;
  newGame: () => void;
  applyTerrain: () => void; // regenerate/redraw the ground for terrain-knob changes
  save: () => void;
}

interface Row {
  label: string;
  min: number;
  max: number;
  step: number;
  get: () => number;
  set: (v: number) => void;
  commit?: () => void; // fires once on release (change), for expensive applies like a world rebuild
  fmt?: (v: number) => string;
  hint?: string;
}

export function createPanel(ctx: PanelCtx): void {
  const css = `
  #gear{position:fixed;left:10px;bottom:56px;z-index:9;width:40px;height:40px;border-radius:20px;
    border:1px solid #2b3a4d;background:rgba(12,16,24,0.8);color:#cfe0ee;font-size:20px;cursor:pointer}
  #panel{position:fixed;top:0;right:0;bottom:0;z-index:10;width:290px;max-width:86vw;overflow-y:auto;
    display:none;padding:12px 12px 40px;background:rgba(8,11,17,0.94);border-left:1px solid #223;
    font:12px/1.3 ui-monospace,monospace;color:#dfe8f2}
  #panel h3{margin:14px 0 6px;font-size:11px;letter-spacing:0.08em;color:#8fd9c9;text-transform:uppercase}
  #panel h3:first-child{margin-top:0}
  #panel .row{display:grid;grid-template-columns:1fr auto;gap:2px 8px;align-items:center;margin:7px 0}
  #panel .row label{color:#cfe0ee}
  #panel .row .val{color:#8fa3ba;text-align:right;min-width:44px}
  #panel .row input[type=range]{grid-column:1/3;width:100%}
  #panel .btns{display:flex;flex-wrap:wrap;gap:6px;margin-top:14px}
  #panel button{flex:1;min-width:80px;padding:8px;border:1px solid #2b3a4d;border-radius:8px;
    background:#12202b;color:#d7fff3;cursor:pointer}`;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const gear = document.createElement('button');
  gear.id = 'gear';
  gear.textContent = '⚙';
  gear.title = 'Tuning panel';
  document.body.appendChild(gear);

  const panel = document.createElement('aside');
  panel.id = 'panel';
  document.body.appendChild(panel);

  const rows: Array<{ def: Row; range: HTMLInputElement; val: HTMLElement }> = [];
  function section(title: string): void {
    const h = document.createElement('h3');
    h.textContent = title;
    panel.appendChild(h);
  }
  function addRow(def: Row): void {
    const row = document.createElement('label');
    row.className = 'row';
    if (def.hint) row.title = def.hint;
    const name = document.createElement('label');
    name.textContent = def.label;
    const val = document.createElement('span');
    val.className = 'val';
    const range = document.createElement('input');
    range.type = 'range';
    range.min = String(def.min);
    range.max = String(def.max);
    range.step = String(def.step);
    range.addEventListener('input', () => {
      const v = Number(range.value);
      def.set(v);
      val.textContent = (def.fmt ?? String)(def.get());
      ctx.save();
    });
    // Expensive applies (e.g. rebuilding the world for a Level-size change) run
    // once on release, not on every drag tick.
    if (def.commit) range.addEventListener('change', () => def.commit!());
    row.append(name, val, range);
    panel.appendChild(row);
    rows.push({ def, range, val });
  }
  function sync(): void {
    for (const r of rows) {
      const v = r.def.get();
      r.range.value = String(v);
      r.val.textContent = (r.def.fmt ?? String)(v);
    }
  }

  const cfg = ctx.campaign.config;
  const rc = ctx.road.config;
  const int = (v: number) => String(Math.round(v));
  const p2 = (v: number) => v.toFixed(2);
  const tget = (k: keyof ContinuousTuning) => () => ctx.getState().tuning[k] as number;
  const tset = (k: keyof ContinuousTuning) => (v: number) => ctx.applyTuning({ [k]: v } as Partial<ContinuousTuning>);

  section('Loop & Economy');
  addRow({ label: 'Days / shift', min: 1, max: 30, step: 1, fmt: int, hint: 'Road persists across a shift.', get: () => cfg.daysPerShift, set: (v) => (cfg.daysPerShift = Math.round(v)) });
  addRow({ label: 'Shifts / game', min: 1, max: 30, step: 1, fmt: int, get: () => cfg.shiftsPerGame, set: (v) => (cfg.shiftsPerGame = Math.round(v)) });
  addRow({ label: 'Regen every N', min: 1, max: 30, step: 1, fmt: int, hint: 'Map regenerates this often + on New Game.', get: () => cfg.arenaRegenShifts, set: (v) => (cfg.arenaRegenShifts = Math.round(v)) });
  addRow({ label: 'Daily quota', min: 1, max: 600, step: 1, fmt: int, hint: 'Ore you must bank per day. Return under it and you pay the fee below.', get: () => cfg.quota, set: (v) => { cfg.quota = Math.round(v); const ex = ctx.getState().arena.extraction; if (ex) ex.oreRequired = cfg.quota; } });
  addRow({ label: 'Under-quota fee', min: 0, max: 1, step: 0.05, fmt: p2, hint: 'Fraction of the haul skimmed when you return under quota.', get: () => cfg.underQuotaFeePct, set: (v) => (cfg.underQuotaFeePct = v) });
  addRow({ label: 'Sunset road wipe', min: 0, max: 1, step: 0.05, fmt: p2, hint: 'Fraction of laid road lost if you miss a sunset.', get: () => cfg.hardFailRoadResetPct, set: (v) => (cfg.hardFailRoadResetPct = v) });
  addRow({ label: 'Level size', min: 0.4, max: 12, step: 0.1, fmt: p2, hint: 'How big the moon is — ground, seam spread and haul length all scale together. Rebuilds the day when you release the slider (New Game for a clean slate). Range runs past usable both ways so you can bracket the sweet spot.', get: () => cfg.arenaScale, set: (v) => (cfg.arenaScale = v), commit: () => ctx.rebuildDay() });

  const cam = ctx.cam;
  section('Camera');
  addRow({ label: 'Distance', min: 40, max: 2000, step: 10, fmt: int, hint: 'Also: mouse wheel / pinch to zoom.', get: () => cam.dist, set: (v) => (cam.dist = v) });
  addRow({ label: 'Height', min: 20, max: 2000, step: 10, fmt: int, get: () => cam.height, set: (v) => (cam.height = v) });
  addRow({ label: 'Field of view', min: 15, max: 130, step: 1, fmt: int, hint: 'Lens angle. Wide = more in frame + faster/vaster feel; narrow = telephoto, flatter. (Distance moves the camera; FOV changes the lens.)', get: () => cam.fov, set: (v) => (cam.fov = v) });
  addRow({ label: 'Look angle', min: 0, max: 1.3, step: 0.05, fmt: p2, hint: 'Tilt the chase camera up toward the horizon. 0 = look down at the ground; higher lifts the view to reveal the horizon and Earth (past 1 over-tilts).', get: () => cam.horizon, set: (v) => (cam.horizon = v) });

  const tc = ctx.terrain;
  section('Terrain');
  addRow({ label: 'Relief', min: 0, max: 6, step: 0.05, fmt: p2, hint: 'Height of craters/rolling ground. 0 = flat painted only.', get: () => tc.relief, set: (v) => { tc.relief = v; ctx.applyTerrain(); } });
  addRow({ label: 'Crater density', min: 0, max: 8, step: 0.1, fmt: p2, hint: 'How many craters/rilles the ground carries.', get: () => tc.craterDensity, set: (v) => { tc.craterDensity = v; ctx.applyTerrain(); } });
  addRow({ label: 'Crater size', min: 0.05, max: 12, step: 0.1, fmt: p2, hint: 'Scales how big each crater is. 1 = current; higher = broader craters.', get: () => tc.craterSize, set: (v) => { tc.craterSize = v; ctx.applyTerrain(); } });
  addRow({ label: 'Crater spread', min: 0.05, max: 4, step: 0.05, fmt: p2, hint: 'How far craters scatter from the map centre. 1 = spread evenly; lower clusters them mid-map; higher pushes them to the edges.', get: () => tc.craterSpread, set: (v) => { tc.craterSpread = v; ctx.applyTerrain(); } });

  // Ore-pool generation. These reshape the day's map, so they rebuild it on
  // release (New Game for a fully fresh seed). All identity at 1 / Auto.
  const oreLayouts = ['Auto', 'Scatter', 'Ridge', 'Clusters', 'Belt'];
  section('Ore pools');
  addRow({ label: 'Layout', min: 0, max: 4, step: 1, fmt: (v) => oreLayouts[Math.round(v)] ?? 'Auto', hint: 'Shape of the ore layout. Auto = a seeded shape per map; or force Scatter / Ridge / Clusters / Belt.', get: tget('oreLayout'), set: tset('oreLayout'), commit: () => ctx.rebuildDay() });
  addRow({ label: 'Ore spread', min: 0.05, max: 8, step: 0.05, fmt: p2, hint: 'How widely the pools scatter from the map centre, on top of Level size. 1 = current; lower packs them in, higher flings them out.', get: tget('oreSpread'), set: tset('oreSpread'), commit: () => ctx.rebuildDay() });
  addRow({ label: 'Ore count', min: 0.1, max: 15, step: 0.1, fmt: p2, hint: 'How many pools, as a multiple of the authored set. Extra pools reuse the authored richness profiles. 1 = current.', get: tget('oreCount'), set: tset('oreCount'), commit: () => ctx.rebuildDay() });
  addRow({ label: 'Ore amount', min: 0.05, max: 15, step: 0.1, fmt: p2, hint: 'Scales how much ore each pool holds (richness + remaining). 1 = current. A real economy lever.', get: tget('oreAmount'), set: tset('oreAmount'), commit: () => ctx.rebuildDay() });
  addRow({ label: 'Pool size', min: 0.05, max: 10, step: 0.1, fmt: p2, hint: 'Scales each pool’s footprint (radius + vein). 1 = current.', get: tget('orePoolSize'), set: tset('orePoolSize'), commit: () => ctx.rebuildDay() });

  section('Road & Slurp');
  addRow({ label: 'Road width (cars)', min: 0.5, max: 20, step: 0.1, fmt: (v) => v.toFixed(1), hint: 'Width of the laid road, in car-widths. Applies live.', get: () => rc.roadWidthCars, set: (v) => (rc.roadWidthCars = v) });
  addRow({ label: 'No-restack margin', min: 0, max: 10, step: 0.1, fmt: (v) => v.toFixed(1), hint: 'How close a new lane may come to existing road before it stops laying (double-stack guard), beyond the road width. Higher = new lanes keep more clearance; you still lay freely everywhere else. Applies live.', get: () => rc.laneGapCars, set: (v) => (rc.laneGapCars = v) });
  addRow({ label: 'Slurp band', min: 0, max: 1, step: 0.02, fmt: p2, hint: 'Central fraction of a seam a fast pass slurps whole. 0 = slurp off.', get: () => rc.slurpBandPct, set: (v) => (rc.slurpBandPct = v) });
  addRow({ label: 'Slurp min boost', min: 0, max: 1, step: 0.05, fmt: p2, hint: 'Rail boost (0..1) needed before a slurp can fire at all.', get: () => rc.slurpMinBoost, set: (v) => (rc.slurpMinBoost = v) });
  addRow({ label: 'Slurp charge (s)', min: 0, max: 30, step: 0.1, fmt: (v) => v.toFixed(1), hint: 'Seconds at rail top speed before the slurp arms. Higher = must earn a longer run first.', get: () => rc.slurpChargeSeconds, set: (v) => (rc.slurpChargeSeconds = v) });

  // Speed under the live ribbon model: no road under you = off-road speed (the
  // floor); on ribbon you already laid, you wind UP toward road top speed (the
  // ceiling) over the spin-up time; the road lock steers you along its line.
  // (The old rail-capture knobs -- grip floor, rail snaps, prepared speed, rail
  // runway -- drove a hidden field system the 3D game overrides, so they did
  // nothing here and have been removed.)
  section('Speed & drive');
  addRow({ label: 'Off-road speed', min: 5, max: 1500, step: 1, fmt: int, hint: 'Speed with no road under you — laying fresh ribbon or crossing bare ground. This is the floor your speed falls back to.', get: tget('fabricatingSpeed'), set: tset('fabricatingSpeed') });
  addRow({ label: 'Road top speed', min: 10, max: 3000, step: 5, fmt: int, hint: 'Top speed once you are rolling on ribbon you already laid — the ceiling you wind up toward. Max is deliberately silly.', get: tget('railSpeed'), set: tset('railSpeed') });
  addRow({ label: 'Spin-up time (s)', min: 0.05, max: 20, step: 0.1, fmt: (v) => v.toFixed(1), hint: 'Seconds on laid road to wind from off-road speed up to road top speed. Lower = instant pickup; higher = a longer runway before you are flying.', get: () => rc.spinUpSeconds, set: (v) => (rc.spinUpSeconds = v) });
  addRow({ label: 'Road lock strength', min: 0, max: 150, step: 0.5, fmt: p2, hint: 'How hard laid road steers the rover onto its line as you drive it. 0 = no auto-follow; high = the road does the cornering for you.', get: () => rc.followStrength, set: (v) => (rc.followStrength = v) });
  addRow({ label: 'Mining yield', min: 0.01, max: 20, step: 0.01, fmt: p2, hint: 'Ore per second while parked in a seam.', get: tget('mineRate'), set: tset('mineRate') });
  addRow({ label: 'Fabrication drain', min: 0, max: 30, step: 0.05, fmt: p2, hint: 'Nanobots per second spent laying road on bare ground.', get: tget('fabricateCostPerSecond'), set: tset('fabricateCostPerSecond') });
  addRow({ label: 'Crawl recovery', min: 0, max: 20, step: 0.01, fmt: p2, hint: 'Nanobots per second regained while crawling (out of stock).', get: tget('crawlRecoveryPerSecond'), set: tset('crawlRecoveryPerSecond') });
  addRow({ label: 'Start stock', min: 0, max: 600, step: 1, fmt: int, hint: 'Nanobots you begin each day with. Applies next day.', get: tget('startingNanobots'), set: tset('startingNanobots') });
  addRow({ label: 'Sun window', min: 5, max: 3000, step: 5, fmt: int, hint: 'Seconds of daylight per day. Applies next day.', get: tget('startingSolarSeconds'), set: tset('startingSolarSeconds') });

  // The drone lifts a run off ONE END of the ribbon, so the network never
  // splits -- "protect the loop" is automatic and no longer a toggle. Tether =
  // how far out it reaches; Aim bias = your facing at launch picks which end.
  section('Drone (cleanup / reclaim)');
  addRow({ label: 'Tether range', min: 20, max: 12000, step: 20, fmt: int, hint: 'How far out from home the drone will reach. It lifts a run off one end of the ribbon whose midpoint is within this radius, and never a middle piece, so the network never splits. Max ≈ whole map.', get: tget('droneTetherRange'), set: tset('droneTetherRange') });
  addRow({ label: 'Aim bias', min: 0, max: 60, step: 0.5, fmt: p2, hint: 'How hard the way you FACE at launch picks which end the drone reclaims. 0 = always the oldest road nearest home (pure cleanup); high = it grabs from whichever end you point toward.', get: tget('reclaimAimBias'), set: tset('reclaimAimBias') });
  addRow({ label: 'Reclaim bite', min: 10, max: 6000, step: 20, fmt: int, hint: 'World units of road one drone flight lifts. Lower = takes a small chunk; higher = reels in more per trip.', get: () => rc.reclaimBite, set: (v) => (rc.reclaimBite = v) });

  const btns = document.createElement('div');
  btns.className = 'btns';
  const mk = (text: string, fn: () => void) => {
    const b = document.createElement('button');
    b.textContent = text;
    b.addEventListener('click', fn);
    return b;
  };
  const viewBtn = mk('View: Chase', () => {
    cam.overhead = !cam.overhead;
    viewBtn.textContent = cam.overhead ? 'View: Overhead' : 'View: Chase';
    ctx.save();
  });
  viewBtn.textContent = cam.overhead ? 'View: Overhead' : 'View: Chase';
  btns.append(
    viewBtn,
    mk('New Game', () => { ctx.newGame(); sync(); }),
    mk('Reset Day', () => { ctx.rebuildDay(); sync(); }),
    mk('Close', () => { panel.style.display = 'none'; })
  );
  panel.appendChild(btns);

  gear.addEventListener('click', () => {
    const open = panel.style.display !== 'block';
    panel.style.display = open ? 'block' : 'none';
    if (open) sync();
  });
  sync();
}
