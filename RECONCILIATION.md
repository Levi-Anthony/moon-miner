# Reconciliation — 2026-09-23

Tracking: Linear **DEV-49** (related: DEV-13). Checkpoint: `main` at `f870f0c` (Merge PR #27).

PR #10 (2026-09-17) rebuilt the presentation on Three.js and removed Phaser. PRs #11–#27 followed within five days. This pass checks each surface that records project state against `main` at `f870f0c`, and records a verdict for each item. Nothing here closes a PR, deletes a branch, changes a Linear status, or edits ECB. Those actions appear under **Proposed actions** and wait for owner approval.

Verdicts: **current** (matches main) · **stale** (contradicted by main) · **superseded** (replaced by different work on main) · **landed** (reached main under another commit) · **historical** (kept as record, not a status source) · **open** (needs an owner decision).

## 1. Ground truth on `f870f0c`

Measured 2026-09-23 04:39 UTC, branch `claude/checkpoint-in-progress-work-3ucz16` (identical to `main` at `f870f0c`), Linux container, Node v22.22.2.

| Command | Result |
|---|---|
| `npm ci` | exit 0 |
| `npm test` | exit 0 — **134 tests, 13 files** |
| `npm run build` | exit 0 — one JS chunk, 634.74 kB (167.38 kB gzip), no size warning |
| `npm run smoke:continuous` | exit 0 with `CHROME_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome`: "SMOKE OK — booted clean, HUD up, rover drove 72 units." Without `CHROME_PATH`, it fails because Playwright 1.61 expects browser build 1228 and this container ships 1194. That failure comes from the environment, not the code. |
| `npm run report:last-light` | exit 0 — 5/5 routes won. See finding F2. |
| `npm audit` | **exit 1** — 2 moderate: `@vitest/mocker` / `vitest` ≤ 4.1.10, GHSA-82fw-gwwq-j7x9 (path traversal via redirect mock). `npm audit fix` is available. Dev-only dependency. `audit.yml` runs weekly by design and does not gate CI. |

### Findings from the runs

- **F1 — the smoke test covers much less than before.** The Phaser-era smoke drove A/D/W/S/Space, desktop and mobile layouts, view modes, HUD overlap and touch targets. The 3D smoke (`scripts/continuous-smoke.mjs`) checks boot, HUD and one drive through `window.__mm3d`. The docs still describe the old coverage.
- **F2 — the last-light report notes are fixed strings.** `getLastLightRouteNote` (`src/game/continuousSelfPlay.ts:519`) returns fixed text per route. The `greedyLatePocketSloppy` note reads "collapses into heavy crawl" and `deepLobe` reads "with crawl pressure", while **Crawl Seconds is 0.0 on every route**. A test pins that text (`src/game/continuous.test.ts:1515`). Crawl reading zero on every route also bears on DEV-19 (Done), whose premise was restoring crawl through consequence.
- **F3 — the 3D build reads no URL parameters.** `src/three/` has no `location`/`searchParams` reads, so `?mobile=1`, `?debug=1`, `?view=chase`, `?view=tactical` and the `~` panel toggle do nothing on main. README and START_HERE present them as working.

## 2. Unmerged work

The comparison ran by patch (`git cherry`) and by searching main's code for each idea's markers.

| Item | Last commit | Verdict | Evidence |
|---|---|---|---|
| PR #9 `claude/road-graphics-sandbox-qpf1ek` (draft) | 2026-09-15 | **superseded** | Its only file, `src/scenes/ContinuousMoonMinerScene.ts`, no longer exists on main. The prevId ribbon it removes belongs to the retired Phaser renderer. Main's road is a raster decal painted onto the ground (HANDOFF §0). |
| PR #7 `claude/road-is-road` | 2026-09-10 | **superseded (code) + open (design)** | Touches the removed scene file. None of its 8 commits reached main. Main took the opposite direction: it has rail-lock and rail-slide (PRs #17, #20, #23), where PR #7 had "strip the rail and the magnet". It also keeps a drone launch fee (`droneLaunchCost: 2.2` plus a decaying surcharge, `src/game/continuous.ts:487,868`), which PR #7 removed. PR #7's arguments for a single-price road and against launch fees were never ruled on. |
| `claude/recent-runs-echo-check-9kxakb` (no PR) | 2026-09-09 | **landed** | Squashed onto main as `807f540` (playthrough harness + dials) and `0de504d` (lattice tiles, topology, rotate-in-place). Main has `hex.ts`, `greed` (25 hits), topology (9) and `preparedRefillPerSecond` (4). |
| `claude/orient-recommend-alignment-poe2hr` (no PR) | 2026-09-09 | **landed** | Squashed onto main as PR #6 `96e8202` ("Conserve the nanobot loop, and author a map with two ways home"). `routeAffordance.ts` is on main. |
| `claude/current-state-report-a81tov` | — | **landed** | Tip `906a871` is on main (PR #26). |
| `claude/start-over-interview-gyq1z4` (PR #1 branch) | — | **landed** | 0 commits ahead of main. |
| Dangling `7542721` "Make it a round trip" (09-07) | — | **superseded** | Exists only in this clone. Touches the removed scene file. |
| Dangling `d9c6149` "player-facing control panel" (09-11) | — | **superseded** | Exists only in this clone. The Phaser version of DEV-26; main's panel is `src/three/panel.ts`. |
| Dangling `3e93188` "Fix road polygon problems" (09-16) | — | **superseded** | Exists only in this clone. Phaser vector-road fix; main paints the road as a raster decal. |

**No work is stranded.** Everything unmerged has either reached main under another hash or been replaced by the 3D rebuild. The one thing left open is PR #7's design question.

## 3. Repo docs

| Doc | Last touched | Verdict | Contradictions with main |
|---|---|---|---|
| `HANDOFF.md` | 09-16 | **current §0, historical §1+** | §0 records the flip correctly and labels §1+ as pre-flip. It predates PRs #11–#27: world scale, vista, crater walls, rail stock growth, persistence modes, panel redesign, sun/shadows. |
| `DECISIONS.md` | 09-17 | **current through 09-15** | Last dated section is the 09-15 road rework. No entries for the WS1–WS5 decisions. |
| `README.md` | 09-08 | **stale** | Proof paragraph cites 62 tests at `787d502` (now 134). Mentions a "Phaser scene" debug snapshot `#moon-miner-continuous-debug-state` (now `window.__mm3d`), dead URL flags (F3), a `~` Dynamics panel and old smoke coverage (F1). Cold-read order points to 07-01 docs first. |
| `START_HERE.md` | 09-08 | **stale** | Machine-specific path `/Users/prodadmin/...` (DEV-8). Dead URL flags (F3). "62 tests". |
| `PROGRESS.md` | 09-08 | **stale** | "Last Verified" was at `787d502`. PR #1 "Known Red" is resolved. "Completed" and "Next Slices" describe the Phaser spike (DEV-7). |
| `HUMAN_OPERATING_SYSTEM.md` | 09-08 | **stale (partial)** | `/Users/prodadmin/...` path (DEV-8). The workflow guidance still holds. |
| `CONCEPT_REFRAME.md`, `GAME_DESIGN.md` | 07-01 | **historical / canon** | Design canon from the pivot. `GAME_DESIGN.md` still says "separated from Phaser rendering" (the separation still holds; the renderer is now Three.js). DEV-13 tracks the drift between build and canon. |
| `BETS.md`, `BUGS.md` | 07-01 | **historical** | Grid-era and early-spike bets and bugs. |
| `PLAYTESTING.md`, `PLAYTEST_PROMPT.md`, `ROUND_1_PLAYTEST.md` | 07-01 | **historical** | Self-labelled "V0 grid … paused". |
| `PRIOR_ART.md`, `SCAFFOLDING_STANDARD.md` | 07-01 | **current (timeless)** | Not about the build. |

## 4. Linear (team Development & Coding)

| Issue | Status | Verdict | Evidence |
|---|---|---|---|
| DEV-7 PROGRESS.md contradictions | Backlog | **partly addressed** | This pass refreshes "Last Verified"; the older sections still need a rewrite. |
| DEV-8 machine-specific paths | Backlog | **still valid** | `START_HERE.md:12,27`, `HUMAN_OPERATING_SYSTEM.md:25`. |
| DEV-9 bundle over chunk limit | Backlog | **resolved by the substrate change** | 634.74 kB against a 1600 kB limit; no warning since Phaser left. |
| DEV-10 generate proof status mechanically | Backlog | **still valid** | Proof status is still hand-written (this file included). |
| DEV-11 `--experimental-websocket` flag | Backlog | **still valid** | `package.json` `smoke:continuous`. |
| DEV-13 build ↔ canon drift | Backlog | **still valid, larger** | Now includes the 3D flip. DEV-49 covers the state-surface half. |
| DEV-14 drone timing decision | Todo | **open** | Main uses a decaying launch surcharge (`continuous.ts:845–868`). Needs an owner ruling on whether that answers it. |
| DEV-20 drone lift takes interior track | Backlog | **partly addressed** | `reclaimProtectLoop` exists (`continuous.ts:244`) but defaults to off in the sim. |
| DEV-23 prepared-road payoff / self-play rig | Done | **current** | PR #26 (`90de1be`), suite green. |
| DEV-24 road legibility | Backlog | **open** | PR #10's title includes "legibility". Needs an owner playtest read. |
| DEV-27 fixed-N game with summary | Backlog | **appears done** | `ea87696` "3-shift expedition with a scored finish"; `loop.ts:38` `shiftsPerGame: 4`; `bootstrap.ts:964` "GAME OVER" finale. |
| DEV-47 vehicle classes | Backlog | **still valid** | Not started. |
| DEV-48 rebuild on sandbox road | Backlog | **overtaken** | The owner reversed the sandbox direction (ECB `/direction`), and PR #10 rebuilt on Three.js instead. |

**Coverage gaps**

- DEV-22 to DEV-27, DEV-47 and DEV-48 have no project; they belong under Moon Miner.
- Shipped work with no ticket:
  - PRs #11–#22: WS1 world scale, WS2 no off-road plus rail cannibalisation, WS3 rail growth, WS4 persistence modes, WS5 panel redesign, WS-C knobs.
  - PR #13: vista.
  - PRs #18, #19, #23: road and vista fixes.
  - PR #24: crater walls.
  - PR #25: sun and shadows.
  - PR #27: capacity-cap fix.

## 5. ECB

- **`moon_miner_road_rework_decisions`** (decision_log, draft v1, `human_gate`, 09-15) was written before the flip.
  - `/followups` lists as open: "steering feel still old magnet/rail", "carried road not drawn as ribbon" and "5 self-play/route tests red (DEV-23)". Main has since moved the road to a raster decal, and DEV-23 is Done with the suite green.
  - `/direction` records "transplant the validated road into the real scene; sandbox removed". PR #10 took a different route (a full Three.js rebuild).
  - Verdict: **stale**. Needs a superseded note, proposed below.
- **Handoff snapshot** (`is_current`, 2026-09-11) is the ECOS build-line boot snapshot. Its §6 says Moon Miner is a side track: "Do not boot ECOS into it." A Moon Miner handoff snapshot would replace that boot snapshot, so this pass does **not** propose one.
- **Governing frame.** The same snapshot's §4 records an open question: the owner ruled on 2026-08-31 (event 928) that the Crucible intake model had died, while the working preferences still cite the Crucible contract and the Parallel Substrate Charter. This pass follows ECO-28A's quarantine-over-deletion principle for retired branches and records that the frame question stays open with the owner.

## Proposed actions (owner approval required, none executed)

1. **PR #9:** close as superseded by PR #10, with a comment linking this file.
2. **PR #7:** close as superseded in code. Move its open design question (single road price; whether to keep the launch fee) into a new Linear issue, or into DEV-14.
3. **Retired branches:** keep all six as quarantined reference (ECO-28A), or delete `current-state-report-a81tov` and `start-over-interview-gyq1z4`, which carry nothing unique. Default: keep.
4. **Linear:**
   - DEV-9 → Done (resolved by the substrate change), DEV-27 → Done or Review, DEV-48 → Canceled (overtaken).
   - Move DEV-22 to DEV-27, DEV-47 and DEV-48 into the Moon Miner project.
   - Optionally add one retro ticket covering WS1–WS5 and PRs #13–#27.
5. **ECB:** `propose_artifact_patch` on `moon_miner_road_rework_decisions` `/followups`, marking the list superseded by the 3D rebuild (PR #10) and DEV-23 Done. Human-gated.
6. **Code follow-ups** (separate PRs):
   - F2: derive route notes from metrics, or drop them.
   - F3: restore or retire the URL flags.
   - F1: widen smoke coverage.
   - `npm audit fix` for vitest.
   - DEV-11.
7. **Docs** (separate PR): rewrite README "Run Locally" and "Proof", START_HERE, and PROGRESS "Completed" and "Next Slices" for the 3D build, and add the 09-17 to 09-22 decisions to DECISIONS.md.
