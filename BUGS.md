# Bugs

Use this format:

```text
Seed:
Steps:
Expected:
Actual:
Proof:
```

The game uses a random seed per new game (`mm3d-seed-v1` in localStorage). Read it from DevTools (`localStorage.getItem('mm3d-seed-v1')`) and put it in the report so the map can be reproduced.

Linear (DEV team, project Moon Miner) is the live tracker. This file lists what is known broken on `main`, with the ticket for each.

## Known Issues

As of 2026-09-24 on `main` at `bef3b58` (audit: `docs/audit/2026-09-24/STATE_AUDIT.md`):

- **Last-light report notes ignore the crawl metric** (DEV-51). Notes say "crawl pressure" / "heavy crawl" while Crawl Seconds is 0.0 on every route.
- **Smoke coverage is narrow** (DEV-53). It checks boot, HUD, one drive and the phone HUD layout; no drone or end-of-level checks (`npm run play:through` covers full levels by hand).

## Resolved Findings

- **Run data never reached anywhere an agent could read** (DEV-61, fixed 2026-09-25). The 3D rebuild had dropped run capture entirely, and the earlier versions stored nothing durable. Runs now go to `data/runs/runs.jsonl` through a `[run-data]` issue and the ingest-run workflow; smoke fails if capture breaks. See `data/runs/README.md`.
- **Phone HUD overlap** (DEV-56, fixed 2026-09-25). The objective line was pinned 58px from the top, and the HUD wraps to two rows on a phone. The line now follows the HUD's real bottom edge; at phone width the HUD fits its five readouts in one row. `smoke:continuous` now fails if the line covers any readout at 390×844. Before/after: `docs/audit/2026-09-24/phone-boot.png`, `phone-hud-fixed.png`.
- **Shadows passed under the road** (DEV-59, fixed 2026-09-24). The road lives in the ground's emissive layer, which three.js shadows don't darken. A shader patch now darkens it by the sun's shadow term (panel knob: Light & sky → Shadow on road). Before/after: `docs/audit/2026-09-24/road-shadow-off.png`, `road-shadow-on.png`.
- **Shadow type fallback** (DEV-57, fixed 2026-09-24). The renderer now asks for `PCFShadowMap` directly; three 0.186 had removed `PCFSoftShadowMap` and warned on every load.
- **`npm run play:through` did not run** (DEV-55, fixed 2026-09-24). It waited for Phaser-era hooks; it now drives `window.__mm3d` and the level campaign.

Pre-3D resolved findings are archived in `docs/archive/BUGS_resolved_pre-3d.md`.

Dropped from the pre-3D Known Issues on 2026-09-24 because the 3D build no longer has the thing they describe: prototype vector rail lines (the road is a painted raster decal), the missing mute control for generated sounds (the 3D build plays no sound), and first-map reclaim tuning (the first map is now Level 1 of 6).
