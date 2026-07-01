# Moon Miner Concept Reframe

Status: active direction as of 2026-06-29.

## One-Sentence North Star

Moon Miner is a short-session live-action extraction game about a startlingly competent all-terrain industrial rover that creates temporary nano-fields under itself, launches an autonomous reclaim drone, and survives by turning route shape, drone timing, and arm capacity into a barely controlled stock-flow machine before the sun wins.

## What The User Was Really Asking For

The original "rail" language should not be interpreted as train-like track constraint or static route puzzle. The deeper ask is a kinetic sci-fi machine fantasy:

- Build just in time while moving.
- Reclaim limited material through physical logistics.
- Make the machine feel brilliant, not clumsy.
- Let bad decisions hurt through stocks, flows, timing, and route geometry.
- Preserve uncertain doom through recoverable emergency states instead of frequent hard stops.
- Make every spectacle element communicate a real systemic consequence.

The current grid prototype proved scaffolding, but it drifted toward puzzle readability. It is now prior art, not the design north star.

## Core Mental Models

### Prepared Field Frees Capacity

The rover is faster on nano-field that already exists because the arms do not need to fabricate under pressure. Prepared field is not a separate prebuild phase; it is the live residue of smart earlier movement.

Driving through fertile terrain while building field should produce limited opportunistic mining. Driving back through fertile terrain on prepared field should feel fast, agile, and lucrative because more arms can mine instead of building.

### Route Shape Controls Reclaim Latency

The reclaim drone is fast and competent. If it returns late, the player should blame their own route shape or launch timing, not the drone. The drone physically flies to old field, vacuums nanobots, then returns to the moving rover to deliver payload.

The player launches the drone, likely with `Space`, but does not micromanage it after launch. The drone's target selection should be deterministic and legible enough to learn. Once launched, it should commit, show its target, payload, and ETA, and make the consequence of launch timing visible.

### Machine Competence Is Sacred

The rover, arms, and drone should feel surprisingly adept and futuristic. The fantasy is not Apollo-like fragility. Failure should come from overextension, hesitation, bad geometry, greed, or mistimed launches forcing a brilliant system into ugly fallback protocols.

Use "smoke and mirrors" to make decisions hurt without making technology feel bad.

### Emergency Crawl Replaces Hard Stop

When the build rig is starved and no usable field is ahead, the rover should almost stop but remain technically alive. Big arms fold aside; tiny millipede-like emergency reclaim legs scrape immediate residue; one desperate build arm feeds a crawl-speed field directly under the rover.

This state should feel humiliating, costly, and full of uncertain doom, but not like inactive waiting.

### Arms Are The Visible Scheduler

The spider-like dome rover has limited industrial attention. Arms automatically allocate between field laying, mining, stabilizing, scanning, and emergency scraping. The player does not assign arms manually; they steer and create conditions where the machine can allocate well.

The visual rule: if the machine is struggling to build, fewer arms mine. If it is gliding over prepared field, the arms can mine aggressively.

### Mining Is A Live Extraction Pass

Mining should not be "stop on ore and press mine." Fertile terrain should be broad, readable, and partially uncertain. Yield depends on richness, time in the zone, rover speed, prepared field, and arm capacity.

Good routes let the rover exploit fertile terrain while preserving supply rhythm. Greedy routes promise higher payout but can stretch drone cycles, consume field, and trigger emergency crawl.

## Active V1 Spike

The next playable spike should test only the spine:

1. Continuous rover motion in an angled top-down view.
2. Raw terrain, prepared nano-field, and emergency crawl speed states.
3. Arms automatically fabricate field ahead and mine when capacity is available.
4. `Space` launches a fast autonomous drone to reclaim old field and return payload.
5. Route shape and launch timing visibly affect reclaim latency and material supply.
6. Solar pressure creates urgency.

The spike succeeds if route shape plus drone launch timing creates a felt cycle of abundance, overextension, emergency crawl, and recovery.

## Deferred On Purpose

- Selectable drone strategy modes: deferred because physical launch timing and route geometry should carry reclaim strategy first.
- Manual arm allocation: deferred because the arms should feel like an intelligent machine scheduler.
- Prebuild/planning phase: deferred because it risks static puzzle drift. Prepared field should emerge from movement already made.
- Full mobile control polish: deferred, but input design must stay touch-compatible.
- Skill trees/upgrades: deferred until the base loop feels good.
- Savior RNG/anomalies: deferred until the core pressure curve is playable.
- Deep ore taxonomy/fools-gold systems: deferred until live extraction and arm capacity are proven.
- Rare symbiote/tentacle arm mechanics: flavor is welcome, but no new mechanic until the spine works.

## Red-Team Risks

- Spectacle could become cognitively mushy if players cannot link decisions to outcomes.
- Autonomy could erase agency unless route shape, drone launch timing, and risk appetite are unmistakably consequential.
- Prepared-field mining could devolve into boring loops without depletion, solar pressure, or opportunity tradeoffs.
- Drone launch could become a cooldown button if bad timing does not visibly hurt.
- Emergency crawl could become waiting if the player has no meaningful steering or recovery hope.
- The safe protocol path could become either too dominant or a fake trap; it should be reliable low payout, not optimal.

## Immediate Next Bet

Build a fresh continuous-motion spike inside the existing Phaser/Vite repo while preserving the grid prototype as v0 prior art. Do not run Round 1 playtests on the grid prototype unless explicitly studying why it failed to match the intended fantasy.
