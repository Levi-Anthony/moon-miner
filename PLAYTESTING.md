# Moon Miner Playtesting Plan

Status: V0 grid playtesting plan paused.

The active design direction is now the continuous-motion nano-field concept in `CONCEPT_REFRAME.md`. Keep this document as research scaffolding and method provenance, but do not run these Round 1 grid sessions unless explicitly studying the V0 prototype or rewriting the plan for the continuous-motion spike.

## Purpose

Playtesting should answer whether Moon Miner is understandable, tense, and worth extending. This is not QA-only. QA asks "does it break?" Playtesting asks "what does a real player perceive, decide, enjoy, misunderstand, or ignore?"

## Method Provenance

This plan borrows from:

- Nielsen Norman Group on think-aloud usability testing: https://www.nngroup.com/articles/thinking-aloud-the-1-usability-tool/
- Nielsen Norman Group on small iterative studies: https://www.nngroup.com/articles/why-you-only-need-to-test-with-5-users/
- Nielsen Norman Group on severity ratings: https://www.nngroup.com/articles/how-to-rate-the-severity-of-usability-problems/
- GOV.UK moderated usability testing guidance: https://www.gov.uk/service-manual/user-research/using-moderated-usability-testing
- Game playtesting distinction between playtest and QA: https://en.wikipedia.org/wiki/Playtest

Use these as methodology anchors, not rigid doctrine. Moon Miner is an early prototype, so learning speed matters more than statistical confidence.

## Current Test Bet

The paused V0 grid build would have tested this sentence:

> A first-time player can drive or queue rover movement, understand that rail auto-prints by spending nanobots, notice the old rail near the first deposit, reclaim track when resources tighten, mine ore, and understand whether failure was fair.

## Research Questions

### Comprehension

- Does the player understand that movement is the primary action?
- Do they understand that rail auto-prints when driving into valid untracked terrain?
- Do they understand nanobots as the scarce resource?
- Do they understand existing rail is cheaper than new terrain?
- Do they notice the old rail near the first deposit and infer it can be reclaimed?
- Do they understand craters and ridges as hard blockers?
- Do they understand why the rover cannot drive onto an active reclaim target?

### Decision Quality

- Do players plan routes, or do they drive blindly?
- When nanobots run low, do they naturally think to reclaim track?
- Do they understand the tradeoff between exploring forward and preserving a way home?
- Do queued routes help or hide the resource consequences?
- Are failures perceived as fair, confusing, or arbitrary?

### Feel

- Does driving feel immediate enough?
- Does auto-printing feel satisfying and distinct from moving on existing rail?
- Does the helper bot path animation communicate reclaiming clearly?
- Does the solar timer create useful pressure or distracting noise?
- Is the current audio helpful, annoying, or too much?

### Scope Signals

- What do players ask for unprompted?
- Which feature request appears in 3 or more sessions?
- Which problem blocks the core loop before extra content matters?

## Playtest Rounds

### Round 0: Solo Sanity Run

Tester: developer only.

Goal: remove obvious brokenness before using another person's time.

Checks:

- Start game locally.
- Dismiss briefing.
- Drive manually with keys.
- Queue a clicked destination route.
- Auto-print into valid terrain.
- Attempt blocked terrain.
- Mine ore.
- Reclaim the old rail near the first deposit.
- Confirm helper bot path animation reaches its target before refund.
- Trigger win or loss.
- Confirm the hidden dev snapshot updates if running a dev build.
- Confirm no console errors if browser devtools are open.

Use the script below for the solo sanity run only. Do not include these moves in the Round 1 moderator prompt; first-time players should still receive the neutral task from `PLAYTEST_PROMPT.md`.

#### Round 0 Move Script

Start from base `(1,7)`, nanobots `20`, ore `0/2`, default seed `apollo-17`.

1. Dismiss the briefing.
2. Manual/control check:
   - Press `D` to `(2,7)`. Expect auto-print feedback and nanobots `19`.
   - Press `A` back to base `(1,7)`. Expect no nanobot spend.
   - Press `D` again to `(2,7)`. Expect existing rail movement and nanobots still `19`.
3. Drive manually toward the first ore:
   - Press `D S D S D D D D`.
   - End at `(8,9)`. Expect nanobots `11`.
4. Blocked terrain check:
   - Press `D` into ridge `(9,9)`.
   - Expect blocked feedback and nanobots still `11`.
5. Queue route to first ore:
   - Click ore tile `(10,11)`, pixel center roughly `(456,556)`.
   - Expected queued path: `(8,10) -> (8,11) -> (9,11) -> (10,11)`.
   - End at `(10,11)`. Expect nanobots `7`.
6. Mine:
   - Press `Space` or click `Mine`.
   - Expect ore `1/2` and an objective/nudge toward recovering nanobots.
7. Scarcity check:
   - Click second ore `(17,10)`, pixel center roughly `(736,516)`.
   - Before reclaim, expect `No affordable drive path to that tile.`
8. Reclaim old rail:
   - Click highlighted old rail `(10,10)`, pixel center roughly `(456,516)`.
   - Confirm the helper bot path animates from base along the built route to the old rail.
   - After about `5s`, expect the old rail removed and nanobots `9`.
9. Queue route to second ore:
   - Click `(17,10)`.
   - Expected queued path: `(11,11) -> (11,10) -> (12,10) -> (13,10) -> (14,10) -> (15,10) -> (16,10) -> (17,10)`.
   - End at `(17,10)`. Expect nanobots `1`.
10. Mine:
   - Press `Space` or click `Mine`.
   - Expect ore `2/2`.
11. Queue return to base:
   - Click base `(1,7)`, pixel center roughly `(96,396)`.
   - Expect route home along existing rail with no nanobot spend.
   - End at base with phase `won` and message `Ore secured. Extraction window complete.`

Observations to capture:

- Briefing teaches movement, auto-printing, blockers, mining, and reclaim without overloading.
- Manual drive feels immediate.
- Existing rail movement visibly differs from auto-print movement.
- Ridge block reads as fair.
- Queue path is visible and understandable.
- Low nanobot state makes the first-deposit reclaim feel necessary.
- Helper bot reaches target before refund.
- Final win state is clear.

Output: short note in `PROGRESS.md` or `BUGS.md`.

### Round 1: First-Time Comprehension

Participants: 5 first-time players.

Profile mix:

- 2 people who play puzzle/strategy games.
- 2 people who play games casually.
- 1 person who rarely plays games.

Method: moderated think-aloud for the first 10 minutes, then quieter observation.

Why: think-aloud is excellent for finding interface and mental-model confusion, but it can interfere with flow. Use it early, then let the player settle.

Primary success criteria:

- 4/5 players start moving within 30 seconds after briefing.
- 4/5 understand nanobots are consumed by auto-printing.
- 3/5 discover or correctly explain reclaiming without being taught directly.
- 3/5 use or understand queued destination driving.
- 3/5 can describe the goal after playing.

### Round 2: Fix Validation

Participants: 5 new first-time players after Round 1 fixes.

Goal: confirm whether the top Round 1 issues were fixed and whether deeper strategy questions now appear.

Primary success criteria:

- Top Round 1 severity-3 issues do not recur in more than 1/5 sessions.
- At least 3/5 players make an intentional route/reclaim decision.
- At least 3/5 players say the failure state was understandable if they lose.

### Round 3: Unguided Feel Test

Participants: 5-8 players.

Method: minimal intro, no think-aloud during play. Use a short retrospective interview after the run.

Goal: evaluate feel, pressure, and fun after basic comprehension is no longer the main blocker.

Primary success criteria:

- Median rating of "I understood what I was trying to do" is 4/5 or higher.
- Median rating of "I wanted to try again" is 4/5 or higher.
- At least half of players mention route planning, scarcity, or reclaiming unprompted.

### Round 4: Balance And Trace Test

Participants: 10-20 lightweight remote testers once trace export exists.

Goal: tune numbers, not discover the whole design.

Candidate variables:

- Starting nanobots.
- Terrain costs.
- Solar timer duration.
- Ore target count.
- Reclaim delay and refund.
- Route queue cost preview.

Use traces to identify where players die, stall, loop, quit, or over-succeed.

## Session Structure

Target length: 35-45 minutes.

### 1. Intro And Consent, 3 Minutes

Script:

> Thanks for helping. We are testing the game, not you. If anything is confusing, that is useful data. Please say what you are thinking for the first few minutes. I may mostly stay quiet so I do not accidentally teach you the game.

Ask permission to record screen/audio if recording.

### 2. Background, 3 Minutes

Ask:

- What kinds of games do you play, if any?
- Have you played top-down, puzzle, mining, or logistics games?
- How comfortable are you with keyboard controls?

### 3. First-Run Task, 12-15 Minutes

Neutral prompt:

> Please start a run and try to complete the mission. Use whatever the game gives you. Say what you are thinking for the first few minutes.

Do not say:

- "Drive with WASD."
- "Reclaim old rail."
- "Nanobots are the resource."
- "Click a destination to queue a route."

The point is to see whether the game teaches those ideas.

### 4. Recovery Task, 5-8 Minutes

If the player has not naturally encountered scarcity:

> Please keep exploring until resources start to feel tight. What do you think your options are?

If they are completely stuck for more than 90 seconds, use the rescue rule below.

### 5. Short Interview, 8-10 Minutes

Ask:

- What did you think the goal was?
- What did you think nanobots did?
- What did the helper bot do?
- What did clicking a destination do?
- What felt good?
- What felt confusing or unfair?
- What did you want to do that the game did not allow?
- What would make you want to play one more run?

### 6. Ratings, 2 Minutes

Use 1-5 scale:

- I understood what I was trying to do.
- I understood why I could or could not move.
- The rail auto-printing made sense.
- Reclaiming made sense.
- Queued driving made sense.
- The game felt tense in a good way.
- I wanted to try again.

## Moderator Rules

- Stay quiet during task attempts.
- Prompt only with "what are you thinking?" or "what makes you say that?"
- Do not explain the game unless the player is stuck for 90 seconds and no more useful observation is happening.
- If you rescue the player, mark the timestamp and exact hint.
- Never argue with feedback.
- Do not ask "did you like X?" Ask "what did you notice?" or "what did you expect?"

## Rescue Rule

If a participant is stuck for 90 seconds:

1. Ask: "What options do you think you have?"
2. If still stuck, give the smallest possible hint.
3. Mark the hint in the trace.
4. Continue observing.

Hints, smallest to largest:

- "What on-screen resource changed?"
- "Try moving in a direction."
- "What do you think the old track near the first deposit is for?"
- "Try the Reclaim button."
- "Old rail can be recovered by the helper bot."

## Severity Ratings

Use severity to prioritize fixes:

- 0: observation, no fix needed.
- 1: polish issue; small annoyance.
- 2: moderate issue; player recovers but friction is meaningful.
- 3: severe issue; blocks comprehension, causes unfair failure, or prevents the core loop.

Add confidence:

- Low: one weak signal.
- Medium: repeated once or strongly observed once.
- High: repeated across 3+ sessions or directly blocks the core loop.

Fix rule:

- Fix all severity-3 issues before adding features.
- Fix severity-2 issues if repeated by 2+ players.
- Defer severity-1 unless trivial or embarrassing.

## Trace Plan

Moon Miner needs two trace types: human observation traces now, automated event traces later.

### Manual Observation Trace

Use one row per notable moment.

| Time | Player Action | Game State | Quote | Observation | Interpretation | Severity | Fix Idea |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 02:10 | Pressed W into crater | Nanobots 20, ore 0 | "Why won't it go?" | Did not read blocked terrain | Crater affordance unclear | 2 | Stronger blocked visual |

Rules:

- Separate observation from interpretation.
- Capture exact quotes when possible.
- Mark hints and moderator interventions.
- Capture seed, browser, build/date, and whether audio was on.
- Use the dev snapshot as supporting evidence, not a replacement for observation.

### Automated Event Trace Schema

When implemented, log JSON lines in memory and export/download after a session.

Required fields:

```json
{
  "sessionId": "uuid",
  "buildId": "git-sha-or-date",
  "seed": "apollo-17",
  "elapsedSeconds": 42.3,
  "event": "drive_attempt",
  "position": { "x": 3, "y": 7 },
  "target": { "x": 4, "y": 7 },
  "nanobots": 19,
  "ore": 0,
  "solarSeconds": 219,
  "phase": "playing"
}
```

Candidate events:

- `session_start`
- `brief_dismissed`
- `first_input`
- `mode_changed`
- `route_queued`
- `route_cancelled`
- `drive_attempt`
- `drive_success_existing_rail`
- `drive_success_auto_print`
- `drive_blocked`
- `mine_attempt`
- `mine_success`
- `mine_failed`
- `reclaim_attempt`
- `reclaim_assigned`
- `reclaim_completed`
- `reclaim_failed`
- `low_nanobots`
- `solar_warning`
- `win`
- `loss_stranded`
- `loss_solar`
- `reset`
- `session_end`

Derived metrics:

- Time to first input.
- Time to first successful drive.
- Time to first auto-print.
- Time to first blocked movement.
- Time to first route queue.
- Time to first reclaim attempt.
- Number of blocked movements.
- Number of rails auto-printed.
- Number of rails reclaimed.
- Lowest nanobot count.
- Win/loss outcome.
- Session duration.
- Quit/reset before outcome.

## Synthesis Process

After each round:

1. Copy all notes into one document.
2. Group findings by theme:
   - Goal comprehension
   - Movement/controls
   - Queued routing
   - Rail/nanobot economy
   - Terrain readability
   - Reclaiming
   - Timer/pressure
   - Feel/audio/visual feedback
   - Bugs/performance
3. Count participants affected.
4. Assign severity and confidence.
5. Convert only the top 3-5 findings into fixes.
6. Add lower-priority ideas to `BUGS.md`, `PROGRESS.md`, or a future backlog.

## Stop Conditions

Stop playtesting and fix before recruiting more players if:

- 2 players in a row cannot start moving.
- 2 players in a row cannot explain the goal after 5 minutes.
- 3 players do not understand nanobots.
- 3 players miss reclaiming entirely.
- A bug prevents completing a run.
- Audio, animation, or UI makes the core loop harder to understand.

## Current Recommended Next Step

Do not run Round 1 on the V0 grid prototype. The active design direction is now the continuous-motion nano-field concept in `CONCEPT_REFRAME.md`.

Next research step after the new spike exists: run a first-feel test that asks whether route shape, drone launch timing, prepared-field mining, and emergency crawl are understandable and exciting. Do not add save/load, campaign, upgrades, or deep ore systems before that first-feel synthesis exists.
