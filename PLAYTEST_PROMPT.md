# Playtest Prompt Package

Status: V0 grid prompt package paused.

Do not use this prompt for new participants until it is rewritten for the continuous-motion nano-field prototype described in `CONCEPT_REFRAME.md`. Keep it as reusable moderator/synthesis scaffolding.

Use this when asking another AI session, human moderator, or future Codex thread to run or synthesize Moon Miner playtests.

## One-Shot Prompt For A Playtest Moderator

```text
You are helping playtest Moon Miner, a top-down browser game prototype.

Current game premise:
- The player drives a lunar mining rover.
- The rover auto-prints temporary maglev rail when driving into valid untracked terrain.
- Auto-printing spends nanobots.
- Existing rail is cheaper because it does not spend nanobots.
- The player can click a destination to queue a cardinal route.
- Craters and ridges block rail.
- The player mines ore, reclaims old rail with a helper bot, and returns to base before the solar timer ends.

Your job:
Run a moderated playtest focused on first-time comprehension, decision-making, and feel. Test the game, not the participant. Do not teach the solution unless the rescue rule is triggered.

Before the session:
1. Record build/date, seed, browser, device, and whether audio is on.
2. Confirm screen/audio recording permission if recording.
3. Tell the participant: "We are testing the game, not you. Confusion is useful."

Session flow:
1. Ask about game background and keyboard comfort.
2. Give this neutral task: "Please start a run and try to complete the mission. Use whatever the game gives you. Say what you are thinking for the first few minutes."
3. Observe silently. Prompt only with "what are you thinking?" or "what makes you say that?"
4. If stuck for 90 seconds, use the smallest possible hint and mark the intervention.
5. After play, ask:
   - What did you think the goal was?
   - What did you think nanobots did?
   - What did the helper bot do?
   - What did clicking a destination do?
   - What felt good?
   - What felt confusing or unfair?
   - What did you want to do that the game did not allow?
   - What would make you want to play one more run?
6. Collect 1-5 ratings:
   - I understood what I was trying to do.
   - I understood why I could or could not move.
   - The rail auto-printing made sense.
   - Reclaiming made sense.
   - Queued driving made sense.
   - The game felt tense in a good way.
   - I wanted to try again.

Trace format:
For every notable moment, record:
- timestamp
- player action
- game state
- exact quote if any
- observation
- interpretation
- severity 0-3
- possible fix

Severity:
0 observation only
1 polish issue
2 meaningful friction but recoverable
3 blocks comprehension, causes unfair failure, or prevents the core loop

Output:
Return a concise playtest report with:
1. Participant context
2. Session outcome
3. Top findings, ordered by severity
4. Evidence traces and quotes
5. What worked
6. Fix recommendations
7. Questions for the next playtest
```

## Prompt For AI Synthesis After Multiple Sessions

```text
You are synthesizing Moon Miner playtest notes.

Inputs:
- Raw observation traces
- Participant ratings
- Quotes
- Any known build/seed/session metadata

Analyze the notes using these themes:
- Goal comprehension
- Movement/controls
- Queued routing
- Rail/nanobot economy
- Terrain readability
- Reclaiming
- Timer/pressure
- Feel/audio/visual feedback
- Bugs/performance

Rules:
- Separate observed behavior from interpretation.
- Do not overfit to one participant unless the issue blocks the core loop.
- Count how many participants experienced each issue.
- Assign severity 0-3 and confidence low/medium/high.
- Recommend no more than 5 fixes.
- Prefer fixes that unblock comprehension before adding new content.

Output:
1. Executive summary
2. Top findings table: issue, evidence, participants affected, severity, confidence, recommendation
3. Positive signals
4. Open questions
5. Recommended next build slice
6. Specific updates to BUGS.md, PROGRESS.md, or BETS.md
```

## Session Report Template

```text
Session ID:
Date:
Build:
Seed:
Browser/device:
Audio on/off:
Participant profile:

Outcome:
- Won/lost/quit/reset:
- Session length:
- Time to first drive:
- Time to first auto-print:
- Time to first route queue:
- Time to first reclaim:

Ratings, 1-5:
- Understood goal:
- Understood movement blockers:
- Auto-print made sense:
- Reclaiming made sense:
- Queued driving made sense:
- Good tension:
- Wanted another run:

Trace notes:
| Time | Action | State | Quote | Observation | Interpretation | Severity | Fix idea |
| --- | --- | --- | --- | --- | --- | --- | --- |

Top findings:
1.
2.
3.

What worked:
-

Recommended fix:
-
```
