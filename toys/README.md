# Find the fun: throwaway toys

Started 2026-09-29. The main game is healthier than it has ever been, and it still isn't fun. Tuning can't fix that, because almost every knob tunes the part of the game that isn't the fun.

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
  - Getting caught ends the run.
- **Daily map:** a toggle on both modes, seeded by the UTC date.

**Toy runs now reach the run data.** Each finished contract or endless run is logged on the phone. **Send toy runs** on this page opens the same `[run-data]` issue the main game uses. `npm run runs -- --toys` shows them, and they're kept out of the main-game stats.

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
