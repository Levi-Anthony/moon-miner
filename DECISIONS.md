# Decisions

## 2026-06-26: Browser First

Use Phaser 3, TypeScript, and Vite so the game is easy to run, share, screenshot, test, and deploy.

## 2026-06-26: Deterministic Grid First

Use grid movement instead of physics. The important V1 question is whether rail scarcity creates good route-planning tension.

## 2026-06-26: Separate Rules From Rendering

Keep command validation and simulation in pure TypeScript modules. Phaser renders and collects input, but it should not own core game rules.

## 2026-06-26: Reclaiming Is Core, Not Polish

The helper bot and reclaim loop are part of the first playable version because they differentiate Moon Miner from pure rail-building games.

## 2026-06-26: Movement Drives Rail Creation

The player should primarily drive the rover. Rail is auto-printed as part of successful movement into untracked valid terrain, keeping the fantasy closer to an active vehicle with built-on-demand infrastructure.

## 2026-06-26: Feedback Is Presentation-Only

Rover interpolation, flashes, and generated tones live in the Phaser scene. Core rules remain deterministic TypeScript functions so tests and future AI sessions can reason about gameplay without browser/audio state.

## 2026-06-29: Reclaim Lesson Appears After First Route Pressure

Place the tutorial old rail near the first ore instead of beside base. This keeps reclaim visible in the same run, but prevents a player from claiming the refund before nanobot scarcity has any meaning. The rules stay unchanged: the helper bot can reclaim only rail connected to base by built rail.

## 2026-06-29: V0 Grid Prototype Is Prior Art, Not The North Star

Pause the planned Round 1 playtest of the grid prototype. The build is useful evidence and scaffolding, but it answers a puzzle-comprehension question rather than the user's deeper target: continuous live-action pressure, competent industrial machinery, physical reclaim logistics, and prepared-field stock-flow management.

## 2026-06-29: Replace Rail Constraint With Prepared Nano-Field

Interpret "rail" as temporary high-performance traction/harvest field, not train track. The rover should be all-terrain and surprisingly nimble within the limits of prepared field, with raw terrain and field starvation creating speed/capacity penalties instead of tile-blocking puzzle logic.

## 2026-06-29: Drone Reclaim Is Autonomous Physical Logistics

The player launches the drone, likely with `Space`, but does not micromanage it. The drone should be fast, deterministic, and visibly competent: it selects a reclaim target, flies to old field, vacuums nanobots, and returns payload to the moving rover. If it is late, the player should blame route shape or launch timing, not the technology.

## 2026-06-29: Arms Are The Visible Capacity Scheduler

The spider-like rover arms are not merely eye candy. They visualize limited industrial capacity allocated automatically among field fabrication, mining, stabilization, scanning, and emergency scraping. Prepared field frees arms for mining; raw terrain consumes arms for just-in-time fabrication.

## 2026-06-29: Emergency Crawl Beats Ordinary Hard Stops

When field and delivered nanobots run out, the rover should almost stop but remain alive through a visible fallback protocol: big arms fold aside, tiny local reclaim legs scrape residue, and one desperate build arm creates enough field for a painful crawl. This creates uncertain doom without passive waiting.

## 2026-06-29: Continuous Spike Is The Active Entrypoint

Keep the V0 grid scene and pure grid rules in the repo as prior art, but route the app entrypoint to the continuous-motion scene. The active proof target is now continuous steering, prepared nano-field, autonomous drone reclaim, arm-capacity mining, emergency crawl, and solar pressure.

## 2026-06-29: Fresh Field Must Mature Before It Counts As Prepared

Just-in-time fabricated field should not immediately become high-performance prepared field under the rover. A short maturation delay preserves the intended stock-flow pressure: raw terrain drains nanobots, earlier route choices create fast return lanes, and emergency crawl remains reachable without making the machine feel broken.

## 2026-06-29: Angled Top-Down Is A Heading-Relative Chase Camera

Keep the continuous simulation in ordinary world coordinates, but render the playfield through an angled, heading-relative chase projection with inverse-projected pointer input. The rover should sit low in frame, forward space should open above it, and the world should move/rotate around the vehicle rather than reading as a static god's-eye map.

Status: superseded as the default view on 2026-07-01. The chase view remains available in dev builds with `?view=chase` for comparison.

## 2026-06-29: Prepared Field Should Read As Continuous Surface

Render nano-field patches as connected ribbon lanes, not isolated stamped ellipses. The simulation can remain patch-based for reclaim and stock-flow accounting, but the player-facing read should be a continuous prepared road-like surface that the rover has fabricated.

## 2026-07-01: Debug Tools Are Opt-In Presentation

Hide tuning controls and loop trace by default. Keep `?debug=1`, `~`, `#moon-miner-continuous-debug-state`, and `window.__moonMinerContinuous` available so tests and future tuning still have the instrumentation they need.

## 2026-07-01: Smoke Tests Are Design Guardrails

Use the Playwright continuous smoke harness to protect not only mechanics but also first-feel presentation: keyboard steering/throttle/brake, `Space` launch, debug overlay visibility, HUD text bounds, mobile idle/deadzone, mobile drag drive, drone tap, touch target size, and disabled portrait tap-to-navigate.

## 2026-07-01: Mobile Is Portrait-First And One-Thumb-First

Treat mobile as its own play posture, not a scaled desktop viewport. The default mobile path should use a vertical layout, top HUD, bottom drive pad, large launch action, and no tap-to-navigate until that interaction proves useful as quality-of-life.

## 2026-07-01: Mobile Drive Intent Must Be Explicit

Release or center deadzone on the mobile drive pad means idle. With no drive intent, the rover should not move or print field. Prepared-seam mining can continue at reduced throughput, while raw-terrain idle should not mine. Solar pressure can continue ticking so idle remains a choice with cost.

## 2026-07-01: Prepared Field Is Medium Magnetic

Prepared ground should keep a passive rover on the lane and resist pull-away, but it must let active steering escape. Magnet correction should not assist active turns, because that made the proof loop too easy and weakened the intended overextension, crawl, and drone recovery beat.

## 2026-07-01: Parked Mining Works Only On Prepared Seam

Mining should not require constant forward motion once the machine is parked on prepared field inside a seam. Let the arms harvest at reduced throughput while idle so the rover feels like a real extractor, but keep raw-terrain idle from mining or printing field so the nanobot loop is not bypassed.

## 2026-07-01: Mobile Debug Tuning Uses A Workbench Gutter

When `?mobile=1&debug=1` is opened on a desktop-width browser, keep the portrait game display intact and park the Dynamics sliders beside it. The mobile play surface should stay readable while tuning remains available.

## 2026-07-01: First-Run Level Needs Three Beats

The starter arena should be authored as calibration runway, rich overextension lobe, and lower recovery seam. The route should not meet quota before the recovery seam matters; otherwise the level reads as a harvesting sprint instead of a coherent abundance, greed, crawl, drone, recovery loop.

## 2026-07-01: Flat Tactical Is The Default View

Use a stable, wide, map-like tactical camera as the default presentation. Keep diagonal energy through authored level composition and framing, not through heading-relative rotation, Y squash, projection shear, or screen-Y scaling. Preserve the old chase projection only as a dev comparison via `?view=chase`.

## 2026-09-07: Route Shape Controls What Is Available, Not Reclaim Latency

`CONCEPT_REFRAME.md` claims route shape and launch timing control reclaim
latency. Measurement says that lever does not exist. Across `dronePickupRadius`
185 down to 70 and `droneSpeed` 430 down to 90, the greedy route's drone
flights are consistently among the shortest and the safe route's are the
longest, because a greedier route lays more road and therefore always has a
target nearby. Greed makes reclaim easier, not harder.

What route shape does control is what is worth taking. With nearest-cluster
selection, where you launch from decides the payload, and the decaying fuel
charge decides whether the trip pays for itself. That is the real decision, and
it is the one the player can see.

Do not reintroduce latency-based reclaim pressure without changing the
selection rule or the road's persistence first. The two are coupled.

## 2026-09-07: The Round Trip Restores Reclaim Latency

Amends the entry above. That entry concluded, from measurement, that route
shape could not control reclaim latency: a greedier route laid more road on the
way past, so a target was always nearby and greedy flights were the shortest at
every pickup radius and drone speed.

That was true of a one-way level and only of a one-way level. Going out and
back inverts it, because depth now means distance from your own road rather
than more road alongside you. Measured on the round trip, the greedy route's
drone flights are the longest at 2.1s against the safe road's 0.7s.

The general lesson is worth more than either finding: a mechanic that looks
impossible can be a consequence of the level's shape rather than of the
mechanic. Check the geometry before concluding a lever does not exist.

## 2026-09-07: Necessary Is Not the Same as Decidable

Dropping starting stock from 12 to 6 made the drone load-bearing. Before, the
return leg was free — your own road costs nothing to re-drive — so 12 covered
the outbound almost exactly and the drone was decoration. At 6, a competent
15s turnaround wins with the drone and loses without it.

That fixed necessity and not much else. Sweeping launch schedules, earlier is
monotonically better on every winning route: spam from 4s wins, every schedule
that holds the drone back loses. The optimum is "press the moment the surcharge
decays to zero," which is a metronome rather than a choice.

The reason is structural. Waiting has exactly one upside — road accumulates, so
a later cluster is bigger — and that upside is swamped by the crawl penalty of
running dry. Meanwhile the 9s cooldown already enforces spacing, so waiting past
it buys nothing and waiting inside it only pays the surcharge. There is no term
in the model that rewards patience.

A cooldown paces a button. It cannot make one interesting. For "when" to carry a
decision, the launch itself has to be scarce — a hard budget per run rather than
a recharging one. Ruled out: having the drone eat the road home. Reclaiming and
reusing your own rail is the fantasy, not a cost to be charged against it.

## 2026-09-07: One Object, Two Uses

The complaint was that reclaim takes away the road you wanted to turn around
and drive back over. The complaint under it was sharper: the game keeps trading
one dominant pressure for another instead of asking the player to balance
anything. Both are the same bug seen from different distances.

Reclaim deletes what it lifts, and the drone took the nearest cluster. When the
level was one-way that was fine, because you never came back. The round trip
made the nearest cluster the worst possible pick -- it is the road you are
about to drive home on -- and the player never chose it, so the cost read as
the game misbehaving rather than as a price.

The fix is a corridor: the drone may not take road near the line between the
rover and extraction. That is worth more than the annoyance it removes, because
it makes the laid road two things at once. It is stored reach and it is a fast
way home, and only the part clear of the line home can be spent as the first.
Nothing is being throttled. The player decides how much spendable road exists
by the shape they choose to drive: straight out and back 22% of the run with
something to reclaim, a wide lobe 62%, a tight loop 75%, a dead-straight line
none at all.

The general form is worth keeping. A single scarce resource does not produce a
decision, it produces a constant -- the optimum against one pressure is always
"as much as possible, as early as possible", which is what the drone timing
sweep kept showing. A decision needs one object with two uses that exclude each
other, and a player who controls the ratio. Reach against the way home is the
first of those this game has had.

Timing is still not a decision. Earlier is still monotonically better. The
corridor answers where and how much, not when.

## 2026-09-07: A Game Made Only Of Limiters

A run came back with 33 ore against a quota of 12, delivered two seconds
before sunset, and it felt like nothing. That is the best possible outcome by
every measure this project has been tuned against, so the measures are wrong.

Two findings, and the second is the one that matters.

The small one: nothing in the game distinguished that run from a 12-ore
arrival with twenty seconds to spare. Winning set a phase and printed one
sentence. Surplus ore had no consequence of any kind. "Nothing mattered" was
not a mood, it was an accurate description of the code.

The large one: every mechanic here is a limiter. Solar clock, nanobot stock,
ore quota, launch surcharge, launch cooldown, minimum field age, minimum
distance from rover, route-home corridor, minimum cluster payload, pickup
radius. Ten constraints. Nothing in the game hands the player anything.

The drone is the sharpest case because six passes were spent on it, and every
one of them made it more restrictive. Count what pressing the button did: pay a
fee, wait out a cooldown, satisfy four eligibility rules, watch your road
vanish, and receive in exchange the resource you needed in order not to lose.
It only ever prevented a bad thing. A tool built entirely out of restrictions
reads as a tax no matter how carefully it is balanced, and balancing it more
finely cannot help -- which is exactly what six passes of evidence showed.

So the drone now relays rail instead of deleting it. It lifts old road, brings
it back, and lays it out in front of you, mature enough to drive on the moment
it lands. Same fiction as always, which was reclaiming and reusing rail; it
simply never did the reusing part. Every drone route in the ladder improved
without the ladder changing shape.

The general lesson: a balanced set of constraints is not a game. Constraints
make the space; something has to be worth having inside it. When tuning stops
producing felt improvement, check whether anything in the design gives.

## 2026-09-07: Shift Carry-Over, Behind A Flag

Road that survives the lunar night, opt-in with `?shift=1`. Not part of the
original concept, and worth being precise about how it sits with it.

CONCEPT_REFRAME defers a prebuild/planning phase "because it risks static
puzzle drift. Prepared field should emerge from movement already made." Carry-
over places nothing and plans nothing: what you start with is the residue of
how you drove yesterday. The canon's own phrase is "the live residue of smart
earlier movement," and it never scopes "earlier" to within a run. "Short-
session" governs a session's length, not whether anything survives it. So this
is adjacent to a deferral rather than against it -- which is still the author's
call, which is why it is a flag and not a default.

Value does the work, and it was already there. Road printed while fabricating
properly is worth 0.12 or more; road scraped out in emergency crawl is worth
0.025. Decay the lot overnight and drop what falls below a floor, and what
survives is the road you laid well. Overextension stops costing only clock
time: what you scraped out while dying is gone by morning. Reclaim becomes a
cross-run decision for the same reason -- what the drone lifts is not coming
back tomorrow either.

The decay constant is load-bearing and the window is narrow. Swept 0.20 to 0.55
across six chained shifts:

  0.20  nothing survives; this is the old game
  0.40  network settles at 14-17 patches, crawl beat survives, drone decisive
  0.55  inherited network is rich enough that a run with NO drone wins

0.55 restores exactly the defect this session spent a day removing, so the
danger is generosity, not stinginess. Locked by a test that chains six shifts
and asserts the network settles rather than compounds, the drone still decides
the run, and overextension still reaches crawl. Set the decay to 0.55 and it
fails.

Measurement note worth keeping: the first sweep returned identical numbers for
every shift because `runContinuousSelfPlay` accepted `carriedFields` and never
forwarded it to `createContinuousWorld`. A parameter threaded most of the way
is the same disconnect as a colour argument thrown away by the function that
takes it, and it looked exactly like a real null result.

## 2026-09-08: Project The Arc, And Take The Oldest Road

Four play reports said the drone takes road the player wanted. I answered the
first three with geometry -- a minimum distance from the rover, a minimum field
age, a corridor protecting the line home -- and each one fixed the case in
front of me and missed the next. The fourth report named the thing they all
missed: "road that would've been immediately useful in the next move or two."

None of those rules knows where the tractor is going. They measure from where
it is, how old the road is, and a fixed point on the map. So two more attempts
failed for the same reason: a straight forward ray misses a turn, and a forward
wedge misses a hard turn, whose arc leaves it almost at once. Raising the
exclusion radius is not even monotonic -- at 120 the wide-lobe case was worse
than at 90, because pushing the target further out landed it on road the rover
was curving toward instead of road behind it.

Two changes, and the second is the one that generalizes.

Selection is now the OLDEST eligible road rather than the nearest. Nearest was
chosen for learnability and is the worst possible rule here: the nearest
cluster is always the one you just laid, which is the one you are about to turn
around on, drive back over, or curve into. Oldest is exactly as learnable and
wants the opposite thing.

Eligibility now projects the rover's arc. Heading plus a smoothed turn rate is
a circular path; sampling it forward answers the real question -- will the
tractor drive over this in the next few seconds -- instead of a proxy for it.

The measurement that settled it is worth keeping, because it is the ground
truth and every earlier proxy scored well while the game still felt wrong: lift
the road, then keep driving the same route and count how many lifted patches
the rover physically runs over. Before: a tight loop 4 of 4, a wide lobe 2 of 2.
After: the lobe is clean at every launch time tested, and the loop is refused
outright.

Refusing the loop is correct, not a gap. Circling means the road you are done
with and the road you are about to reuse are the same road, so there is no
right pick and the honest answer is that there is nothing to salvage.

Two things moved as a consequence and both are recorded rather than tuned away.
Route shape still controls reclaim latency and the spread is wider than before
(safe 1.9s, greedy 4.4s, sloppy 5.4s), but the adjacent shallow/deep pair
inverted: a shallow route hugging its own track has less spendable road, so its
drone flies further. And the sloppy route now limps home under quota instead of
dying in the field, because more refusals mean more crawling; it still loses.

## 2026-09-08: Two Horizons, And A Near-Miss

Having added six eligibility gates to the drone, five of them approximating
"do not take road I am about to use", the obvious question was which are now
dead weight once the arc projection does that properly. Removing restrictions
is the direction the canon wants; machine competence is sacred.

Turning off the route-home corridor looked like a clean win. Ground truth went
from 0/0/1 to 0/0/0 across every shape, the ladder held, and it unblocked the
tight-loop case that had been refusing outright. Three independent signals
agreeing.

All three were artifacts of the measurement window. The ground-truth check
looks three seconds ahead, because that is what "the next move or two" meant.
Widen it and the picture inverts:

  horizon  3s   corridor off: 0/0/0   corridor on: 0/0/1
  horizon  8s   corridor off: 0/0/3   corridor on: 0/0/1
  horizon 15s   corridor off: 3/3/3   corridor on: 0/0/1

The two rules cover different time horizons and both are load-bearing. The arc
projection protects the road you are about to drive over; the corridor protects
the road you will want at the end of the run, which no three-second projection
can see. Removing it would have reintroduced the original complaint in delayed
form -- the same bug, fifteen seconds later.

The correction that matters more than the near-miss: the previous entry claimed
refusing a tight loop is correct because "the road you are done with and the
road you are about to reuse are the same road, so there is no right pick." That
was wrong. With the corridor off, the loop reclaims cleanly at every horizon
tested. There IS a right pick on a loop; the corridor is what blocks it,
because a tight loop near the depot puts all of its road within 40 units of the
line home. That is an over-restriction in a specific case, not a principled
refusal.

The candidate fix, not built: scale the corridor with remaining solar. The road
home is worth protecting in proportion to how soon you need it, which would
free early-run loops without exposing the late-run return.

Standing rule from this: a metric with a horizon can only falsify claims inside
that horizon. Before removing a rule because a measurement says it is inert,
check whether the measurement can see what the rule was built for.

## 2026-09-08: Mining Is A Pass Again, And The Next Day Is Visible

Two reports: no way to see the next day, and the single day still feels wrong
without being able to say why.

The second one first, because it is the canon violation that has been sitting
in ECO-91 since the drift audit. CONCEPT_REFRAME: "Mining should not be 'stop
on ore and press mine' ... average deposits should mostly clear during the same
traversal that lays road." The live-pass system was built -- alignment with the
vein times speed, up to about 1.94 -- and one constant bypassed it, with
STATIONARY_MINING_FLOW_MULTIPLIER at a flat 1. Measured on the same seam facing
along the same vein:

  before   parked 0.94/s    rolling 0.61/s     parking 54% better
  after    parked 0.24/s    rolling 0.61/s     rolling 2.5x better

A game about continuous motion whose scoring rewarded stopping is going to feel
wrong in a way that is hard to name, and the on-screen guidance was teaching the
stop. It now says the line and the speed are the yield. The route ladder does
not move at all, because self-play never parks -- which is the point: this costs
a driving player nothing and takes away a parked player's free ride.

The first report is a bug I shipped. Carry-over saved and restored correctly and
had no interface whatsoever: no shift number, no statement of what survived, and
the only way forward was a button labelled Reset, which reads as start over.
State without a surface, which is the failure this project keeps repeating and
which I committed again while fixing it. There is now a shift line in the HUD
("SHIFT 2 - 11 lengths inherited", or "bare ground"), a line under the run-end
panel naming what survived the night and which key starts the next day, and the
Reset button reads Next Day once the run is over.

Worth recording about the decay floor, because it looked like a bug and is not.
End-of-run field values are cleanly bimodal -- 0.025 for crawl scrapings and
0.385 for road laid while fabricating properly, nothing in between -- so a floor
of 0.10 against a 0.4 decay keeps exactly the well-laid road and drops exactly
the desperate road. A first browser run carried nothing at all, which was
correct: that run crawled almost the whole day and had nothing worth keeping.
