# Start Here

This file is the day-one operating manual for Moon Miner. It assumes you are intelligent, but it does not assume you already know command-line, Git, localhost, ports, dev servers, or testing rituals.

Use this when you want to open the project, run the game, test it, or ask an agent for help without guessing.

## What This Folder Is

The project lives here:

```bash
/Users/prodadmin/Documents/Moon Miner
```

That folder contains the game code, documentation, tests, package setup, and Git history.

When a command in this guide says "run this," it means:

1. Open the Terminal app.
2. Move Terminal into the project folder.
3. Paste the command.
4. Press `Return`.

To move Terminal into the project folder, run:

```bash
cd "/Users/prodadmin/Documents/Moon Miner"
```

The quotation marks matter because the folder name has a space in it.

## Vocabulary

- **Terminal**: a text window where you tell the computer to run commands.
- **Command**: one line of text you run in Terminal, such as `npm run dev`.
- **Project folder**: the Moon Miner folder on this Mac.
- **npm**: the tool that runs this JavaScript/TypeScript project's scripts.
- **Vite**: the local development server used to show the game in a browser.
- **Dev server**: a temporary local web server running from your Terminal.
- **localhost**: this same computer. `http://localhost:5173/` means "open port 5173 on this Mac."
- **Port**: a numbered doorway on your computer. Vite often uses `5173`, but it may choose `5174`, `5175`, or another nearby number if the first one is busy.
- **URL**: a browser address, such as `http://localhost:5173/?mobile=1`.
- **Query flag**: the part after `?` in a URL. It changes the mode without changing the app.
- **Ctrl+C**: hold the `Control` key and press `C`. In Terminal, this usually stops the running command.

## First-Time Setup

Run this once after opening the project for the first time, or whenever dependencies seem missing:

```bash
npm install
```

Expected result: npm downloads or checks the project dependencies and eventually returns you to a normal Terminal prompt.

If `npm install` prints warnings, do not panic. Warnings are not always failures. A failure usually has words like `error`, `failed`, or exits before returning to the normal prompt.

## Start The Game

From the project folder, run:

```bash
npm run dev
```

What good looks like:

```text
VITE v6.x.x  ready in ...

  Local:   http://localhost:5173/
  Network: http://192.168.x.x:5173/
```

Your exact port may be different. For example, Vite may print:

```text
Local:   http://localhost:5174/
```

That is fine. Copy the exact URL Vite printed.

Then open that URL in a browser.

Important: while the game is running, leave this Terminal window open. The dev server is the thing serving the game to the browser.

## Stop The Game Server

Go back to the Terminal window where `npm run dev` is running.

Press:

```text
Ctrl+C
```

That means hold `Control` and press `C`.

What good looks like: the Vite process stops and Terminal gives you a normal prompt again.

If the browser later says "site can't be reached," the dev server is probably not running anymore. Start it again with:

```bash
npm run dev
```

## URL Modes

Start with the exact `Local` URL printed by Vite. In these examples, the printed URL is:

```text
http://localhost:5173/
```

Desktop/default mode:

```text
http://localhost:5173/
```

Mobile portrait simulation:

```text
http://localhost:5173/?mobile=1
```

Debug tuning panel:

```text
http://localhost:5173/?debug=1
```

Mobile portrait plus debug workbench:

```text
http://localhost:5173/?mobile=1&debug=1
```

Old chase-camera comparison:

```text
http://localhost:5173/?view=chase
```

Mobile portrait plus chase-camera comparison:

```text
http://localhost:5173/?mobile=1&view=chase
```

Rule of thumb: the first mode flag starts with `?`. Extra flags use `&`.

## Real Phone Testing

`localhost` only means "this device."

On your Mac:

```text
http://localhost:5173/
```

means "this Mac."

On your phone:

```text
http://localhost:5173/
```

means "this phone," not your Mac. That will usually fail because the game server is running on the Mac.

To test on a real phone:

1. Make sure the Mac and phone are on the same Wi-Fi network.
2. Start the dev server on the Mac:

```bash
npm run dev
```

3. Look for the `Network` URL printed by Vite, for example:

```text
Network: http://192.168.1.24:5173/
```

4. On the phone, open that `Network` URL.
5. For the mobile layout, add `?mobile=1`:

```text
http://192.168.1.24:5173/?mobile=1
```

If the phone cannot open the page:

1. Confirm the dev server is still running on the Mac.
2. Confirm both devices are on the same Wi-Fi.
3. Try the exact `Network` URL again.
4. Copy the exact browser message and exact Terminal output before asking an agent.

## Proof Commands

Use these commands to check reality.

Fast green baseline:

```bash
npm run verify
```

This runs unit tests and a production build.

Known-green baseline:

```bash
npm run verify:known-green
```

An alias for `npm run verify` — unit tests and a production build. It depends only on the contents of this repository, so a red result always means something here changed.

Dependency audit, separately:

```bash
npm run verify:audit
```

This is deliberately not part of the baseline. `npm audit` reads a live advisory feed, so it can turn red with no code change at all — which is exactly what happened between July and September 2026. A baseline that moves on its own cannot answer "did my change break something."

Full verification:

```bash
npm run verify:full
```

Tests, build, browser smoke, then the audit last. Audit runs last on purpose: it used to sit ahead of the smoke check, so a red audit short-circuited the chain and the browser check never ran at all. As of September 8, 2026 this passes end to end on `main`.

## Current Check Status

As of September 8, 2026, measured on `main` at `787d502` plus the lockfile fix in this change:

- `npm test` passes, 62 tests.
- `npm run build` passes.
- `npm audit` passes, 0 vulnerabilities.
- `npm run smoke:continuous` passes.
- `npm run verify`, `npm run verify:known-green`, and `npm run verify:full` all exit 0.

Nothing is known red on `main` right now.

Two things not to assume from that:

- **Branches differ.** The open PR #1 branch fails smoke with `Expected tactical view mode, got chase.` A green `main` says nothing about a branch.
- **This section ages.** `npm audit` reads a live advisory feed, so it can go red with no code change at all. Between July 1 and September 8, 2026 this section was wrong in both directions at once: it called smoke red while smoke passed, and called audit clean while audit was failing on two high-severity advisories. Nobody noticed, because nothing re-runs these commands automatically.

Do not let an agent say "all checks pass" unless it includes the current known-red status or has actually fixed it.

As of September 8, 2026 nothing is known red on `main`. So an agent claiming green must also say which branch and which commit it measured, because a branch can differ. Re-run the commands; do not quote this section as evidence.

Since September 8, 2026 these checks also run in GitHub Actions on every push and pull request, so a red result shows up on the pull request instead of waiting for someone to notice. That is the actual fix for how this section went stale: it was hand-maintained, and nothing re-ran the commands for two months.

## When Something Goes Wrong

If `npm run dev` fails:

1. Copy the full error text.
2. Do not guess.
3. Run:

```bash
npm install
```

4. Try again:

```bash
npm run dev
```

5. If it is still broken, ask an agent and include:
   - The exact command you ran.
   - The exact error text.
   - Whether you are in `/Users/prodadmin/Documents/Moon Miner`.

If the browser says "site can't be reached":

1. Go back to Terminal.
2. Check whether Vite is still active.
3. If you see a normal prompt instead of Vite output, the server is stopped.
4. Run:

```bash
npm run dev
```

5. Open the newly printed URL.

If a command looks stuck:

1. Wait a few seconds.
2. If it is a dev server, that is normal. It keeps running until you press `Ctrl+C`.
3. If it is a test or build command and it seems stuck for a long time, copy the last visible lines and ask an agent.

## Safe Confusion Move

If you feel lost, do not delete files and do not run reset commands.

Run:

```bash
git status --short
```

Then ask:

```text
Here is my git status. What do these changed files mean, and what is the safest next step?
```

That is the safe panic button.
