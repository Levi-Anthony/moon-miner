// Control panel for the 3D build: a gear toggle + a scrollable overlay of live
// knobs grouped into collapsible sections (World, Ore pools, Rover & rail,
// Economy, Rail growth, Network & campaign, Slurp, Drone, Camera) with a "?"
// quick-help toggle. Self-contained DOM; every change applies live and persists
// via ctx.save().
import type { ContinuousWorldState, ContinuousTuning } from '../game/continuous';
import { PERSISTENCE_MODES, type Campaign } from './loop';
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
  craterBlockSize: number; // craters at least this radius are walls you drive around (huge = none block)
  roadBrightness: number; // 0..1 glow of the laid road; steady all day (the sun never touches it)
  daylight: number; // how strongly the sun lights the terrain; 0 = no day/night change, higher = brighter mornings
}
export const DEFAULT_TERRAIN_CONFIG: TerrainConfig = { relief: 0.7, craterDensity: 0.6, craterSize: 1, craterSpread: 1, craterBlockSize: 45, roadBrightness: 0.8, daylight: 5 };

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
  applyLook: () => void; // redraw road brightness + daylight without touching terrain
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
  #panel .top{display:flex;align-items:center;gap:8px;margin-bottom:4px}
  #panel .top b{flex:1;font-size:12px;letter-spacing:0.08em;color:#8fd9c9}
  #panel .help-btn{flex:none;min-width:0;width:30px;height:30px;padding:0;border-radius:15px;font-weight:bold}
  #panel.help .help-btn{background:#8fd9c9;color:#08111a}
  #panel details{border-top:1px solid #1c2735;padding:2px 0}
  #panel summary{cursor:pointer;padding:9px 0 5px;font-size:11px;letter-spacing:0.08em;color:#8fd9c9;
    text-transform:uppercase;list-style:none;user-select:none}
  #panel summary::-webkit-details-marker{display:none}
  #panel summary::before{content:'▸ ';color:#4f6a80}
  #panel details[open] summary::before{content:'▾ '}
  #panel .blurb,#panel .hint{display:none;color:#7f93a8;font-size:11px;line-height:1.35}
  #panel .blurb{margin:0 0 4px}
  #panel .hint{grid-column:1/3;margin-top:1px}
  #panel.help .blurb,#panel.help .hint{display:block}
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

  // Header: title + the "?" quick-help toggle. Help flips every section and row
  // to show its one-line explanation inline -- readable on touch, where hover
  // tooltips don't exist, and out of the way the rest of the time.
  const top = document.createElement('div');
  top.className = 'top';
  const heading = document.createElement('b');
  heading.textContent = 'TUNING';
  const helpBtn = document.createElement('button');
  helpBtn.className = 'help-btn';
  helpBtn.textContent = '?';
  helpBtn.title = 'Show what every knob does';
  const HELP_KEY = 'mm3d-panel-help';
  const OPEN_KEY = 'mm3d-panel-open';
  const readJson = <T,>(k: string, d: T): T => {
    try { const r = window.localStorage.getItem(k); return r ? (JSON.parse(r) as T) : d; } catch { return d; }
  };
  const writeJson = (k: string, v: unknown) => {
    try { window.localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage may be unavailable */ }
  };
  if (readJson(HELP_KEY, false)) panel.classList.add('help');
  helpBtn.addEventListener('click', () => writeJson(HELP_KEY, panel.classList.toggle('help')));
  top.append(heading, helpBtn);
  panel.appendChild(top);

  // Collapsible sections; which are open is remembered per viewer.
  const openState = readJson<Record<string, boolean>>(OPEN_KEY, {});
  let host: HTMLElement = panel;
  function section(title: string, blurb?: string): void {
    const d = document.createElement('details');
    d.open = openState[title] ?? true;
    d.addEventListener('toggle', () => { openState[title] = d.open; writeJson(OPEN_KEY, openState); });
    const sum = document.createElement('summary');
    sum.textContent = title;
    d.appendChild(sum);
    if (blurb) {
      const b = document.createElement('div');
      b.className = 'blurb';
      b.textContent = blurb;
      d.appendChild(b);
    }
    panel.appendChild(d);
    host = d;
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
    if (def.hint) {
      const hint = document.createElement('div');
      hint.className = 'hint';
      hint.textContent = def.hint;
      row.appendChild(hint);
    }
    host.appendChild(row);
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

  const cam = ctx.cam;
  const tc = ctx.terrain;
  const oreLayouts = ['Auto', 'Scatter', 'Ridge', 'Clusters', 'Belt'];

  section('World', 'Size + ground. Terrain applies live; Level size rebuilds the day on release.');
  addRow({ label: 'Level size', min: 0.4, max: 12, step: 0.1, fmt: p2, hint: 'How big the moon is — ground, seam spread and haul length all scale together. Rebuilds the day when you release the slider (New Game for a clean slate). Range runs past usable both ways so you can bracket the sweet spot.', get: () => cfg.arenaScale, set: (v) => (cfg.arenaScale = v), commit: () => ctx.rebuildDay() });
  addRow({ label: 'Relief', min: 0, max: 6, step: 0.05, fmt: p2, hint: 'Height of craters/rolling ground. 0 = flat painted only.', get: () => tc.relief, set: (v) => { tc.relief = v; ctx.applyTerrain(); } });
  addRow({ label: 'Crater density', min: 0, max: 8, step: 0.1, fmt: p2, hint: 'How many craters/rilles the ground carries.', get: () => tc.craterDensity, set: (v) => { tc.craterDensity = v; ctx.applyTerrain(); } });
  addRow({ label: 'Crater size', min: 0.05, max: 12, step: 0.1, fmt: p2, hint: 'Scales how big each crater is. 1 = current; higher = broader craters.', get: () => tc.craterSize, set: (v) => { tc.craterSize = v; ctx.applyTerrain(); } });
  addRow({ label: 'Crater spread', min: 0.05, max: 4, step: 0.05, fmt: p2, hint: 'How far craters scatter from the map centre. 1 = spread evenly; lower clusters them mid-map; higher pushes them to the edges.', get: () => tc.craterSpread, set: (v) => { tc.craterSpread = v; ctx.applyTerrain(); } });
  addRow({ label: 'Crater walls from', min: 5, max: 400, step: 1, fmt: (v) => (v >= 400 ? 'off' : `r ${Math.round(v)}`), hint: 'Craters at least this big (radius) are walls: you can’t drive into the bowl, you slide round the rim and your rail follows it. They carry a bright full rim and never land on home or an ore pool. Lower = more walls; max = off.', get: () => tc.craterBlockSize, set: (v) => { tc.craterBlockSize = v; ctx.applyTerrain(); } });

  section('Ore pools', "Reshape the day's map, so they rebuild it on release (New Game for a fresh seed). All identity at 1 / Auto.");
  addRow({ label: 'Layout', min: 0, max: 4, step: 1, fmt: (v) => oreLayouts[Math.round(v)] ?? 'Auto', hint: 'Shape of the ore layout. Auto = a seeded shape per map; or force Scatter / Ridge / Clusters / Belt.', get: tget('oreLayout'), set: tset('oreLayout'), commit: () => ctx.rebuildDay() });
  addRow({ label: 'Ore spread', min: 0.05, max: 8, step: 0.05, fmt: p2, hint: 'How widely the pools scatter from the map centre, on top of Level size. 1 = current; lower packs them in, higher flings them out.', get: tget('oreSpread'), set: tset('oreSpread'), commit: () => ctx.rebuildDay() });
  addRow({ label: 'Ore count', min: 0.1, max: 15, step: 0.1, fmt: p2, hint: 'How many pools, as a multiple of the authored set. Extra pools reuse the authored richness profiles. 1 = current.', get: tget('oreCount'), set: tset('oreCount'), commit: () => ctx.rebuildDay() });
  addRow({ label: 'Ore amount', min: 0.05, max: 15, step: 0.1, fmt: p2, hint: 'Scales how much ore each pool holds (richness + remaining). 1 = current. A real economy lever.', get: tget('oreAmount'), set: tset('oreAmount'), commit: () => ctx.rebuildDay() });
  addRow({ label: 'Pool size', min: 0.05, max: 10, step: 0.1, fmt: p2, hint: 'Scales each pool’s footprint (radius + vein). 1 = current.', get: tget('orePoolSize'), set: tset('orePoolSize'), commit: () => ctx.rebuildDay() });

  section('Rover & rail', 'You are always on your own track: laying pace at the frontier, winding up to top speed on rail you already laid, the lock steering you along its line.');
  addRow({ label: 'Track-spine (no off-road)', min: 0, max: 1, step: 1, fmt: (v) => (v >= 0.5 ? 'on' : 'off'), hint: 'On = you are always on your own track. Out of stock enters EMERGENCY: you crawl forward while the arms cannibalise your own laid rail to build ahead (network shrinks, camera judders), never a silent bare-ground roll. Off = classic driving.', get: () => (ctx.getState().tuning.trackSpine ? 1 : 0), set: (v) => ctx.applyTuning({ trackSpine: v >= 0.5 }) });
  addRow({ label: 'Laying speed', min: 5, max: 1500, step: 1, fmt: int, hint: 'Speed while laying fresh ribbon at the frontier — the strategic pace. Tune for decisions, not reflexes.', get: tget('fabricatingSpeed'), set: tset('fabricatingSpeed') });
  addRow({ label: 'Road top speed', min: 10, max: 3000, step: 5, fmt: int, hint: 'Top speed once you are rolling on ribbon you already laid — the ceiling you wind up toward. Max is deliberately silly.', get: tget('railSpeed'), set: tset('railSpeed') });
  addRow({ label: 'Spin-up time (s)', min: 0.05, max: 20, step: 0.1, fmt: (v) => v.toFixed(1), hint: 'Seconds on laid road to wind from laying speed up to road top speed. Lower = instant pickup; higher = a longer runway before you are flying.', get: () => rc.spinUpSeconds, set: (v) => (rc.spinUpSeconds = v) });
  addRow({ label: 'Road lock strength', min: 0, max: 150, step: 0.5, fmt: p2, hint: 'How hard laid road steers the rover onto its line as you drive it (grip). 0 = no auto-follow; ~9 is default full-lock feel; higher keeps getting snappier past that, useful for tuning a harder level. Capped by Corner turn limit below regardless of how high this goes.', get: () => rc.followStrength, set: (v) => (rc.followStrength = v) });
  addRow({ label: 'Corner turn limit', min: 1, max: 40, step: 0.5, fmt: p2, hint: 'Hard ceiling on how sharply the lock (slide) can turn you, as a multiple of the manual turn rate. Default (5) is why a fast enough tight corner still throws you off even at max grip above — no amount of Road lock strength can turn tighter than this. Raise it to let a harder level demand tighter cornering at speed.', get: tget('carryTurnMult'), set: tset('carryTurnMult') });
  addRow({ label: 'Road width (cars)', min: 0.5, max: 20, step: 0.1, fmt: (v) => v.toFixed(1), hint: 'Width of the laid road, in car-widths. Applies live.', get: () => rc.roadWidthCars, set: (v) => (rc.roadWidthCars = v) });
  addRow({ label: 'No-restack margin', min: 0, max: 10, step: 0.1, fmt: (v) => v.toFixed(1), hint: 'How close a new lane may come to existing road before it stops laying (double-stack guard), beyond the road width. Higher = new lanes keep more clearance; you still lay freely everywhere else. Applies live.', get: () => rc.laneGapCars, set: (v) => (rc.laneGapCars = v) });

  section('Economy', "Mining, stock drain/recovery and the day's clock + quota.");
  addRow({ label: 'Mining yield', min: 0.01, max: 20, step: 0.01, fmt: p2, hint: 'Ore per second while parked in a seam.', get: tget('mineRate'), set: tset('mineRate') });
  addRow({ label: 'Fabrication drain', min: 0, max: 30, step: 0.05, fmt: p2, hint: 'Nanobots per second spent laying road on bare ground.', get: tget('fabricateCostPerSecond'), set: tset('fabricateCostPerSecond') });
  addRow({ label: 'Crawl recovery', min: 0, max: 20, step: 0.01, fmt: p2, hint: 'Nanobots per second regained while crawling (out of stock).', get: tget('crawlRecoveryPerSecond'), set: tset('crawlRecoveryPerSecond') });
  addRow({ label: 'Start stock', min: 0, max: 600, step: 1, fmt: int, hint: 'Nanobots you begin each day with. Applies next day.', get: tget('startingNanobots'), set: tset('startingNanobots') });
  addRow({ label: 'Sun window', min: 5, max: 3000, step: 5, fmt: int, hint: 'Seconds of daylight per day. Applies next day.', get: tget('startingSolarSeconds'), set: tset('startingSolarSeconds') });
  addRow({ label: 'Daily quota', min: 1, max: 600, step: 1, fmt: int, hint: 'Ore you must bank per day. Return under it and you pay the fee below.', get: () => cfg.quota, set: (v) => { cfg.quota = Math.round(v); const ex = ctx.getState().arena.extraction; if (ex) ex.oreRequired = cfg.quota; } });
  addRow({ label: 'Under-quota fee', min: 0, max: 1, step: 0.05, fmt: p2, hint: 'Fraction of the haul skimmed when you return under quota.', get: () => cfg.underQuotaFeePct, set: (v) => (cfg.underQuotaFeePct = v) });

  section('Rail growth (independent of ore)', 'Background reach growth. Never reads ore amount.');
  addRow({ label: 'Mining trickle /s', min: 0, max: 10, step: 0.05, fmt: p2, hint: 'Flat nanobots per second while actively mining. Never scaled by how much ore you pull. 0 = off.', get: tget('railTricklePerSecond'), set: tset('railTricklePerSecond') });
  addRow({ label: 'Slurp refuel', min: 0, max: 60, step: 0.5, fmt: p2, hint: 'Flat nanobots added per rail slurp. 0 = off.', get: tget('railTricklePerSlurp'), set: tset('railTricklePerSlurp') });
  addRow({ label: 'Capacity climb /min', min: 0, max: 120, step: 0.5, fmt: p2, hint: 'How fast max stock grows per minute of play. Carries across days and shifts (reset on New Game) — the quiet escalation that lets you push further later. 0 = off.', get: tget('railCapacityGrowthPerMinute'), set: tset('railCapacityGrowthPerMinute') });
  addRow({ label: 'Capacity cap', min: 0, max: 2000, step: 1, fmt: (v) => (v <= 0 ? 'none' : v.toFixed(0)), hint: 'Max stock the climb stops at. 0 = no cap.', get: tget('railCapacityMax'), set: tset('railCapacityMax') });

  section('Network & campaign', 'What your laid rail survives: day to day it always carries within a shift; the shift-end mode decides the rest.');
  addRow({ label: 'Days / shift', min: 1, max: 30, step: 1, fmt: int, hint: 'Days in one shift. Your laid rail always carries day to day within a shift.', get: () => cfg.daysPerShift, set: (v) => (cfg.daysPerShift = Math.round(v)) });
  addRow({ label: 'Shifts / game', min: 1, max: 30, step: 1, fmt: int, hint: 'Shifts in one game. The game ends after days/shift × shifts/game days.', get: () => cfg.shiftsPerGame, set: (v) => (cfg.shiftsPerGame = Math.round(v)) });
  addRow({ label: 'Regen every N', min: 1, max: 30, step: 1, fmt: int, hint: 'Map regenerates this often + on New Game.', get: () => cfg.arenaRegenShifts, set: (v) => (cfg.arenaRegenShifts = Math.round(v)) });
  addRow({ label: 'Network at shift end', min: 0, max: 2, step: 1, fmt: (v) => PERSISTENCE_MODES[Math.round(v)] ?? 'Reset each shift', hint: 'What your laid rail does when a shift ends (it always carries day-to-day within a shift). Reset = wipe; Decay = lose the fringe, keep the trunk from home; Persist = carry it all. A map regen always starts clean.', get: () => cfg.networkPersistence, set: (v) => (cfg.networkPersistence = Math.round(v)) });
  addRow({ label: 'Shift decay', min: 0, max: 1, step: 0.05, fmt: p2, hint: 'Decay mode only: fraction of the network lost at a shift boundary, shed from the newest (outermost) rail first.', get: () => cfg.shiftDecayPct, set: (v) => (cfg.shiftDecayPct = v) });
  addRow({ label: 'Sunset road wipe', min: 0, max: 1, step: 0.05, fmt: p2, hint: 'Fraction of laid road lost if you miss a sunset.', get: () => cfg.hardFailRoadResetPct, set: (v) => (cfg.hardFailRoadResetPct = v) });

  section('Slurp', 'Fast rail passes grab whole seams.');
  addRow({ label: 'Slurp band', min: 0, max: 1, step: 0.02, fmt: p2, hint: 'Central fraction of a seam a fast pass slurps whole. 0 = slurp off.', get: () => rc.slurpBandPct, set: (v) => (rc.slurpBandPct = v) });
  addRow({ label: 'Slurp min boost', min: 0, max: 1, step: 0.05, fmt: p2, hint: 'Rail boost (0..1) needed before a slurp can fire at all.', get: () => rc.slurpMinBoost, set: (v) => (rc.slurpMinBoost = v) });
  addRow({ label: 'Slurp charge (s)', min: 0, max: 30, step: 0.1, fmt: (v) => v.toFixed(1), hint: 'Seconds at rail top speed before the slurp arms. Higher = must earn a longer run first.', get: () => rc.slurpChargeSeconds, set: (v) => (rc.slurpChargeSeconds = v) });

  section('Drone (cleanup / reclaim)', 'Lifts a run off ONE END of the ribbon, so the network never splits. Tether = reach; Aim bias = your facing picks which end.');
  addRow({ label: 'Tether range', min: 20, max: 12000, step: 20, fmt: int, hint: 'How far out from home the drone will reach. It lifts a run off one end of the ribbon whose midpoint is within this radius, and never a middle piece, so the network never splits. Max ≈ whole map.', get: tget('droneTetherRange'), set: tset('droneTetherRange') });
  addRow({ label: 'Aim bias', min: 0, max: 60, step: 0.5, fmt: p2, hint: 'How hard the way you FACE at launch picks which end the drone reclaims. 0 = always the oldest road nearest home (pure cleanup); high = it grabs from whichever end you point toward.', get: tget('reclaimAimBias'), set: tset('reclaimAimBias') });
  addRow({ label: 'Reclaim bite', min: 10, max: 6000, step: 20, fmt: int, hint: 'World units of road one drone flight lifts. Lower = takes a small chunk; higher = reels in more per trip.', get: () => rc.reclaimBite, set: (v) => (rc.reclaimBite = v) });

  section('Light', 'Presentation only. The road glows steadily; daylight lights the terrain and fades toward sunset.');
  addRow({ label: 'Road brightness', min: 0.1, max: 1, step: 0.05, fmt: p2, hint: 'How bright the laid road glows. Steady all day: the sun never brightens or dims it. 1 = full neon.', get: () => tc.roadBrightness, set: (v) => { tc.roadBrightness = v; ctx.applyLook(); } });
  addRow({ label: 'Daylight strength', min: 0, max: 12, step: 0.25, fmt: p2, hint: 'How strongly the sun lights the ground. Mornings are brightest; it fades to the dark moon by sunset, so the ground tells you the time. 0 = no day/night change.', get: () => tc.daylight, set: (v) => { tc.daylight = v; ctx.applyLook(); } });

  section('Camera', 'Presentation only.');
  addRow({ label: 'Distance', min: 40, max: 2000, step: 10, fmt: int, hint: 'Also: mouse wheel / pinch to zoom.', get: () => cam.dist, set: (v) => (cam.dist = v) });
  addRow({ label: 'Height', min: 20, max: 2000, step: 10, fmt: int, hint: 'How high the chase camera rides above the rover.', get: () => cam.height, set: (v) => (cam.height = v) });
  addRow({ label: 'Field of view', min: 15, max: 130, step: 1, fmt: int, hint: 'Lens angle. Wide = more in frame + faster/vaster feel; narrow = telephoto, flatter. (Distance moves the camera; FOV changes the lens.)', get: () => cam.fov, set: (v) => (cam.fov = v) });
  addRow({ label: 'Look angle', min: 0, max: 1.3, step: 0.05, fmt: p2, hint: 'Tilt the chase camera up toward the horizon. 0 = look down at the ground; higher lifts the view to reveal the horizon and Earth (past 1 over-tilts).', get: () => cam.horizon, set: (v) => (cam.horizon = v) });
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
