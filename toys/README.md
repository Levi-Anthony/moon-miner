# Find the fun: throwaway toys

Started 2026-09-29. The main game is healthier than it has ever been, and it still isn't fun. Tuning can't fix that, because almost every knob tunes the part of the game that isn't the fun.

## Status (2026-09-30): both toys stay

The owner's call: neither toy gets retired, and both are candidate mini-games.
- **Home Run** is now the **parallel 2D version**. It follows the design as it moves: each design change that lands in the 3D game lands here too, so Home Run keeps testing ideas cheaply.
- **Terminator** is **parked**: it stays playable and linked from the toys page, with no new work on it for now.

The isolation rule below still holds. Whether Home Run later shares a rules core with the 3D game is requirement 17 in the engine-and-toolkit survey.

## Hypothesis

The owner named what has felt good in every version: riding my own road fast, scooping a seam, beating the sunset. They added that "all three are kinda the same thing". Laying road was *not* on the list.

So the fun is plausibly **the run home**: go out, get greedy, turn back, fly home on what you built, scoop ore on the way, and arrive as the light goes. The current build puts a lot in front of that moment:
- nanobot stock and crawl
- the drone
- par budgets and levels
- ~80 panel knobs

## Rules for a toy

- **Throwaway.** 2D canvas, one file, no settings panel, no levels, no save.
- **Isolated.** It imports nothing from `src/game` or `src/three`. That keeps out the main build's hidden assumptions: stock economy, drone, hex fields, par budgets, 3D chase camera, knob sprawl.
- **Phone first.** Portrait, one thumb. Up is always forward: the view turns with the rover, stick up = throttle, left/right = steer. Runs of 30–90 s, tap to retry.
- **Has feel.** Screen shake, particles and sound. A toy with no feedback reads as unfun whatever the idea.
- **Counts plays.** `localStorage` key `mm-toy-<name>`; the index shows it. Choosing to play again is the signal.

## The toys

| Toy | Angle | Tests |
|---|---|---|
| **Home Run** (`home-run.html`, `src/toys/homeRun.ts`) | Keep the theme, new core | Do the three "felt good" moments carry a game on their own? **v2 (2026-09-29):** up = forward (the view turns with you; stick up = throttle, left/right = steer). Road lays behind you. Drive onto your road and it's a roller-coaster rail with zero steering: hold up to ride, let go to stop, pull back while stopped to turn round, hold a full turn to hop off. The road is a tree rooted at the depot, so riding inward always ends at home. Riding outward ends at your frontier and you're laying again. Charged rail speed through a seam scoops it all, and chains multiply. **Night closes in** from the edges, uneven, swallowing the far rich ore first. Caught outside it, you lose your load and the run ends. |
| **Terminator** (`terminator.html`, `src/toys/terminator.ts`) | Keep only the mood | Is racing the light the fun, with nothing to build? A solar rover runs fast in sunlight and fades in shadow while night sweeps in from the west, faster and faster. Ore in the dark (crater floors, or behind the line) is worth double. |

### Home Run v3: outer loops (2026-09-29)

The owner played the toys and the main build and concluded: "the seam or bottleneck is another level up. Let's focus on game loop design."
- **What's missing after a run:** all four options offered: no reason to go again, no real choice in a run, nothing to build toward, and stakes that feel fake.
- **Loop shape:** they couldn't pick one; all four "sound like legit fun alternate modes".
- **Where to test:** the Home Run toy, around the same run core.

Two outer loops now wrap that core. Pick one on the title screen:

- **Contract** (roguelite, 5 nights on one map):
  - Quotas are 20 / 35 / 55 / 80 / 110. Miss one and the contract ends.
  - Surplus becomes credit. Between nights, pick 1 of 3 upgrades or keep the credit: Hot rail, Quick charge, Drill, Wide scoop, Late dusk, Chain keeper, Outpost (a bank ring at your farthest road).
  - Your road tree, emptied seams and outposts carry to the next night, and each night reveals 3–4 fresh rich seams farther out.
  - This folds in the "grow a network" idea.
- **Endless Night** (arcade): one night that closes faster and faster.
  - Every bank pushes it back 25%, raises the multiplier, and spawns ore in the ground you won back.
  - The run ends when the night reaches home. Not home then = stranded: the load is lost, the score stays.
- **Daily map:** a toggle on both modes, seeded by the UTC date.
- **The dark is not lethal (2026-09-30).** The owner's call after a contract ended on night 1 with quota already banked: the night border must not turn a prepared road deadly. Off your road in the dark, your load leaks away (35% a second, at least 2). On your road it's safe. Not home at nightfall = stranded: the load is lost, the banked ore counts, and a contract goes on if quota was met.

### Endless Night in 3D (2026-10-02)

The port has landed: `night.html` (linked first on the toys page, and from the corner of the Levels game) plays Endless Night in Three.js. It runs the same rules core as this toy (`src/game/run.ts`), so a rule change lands in both at once. The toy stays the parallel 2D version.

### Home Run v4: Endless Night, tuned for the port (2026-09-30)

The owner's verdict on Endless Night: "I think we actually found something," and "this is the 3D port move for sure." The changes below answer their playtest notes (DEV-68); `DECISIONS.md` has the full trail.
- **The rail is reliable.** Off the rail only by a full sideways hold at speed (an amber arc on the rover fills over 0.35 s) or a sideways push once stopped. Braking, a drifting thumb or steering into a bend never drops you. In the dark, any road you laid before keeps your load safe, locked on or not.
- **Digging holds the night off.** Nibbling and scooping push the border back as you dig. A bank drives it back further (more at a higher multiplier) and cools how fast it closes. A 5-scoop chain banks itself. You watch each push happen: the border glides back and flares.
- **You can see and hear it coming.** A countdown in seconds, ground that darkens toward the border, a glow from the side it's on, an arrow when it's off screen, a rising drone and ticks, and a minimap of the border, your road and the ore.
- **Strategy has room.** An unbanked night lasts about 65 s (was about 45). New ore after a bank lands mostly beyond the tips of your road, so extending a line toward the border pays off.
- **You can win: reach dawn.** Bank 150 before the dark reaches home and dawn breaks. The top bar is the dawn bar, with what you carry drawn ahead of it, so you can see when banking now would win.
- **Hard** (title toggle): the dark kills off your road.
- **END** (top left, under the HUD) ends a run cleanly, and the run is logged as `quit`.
- **Getting on is easy too.** Turning round onto the road you just laid grabs it at once, and driving onto any road within 80° of its line grabs it. Only a square crossing drives across. Each missed grab is logged with its reason.
- The rules are one data object (`NightRules`), so a harder level or another mode is a change of numbers.

**Toy runs now reach the run data.** Each finished contract or endless run is logged on the phone. **Send runs** on this page, or any Send button in the main game, sends every unsent run on the phone, toys and main game together, in one `[run-data]` issue. `npm run runs -- --toys` shows them, and they're kept out of the main-game stats.

A third idea, drawing the road with your finger ahead of an always-moving rover, was dropped at the owner's call.

## How to play-test (about 10 minutes)

1. On your phone open `https://levi-anthony.github.io/moon-miner/toys/`.
2. Play each toy for about 2 minutes. For each one, note:
   - Did I want another go?
   - Which moment felt best?
   - What annoyed me?
3. Paste your answers and the play counts shown on the index.

## Results

| Date | Toy | Plays | Another go? | Best moment | Annoyed by |
|---|---|---|---|---|---|
| | | | | | |

## What happens next

The next plan grows the winner into a vertical slice, combines the winning moments of both, or runs a second round of toys if neither pulled.
