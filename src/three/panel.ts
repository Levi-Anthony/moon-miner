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
  overhead: boolean; // top-down (north-up) vs chase
}
export const DEFAULT_CAMERA_CONFIG: CameraConfig = { dist: 210, height: 190, fov: 55, overhead: false };

export interface TerrainConfig {
  relief: number; // 0 = flat painted-only, 1 = full displacement height
  craterDensity: number; // scales how many craters/features the ground carries
}
export const DEFAULT_TERRAIN_CONFIG: TerrainConfig = { relief: 0.7, craterDensity: 1 };

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
  addRow({ label: 'Days / shift', min: 1, max: 8, step: 1, fmt: int, hint: 'Road persists across a shift.', get: () => cfg.daysPerShift, set: (v) => (cfg.daysPerShift = Math.round(v)) });
  addRow({ label: 'Shifts / game', min: 1, max: 10, step: 1, fmt: int, get: () => cfg.shiftsPerGame, set: (v) => (cfg.shiftsPerGame = Math.round(v)) });
  addRow({ label: 'Regen every N', min: 1, max: 10, step: 1, fmt: int, hint: 'Map regenerates this often + on New Game.', get: () => cfg.arenaRegenShifts, set: (v) => (cfg.arenaRegenShifts = Math.round(v)) });
  addRow({ label: 'Daily quota', min: 1, max: 120, step: 1, fmt: int, hint: 'Ore you must bank per day. Return under it and you pay the fee below.', get: () => cfg.quota, set: (v) => { cfg.quota = Math.round(v); const ex = ctx.getState().arena.extraction; if (ex) ex.oreRequired = cfg.quota; } });
  addRow({ label: 'Under-quota fee', min: 0, max: 0.9, step: 0.05, fmt: p2, hint: 'Fraction of the haul skimmed when you return under quota.', get: () => cfg.underQuotaFeePct, set: (v) => (cfg.underQuotaFeePct = v) });
  addRow({ label: 'Sunset road wipe', min: 0, max: 1, step: 0.05, fmt: p2, hint: 'Fraction of laid road lost if you miss a sunset.', get: () => cfg.hardFailRoadResetPct, set: (v) => (cfg.hardFailRoadResetPct = v) });
  addRow({ label: 'Level size', min: 1, max: 5, step: 0.05, fmt: p2, hint: 'How far the seams spread = how long the hauls are. Max is deliberately huge. Applies on next regen / New Game.', get: () => cfg.arenaScale, set: (v) => (cfg.arenaScale = v) });

  const cam = ctx.cam;
  section('Camera');
  addRow({ label: 'Distance', min: 80, max: 520, step: 10, fmt: int, hint: 'Also: mouse wheel / pinch to zoom.', get: () => cam.dist, set: (v) => (cam.dist = v) });
  addRow({ label: 'Height', min: 60, max: 520, step: 10, fmt: int, get: () => cam.height, set: (v) => (cam.height = v) });
  addRow({ label: 'Field of view', min: 30, max: 90, step: 1, fmt: int, get: () => cam.fov, set: (v) => (cam.fov = v) });

  const tc = ctx.terrain;
  section('Terrain');
  addRow({ label: 'Relief', min: 0, max: 1.6, step: 0.05, fmt: p2, hint: 'Height of craters/rolling ground. 0 = flat painted only.', get: () => tc.relief, set: (v) => { tc.relief = v; ctx.applyTerrain(); } });
  addRow({ label: 'Crater density', min: 0, max: 2, step: 0.1, fmt: p2, hint: 'How many craters/rilles the ground carries.', get: () => tc.craterDensity, set: (v) => { tc.craterDensity = v; ctx.applyTerrain(); } });

  section('Road & Slurp');
  addRow({ label: 'Road width (cars)', min: 1, max: 6, step: 0.1, fmt: (v) => v.toFixed(1), hint: 'Width of the laid road, in car-widths. Applies live.', get: () => rc.roadWidthCars, set: (v) => (rc.roadWidthCars = v) });
  addRow({ label: 'Road grid', min: 1, max: 6, step: 0.1, fmt: (v) => v.toFixed(1), hint: 'Maze cell size (car-widths). Road snaps to this lattice, so it can only make corridors + intersections, never blobs. Bigger = coarser maze, wider gaps between corridors. Applies live.', get: () => rc.gridCars, set: (v) => (rc.gridCars = v) });
  addRow({ label: 'Slurp band', min: 0, max: 0.8, step: 0.02, fmt: p2, hint: 'Central fraction of a seam a fast pass slurps whole. 0 = slurp off.', get: () => rc.slurpBandPct, set: (v) => (rc.slurpBandPct = v) });
  addRow({ label: 'Slurp min boost', min: 0.1, max: 1, step: 0.05, fmt: p2, hint: 'Rail boost (0..1) needed before a slurp can fire at all.', get: () => rc.slurpMinBoost, set: (v) => (rc.slurpMinBoost = v) });
  addRow({ label: 'Slurp charge (s)', min: 0, max: 8, step: 0.1, fmt: (v) => v.toFixed(1), hint: 'Seconds at rail top speed before the slurp arms. Higher = must earn a longer run first.', get: () => rc.slurpChargeSeconds, set: (v) => (rc.slurpChargeSeconds = v) });

  section('Grip & Rail');
  addRow({ label: 'Road lock strength', min: 0, max: 40, step: 0.5, fmt: p2, hint: 'How hard laid road steers the rover onto its line. 0 = no auto-follow.', get: () => rc.followStrength, set: (v) => (rc.followStrength = v) });
  addRow({ label: 'Grip floor', min: 0, max: 3, step: 0.05, fmt: p2, hint: 'How magnetic a freshly caught rail is before it lengthens. Higher = grabs you sooner.', get: tget('gripFloor'), set: tset('gripFloor') });
  addRow({ label: 'Grip while steering', min: 0, max: 3, step: 0.05, fmt: p2, hint: '1 = the rail holds you even as you steer; 0 = the wheel always wins.', get: tget('gripActiveSteerFactor'), set: tset('gripActiveSteerFactor') });
  addRow({ label: 'Rail center pull', min: 0, max: 30, step: 0.2, fmt: p2, hint: 'How hard the rail tugs you back to its centreline, per unit off-centre.', get: tget('railCenterSnap'), set: tset('railCenterSnap') });
  addRow({ label: 'Rail heading snap', min: 0, max: 40, step: 0.5, fmt: p2, hint: 'How fast your heading swings to line up with the rail.', get: tget('railHeadingSnap'), set: tset('railHeadingSnap') });
  addRow({ label: 'Rail capture width', min: 5, max: 300, step: 5, fmt: int, hint: 'How far off-centre you can be and still catch the rail.', get: tget('railCaptureDistance'), set: tset('railCaptureDistance') });
  addRow({ label: 'Rail runway for full speed', min: 20, max: 900, step: 10, fmt: int, hint: 'Connected track ahead needed to reach full rail speed; below it the rail tapers back.', get: tget('railRunwayForFullSpeed'), set: tset('railRunwayForFullSpeed') });

  section('Drive Feel');
  addRow({ label: 'Prepared speed', min: 40, max: 700, step: 1, fmt: int, hint: 'Speed on laid-but-not-railed road.', get: tget('preparedSpeed'), set: tset('preparedSpeed') });
  addRow({ label: 'Raw speed', min: 20, max: 500, step: 1, fmt: int, hint: 'Speed on bare ground while fabricating new road.', get: tget('fabricatingSpeed'), set: tset('fabricatingSpeed') });
  addRow({ label: 'Rail speed', min: 40, max: 900, step: 5, fmt: int, hint: 'Top speed on connected rail. Max is deliberately silly.', get: tget('railSpeed'), set: tset('railSpeed') });
  addRow({ label: 'Mining yield', min: 0.05, max: 2, step: 0.01, fmt: p2, hint: 'Ore per second while parked in a seam.', get: tget('mineRate'), set: tset('mineRate') });
  addRow({ label: 'Fabrication drain', min: 0, max: 6, step: 0.05, fmt: p2, hint: 'Nanobots per second spent laying road on bare ground.', get: tget('fabricateCostPerSecond'), set: tset('fabricateCostPerSecond') });
  addRow({ label: 'Crawl recovery', min: 0, max: 2, step: 0.01, fmt: p2, hint: 'Nanobots per second regained while crawling (out of stock).', get: tget('crawlRecoveryPerSecond'), set: tset('crawlRecoveryPerSecond') });
  addRow({ label: 'Start stock', min: 0, max: 80, step: 1, fmt: int, hint: 'Nanobots you begin each day with. Applies next day.', get: tget('startingNanobots'), set: tset('startingNanobots') });
  addRow({ label: 'Sun window', min: 30, max: 600, step: 5, fmt: int, hint: 'Seconds of daylight per day. Applies next day.', get: tget('startingSolarSeconds'), set: tset('startingSolarSeconds') });

  section('Drone (cleanup / reclaim)');
  addRow({ label: 'Protect the loop', min: 0, max: 1, step: 1, fmt: (v) => (v >= 0.5 ? 'on' : 'off'), hint: 'On = the drone only lifts loose ends, never a section that would split the road.', get: () => (ctx.getState().tuning.reclaimProtectLoop ? 1 : 0), set: (v) => ctx.applyTuning({ reclaimProtectLoop: v >= 0.5 }) });
  addRow({ label: 'Tether range', min: 120, max: 3000, step: 20, fmt: int, hint: 'How far from home the drone may reclaim. It keeps a line back. Max ≈ whole map.', get: tget('droneTetherRange'), set: tset('droneTetherRange') });
  addRow({ label: 'Aim bias', min: 0, max: 15, step: 0.5, fmt: p2, hint: 'How hard the rover’s facing steers which section the drone grabs. 0 = off, high = facing dominates.', get: tget('reclaimAimBias'), set: tset('reclaimAimBias') });

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
