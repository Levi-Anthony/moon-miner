// Control panel for the 3D build: a gear toggle + a scrollable overlay of live
// knobs grouped into collapsible sections (Controls, World, Ore pools, Rover &
// rail, Economy, Rail growth, Network & campaign, Slurp, Drone, Light & sky,
// Camera) with a "?" quick-help toggle. Self-contained DOM; every change
// applies live and persists via ctx.save().
import type { ContinuousWorldState, ContinuousTuning } from '../game/continuous';
import { DEFAULT_LOOP_CONFIG, LOOP_MODES, PERSISTENCE_MODES, type Campaign } from './loop';
import { levelSpec } from '../game/level';
import { DEFAULT_ROAD_CONFIG } from './road';
import { sliderCurve } from './sliderCurve';
import type { RoadModel } from './road';

export interface CameraConfig {
  dist: number; // how far behind the rover (chase)
  height: number; // camera height
  fov: number; // field of view
  horizon: number; // 0 = look down at the ground (chase), 1 = tilt up toward the horizon
  overhead: boolean; // top-down (north-up) vs chase
  lag: number; // seconds the chase camera takes to catch up (0 = locked to the rover)
}
export const DEFAULT_CAMERA_CONFIG: CameraConfig = { dist: 210, height: 190, fov: 55, horizon: 0, overhead: false, lag: 0.145 };

// Touch stick (drag anywhere). Fractions are of the stick radius.
export interface ControlsConfig {
  stickRadius: number; // px of thumb travel from centre to full deflection
  steerDead: number; // 0..1 sideways travel ignored before steering starts
  forwardCone: number; // degrees either side of straight ahead where pushing forward never steers
  throttleDead: number; // 0..1 forward/back travel ignored before drive/reverse starts
  steerCurve: number; // 1 = linear; >1 = finer control near centre, full lock still at the edge
}
export const DEFAULT_CONTROLS_CONFIG: ControlsConfig = { stickRadius: 66, steerDead: 0.2, forwardCone: 20, throttleDead: 0.2, steerCurve: 1 };

export interface TerrainConfig {
  relief: number; // 0 = flat painted-only, 1 = full displacement height
  craterDensity: number; // scales how many craters/features the ground carries
  craterSize: number; // scales each crater's radius (1 = current)
  craterSpread: number; // how far craters scatter from map centre (1 = uniform, <1 clustered, >1 pushed to edges)
  craterBlockSize: number; // craters at least this radius are walls you drive around (huge = none block)
  roadBrightness: number; // 0..1 glow of the laid road; steady all day (daylight never changes it)
  roadShadow: number; // 0..1 how far a cast shadow darkens the road's glow at full sun (0 = shadows stop at the road's edge)
  daylight: number; // how strongly the sun lights the terrain; 0 = no day/night change, higher = brighter mornings
  sunGain: number; // sun light intensity multiplier (lights the rover, drone, beacon and casts the shadows)
  sunHigh: number; // radians above the horizon at first light
  sunLow: number; // radians above the horizon at last light
  sunSweep: number; // radians the sun travels across the sky over the day
  sunDiskSize: number; // size of the visible sun in the sky (0 = hidden)
  ambient: number; // multiplier on the fill light (how dark the shadows are)
  rimLight: number; // cool back light that edges the rover
  shadows: number; // 1 = cast shadows, 0 = off (cheaper on slow phones)
  bloom: number; // neon glow strength
  bloomThreshold: number; // how bright a pixel must be to glow
  stars: number; // starfield brightness (0 = off)
}
export const DEFAULT_TERRAIN_CONFIG: TerrainConfig = {
  relief: 0.7, craterDensity: 0.6, craterSize: 1, craterSpread: 1, craterBlockSize: 45, roadBrightness: 0.8, roadShadow: 0.6, daylight: 5,
  sunGain: 3, sunHigh: 0.8, sunLow: 0.1, sunSweep: 1.1, sunDiskSize: 420, ambient: 1, rimLight: 0.9, shadows: 1, bloom: 0.55, bloomThreshold: 0.72, stars: 1
};

export interface PanelCtx {
  campaign: Campaign;
  road: RoadModel;
  tuningDefaults: ContinuousTuning; // what the app starts from (for centring slider curves)
  cam: CameraConfig;
  terrain: TerrainConfig;
  controls: ControlsConfig;
  getState: () => ContinuousWorldState;
  applyTuning: (patch: Partial<ContinuousTuning>) => void;
  rebuildDay: () => void;
  newGame: () => void;
  applyTerrain: () => void; // regenerate/redraw the ground for terrain-knob changes
  applyLook: () => void; // re-apply light/glow/sky knobs (road brightness repaints) without touching terrain
  save: () => void;
}

interface Row {
  label: string;
  min: number;
  max: number;
  step: number;
  mid?: number; // the default: the slider is curved so this sits at mid-travel (full range kept)
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

  const SLIDER_RES = 1000;
  const rows: Array<{ def: Row; range: HTMLInputElement; val: HTMLElement; toRaw: (v: number) => number }> = [];

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
    // Wide ranges are curved so the default sits mid-travel (see sliderCurve);
    // the slider then runs 0..SLIDER_RES and maps through the curve.
    const curve = sliderCurve(def.min, def.max, def.mid, (def.max - def.min) / def.step);
    const toValue = (raw: number): number => {
      if (!curve.curved) return raw;
      const v = curve.toValue(raw / SLIDER_RES);
      const snapped = def.min + Math.round((v - def.min) / def.step) * def.step;
      return Math.max(def.min, Math.min(def.max, Number(snapped.toFixed(6))));
    };
    const toRaw = (v: number): number => (curve.curved ? Math.round(curve.toSlider(v) * SLIDER_RES) : v);
    range.min = curve.curved ? '0' : String(def.min);
    range.max = curve.curved ? String(SLIDER_RES) : String(def.max);
    range.step = curve.curved ? '1' : String(def.step);
    range.addEventListener('input', () => {
      const v = toValue(Number(range.value));
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
    rows.push({ def, range, val, toRaw });
  }
  function sync(): void {
    for (const r of rows) {
      const v = r.def.get();
      r.range.value = String(r.toRaw(v));
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
  const cc = ctx.controls;
  const deg = (rad: number) => `${Math.round((rad * 180) / Math.PI)}°`;
  const oreLayouts = ['Auto', 'Scatter', 'Ridge', 'Clusters', 'Belt'];

  section('Levels', 'Levels pose one route question each; quota, sun and starting stock come from a par route on the map, so Level size and every speed knob keep them fair. Sandbox is the open day/shift loop.');
  addRow({ label: 'Mode', min: 0, max: 1, step: 1, fmt: (v) => LOOP_MODES[Math.round(v)] ?? 'Levels', hint: 'Levels: clear a level (home with the quota) to go on; miss and you retry the same map. Sandbox: the open day → shift → game loop where every number is a knob. Switching rebuilds the day.', get: () => cfg.mode, set: (v) => (cfg.mode = Math.round(v)), commit: () => { ctx.rebuildDay(); sync(); } });
  addRow({ label: 'Level', min: 1, max: 30, step: 1, fmt: (v) => `${Math.round(v)} · ${levelSpec(Math.round(v) - 1).name}`, hint: 'Jump to a level (Levels mode). Past the authored set, levels keep tightening.', get: () => ctx.campaign.levelIndex + 1, set: (v) => ctx.campaign.setLevel(Math.round(v) - 1), commit: () => { if (ctx.campaign.levelsMode()) ctx.rebuildDay(); } });
  addRow({ mid: DEFAULT_LOOP_CONFIG.levelSunSlack, label: 'Sun slack', min: 0.3, max: 5, step: 0.05, fmt: (v) => `${v.toFixed(2)}×`, hint: 'Multiplies every level\'s daylight (which is already derived from its par route). Above 1 = more time; below 1 = harder than authored. Applies on the next level build.', get: () => cfg.levelSunSlack, set: (v) => (cfg.levelSunSlack = v), commit: () => { if (ctx.campaign.levelsMode()) ctx.rebuildDay(); } });
  addRow({ mid: DEFAULT_LOOP_CONFIG.levelStockSlack, label: 'Stock slack', min: 0.3, max: 5, step: 0.05, fmt: (v) => `${v.toFixed(2)}×`, hint: 'Multiplies every level\'s starting nanobots (derived from the road its par route needs).', get: () => cfg.levelStockSlack, set: (v) => (cfg.levelStockSlack = v), commit: () => { if (ctx.campaign.levelsMode()) ctx.rebuildDay(); } });
  addRow({ mid: DEFAULT_LOOP_CONFIG.levelQuotaShare, label: 'Quota share', min: 0.1, max: 1.5, step: 0.05, fmt: (v) => `${v.toFixed(2)}×`, hint: 'Multiplies every level\'s quota (a share of the ore on its par seams; capped at all of it).', get: () => cfg.levelQuotaShare, set: (v) => (cfg.levelQuotaShare = v), commit: () => { if (ctx.campaign.levelsMode()) ctx.rebuildDay(); } });

  section('Controls', 'How the stick and wheel feel. Touch: drag anywhere for a stick; the stick knobs change nothing on a keyboard.');
  addRow({ mid: DEFAULT_CONTROLS_CONFIG.stickRadius, label: 'Stick size', min: 30, max: 200, step: 1, fmt: (v) => `${Math.round(v)}px`, hint: 'How far your thumb travels from centre to full deflection. Bigger = finer control, more travel.', get: () => cc.stickRadius, set: (v) => (cc.stickRadius = v) });
  addRow({ mid: DEFAULT_CONTROLS_CONFIG.forwardCone, label: 'Forward cone', min: 0, max: 60, step: 1, fmt: (v) => `±${Math.round(v)}°`, hint: 'Pushing forward within this angle of straight ahead drives dead straight: sideways drift in your thumb never steers. Wider = easier to drive straight, but you must swing further over to turn while driving.', get: () => cc.forwardCone, set: (v) => (cc.forwardCone = v) });
  addRow({ mid: DEFAULT_CONTROLS_CONFIG.steerDead, label: 'Steer dead zone', min: 0, max: 0.8, step: 0.02, fmt: p2, hint: 'Sideways travel (fraction of the stick) ignored before steering starts, even when not pushing forward. Steering then ramps smoothly from zero, no jump.', get: () => cc.steerDead, set: (v) => (cc.steerDead = v) });
  addRow({ mid: DEFAULT_CONTROLS_CONFIG.throttleDead, label: 'Throttle dead zone', min: 0, max: 0.8, step: 0.02, fmt: p2, hint: 'Forward/back travel (fraction of the stick) ignored before you drive or reverse. A resting thumb does nothing.', get: () => cc.throttleDead, set: (v) => (cc.throttleDead = v) });
  addRow({ mid: DEFAULT_CONTROLS_CONFIG.steerCurve, label: 'Steer curve', min: 0.5, max: 3, step: 0.05, fmt: p2, hint: '1 = linear. Above 1 = gentle near the middle for fine corrections, still full lock at the edge. Below 1 = twitchy.', get: () => cc.steerCurve, set: (v) => (cc.steerCurve = v) });
  addRow({ mid: ctx.tuningDefaults.turnRate, label: 'Turn rate', min: 0.3, max: 8, step: 0.05, fmt: (v) => `${deg(v)}/s`, hint: 'How fast the rover turns at full lock when you are steering yourself (off the rail, and pivoting in place).', get: tget('turnRate'), set: tset('turnRate') });
  addRow({ mid: ctx.tuningDefaults.steerRamp, label: 'Wheel speed', min: 0.5, max: 40, step: 0.1, fmt: (v) => `${(1 / v).toFixed(2)}s`, hint: 'Time for the wheel to travel from centre to full lock. Longer = heavier machine; shorter = snappier.', get: tget('steerRamp'), set: tset('steerRamp') });
  addRow({ mid: ctx.tuningDefaults.carryBreakSteer, label: 'Break-off steer', min: 0.3, max: 1, step: 0.01, fmt: p2, hint: 'How far over (0..1) you must push the stick to come OFF the rail. Below this the rail owns the wheel. Keyboard A/D is always full (1).', get: tget('carryBreakSteer'), set: tset('carryBreakSteer') });

  section('World', 'Size + ground. Terrain applies live; Level size rebuilds the day on release.');
  addRow({ mid: DEFAULT_LOOP_CONFIG.arenaScale, label: 'Level size', min: 0.4, max: 12, step: 0.1, fmt: p2, hint: 'How big the moon is — ground, seam spread and haul length all scale together. Rebuilds the day when you release the slider (New Game for a clean slate). Range runs past usable both ways so you can bracket the sweet spot.', get: () => cfg.arenaScale, set: (v) => (cfg.arenaScale = v), commit: () => ctx.rebuildDay() });
  addRow({ mid: DEFAULT_TERRAIN_CONFIG.relief, label: 'Relief', min: 0, max: 6, step: 0.05, fmt: p2, hint: 'Height of craters/rolling ground. 0 = flat painted only.', get: () => tc.relief, set: (v) => { tc.relief = v; ctx.applyTerrain(); } });
  addRow({ mid: DEFAULT_TERRAIN_CONFIG.craterDensity, label: 'Crater density', min: 0, max: 8, step: 0.1, fmt: p2, hint: 'How many craters/rilles the ground carries.', get: () => tc.craterDensity, set: (v) => { tc.craterDensity = v; ctx.applyTerrain(); } });
  addRow({ mid: DEFAULT_TERRAIN_CONFIG.craterSize, label: 'Crater size', min: 0.05, max: 12, step: 0.1, fmt: p2, hint: 'Scales how big each crater is. 1 = current; higher = broader craters.', get: () => tc.craterSize, set: (v) => { tc.craterSize = v; ctx.applyTerrain(); } });
  addRow({ mid: DEFAULT_TERRAIN_CONFIG.craterSpread, label: 'Crater spread', min: 0.05, max: 4, step: 0.05, fmt: p2, hint: 'How far craters scatter from the map centre. 1 = spread evenly; lower clusters them mid-map; higher pushes them to the edges.', get: () => tc.craterSpread, set: (v) => { tc.craterSpread = v; ctx.applyTerrain(); } });
  addRow({ mid: DEFAULT_TERRAIN_CONFIG.craterBlockSize, label: 'Crater walls from', min: 5, max: 400, step: 1, fmt: (v) => (v >= 400 ? 'off' : `r ${Math.round(v)}`), hint: 'Craters at least this big (radius) are walls: you can’t drive into the bowl, you slide round the rim and your rail follows it. They carry a bright full rim and never land on home or an ore pool. Lower = more walls; max = off.', get: () => tc.craterBlockSize, set: (v) => { tc.craterBlockSize = v; ctx.applyTerrain(); } });

  section('Ore pools', "Reshape the day's map, so they rebuild it on release (New Game for a fresh seed). All identity at 1 / Auto.");
  addRow({ mid: ctx.tuningDefaults.oreLayout, label: 'Layout', min: 0, max: 4, step: 1, fmt: (v) => oreLayouts[Math.round(v)] ?? 'Auto', hint: 'Shape of the ore layout. Auto = a seeded shape per map; or force Scatter / Ridge / Clusters / Belt.', get: tget('oreLayout'), set: tset('oreLayout'), commit: () => ctx.rebuildDay() });
  addRow({ mid: ctx.tuningDefaults.oreSpread, label: 'Ore spread', min: 0.05, max: 8, step: 0.05, fmt: p2, hint: 'How widely the pools scatter from the map centre, on top of Level size. 1 = current; lower packs them in, higher flings them out.', get: tget('oreSpread'), set: tset('oreSpread'), commit: () => ctx.rebuildDay() });
  addRow({ mid: ctx.tuningDefaults.oreCount, label: 'Ore count', min: 0.1, max: 15, step: 0.1, fmt: p2, hint: 'How many pools, as a multiple of the authored set. Extra pools reuse the authored richness profiles. 1 = current.', get: tget('oreCount'), set: tset('oreCount'), commit: () => ctx.rebuildDay() });
  addRow({ mid: ctx.tuningDefaults.oreAmount, label: 'Ore amount', min: 0.05, max: 15, step: 0.1, fmt: p2, hint: 'Scales how much ore each pool holds (richness + remaining). 1 = current. A real economy lever.', get: tget('oreAmount'), set: tset('oreAmount'), commit: () => ctx.rebuildDay() });
  addRow({ mid: ctx.tuningDefaults.orePoolSize, label: 'Pool size', min: 0.05, max: 10, step: 0.1, fmt: p2, hint: 'Scales each pool’s footprint (radius + vein). 1 = current.', get: tget('orePoolSize'), set: tset('orePoolSize'), commit: () => ctx.rebuildDay() });

  section('Rover & rail', 'The rail is one physical idea: GRIP. The lock carries you along your laid road and the rail sets your speed: it winds up toward top speed and brakes for bends so grip holds. Steer hard to leave.');
  addRow({ label: 'Track-spine (no off-road)', min: 0, max: 1, step: 1, fmt: (v) => (v >= 0.5 ? 'on' : 'off'), hint: 'On = you are always on your own track. Out of stock enters EMERGENCY: you crawl forward while the arms cannibalise your own laid rail to build ahead (network shrinks, camera judders), never a silent bare-ground roll. Off = classic driving.', get: () => (ctx.getState().tuning.trackSpine ? 1 : 0), set: (v) => ctx.applyTuning({ trackSpine: v >= 0.5 }) });
  addRow({ mid: DEFAULT_ROAD_CONFIG.cannibalGuard, label: 'Emergency guard', min: 0, max: 5, step: 0.1, fmt: (v) => `${v.toFixed(1)} cars`, hint: 'In an emergency the arms never eat rail within this many car lengths of you (under you and just behind).', get: () => rc.cannibalGuard, set: (v) => (rc.cannibalGuard = v) });
  addRow({ mid: DEFAULT_ROAD_CONFIG.cannibalGuardAhead, label: 'Emergency guard ahead', min: 0, max: 20, step: 0.5, fmt: (v) => `${v.toFixed(1)} cars`, hint: 'Nor any rail straight ahead of you out to this many car lengths: the road you are about to need. Everything else is fair game.', get: () => rc.cannibalGuardAhead, set: (v) => (rc.cannibalGuardAhead = v) });
  addRow({ mid: ctx.tuningDefaults.fabricatingSpeed, label: 'Laying speed', min: 5, max: 1500, step: 1, fmt: int, hint: 'Speed while laying fresh ribbon at the frontier — the strategic pace. Tune for decisions, not reflexes.', get: tget('fabricatingSpeed'), set: tset('fabricatingSpeed') });
  addRow({ mid: ctx.tuningDefaults.railSpeed, label: 'Road top speed', min: 10, max: 3000, step: 5, fmt: int, hint: 'Top speed once you are rolling on ribbon you already laid — the ceiling you wind up toward. Max is deliberately silly.', get: tget('railSpeed'), set: tset('railSpeed') });
  addRow({ mid: DEFAULT_ROAD_CONFIG.railAccel, label: 'Acceleration', min: 5, max: 2000, step: 5, fmt: int, hint: 'How fast the rail winds you up toward top speed on laid road (units/s²). It brakes harder than this by Brake strength (3× by default). ~100 = about a second to full speed.', get: () => rc.railAccel, set: (v) => (rc.railAccel = v) });
  addRow({ mid: ctx.tuningDefaults.railGrip, label: 'Grip', min: 50, max: 20000, step: 50, fmt: int, hint: 'The rail\'s grip: the most sideways force it can hold (units/s²). This ONE number sets how sharply you can corner at any speed: turn limit = grip ÷ speed, and the rail slows for bends to √(grip ÷ curvature). Higher = tighter corners, faster.', get: tget('railGrip'), set: tset('railGrip') });
  addRow({ mid: DEFAULT_ROAD_CONFIG.cornerBraking, label: 'Corner braking', min: 0, max: 1, step: 0.05, fmt: p2, hint: 'How much the rail slows itself for bends ahead. 1 = it always slows enough that grip holds — you never get flung off. 0 = no braking: go into a bend too fast and you slide off. Lower it for a harder level.', get: () => rc.cornerBraking, set: (v) => (rc.cornerBraking = v) });
  addRow({ mid: DEFAULT_ROAD_CONFIG.railBrakeMult, label: 'Brake strength', min: 0.5, max: 10, step: 0.1, fmt: (v) => `${v.toFixed(1)}×`, hint: 'How much harder the rail brakes than it accelerates. Lower = it starts slowing for bends earlier and more gently.', get: () => rc.railBrakeMult, set: (v) => (rc.railBrakeMult = v) });
  addRow({ mid: DEFAULT_ROAD_CONFIG.cornerGripReserve, label: 'Grip reserve', min: 0.3, max: 1, step: 0.05, fmt: p2, hint: 'Share of grip the rail plans bends at. The rest is kept for the lock\'s own corrections. Lower = slower, safer corners; 1 = right at the limit.', get: () => rc.cornerGripReserve, set: (v) => (rc.cornerGripReserve = v) });
  addRow({ mid: DEFAULT_ROAD_CONFIG.lockAlign, label: 'Lock-on angle', min: 0, max: 0.98, step: 0.02, fmt: (v) => `≤${deg(Math.acos(Math.max(-1, Math.min(1, v))))}`, hint: 'How closely you must be driving ALONG cured road for the rail to grab you. Wider angle = it grabs you even when you cut across at a slant.', get: () => rc.lockAlign, set: (v) => (rc.lockAlign = v) });
  addRow({ mid: DEFAULT_ROAD_CONFIG.lockHoldWidth, label: 'Lock hold width', min: 1, max: 4, step: 0.05, fmt: (v) => `${v.toFixed(2)}×`, hint: 'Once locked, you stay on until you are this many half-road-widths off the line. Higher = stickier.', get: () => rc.lockHoldWidth, set: (v) => (rc.lockHoldWidth = v) });
  addRow({ mid: DEFAULT_ROAD_CONFIG.lockReleaseSeconds, label: 'Re-grab delay', min: 0, max: 3, step: 0.05, fmt: (v) => `${v.toFixed(2)}s`, hint: 'After you steer off, the rail will not grab you again for this long, so leaving actually leaves.', get: () => rc.lockReleaseSeconds, set: (v) => (rc.lockReleaseSeconds = v) });
  addRow({ mid: DEFAULT_ROAD_CONFIG.trackRate, label: 'Line tracking', min: 1, max: 30, step: 0.5, fmt: p2, hint: 'How quickly the lock pulls you back to the road\'s centre line. Higher = tighter; lower = floatier.', get: () => rc.trackRate, set: (v) => (rc.trackRate = v) });
  addRow({ mid: DEFAULT_ROAD_CONFIG.roadWidthCars, label: 'Road width (cars)', min: 0.5, max: 20, step: 0.1, fmt: (v) => v.toFixed(1), hint: 'Width of the laid road, in car-widths. Applies live.', get: () => rc.roadWidthCars, set: (v) => (rc.roadWidthCars = v) });
  addRow({ mid: DEFAULT_ROAD_CONFIG.junctionReach, label: 'Junction reach', min: 0, max: 6, step: 0.1, fmt: (v) => (v <= 0 ? 'off' : `${v.toFixed(1)}×`), hint: 'When your new road runs into existing road (and stops laying, so it doesn\'t stack), or you drive off existing road onto fresh ground, the two are joined into a junction the rail can carry you through. This is how big a gap still counts as an implied junction, in half road-widths past the no-restack margin. 0 = never join.', get: () => rc.junctionReach, set: (v) => (rc.junctionReach = v) });
  addRow({ mid: DEFAULT_ROAD_CONFIG.laneGapCars, label: 'No-restack margin', min: 0, max: 10, step: 0.1, fmt: (v) => v.toFixed(1), hint: 'How close a new lane may come to existing road before it stops laying (double-stack guard), beyond the road width. Higher = new lanes keep more clearance; you still lay freely everywhere else. Applies live.', get: () => rc.laneGapCars, set: (v) => (rc.laneGapCars = v) });

  section('Economy', "Mining, stock drain/recovery and the day's clock + quota.");
  addRow({ mid: ctx.tuningDefaults.mineRate, label: 'Mining yield', min: 0.01, max: 20, step: 0.01, fmt: p2, hint: 'Ore per second while parked in a seam.', get: tget('mineRate'), set: tset('mineRate') });
  addRow({ mid: ctx.tuningDefaults.fabricateCostPerSecond, label: 'Fabrication drain', min: 0, max: 30, step: 0.05, fmt: p2, hint: 'Nanobots per second spent laying road on bare ground.', get: tget('fabricateCostPerSecond'), set: tset('fabricateCostPerSecond') });
  addRow({ mid: ctx.tuningDefaults.crawlSpeed, label: 'Crawl speed', min: 5, max: 400, step: 1, fmt: int, hint: 'How fast you limp when out of stock (crawl).', get: tget('crawlSpeed'), set: tset('crawlSpeed') });
  addRow({ mid: ctx.tuningDefaults.maxNanobots, label: 'Base max stock', min: 4, max: 400, step: 1, fmt: int, hint: 'Nanobot capacity before any capacity climb. Higher = longer runs of fresh road before you run dry.', get: tget('maxNanobots'), set: tset('maxNanobots') });
  addRow({ mid: ctx.tuningDefaults.crawlRecoveryPerSecond, label: 'Crawl recovery', min: 0, max: 20, step: 0.01, fmt: p2, hint: 'Nanobots per second regained while crawling (out of stock).', get: tget('crawlRecoveryPerSecond'), set: tset('crawlRecoveryPerSecond') });
  addRow({ mid: ctx.tuningDefaults.startingNanobots, label: 'Start stock', min: 0, max: 600, step: 1, fmt: int, hint: 'Sandbox (levels derive their own). Nanobots you begin each day with. Applies next day.', get: tget('startingNanobots'), set: tset('startingNanobots') });
  addRow({ mid: ctx.tuningDefaults.startingSolarSeconds, label: 'Sun window', min: 5, max: 3000, step: 5, fmt: int, hint: 'Sandbox (levels derive their own). Seconds of daylight per day. Applies next day.', get: tget('startingSolarSeconds'), set: tset('startingSolarSeconds') });
  addRow({ mid: DEFAULT_LOOP_CONFIG.quota, label: 'Daily quota', min: 1, max: 600, step: 1, fmt: int, hint: 'Sandbox (levels derive their own). Ore you must bank per day. Return under it and you pay the fee below.', get: () => cfg.quota, set: (v) => { cfg.quota = Math.round(v); const ex = ctx.getState().arena.extraction; if (ex && !ctx.campaign.levelsMode()) ex.oreRequired = cfg.quota; } });
  addRow({ mid: DEFAULT_LOOP_CONFIG.underQuotaFeePct, label: 'Under-quota fee', min: 0, max: 1, step: 0.05, fmt: p2, hint: 'Fraction of the haul skimmed when you return under quota.', get: () => cfg.underQuotaFeePct, set: (v) => (cfg.underQuotaFeePct = v) });

  section('Rail growth (independent of ore)', 'Background reach growth. Never reads ore amount.');
  addRow({ mid: ctx.tuningDefaults.railTricklePerSecond, label: 'Mining trickle /s', min: 0, max: 10, step: 0.05, fmt: p2, hint: 'Flat nanobots per second while actively mining. Never scaled by how much ore you pull. 0 = off.', get: tget('railTricklePerSecond'), set: tset('railTricklePerSecond') });
  addRow({ mid: ctx.tuningDefaults.railTricklePerSlurp, label: 'Slurp refuel', min: 0, max: 60, step: 0.5, fmt: p2, hint: 'Flat nanobots added per rail slurp. 0 = off.', get: tget('railTricklePerSlurp'), set: tset('railTricklePerSlurp') });
  addRow({ mid: ctx.tuningDefaults.railCapacityGrowthPerMinute, label: 'Capacity climb /min', min: 0, max: 120, step: 0.5, fmt: p2, hint: 'How fast max stock grows per minute of play. Carries across days and shifts (reset on New Game) — the quiet escalation that lets you push further later. 0 = off.', get: tget('railCapacityGrowthPerMinute'), set: tset('railCapacityGrowthPerMinute') });
  addRow({ mid: ctx.tuningDefaults.railCapacityMax, label: 'Capacity cap', min: 0, max: 2000, step: 1, fmt: (v) => (v <= 0 ? 'none' : v.toFixed(0)), hint: 'Max stock the climb stops at. 0 = no cap.', get: tget('railCapacityMax'), set: tset('railCapacityMax') });

  section('Network & campaign', 'What your laid rail survives: day to day it always carries within a shift; the shift-end mode decides the rest.');
  addRow({ mid: DEFAULT_LOOP_CONFIG.daysPerShift, label: 'Days / shift', min: 1, max: 30, step: 1, fmt: int, hint: 'Days in one shift. Your laid rail always carries day to day within a shift.', get: () => cfg.daysPerShift, set: (v) => (cfg.daysPerShift = Math.round(v)) });
  addRow({ mid: DEFAULT_LOOP_CONFIG.shiftsPerGame, label: 'Shifts / game', min: 1, max: 30, step: 1, fmt: int, hint: 'Shifts in one game. The game ends after days/shift × shifts/game days.', get: () => cfg.shiftsPerGame, set: (v) => (cfg.shiftsPerGame = Math.round(v)) });
  addRow({ mid: DEFAULT_LOOP_CONFIG.arenaRegenShifts, label: 'Regen every N', min: 1, max: 30, step: 1, fmt: int, hint: 'Map regenerates this often + on New Game.', get: () => cfg.arenaRegenShifts, set: (v) => (cfg.arenaRegenShifts = Math.round(v)) });
  addRow({ mid: DEFAULT_LOOP_CONFIG.networkPersistence, label: 'Network at shift end', min: 0, max: 2, step: 1, fmt: (v) => PERSISTENCE_MODES[Math.round(v)] ?? 'Reset each shift', hint: 'What your laid rail does when a shift ends (it always carries day-to-day within a shift). Reset = wipe; Decay = lose the fringe, keep the trunk from home; Persist = carry it all. A map regen always starts clean.', get: () => cfg.networkPersistence, set: (v) => (cfg.networkPersistence = Math.round(v)) });
  addRow({ mid: DEFAULT_LOOP_CONFIG.shiftDecayPct, label: 'Shift decay', min: 0, max: 1, step: 0.05, fmt: p2, hint: 'Decay mode only: fraction of the network lost at a shift boundary, shed from the newest (outermost) rail first.', get: () => cfg.shiftDecayPct, set: (v) => (cfg.shiftDecayPct = v) });
  addRow({ mid: DEFAULT_LOOP_CONFIG.hardFailRoadResetPct, label: 'Sunset road wipe', min: 0, max: 1, step: 0.05, fmt: p2, hint: 'Fraction of laid road lost if you miss a sunset.', get: () => cfg.hardFailRoadResetPct, set: (v) => (cfg.hardFailRoadResetPct = v) });

  section('Slurp', 'Fast rail passes grab whole seams.');
  addRow({ mid: DEFAULT_ROAD_CONFIG.slurpBandPct, label: 'Slurp band', min: 0, max: 1, step: 0.02, fmt: p2, hint: 'Central fraction of a seam a fast pass slurps whole. 0 = slurp off.', get: () => rc.slurpBandPct, set: (v) => (rc.slurpBandPct = v) });
  addRow({ mid: DEFAULT_ROAD_CONFIG.slurpMinBoost, label: 'Slurp min boost', min: 0, max: 1, step: 0.05, fmt: p2, hint: 'Rail momentum (0..1 of the way from laying speed to top speed) you must be riding at for the slurp to charge.', get: () => rc.slurpMinBoost, set: (v) => (rc.slurpMinBoost = v) });
  addRow({ mid: DEFAULT_ROAD_CONFIG.slurpChargeSeconds, label: 'Slurp charge (s)', min: 0, max: 30, step: 0.1, fmt: (v) => v.toFixed(1), hint: 'Seconds of riding the rail at speed to arm the slurp (the HUD shows Rail ⚡). Dips drain it rather than reset it; once armed it stays armed while you are on the rail. Higher = must earn a longer run first.', get: () => rc.slurpChargeSeconds, set: (v) => (rc.slurpChargeSeconds = v) });
  addRow({ mid: DEFAULT_ROAD_CONFIG.slurpChargeDrain, label: 'Slurp drain', min: 0, max: 5, step: 0.1, fmt: (v) => `${v.toFixed(1)}×`, hint: 'How fast the charge drains when you are off the rail or slow (seconds lost per second). 0 = never drains; higher = one dip costs more.', get: () => rc.slurpChargeDrain, set: (v) => (rc.slurpChargeDrain = v) });

  section('Drone (cleanup / reclaim)', 'Lifts a run off ONE END of the ribbon, so the network never splits. Tether = reach; Aim bias = your facing picks which end.');
  addRow({ mid: ctx.tuningDefaults.droneTetherRange, label: 'Tether range', min: 20, max: 12000, step: 20, fmt: int, hint: 'How far out from home the drone will reach. It lifts a run off one end of the ribbon whose midpoint is within this radius, and never a middle piece, so the network never splits. Max ≈ whole map.', get: tget('droneTetherRange'), set: tset('droneTetherRange') });
  addRow({ mid: ctx.tuningDefaults.reclaimAimBias, label: 'Aim bias', min: 0, max: 60, step: 0.5, fmt: p2, hint: 'How hard the way you FACE at launch picks which end the drone reclaims. 0 = always the oldest road nearest home (pure cleanup); high = it grabs from whichever end you point toward.', get: tget('reclaimAimBias'), set: tset('reclaimAimBias') });
  addRow({ mid: ctx.tuningDefaults.droneSpeed, label: 'Drone speed', min: 20, max: 3000, step: 10, fmt: int, hint: 'How fast the drone flies out to the road it reclaims and back to you.', get: tget('droneSpeed'), set: tset('droneSpeed') });
  addRow({ mid: DEFAULT_ROAD_CONFIG.eraserReach, label: 'Eraser reach', min: 0, max: 1500, step: 10, fmt: (v) => (v <= 0 ? 'off' : int(v)), hint: 'Stop and aim (pivot in place): after the aim delay a red ring marks the road straight ahead (up to this far) and Launch becomes Erase — the drone erases that patch instead of peeling an end, for clearing a malformed bit. It can cut your network. A tap while driving or just after stopping is the usual reclaim. 0 = eraser off.', get: () => rc.eraserReach, set: (v) => (rc.eraserReach = v) });
  addRow({ mid: DEFAULT_ROAD_CONFIG.eraserAimDelay, label: 'Eraser aim delay', min: 0, max: 5, step: 0.05, fmt: (v) => `${v.toFixed(2)}s`, hint: 'How long you must be stopped before the eraser target appears. Shorter = quicker to aim; longer = fewer accidental erases when you stop and launch.', get: () => rc.eraserAimDelay, set: (v) => (rc.eraserAimDelay = v) });
  addRow({ mid: DEFAULT_ROAD_CONFIG.eraserRadius, label: 'Eraser size', min: 10, max: 400, step: 5, fmt: int, hint: 'Radius of the patch the eraser lifts around the road it hits.', get: () => rc.eraserRadius, set: (v) => (rc.eraserRadius = v) });
  addRow({ mid: DEFAULT_ROAD_CONFIG.reclaimBite, label: 'Reclaim bite', min: 10, max: 6000, step: 20, fmt: int, hint: 'World units of road one drone flight lifts. Lower = takes a small chunk; higher = reels in more per trip.', get: () => rc.reclaimBite, set: (v) => (rc.reclaimBite = v) });

  section('Light & sky', 'Presentation only. The road glows steadily; the sun lights the terrain and sinks toward sunset, so the ground tells the time.');
  addRow({ mid: DEFAULT_TERRAIN_CONFIG.roadBrightness, label: 'Road brightness', min: 0.1, max: 1, step: 0.05, fmt: p2, hint: 'How bright the laid road glows. Steady all day: the sun never brightens or dims it. 1 = full neon.', get: () => tc.roadBrightness, set: (v) => { tc.roadBrightness = v; ctx.applyLook(); } });
  addRow({ mid: DEFAULT_TERRAIN_CONFIG.daylight, label: 'Daylight strength', min: 0, max: 12, step: 0.25, fmt: p2, hint: 'How strongly the sun lights the ground. Mornings are brightest; it fades to the dark moon by sunset, so the ground tells you the time. 0 = no day/night change.', get: () => tc.daylight, set: (v) => { tc.daylight = v; ctx.applyLook(); } });
  addRow({ mid: DEFAULT_TERRAIN_CONFIG.sunGain, label: 'Sun intensity', min: 0, max: 8, step: 0.1, fmt: p2, hint: 'How strongly the sun lights the rover, drone and beacon, and how dark their shadows read against the lit ground.', get: () => tc.sunGain, set: (v) => (tc.sunGain = v) });
  addRow({ mid: DEFAULT_TERRAIN_CONFIG.sunHigh, label: 'Sun at first light', min: 0.05, max: 1.5, step: 0.01, fmt: deg, hint: 'How high the sun starts the day. Lower = long shadows all day; near 90° the rover\'s shadow tucks underneath it.', get: () => tc.sunHigh, set: (v) => (tc.sunHigh = v) });
  addRow({ mid: DEFAULT_TERRAIN_CONFIG.sunLow, label: 'Sun at sunset', min: 0, max: 1.5, step: 0.01, fmt: deg, hint: 'How high the sun is at last light. Near 0° = shadows stretch right across the field as time runs out.', get: () => tc.sunLow, set: (v) => (tc.sunLow = v) });
  addRow({ mid: DEFAULT_TERRAIN_CONFIG.sunSweep, label: 'Sun sweep', min: 0, max: 3.14, step: 0.02, fmt: deg, hint: 'How far the sun travels across the sky over the day. More = shadows visibly swing round, a stronger clock.', get: () => tc.sunSweep, set: (v) => (tc.sunSweep = v) });
  addRow({ mid: DEFAULT_TERRAIN_CONFIG.sunDiskSize, label: 'Sun disk size', min: 0, max: 1500, step: 10, fmt: (v) => (v <= 0 ? 'hidden' : int(v)), hint: 'Size of the visible sun in the sky (tilt the camera up with Look angle to see it).', get: () => tc.sunDiskSize, set: (v) => { tc.sunDiskSize = v; ctx.applyLook(); } });
  addRow({ mid: DEFAULT_TERRAIN_CONFIG.shadows, label: 'Shadows', min: 0, max: 1, step: 1, fmt: (v) => (v >= 0.5 ? 'on' : 'off'), hint: 'Real cast shadows from the sun. Off is cheaper on a slow phone.', get: () => tc.shadows, set: (v) => { tc.shadows = v; ctx.applyLook(); } });
  addRow({ mid: DEFAULT_TERRAIN_CONFIG.roadShadow, label: 'Shadow on road', min: 0, max: 1, step: 0.05, fmt: p2, hint: 'How dark a cast shadow falls across the road at full sun. It fades with the sun, so dusk shadows are faint. 0 = the road glows through shadows.', get: () => tc.roadShadow, set: (v) => { tc.roadShadow = v; } });
  addRow({ mid: DEFAULT_TERRAIN_CONFIG.ambient, label: 'Fill light', min: 0, max: 3, step: 0.05, fmt: p2, hint: 'Ambient fill on the rover and props. Lower = darker, moodier shadow sides.', get: () => tc.ambient, set: (v) => (tc.ambient = v) });
  addRow({ mid: DEFAULT_TERRAIN_CONFIG.rimLight, label: 'Rim light', min: 0, max: 3, step: 0.05, fmt: p2, hint: 'The cool back light that edges the rover and drone so they read against the dark.', get: () => tc.rimLight, set: (v) => { tc.rimLight = v; ctx.applyLook(); } });
  addRow({ mid: DEFAULT_TERRAIN_CONFIG.bloom, label: 'Glow', min: 0, max: 2, step: 0.05, fmt: p2, hint: 'Neon bloom strength on the road, seams and cab. 0 = no glow.', get: () => tc.bloom, set: (v) => { tc.bloom = v; ctx.applyLook(); } });
  addRow({ mid: DEFAULT_TERRAIN_CONFIG.bloomThreshold, label: 'Glow threshold', min: 0, max: 1, step: 0.02, fmt: p2, hint: 'How bright something must be to glow. Lower = more of the scene blooms; higher = only the brightest neon.', get: () => tc.bloomThreshold, set: (v) => { tc.bloomThreshold = v; ctx.applyLook(); } });
  addRow({ mid: DEFAULT_TERRAIN_CONFIG.stars, label: 'Stars', min: 0, max: 2, step: 0.05, fmt: (v) => (v <= 0 ? 'off' : p2(v)), hint: 'Starfield brightness. The stars sit at infinity above the horizon.', get: () => tc.stars, set: (v) => { tc.stars = v; ctx.applyLook(); } });

  section('Camera', 'Presentation only.');
  addRow({ mid: DEFAULT_CAMERA_CONFIG.dist, label: 'Distance', min: 40, max: 2000, step: 10, fmt: int, hint: 'Also: mouse wheel / pinch to zoom.', get: () => cam.dist, set: (v) => (cam.dist = v) });
  addRow({ mid: DEFAULT_CAMERA_CONFIG.height, label: 'Height', min: 20, max: 2000, step: 10, fmt: int, hint: 'How high the chase camera rides above the rover.', get: () => cam.height, set: (v) => (cam.height = v) });
  addRow({ mid: DEFAULT_CAMERA_CONFIG.fov, label: 'Field of view', min: 15, max: 130, step: 1, fmt: int, hint: 'Lens angle. Wide = more in frame + faster/vaster feel; narrow = telephoto, flatter. (Distance moves the camera; FOV changes the lens.)', get: () => cam.fov, set: (v) => (cam.fov = v) });
  addRow({ mid: DEFAULT_CAMERA_CONFIG.horizon, label: 'Look angle', min: 0, max: 1.3, step: 0.05, fmt: p2, hint: 'Tilt the chase camera up toward the horizon. 0 = look down at the ground; higher lifts the view to reveal the horizon and Earth (past 1 over-tilts).', get: () => cam.horizon, set: (v) => (cam.horizon = v) });
  addRow({ mid: DEFAULT_CAMERA_CONFIG.lag, label: 'Follow lag', min: 0, max: 1, step: 0.01, fmt: (v) => `${v.toFixed(2)}s`, hint: 'How long the chase camera takes to catch up with the rover. 0 = rigidly locked; higher = a floatier, cinematic follow that shows speed.', get: () => cam.lag, set: (v) => (cam.lag = v) });
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
