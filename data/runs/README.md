# Run data

`runs.jsonl` in this folder holds the owner's real runs from the live game, one JSON record per line. If you are an agent asked about run data, **read this file first** (after `git pull origin main`). Run `npm run runs` for a table and per-level summary, or `npm run runs -- --json` for the raw records.

## How records get here

1. Every finished level in the live build saves a run record in the browser (`src/three/runRecord.ts`, localStorage key `mm3d-runs-v1`, last 50 runs).
2. The end-of-level banner has **Send run data**. The ⚙ panel has **Send saved runs**, which re-sends everything saved in that browser. Either one opens a GitHub issue titled `[run-data] …`, pre-filled with the records: a compressed ```` ```moon-miner-runs-z ```` block (deflate-raw + base64url, from 2026-09-27; about 30 runs fit one issue) or, as a fallback, plain ```` ```json moon-miner-runs ```` JSON. The button says how many runs the issue will carry. The owner presses Submit.
   Every Send button (end-of-level banner, ⚙ panel, toys page) sends every unsent run in that browser, main game and toys together (`src/runs/sendAll.ts`, from 2026-09-30). Issue #62 carried 48 main-game runs and none of the toy runs, which is why the buttons became one.
3. `.github/workflows/ingest-run.yml` validates the records (`scripts/ingest-run.mjs`), appends new ones here (runs it already has are skipped by `id`), commits to `main`, and closes the issue with a comment. A malformed issue gets a comment saying what was wrong and stays open. Only issues from the owner or collaborators are ingested.

## Agent-played runs

`npm run play:through -- --dump-runs runs.json` saves the records from levels an agent plays in its container. They can go through the same issue path. Set `build` to something like `harness` so they're easy to tell apart from the owner's runs.

## If this file is missing or looks stale

- No runs have been sent yet, or the newest haven't been submitted. Unsent runs stay in the owner's browser until the next send.
- Check the "Ingest run data" workflow runs and any open `[run-data]` issues for errors.
- Say what you checked. Don't say "there is no run data" without looking here and at those two places.

## Toy runs

The throwaway toys (`toys/`) log their runs too, with `mode` starting `toy:` (e.g. `toy:home-run:contract`). Any Send button sends them along with the main game's runs. `npm run runs` hides them; `npm run runs -- --toys` shows only them. Extra toy fields: `nightsCleared`, `upgrades`, `credit`, `score`, `multPeak`, `trips`, `seconds`, `daily`, `distance`, `railShare`, `lostInDark`, `strandedNights` (contract). From 2026-10-05 (the dark reserve) toy and `endless:3d` runs also log `reserve` (seconds the rover lasts in the dark), `reserveLow` (the lowest it got), `darkSeconds` and `darkDips`; `caught` is back as a result (the reserve ran out), and `lostInDark` is only a stranded load since the leak is gone. A 3D run with a title toggle off logs it in `knobs`. With terrain (2026-10-05) they also log `roughSeconds` (laying through rough ground or rubble), `bumps` (times you ran into rock) and `terrain` (the map's ridges, clusters, rough patches, rock and rubble counts, and its rolled `blockShare`, `rubbleSlow` and `roughSlow`). From the route logging step (2026-10-05) they also carry `path` (the route: `s` is two characters per second, the step since the last sample in 20 px units from a 64-character alphabet, offset by 32; `f` is one hex flag per second: 1 rail, 2 dark, 4 rough, 8 carrying, or `n` for a new contract night at home), `tripLog` (one `[seconds, px driven, farthest px, seconds in the dark]` per bank) and `lastLeg` (the same for the unbanked end of the run). `terrain` gains `gates` and `craters`. From the junctions step (2026-10-05) runs also log `transfers`: junctions ridden through. `npm run runs -- --routes` decodes them and prints each trip's bend (px driven ÷ 2 × farthest: about 1 is a straight out and back). From 2026-09-30 the dark no longer ends a run, so `caught` is gone: contract results are `won` / `under-quota`, endless `nightfall` / `stranded`. Toy runs before then with `result: caught` at nightfall recorded `ore: 0` even when ore had been banked (a recording bug, now fixed).

## Record fields (version 1)

`id`, `at` (UTC end time), `build` (commit the live build came from), `seed` (world seed: `<game>:L<n>` in Levels mode until 2026-09-27, then `<game>:S<n>`, one map per shift), `mode`, `level`, `levelName`, `day` (Levels: day within the shift, from 2026-09-27), `result` (`cleared` / `under-quota` / `lost`, or `won` / `sandbox-lost` in Sandbox), `ore`, `quota`, `sunLeft`, `sunWindow`, `elapsed`, `startStock` (what the day began with; Levels start full from 2026-09-27), `parSeconds`, `parSeams`, `bonus`, `slide`, `secs` (seconds prepared / fabricating / crawl / mining), `droneLaunches`, `minStock`, `distance`, `device`, `knobs` (only settings changed from the defaults), `source` (the issue it came from).

History: run data was lost three times before this (DEV-61). There was an Artifact DB the static site never had, a clipboard button that stored nothing, and then the 3D rebuild dropped both without a trace. `smoke:continuous` in CI now fails if a finished run isn't captured.
