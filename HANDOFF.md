# Moon Miner — Handoff

Last updated: 2026-09-16 (road-feel + loop-legibility + arms/mining + layout-shuffle arc)

This file is the cold-start for a fresh agent: what the game is now, **how we
work on it and why**, and what we've tried, rejected, and accepted. The blow-by-blow
decision trail (with the reasons and the rejected options) lives in
`DECISIONS.md` — read the last several dated sections there after this.

---

## 1. Cold start

- **Live build:** https://levi-anthony.github.io/moon-miner/ (auto-deploys from
  the working branch via `.github/workflows/pages.yml`, gh-pages "deploy from a
  branch"). Push → a couple of minutes → live.
- **Working branch:** `claude/current-state-report-a81tov` (PR #8). All the work
  below is here; being merged to `main`.
- **Run locally:** `npm i`, `npx vite` (dev), or `npx vite build`. Desktop URL
  `?desktop=1`; mobile `?mobile=1`; tactical top-down view `?view=tactical`;
  dev panel `?debug=1` or the gear button; endless/no-shift mode `?shift=0`.
- **Stack:** Phaser 3 + TypeScript + Vite. Deterministic sim in
  `src/game/continuous.ts`; presentation/scene in
  `src/scenes/ContinuousMoonMinerScene.ts` (large). The sim never imports the
  scene; the scene drives the sim each frame with a `ContinuousInput`.

### What the game is right now
Drive a nanobot-laying rover across a lunar field. Lay road on new ground; the
road **cures** into a fast, holding surface; mine ore seams; launch a reclaim
drone to refuel; get home to extraction before sunset. The loop is a nested
**day / shift / game** campaign with a banked-ore score (see §3a): a day is one
sunset run, days make a shift, shifts make a game. Road persists within a shift;
the map regenerates every N shifts. All of it is player-tunable in the panel.

---

## 2. How we work here (process doctrine — follow this)

1. **Screenshot-verify renders in headless Chromium before pushing.** We shipped
   blind and broke the game more than once; now every render/visual change is
   captured and eyeballed first. Pattern: a throwaway Playwright script,
   `CHROME_PATH=$(ls /opt/pw-browsers/chromium-*/chrome-linux/chrome | head -1)`,
   drive the game, `page.screenshot`, read the PNG. Delete the script after.
2. **The headless sim runs at ~1/6 real time** (rAF throttled). Elapsed game
   time crawls; to reach cured road / a full lap / draining the tank you must
   drive for tens of seconds of wall-clock. Short probes that "prove" nothing
   changed are usually a timing artifact, not a logic result. Verify the actual
   number, don't infer.
3. **Read live state from the debug snapshot.** The scene writes
   `#moon-miner-continuous-debug-state` (JSON of `state`) every frame; probes
   read `rover.speed`, `speedState`, `arms`, `nanobots`, etc. Keep this and
   `window.__moonMinerContinuous` stable — the Playwright smoke harness
   (`npm run smoke:continuous`) depends on them.
4. **Pin the feel with distinguishing questions.** When the owner says something
   is "wrong" or "off", don't guess — ask sharp multiple-choice questions
   (AskUserQuestion) that separate the candidate causes. This repeatedly turned
   a vague complaint into a one-line fix ("fast when laying", "second layer on
   re-drive at crossings").
5. **Record and propagate every decision, including what was rejected and why.**
   The owner runs an ECB-first doctrine (a portable context hub). For each
   meaningful change: append the trail to `DECISIONS.md`, log an ECB pulse
   (`mcp__ECB__log_pulse`), and comment on the relevant **Linear** ticket (DEV
   team, workspace `ecos-ops`). If ECB/Linear tools are unavailable, say so
   (degraded state) and keep `DECISIONS.md` current for later propagation.
6. **Commit small and attributed.** Each logical change is its own commit with a
   descriptive body. Commits/PRs end with the Claude Code attribution footer
   (see the session reminder). Never put a model identifier in repo artifacts.
7. **Tests are a spec, not a gate to game.** See §5 — a deliberate design pivot
   may obsolete tests; retarget them to the new rule (never skip/disable to go
   green), and document any that need a larger re-cut.

---

## 3. Architecture map (the parts you'll touch most)

### The road feel (this arc's core)
The road you see is the **rover's own driven trail** (`roadTrail: {x,y,t}[]` in
the scene), rendered as one smoothed ribbon (`drawFields` → thick strokes at
full alpha — never a filled outline polygon; that self-intersects and flashes).

The feel is a **presentation→sim** pipeline. Each frame the scene computes,
from the trail, and passes into the sim via `ContinuousInput`:
- `assistSteer` — pure-pursuit turn toward the road (the carry).
- `roadRunway` — 0..1 speed target (the boost), eased by road curvature ahead.
- `onRoad` — is the rover on **cured** road, driving along it.

Key concepts, all in the scene:
- **Cure time** (`ROAD_CURE_SECONDS`, 1.2s): trail points older than this are
  "pre-laid road"; younger ones are the stroke you're laying now. Time-based, so
  it's independent of turn radius. `curedTrailLimit()` is the cured prefix.
- **Alignment gate** (`ROAD_ALIGN_MIN`): driving *along* a road (grip/boost/no
  re-stack) vs *crossing* it (an intersection). `roadAlignmentAt()`.
- **On-ribbon vs along-road** in `sampleRoadTrail`: don't lay a second layer
  when on top of existing road (either aligned-along it, or physically on the
  ribbon at a junction). A transverse crossing still lays up to the road it
  meets — a clean intersection.
- **Momentum**: `roadBoost` ramps up on road, decays off; capped by
  `ROAD_SLIDE_MAX`; scaled by `roadCurveScale` so straights run fast and bends
  ease so the carry can always hold the line.

In the sim (`continuous.ts`, the steering block ~line 1120): when `onRoad`, the
carry **takes the wheel** — it can turn up to ~2.6× a manual lock, a light steer
is subsumed (player steer scaled to 0.25), only a firm steer past
`railBreakSteer` breaks you off. **Self-play/tests pass none of these fields**,
so they keep the sim's own field-magnet steering unchanged — this is how we keep
the test suite meaningful while reworking the feel. `normalizeInput` MUST carry
`assistSteer`/`roadRunway`/`onRoad` through (it once dropped them, silently
no-opping the whole feature — a classic trap: an input-normalisation chokepoint
eats new fields).

### Arms & mining (stop-to-mine)
`allocateArms` (sim) is **mode-exclusive**: moving on new ground → all arms
build; moving on road → stowed (cruising); stopped in a seam → all arms mine;
stopped elsewhere/crawl → stowed/emergency. So **you mine only when stopped**,
and the machine's posture reads its activity. Mining yield is **flat**
(`richness × arms × mineRate × STOP_MINE_EFFICIENCY`) — the old speed/vein-line
coupling is gone. The visual delta is wide on purpose (`drawArms`): building
arms punch out long and pump; stowed arms fold tight and dim.

### 3a. The loop frame (day / shift / game — all in `LoopConfig`, panel-tunable)
`dayNumber` (total days this game, 1-based) is the single source of truth;
`shiftOfDay`/`dayInShiftOf` derive shift and day-in-shift from it and the config.
Defaults: **day** = one excursion (one sunset run); **shift = D days** (3);
**game = S shifts** (4). HUD: `DAY d/D · SHIFT s/S · X ore banked`. The game ends
after `D×S` days with a scored summary (`drawPhaseBanner`), scored against
`quota × D×S`.

- **Road** persists day-to-day WITHIN a shift and **resets at each shift
  boundary** (`saveCarriedRoad` carries only when the next day stays in the same
  shift).
- **Map** regenerates **every N shifts** (2) and on New Game, via a derived
  block seed `${gameSeed}:blk${floor((shift-1)/N)}` (`worldSeedFor`). Road wipes
  every shift regardless of N. **Bigger level** = `arenaScale` (1.35) widening
  the seam-scatter bounds, threaded `createContinuousWorld(..., layoutScale)`.
- **Economy (per-day):** quota `Q` (12) overrides `oreRequired` on a per-state
  arena clone. **Under quota but back before sunset = soft fail** → banked ore
  skimmed by `underQuotaFeePct` (0.5). **Missed sunset = hard fail** → lose only
  this run's haul (prior banked survives), plus a tunable `hardFailRoadResetPct`
  (0) fraction of carried road. The sim's **`leftExtraction` latch** makes a day
  end by RETURNING to the depot (guards the t=0 depot; enables under-quota
  returns as a win flagged `returnedUnderQuota`).
- `buildWorld()` centralises world construction (block seed + quota override +
  scale); `create`/`resetRun`/`startNewGame`/`setArena` all route through it.
- Config persists to `LOOP_CONFIG_STORAGE_KEY`; carried-road save is
  `CARRIED_ROAD_STORAGE_KEY` **v2** (stores `day`, not the old `shift`).
- `LoopConfig` also now carries the **road width** (`roadWidthCars`, drives
  `roadHalfWidth()` — the ribbon, drivable band, carry lookahead and parallel-
  merge all key off it; see the road decision), **text verbosity**
  (`textVerbosity` Off/Minimal/Full, gates `getEventFeedText`), and the **slurp**
  knobs (`slurpBandPct`, `slurpMinBoost`). Economy defaults were eased in the
  STABLE preset (startingNanobots 9, fabricateCostPerSecond 0.85,
  crawlRecoveryPerSecond 0.45) and remain panel knobs.

### Layout shuffle
`createArenaFertileZones` (in `continuousArena.ts`) really shuffles the seams
per seed (position + vein orientation), spread and reachable, richer seams
assigned farther from extraction (reach stays rewarded), now scaled by
`layoutScale`. The base game **seed** is persisted (`EXPEDITION_SEED_KEY`), with
per-block variation for the regen cadence.

### Crawl
Out of nanobots → `crawl` (speed 34 limp, recovers ~0.3/s to a 3.6 ceiling) —
a recoverable setback, not the old soft-lock at 16. Reaching prepared road flips
you out of crawl instantly.

---

## 4. What we tried / rejected / accepted (headlines — full trail in DECISIONS.md)

- **Road render:** rejected drawing from the field lattice (id-order slashes;
  prevId beading) and filled outline polygons (self-intersection flashing).
  Accepted: rover-trail polyline, thick strokes at full alpha.
- **Non-overlap:** rejected lattice-snap (reintroduces tile wobble) and
  graph-weld (too heavy). Accepted: proximity + alignment skip; junction fix =
  also skip when physically on the ribbon.
- **On-road detection:** rejected field-coverage (fires on the road you're
  laying right now) and trail-*distance* (radius-dependent). Accepted:
  **time-based cure**.
- **Carry:** rejected "assist you fight" (steer halved the carry; player steer
  always added) and then rejected the softer rescue-slide too (partial steer
  scaled to 0.25 still sawed the line; a light 0.34 steer left too easily).
  Accepted: prepared road under forward is a **LOCK** — partial stick fully
  subsumed (`steerScale` 0), the carry owns the wheel and hugs any laid squiggle
  at boosted speed, and only a **full ~90° deflection** (`ROAD_CARRY_BREAK_STEER`
  0.9, its own threshold) drops it and passes your wheel through. On keyboard: W
  follows the road, A/D leaves it.
- **Speed:** first accepted a curvature-eased slide (fast straights, slowed
  bends), then **reversed it** on playtest — "Don't slow down on corners.
  Increase grip." Current accepted model: **full-speed corners** (no curvature
  easing; `roadRunway = roadBoost` straight through) held on the road by
  **stronger grip** — and then hardened into the LOCK above (carry cap 5×
  TURN_RATE, follow-steer 9). Rejected the earlier fear that full rail on curves
  "flings you off" — grip is what holds you, not slowing down.
- **Mining:** accepted the "drive somewhere, stop to mine" reality; leaned in
  (arms mine XOR build; flat yield; removed speed/vein coupling). Rejected
  keeping the utility arm in the dig. Fixed the "stopped on a seam and not
  mining" bug: detection band was the bare `vein.width/2` but the seam is DRAWN
  inflated, so a ring of visible gold didn't mine — band now `vein.width/2 +
  SEAM_MINE_REACH` (20) to match the drawn ore. Dropped the strobing "mine"
  rings; the arms in the seam are the cue. NEXT (deferred by Levi): a turbo
  "railboosted slurp" — zoom the middle 33% of a seam to take it all at once,
  distinct mode — layered ON TOP of (not replacing) stop-to-mine XOR.
- **Sandbox:** built a standalone road sandbox, then **rejected it as the
  product** ("I hate the sandbox") — transplanted the good road into the real
  game and deleted the sandbox.
- **Text:** first cut at reducing on-screen prose (steady-state shows the short
  objective, not a constant two-sentence how-to). Deeper text→visual pass open.

---

## 5. Test state & the DEV-23 debt

`npm test` (vitest): **74 pass, 9 fail**. The 9 red are one coherent bucket:
the **self-play route/economy tests and the mining-throughput tests assume the
old mine-while-moving model and the old fixed layout.** The stop-to-mine pivot
and the layout shuffle deliberately invalidate them. Re-cutting the self-play
harness (routes that stop to mine) and re-deriving the economy balance is
**DEV-23's charter** — a real, separate task, not a bug.

The focused mining *unit* tests were retargeted to the new model (park to mine,
flat rate, no vein/speed/prepared bonus, utility arm stays utility) and pass.
The two arena-staging tests now assert the shuffle *invariants* (in-bounds,
clear of start/extraction, richer-is-farther) instead of fixed coordinates.

**The smoke harness (`scripts/continuous-smoke.mjs`) is also DEV-23 debt.** It
still drives *through* an ore vein and waits for an "active mining ore-vein cue"
(around line 463) and a subsequent depletion check — the mine-while-moving
assumption. Under stop-to-mine that cue never fires while moving, so the smoke
times out ("Timed out waiting for active mining ore-vein cue", hit the 120s
ceiling). Re-cutting it means teaching the harness to navigate the *shuffled*
layout, park in a seam, and assert the parked-mining cue + depletion — real
harness work that belongs with DEV-23's self-play re-cut, not a rushed patch.
It is red pending that; typecheck, build, and the screenshot verification are
the gates currently green.

Rule we follow: never skip/disable a test to go green. If a design change
obsoletes a test, retarget it to the new rule or, when its whole premise is
removed, rewrite it as a new-model guardrail. Anything needing a larger re-cut
is documented (here + the Linear ticket), not silently left red.

---

## 6. Open follow-ups (roughly prioritised)

- **DEV-23:** re-cut self-play routes for stop-to-mine + shuffled layout; re-tune
  the ore economy for the flat mining rate; get the 9 red tests green. **Also
  re-cut the smoke harness** (`scripts/continuous-smoke.mjs`) to park-and-mine on
  the shuffled layout instead of driving through the vein — it currently times
  out on the stale mine-while-moving cue.
- **Turbo "railboost slurp" — DONE.** `updateSeamSlurp` (scene): wound up on road
  (roadBoost ≥ `slurpMinBoost`) through a seam's central `slurpBandPct` (middle
  third) slurps the whole seam at once, distinct gold burst. Layered on top of
  stop-to-mine XOR. Both knobs in the panel (band 0 = off). In-context firing is
  still worth a playtest eyeball.
- **Authored / carried-overnight road** is not yet drawn as ribbon or followed —
  only the rover's own driven trail is. Both render and feel derive from that
  one trail, so they stay coherent; extending to authored road is the next step.
- **Mining legibility polish:** stop-to-mine now engages on the visible gold
  (band matches the drawn seam). A "you are mining, here's the rate" meter could
  still be stronger, but the strobing rings are gone and the arms carry it.
- **Text → visual, deeper pass:** the mode chip ("Sprint / field grip"), the
  rail/track readout, HUD labels → visual cues. Owner to point at the worst
  offenders.
- **Fast-loop overlap:** re-driving your OWN road within the 1.2s cure window (a
  tight fast loop) can still double, because the skip checks only cured points
  and can't tell "last lap's fresh road" from "the stroke I'm laying now."
- **DEV-47:** vehicle classes that lay different road types (backlog).

---

## 7. Linear tickets (DEV team, `ecos-ops`)

DEV-22 grip/road feel · DEV-23 restore prepared-road payoff / decouple from the
self-play rig (the test-debt owner) · DEV-24 road legibility · DEV-19 crawl
consequence · DEV-27 define "1 game" (the expedition frame) · DEV-47 vehicle
classes → road types (backlog).

## 8. Older design context (pre-this-arc, still useful for intent)

`GAME_DESIGN.md`, `CONCEPT_REFRAME.md`, `BETS.md`, `PROGRESS.md`,
`README.md`. These predate the road-feel/loop work; treat them as the design
north star (competent machine, physical drone logistics, prepared field,
overextension/crawl/recovery) rather than a current status report.
