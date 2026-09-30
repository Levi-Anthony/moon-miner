# Design Theory: a systems test for Moon Miner ideas

Status: working instrument, 2026-09-30. Use it to test any concept, mode, toy or tuning change **before** building it, and to diagnose a build **after** play. It sits under the canon (`CONCEPT_REFRAME.md`, `GAME_DESIGN.md`) and doesn't replace it. The canon says what the game is. This file says how to tell whether a design will produce the intended experience.

"Successful" here means player experience: enjoyment, the wish to play again, and a sense of competence and agency. Revenue design (retention hooks, compulsion loops, monetised friction) is out of scope and counts against an idea.

---

## 1. Anchors: what each source contributes

Each anchor is an established, widely used model. The column on the right is the part this theory keeps.

| Source | Keeps |
|---|---|
| Hunicke, LeBlanc, Zubek, *MDA* (2004) | Designers write **M**echanics; play produces **D**ynamics; players feel **A**esthetics. Tune mechanics, but judge the experience layer. |
| Ryan, Rigby, Przybylski, *The Motivational Pull of Video Games* (2006, SDT/PENS) | Felt **competence** and **autonomy** predict enjoyment and future play. **Intuitive controls** and presence feed both. |
| Salen & Zimmerman, *Rules of Play* (2004), "meaningful play" | An action matters when its outcome is **discernible** (perceived) and **integrated** (it changes something that matters later). |
| Sid Meier, "Interesting Decisions" (GDC 2012) | A game is a series of interesting decisions: trade-offs, short against long term, no dominant option, enough information to judge. |
| Koster, *A Theory of Fun* (2004) | Fun is learning. Players chunk patterns; a mastered pattern turns boring; one that can't be learned turns frustrating. |
| Chen, *Flow in Games* (2006), after Csikszentmihalyi | Keep challenge inside a band that tracks skill. Let players **choose** their difficulty through in-game choices instead of hidden adjustment. |
| Costikyan, *Uncertainty in Games* (2013) | Uncertainty sustains interest, and its **source** matters: performative (execution), analytic (reasoning), hidden information, randomness. |
| Juul, *The Art of Failure* (2013) | Failure hurts, yet players return to escape it. Failure has to read as **mine** and point to how to improve. |
| Adams & Dormans, *Game Mechanics: Advanced Game Design* (2012) | Model the internal economy as stocks, flows, converters and feedback loops. Pair every **engine** with **friction** or a stopping mechanism. |
| Cook, "Chemistry of Game Design" (2007), "Loops and Arcs" (2012) | A skill atom is action → simulation → feedback → updated mental model. Loops nest at several time scales. |
| Swink, *Game Feel* (2008) | Real-time control (under 100 ms response), simulated space, polish. Control that feels good in an empty room comes first. |
| Nijman, "The Art of Screenshake" (2013) | Feedback amplification (shake, particles, sound, hit-pause) turns a correct system into a felt one. |
| Thorson, "Celeste & Forgiveness" (2020) | Hidden forgiveness (coyote time, input buffering) removes execution noise without removing challenge. |
| Lazzaro, *4 Keys 2 Fun* (2004) | Hard fun peaks in **fiero**, triumph over adversity. Easy fun is curiosity; serious fun changes the player's world. |
| Push-your-luck (board-game design practice) | Bank or bust: gains held at risk until secured. Banking must feel smart, not cowardly. |

**Genre evidence.** These games are close enough to Moon Miner that their choices count as tested:

| Game | Why it's relevant |
|---|---|
| **Dredge** | Safe day and dangerous night. Staying out raises escalating *panic* hazards instead of an instant death, and docking resets it. |
| **Dome Keeper** | Mine, carry the ore back, and defend at a wave timer, with upgrades between waves. The same structure as Contract. |
| **Tiny Wings** | Momentum over terrain against sunset. Success pushes the sun back, as a bank does in Endless. |
| **Motherload** / **SteamWorld Dig** | Mining with a return trip to sell, under a fuel or light stock. |
| **Mini Metro** | A growing network under escalating demand. Each loss has one clear, legible cause. |
| **Death Stranding** | The satisfaction of building roads that make your own later trips fast. |
| **Crazy Taxi** | Each delivery buys time, so the clock pays for success. |
| **Hades** | Failure feeds persistent progress, so dying never wastes a run. |

---

## 2. The model

### 2.1 Primitives

Describe any Moon Miner design with these parts only. If an idea can't be written in them, it isn't specified yet.

- **Stock**: a quantity that persists between moments. Examples: carried ore, banked ore, nanobot stock, road length, credit, sun, multiplier.
- **Flow**: a rate that moves a stock, such as mining, leak, laying cost or drone reclaim.
- **Converter**: turns one stock into another. Banking turns carried ore into banked ore; laying turns stock into road.
- **Gate**: a condition that opens or closes a flow: at the depot, on the rail, charged, in the dark.
- **Clock**: a stock that drains by time alone (sun, night ring). Every design has exactly one **master clock** the player reads at a glance.
- **Artifact**: player-made structure that outlives the moment that made it, such as the road tree, outposts or emptied seams.
- **Loop**: a repeated cycle of action and outcome. Positive loops (**engines**) amplify; negative loops (**friction**, **stoppers**) damp.
- **Uncertainty source**: performative, analytic, hidden-information or random (Costikyan).

### 2.2 The loop ladder

Loops nest (Cook). Each rung has its own period, decision and feedback. A rung without a decision is dead weight; a rung without feedback can't be learned.

| Rung | Period | Name | Moon Miner content | Decision it must hold |
|---|---|---|---|---|
| **R0** | < 1 s | Control | steer, throttle, grab or leave the rail | none. R0 is about **feel**, not choice |
| **R1** | 1–10 s | Manoeuvre | the line through a seam, a scoop at charge, a hop-off | which line; commit or bail |
| **R2** | 10–60 s | Sortie | out, fill, back to bank | **how far and how full before turning home** (push your luck) |
| **R3** | 1–10 min | Run | a day, a night, a contract | where to invest (road shape, upgrades, which region) |
| **R4** | sessions | Meta | bests, daily seed, shift map | "go again", and what to try differently |

**Core claim.** The canon, the owner's play reports and the genre evidence all put Moon Miner's fun at **R2 carried by R0**. R2 is a push-your-luck sortie against a clock. R0 is the kinetic pleasure of riding your own road fast. The owner named three moments that felt good: "riding my road fast, scooping a seam, beating the sunset", and added "all three are kinda the same thing". They are one R2 sortie, felt through R0. R3 and R4 exist to vary and raise the stakes of R2, not to replace it.

### 2.3 The canonical stock-flow graph

```
             sun / night ring  (master clock, drains by time)
                    │ gates: seams in the dark vanish; carried ore leaks off-road
                    ▼
 nanobot stock ──lay──▶ ROAD (artifact) ──ride──▶ speed ──▶ reach & charge
      ▲                     │                                   │
      └──── drone reclaim ◀─┘                                   ▼
                                    seams ──mine / scoop──▶ CARRIED ORE (at risk)
                                                                │ bank (gate: at depot / outpost)
                                                                ▼
                                                  BANKED ORE ──▶ quota / score / credit ──▶ upgrades (R3)
```

Engines: road → speed → reach → ore → credit → better road. Friction: laying costs stock, the clock drains, and carried ore is at risk. Every design change edits this graph; name the edge you're changing.

---

## 3. The laws

Twelve testable laws. Each has a source, a rule, a **test** you can run on paper or on run data, and the symptom of a violation. An idea passes when it violates none, or names the law it trades against and why.

### L1. Meaningful action (Salen & Zimmerman; MDA)
Every player action produces an outcome that is **discernible within its rung's period** and **integrated** into a stock one rung up.
- **Test:** for each action, name (a) what the player sees change within the period, and (b) which higher stock it moves.
- **Violation:** "the sliders don't seem to do much" (not discernible); a drone launch the player doesn't notice (not integrated).

### L2. Every rung holds an interesting decision, except R0 (Meier)
The options trade off along at least two axes, none dominates, and the player has the information to judge.
- **Test:** list the options. Does one always win? Run self-play or read run data: if one option is taken more than **70%** of the time by a skilled player, it dominates.
- **Violation:** parking on a seam was optimal (`STATIONARY_MINING_FLOW_MULTIPLIER = 1`). Aimless driving (R2 had no turn-home decision because nothing was at risk).

### L3. Tension = stake × uncertainty × agency (push-your-luck; Costikyan)
A sortie is tense only if all three factors are non-zero:
- **stake:** something held at risk (carried ore);
- **uncertainty:** the player can't be sure of making it back;
- **agency:** the player's choices and skill move the odds.

Stake 0 gives boredom. Uncertainty 0 gives rote play. Agency 0 gives anxiety and resentment.
- **Test:** at the turn-home moment, what is at risk, what is uncertain, and what can the player do about it?
- **Violation:** the main game's winning runs end with **46%** of the sun unused (median, 32 runs), so uncertainty about getting home is near zero.

### L4. Fair failure (Juul; canon "machine competence is sacred")
A failure is:
- **attributable:** it traces to a player choice, never to weak technology or hidden rules;
- **foreseeable:** telegraphed ahead by at least reaction time plus decision time;
- **proportional:** the loss scales with the greed that caused it;
- **recoverable below the top rung:** a hard end is reserved for the natural end of R3 (the canon's "emergency crawl replaces hard stop").
- **Test:** for each way to lose, write the sentence "I lost because I ___". If the blank is "the game did X", it fails. Check the size of the loss against the size of the mistake.
- **Violation:** the instant-kill night border (issue #64). A contract with quota already banked ended on night 1 because the ring crossed the rover once. The loss was disproportionate, it turned the player's own road against them, and it was fixed in PR #65 with a leak (the Dredge pattern).

### L5. Artifacts serve their builder (Death Stranding; Mini Metro; owner's road)
Player-made structure:
- **persists** across the rung that uses it;
- is **monotone in value to its builder**: it never becomes the thing that kills you;
- has a **shape that matters**, because some pressure makes a better layout pay off.
- **Test:** can the artifact ever lower the builder's expected outcome? Does a better shape measurably win?
- **Violation:** the road not persisting day to day (fixed, PR #53); the ring making the road deadly (fixed, PR #65).

### L6. One legible clock, and it acts on decisions (Tiny Wings; Dome Keeper; Crazy Taxi)
The pressure comes from one master clock, readable at a glance, whose drain changes **what the player chooses** at R2 (how far out, when to turn). Pressure that only tests execution belongs to R1. Success may buy time (Tiny Wings' sun, Endless push-back, Crazy Taxi's fares), but the buy-back stays below the drain on average, or the clock stops mattering.
- **Test:** does the clock's state change the turn-home decision? Does bought-back time stay below the drain over a run?
- **Violation:** a clock that never binds (46% of the sun left on wins).

### L7. Every engine meets friction (Adams & Dormans)
Every positive loop pairs with a friction or stopper that scales with it. Without that, runs snowball and the result is decided early.
- **Test:** the **margin distribution**, final ore ÷ quota across runs. Healthy looks unimodal around 1.0–1.5, with a real share of close calls. Bimodal means blowouts and collapses: an engine without friction on one side, a death spiral on the other.
- **Violation (current main game):** quota ratio quartiles are **0.28 / 1.29 / 2.32**, with **1 run of 54** within ±10% of quota. Losses end at a median **7%** of quota, which is collapse rather than a near miss. Wins overshoot, up to 5× at L9/L10.

### L8. Stay in the learning band (Koster; Chen)
The game presents a new pattern before the old one is chunked. Difficulty is chosen by the player through in-game risk (Chen's choice-based adjustment), not imposed by hidden rubber-banding.
- **Test:** does play converge on one route or strategy that repeats (boredom)? Can a new player name why they failed (frustration check)? Does going further out carry higher risk and higher reward (self-selected difficulty)?
- **Violation:** a dominant, repeated route; failures the player can't explain.

### L9. Feel comes first (Swink; PENS "intuitive controls"; Nijman; Thorson)
R0 is satisfying with no goals at all: response under 100 ms, consistent physics, and amplified feedback on every state change (grab, bank, scoop, leak). Hidden forgiveness absorbs execution noise, as generous rail grab and deliberate leave already do, so R0 slips don't decide R2 outcomes.
- **Test:** hand the build to someone with no objective. Do they drive around for 30 s with a smile? Does every state change have sound, particles and shake?
- **Owner's rules already in force:** up is always forward; zero steering on the rail.

### L10. Spectacle encodes system (canon; S&Z discernibility)
Every stock that feeds a decision is visible where the eyes are, and every effect on screen reports a real state change. No decorative noise competes with decision information.
- **Test:** at the turn-home moment, can the player read carried ore, clock and distance home without looking away from the rover?
- **Violation:** a stock that only appears in a panel or a post-run report.

### L11. Mechanics express the fantasy (MDA aesthetics; canon)
The fantasy is a startlingly competent machine that the player drives into greed. Mechanics make the machine brilliant and the **player's choices** the source of trouble. Costs arrive as consequences of route and timing (leak, crawl, stranded), not as limits on the technology (cooldowns, fees, minimum ages).
- **Test:** would a watcher describe the machine as clumsy? Does any rule exist only to slow the player down, with no choice attached?
- **Violation:** the tuning passes that added a launch fee, cooldown, minimum age and minimum distance to the drone (canon audit, 2026-09-07).

### L12. The end of a run makes you go again (Juul; Hades; Lazzaro)
A run ends with:
- a clear cause;
- a specific counterfactual ("next time I turn home at 20");
- a restart in under 3 s;
- something that persists, such as knowledge, a best, the daily seed or the road.

Near misses sustain replay; blowouts don't.
- **Test:** runs per session, and the share of runs ending within ±10% of the goal.
- **Target:** the owner reaches for another run unprompted.

---

## 4. Diagnostic table: symptoms mapped to laws

The owner's verdicts so far, and the law each one names:

| Owner's verdict or run-data signal | Violated law(s) | Status |
|---|---|---|
| "Numbers improved, felt nothing" (six tuning passes) | MDA: mechanics tuned, experience not measured | process lesson |
| Parking on a seam is optimal | L2 dominant option; L1 | open in main game |
| Drone as a cooldown button; **87%** of runs launch no drone | L1 (not integrated), L2 (not a decision), L11 (fees and cooldowns) | open in main game |
| Depot return auto-ended the day | L4 (not recoverable), L2 | fixed (portal charge, PR #54) |
| Road didn't persist day to day | L5 | fixed (PR #53) |
| "Sliders don't seem to do much" | L1 discernibility at R4 | fixed (budgets from defaults) |
| "Aimless, unpressured driving" (Home Run v1) | L3 stake 0; L6 clock not acting on decisions | addressed by night ring and carry |
| "Unreliable ride home" | L9 R0 feel; L5 | fixed (road tree, v2) |
| 46% of the sun left on wins; quota ratio bimodal; 1/54 near misses | L6, L7, L12 | **open in main game** |
| Instant-kill night border made my road deadly | L4, L5 | fixed (PR #65) |

The pattern: every fixed complaint was an L4/L5/L9 problem (fairness, artifacts, feel). The open ones are L6/L7 (the clock never binds, the economy has no friction), plus the drone (L1/L2). **The main game's next design work belongs at L6 and L7, not more feel work.**

---

## 5. How to test an idea: the concept card

Fill this in before building. An idea with blanks isn't ready. Keep it in the PR body or `DECISIONS.md`.

```
IDEA:            one sentence
RUNG:            R0–R4 (the lowest rung it changes)
GRAPH EDIT:      which stock / flow / gate / clock / artifact it adds or changes
DECISION:        the choice it creates or sharpens, with ≥2 trade-off axes
UNCERTAINTY:     source (performative / analytic / hidden / random)
STAKE:           what is held at risk, and when it's secured
FAILURE:         "I lost because I ___" — attributable? foreseeable? proportional?
ARTIFACT:        effect on the player's road/outposts (must stay monotone to builder)
FEEDBACK:        what the player sees/hears within the rung's period
FANTASY:         does the machine still read as brilliant?
PREDICTED METRIC: which run-data number moves, which way, by how much
LAWS:            L1…L12 → pass / fail / unknown, with a reason for any fail
KILL CONDITION:  the result that would make us revert it
```

**Decision rule.** Build it if it has no fails, or only fails it names deliberately against a law it serves better. A single L4 or L5 fail blocks: the owner has vetoed both kinds of violation (a depot that closes, and an instant-kill border).

---

## 6. Metrics: the laws on run data

Everything here can be computed from `data/runs/runs.jsonl` and toy runs (`npm run runs`, `npm run runs -- --toys`). Targets are starting hypotheses, to calibrate against the owner's felt verdicts and not to optimise blindly (the six-passes lesson).

| Metric | Computation | Law | Starting target | Current (main game, 54 runs) |
|---|---|---|---|---|
| Margin distribution | ore ÷ quota, quartiles | L7 | Q1 ≥ 0.8, Q3 ≤ 1.6 | 0.28 / 1.29 / 2.32 |
| Near-miss share | share of runs within ±10% of quota | L12, L3 | 20–40% | 2% (1/54) |
| Clock bind | sun left ÷ window on wins, median | L6 | 5–20% | 46% |
| Stock squeeze | min stock ÷ start stock, median | L3, L7 | 10–30% | 32% |
| Mechanic use | share of runs using each verb (drone, scoop, rail) | L1, L2 | each verb > 50% | drone 13% |
| Dominance | the most common choice at a decision point, share | L2 | < 70% | not logged yet |
| Loss attribution | share of losses ending near the goal (≥ 0.7 of quota) | L4, L12 | > 50% | losses at a median of 7% of quota |
| Carry at risk | carried ore at turn-home ÷ quota (toys: log it) | L3 | rising across a session | not logged yet |
| Rail share | distance on road ÷ total | L5, L9 | rising with skill | Home Run 0.28 → 0.57 over 3 runs |
| Go-again | runs per session; seconds from the end to the next start | L12 | ≥ 3 per session; < 5 s | 3 in 2 min (toys) |

Two logging gaps worth closing: **carry at turn-home** (the core R2 decision, currently invisible) and **choice records** for dominance (upgrade picks and the turn-home point).

---

## 7. The current ideas, run through the laws

Short verdicts. "?" means the data doesn't settle it yet.

| Idea | L2 decision | L3 tension | L4 fair | L5 artifact | L6 clock | L7 friction | L12 go-again | Verdict |
|---|---|---|---|---|---|---|---|---|
| **Main game (levels)** | weak: parking, drone unused | low: 46% of the sun left | ok since PR #54 | ok since PR #53 | **fails** | **fails**: bimodal | weak: blowouts | Fix L6/L7 first: a clock that binds and friction on the engine |
| **Home Run: Contract** | turn-home and upgrade picks | stake is carry, pushed by quota | ok since PR #65 | persists and carries | ring binds by design | rising quota | 5-night arc, shop | Strongest candidate; needs data |
| **Home Run: Endless** | turn-home only | stake is carry × multiplier | ok since PR #65 | persists within the run | pushes back 25%, accelerating | acceleration is the stopper | score chase; short | Good arcade; thinner R3 |
| **Terminator** | dive depth into the dark | double-value ore in the dark | ? | none (L5 n/a) | the line is the clock | ? | ? | Untested; the owner hasn't played it |
| **Dark leak (PR #65)** | on-road vs off-road in the dark | proportional stake | passes L4 | makes the road the safe lane (L5+) | keeps the ring meaningful | leak is friction | — | Consistent with Dredge's panic model |

**Porting guidance.** For moving the winning loop into the 3D build, the laws predict that Contract's structure (R2 carry at risk, R3 quota ramp and upgrades, persistent road) repairs the main game's L6/L7 failures directly:
- Carried ore at risk gives R2 a stake.
- A rising quota and a binding clock tighten the margins.
- Upgrades bought from surplus convert blowout overshoot into later difficulty, where it stops being wasted.

Check the port with the §6 metrics: margin quartiles narrowing toward 0.8–1.6, near misses above 20%, and less than 20% of the sun left on wins.

---

## 8. Limits of this theory

- **The laws are necessary, not sufficient.** A design can pass all twelve and still feel flat. Only play settles the experience layer (MDA). Run the owner's felt verdict alongside the metrics, and let the verdict win a conflict.
- **The targets are guesses.** Recalibrate them whenever the owner's verdict and a metric disagree, and record the recalibration in `DECISIONS.md`.
- **Out of scope:** people fun (multiplayer), narrative, and monetisation.
- **Revision rule:** when the owner's verdict contradicts a law twice, revise the law, not the verdict.

## Sources

- Hunicke, LeBlanc, Zubek, [MDA: A Formal Approach to Game Design and Game Research](https://users.cs.northwestern.edu/~hunicke/MDA.pdf) (2004)
- Ryan, Rigby, Przybylski, [The Motivational Pull of Video Games: A Self-Determination Theory Approach](https://selfdeterminationtheory.org/SDT/documents/2006_RyanRigbyPrzybylski_MandE.pdf) (2006)
- Salen & Zimmerman, *Rules of Play* (2004): [meaningful play](https://en.wikipedia.org/wiki/Meaningful_play)
- Sid Meier, [Interesting Decisions, GDC 2012](https://gdcvault.com/play/1015756/Interesting)
- Koster, [A Theory of Fun for Game Design](https://www.theoryoffun.com/press.shtml) (2004)
- Chen, [Flow in Games (MFA thesis)](https://www.jenovachen.com/flowingames/Flow_in_games_final.pdf) (2006)
- Costikyan, [Uncertainty in Games](https://mitpress.mit.edu/9780262527538/uncertainty-in-games/) (MIT Press, 2013)
- Juul, [The Art of Failure](https://jesperjuul.net/artoffailure/about.html) (MIT Press, 2013)
- Adams & Dormans, [Game Mechanics: Advanced Game Design](https://ptgmedia.pearsoncmg.com/images/9780321820273/samplepages/0321820274.pdf) (2012)
- Cook, [The Chemistry of Game Design](https://lostgarden.com/2021/03/13/the-chemistry-of-game-design-2/) (2007); [Loops and Arcs](https://lostgarden.com/2012/04/30/loops-and-arcs/) (2012)
- Swink, *Game Feel* (2008): [chapter 1](http://mycours.es/gamedesign2014/files/2014/10/Game-Feel-Steve-Swink-chapter-1.pdf)
- Nijman, [The Art of Screenshake](https://youtu.be/AJdEqssNZ-U) (INDIGO 2013)
- Thorson, [Celeste & Forgiveness](https://www.maddymakesgames.com/articles/celeste_and_forgiveness/index.html) (2020)
- Lazzaro, [The 4 Keys 2 Fun](https://www.nicolelazzaro.com/the4-keys-to-fun/)
- Push-your-luck: [BoardGameGeek mechanic](https://boardgamegeek.com/boardgamemechanic/2661/push-your-luck); [Secrets of Great Games](https://boardgamegeek.com/blog/5824/blogpost/119628/pushing-your-luck-the-most-important-mechanism-in)
- Dredge: [Game Developer, "Turning players' worst fears against them"](https://www.gamedeveloper.com/production/leveraging-the-unseen-to-turn-players-worst-fears-against-them-in-dredge); [Panic](https://dredge.fandom.com/wiki/Panic)
- Dome Keeper: [Shacknews interview](https://www.shacknews.com/article/130994/shacknews-e6-2022-dome-keeper-interview-on-resource-mining-and-survival)
- Tiny Wings: [Wikipedia](https://en.wikipedia.org/wiki/Tiny_Wings)
- Mini Metro: [Game Developer postmortem](https://www.gamedeveloper.com/audio/postmortem-dinosaur-polo-club-s-i-mini-metro-i-)
- Death Stranding: [Vice, "A Collective Power Fantasy About Infrastructure"](https://www.vice.com/en/article/death-stranding-is-a-collective-power-fantasy-about-infrastructure-and-aid/)
- Hades: [Game Developer, narrative rewards in a cycle of death](https://www.gamedeveloper.com/design/how-supergiant-weaves-narrative-rewards-into-i-hades-i-cycle-of-perpetual-death)
