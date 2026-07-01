# Moon Miner Game Design

Status: active concept reframe, replacing the grid-first V0 direction.

For the fuller rationale, read `CONCEPT_REFRAME.md` first.

## Fantasy

You pilot a squat, spider-armed, all-terrain industrial rover across an alien moon before sunset. The rover is not a fragile Apollo machine and not a train. It is a startlingly competent sci-fi extraction platform that performs brilliantly when it has prepared nano-field under itself.

The machine lays temporary traction/harvest field just in time as it moves, mines fertile terrain with automatically allocated arms, and launches a fast autonomous drone to reclaim spent field and return nanobots. The player wins by shaping routes and timing drone launches so the machine stays in its elegant high-performance state instead of falling into emergency crawl.

## Core Loop

1. Steer continuously through alien terrain and fertile zones.
2. Let the rover's arms fabricate nano-field ahead just in time.
3. Use prepared field to move faster and free arms for stronger mining.
4. Launch the autonomous reclaim drone at smart moments.
5. Manage the stock-flow rhythm of nanobots, field buffer, drone return, ore yield, and sunlight.
6. Push into riskier terrain for better payout or follow safer protocol routes for lower but reliable returns.

## Load-Bearing Mechanics

- Prepared field is live road infrastructure already created by previous movement, not a separate prebuild phase; its main reward is faster, less painful navigation through forks, turns, and branch decisions.
- Route shape controls drone reclaim latency because the drone must physically fly to field, reclaim it, and return payload to the moving rover.
- Drone launch timing is the reclaim decision; after launch the drone is autonomous, deterministic, and visibly committed.
- Arms are the visible scheduler for limited industrial capacity: building, mining, stabilizing, scanning, and emergency scraping.
- Mining is a live extraction rally pass through fertile terrain; average deposits should mostly clear during the same traversal that lays road, while unusually rich deposits can leave a tempting residue worth a linger or return.
- Emergency crawl replaces ordinary hard stops: the rover almost stops, tiny local reclaim legs scrape residue, and one desperate arm keeps it barely moving.
- Machine competence is sacred. Bad outcomes should feel caused by route decisions and timing, not by weak technology.

## Speed / Capacity States

- Prepared-field sprint: fast, agile, minimal build burden, especially valuable for clean turns, forks, and returns.
- Just-in-time fabrication: normal exciting speed, arms visibly building ahead, with enough mining capacity to sweep average deposits during a clean pass.
- Emergency crawl: field-starved fallback protocol, painfully slow but not dead, with millipede-like local reclaim and desperate build animation.
- True stop: rare loss or exceptional catastrophe, not the normal punishment state.

## V1 Spike Scope

- Single-player browser prototype.
- Angled top-down presentation.
- Continuous rover motion, not grid movement.
- Generated geometry/particles for field, arms, drone, and mining effects.
- Deterministic simulation rules separated from Phaser rendering.
- Desktop controls first, but touch-compatible interaction assumptions.
- Short extraction run with solar pressure.

## Not Yet

- Grid route puzzle playtesting as the active direction.
- Manual arm assignment.
- Selectable drone strategy modes.
- Prebuild planning phases.
- Full mobile polish.
- Skill trees/upgrades.
- Deep ore taxonomy, fools-gold, or anomaly systems.
- Story campaign.
- Procedural mission depth beyond what the spike needs.
