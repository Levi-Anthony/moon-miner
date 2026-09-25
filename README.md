# Moon Miner

Moon Miner is being reframed from a grid rail puzzle into a short-session live-action extraction game about a spider-armed industrial rover that fabricates temporary nano-field under itself, launches an autonomous reclaim drone, and survives by managing route shape, arm capacity, nanobot flow, mining yield, and sunlight.

For the current build and how work happens on it, read `HANDOFF.md` first.
For design intent, read `CONCEPT_REFRAME.md`, then `GAME_DESIGN.md`, then `BETS.md`.

If you are new to command-line projects, start with `START_HERE.md`. It explains exactly how to open the folder, run the game, use localhost URLs, play on a phone, stop the server, and recover when something goes wrong.

## Play

Live build: https://levi-anthony.github.io/moon-miner/ (rebuilt from `main` on every push by `.github/workflows/pages.yml`).

## Run Locally

```bash
npm install
npm run dev
```

Then open the local URL Vite prints. The port may differ, such as `5174`; always use the exact URL Vite prints. To play on a phone on the same Wi-Fi, open the `Network` URL Vite prints.

The game runs on Three.js. It reads no URL parameters: older flags such as `?mobile=1`, `?debug=1` and `?view=chase` do nothing (DEV-52). The layout is the same on every screen, and drag-to-drive works with mouse or touch.

## Controls

- **Drive:** `W/A/S/D` or arrow keys, or drag anywhere on the screen for a virtual stick. `S` (or pulling the stick back) reverses.
- **Drone:** `Space` or the `Launch` button.
  - While driving, or just after stopping, it reclaims road for nanobots.
  - Stay stopped for about a second: a red ring marks the road ahead and the button reads **Erase**. The drone erases that patch.
- **Mine:** park on an ore seam.
- **Win a level:** get home to extraction with the ore quota before the sun sets.
- **Next level or retry:** after a level ends, press `R` or tap the banner.
- **⚙ (bottom left):** the control panel, with live knobs for controls, world, ore, rail, economy, drone, light and campaign mode (Levels or Sandbox). Settings persist in this browser.

The default mode is **Levels**: six authored levels, then an endless tail. Each level's sun, starting stock and quota come from a par route planned on its map (`src/game/level.ts`).

## Proof Checks

```bash
npm run verify          # unit tests + production build
npm run smoke:continuous  # boots the game in headless Chromium, checks the HUD, drives once, checks the phone layout
npm run report:last-light # self-play route table for the Last Light arena
npm run play:through    # plays full levels through the real input path and tables the results
npm run verify:audit    # npm audit, on its own
npm run verify:full     # verify + smoke + audit
```

CI runs these automatically: `.github/workflows/ci.yml` runs tests, build, browser smoke and the Last Light report on every push to `main` and every pull request. `.github/workflows/audit.yml` runs `npm audit` weekly on its own, so a newly published advisory can't turn a code change red.

The latest hand-recorded run, with date, commit and environment, is `PROGRESS.md` "Last Verified". For current status, check CI on the commit you care about rather than quoting a count from a doc.

Known gaps:

- `npm run play:through` is not in CI. The headless sim runs slower than real time, so each level takes one to three minutes of wall time. Run it by hand after changes to levels, economy or controls. Its options are listed at the top of the script (`--levels`, `--seed`, `--reserve`, `--greed`, `--json`).
- The smoke test checks boot, HUD, one drive and the phone HUD layout (DEV-53).
- Smoke needs `CHROME_PATH` pointing at a Chromium when Playwright's own build isn't installed.

In dev and production builds, `window.__mm3d` exposes `{ getState, road, keys }` for browser scripts.

## Project Memory

- `CONCEPT_REFRAME.md`: active conceptual handoff and intent correction.
- `START_HERE.md`: extremely literal first-run guide for opening, running, testing, phone play, and recovery.
- `HUMAN_OPERATING_SYSTEM.md`: personal workflow scaffold for Git, proof discipline, and agent ground rules.
- `HANDOFF.md`: shortest cold-start summary of the current build, how we work, architecture, and open work.
- `GAME_DESIGN.md`: active design rules and scope for the continuous-motion direction.
- `BETS.md`: current product bets, appetite, and completion checks.
- `DECISIONS.md`: durable product and engineering choices.
- `PROGRESS.md`: completed slices and next tasks.
- `BUGS.md`: reproducible issues.
- `PRIOR_ART.md`: nearby game references.
- `PLAYTESTING.md`: playtesting methodology, rounds, traces, and synthesis process.
- `PLAYTEST_PROMPT.md`: copy-paste moderator and AI synthesis prompts.
- `SCAFFOLDING_STANDARD.md`: reusable cold-read operating standard for future human/AI sessions.
- `RECONCILIATION.md`: 2026-09-23 state-surface audit after the 3D flip (DEV-49).
- `docs/audit/`: dated state audits (latest: `docs/audit/2026-09-24/STATE_AUDIT.md`, DEV-54).
- `docs/archive/`: superseded docs kept for reference (the Phaser-era handoff, the V0 grid playtest tracker, pre-3D resolved bugs).
