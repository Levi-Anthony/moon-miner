# Bets

## 2026-07-01: First-Feel Continuous Spike Playtest On Desktop And Mobile Portrait

### Bet

The active continuous spike is ready for a very small first-feel read now that default UX, deterministic smoke proof, mobile portrait controls, idle behavior, and prepared-field magnetic grip have been brought into alignment with the intended fantasy.

### Appetite

One lightweight moderated session or solo observed pass. Do not add new systems first. Use the active continuous build on desktop and `?mobile=1`, with the existing debug snapshot only as proof instrumentation.

### Scope

- Watch whether prepared sprint, fabrication drain, drone recovery, arm-capacity mining, emergency crawl, and medium magnetic field grip read without explanation.
- Watch whether mobile one-thumb drive feels natural: release and center deadzone must mean idle.
- Watch whether disabling mobile tap-to-navigate feels clean or whether players miss a convenience shortcut.
- Capture whether drone launch, target reservation, return payload, and delivery are obvious enough in motion.

### Completion Check

- One observed first-feel run or explicit stop condition is recorded.
- Findings separate loop readability, desktop control feel, mobile control feel, drone readability, and tuning balance.
- The next bet is chosen from evidence: route-lure readability, drone urgency/pulse polish, mobile ergonomics, more tuning, or broader playtesting.

### Current Taste Notes

- The game should open as a playable prototype, not a parameter editor.
- Portrait mobile currently feels like the better casual direction because it leaves room for readout plus thumb controls.
- Always-on mobile throttle is wrong for this game. Idle should be under the player's thumb.
- Prepared field should be medium magnetic: helpful when passive, resistive when active, never a hard rail.
- If a tuning change lets the no-drone/self-play route win before the crawl/drone recovery beat, it probably undermines the current proof target.

## 2026-06-29: First-Feel Continuous Spike Playtest

Status: superseded by the 2026-07-01 first-feel bet, which adds UX, smoke, mobile, idle, and magnetic-grip learnings.

### Bet

The tuned continuous spike is ready for a very small first-feel read focused on whether a player can perceive prepared sprint, fabrication drain, drone recovery, arm-capacity mining, and emergency crawl as one coherent machine loop.

### Appetite

One lightweight session or solo moderated pass. Do not add new systems before observing the tuned loop. Use the active continuous build, current debug snapshot, and a neutral prompt that asks the player to steer, mine, and keep the machine supplied before sunset.

### Scope

- Watch whether the player notices speed-state changes, nanobot drain, drone return payload, mining-rate differences, and emergency crawl.
- Capture confusion around the drone button, route shape, HUD terms, and whether failure feels caused by decisions or by clumsy tech.
- Stop if the player cannot identify what the drone did or why the rover slowed down.

### Completion Check

- One observed first-feel run or an explicit stop condition is recorded.
- Findings separate system readability, control feel, and tuning balance.
- The next bet is chosen from evidence: more tuning, animation clarity, control changes, or a broader playtest.

## 2026-06-29: Tune Continuous Spike Pressure Curve

Status: implemented in the active continuous build. Keep this section as the completed bet record.

### Bet

Now that the continuous-motion spike exists, the next useful slice is tuning feel and pressure around field buffer, drone cycle time, emergency crawl, and mining yield until the core loop is readable without adding new systems.

### Appetite

One compact tuning and feel pass. Keep the current simulation, generated visuals, desktop-first controls, autonomous drone, automatic arms, and V0 grid prior art. Do not add upgrades, story, selectable drone strategies, manual arm assignment, mobile polish, or new ore taxonomy.

### Scope

- Tune starting nanobots, fabrication drain, field value, drone speed, pickup radius, crawl recovery, fertile-zone yield, and solar duration.
- Improve visual readability only where it clarifies system state: prepared sprint, raw fabrication, drone payload/return, emergency crawl, and mining capacity.
- Run a short solo first-feel script that intentionally demonstrates abundance, overextension, crawl, and recovery.

### Completion Check

- A player can see the rover transition through prepared sprint, just-in-time fabrication, emergency crawl, and drone recovery in one run.
- Drone launch timing and route shape visibly affect supply recovery.
- Prepared field produces clearly stronger mining than raw fabrication.
- `npm test`, `npm run build`, and a browser smoke pass succeed.

## 2026-06-29: Continuous-Motion Rail/Fabrication Spike

Status: implemented in the active Phaser scene. Keep this section as the completed bet record.

### Bet

The next useful build is a fresh continuous-motion spike inside the existing Phaser/Vite repo. The spike should prove whether route shape plus drone launch timing can create a felt cycle of abundance, overextension, emergency crawl, and recovery.

### Deeper Inferred Ask

The user is not asking for a train-track puzzle. They are asking for a kinetic sci-fi stock-flow machine fantasy where brilliant autonomous systems make success feel easy until bad route decisions, hesitation, greed, or mistimed drone launches force ugly fallback protocols.

### Appetite

One focused feel/mechanics spike. Preserve the existing grid prototype as V0 prior art and keep the repo scaffolding. Do not add upgrades, mobile polish, selectable drone strategy modes, manual arm assignment, deep ore taxonomy, story, campaign, or savior RNG yet.

### Scope

- Replace the active play direction with continuous rover motion in an angled top-down view.
- Model prepared nano-field, just-in-time fabrication, and emergency crawl.
- Let arms automatically allocate between field building and mining based on terrain and prepared field.
- Make `Space` launch a fast autonomous reclaim drone that physically returns payload to the moving rover.
- Make route shape and launch timing visibly affect reclaim latency and nanobot supply.
- Keep desktop controls first while preserving touch-compatible interaction assumptions.

### Completion Check

- A playable browser spike shows prepared-field sprint, just-in-time fabrication, and emergency crawl.
- The drone visibly leaves, reclaims old field, returns payload, and makes poor route shape or launch timing costly.
- Mining yield visibly improves when arms are freed by prepared field.
- The machine feels competent; failures read as player/system tradeoff consequences, not slow or clumsy tech.
- `npm test`, `npm run build`, and a browser smoke pass succeed.

### Next-Bet Recommendations At Completion

- Obvious: tune the pressure curve around field buffer, drone cycle time, and emergency crawl.
- Alternative: build the first mining-zone pass if movement/reclaim already feels good.
- Sleeper: create an animation-only machine competence polish pass if the system works but does not feel brilliant.
- Winner should be chosen from actual spike evidence, not from the old grid build.

## 2026-06-29: Round 1 First-Time Comprehension

Status: paused because it targets the V0 grid prototype, which no longer reflects the intended game.

### Bet

Original paused bet: the V0 grid build was ready for five moderated first-time playtests, and manual observation would have decided whether the next grid slice should fix comprehension, add measurement, or improve route planning feedback.

### Why Deferred

This would answer the wrong question. The grid build drifted toward deterministic puzzle play, while the intended direction is continuous live-action pressure. Keep the tracker as research scaffolding, but do not recruit players for the grid build unless explicitly studying the drift.

### Completion Check

Deferred until a continuous-motion prototype exists or the user explicitly asks to study the V0 grid prototype.

## Historical Bets

## 2026-06-29: Lock The First-Run Reclaim Lesson

### Bet

A first-time player should learn reclaim when resource pressure appears after the first ore, not by reclaiming a free starting spur. The old rail should become useful only after the player has built enough route context for the helper bot path and nanobot refund to make sense.

### Appetite

One compact tuning and affordance slice. Keep the deterministic map, existing rules, helper bot, guidance panel, and tests. Do not add unlock gates, new resources, campaign structure, save/load, procedural tuning, or new mechanics.

### Scope

- Move the tutorial old rail to the first-ore area so it is disconnected at the start.
- Preserve the default route pressure: first ore leaves the rover short of the second-ore route.
- Let highlighted low-resource reclaim targets be clicked from Drive mode, even when adjacent to the rover.
- Update tests and docs for the route-side reclaim lesson.

### Completion Check

- Immediate reclaim from the starting state fails because the helper bot cannot reach the old rail.
- After mining the first ore, the old rail is highlighted and reclaimable.
- Reclaiming it refunds enough nanobots to reach the second ore.
- Tests and build pass.

## 2026-06-26: Teachability Before More Mechanics

### Bet

Make the existing loop easier to understand before adding new systems. The game already has the core pieces: rail, nanobots, rover movement, ore, reclaiming, timer, win/loss. The next risk is not missing content; it is that a first-time player cannot tell what to do or why a move failed.

### Appetite

One compact slice. No new resources, upgrades, enemies, campaign structure, save system, art pipeline, or procedural complexity.

### Scope

- Add state-derived objective guidance.
- Add a dismissible mission brief.
- Add connected rail rendering so routes read as paths.
- Keep controls and rules unchanged.

### Completion Check

- A new player can infer the first move from the screen.
- Rail turns and branches are visually connected.
- The game still passes tests, build, and audit.

## 2026-06-26: Active Driving Over Manual Track Placement

### Bet

Moon Miner should feel like driving a rover with an advanced rail-printing system, not placing separate track pieces. Directional movement should be the primary verb; rail construction should happen automatically when the player drives into valid terrain.

### Appetite

One control-model pivot. Keep the deterministic grid, existing terrain rules, nanobot economy, mining, reclaiming, and win/loss conditions.

### Scope

- Change directional movement to auto-print rail when needed.
- Keep click-to-reclaim for helper bot routing.
- Keep click-to-drive as a secondary mouse option for adjacent tiles.
- Do not introduce physics, acceleration, rotation, camera scrolling, or continuous collision yet.

### Completion Check

- Holding WASD or arrow keys drives the rover tile by tile.
- Driving into untracked valid terrain creates rail and spends nanobots.
- Driving onto existing rail does not spend nanobots.
- Blocked terrain and insufficient nanobots still stop movement clearly.

## 2026-06-26: Tactile Vehicle Feedback

### Bet

After the active-driving pivot, the next missing feel is confirmation. Each action should produce a small visual and audio response so the player can tell whether they moved, auto-printed rail, mined, reclaimed, won, lost, or hit a blocked action.

### Appetite

One scene-layer polish slice. Keep simulation deterministic and avoid external asset pipelines.

### Scope

- Add rover facing and short tile-to-tile movement interpolation.
- Add transient flashes for auto-print, movement, mining, reclaiming, blocked actions, win, and loss.
- Add generated Web Audio tones for core actions.
- Pause simulation while the mission briefing is visible.
- Do not add sprite sheets, music, settings screens, continuous physics, or camera movement yet.

### Completion Check

- Driving feels like a vehicle action rather than an instant teleport.
- Auto-printing is visually and audibly distinct from moving on existing rail.
- Failed actions produce a clear blocked response.
- Tests, build, audit, and localhost smoke check pass.

## 2026-06-28: First-Run Reclaim Tutorial

### Bet

Moon Miner’s core loop will become clearer if the default run teaches reclaim as part of normal route planning. The helper bot should not feel like an optional side feature; it should be the moment where the rail economy clicks.

### Appetite

One compact tuning slice. Use the existing deterministic map, rules, helper bot, guidance panel, and tests. Do not add campaign structure, save/load, upgrades, procedural tuning, or new mechanics.

### Scope

- Tune the default seed so reclaim is necessary on the intended first successful route.
- Make the safe reclaim opportunity obvious.
- Improve reclaim guidance only where the player needs it.
- Add a full default-route regression test that includes reclaim.
- Preserve current movement, mining, refund, and win/loss rules.

### Completion Check

- A new player can understand why reclaim matters during the first successful run.
- The default win path includes at least one reclaim without feeling punitive.
- The helper bot path animation reinforces the rule.
- Tests and build pass.
