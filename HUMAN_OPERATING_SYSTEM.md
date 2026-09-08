# Human Operating System

This file is the personal workflow scaffold for owning Moon Miner instead of treating it like a mysterious folder an agent manipulates.

The goal is not to become a professional engineer overnight. The goal is to operate the project safely: open it, verify it, understand what changed, and preserve progress.

## Core Mental Model

You are responsible for three kinds of reality:

1. **Running reality**: can you open and play the game?
2. **Proof reality**: do the checks pass or fail?
3. **History reality**: is there a Git checkpoint you can return to?

When all three are visible, the project is calm. When any one is invisible, future work gets slippery.

## Before Work Checklist

Use this before asking an agent to change anything.

1. Open Terminal.
2. Go to the project folder:

```bash
cd "/Users/prodadmin/Documents/Moon Miner"
```

3. Check Git reality:

```bash
git status --short
```

4. Read the current truth surface:

```text
README.md
PROGRESS.md
HANDOFF.md
```

5. If you want to play the game, start the dev server:

```bash
npm run dev
```

6. Open the exact URL Vite prints.

If `git status --short` shows files and you do not understand why, stop and ask before continuing.

## During Work Checklist

Keep the current slice small.

Good slice shape:

```text
Goal:
What is changing:
What is not changing:
Proof command:
Known risk:
```

Example:

```text
Goal: Add beginner operations docs.
What is changing: README and docs.
What is not changing: gameplay, rendering, tuning, mechanics.
Proof command: npm run verify:known-green.
Known risk: none known; re-run the proof command to confirm.
```

If the slice cannot be described this simply, it is probably too big.

## After Work Checklist

Use this after a human or agent changes files.

1. Check what changed:

```bash
git status --short
```

2. Run the agreed proof command. For the current baseline:

```bash
npm run verify:known-green
```

3. If the full browser smoke is relevant, run:

```bash
npm run smoke:continuous
```

4. Record the exact pass/fail result in `PROGRESS.md`.
5. If the work is good, make a Git checkpoint.

## Plain-English Git Model

Git is the project's save system.

- `git status --short` means "show me what changed."
- `git add` means "put these changes into the next save point."
- `git commit` means "create a named save point."
- A commit message is the name on the save point.
- A branch is an alternate timeline.

You do not need to know every Git command. You do need to know that uncommitted work is easier to lose and harder to reason about.

## Safe Git Habit

Before changing code:

```bash
git status --short
```

After a good, verified slice:

```bash
git status --short
```

Then ask an agent to stage and commit, or ask for the exact commands.

Commit message shape:

```text
Verb object
```

Examples:

```text
Add beginner operations scaffold
Fix drone smoke timing
Split continuous scene layout helpers
```

## Panic Button

If you are confused:

```bash
git status --short
```

Then stop.

Ask:

```text
Here is my git status. What do these changed files mean, and what is the safest next step?
```

Do not run reset commands. Do not delete files. Do not try to clean things up by guessing.

## Agent Ground Rules

Copy this block when starting a new agent session:

```markdown
Before changing code:
1. Run `git status --short`.
2. Tell me what files are already modified.
3. State the exact goal of this slice.
4. State what is explicitly out of scope.
5. Do not change gameplay unless I asked for gameplay changes.

After changing code:
1. Run the agreed proof commands.
2. Report exact pass/fail results.
3. If anything is red, say so plainly.
4. Update project memory docs if the project state changed.
5. Provide the commit message I should use.
```

## What To Ask Agents For

Good asks:

```text
Open the repo, check git status, and tell me current reality before changing anything.
```

```text
Make a docs-only slice. Do not touch gameplay. Run npm run verify:known-green.
```

```text
The smoke check is red. Diagnose it, but do not change code until you explain the likely cause.
```

Risky asks:

```text
Make it better.
```

```text
Polish everything.
```

```text
Fix all issues.
```

Those are too broad. Broad asks invite scope drift.

## Minimum Operating Rhythm

Use this rhythm until it feels boring:

1. Check current reality.
2. Pick one slice.
3. Name non-goals.
4. Make the change.
5. Run proof.
6. Record proof.
7. Commit.

Boring is good here. Boring means the project is becoming owned infrastructure.
