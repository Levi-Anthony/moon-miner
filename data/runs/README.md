# Run data

`runs.jsonl` in this folder holds the owner's real runs from the live game, one JSON record per line. If you are an agent asked about run data, **read this file first** (after `git pull origin main`). Run `npm run runs` for a table and per-level summary, or `npm run runs -- --json` for the raw records.

## How records get here

1. Every finished level in the live build saves a run record in the browser (`src/three/runRecord.ts`, localStorage key `mm3d-runs-v1`, last 50 runs).
2. The end-of-level banner has **Send run data**. The ⚙ panel has **Send saved runs**, which re-sends everything saved in that browser. Either one opens a GitHub issue titled `[run-data] …`, pre-filled with the records as fenced JSON. The owner presses Submit.
3. `.github/workflows/ingest-run.yml` validates the records (`scripts/ingest-run.mjs`), appends new ones here (runs it already has are skipped by `id`), commits to `main`, and closes the issue with a comment. A malformed issue gets a comment saying what was wrong and stays open. Only issues from the owner or collaborators are ingested.

## If this file is missing or looks stale

- No runs have been sent yet, or the newest haven't been submitted. Unsent runs stay in the owner's browser until the next send.
- Check the "Ingest run data" workflow runs and any open `[run-data]` issues for errors.
- Say what you checked. Don't say "there is no run data" without looking here and at those two places.

## Record fields (version 1)

`id`, `at` (UTC end time), `build` (commit the live build came from), `seed` (world seed, `<game>:L<n>` in Levels mode), `mode`, `level`, `levelName`, `day`, `result` (`cleared` / `under-quota` / `lost`, or `won` / `sandbox-lost` in Sandbox), `ore`, `quota`, `sunLeft`, `sunWindow`, `elapsed`, `startStock`, `parSeconds`, `parSeams`, `bonus`, `slide`, `secs` (seconds prepared / fabricating / crawl / mining), `droneLaunches`, `minStock`, `distance`, `device`, `knobs` (only settings changed from the defaults), `source` (the issue it came from).

History: run data was lost three times before this (DEV-61). There was an Artifact DB the static site never had, a clipboard button that stored nothing, and then the 3D rebuild dropped both without a trace. `smoke:continuous` in CI now fails if a finished run isn't captured.
