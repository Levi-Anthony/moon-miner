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
- **Phone first.** Portrait, one thumb (drag anywhere to steer, where you push is where you go). Runs of 30–90 s, tap to retry.
- **Has feel.** Screen shake, particles and sound. A toy with no feedback reads as unfun whatever the idea.
- **Counts plays.** `localStorage` key `mm-toy-<name>`; the index shows it. Choosing to play again is the signal.

## The toys

| Toy | Angle | Tests |
|---|---|---|
| **Home Run** (`home-run.html`, `src/toys/homeRun.ts`) | Keep the theme, new core | Do the three "felt good" moments carry a game on their own? Off the road you steer, and road lays behind you. Back on your own road it's a roller-coaster rail (owner: "a crazy straw") with **zero steering**: hold to ride, release to stop, and it carries you along exactly what you laid, faster the longer you ride. Leave with a very hard turn, or slow down and turn. A line end carries on onto the road it branched from. Charged rail speed through a seam scoops the whole seam, and chains multiply. Bank at the ring; sunset strands what you carry. |
| **Terminator** (`terminator.html`, `src/toys/terminator.ts`) | Keep only the mood | Is racing the light the fun, with nothing to build? A solar rover runs fast in sunlight and fades in shadow while night sweeps in from the west, faster and faster. Ore in the dark (crater floors, or behind the line) is worth double. |

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
