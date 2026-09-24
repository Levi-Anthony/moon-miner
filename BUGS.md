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

- **`npm run play:through` does not run** (DEV-55). The script waits for `#moon-miner-continuous-debug-state` and `window.__moonMinerContinuous`, hooks from the retired Phaser build. The 3D build exposes `window.__mm3d` instead.
- **Phone HUD overlap** (DEV-56). At 390×844 the level-intro card covers the LEVEL and BONUS readouts. Proof: `docs/audit/2026-09-24/phone-boot.png`.
- **Shadow type fallback** (DEV-57). `bootstrap.ts:140` requests `THREE.PCFSoftShadowMap`, which three 0.186 removed; it logs a warning and renders plain PCF shadows.
- **Last-light report notes ignore the crawl metric** (DEV-51). Notes say "crawl pressure" / "heavy crawl" while Crawl Seconds is 0.0 on every route.
- **Smoke coverage is narrow** (DEV-53). It checks boot, HUD and one drive; no HUD-overlap, phone, drone or end-of-level checks.

## Resolved Findings

Pre-3D resolved findings are archived in `docs/archive/BUGS_resolved_pre-3d.md`.

Dropped from the pre-3D Known Issues on 2026-09-24 because the 3D build no longer has the thing they describe: prototype vector rail lines (the road is a painted raster decal), the missing mute control for generated sounds (the 3D build plays no sound), and first-map reclaim tuning (the first map is now Level 1 of 6).
