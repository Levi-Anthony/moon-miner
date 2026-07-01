# Moon Miner Handoff

Last updated: 2026-07-01

## Cold Start

Read in this order:

1. `CONCEPT_REFRAME.md`
2. `GAME_DESIGN.md`
3. `BETS.md`
4. `DECISIONS.md`
5. `PROGRESS.md`

Current active bet: **First-Feel Continuous Spike Playtest**, now with the mobile portrait/control feel and prepared-field magnetic grip lessons folded into the prototype.

Do not run `ROUND_1_PLAYTEST.md` sessions on the V0 grid build. That tracker is paused because it tests the wrong game.

## What Was Done

- Built and verified a V0 grid prototype in Phaser/TypeScript.
  - Why it matters: it proved project scaffolding, deterministic checks, browser smoke tests, and some rail/reclaim vocabulary.
  - Current status: prior art, not active design direction.
- Added project memory files and a 99th-percentile scaffolding standard.
  - Why it matters: future sessions can resume without chat context.
- Added an interpretive collaboration standard.
  - Why it matters: future work should infer the deeper ask, surface mental models, and red-team drift before building.
- Applied the interpretive standard backward to identify foundational drift.
  - Why it matters: the old build over-literalized "rail" into grid/train/puzzle logic.
- Added `CONCEPT_REFRAME.md` and rewrote `GAME_DESIGN.md`.
  - Why it matters: these now capture the real target: continuous live-action extraction, competent industrial machinery, physical drone reclaim logistics, arm-capacity mining, prepared field, and emergency crawl.
- Paused V0 Round 1 playtesting artifacts.
  - Why it matters: testing the old grid build would answer a comprehension question for the wrong game.
- Implemented the active continuous-motion spike in Phaser/TypeScript.
  - Why it matters: the repo now tests continuous steering, prepared field, just-in-time fabrication, emergency crawl, autonomous drone reclaim, arm-capacity mining, fertile-zone yield, and solar pressure.
  - Current status: active runnable build; V0 grid remains prior art in the repo.
- Tuned the continuous spike pressure curve.
  - Why it matters: the active build now has a test-locked short-run loop for prepared sprint, raw fabrication, emergency crawl, drone recovery, and mining yield.
  - Current status: ready for a first-feel read, not yet broad playtesting.
- Corrected the active scene to use an angled, heading-relative chase camera.
  - Why it matters: the simulation remains deterministic world coordinates, while the presentation now follows the rover like a third-person industrial vehicle camera instead of a static god's-eye map.
  - Current status: superseded as the default; still available in dev with `?view=chase`.
- Added an automated Playwright smoke harness for the active continuous scene.
  - Why it matters: keyboard steering/throttle/brake, `Space` drone launch, hidden debug snapshot integrity, debug overlay visibility, HUD text bounds, and mobile portrait touch controls are now deterministic browser checks instead of vibes.
- Made the default continuous scene player-first instead of dev-panel-first.
  - Why it matters: tuning controls and loop trace are hidden by default, `?debug=1` and `~` still expose them, and the hidden JSON snapshot remains available for tests.
- Reworked first-feel UX around readable vitals, player-facing state chips, stronger rover/field/drone feedback, and punchier event copy.
  - Why it matters: the fantasy beats should read as a playable prototype before they read as instrumentation.
- Added a portrait-first mobile playable spike.
  - Why it matters: mobile is not a scaled desktop. `?mobile=1` or portrait coarse-pointer devices use a vertical layout with top HUD, large launch action, bottom one-thumb drive pad, and no tap-to-navigate.
- Corrected mobile drive feel so release or center deadzone means idle.
  - Why it matters: always-on throttle felt bad. When there is no drive intent, the rover stops moving and stops printing field; prepared-seam mining can continue at reduced throughput while solar pressure advances.
- Added medium prepared-field magnetic grip.
  - Why it matters: prepared ground should keep a passive rover on the lane, resist deliberate pull-away, but never lock the player onto rails. Active steering can escape; passive steering is corrected back toward lane tangent/center.
- Tuned the default first-run arena toward a clearer three-beat level shape.
  - Why it matters: the opening runway now teaches, the upper lobe tempts, and the lower recovery seam is needed for quota instead of being optional scenery.
- Replaced the default fake-oblique chase presentation with a flat tactical view.
  - Why it matters: the level now reads as a route/drone logistics map first, while the old chase projection remains available with `?view=chase` for comparison.

## What Was Decided

- The active game is not a rail puzzle.
  - Decision: interpret rail as temporary prepared nano-field, not train track.
  - Why: train/track language induced puzzle and solvable route thinking.
- The machine must feel competent.
  - Decision: failures should blame player route shape, launch timing, greed, or hesitation, not slow/clumsy technology.
  - Why: the fantasy is a brilliant sci-fi industrial machine pushed into bad protocols.
- Drone reclaim is autonomous physical logistics.
  - Decision: player launches the drone, likely with `Space`; drone chooses/commits to a target, reclaims, and returns payload.
  - Why: route shape and launch timing should create strategy without micromanagement.
- Prepared field frees arm capacity.
  - Decision: prepared field is faster and lets arms mine harder; raw terrain consumes arms for just-in-time field fabrication.
  - Why: this links speed, mining, and visual arm activity into one readable system.
- Emergency crawl is the default punishment state.
  - Decision: no-field/no-delivery should trigger a painful automated crawl, not ordinary hard stop.
  - Why: preserves uncertain doom and lets the machine remain brilliant even in failure.
- The continuous-motion spike is now the active build.
  - Decision: keep V0 as prior art, but route the Vite entrypoint to the continuous scene.
  - Why: the next learning should come from the new motion/reclaim/mining spine, not the paused grid prototype.
- Default presentation should be playtest-first.
  - Decision: dev tuning and loop trace overlays are hidden unless `?debug=1` or `~` is used.
  - Why: debug tools were stealing the fantasy and making the build look like a parameter editor.
- Mobile should be portrait-first and one-thumb-first.
  - Decision: prioritize a vertical layout, large touch controls, explicit launch button, and drag drive pad over tap-to-navigate.
  - Why: vertical leaves room for readout plus controls, and single-thumb drive better matches the casual mobile feel.
- Mobile idle is real idle.
  - Decision: no touch intent means no movement and no field printing; prepared-seam mining can continue at reduced throughput.
  - Why: hidden throttle made the rover feel possessed, while a parked industrial extractor should still harvest from prepared ground.
- Prepared field is magnetic, not a hard rail.
  - Decision: passive no-steer correction is strong, active steer is resisted only when pulling against the field, and the field should not assist active turns.
  - Why: a first attempt that assisted active turns made the starter loop too easy and broke the intended overextension/crawl/drone recovery beat.
- Coherent level shape starts with three readable beats.
  - Decision: the first authored level should read as calibration runway, rich overextension lobe, and recovery seam.
  - Why: the previous ore distribution let the route meet quota too early, before the recovery pocket mattered.
- Flat tactical is the default view.
  - Decision: default to stable map projection with no camera rotation, Y squash, projection shear, or screen-Y depth scaling.
  - Why: the fake-oblique chase view looked like floating 2D geometry and hid the authored level shape.

## What Was Deferred

- Round 1 playtesting of the V0 grid prototype.
  - Why deferred: it would test the wrong game.
  - Revisit when: intentionally studying drift or after rewriting the plan for the continuous-motion spike.
- Selectable drone strategy modes.
  - Why deferred: launch timing and route geometry should carry reclaim strategy first.
  - Revisit when: physical drone reclaim is proven but needs more player agency.
- Manual arm assignment.
  - Why deferred: arms should feel like an autonomous intelligent scheduler.
  - Revisit when: automatic allocation is readable and players still want more control.
- Prebuild/planning phases.
  - Why deferred: risks returning to static puzzle play.
  - Revisit when: prepared field from live movement is proven and there is a clear need for higher-level planning.
- Full mobile polish.
  - Why deferred: the repo now has a playable portrait spike, but it still needs real device feel, thumb ergonomics, compact toasts, orientation handling, and visual tuning.
  - Constraint now: keep mobile portrait as a first-class path, avoid hover-only/right-click-only/tiny-control assumptions, and keep tap-to-navigate disabled until it is clearly useful.
- Skill trees, upgrades, story, savior RNG, deep ore taxonomy, and anomaly systems.
  - Why deferred: all can flavor the future but would obscure whether the base loop works.
  - Revisit when: the spike produces a compelling abundance/overextension/crawl/recovery cycle.

## Next Session Should Do This

Run a first-feel read of the tuned continuous spike on desktop and mobile portrait:

1. Preserve the old grid implementation as V0 prior art.
2. Ask one player to steer, mine, launch the drone, and keep the rover supplied before sunset without explaining the solution.
3. Watch whether they notice speed-state changes, nanobot drain, drone return payload, mining-rate differences, emergency crawl, and the prepared-field magnetic pull.
4. On mobile, watch whether release-to-idle, the drive pad deadzone, launch target size, and lack of tap-to-navigate feel natural.
5. Record whether the next slice should be route-lure readability, drone urgency/pulse polish, mobile ergonomics, more tuning, or broader playtesting.

Success means the player can describe why the rover slowed down, what the drone returned, why mining felt better on prepared field, and why prepared ground felt helpful without feeling like a lock-on rail.

## Taste Notes For The Next Session

- The right default is "playable prototype first, tuning workstation second."
- Keep the machine competent. Failures should feel caused by route shape, greed, hesitation, launch timing, or steering choices.
- Mobile vertical is probably the better casual direction. Landscape may look more game-like, but portrait gives cleaner room for thumb controls plus readout.
- Do not resurrect always-on mobile throttle. Release and center deadzone must mean idle.
- Parked prepared-seam mining is good; raw idle mining is not. The machine should feel like an extractor without bypassing the nanobot route loop.
- Do not make prepared field a hard rail. The taste target is medium magnetic: enough to hold passive travel, not enough to deny active steering.
- Keep diagonal energy in level layout and camera framing, not fake perspective. The tactical view should feel like a living extraction map.
- If a tuning change makes the self-play/no-drone route win before crawl/drone recovery, it is probably too generous for the current proof loop.
- Keep `#moon-miner-continuous-debug-state` and `window.__moonMinerContinuous` stable; the smoke harness is now part of the design guardrail.
- The mobile reset button is still too prominent for a player build. Consider moving it behind pause/debug later.
- The portrait event feed is serviceable, but a compact local toast may be cleaner if messages compete with the rover.
- Drone urgency can still get louder: pulse the launch button in low-nanobot/crawl states, strengthen target reservation, and make delivery bursts unmistakable.
