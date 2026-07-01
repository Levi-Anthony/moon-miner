# Progress

## Current Reality

- Dev server: `npm run dev` verified on 2026-07-01. Vite printed `http://localhost:5173/`, and `curl -I http://localhost:5173/` returned `HTTP/1.1 200 OK`.
- Desktop URL pattern: `http://localhost:<printed-port>/`
- Mobile simulation URL pattern: `http://localhost:<printed-port>/?mobile=1`
- Debug URL pattern: `http://localhost:<printed-port>/?debug=1`
- Unit tests: known green as of 2026-07-01.
- Build: known green as of 2026-07-01.
- Audit: `npm audit` last reported 0 vulnerabilities on 2026-07-01.
- Smoke: known red as of 2026-07-01.

## Last Verified

Date: 2026-07-01

Commands run:

- `npm test`: passed, 44 tests.
- `npm run build`: passed.
- `npm audit`: passed, 0 vulnerabilities reported at run time.
- `npm run verify`: passed.
- `npm run verify:known-green`: passed when `npm audit` was allowed to reach the npm registry.
- `npm run smoke:continuous`: failed with `Timed out waiting for return payload cue.`
- `npm run dev`: started Vite at `http://localhost:5173/`; local URL returned `HTTP/1.1 200 OK`; server was stopped with `Ctrl+C`.

Results:

- Known-green baseline is unit tests, production build, and audit.
- Browser smoke remains an integration risk and should be fixed or quarantined in a separate slice.

## Known Red

- `npm run smoke:continuous` currently fails during the drone readability section. The latest verified failure is `Timed out waiting for return payload cue.`
- Earlier repeated smoke attempts also timed out waiting for `outbound reserved target cue`, so the whole drone readability section should be treated as suspect until diagnosed.
- Treat any claim that "all checks pass" as incomplete unless it explicitly accounts for this known-red smoke check.

## Last Good Commit

- This repository had no commits on `main` before the beginner operations scaffold checkpoint. After that checkpoint exists, run `git log --oneline -1` to see the exact latest commit.

## Next Slice

1. Preserve this beginner operations scaffold as the first Git checkpoint.
2. Fix or split the red `npm run smoke:continuous` browser integration check.
3. Run the first-feel continuous spike playtest only after current reality is green or the red check is intentionally quarantined.

## Completed

- Created initial Vite, Phaser, TypeScript project structure.
- Added deterministic map generation.
- Added auto-printed rail with nanobot cost.
- Added rover movement constrained to rail.
- Added ore mining.
- Added helper bot reclaiming and nanobot refund.
- Added solar timer with win/loss states.
- Added unit tests for core rules.
- Added project memory docs.
- Added first bet/appetite analysis in `BETS.md`.
- Added state-derived objective guidance.
- Added dismissible mission briefing.
- Added connected rail rendering.
- Pivoted core controls to active driving with automatic rail printing.
- Added rover facing and short movement interpolation.
- Added visual flashes for auto-print, move, mine, reclaim, blocked, win, and loss events.
- Added generated Web Audio tones for core actions.
- Red-team fix: mission briefing now pauses the simulation timer.
- Red-team fix: ended runs no longer spam blocked feedback from held movement keys.
- Added helper bot rail-path animation before reclaim refunds.
- Red-team fix: rover can no longer drive onto an active reclaim target, and in-progress reclaim hover feedback no longer reads as invalid.
- Tuned the default run to require reclaiming safe old rail before the second ore.
- Smoothed first-run pacing with queued destination driving, contextual dead-end reclaim, faster reclaim timing, and a small nanobot cushion.
- Added a dev-only browser debug snapshot and verified the full first-run canvas click-through in the in-app browser.
- Added comprehensive playtesting plan, trace schema, and prompt package.
- Added a concrete Round 0 solo sanity move script to `PLAYTESTING.md`.
- Ran a Round 0 in-app browser sanity pass for click movement, queued routes, auto-printing, blocked terrain, mining, reclaiming, return-to-base win state, and console errors. Keyboard movement still needs a human/manual confirmation because synthetic key events did not reach Phaser in the in-app browser harness.
- Ran click-only strategy and bug-hunt sweeps: invalid actions, early reclaim, alternate ore orders, briefing/timer interruption, reset behavior, and deterministic chaos clicks. No console errors or invariant breaks found; logged early reclaim bypass as a balance/design finding in `BUGS.md`.
- Added a reusable 99th-percentile scaffolding execution standard with phases, checkpoints, scoring, and cold-read step instructions.
- Locked the first-run reclaim lesson by moving the tutorial old rail near the first ore, preventing immediate starting reclaim, and preserving the reclaim-required default route.
- Added the automatic next-bet recommendation format: obvious bet, alternative bet, sleeper bet, tradeoffs, honest winner, confidence, and flip conditions.
- Started the Round 1 first-time comprehension bet with an active five-participant tracker in `ROUND_1_PLAYTEST.md`.
- Added the interpretive collaboration standard: infer the deeper ask, surface useful mental models, identify unasked questions, and red-team drift before locking meaningful product or creative work.
- Applied the interpretive standard backward and corrected foundational drift: the grid prototype is now V0 prior art, Round 1 grid playtesting is paused, and the active direction is a continuous-motion nano-field extraction game.
- Added `CONCEPT_REFRAME.md` and rewrote `GAME_DESIGN.md` around prepared field, autonomous drone reclaim logistics, arm-capacity mining, emergency crawl, and machine competence.
- Added `HANDOFF.md` so the next session can immediately see what was done, decided, deferred, why each matters, and what to do next.
- Added a deterministic continuous simulation for rover motion, prepared nano-field, just-in-time fabrication, emergency crawl, autonomous drone reclaim, arm-capacity mining, fertile-zone yield, and solar pressure.
- Added continuous simulation tests covering prepared sprint, raw fabrication spend, emergency crawl, drone reclaim/delivery, mining-capacity advantage, and solar loss.
- Added the active continuous Phaser scene with pointer steering, keyboard steering/throttle/brake, `Space`/button drone launch, reset, generated rover/arms/field/drone/mining visuals, HUD state, and dev debug snapshot.
- Switched the Vite entrypoint to the continuous-motion spike while preserving the V0 grid scene and rules as prior art.
- Updated README controls and proof notes for the active continuous build.
- Tuned the continuous spike pressure curve: lower starting stock, stronger raw-fabrication drain, more valuable reclaim payloads, short prepared-field maturation, and lower emergency crawl recovery.
- Added regression proof that one short script can demonstrate prepared sprint, just-in-time fabrication, emergency crawl, drone recovery, and mining yield.
- Added proof that drone return is slower when the rover keeps driving away, preserving route-shape consequence.
- Added HUD readouts for drone return payload, mining yield, and arm allocation.
- Corrected the continuous scene to render through an angled, heading-relative chase camera with inverse-projected pointer steering, instead of a flat/static god's-eye map.
- Changed prepared nano-field rendering from isolated stamped ellipses to connected ribbon lanes so it reads as a continuous road-like surface.
- Installed Playwright and added a deterministic continuous-scene smoke harness for keyboard steering, throttle, brake, `Space` drone launch, default hidden debug overlays, `?debug=1`, `~` overlay toggling, HUD text bounds, and mobile portrait controls.
- Reworked the default continuous presentation so dev tuning and loop trace are collapsed by default while the hidden debug snapshot remains stable for automation.
- Improved first-feel HUD and world readability: larger vitals, player-readable speed/state chip, stronger prepared-field ribbon, drone path/target/delivery feedback, clearer rover/arm hierarchy, and punchier event copy.
- Added a portrait-first mobile layout selected by `?mobile=1` or portrait coarse-pointer devices.
- Added mobile one-thumb drive controls, a large launch action, top HUD, bottom control pad, and disabled tap-to-navigate in portrait mode.
- Corrected mobile control feel so release or center deadzone means idle; no drive intent now prevents movement and field printing while solar pressure still advances.
- Added medium prepared-field magnetic grip: passive correction keeps the rover on prepared ground, active steering can pull away, and active turns are resisted rather than assisted.
- Added regression coverage for no-drive idle behavior, passive prepared-field magnetization, and active steering escape from magnetic grip.
- Changed mining feel so parked prepared-seam mining continues at reduced throughput; raw idle still does not move, print field, or mine.
- Moved the mobile debug Dynamics panel into a right-side workbench gutter when `?mobile=1&debug=1` has desktop-width room.
- Tuned the default first-run arena into a clearer three-beat level shape: calibration runway, rich overextension lobe, and lower recovery seam.
- Added flat tactical as the default view mode, preserved the old chase projection behind `?view=chase`, and exposed `ui.viewMode` in the continuous debug snapshot.
- Redrew the tactical backdrop and map primitives without fake Y squash, heading-relative camera rotation, projection shear, or screen-Y depth scaling.
- Added beginner operations scaffolding: `START_HERE.md`, `HUMAN_OPERATING_SYSTEM.md`, README quick-start links, package verification scripts, and explicit Git/proof discipline.

## Latest Proof

Earlier 2026-07-01 proof record:

- `npm test`: 38 tests passed.
- `npm run build`: production build passed.
- `npm run smoke:continuous`: Playwright smoke passed for desktop keyboard controls, `Space` drone launch, hidden/default debug overlays, HUD text bounds at `1040x720`, mobile idle/deadzone, mobile drag drive, mobile drone tap, minimum touch target size, and disabled mobile tap-to-navigate.
- `npm audit`: passed.
- Last smoke summary: `A` steer delta `-0.184 rad`, `D` steer delta `0.191 rad`, coast/throttle/brake speeds `109.1 / 132.0 / 37.0`, `Space` drone status `outbound`, mobile idle speed `0.0`, mobile deadzone speed `0.0`, mobile portrait drive delta `0.572 rad`, mobile launch target minimum `79.8px`.
- In-app browser playtest on the tuned first-run arena hit the intended loop: crawl at about `12.0s`, drone recovery at about `14.8s`, quota at about `27.1s`, with the rover in the lower recovery seam and `hitLoop=true`.
- `?mobile=1&debug=1` workbench verification: debug panel visible, portrait game mode active, panel did not overlap the game container or canvas.
- Tactical view proof: smoke verified default `ui.viewMode=tactical`, `?view=chase` reports `ui.viewMode=chase`, and the mobile debug workbench still sits outside the portrait game.
- Tactical Auto Route proof: recovery screenshot captured around `24.0s`, `ore=27.4/28`, `nanobots=0.8`, and `hitLoop=true`.
- Captured proof screenshots in `/private/tmp`: `moon-miner-mobile-portrait.png`, `moon-miner-desktop-after-mobile.png`, plus earlier UX states for fresh start, building, crawl, drone return, and drone delivery.
- Captured tactical proof screenshots in `/private/tmp`: `moon-miner-tactical-fresh.png`, `moon-miner-tactical-early-runway.png`, `moon-miner-tactical-drone-return.png`, `moon-miner-tactical-recovery-seam.png`, and `moon-miner-chase-comparison.png`.

2026-06-29:

- `npm test`: 25 tests passed.
- `npm run build`: production build passed.
- Headless Chrome smoke at `http://localhost:5174/`: active continuous scene rendered, debug state advanced, pointer steering changed route, the `Drone` button launched reclaim and returned to ready, screenshot capture succeeded, and no console errors were reported.
- Visual smoke screenshot confirmed the continuous scene reads as a vehicle-follow camera: rover low in frame, forward space above it, world rotating around heading.
- Visual smoke screenshot confirmed the driven field reads as a connected surface rather than a chain of separate patches.
- Current active scene exposes `#moon-miner-continuous-debug-state`.
- Prior V0 grid proof retained: headless Chrome smoke at `http://localhost:5173/` confirmed starting reclaim on `(10,10)` failed as unreachable, first ore left the rover at 7 nanobots, adjacent highlighted reclaim dispatched the helper bot, reclaim refunded to 9 nanobots, second ore was mined, and return to base ended in `phase=won`.
- Documentation closeout: current README, `HANDOFF.md`, `CONCEPT_REFRAME.md`, `GAME_DESIGN.md`, `BETS.md`, `DECISIONS.md`, `PROGRESS.md`, `PLAYTESTING.md`, `ROUND_1_PLAYTEST.md`, and `PRIOR_ART.md` now agree that the continuous-motion spike is the active build and V0 grid playtesting remains paused.

## Next Bet Recommendations

Generated after the 2026-07-01 UX, mobile, and magnetic-grip passes.

### Obvious Bet: First-Feel Continuous Spike Playtest On Desktop And Mobile Portrait

Run one lightweight first-feel session on the tuned spike, focused on whether prepared sprint, fabrication drain, drone recovery, arm-capacity mining, emergency crawl, mobile idle/drive intent, and prepared-field magnetic grip read as one coherent machine loop.

Tradeoff: This gets human signal now that the loop is test-locked, but a single session will still be directional rather than definitive.

### Alternative Bet: Drone Urgency And Route-Lure Polish

Make the drone launch opportunity, target reservation, return payload, delivery burst, and first prepared route lure more unmistakable before putting the build in front of someone else.

Tradeoff: This could make the fantasy land harder, but it risks polishing the wrong cues before seeing what a player actually misses.

### Sleeper Bet: Mobile Ergonomics Pass

Test on a real phone/tablet, then tune thumb reach, event feed placement, reset visibility, orientation handling, and touch target spacing.

Tradeoff: Mobile is now plausible enough to deserve attention, but it should not displace the core loop read unless touch feel is obviously blocking.

### Winner

First-feel continuous spike playtest on desktop and mobile portrait.

Rationale: The tuned spine now has proof for the intended loop, route-shape consequence, deterministic browser controls, mobile idle/drive behavior, and prepared-field magnetic grip. The highest-leverage unknown is whether a human perceives the loop and likes the feel without us explaining it.

Confidence: High.

What would raise confidence: The player can describe why the rover slowed down, what the drone returned, why mining felt better on prepared field, and why the prepared field felt magnetic without feeling like a hard rail.

What would lower confidence: The player cannot operate the controls long enough to see the loop, or mobile idle/drive intent feels slippery or surprising.

What would flip the recommendation: If a quick internal read already shows obvious visual confusion, do the drone urgency/route-lure polish first. If mobile feel blocks play entirely, do the ergonomics pass first.

## Next Slices

1. Run a first-feel test focused on route shape, drone launch timing, prepared-field mining, emergency crawl, mobile one-thumb driving, and prepared-field magnetic grip.
2. Record the observed findings and choose whether the next slice is route-lure readability, drone urgency/pulse polish, mobile ergonomics, more tuning, or broader playtesting.
3. Preserve the grid prototype as V0 prior art unless explicitly studying drift.
4. Later: revisit mobile/touch polish, upgrades, ore taxonomy, anomalies, and safe-vs-unapproved route economy.
