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

## 2026-09-08: Draw The Arms, And Stop Hiding The Next Day

Two reports, one of which was a mistake of mine repeated twice.

The next day was unreachable because I shipped carry-over behind `?shift=1`. A
published artifact does not necessarily pass a query string through to the page,
so the flag could not be set at all: the feature existed and nobody could turn
it on. It is on by default now, with `?shift=0` to opt out. Caution that makes a
feature unreachable is not caution.

It is also louder. Any tap or click ends a finished run, the run-end panel
carries a pulsing "Tap or press R for shift 2" call to action under the line
naming what survived the night, and the HUD button relabels itself Next Day.
Previously the only route forward was a small button marked Reset, which reads
as start-over rather than continue.

The arms: allocation was fully simulated and the renderer ran, but what it drew
was one straight line per arm capped with a dot, which at the shipped camera is
a cluster of dots. Now each arm is two segments with a knee. The elbow is the
whole trick -- breaking the silhouette is what makes a shape read as articulated
rather than radial -- and the knee bends away from the centre line so the flanks
mirror and the machine reads as a spider rather than a starburst. Working arms
flex faster than idle ones. Widths track the projection with a floor so the
limbs never fall under a pixel when the camera pulls back.

Each duty gets a tool you can tell apart at a glance, because telling them apart
at a glance is the entire job of a "visible scheduler": a square printing head
for building, a two-prong claw that opens and closes for mining, a flat planted
foot for emergency scraping.

Two things found by looking rather than reasoning. Roles filled the eight angle
slots in order, so all four building arms landed on the left flank and the right
side was bare; they are interleaved across both flanks now. And every arm drew
behind the chassis, so only the far ones were visible and they read as roof
antennae; arms whose tip lands nearer the camera are now drawn after the body.

Guessed on purpose and open to steering: reach lengths, the size of the tool
heads, and the fact that every duty currently reaches forward rather than some
arms working to the side or behind.

## 2026-09-08: Read The Real Runs

First report argued from recorded play rather than self-play, and the traces
answered all three complaints without guessing.

DRONE TOO SLOW. Launch-to-delivery across seven real runs: 1.5, 3.4, 1.8, 4.2,
4.7, 5.7, 4.4, 3.1, 2.3 seconds, and one flight launched at 28.4s that never
came home before the window closed at 36. Up to a sixth of a day spent waiting.
droneSpeed was set to 160 when reclaim targets sat close to the machine; the
route-home corridor, the 90-unit exclusion and the forward-arc projection have
each pushed targets further out since, and nobody re-measured the flight after
moving the target. 260 now.

ROAD INSCRUTABLE. The colour was computed from the rover. The corridor is
measured to extraction from wherever you are and the forward arc follows your
heading, so a stretch of road flipped between cyan and amber as you drove past
it -- changing for reasons about your motion rather than about the road. Road
that repaints itself while you look at it is not road. Your laid road is one
colour now, and the spendable/protected distinction is shown only as a
highlight on the cluster the drone would actually lift while the launch is
available: a targeting reticle, which may move, instead of a property of the
ground, which may not.

ROAD DECAYS TOO FAST. Inherited road across those runs went 0, 11, 11, 6, 16,
18, 9, and the best and worst days tracked it -- a resource the player did not
choose and could not predict, which is the other half of "inconsistent".
Overnight decay 0.4 -> 0.94. A well-laid length is still there in the morning;
crawl scrapings at 0.025 still fall under the floor, so the distinction between
road you built and road you scraped out while dying survives.

What durable road costs, recorded rather than hidden. A settled network means
later shifts stop running dry, so the crawl and recovery halves of the canon's
loop stop firing by themselves. That is a real loss, but the traces show the
loop completing in 1 run of 7 already, and crawl time swinging 0, 3.7, 5.2, 8,
11.1, 18.5 seconds with no pattern the player could read. An erratic beat is
being traded, not a working one.

The consequence to face next: the drone's whole job has been "you would have
run out". With road that persists, you will not, and it needs a reason to exist
that is not loss-prevention. That is ECO-90's question arriving from a second
direction.

## 2026-09-08: Convenient Ground Is Poor Ground

Levi's idea, and it is the best structural idea of the project: the more
navigable road a place has, the less ore is left there, because laying that
road is what you were doing while you emptied it.

It cost almost nothing to build, because every piece existed. Seams already
deplete within a run. Road already persists overnight. The drone already lifts
old rail and lays it down in front of you -- that went in earlier as a way to
stop the drone reading as a tax. The single missing piece was that seams were
rebuilt from the arena definition every morning, so the emptiness never carried
and the tension could not form. Carrying `remaining` across the night is the
whole change.

What it fixes, in order of importance:

It makes durable road survivable. Carrying road alone made every later shift
easier until nothing was at stake -- eight chained shifts scored 30.7, 30.6,
32.1, 30.5, 31.6 with zero crawl, a flat line. Carrying the emptiness with it
means a big network buys speed across worthless ground and nothing else. The
frontier stays the only place worth going and is always the expensive place to
reach.

It gives the drone a job that is not loss-prevention, which is the hole ECO-90
has been open on. Lifting rail out of the mined-out comfortable zone and laying
it at the frontier is reclaiming and reusing rail, which is what the machine
was described as being for from the start. Measured over eight chained shifts:
pressing Space wins 5 of 8 and returns 117.9 ore, never pressing wins 3 of 8
and returns 93.6. A margin rather than a lifeline, which is the better shape.

Recovery is required, and finding that out took one measurement. Without it the
tension is real but terminal: a repeated route strips its reachable seams by
the second morning and scores zero from the fourth on, because the ground you
can reach cheaply is dead and stays dead. At 0.35 regrowth a repeated route
settles at 13-15 ore against a quota of 12 -- close enough that a shift can
still go under -- and ground left alone is worth returning to, which is what
makes the road network matter over a campaign rather than within a day.

The shape it produces: day one is a bonanza, every day after is a tighter game,
and moving around beats repeating yourself. Alternating two routes across eight
shifts wins the greedy one every time and loses the narrow one every time,
which is the map saying that a route which can only reach one seam cannot
sustain itself.

## 2026-09-08: S Reverses. Forward Driving Goes Back To Normal.

"Tank treads" was a description of the rotate-in-place button, not of the
movement model, and reading it as the model is what broke navigation.

What it had become: one press of S captured a heading half a turn away and
auto-steered toward it, held until release. That put an auto-steer override --
resolveSteer -- into the normal forward driving path, where it intercepted the
player's steer input on every frame of ordinary driving. Forward driving has
not been plain steer-and-throttle since the turn-around went in, and that is
the "navigation has been a little broken" report. The override is gone and the
forward path reads input.steer directly again.

Of the two options for a bare S, straight reverse rather than nothing. A key
that waits silently for a second key reads as broken, which is the complaint
rather than the fix, and S meaning reverse matches every driving game. Backing
up and then swinging when you steer is also how a vehicle actually backs and
fills.

  W        drive
  W + A/D  steer while moving, untouched
  S        back straight up at 62% of fabricating speed
  S + A/D  stop and swing on the spot

Measured over two seconds each: W moves 148 and turns 0, W+D moves 60 and turns
118 degrees, S moves 92 and turns 0, S+D moves 0 and turns 149 degrees.

Two things found while checking rather than by reasoning. The field system runs
after the movement step and overwrote its message unconditionally, so S read as
"Chassis pivoting in place" while the machine was plainly reversing -- the
movement step now speaks for itself and the field system only fills silence.
And the mobile pull-back hardcoded steer to zero, so a thumb could reverse but
the swing was unreachable on a phone at all; it now carries sideways offset the
same way the keyboard carries A and D.

Also recorded, from Levi: the crawl beat being necessary does not make it the
game's core. It is a half-fail hinge -- a state you can recover from -- and
should not be optimised for as though hitting it were the objective. Earlier
entries in this file treat "did the crawl beat fire" as a success criterion.
It is not one.

## 2026-09-08: Three Rings, And Zero Translation On The Swing

The about-face is absolute now: S alone backs straight, and the instant an A or
D arrives the machine stops dead and only rotates. No translation at all during
the swing. On mobile the lateral deadzone for the pull-back is deliberately
wider than the stick's own -- straight back has to be reachable with an ordinary
thumb pull, because if a few degrees of drift starts the machine swinging then
the control demands a precision nothing else in the game asks for.

The level is rebuilt, and depletion is why. The old field put every seam
west-northwest, so every good day drove the same way and route shape was not
really a choice, and it held about 47 ore, which a depleting map strips in two
or three shifts. It also contained a seam labelled "recovery seam" that was the
second-worst return per unit distance on the map.

Three rings now, on different bearings, 95 ore in total:

  near   depot-flats, north-shelf, south-bench    ~270 units, 7 ore each
  mid    north-lobe, west-cut                     ~400-455, 13-14
  far    far-shelf, deep-south                    ~680-710, 23-24

Richness rises with distance faster than distance does, so return per unit of
travel climbs from 3.07 at the near ring to 4.37 at the far -- reach is paid
for, but only if you can afford to get there.

The far ring cannot be reached and returned from inside one 36 second window on
bare ground. That is the design and not a miss: chained, the same far-shelf
route loses on shift 2 and wins on shift 4 with 5.2s spare, because by then the
road reaches out toward it. The frontier opens because you built toward it,
which is the first time the road has been the thing that changes what is
possible rather than just what is fast.

Repeating one ring wins about three shifts and then starts losing as it strips
itself; alternating rings sustains. The map now says out loud that moving
around beats repeating yourself.

One finding to keep, surfaced by the fixture rather than hidden by it: chained
on the far ring alone, the drone stops paying. Eight shifts of the same route
return 24.7 ore with it and 26.5 without, because a settled network already
covers the trip and the flight is pure cost. It still pays across a mixed
campaign (5 wins of 8 and 118 ore against 3 and 94). So repeating one long
route is the case where launching is wrong -- a real decision, as long as the
game eventually says so somewhere.

## 2026-09-08: Make Richness And Spentness Visible

Looked at the rebuilt field pulled back, and the level's entire design was
invisible. Three rings whose whole point is that richness rises with distance
-- 0.85 at the near ring against 3.1 at the far, a 3.6x spread -- and a poor
seam and a rich one were drawn the same. The pip count compressed that spread
into 5 against 8, and the richness ratio was clamped to a 0.45 floor over a
2.1 divisor, so the signal only worked across the upper half of the range.

Pip count is now 1 + richness * 3.8 clamped to 2..15, which puts 4 nodes on a
near seam and 13 on a far one. The ratio divides by the real top of the range
with a 0.16 floor, so pip size and scatter track richness the whole way down.

Worked-out rock goes grey. Depletion carries between shifts now, so "have I
already stripped this" is a question asked on sight from across the map, and
ore-bearing rock has to stop looking ore-bearing once it is not. The patch and
its rim lerp toward stone as the seam empties.

The general note, since this is the fourth time this session: the machinery
existed and was tuned for a level that no longer exists. Depletion rendering,
richness pips and scar marks were all already there. Every constant in them was
calibrated against the old five-seam strip, and none of them was re-checked
when the field became three graded rings. Numbers survive the thing they were
measured against, and they do not announce it.

## 2026-09-08: The Wheel Takes Time, And The Groove Holds

Squirrelly forward steering was mine, from the turn-around cleanup. A and D are
digital, so raw input snapped from zero to full lock in one frame -- about 160
degrees per second on prepared road. There was no ramp anywhere. The wheel now
takes a little over a quarter second to reach lock: 2 degrees at 0.1s, 11 at
0.25s, 83 at one second. That is the whole of the squirrel.

Turn rates on top of it, cut but not as far as the first attempt. Prepared road
turns least and raw ground most, inverting the old 1.24 against 0.94, so laid
road reads as commitment rather than as a speed bonus painted on the floor. The
first cut went to 0.58 and was not heavy, it was unnavigable -- every self-play
route failed to reach home, because a slow machine plus a ramped wheel
overshoots every waypoint.

The magnetism was not missing, it was disabled by its own conditions. It
returned zero outright whenever the player steered the same way it was already
correcting, and the shipped preset set its active rate to 0.35 against a
passive 1.65. Between the two, touching the wheel released the groove
completely. It now applies whether or not you are steering, at 1.25 active
against 2.1 passive, with more reach and pull. Isolated, the stronger magnet is
worth 22.2 ore against 10.9 on the same route -- it helps the machine hold its
own road rather than fighting it.

Now the uncomfortable part, recorded because it constrains the answer. The road
should pay much more than it does. It pays 30%. It wanted to pay 78%, and the
measurement rig cannot evaluate that: the self-play routes are timed waypoint
scripts calibrated to the speeds they were authored against, and raising
prepared speed from 96 to 104 flips deepLobe from 22.8 ore to a loss -- not
because the game got worse but because the script sails past a waypoint it is
still steering at and circles for the rest of the run. Slowing raw ground to
widen the same ratio breaks them the other way, by making the distances
uncoverable.

An arrival-based waypoint advance was tried to fix that and made it worse: a
route that skips a waypoint the moment it arrives never dwells long enough to
mine, and every rung collapsed. The dwell IS the time gate. Reverted.

So 96 is what the instrument can currently see, not what the road should pay.
The honest next step for this is a self-play controller that steers toward a
waypoint and holds until the seam is worked, rather than until the clock says
so -- at which point the road can pay what it should.

## 2026-09-08: Crawl Had No Door

Chasing why a faster road cost ore, three hypotheses were wrong in a row --
the self-play fixtures, the mining flow speed cap, the magnet failing to hold a
faster machine -- each proposed and each measured and each ruled out. The
fourth attempt instrumented the run second by second instead of theorising, and
found something none of them were about.

Crawl recovery was hardcoded to stop at 1.2 nanobots. The threshold for leaving
crawl is 2.0. So the emergency legs could never scrape the machine past the
line that would let it drive again: once in crawl, the only exit was the drone,
for the rest of the run. Traced runs sat at exactly 1.2 for twenty-five
consecutive seconds, ore frozen, position crawling home at 16 units a second.

That is a direct contradiction of what crawl is for. Levi: "the crawl beat
being necessary doesn't make it the game's core. It's necessary as a half-fail
hinge state." A hinge you cannot swing back through is not a hinge.

The ceiling is now a tuning value above the threshold, so the exit exists. The
rate is deliberately left at 0.1/s, which means about twenty seconds of
scraping to use that exit -- most of a day, so it is not yet the hinge it
should be. The reason is the same limitation as the road speed: every recovery
rate that makes self-rescue practical, 0.18/s and up, flips the mid ring from a
comfortable win to a loss, and the self-play routes cannot say whether that is
the game getting worse or the fixture. Removing the impossibility costs nothing
measurable. Making the hinge usable is a rebalance needing an instrument that
does not exist yet.

Two process notes worth keeping. Guessing cost three rounds where instrumenting
would have cost one, and the tell was available immediately: the symptom was
crawl doubling, and crawl is a state with an entry and an exit, so the exit was
always the thing to look at. And the probe that found it was initially wrong
too -- it omitted the scheduled drone launches, so its first output described a
run nobody plays. Check what the probe leaves out before believing what it says.

## 2026-09-08: Day One Was Unwinnable

Read the recorded runs. Eleven now, and they separate on one line:

  shift 1   lost, lost, lost, lost    10.7, 12.0, 5.5, 8.1 ore against a 12 quota
  shift 2+  won six of seven          16.1, 29.0, 21.1, 20.4, 19.0, 25.7

Four fresh starts, four losses, none reaching the depot. Every later shift
comfortable. The discontinuity is exactly the thing that changed between them:
day one is the only day played on genuinely bare ground, and bare ground with
six nanobots cannot reach two near seams and get home.

The depot has an apron now -- a short arm of starting road running out toward
the near flats, along the line the safe road already takes. A depot that has
been operating has road around it, so this is the fiction as much as the fix,
and it means day one begins the way every later day begins: on something.

The ladder came out the healthiest it has been all session. Mid ring wins with
20.8 ore and 9.9s of light left, the far shelf wins with 36.6 and only 4.9s --
two winners separated by margin rather than by verdict. Near ring and the
overstayed far route lose. Every no-drone run loses.

Also read and NOT acted on: two consecutive runs a minute apart both recorded
as shift one with nothing carried, which looks like the save failing. It is not
reproducible -- carry-over works end to end in a browser on this build -- and a
republish landed between those two runs, which reloads the page. Recorded as
unexplained rather than fixed, because inventing a fix for a bug that cannot be
reproduced is how the wrong thing gets changed.

One more thing the data answered directly: the run with zero drone launches
lost with 16.8 seconds of crawl and 8.1 ore. The drone is still load-bearing on
a bare day.

## The drone takes road that is too close: measured, and it is not tunable

Fifth report of the same thing, after four rounds of geometry. This time I
measured it before changing anything, and the measurement says the previous
four rounds were all attacking the wrong quantity.

A theft is road the drone lifts that the tractor then drives over within ten
seconds, at under sixty units. Over eight seeds and five routes:

  age scoring, as shipped        14% of launches are thefts
  a legal patch chosen at random 32%

So the selection rule is only a little better than chance, and the reason is
arithmetic rather than taste: the tractor covers 960 units in ten seconds and
the arena is 1000 across. About a third of all road on the map at any instant
is road the tractor is about to reach. There is no far away to send the drone
to. That is why raising the exclusion radius, widening the corridor, extending
the forward arc and scoring by distance instead of age each answered one play
report and missed the next -- every one of them is a guess at the driver's next
move, made from a pool that is one-third "too close" no matter how it is
filtered.

Two things came out of the sweeps that are worth keeping written down:

  - Raising reclaimMinDistanceFromRover from 90 to 210, which a single-seed
    sweep recommended and I nearly shipped, cuts drone launches by 37% and
    breaks the route ladder on five of eight seeds. Single-seed sweeps of a
    marginal system are noise; one earlier result in this session showed
    "1 theft out of 34" and evaporated at three seeds.
  - Scoring by distance rather than age moves thefts by a few points and
    destabilises the ladder. It is not in the build.

### What actually fixed it: the road is yours until you leave it

Stop guessing where the driver is going and let the driver answer. A claimed
patch is marked, and reaching it takes it back -- the drone lets go and looks
for older rail. The patches it picks wrong are exactly the patches the tractor
drives over, which is exactly the case this covers, and the player wins it by
going where they were already going. Theft becomes a race you can win instead
of something done to you.

Eight seeds, claim-break radius swept 0 to 130: thefts fall 14% -> 9%, launches
are unchanged at ~303 (the drone is not being starved), and the route ladder
converges to the same shape on seven of eight seeds instead of four. 120 units.

### The relay was landing beside the path

Road count was never the problem: three seeds of self-play lift 305 patches and
put 302 back, so the drone was not a road tax. It read as one because the rail
came back down a straight spur off the tractor's nose, and every launch that
matters happens mid-turn. Laying it along the heading-plus-turn-rate arc
instead -- the same projection that decides which road is protected, which
until now existed only to say no -- moves relaid rail that the tractor actually
drives over from 81% to 94%.

## The self-play controller launches on stock, not on a clock

The routes became behaviour-driven earlier in the session but their drone
launches were still a fixed schedule, firing at t=6 on a full tank on every
route. That was the last piece of the old script, and it was why the ladder
flipped on parameters that should not have touched it. Each route now names a
launchBelowStock fraction and launches when the tank drops through it.

The ladder over twenty seeds, before and after:

              wins    ore    solar left   crawl s   launches
  safe        0/20 -> 0/20   5.9 ->  7.8   0.0 ->  3.5   2.0 -> 5.8
  shallow     0/20 -> 16/20  8.1 -> 13.4   0.0 ->  7.1   3.0 -> 6.8
  deep       20/20 -> 19/20 21.4 -> 27.5   9.9 ->  5.5   3.0 -> 9.7
  greedy     20/20 -> 16/20 36.7 -> 34.1   4.9 ->  1.1   3.0 -> 9.6
  sloppy      0/20 -> 0/20  16.2 -> 36.7   0.0 ->  0.0   1.0 -> 5.3

Before, nothing was marginal: every rung was 0/20 or 20/20. "Deterministic" was
in the test name and it was true in the worst way -- there was no tension to
measure. Now the middle three are 16, 19 and 16 out of 20, and the far route
comes home with 1.1 seconds of light on average, which is the tight return the
route exists to produce. Three tests were asserting per-seed verdicts on those
marginal rungs, which is to say asserting coin flips; they assert the gradient
now.

### The cost, which is a design fork and not mine to settle

Crawl moved to the wrong end. It used to run 0.0 / 0.0 / 1.7 / 3.1 / 22.2 up
the rungs -- the overstayed route limped home for twenty-two seconds. It now
runs 3.5 / 3.3 / 0.0 / 0.0 / 0.0. The cautious rungs crawl and the ambitious
ones never do, because a route that launches ten times a day is never
insolvent. Overextension now reads as "the sun set" rather than "I limped",
and that flavourless failure is the one the play reports named.

Three independent knobs were swept against it and each buys crawl back only by
flattening the reward gradient that is the level's whole offer:

  per-route launch thresholds   greedy drops from 34 ore to 14
  reclaimYieldMultiplier        at 0.9 the overstayed route wins 17/20
                                and the mid ring wins 2/20
  the launch surcharge          at cost 5 the gradient collapses to 12/17/15

The drone's payload is both the reach and the solvency. On this level you
cannot have reached far, hauled big, and crawled. Unwelding them means making
relaid rail the reach mechanism and shrinking the payload, which needs a bigger
pickup radius -- the exact change that makes the drone take road the player is
using. Shipped with the gradient intact and the crawl beat displaced, recorded
here rather than traded away quietly, because which half to keep is a call
about how the game should feel.
