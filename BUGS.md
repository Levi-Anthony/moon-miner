# Bugs

Use this format:

```text
Seed:
Steps:
Expected:
Actual:
Proof:
```

## Known Issues

- Rail graphics connect logically, but they are still prototype vector lines rather than polished track art.
- Generated action sounds do not yet have a mute/settings control.
- The first map now teaches reclaim, but it still needs repeated playtest tuning.

## Resolved Findings

```text
Status:
Resolved 2026-06-29 by moving the tutorial old rail to (10,10), disconnected from base until the first route reaches the lower-center ore.
Seed: apollo-17
Steps:
1. Start a run.
2. Click Reclaim.
3. Click the old base-side spur at (0,7) before moving or becoming resource constrained.
4. Wait for the helper bot refund.
5. Route to (10,11), mine, route to (17,10), mine, and return to base.
Expected:
If the first map is meant to teach reclaim through scarcity, reclaim should become salient when resources tighten without letting the player fully bypass that pressure.
Actual:
The old spur can be reclaimed immediately, raising nanobots from 20 to 22. That makes the standard lower-center -> east ore route winnable without the intended failed/blocked second-ore click.
Proof:
In-app browser sweep on 2026-06-28: immediate reclaim removed rail (0,7), nanobots became 22, and the route won with final state phase=won, ore=2/2, nanobots=1, message "Ore secured. Extraction window complete."
Resolution proof:
Rules regression now verifies the starting reclaim fails with "Helper bot cannot reach that rail.", the first route makes the tutorial spur reclaimable, reclaim refunds to 9 nanobots, and the full default route still wins. A 2026-06-29 headless Chrome smoke confirmed the same flow through the Phaser click path.
```
