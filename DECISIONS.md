# Decisions

## 2026-06-26: Browser First

Use Phaser 3, TypeScript, and Vite so the game is easy to run, share, screenshot, test, and deploy.

## 2026-06-26: Deterministic Grid First

Use grid movement instead of physics. The important V1 question is whether rail scarcity creates good route-planning tension.

## 2026-06-26: Separate Rules From Rendering

Keep command validation and simulation in pure TypeScript modules. Phaser renders and collects input, but it should not own core game rules.

## 2026-06-26: Reclaiming Is Core, Not Polish

The helper bot and reclaim loop are part of the first playable version because they differentiate Moon Miner from pure rail-building games.

## 2026-06-26: Movement Drives Rail Creation

The player should primarily drive the rover. Rail is auto-printed as part of successful movement into untracked valid terrain, keeping the fantasy closer to an active vehicle with built-on-demand infrastructure.

## 2026-06-26: Feedback Is Presentation-Only

Rover interpolation, flashes, and generated tones live in the Phaser scene. Core rules remain deterministic TypeScript functions so tests and future AI sessions can reason about gameplay without browser/audio state.

## 2026-06-29: Reclaim Lesson Appears After First Route Pressure

Place the tutorial old rail near the first ore instead of beside base. This keeps reclaim visible in the same run, but prevents a player from claiming the refund before nanobot scarcity has any meaning. The rules stay unchanged: the helper bot can reclaim only rail connected to base by built rail.

## 2026-06-29: V0 Grid Prototype Is Prior Art, Not The North Star

Pause the planned Round 1 playtest of the grid prototype. The build is useful evidence and scaffolding, but it answers a puzzle-comprehension question rather than the user's deeper target: continuous live-action pressure, competent industrial machinery, physical reclaim logistics, and prepared-field stock-flow management.

## 2026-06-29: Replace Rail Constraint With Prepared Nano-Field

Interpret "rail" as temporary high-performance traction/harvest field, not train track. The rover should be all-terrain and surprisingly nimble within the limits of prepared field, with raw terrain and field starvation creating speed/capacity penalties instead of tile-blocking puzzle logic.

## 2026-06-29: Drone Reclaim Is Autonomous Physical Logistics

The player launches the drone, likely with `Space`, but does not micromanage it. The drone should be fast, deterministic, and visibly competent: it selects a reclaim target, flies to old field, vacuums nanobots, and returns payload to the moving rover. If it is late, the player should blame route shape or launch timing, not the technology.

## 2026-06-29: Arms Are The Visible Capacity Scheduler

The spider-like rover arms are not merely eye candy. They visualize limited industrial capacity allocated automatically among field fabrication, mining, stabilization, scanning, and emergency scraping. Prepared field frees arms for mining; raw terrain consumes arms for just-in-time fabrication.

## 2026-06-29: Emergency Crawl Beats Ordinary Hard Stops

When field and delivered nanobots run out, the rover should almost stop but remain alive through a visible fallback protocol: big arms fold aside, tiny local reclaim legs scrape residue, and one desperate build arm creates enough field for a painful crawl. This creates uncertain doom without passive waiting.

## 2026-06-29: Continuous Spike Is The Active Entrypoint

Keep the V0 grid scene and pure grid rules in the repo as prior art, but route the app entrypoint to the continuous-motion scene. The active proof target is now continuous steering, prepared nano-field, autonomous drone reclaim, arm-capacity mining, emergency crawl, and solar pressure.

## 2026-06-29: Fresh Field Must Mature Before It Counts As Prepared

Just-in-time fabricated field should not immediately become high-performance prepared field under the rover. A short maturation delay preserves the intended stock-flow pressure: raw terrain drains nanobots, earlier route choices create fast return lanes, and emergency crawl remains reachable without making the machine feel broken.

## 2026-06-29: Angled Top-Down Is A Heading-Relative Chase Camera

Keep the continuous simulation in ordinary world coordinates, but render the playfield through an angled, heading-relative chase projection with inverse-projected pointer input. The rover should sit low in frame, forward space should open above it, and the world should move/rotate around the vehicle rather than reading as a static god's-eye map.

Status: superseded as the default view on 2026-07-01. The chase view remains available in dev builds with `?view=chase` for comparison.

## 2026-06-29: Prepared Field Should Read As Continuous Surface

Render nano-field patches as connected ribbon lanes, not isolated stamped ellipses. The simulation can remain patch-based for reclaim and stock-flow accounting, but the player-facing read should be a continuous prepared road-like surface that the rover has fabricated.

## 2026-07-01: Debug Tools Are Opt-In Presentation

Hide tuning controls and loop trace by default. Keep `?debug=1`, `~`, `#moon-miner-continuous-debug-state`, and `window.__moonMinerContinuous` available so tests and future tuning still have the instrumentation they need.

## 2026-07-01: Smoke Tests Are Design Guardrails

Use the Playwright continuous smoke harness to protect not only mechanics but also first-feel presentation: keyboard steering/throttle/brake, `Space` launch, debug overlay visibility, HUD text bounds, mobile idle/deadzone, mobile drag drive, drone tap, touch target size, and disabled portrait tap-to-navigate.

## 2026-07-01: Mobile Is Portrait-First And One-Thumb-First

Treat mobile as its own play posture, not a scaled desktop viewport. The default mobile path should use a vertical layout, top HUD, bottom drive pad, large launch action, and no tap-to-navigate until that interaction proves useful as quality-of-life.

## 2026-07-01: Mobile Drive Intent Must Be Explicit

Release or center deadzone on the mobile drive pad means idle. With no drive intent, the rover should not move or print field. Prepared-seam mining can continue at reduced throughput, while raw-terrain idle should not mine. Solar pressure can continue ticking so idle remains a choice with cost.

## 2026-07-01: Prepared Field Is Medium Magnetic

Prepared ground should keep a passive rover on the lane and resist pull-away, but it must let active steering escape. Magnet correction should not assist active turns, because that made the proof loop too easy and weakened the intended overextension, crawl, and drone recovery beat.

## 2026-07-01: Parked Mining Works Only On Prepared Seam

Mining should not require constant forward motion once the machine is parked on prepared field inside a seam. Let the arms harvest at reduced throughput while idle so the rover feels like a real extractor, but keep raw-terrain idle from mining or printing field so the nanobot loop is not bypassed.

## 2026-07-01: Mobile Debug Tuning Uses A Workbench Gutter

When `?mobile=1&debug=1` is opened on a desktop-width browser, keep the portrait game display intact and park the Dynamics sliders beside it. The mobile play surface should stay readable while tuning remains available.

## 2026-07-01: First-Run Level Needs Three Beats

The starter arena should be authored as calibration runway, rich overextension lobe, and lower recovery seam. The route should not meet quota before the recovery seam matters; otherwise the level reads as a harvesting sprint instead of a coherent abundance, greed, crawl, drone, recovery loop.

## 2026-07-01: Flat Tactical Is The Default View

Use a stable, wide, map-like tactical camera as the default presentation. Keep diagonal energy through authored level composition and framing, not through heading-relative rotation, Y squash, projection shear, or screen-Y scaling. Preserve the old chase projection only as a dev comparison via `?view=chase`.

## 2026-09-07: Route Shape Controls What Is Available, Not Reclaim Latency

`CONCEPT_REFRAME.md` claims route shape and launch timing control reclaim
latency. Measurement says that lever does not exist. Across `dronePickupRadius`
185 down to 70 and `droneSpeed` 430 down to 90, the greedy route's drone
flights are consistently among the shortest and the safe route's are the
longest, because a greedier route lays more road and therefore always has a
target nearby. Greed makes reclaim easier, not harder.

What route shape does control is what is worth taking. With nearest-cluster
selection, where you launch from decides the payload, and the decaying fuel
charge decides whether the trip pays for itself. That is the real decision, and
it is the one the player can see.

Do not reintroduce latency-based reclaim pressure without changing the
selection rule or the road's persistence first. The two are coupled.
