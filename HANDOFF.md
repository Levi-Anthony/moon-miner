# Moon Miner — Handoff

Last updated: 2026-10-05 (DEV-66: the dark reserve, live seams in the dark, ore beside your road); 2026-10-02 (DEV-66 step 3b, Endless Night in 3D); before that 2026-09-30, at `main` after PR #67. §0 and §4–§6 reflect PRs #53–#84 and step 3b. The 2026-09-24 rewrite came from DEV-58 and the state audit (`docs/audit/2026-09-24/STATE_AUDIT.md`).

This file is the cold start for a fresh agent: what the game is now, how we work on it and why, and where things live. The pre-rewrite handoff (Phaser-era §1–§8, written 2026-09-16) is archived at `docs/archive/HANDOFF_2026-09-16.md`. Keep it for intent, not for current facts.

The decision trail lives in `DECISIONS.md`; its newest entries (2026-09-27 to 2026-09-30) are at the end. Each PR's reasoning is in its PR body and commit message.

---

## 0. Current substrate — read this first

- **Endless Night in 3D is `night.html` → `src/three/night/main.ts` (DEV-66, 2026-10-02).** It is a view of the rules core: each frame it calls `stepRun` (`src/game/run.ts`), the same step the 2D toy calls, and draws the result with a chase camera, the road as ribbons, the night as a wall, a HUD and a minimap. It renders the core's px 1:1 as world units; a 3D tuning is a different `RunRules`, not a change to the view. Runs log to the toys' store as mode `endless:3d` and go out with every other run on Send. New 3D work goes here. **From 2026-10-05 it runs `RESERVE_RUN`:** an 8 s dark reserve (on your road or off; refills in 2 s in the light; empty ends the run `caught`), no load leak, seams that stay live in the dark, and new ore beside your road from the second bank on. Title toggles switch each rule back. **Terrain (2026-10-05, `src/game/terrain.ts`):** rock that blocks, rubble and rough ground that slow laying (never the rail), rolled per map from ranges and grown with each bank; every seam stays reachable.
- **The Levels game is `index.html` → `src/three/bootstrap.ts`, quarantined (owner, 2026-10-02).** Kept playable and untouched, not deleted: its road economy (nanobots, drone reclaim, the eraser, slurp charge) stays behind the Levels mode. A link in its corner leads to Endless Night 3D.
- **The Levels app in detail (`index.html` → `src/three/bootstrap.ts`).** It is a Three.js scene with a real perspective camera, a ground plane, and the rover and drone as meshes. The road is painted into a canvas texture on the ground (a raster decal), never vector geometry. Do not reintroduce per-frame vector road drawing. That was the Phaser build's whole class of bugs (flashing, bowties, pinch).
- **The simulation is authoritative and engine-free.** `src/game/continuous.ts` and `continuousArena.ts` are pure TypeScript with their own tests. The 3D layer reads sim state and feeds input; it does not fork the rules.
- **Phaser is gone** (PR #10). `src/main.ts`, `src/scenes/*`, the `#moon-miner-continuous-debug-state` snapshot and `window.__moonMinerContinuous` no longer exist. The debug hook is `window.__mm3d = { getState, road, keys, runs, pendingRuns, runIssue }` (`bootstrap.ts`).
- **Run data (the owner's real runs) is in `data/runs/runs.jsonl` on `main`.** Read it before saying there is no run data: `git pull origin main && npm run runs`. The game saves every finished level locally. **Send run data** on the end banner (or ⚙ → **Send saved runs**) opens a pre-filled `[run-data]` GitHub issue, and `.github/workflows/ingest-run.yml` appends it to that file. `data/runs/README.md` has the fields and troubleshooting. Capture is guarded by `smoke:continuous` and `play:through` (DEV-61).
- **Road and shadows.** The road is painted into the ground's emissive layer so daylight never changes its brightness (PR #34). three.js doesn't shadow emissive light, so `groundMat.onBeforeCompile` multiplies the emissive term by the sun's shadow factor, scaled by the Shadow on road knob and the sun's height (DEV-59). If the ground material is ever replaced, carry that patch over, or shadows will pass under the road again.
- **Design direction (2026-09-30): read `DESIGN_THEORY.md` next.** It is the test for game ideas: twelve laws anchored in established game design, a concept card, and run-data metrics. It finds the main game failing L6 (the clock never binds: wins leave 46% of the sun) and L7 (no friction: ore ÷ quota quartiles 0.28 / 1.29 / 2.32). The plan is to port Home Run's **Endless Night** loop (reach dawn, rules as data) into the 3D game (DEV-66). The engine survey (DEV-65, 2026-09-30) keeps Three.js; the port starts by extracting one shared rules core. Its doc is the Claude Doc [Moon Miner: Engine and Toolkit Survey](https://claude.ai/code/artifact/736d748d-1b94-467c-a6b8-85be3b832c68). Design-only follow-ons wait for the port: DEV-70 (dual view, 3D chase and 2D top-down of one run, each with an inset) and DEV-71 (story campaign: Contract, Anomaly, Terminator as configs of one machine).
- **The owner reads and comments in a Claude Doc:** [Moon Miner: Design Theory](https://claude.ai/code/artifact/72757fa6-a2e7-4550-a3f2-80b96b526f55), with a Design theory tab and a Port requirements tab. It is canonical for the requirements; `DESIGN_THEORY.md` and `PORT_REQUIREMENTS.md` are the repo copies. Keep them in step, and check the doc's comments at the start of a session. The owner reads on an iPhone: lists, not tables; checkboxes, not dropdowns.
- **Toys (`toys/`, `src/toys/`).** 2D canvas games. They import the rules core from `src/game` but nothing from `src/three`. **Home Run** has Contract and Endless modes; the owner ruled it the parallel 2D version, so each design change that lands in the 3D game lands there too. **Terminator** is parked, playable, no new work. The dark in Home Run now runs the same 8 s reserve as the 3D game (2026-10-05); the 2026-09-30 leak rules stay in the core as `HOME_RUN`. **Endless Night is the loop to port (owner, 2026-09-30, DEV-68):** its rules live in the core (`NightRules` in `src/game/night.ts`, the run in `src/game/run.ts`); the rail only lets go on purpose; digging and banking push the night back; the border has a seconds countdown, directional cues and a minimap; Hard brings back the lethal dark.
- **One Send for all runs (PR #63).** Every Send button (end banner, ⚙ panel, toys page) sends every unsent run in that browser, game and toys together, through `src/runs/sendAll.ts`. `npm run runs` reports the main game; `npm run runs -- --toys` the toys.
- **The 3D build reads no URL parameters.** `?mobile=1`, `?debug=1`, `?view=`, `?shift=` and `?sandbox=1` in older docs have no effect (DEV-52). The layout is the same on every screen, and drag-to-drive works with mouse or touch.

## 1. Cold start

- **Live build:** https://levi-anthony.github.io/moon-miner/. `.github/workflows/pages.yml` rebuilds it from `main` on every push.
- **Run locally:** `npm install`, then `npm run dev`, and open the URL Vite prints. `npm run dev` binds `0.0.0.0`, so the printed Network URL works from a phone on the same Wi-Fi.
- **Stack:** Three.js 0.186 + TypeScript + Vite 6; tests in Vitest 4.

### What the game is right now

Drive a nanobot-laying rover across a lunar field before sunset. Driving on new ground lays road (costs nanobots). Riding your own road is fast (the rail: grip, corner braking, one way off). Park on an ore seam to mine it, then ride your road home to extraction with the quota before the sun sets. The drone reclaims road for nanobots.

- **Levels (default, PR #40; reshaped 2026-09-27):** six authored levels (First haul, Two stops, The long lode, Branch lines, Rich and far, Last light), then an endless tail that tightens to a floor. Each level is one **day of a shift** (Days / shift, default 3): the days share the shift's map, and a cleared day hands the next its road, field and emptied seams. A new shift is a new map. Every day starts with a full nanobot tank. Sun and quota (and a stock floor) come from a par route planned on the map with the **shipped** tuning, so panel knobs make a level easier or harder (`src/three/loop.ts`, `src/game/level.ts`). The depot ends the day after a **portal charge-up**: hold on it for 5 s (Portal charge knob; leaving resets it; with less sun left than that, it ends on arrival). Home with the quota is a clear; home under quota is a soft loss (Levels: retry the day; Sandbox: the fee). Clear a day to go on; miss and you retry it from that morning's road.
- **Ore layout (v4, 2026-09-27):** `createArenaFertileZones` scales every archetype (curved ridge, 2-4 clusters, belt arc, scatter) with Level size, with per-archetype spacing. The frozen v3 generator (`oreGenerator: 3`) exists only for the self-play rig's hand-placed routes.
- **Sandbox:** the open day → shift → game loop with every number a panel knob (`src/three/loop.ts`, `LoopConfig.mode = 1`).
- **HUD:** NANOBOTS (stock / cap), ORE (mined / quota), SUN (seconds), LEVEL, BONUS, a mode chip (`Building` / `Mining`), and an objective line.

### Controls

- **Drive:** W/A/S/D or arrow keys, or drag anywhere for a virtual stick. On the stick, pushing forward within ±20° drives straight (PR #37). S or pulling back reverses.
- **Drone:** Space or the `Launch` button.
  - Tapped while driving, or just after stopping, it does the usual end-of-road reclaim.
  - Stopped for the Eraser aim delay (0.8 s; pivoting in place is fine), a red ring marks the road straight ahead and Launch reads **Erase**. The drone erases that patch (PRs #38/#39).
- **Continue:** R or tap the banner, only after a level ends. It does nothing while playing.
- **⚙ panel:** live knobs grouped into collapsible sections (Controls, World, Ore pools, Rover & rail, Economy, Rail growth, Network & campaign, Slurp, Drone, Light & sky, and more). Wide ranges use curved sliders centred on the default (PR #39). Settings persist in `mm3d-*` localStorage keys. Buttons: **Reset Day** replays the current day from its morning (same map, the road it began with, nothing banked; works mid-run or on the result banner), **New Game** starts a fresh seed at day 1 / level 1 and keeps settings, **Full Reset** returns every setting to its default plus a new game and keeps saved runs (`mm3d-runs-v1`).

## 2. How we work here (process doctrine — follow this)

1. **Screenshot-verify renders in headless Chromium before pushing.** Use a throwaway Playwright script with `CHROME_PATH=$(ls /opt/pw-browsers/chromium-*/chrome-linux/chrome | head -1)` to drive the game, take a `page.screenshot`, and read the PNG. `docs/audit/2026-09-24/session.mjs` is a working example.
2. **The headless sim runs slow.** Under SwiftShader, game time advances at roughly ¼–⅙ of wall time. Short probes that "prove" nothing changed are usually a timing artifact. Verify the actual number; don't infer.
3. **Read live state from `window.__mm3d.getState()`.** The smoke test (`scripts/continuous-smoke.mjs`) depends on it; keep it stable. `scripts/playthrough.mjs` also depends on it: it plays full levels with held keys and reads outcomes from `getState()` and the HUD.
4. **Pin the feel with distinguishing questions.** When the owner says something is "wrong" or "off", ask sharp multiple-choice questions that separate the candidate causes before changing code.
5. **Record and propagate every decision, including what was rejected and why.** The owner runs an ECB-first doctrine. For each meaningful change, put the trail in the PR body and commit message, add the PR to the index in `DECISIONS.md`, log an ECB pulse, and comment on the relevant Linear ticket (DEV team, workspace `ecos-ops`, project Moon Miner). If ECB or Linear is unavailable, say so and keep the repo record current for later propagation.
6. **Commit small and attributed.** Each logical change is its own commit with a descriptive body. Never put a model identifier in repo artifacts.
7. **Tests are a spec, not a gate to game.** A deliberate design pivot may obsolete tests. Retarget them to the new rule; never skip or disable one to go green.
8. **Always merge after changes (owner rule, 2026-09-24).** Once a change is validated (the local checks pass and CI is green on the PR), merge it to `main` with a merge commit, without waiting to be asked. The owner reviews on the live Pages build, which only deploys from `main`. Nothing sits in a draft PR. Anything that can't be undone (deleting branches, closing others' PRs, publishing outside the repo) still needs the owner's go-ahead.

## 3. Architecture map

Presentation (`src/three/`), all used by the shipped build:

| File | What it holds |
|---|---|
| `night/main.ts` | Endless Night in 3D (`night.html`): a view of `stepRun` with a chase camera, road ribbons, seams, the night as a wall and the dark beyond it, HUD, minimap, sound and the run log. Covered by `smoke:toys`. |
| `bootstrap.ts` | The Levels game (quarantined): renderer, camera, input (keys + stick), HUD, mining/drone/slurp/eraser visuals, wiring. Covered only by the smoke test. |
| `road.ts` | The road model: free ribbon, rail lock and grip, corner braking, carry, slurp, junctions (PRs #35, #36, #38). |
| `loop.ts` | `Campaign`: Levels and Sandbox modes, per-day economy, banked ore, road carried within a shift, persistence. |
| `panel.ts` | The ⚙ control panel and quick-help. |
| `stick.ts`, `sliderCurve.ts` | Pure input and slider mappings (unit-tested). |
| `sun.ts`, `craters.ts` | Day arc and lighting; craters as walls. |

Simulation (`src/game/`):

| File | Role |
|---|---|
| `continuous.ts`, `continuousArena.ts` | The authoritative sim and arena generation. Used by the build. |
| `level.ts` | Level specs and map-derived budgets. Used by the build. |
| `night.ts` | Endless Night's rules, engine-free: the border, the clock, push-back, banking, dawn. Home Run draws it; the 3D game will too (DEV-66). Tested in `night.test.ts`. |
| `roadTree.ts` | The road as a tree of polylines rooted at home, with a spatial grid: nearest road, riding along it (home through branch points, out to tips), tips for ore placement. Engine-free (DEV-66). Tested in `roadTree.test.ts`. |
| `rover.ts` | The rover on its road, engine-free: driving and laying road, the rail and its grab and hop-off rules, the dark's leak, digging seams. Numbers in `RoverRules` and `RoverMods` per game (DEV-66). Tested in `rover.test.ts`. |
| `seams.ts` | Ore seams, engine-free: seeded placement (including beyond the road's tips after a bank) and the in-seam test (DEV-66). Tested in `seams.test.ts`. |
| `run.ts` | One run, engine-free: `stepRun` steps the night, the dark, the rover, digging, banking and dawn each frame and returns events for the view's effects. `HOME_RUN` holds the toy's numbers. Both Home Run and the 3D Endless Night step it (DEV-66). Tested in `run.test.ts`. |
| `random.ts` | The seeded random source (a seed is a map), shared by the core and the toys. |
| `hex.ts` | The lattice the laid road lives on. |
| `continuousSelfPlay.ts`, `continuousTrace.ts`, `routeAffordance.ts` | Self-play routes and analysis. Used by tests and `report:last-light`, not by the build. |
| `rules.ts`, `world.ts`, `types.ts`, `keys.ts` | The V0 grid prototype. Not in the build; kept as prior art with its tests. |

## 4. Test and proof state

Measured 2026-10-02 on `main` after PR #81:

- **Passing:**
  - `npm test`: 278 tests in 26 files (`night`, `roadTree`, `rover`, `seams` and `run` tests in `src/game` hold the rules core).
  - Build: one 688 kB chunk (184 kB gzipped).
  - `npm audit`: 0 vulnerabilities.
  - `smoke:continuous`: boot, HUD, one drive, and the phone HUD layout. Needs `CHROME_PATH` in this container.
  - `smoke:toys`: the Home Run toy and Endless Night 3D. The toy boots, Endless banks and pushes the night back, dawn wins at 150, END logs `quit`, and Contract banks. The 3D page draws every seam and road line, banks, wins at dawn, drives out, logs `endless:3d` runs, and runs a third run's dark reserve down until it ends `caught`.
  - `report:last-light`: 5/5 routes won.
- **CI** runs tests, build, both smoke tests and the last-light report on every push to `main` and every PR. `audit.yml` runs `npm audit` weekly on its own, so a new advisory can't turn a code change red.
- **Not covered:** the smoke test checks far less than the old Phaser smoke did (DEV-53). `npm run play:through` plays full levels to their end state but is too slow for CI, so it runs by hand.

## 5. Open work (Linear, project Moon Miner)

| Ticket | Priority | Issue |
|---|---|---|
| DEV-65 | High | Engine and toolkit survey: done 2026-09-30, keep Three.js (Claude Doc linked in §0) |
| DEV-66 | High | **Next.** Port Home Run's Endless Night loop into the 3D game. Steps 1–3 done: the rules core and `stepRun` in `src/game`, and Endless Night 3D at `night.html`. First playtest done (4 runs, 3 dawns); `RESERVE_RUN` (dark reserve, live dark seams, ore beside the road) landed 2026-10-05. Terrain first pass landed after it (rock, rubble, rough ground; rolled per map; never slows the rail). Next: playtest both; then road junctions (see `docs/research/LEVEL_GENERATION.md`) |
| DEV-70 | Medium | Dual view: 3D chase and 2D top-down of one run, each with an inset (design only, after DEV-66) |
| DEV-71 | Medium | Story campaign: modes as chapters of one machine (design only, after DEV-66) |
| DEV-68 | High | Endless Night: reliable rail, a clock that answers mining, a readable border (toy pass done; port carries it) |
| DEV-67 | Medium | Log the turn-home load and choice records in run data |
| DEV-60 | High | Levels too easy (evidence in its comments; DEV-66 is the planned fix) |
| DEV-14 | High | Drone timing decision (87% of runs launch none) |
| DEV-20 | High | Drone lift topology |
| DEV-13 | High | Close drift between build and design canon |
| DEV-24 | Medium | Road legibility |
| DEV-47 | Medium | Vehicle classes → road types |
| DEV-7 | Medium | PROGRESS contradictions |
| DEV-10 | Medium | Generate proof status mechanically |
| DEV-11, DEV-8 | Low | Smoke flag; machine-specific paths |
| DEV-50, DEV-51, DEV-52, DEV-53 | — | Retro-tickets; last-light notes; dead URL flags in docs; smoke coverage |

## 6. Design north star

`GAME_DESIGN.md` and `CONCEPT_REFRAME.md` (2026-07-01) still hold in outline: a competent machine, physical drone logistics, prepared road, and overextension → crawl → recovery. Neither mentions levels, the eraser, or junctions. DEV-13 owns reconciling them. `BETS.md` is the 2026-07-01 bet sheet.

`DESIGN_THEORY.md` (2026-09-30) sits under that canon and says how to test an idea against it. Its core claim: the fun is a push-your-luck sortie (carry ore out at risk, turn home before the clock) carried by the feel of riding your own road fast. The owner's three good moments, "riding my road fast, scooping a seam, beating the sunset", are that one sortie. `toys/README.md` records the toys' results.
