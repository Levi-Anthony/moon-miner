# 99th-Percentile Scaffolding Standard

## Purpose

This document turns the Moon Miner working style into a reusable operating system for any AI-assisted project. It is written for a completely cold reader: a future human, agent, or assistant should be able to continue the work with the same posture, quality bar, and decision discipline without needing the original chat.

## Definition Of Done

A project meets this standard when it:

- Teaches its own context to a cold reader.
- Makes the next useful action obvious.
- Separates product intent, implementation, validation, and research.
- Records decisions and provenance.
- Uses deterministic checks wherever possible.
- Produces proof for every completed slice.
- Surfaces known risks and unresolved questions.
- Protects the project from scope drift.
- Enables human/assistant parity on critical state.

## Interpretive Collaboration Standard

The assistant should not treat the user's words as only a literal task queue. Before locking a plan or implementing a meaningful slice, infer the deeper intent behind the request, including likely unknown unknowns, hidden tradeoffs, and the user's still-forming mental model.

For exploratory or product-shaping work, the assistant should:

- Help the user articulate the real problem before optimizing a proposed solution.
- Name the first-order interpretation, then look for the deeper ask behind it.
- Surface relevant frameworks, genre patterns, mechanics, background context, and vocabulary that help the user think better.
- Install usable mental models and cognitive links, not just answer the immediate prompt.
- Identify adjacent unasked questions that could materially change the direction.
- Red-team plausible drift, fake depth, and mechanics that may feel meaningful but not actually matter.
- Generalize durable preferences from one decision to the next, while checking when a preference may not transfer.
- Be explicit about confidence, what evidence would change the recommendation, and which assumptions are doing the most work.

This standard is especially important when the user is describing feel, fantasy, mechanics, creative direction, research interpretation, or strategy. It should not become license for unfocused scope expansion; inferred possibilities must still be tied back to the current bet, appetite, proof, and next decision.

## Required Project Files

Every project using this standard should create or maintain these files:

- `README.md`: how to run, test, use, and understand the project.
- `BETS.md`: current bets, appetite, scope, and completion checks.
- `DECISIONS.md`: durable decisions and why they were made.
- `PROGRESS.md`: completed slices, proof, and next slices.
- `BUGS.md`: reproducible bugs, known issues, and design risks.
- `DESIGN.md` or domain equivalent: product/game/system rules and non-goals.
- `PRIOR_ART.md` or `REFERENCES.md`: outside influences, sources, and provenance.
- `PLAYTESTING.md`, `RESEARCH.md`, or equivalent when user feedback matters.
- Test files or verification scripts for deterministic behavior.

If a project cannot justify one of these files, record the reason in `DECISIONS.md`.

## Phase 0: Intake And Frame

### Goal

Convert a raw idea into a shared operating frame before building too much.

### Reasoning

Most early project failure is not technical. It is ambiguity, scope drift, hidden assumptions, or loss of context between sessions.

### Inputs

- User idea or problem.
- Current repo state.
- Constraints: time, skills, platform, budget, taste, risk tolerance.

### Required Actions

1. Restate the project in one plain-language sentence.
2. Identify the target user or player.
3. Define the core loop or core workflow.
4. Define the smallest useful/playable slice.
5. Define explicit non-goals.
6. Identify the first major risk.
7. State the deeper inferred ask and any relevant mental model or framework.
8. Record the first bet and appetite in `BETS.md`.

### Checkpoint

A cold reader can answer:

- What is this?
- Who is it for?
- What is the core loop?
- What is deliberately out of scope?
- What is the first bet?
- What would count as proof?
- What deeper intent or unknown unknown shaped the bet?

### Pass Criteria

- `README.md` exists or has a clear starter section.
- `BETS.md` has a current bet.
- `DECISIONS.md` has at least the initial platform/approach decision.
- `PROGRESS.md` has next slices.

## Phase 1: Scaffolding And First Executable Slice

### Goal

Create the smallest running version that proves the project can execute end to end.

### Reasoning

Working software, however rough, creates better questions than abstract planning. The slice should expose the highest-risk assumption as early as possible.

### Required Actions

1. Choose boring, established tools appropriate to the project.
2. Create the minimum runnable structure.
3. Add one visible or observable behavior.
4. Add one deterministic proof check.
5. Document how to run the project.
6. Run the check.
7. Record proof in `PROGRESS.md`.

### Checkpoint

A cold reader can clone/open the project, run one command, and see or verify a real result.

### Pass Criteria

- Project runs locally.
- At least one test, build, smoke check, or deterministic manual check passes.
- `README.md` run instructions are accurate.
- No hidden setup knowledge is required.

## Phase 2: Separation Of Concerns

### Goal

Keep rules, presentation, orchestration, tests, and research from blurring together.

### Reasoning

AI-assisted projects become fragile when the codebase cannot tell future agents where truth lives. Separation of concerns creates durable collaboration boundaries.

### Required Actions

1. Identify core state.
2. Identify pure rules or business logic.
3. Identify presentation/UI/rendering logic.
4. Identify input or orchestration logic.
5. Identify persistence or external integration boundaries.
6. Keep deterministic logic testable without browser/UI/network state.
7. Record the separation decision in `DECISIONS.md`.

### Checkpoint

A cold reader can answer:

- Where do I change the rules?
- Where do I change the visuals?
- Where do I change the workflow?
- Where do I add tests?
- What should not be mixed?

### Pass Criteria

- Core behavior has tests or deterministic checks.
- Presentation can change without rewriting core rules.
- Docs name the ownership boundaries.

## Phase 3: Proof Discipline

### Goal

Make "done" externally checkable.

### Reasoning

Without proof, AI and humans both overestimate completion. Proof prevents drift, hallucinated progress, and brittle handoffs.

### Required Actions

1. Define acceptance checks before or during each slice.
2. Run the relevant checks after each slice.
3. Capture the result in the final report or `PROGRESS.md`.
4. If a check cannot run, record why.
5. If a check fails, either fix it or record the blocker.

### Proof Types

- Unit tests.
- Integration tests.
- Production build.
- Smoke test.
- Browser screenshot or click-through.
- Trace export.
- Manual reproduction steps.
- User/playtest quote.
- Before/after metric.

### Checkpoint

A cold reader can see what was changed and how it was verified.

### Pass Criteria

- Every completed slice has proof.
- Proof is specific, not vague.
- Failed or skipped checks are disclosed.

## Phase 3.5: Git Checkpoint Discipline

### Goal

Make progress recoverable, inspectable, and nameable.

### Reasoning

Documentation explains what happened, tests prove what still works, and Git preserves the exact project state. A project without commits has no safe return point and no reliable history. This is especially risky in AI-assisted work, where many files can change quickly.

### Required Actions

1. Run `git status --short` before every meaningful slice.
2. Identify whether existing changed files are related or unrelated to the slice.
3. Keep the slice small enough to describe in one commit message.
4. Run the agreed proof commands before committing.
5. If proof is green, commit the slice.
6. If proof is red, either fix it before committing or record the red status plainly in `PROGRESS.md`.
7. Never let major project work accumulate with no commits.

### Commit Record

Every completed slice should have:

- Changed files.
- Proof commands run.
- Exact pass/fail result.
- Known red checks, if any.
- Commit message.

### Beginner-Safe Rule

If you are confused, run only:

```bash
git status --short
```

Then stop and ask what the changed files mean. Do not run destructive reset or delete commands unless you understand exactly what they will erase.

### Pass Criteria

- The repo has a recent commit for the last completed slice.
- `PROGRESS.md` does not claim red checks are green.
- A cold reader can connect the docs, proof results, and Git history.

## Phase 4: Red Team And Hygiene

### Goal

Actively look for confusion, breakage, hidden coupling, and scope mistakes.

### Reasoning

High-quality scaffolding is not optimistic. It assumes the project will be read cold, modified by agents, interrupted, and misunderstood.

### Required Actions

1. Search for stale names, old mental models, TODOs, debug artifacts, and dead APIs.
2. Test at least one failure path.
3. Test at least one edge case.
4. Check whether docs match behavior.
5. Check whether the next action still makes sense.
6. Add or update `BUGS.md` for unresolved risks.
7. Add tests for any red-team case that is cheap and important.

### Checkpoint

A cold reader can trust that the current state is not secretly contradicted by old docs or stale code.

### Pass Criteria

- No obvious stale user-facing language.
- Known issues are explicit.
- Important failure modes are tested or documented.
- The project has a clean next slice.

## Phase 5: User/Player Feedback Loop

### Goal

Use real feedback to validate comprehension, usefulness, feel, or value.

### Reasoning

The builder's mental model is not the user's mental model. Feedback should happen before adding layers of content or complexity.

### Required Actions

1. Write research questions.
2. Define participant profile.
3. Define session script.
4. Define observation trace format.
5. Define severity scoring.
6. Run a solo sanity pass before involving others.
7. Synthesize findings into no more than 3-5 fixes.
8. Record findings and next bet.

### Checkpoint

A cold reader can run the same study and compare results.

### Pass Criteria

- Research method is documented.
- Observations are separated from interpretations.
- Fixes are prioritized by severity and confidence.
- New features wait behind severe comprehension blockers.

## Phase 6: Generalization And Handoff

### Goal

Make the system reusable across sessions, agents, and projects.

### Reasoning

The best scaffold is not only correct today. It should teach future work how to continue with the same standard.

### Required Actions

1. Update project memory files.
2. Record why the current approach was chosen.
3. Record unresolved questions.
4. Record next slices in priority order.
5. Ensure a cold reader can resume without chat context.
6. If a process proved useful, promote it into a reusable template.

### Checkpoint

A new agent can continue the project without asking what happened last time.

### Pass Criteria

- `README.md`, `PROGRESS.md`, `BETS.md`, `DECISIONS.md`, and `BUGS.md` agree.
- Next slice is concrete and bounded.
- The current bet is still visible.
- Known risks are not buried in chat.

## Cold-Read Step-By-Step Instructions

Follow these instructions at the start of any new session.

### Step 1: Establish Current Reality

1. Read `README.md`.
2. Read `PROGRESS.md`.
3. Read `BETS.md`.
4. Read `DECISIONS.md`.
5. Read `BUGS.md`.
6. Read the domain design doc, such as `GAME_DESIGN.md`.
7. If user feedback matters, read `PLAYTESTING.md` or equivalent.
8. Run `git status --short`.

Do not assume chat context is complete. Treat the repo as the source of truth.

### Step 2: State The Current Frame

Write or internally confirm:

1. Current goal.
2. Current bet.
3. Current non-goals.
4. Current next slice.
5. Known risks.
6. Required proof checks.
7. Deeper inferred ask and mental model currently guiding the work.

If any item is missing, add or update the relevant project memory file before doing large work.

### Step 3: Choose The Next Slice

Pick a slice that is:

- Small enough to verify today.
- Directly tied to the current bet.
- Valuable without future work.
- Safe to stop after.
- Covered by proof.

Reject slices that primarily add novelty while unresolved severe confusion or correctness risks remain.

### Step 4: Define Acceptance Checks

Before implementation, define:

- User-visible result.
- Files or subsystems likely to change.
- Deterministic tests or checks.
- Manual check if needed.
- Failure path to test.
- Documentation updates required.

### Step 5: Implement Conservatively

1. Follow existing patterns.
2. Keep changes scoped.
3. Preserve separation of concerns.
4. Prefer pure, testable logic for core behavior.
5. Avoid adding abstractions unless they remove real complexity.
6. Do not rewrite unrelated code.
7. Do not overwrite user changes.

### Step 6: Verify

Run the narrowest relevant checks first, then broader checks.

Common order:

1. Unit tests for changed logic.
2. Build or typecheck.
3. Lint/audit if available.
4. Smoke test.
5. Browser or manual verification for UI.
6. Targeted red-team case.

Record any check that cannot be run and why.
If a check is red, say so plainly. Do not hide it behind a narrower green command.

### Step 7: Red Team

Ask:

- What can a new user misunderstand?
- What can a future agent misunderstand?
- What can fail silently?
- What stale docs or names now lie?
- What edge case did this introduce?
- What dependency, network, browser, or environment assumption changed?
- What proof would catch a regression?

Fix cheap high-impact issues immediately. Record the rest.

### Step 8: Update Project Memory

Update as needed:

- `PROGRESS.md`: completed work and proof.
- `BETS.md`: new or changed bet.
- `DECISIONS.md`: durable choices.
- `BUGS.md`: known issues and risks.
- `README.md`: run/use instructions.
- Domain docs: rules, workflows, or research plans.

Do not leave important state only in the final chat response.

### Step 8.5: Commit The Slice

If the slice is complete and the proof status is honestly recorded:

1. Run `git status --short`.
2. Stage only the intended files.
3. Commit with a short message that names the slice.
4. Record the commit message in the final handoff when useful.

Do not commit unrelated user changes into a slice unless this is the first project checkpoint and the user explicitly wants the whole current project preserved.

### Step 9: Final Handoff

Final response should include:

- What changed.
- Where it changed.
- Proof checks run.
- Known residual risk.
- The deeper inferred intent or mental model if the work involved product, strategy, or creative direction.
- Next-bet recommendation set:
  - One obvious bet.
  - One credible alternative bet.
  - One non-obvious sleeper bet.
  - Tradeoffs for all three.
  - An honest winner, argued both for and against the other options.
  - Confidence level and what evidence would raise, lower, or flip the recommendation.

Keep it concise, but specific enough that a cold reader can verify the claim.

## 99th-Percentile Scoring Rubric

Score each category 0-5.

| Category | 5 Means |
| --- | --- |
| Goal clarity | A cold reader can state the goal, current bet, non-goals, and next slice in under 3 minutes. |
| Executability | The next action is concrete, bounded, and has unambiguous completion checks. |
| Determinism | Core behavior is reproducible with tests, seeds, traces, or exact procedures. |
| Legibility | Project state is visible in docs, code names, tests, and user-facing behavior. |
| Human/AI handoff | A fresh assistant can continue without hidden chat context. |
| Proof discipline | Every completed slice has verifiable evidence. |
| Separation of concerns | Rules, presentation, research, docs, and orchestration do not blur together. |
| Recovery design | Failures produce useful messages, rollback paths, or diagnostic next steps. |
| Scope control | Tempting but premature ideas are captured without derailing the slice. |
| Red-team coverage | Major confusion and failure modes are anticipated, tested, or documented. |
| Provenance | External methods and key decisions are attributed. |
| Generalization | The scaffold could guide another project, not just this one. |

## Score Bands

- 55-60: 99th-percentile scaffold. Durable, transferable, newbie-safe, and agent-safe.
- 48-54: Strong. Usable, with some proof, handoff, or red-team gaps.
- 40-47: Functional but fragile. Likely dependent on fresh context.
- Below 40: Vibe-driven. High risk of lost continuity, scope drift, or unverified claims.

## Hard Gates

The project fails the 99th-percentile bar if any of these are missing:

- Written current bet.
- Proof of work.
- Next slice.
- Decision record.
- Way to reproduce core behavior.
- Known-issues list.
- Explicit non-goals.
- Handoff path for a future human or agent.

## Generalized Slice Template

Use this template for every meaningful slice.

```text
Slice:

Bet:

Appetite:

Non-goals:

Expected user-visible result:

Likely files/subsystems:

Acceptance checks:

Failure/edge case to test:

Docs to update:

Proof captured:

Residual risk:

Next bet recommendations:
- Obvious:
- Alternative:
- Sleeper:
- Winner:
- Confidence:
- What would change the recommendation:
```

## Generalized Final Report Template

```text
Changed:
- 

Proof:
- 

Red-team/hygiene:
- 

Known residual risk:
- 

Next bet recommendations:
- Obvious:
- Alternative:
- Sleeper:
- Winner:
- Confidence:
- What would change the recommendation:

Next best slice:
- 
```
