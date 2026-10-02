# Port requirements: engine and toolkit

Snapshot of 2026-10-01, approved by the owner (first approved 2026-09-30; 11, 12 and 17 changed 2026-10-01). The canonical, editable copy is the **Port requirements** tab of the Claude Doc [Moon Miner: Design Theory](https://claude.ai/code/artifact/72757fa6-a2e7-4550-a3f2-80b96b526f55). If the two disagree, the doc wins; refresh this file from it.

These requirements are for porting Home Run's Endless Night loop into the 3D game (Linear DEV-66). The engine and toolkit survey (DEV-65, done 2026-09-30: keep Three.js) judges free and open-source options against them; its write-up is the Claude Doc [Moon Miner: Engine and Toolkit Survey](https://claude.ai/code/artifact/736d748d-1b94-467c-a6b8-85be3b832c68).

## Must-haves (all 15 required)

1. **Smooth on the owner's iPhone 16.** 60 fps in Safari, never below 30.
2. **Static hosting.** Plain files on GitHub Pages; no server.
3. **Free, open-source license.** MIT, Apache, BSD or zlib; no royalties or required splash screen.
4. **Deterministic, headless simulation.** Same seed, same result; runs in Node for self-play and tests.
5. **Rules separate from rendering.** Game rules in plain TypeScript that any renderer draws, the 3D game and the 2D Home Run alike.
6. **Headless browser checks.** Playwright smoke test and screenshots before every push.
7. **Run data keeps working.** Same run records; one Send button for game and toys (PR #63).
8. **Instant touch controls.** Virtual stick, up = forward, response under 100 ms.
9. **Road you ride.** Continuous ribbon, road tree, zero steering on the rail, generous grab.
10. **Live tuning panel.** Every tunable adjustable in-game, with tooltips.
11. **Fast first load.** Under 5 MB gzipped before play (184 kB today). Raised from 1 MB on 2026-10-01; the old limit never decided anything.
12. **Editable as text, run from the command line.** Code, scenes and assets are text; builds and tests run from the command line; no step needs a person in an editor. Reworded 2026-10-01.
13. **Juice.** Particles, screen shake, low-latency sound.
14. **Assets stay open.** Procedural geometry and sound first, but hand-made or imported assets in standard formats (glTF models, textures, audio files) must also work, CC0 or owned.

And, numbered as before:

- **17 · One rules core.** The 3D game, 2D Home Run and the headless tests run the same game rules: what happens, and how the rover moves. Each view owns only its presentation (camera, easing, effects); each game tunes its own numbers through config. Promoted from should-have on 2026-10-01: the dual view (DEV-70) and the campaign (DEV-71) both need it.

## Should-haves

- **15 · Angled 3D camera, current look.** Neon-on-dark, bloom, heading-up camera.
- **16 · Both toys stay.** Home Run follows the design as a parallel 2D version; Terminator is parked, still playable. Both are candidate mini-games.
- **18 · Reuse what works.** About 12,000 lines and 241 tests (2026-10-02).
- **21 · A path to the App Store.** Not now, but the choice must not block it: wrap the web build as an iOS app, or use an engine with a native iOS export.

## Could-have

- **19 · Visual level editor.** Place seams and depots by hand.

## Non-goals

- **20 · Multiplayer.**
- **22 · Monetisation.** Ads, purchases and retention hooks count against an idea (`DESIGN_THEORY.md`).
- **23 · Physics-engine vehicle.** The rover is kinematic by design; the survey checks this.

## How candidates are scored

A candidate that fails any must-have is out. The survivors are compared on these twelve criteria, with the current stack scored as a candidate too:

1. fit with the rules/renderer split (5, 17);
2. mobile performance and first-load size, measured on a test scene (1, 11);
3. agent workability (12);
4. migration cost;
5. license and project health;
6. TypeScript support;
7. what it gives for free against today's hand-written parts: road splines, touch stick, particles, sound, tuning panel, asset import;
8. App Store route (21);
9. modes as config (17; DEV-71): clock type, boundary, economy, persistence, views and inset set by data on one core;
10. two views at once (1; DEV-70): a main view plus an inset at 60 fps on the iPhone 16, the inset allowed low resolution at 30 fps;
11. curved-world shader (DEV-70) for the marble inset;
12. camera transition (DEV-70): chase to top-down, continuous or a quick cut.

## Candidates surveyed (2026-09-30; results in the survey doc)

| Layer | Candidates | Today |
|---|---|---|
| Whole engine | keep current stack; Babylon.js; PlayCanvas; Godot 4 web export; Defold | Three.js plus our code |
| App Store route | Capacitor; an engine's own iOS export | none |
| Road and path following | three's curve classes; a spline library | hand-written (`src/three/road.ts`) |
| Touch stick | nipplejs | hand-written |
| Particles and effects | three.quarks; three's bloom | hand-written particles; bloom in use |
| Sound | ZzFX; jsfxr; Howler.js; plain WebAudio | hand-written blips |
| Tuning panel | lil-gui; Tweakpane | hand-written panel |
| Asset import and tools | glTF loaders; Blender | none, all procedural |
| Terrain and ore layout | simplex-noise | hand-written |
| Physics (rule in or out) | Rapier; cannon-es | none, kinematic rover |
