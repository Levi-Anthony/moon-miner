// Control panel for the 3D build: a gear toggle + a scrollable overlay of live
// knobs (loop/economy, road/slurp, drive feel). Self-contained DOM (no HTML
// changes needed). Every change applies live and persists via ctx.save().
import type { ContinuousWorldState, ContinuousTuning } from '../game/continuous';
import type { Campaign } from './loop';
import type { RoadModel } from './road';

export interface PanelCtx {
  campaign: Campaign;
  road: RoadModel;
  getState: () => ContinuousWorldState;
  applyTuning: (patch: Partial<ContinuousTuning>) => void;
  rebuildDay: () => void;
  newGame: () => void;
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

  section('Loop & Economy');
  addRow({ label: 'Days / shift', min: 1, max: 8, step: 1, fmt: int, hint: 'Road persists across a shift.', get: () => cfg.daysPerShift, set: (v) => (cfg.daysPerShift = Math.round(v)) });
  addRow({ label: 'Shifts / game', min: 1, max: 10, step: 1, fmt: int, get: () => cfg.shiftsPerGame, set: (v) => (cfg.shiftsPerGame = Math.round(v)) });
  addRow({ label: 'Regen every N', min: 1, max: 10, step: 1, fmt: int, hint: 'Map regenerates this often + on New Game.', get: () => cfg.arenaRegenShifts, set: (v) => (cfg.arenaRegenShifts = Math.round(v)) });
  addRow({ label: 'Daily quota', min: 1, max: 40, step: 1, fmt: int, hint: 'Under it on return = processing fee.', get: () => cfg.quota, set: (v) => { cfg.quota = Math.round(v); const ex = ctx.getState().arena.extraction; if (ex) ex.oreRequired = cfg.quota; } });
  addRow({ label: 'Under-quota fee', min: 0, max: 0.9, step: 0.05, fmt: p2, get: () => cfg.underQuotaFeePct, set: (v) => (cfg.underQuotaFeePct = v) });
  addRow({ label: 'Sunset road wipe', min: 0, max: 1, step: 0.05, fmt: p2, hint: 'Fraction of road lost on a missed sunset.', get: () => cfg.hardFailRoadResetPct, set: (v) => (cfg.hardFailRoadResetPct = v) });
  addRow({ label: 'Level size', min: 1, max: 2, step: 0.05, fmt: p2, hint: 'Applies on next regen / New Game.', get: () => cfg.arenaScale, set: (v) => (cfg.arenaScale = v) });

  section('Road & Slurp');
  addRow({ label: 'Road width (cars)', min: 1, max: 4, step: 0.1, fmt: (v) => v.toFixed(1), hint: 'Applies live.', get: () => rc.roadWidthCars, set: (v) => (rc.roadWidthCars = v) });
  addRow({ label: 'Slurp band', min: 0, max: 0.8, step: 0.02, fmt: p2, hint: 'Central seam fraction a fast pass slurps. 0 = off.', get: () => rc.slurpBandPct, set: (v) => (rc.slurpBandPct = v) });
  addRow({ label: 'Slurp min boost', min: 0.1, max: 1, step: 0.05, fmt: p2, get: () => rc.slurpMinBoost, set: (v) => (rc.slurpMinBoost = v) });

  section('Drive Feel');
  const tget = (k: keyof ContinuousTuning) => () => ctx.getState().tuning[k] as number;
  const tset = (k: keyof ContinuousTuning) => (v: number) => ctx.applyTuning({ [k]: v } as Partial<ContinuousTuning>);
  addRow({ label: 'Prepared speed', min: 40, max: 360, step: 1, fmt: int, get: tget('preparedSpeed'), set: tset('preparedSpeed') });
  addRow({ label: 'Raw speed', min: 20, max: 260, step: 1, fmt: int, get: tget('fabricatingSpeed'), set: tset('fabricatingSpeed') });
  addRow({ label: 'Rail speed', min: 40, max: 400, step: 5, fmt: int, get: tget('railSpeed'), set: tset('railSpeed') });
  addRow({ label: 'Mining yield', min: 0.18, max: 0.55, step: 0.01, fmt: p2, get: tget('mineRate'), set: tset('mineRate') });
  addRow({ label: 'Fabrication drain', min: 0.2, max: 3, step: 0.05, fmt: p2, get: tget('fabricateCostPerSecond'), set: tset('fabricateCostPerSecond') });
  addRow({ label: 'Crawl recovery', min: 0, max: 0.6, step: 0.01, fmt: p2, get: tget('crawlRecoveryPerSecond'), set: tset('crawlRecoveryPerSecond') });
  addRow({ label: 'Start stock', min: 0, max: 24, step: 1, fmt: int, hint: 'Applies next day.', get: tget('startingNanobots'), set: tset('startingNanobots') });
  addRow({ label: 'Sun window', min: 30, max: 220, step: 5, fmt: int, hint: 'Applies next day.', get: tget('startingSolarSeconds'), set: tset('startingSolarSeconds') });

  const btns = document.createElement('div');
  btns.className = 'btns';
  const mk = (text: string, fn: () => void) => {
    const b = document.createElement('button');
    b.textContent = text;
    b.addEventListener('click', fn);
    return b;
  };
  btns.append(
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
