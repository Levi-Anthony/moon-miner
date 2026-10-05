# Level generation for Endless Night: research

2026-10-05, DEV-66. Owner's ask: "part of the reason for the 'out and back for no reason' feel was related to the landscape providing no obstacles or reasons to navigate anywhere besides straight towards an ore pool ... research level generation for roguelites or whatever other game genre models are relevant."

## Short answer

- **Cause:** the field is flat and uniform. Whatever the target, the best route is a straight line, so every trip takes the same shape and the map gives no choices.
- **What has to change:** a route choice needs three things:
  - ground that costs different amounts to cross
  - more than one sensible way round
  - enough on the map to judge them in advance

  Orienteering course setters design for exactly this, and Unexplored's cyclic generator builds it into its levels.
- **Recommendation:** add two kinds of ground to the rules core first:
  - **rock ridges** you can't drive or lay road through
  - **rough ground** where laying road is slow

  Generate them so that every ore pool has at least two routes of different cost, and show both on the minimap. Rough ground spends dark-reserve time, so the landscape feeds straight into the decision you described (a short risky line or a long safe one).

## The models, and what each gives us

### 1. Orienteering course setting (the closest match)

- A course is a set of legs, and the craft is in making each leg a route choice. Runners weigh distance against climb, "fight" (thick vegetation) and how hard the navigation is.
- **Rule 1:** "No leg should contain route choices giving any advantage or disadvantage which cannot be foreseen from the map."
- **Rule 2:** a few long legs with real choices beat many even ones.
- **Rule 3:** change direction between consecutive legs, so runners have to re-plan.
- **What we take:**
  - Place ore so the straight line to it crosses something costly, with a longer route round that costs less.
  - Make every obstacle visible on the minimap before you commit.
  - Spread new ore around the compass, so consecutive trips head different ways. (Ore beside the road, landed today, starts this.)

### 2. Cyclic dungeon generation (Unexplored, Joris Dormans)

- Most generators grow a tree: branches out from the start. Unexplored builds **cycles**: two paths from the entrance to the goal, and the relative lengths and contents of the two arcs make a design pattern. Patterns include:
  - **lock and key:** take arc A, find a locked door, come back by arc B and pick up the key
  - **long safe arc against short dangerous arc**
  - **a shortcut** that opens on the way back
- The game has 24 cycle types. Dormans credits the cycles with making generated levels feel hand-made.
- **What we take:** generate obstacles as cycles around each ore pool:
  - **Arc A:** short, through rough ground or a dip into the dark.
  - **Arc B:** long and clear, round the end of a ridge.

  It also points at road junctions (DEV-66 follow-up): a branch that joins back onto your road closes a loop, and loops are what make the road worth reusing. Today the road is a tree.

### 3. Critical path, then dressing (Spelunky, Derek Yu)

- Spelunky first walks a guaranteed path through a 4×4 grid of rooms, from the top row to the bottom. Then it fills each room from hand-made templates that keep that room's exits open. Variation never breaks solvability.
- **What we take:** generate in two passes:
  1. Lay a guaranteed route from home to each ore pool.
  2. Add obstacles that may lengthen or narrow routes but never close the last one.

  A headless check (the core already runs headless) can confirm every seam is reachable and has two routes.

### 4. Hand-made pieces, placed by the generator (Dead Cells, Hades)

- Dead Cells fixes the overall world by hand, builds a graph of rooms for each level, and drops a random hand-made template into each room. The usual summary: "handcrafted atoms procedurally arranged."
- Hades shows each door's reward on the door, so the choice of exit is an informed one.
- **What we take:**
  - Author around 8–12 terrain **set pieces** as data, for example:
    - a ridge with one gap
    - a crater field
    - a boulder slalom
    - a canyon with rough walls
    - a rock arch that funnels you onto one line
  - Let the generator place, rotate and space them.
  - Pieces read as designed even in a random layout, which addresses Kate Compton's "10,000 bowls of oatmeal" problem: a million slightly different random fields all look like the same field.
  - From Hades: show the reward. The seams already glow and show their size.

### 5. Terrain from noise, objects by Poisson disk (Red Blob Games; Bridson)

- **Noise:** coherent noise (Perlin or Simplex) makes natural-looking ground. Raising elevation to a power flattens valleys; adding octaves adds detail. Thresholds turn it into ground types (flat, rough, rock).
- **Poisson disk sampling:** places points no closer than a minimum distance, so objects avoid both clumps and gaps. Bridson's grid method does it in linear time. Seam placement already keeps a 150 px spacing by rejection, a slower version of the same idea.
- **What we take:**
  - Low-frequency noise for wide rough patches, plus set pieces for the obstacles that make decisions.
  - Poisson spacing for boulders and seams.
  - Noise on its own gives texture without choices, so it shouldn't carry the design alone.

### 6. Road-building games with terrain (Mini Motorways)

- Rivers, mountains and coastlines force routes round them and create bottlenecks. Bridges and tunnels are scarce items that let a road cross.
- **What we take:**
  - Impassable ridges with a few gaps, so a gap becomes a place roads meet (and later, a junction).
  - Later, an upgrade like a tunnel or bridge charge that lets one road cut through a ridge, as a Contract shop item.

### 7. Mining with a return under pressure (Motherload, Dome Keeper, Deep Rock Galactic)

- **Motherload:** the fuel tank is the dark reserve's ancestor. Deeper ore pays more, and running dry on the way back ends the run. That's the same push-your-luck trade the reserve now creates (design law L3).
- **Dome Keeper:** a wave timer, and you must get back to the dome before it hits. Mining feeds the defence, and the defence limits mining (law L6 lists it).
- **Deep Rock Galactic:** the extraction pod lands 40 to 200+ m from the team. The last leg home is a new route under a timer, not a retrace.
- **What we take:**
  - The reserve is in good company.
  - From Deep Rock: vary where the safe point is. Outposts already exist in Contract; an Endless outpost that drops somewhere new after a bank would make the trip home a fresh route.

### 8. Branching maps you can read ahead (Slay the Spire)

- The map is generated as paths up a grid. It always offers at least two starts, paths never cross, and you see the whole map before choosing.
- **What we take:** guarantee at least two routes to each pool, and keep the information complete. Both rules restate the orienteering rules.

## Proposal: the first landscape pass

Built 2026-10-05 in `src/game/terrain.ts` (see DECISIONS). Steps 1–4 are done. Step 5 (road junctions) is next.

1. **Two ground types in the core** (`src/game`, engine-free, as data in `RunRules`):
   - **Rock:** blocks you, or slows laying road through it. Which of the two varies (see "Owner's answers" below).
   - **Rough ground:** laying road is slower there. Riding road you've already laid is full speed, so building through rough ground pays off later.
   - **The rail is never slowed by terrain.** A core test should pin this when terrain lands.
2. **Generation, per map and after each bank:**
   - **Set pieces:** ridges with gaps and rough patches between home and the ore band, from a small set of pieces, placed with spacing rules.
   - **A cycle per ore pool:** a short arc through rough ground and a long arc round a ridge end. The short arc is faster with full reserve and riskier when the border is close.
   - **A headless check:** every seam is reachable, has two routes within about ±40% of each other's time, and no obstacle seals home.
3. **Readable:**
   - Rock and rough ground show on the minimap and in 3D.
   - Rough ground could show your laying speed as you cross it.
4. **Run data:** log rough-ground seconds, ridge bumps and route length against straight-line distance, to see whether routes really bend.
5. **Then road junctions:** let a branch join another road for real, so loops through a ridge gap become reusable shortcuts. That's the step after this one.

## Owner's answers (2026-10-05)

- **The terrain settings vary; none is a fixed constant.** The owner: "I don't think these should all be stable variables." Each map draws its own terrain settings from ranges, and the ranges can widen as play goes on. Within a map, rock can be a mix of blocking and slow, and set pieces a mix of big landmarks and small scatter.
- **Never slow the rail.** The owner: "Never slow the speed on the rail. That should only be like a special penalty or introduced in a later level maybe." Terrain only ever slows laying new road. Anything that slows the rail is a separate, named mechanic, saved for a later level or a special penalty, and never part of the base terrain.

### What varies, and how

A per-map terrain profile, drawn from the seed, holds:
- **Rock:** the share of rock pieces that block, against those that only slow laying, and how much the slow ones slow it.
- **Rough ground:** how much it slows laying (for example 40–80% of `laySpeed`), and how much of the field it covers.
- **Set pieces:** how many and how big, from a few landmarks to many small ones, as a mix rather than one or the other.
- **Escalation:** in Endless, each bank's new ore can arrive with new terrain in the band near the border, so the field gets harder through a run. In Contract, the ranges can widen night by night. Later levels can open wider ranges again.
- **Fairness stays fixed:**
  - every seam reachable
  - two routes per pool
  - everything visible on the minimap
  - rail speed untouched
## Sources

- Joris Dormans, cyclic generation in Unexplored: [Unexplored's Secret: 'Cyclic Dungeon Generation'](https://www.gamedeveloper.com/design/unexplored-s-secret-cyclic-dungeon-generation-) · [Boris the Brave, Dungeon Generation in Unexplored](https://www.boristhebrave.com/2021/04/10/dungeon-generation-in-unexplored/) · [Making Meaningful Dungeons with Cyclic Dungeon Generation](https://dicegoblin.blog/making-meaningful-dungeons-with-cyclic-dungeon-generation/)
- Spelunky: [How Spelunky Random Generation Works](https://shanemartin2797blog.wordpress.com/2015/11/20/how-spelunky-random-generation-works/) · [Rooms and Obstacles](https://takenapeveryday.wordpress.com/2014/01/04/rooms-and-obstacles/)
- Orienteering: [Route choice (Wikipedia)](https://en.wikipedia.org/wiki/Route_choice_(orienteering)) · [IOF Guidelines for Forest Course Planning, 2020](https://onsw.asn.au/images/stories/technical/IOF_Guidelines_for_Forest_Course_Planning_-_Jun_2020.pdf) · [Orienteering ACT, Successful Course Planning](https://act.orienteering.asn.au/resources/event-management/successful-course-planning/)
- Dead Cells: [Sébastien Bénard, The level design of Dead Cells: a hybrid approach](https://deepnight.net/tutorial/the-level-design-of-dead-cells-a-hybrid-approach/) · [Edgar's Dead Cells example](https://ondrejnepozitek.github.io/Edgar-Unity/docs/examples/dead-cells/) · [Procedural vs Handcrafted](https://sinfullstudios.com/procedural-generation-vs-handcrafted-levels/)
- Hades: [Chambers and Encounters (wiki)](https://hades.fandom.com/wiki/Chambers_and_Encounters)
- Kate Compton: [So you want to build a generator...](https://galaxykate0.tumblr.com/post/139774965871/so-you-want-to-build-a-generator)
- Red Blob Games: [Making maps with noise functions](https://www.redblobgames.com/maps/terrain-from-noise/)
- Poisson disk: [Poisson-Disc Sampling (Jason Davies)](https://www.jasondavies.com/poisson-disc/) · [Game Dev Mechanics: Poisson Disk Sampling](https://moonjump.com/game-dev-mechanics-poisson-disk-sampling-how-it-works/)
- Mini Motorways: [Terrain Features (wiki)](https://mini-motorways.fandom.com/wiki/Terrain_Features) · [Wikipedia](https://en.wikipedia.org/wiki/Mini_Motorways)
- Motherload: [Kongregate](https://www.kongregate.com/en/games/xgenstudios/motherload) · [GameFAQs review](https://gamefaqs.gamespot.com/flash/933421-motherload/reviews/155836)
- Dome Keeper: [Wikipedia](https://en.wikipedia.org/wiki/Dome_Keeper) · [How Dome Keeper focuses on systems that feed into one another](https://www.gamedeveloper.com/business/how-dome-keeper-focuses-on-systems-that-feed-into-one-another)
- Deep Rock Galactic: [Drop Pod (official wiki)](https://deeprockgalactic.wiki.gg/wiki/Drop_Pod)
- Slay the Spire: [Map Generation (wiki)](https://slaythespire.wiki.gg/wiki/Map_Generation)

Some primary pages (Game Developer, Boris the Brave, Deep Night) were blocked from this session's network. Their summaries here come from search-result excerpts and the secondary write-ups listed, not from reading those pages in full.
