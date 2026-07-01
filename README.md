# Moon Miner

Moon Miner is being reframed from a grid rail puzzle into a short-session live-action extraction game about a spider-armed industrial rover that fabricates temporary nano-field under itself, launches an autonomous reclaim drone, and survives by managing route shape, arm capacity, nanobot flow, mining yield, and sunlight.

Start a cold read with `CONCEPT_REFRAME.md`, then `GAME_DESIGN.md`, then `BETS.md`.
For the shortest next-session orientation, read `HANDOFF.md`.

If you are new to command-line projects, start with `START_HERE.md`. It explains exactly how to open the folder, run the game, use localhost URLs, test mobile mode, stop the server, and recover when something goes wrong.

## Run Locally

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

Example URL modes, using `http://localhost:5173/` as the printed Vite URL:

- Desktop/default: `http://localhost:5173/`
- Mobile portrait simulation: `http://localhost:5173/?mobile=1`
- Debug tuning panel: `http://localhost:5173/?debug=1`
- Mobile debug workbench: `http://localhost:5173/?mobile=1&debug=1`
- Chase-camera comparison: `http://localhost:5173/?view=chase`

The port may differ, such as `5174`; always use the exact URL Vite prints.

## Controls

Current runnable build: continuous-motion spike. The V0 grid prototype remains in the repo as prior art.

- Click or touch the playfield to set a steering target.
- Steer with `A/D` or left/right arrows; steering manually clears the current click target.
- `Esc`: clear the current click target.
- Hold `W` or up arrow for full throttle; hold `S` or down arrow to brake.
- `Space` or `Drone`: launch the autonomous reclaim drone.
- `R` or `Reset`: restart the deterministic spike.
- On portrait touch screens, drag the bottom drive pad to steer/commit speed, release or stay in the center deadzone to idle, and tap the large drone button. If the rover is parked on prepared field inside a seam, mining arms keep harvesting at reduced throughput while the solar clock ticks. Tap-to-navigate is intentionally disabled in the mobile slice.
- The default view is flat tactical. In dev builds, add `?view=chase` to compare against the older heading-relative chase projection.

## Proof Checks

```bash
npm run verify
npm run verify:known-green
npm run smoke:continuous
```

Current proof status as of 2026-07-01: `npm test`, `npm run build`, and `npm audit` are the known-green baseline. `npm run smoke:continuous` is currently a known-red browser integration check and should not be claimed green until fixed.

The current acceptance loop is: rally through extraction seams, mine most average deposits during the first traversal or while briefly parked on prepared seam, use prepared nano-field as a faster/cleaner road with medium magnetic grip through forks and turns, launch the drone to reclaim old field, recover from starvation through emergency crawl, and meet the ore quota before the solar window closes.

In dev builds, the active Phaser scene exposes a hidden `#moon-miner-continuous-debug-state` JSON snapshot for browser smoke checks, including compact loop trace, view mode, and HUD layout summaries. `npm run smoke:continuous` starts Vite, launches headless Chrome/Chromium through Playwright, drives `A/D/W/S/Space`, verifies default tactical and `?view=chase` snapshots, checks the default playtest HUD for visible overlap, and runs a portrait mobile pass for idle/deadzone behavior, the one-thumb drive pad, large drone button, tap target size, disabled tap-to-navigate behavior, and mobile debug workbench layout. The old grid scene still exposes `#moon-miner-debug-state` if it is reactivated.

The continuous scene also includes a dev-only Dynamics panel with live sliders for speed, drain, drone, recovery, yield, and start-pressure values. The default playtest view keeps it hidden; press `~` or load with `?debug=1` to open it. In `?mobile=1&debug=1` on a desktop-width browser, the panel parks outside the portrait game display as a tuning workbench. The panel persists values in local storage, can switch named first-run arenas, reset the current run with the active tuning, run the named Auto Route self-play pass, stop automation for manual control, and copy the tuning JSON for later bake-in.

## Project Memory

- `CONCEPT_REFRAME.md`: active conceptual handoff and intent correction.
- `START_HERE.md`: extremely literal first-run guide for opening, running, testing, mobile URLs, and recovery.
- `HUMAN_OPERATING_SYSTEM.md`: personal workflow scaffold for Git, proof discipline, and agent ground rules.
- `HANDOFF.md`: shortest cold-start summary of what was done, decided, deferred, and next.
- `GAME_DESIGN.md`: active design rules and scope for the continuous-motion direction.
- `BETS.md`: current product bets, appetite, and completion checks.
- `DECISIONS.md`: durable product and engineering choices.
- `PROGRESS.md`: completed slices and next tasks.
- `BUGS.md`: reproducible issues.
- `PRIOR_ART.md`: nearby game references.
- `PLAYTESTING.md`: playtesting methodology, rounds, traces, and synthesis process.
- `PLAYTEST_PROMPT.md`: copy-paste moderator and AI synthesis prompts.
- `ROUND_1_PLAYTEST.md`: paused tracker for the V0 grid prototype.
- `SCAFFOLDING_STANDARD.md`: reusable cold-read operating standard for future human/AI sessions.
