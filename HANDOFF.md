# Moon Miner — Handoff

Last updated: 2026-09-24, at `main` `bef3b58` (PR #40). Rewritten by DEV-58 from the 2026-09-24 state audit (`docs/audit/2026-09-24/STATE_AUDIT.md`).

This file is the cold start for a fresh agent: what the game is now, how we work on it and why, and where things live. The pre-rewrite handoff (Phaser-era §1–§8, written 2026-09-16) is archived at `docs/archive/HANDOFF_2026-09-16.md`. Keep it for intent, not for current facts.

The decision trail lives in `DECISIONS.md`. Its dated entries end 2026-09-15. PRs #10–#40 are indexed at the end of that file, and each one's reasoning is in its PR body and commit message.

---

## 0. Current substrate — read this first

- **The app is `index.html` → `src/three/bootstrap.ts`.** It is a Three.js scene with a real perspective camera, a ground plane, and the rover and drone as meshes. The road is painted into a canvas texture on the ground (a raster decal), never vector geometry. Do not reintroduce per-frame vector road drawing. That was the Phaser build's whole class of bugs (flashing, bowties, pinch).
- **The simulation is authoritative and engine-free.** `src/game/continuous.ts` and `continuousArena.ts` are pure TypeScript with their own tests. The 3D layer reads sim state and feeds input; it does not fork the rules.
- **Phaser is gone** (PR #10). `src/main.ts`, `src/scenes/*`, the `#moon-miner-continuous-debug-state` snapshot and `window.__moonMinerContinuous` no longer exist. The debug hook is now `window.__mm3d = { getState, road, keys }` (`bootstrap.ts:1418`).
- **Road and shadows.** The road is painted into the ground's emissive layer so daylight never changes its brightness (PR #34). three.js doesn't shadow emissive light, so `groundMat.onBeforeCompile` multiplies the emissive term by the sun's shadow factor, scaled by the Shadow on road knob and the sun's height (DEV-59). If the ground material is ever replaced, carry that patch over, or shadows will pass under the road again.
- **The 3D build reads no URL parameters.** `?mobile=1`, `?debug=1`, `?view=`, `?shift=` and `?sandbox=1` in older docs have no effect (DEV-52). The layout is the same on every screen, and drag-to-drive works with mouse or touch.

## 1. Cold start

- **Live build:** https://levi-anthony.github.io/moon-miner/. `.github/workflows/pages.yml` rebuilds it from `main` on every push.
- **Run locally:** `npm install`, then `npm run dev`, and open the URL Vite prints. `npm run dev` binds `0.0.0.0`, so the printed Network URL works from a phone on the same Wi-Fi.
- **Stack:** Three.js 0.186 + TypeScript + Vite 6; tests in Vitest 4.

### What the game is right now

Drive a nanobot-laying rover across a lunar field before sunset. Driving on new ground lays road (costs nanobots). Riding your own road is fast (the rail: grip, corner braking, one way off). Park on an ore seam to mine it, then ride your road home to extraction with the quota before the sun sets. The drone reclaims road for nanobots.

- **Levels (default, PR #40):** six authored levels (First haul, Two stops, The long lode, Branch lines, Rich and far, Last light), then an endless tail that tightens to a floor. Each level's sun, starting stock and quota come from a par route planned on the actual map (`src/game/level.ts`). Clear a level to go on; miss and you retry the same map.
- **Sandbox:** the open day → shift → game loop with every number a panel knob (`src/three/loop.ts`, `LoopConfig.mode = 1`).
- **HUD:** NANOBOTS (stock / cap), ORE (mined / quota), SUN (seconds), LEVEL, BONUS, a mode chip (`Building` / `Mining`), and an objective line.

### Controls

- **Drive:** W/A/S/D or arrow keys, or drag anywhere for a virtual stick. On the stick, pushing forward within ±20° drives straight (PR #37). S or pulling back reverses.
- **Drone:** Space or the `Launch` button.
  - Tapped while driving, or just after stopping, it does the usual end-of-road reclaim.
  - Stopped for the Eraser aim delay (0.8 s; pivoting in place is fine), a red ring marks the road straight ahead and Launch reads **Erase**. The drone erases that patch (PRs #38/#39).
- **Continue:** R or tap the banner, only after a level ends. It does nothing while playing.
- **⚙ panel:** live knobs grouped into collapsible sections (Controls, World, Ore pools, Rover & rail, Economy, Rail growth, Network & campaign, Slurp, Drone, Light & sky, and more). Wide ranges use curved sliders centred on the default (PR #39). Settings persist in `mm3d-*` localStorage keys.

## 2. How we work here (process doctrine — follow this)

1. **Screenshot-verify renders in headless Chromium before pushing.** Use a throwaway Playwright script with `CHROME_PATH=$(ls /opt/pw-browsers/chromium-*/chrome-linux/chrome | head -1)` to drive the game, take a `page.screenshot`, and read the PNG. `docs/audit/2026-09-24/session.mjs` is a working example.
2. **The headless sim runs slow.** Under SwiftShader, game time advances at roughly ¼–⅙ of wall time. Short probes that "prove" nothing changed are usually a timing artifact. Verify the actual number; don't infer.
3. **Read live state from `window.__mm3d.getState()`.** The smoke test (`scripts/continuous-smoke.mjs`) depends on it; keep it stable. `scripts/playthrough.mjs` also depends on it: it plays full levels with held keys and reads outcomes from `getState()` and the HUD.
4. **Pin the feel with distinguishing questions.** When the owner says something is "wrong" or "off", ask sharp multiple-choice questions that separate the candidate causes before changing code.
5. **Record and propagate every decision, including what was rejected and why.** The owner runs an ECB-first doctrine. For each meaningful change, put the trail in the PR body and commit message, add the PR to the index in `DECISIONS.md`, log an ECB pulse, and comment on the relevant Linear ticket (DEV team, workspace `ecos-ops`, project Moon Miner). If ECB or Linear is unavailable, say so and keep the repo record current for later propagation.
6. **Commit small and attributed.** Each logical change is its own commit with a descriptive body. Never put a model identifier in repo artifacts.
7. **Tests are a spec, not a gate to game.** A deliberate design pivot may obsolete tests. Retarget them to the new rule; never skip or disable one to go green.

## 3. Architecture map

Presentation (`src/three/`), all used by the shipped build:

| File | What it holds |
|---|---|
| `bootstrap.ts` | Renderer, camera, input (keys + stick), HUD, mining/drone/slurp/eraser visuals, wiring. Covered only by the smoke test. |
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
| `hex.ts` | The lattice the laid road lives on. |
| `continuousSelfPlay.ts`, `continuousTrace.ts`, `routeAffordance.ts` | Self-play routes and analysis. Used by tests and `report:last-light`, not by the build. |
| `rules.ts`, `world.ts`, `types.ts`, `keys.ts` | The V0 grid prototype. Not in the build; kept as prior art with its tests. |

## 4. Test and proof state

Measured 2026-09-24 at `bef3b58` (see `PROGRESS.md` "Last Verified"):

- **Passing:**
  - `npm test`: 189 tests in 18 files.
  - Build.
  - `npm audit`: 0 vulnerabilities.
  - `smoke:continuous`: boot, HUD and one drive. Needs `CHROME_PATH` in this container.
  - `report:last-light`: 5/5 routes won.
- **CI** runs tests, build, smoke and the last-light report on every push to `main` and every PR. `audit.yml` runs `npm audit` weekly on its own, so a new advisory can't turn a code change red.
- **Not covered:** the smoke test checks far less than the old Phaser smoke did (DEV-53). `npm run play:through` plays full levels to their end state but is too slow for CI, so it runs by hand.

## 5. Open work (Linear, project Moon Miner)

| Ticket | Priority | Issue |
|---|---|---|
| DEV-14 | High | Drone timing decision. Recheck after the eraser PRs. |
| DEV-20 | High | Drone lift topology. Recheck after PRs #38/#39. |
| DEV-13 | High | Close drift between build and design canon (`GAME_DESIGN.md`, `CONCEPT_REFRAME.md`) |
| DEV-56 | Medium | Phone HUD overlap |
| DEV-24 | Medium | Road legibility |
| DEV-47 | Medium | Vehicle classes → road types |
| DEV-7 | Medium | PROGRESS contradictions |
| DEV-10 | Medium | Generate proof status mechanically |
| DEV-11 | Low | `--experimental-websocket` flag |
| DEV-50 | — | Retro-ticket PRs #10–#40 |
| DEV-51 | — | Last-light notes ignore crawl |
| DEV-53 | — | Widen smoke coverage |

## 6. Design north star

`GAME_DESIGN.md` and `CONCEPT_REFRAME.md` (2026-07-01) still hold in outline: a competent machine, physical drone logistics, prepared road, and overextension → crawl → recovery. Neither mentions levels, the eraser, or junctions. DEV-13 owns reconciling them. `BETS.md` is the 2026-07-01 bet sheet.
