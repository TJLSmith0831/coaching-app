# Backyard Soccer Trainer — Product Workflow & Drill Library

Design document, revision 3. 2026-09-19.

A mobile app that gives parents with no coaching experience a complete, age-appropriate soccer session for their child, built from the time, space, and gear they have today, and organised as a Duolingo-style path of small skills that build on each other.

---

## 0. The idea

**Problem.** Parents want to help their child get better at soccer but most have never coached. They don't know which exercise to do, how to set it up, or how to make it harder next week. Existing drill sites are written for club coaches with twelve players and a full pitch.

**Promise.** Open the app, answer three questions about today, and get a session your child can start in the backyard in under a minute. Come back tomorrow and the app remembers where you left off.

**Two ideas combined.**

1. **Instant session from what you have.** Time, space, and gear change daily, so those are the only questions asked each day. Everything else lives in the child's profile. A session is never blocked by missing gear: shoes become markers, a fence becomes a wall, a bin becomes a goal.
2. **A path that builds skills over time.** Like Duolingo, training is a long path of small nodes. Each node is one specific movement, such as sole rolls sideways with the weak foot, and takes three to five minutes. Nodes group into units, units follow a youth-development order, and completed skills return as warm-ups so they don't fade. Progress measures how often the child trains, not how well.

**Why it works for this age.** Eight to thirteen is the window where technique is learned fastest. The path is technique-heavy on purpose: ball mastery and dribbling form the main line, while passing, shooting, and small games branch off when the gear or the people exist.

**What the parent sees.** Text only. One card per node with the same layout every time: what your child does, a plain-language picture of the setup, two setup steps, three do-this steps, one thing to say out loud, and a timer. A parent who has never coached can read it in ten seconds and start.

**What the child sees.** The path lighting up, XP equal to minutes trained, a weekly ring, badges, and a unit-complete animation. No daily streak pressure.

---

## 1. Decisions locked in

| Topic | Decision |
|---|---|
| Ages | 8 to 13. Profile shows age only, no club categories or U-labels. |
| Who uses the phone | The parent. Every screen is written for an adult reader with one "say this" line to read aloud. The child sees the phone only on Session Complete and Level Up. |
| Players | 1 to 4 including the parent. Hard cap at 4. No team drills. |
| Media | Text only. No video, no GIFs, no diagrams. Setup is described in words with "big steps" for distance and clock positions for angles. |
| Drill content | Hand-authored library. Ideas and structure adapted from soccerdrills.de and rewritten in our own words. No text or animation copied. |
| Entry point | The path is the only way to start training. No browse mode, no drill search. |
| Assessment | One experience question at signup. First sessions carry a Harder chip that fast-tracks. |
| Progression | Measures how often the child trains, not how well. A node is done when it has been performed for its full time. Levels never drop. |
| Feedback | Optional. Easier / Harder / Skip / No gear chips only. Absence of feedback means "just right". |
| Gamification | Child-facing. XP equals minutes trained. Weekly ring, not daily streak. Badges, avatar unlocks, unit-complete animations. |
| Gear | Anything on the ground is a marker. Missing gear triggers a substitute, then a sibling exercise, never a blocked session. |
| Platform defaults | Native iOS and Android. Library stored on device so sessions generate offline. Account required to save progress; guest mode with a save prompt after the first session. |

---

## 2. Skill structure

### 2.1 Six tracks

| Track | Covers | Gear floor |
|---|---|---|
| Ball Mastery | Touches, rolls, footwork patterns, juggling | 1 ball, tiny space |
| Dribbling & Turning | Straight dribbling, gates, slalom, turns, feints, change of pace | 1 ball, a few markers |
| First Touch & Passing | Wall passing, cushion control, pair passing | 1 ball plus a wall, fence, or a second person. Solo fallbacks exist. |
| Shooting | Placement, laces drive, turn-and-shoot, lay-off finishing | 1 ball plus any target: goal, two shoes, a bin, a wall section |
| Movement | Quick feet, ladder patterns, hops, reaction, balance, shuttles | Nothing. Ball optional. |
| Game Sense | 1v1, keep-ball, gate games, tag, mini match | 2 to 4 players |

Weak foot is not a track. It is a variant dimension inside every drill family. Every strong-foot node is followed directly by its weak-foot twin.

### 2.2 The path

One path. Units are drill families placed in developmental order. Nodes inside a unit are that family's variants, from easiest to hardest.

- **Main line**: Ball Mastery, Dribbling & Turning, and Movement units. Need only a ball and markers, and markers can be shoes. Always doable.
- **Side branches**: First Touch & Passing, Shooting, and Game Sense units. Each branch hangs off a main-line unit and unlocks when that unit is done. Branches are done whenever the gear or the people exist today. They never block the main line.
- **Review nodes**: a purple star every fourth main-line node. Combines two or three due skills.

Node states shown on the path: done (gold tick), done and review due (gold clock), current (pulsing), locked (faded lock), reachable but gear-blocked today (faded with a one-word reason), adapted today (small dot: a substitute or sibling will be used).

### 2.3 A node is one variant

A node is 3 to 5 minutes of one specific movement. Not "Sole Rolls" but "Sole Rolls · sideways, weak foot". This is what makes the path long, granular, and satisfying to tick off, and what lets time decide progress: more minutes today means more nodes done today.

Node naming: `Family · Variant`.

Node done rule: the variant ran for its full timer. 5-minute sessions mark a node done after two visits.

---

## 3. Variant dimensions

Every drill family declares which of these dimensions apply and in what order the variants unlock. The generator does not invent variants; authors write each node's text.

| Dimension | Values, easiest first |
|---|---|
| Foot | strong · weak · alternating · both at once |
| Surface | sole · inside · outside · laces · heel · toe |
| Movement | standing · walking · jogging · running |
| Direction | forward · backward · sideways · turning · around a marker |
| Touches | free · two-touch · one-touch |
| Space | wide · medium · tight |
| Pressure | none · timer · count target · parent calls a cue · passive defender · active defender |
| Combination | single move · move then move · move then pass · move then shot |

**Default unlock order inside a family**: strong foot → weak foot → alternating → add movement → tighten space or add timer → add cue or defender → combination. Authors may reorder for a specific family but must keep weak foot directly after strong foot.

**Difficulty tag**: each node carries 1 to 5. Nodes tagged 1 and 2 correspond to the site's Einfach, 3 and 4 to Mittel, 5 to Schwer. Used only for review scheduling and for the experience question's pre-marking.

**Age tag**: most nodes are 8+. A few are 11+ (chest control, volleys, big feints at running pace). Age is the only age-related thing shown or stored beyond birth year.

---

## 4. Drill library

Around 47 families, roughly 280 nodes. Each family lists: what inspired it on soccerdrills.de, players, gear, the one-line idea, then the ordered node list. Texts below are the idea, not the final card copy. Section 7 shows how a node becomes a card.

Legend for gear: B = ball, M = markers (anything on the ground), T = target, W = wall or fence or partner, L = ladder or substitute, H = hurdles or substitute.

### 4.1 Ball Mastery

**F01 · Ball Circles** — from *Feeling*. 1 player. B.
Hands, not feet. Ball travels around the body with straight arms, body stays still, speed rises.
Nodes: around the waist → around the knees → figure-eight through the legs → switch direction on parent's call → walking forward → walking backward.

**F02 · Toe Taps** — foundation. 1 player. B.
Alternate feet tapping the top of the ball, light and quick, ball does not move.
Nodes: slow, count out loud → fast, 30 second timer → weak foot leads → walking forward → walking backward → 30 second count challenge.

**F03 · Inside Touches** — from *Ballkontrolle*. 1 player. B.
Ball goes side to side between the insides of both feet, soft, knees bent.
Nodes: standing, slow → standing, quick → moving forward → moving backward → weak foot twice per strong foot once → one touch per step at jogging pace.

**F04 · Outside Touches** — 1 player. B.
Push the ball out with the outside of one foot, bring it back with the inside of the same foot.
Nodes: strong foot → weak foot → alternating feet → walking forward → around a marker.

**F05 · Sole Rolls** — 1 player. B.
The sole drags the ball; the foot never kicks it.
Nodes: sideways, strong → sideways, weak → forward and pull back, strong → forward and pull back, weak → roll across the body and stop with the other foot → L-roll: pull back then push sideways with the inside, strong → L-roll, weak.

**F06 · Pull-Backs** — from *Flipper, Backfoot*. 1 player. B.
Sole pulls the ball back, then the same foot pushes it forward again.
Nodes: strong → weak → alternating → pull back, push with inside, strong → pull back, push with outside, strong → same two with weak → pull back into a 180 turn.

**F07 · V-Move** — 1 player. B.
Pull the ball back with the sole, push it diagonally forward with the inside of the same foot, making a V on the ground.
Nodes: strong, standing → weak, standing → alternating → walking forward → outside-foot push instead of inside → around a marker.

**F08 · Flipper Footwork** — from *Flipper*. 1 player. B.
A set of rhythmic footwork patterns done in place.
Nodes: back-forward taps, strong → back-forward, weak → side kicks, strong → side kicks, weak → cut kicks, strong → cut kicks, weak → jump kicks → crossover kicks, strong → crossover kicks, weak → kick and pull back, strong → kick and pull back, weak → chain any three patterns on parent's call.

**F09 · Juggling** — from *Jonglieren*. 1 player. B.
Start from the hands, one touch, catch. Build slowly.
Nodes: thigh drop and catch, strong → thigh, weak → foot drop and catch, strong → foot, weak → two thigh touches → two foot touches → foot then thigh then catch → 5 in a row any surface → 10 in a row (11+ optional: head touch).

**F10 · Stop & Trap** — 1 player. B.
Kill a moving ball dead.
Nodes: roll it away, chase, stop with sole, strong → sole, weak → stop with inside → toss it up, trap under the sole on the bounce → trap the bounce with the inside → 11+: chest cushion then sole trap.

**F11 · Ball Mastery Circuit** — combination. 1 player. B.
Chains earlier families; unlocks after F02 to F06.
Nodes: toe taps into inside touches, 20 seconds each → add sole rolls → add pull-backs → parent calls the next pattern → 3 minute circuit challenge.

### 4.2 Dribbling & Turning

**D01 · Straight Dribble** — from *Pylonenweg*. 1 player. B, 2 M.
Two markers 8 big steps apart. Dribble there and back with a named surface.
Nodes: inside, strong → inside, weak → outside, strong → outside, weak → laces, small touches → alternate feet every touch → head up, parent shows fingers to count → running pace, ball never more than one step away.

**D02 · Gates** — from *Krocket*. 1 player. B, 8 M.
Four gates in a zigzag. Through every gate with as few touches as possible.
Nodes: gates 6 steps apart, any foot → 4 steps apart, alternate feet each gate → inside foot only → outside foot only → weak foot only → one touch between gates → both directions → timed run, count gates in 60 seconds → 2 players race on mirrored courses.

**D03 · Slalom** — from *Schlangendribbling, Hütchensprint*. 1 player. B, 4 to 6 M.
Markers in a line 3 big steps apart. Weave through and sprint back.
Nodes: inside and outside of strong foot → weak foot only → alternate feet each marker → markers 2 steps apart → timed → slalom then 10-step sprint with ball → 2 players relay.

**D04 · Simple Turn** — from *Einfache Wende*. 1 player. B, 1 M.
Dribble to a marker, turn the ball around and come back the way you came.
Nodes: inside hook, strong → inside hook, weak → outside hook, strong → outside hook, weak → turn on parent's call anywhere → two turns back to back → accelerate three fast touches out of the turn.

**D05 · Stop-Turn** — from *Stop-Turn*. 1 player. B, 1 M.
Stop the ball dead with the sole, step over it, take it back the other way.
Nodes: strong → weak → jogging pace → on parent's call → stop-turn then sprint out → parent as passive shadow behind.

**D06 · Drag-Back Turn** — from *Plantar Turn, Backcut*. 1 player. B, 1 M.
Sole drags the ball back under the body and the player turns with it.
Nodes: strong → weak → drag then push with inside → drag then push with outside → jogging → on call.

**D07 · Cruyff Turn** — from *Cruyff-Wende*. 1 player. B.
Shape to kick, then flick the ball behind the standing leg with the inside and turn.
Nodes: walking, strong → walking, weak → jogging → on call → Cruyff into a pass to parent or wall → Cruyff into a shot at target.

**D08 · Step-Over** — from *Übersteiger A/B, Übersteiger mit Kick*. 1 player. B, 1 M.
Swing the foot over the ball, then take it away with the outside of the same foot.
Nodes: standing, strong → standing, weak → walking → jogging → double step-over → step-over then push and go (kick version) → against parent standing still → against parent shuffling sideways.

**D09 · Inside Cut** — from *Cut-Innenseite, Double-Cut*. 1 player. B, 1 M.
Quick chop across the body with the inside, then speed out of it.
Nodes: right to left, walking → left to right, walking → jogging → double cut → cut on parent's call → against passive parent.

**D10 · Sidestep Feint** — from *Easy Sidestep*. 1 player. B, 1 M.
Fake to one side with the body, take the ball the other way.
Nodes: strong side → weak side → jogging → feint then accelerate → against passive parent.

**D11 · Change of Pace** — from *Tempowechsel A/B*. 1 player. B, 3 M.
Slow-slow-fast. Markers set the trigger points.
Nodes: slow to fast at the middle marker → stop dead then go → fast to slow to fast → on parent's whistle or clap → with slalom.

**D12 · Big Moves** — from *Maradona-Kreisel, Matthews, L-Finte, 90 Angel, Kickroll, Beckenbauer, Puskas*. 1 player. B. Difficulty 4 to 5. Unlocks after D08 and D09.
Nodes: Maradona spin, strong → weak → Matthews inside-outside, strong → weak → L-feint, simple → L-feint, hard → 90 angle cut → kick-roll → Beckenbauer turn → Puskas drag → any two moves chained → against passive parent.

**D13 · Mouse Hole** — from *Mauseloch*, adapted for 1 to 4. 1 to 4 players. B, 8 M.
Dribble around a circle of markers, cut into the middle, play the ball through a small gate.
Nodes: solo, pass through the gate → dribble through the gate → timed laps → 2 players opposite directions → 4 players, miss means a 5 second wait.

### 4.3 First Touch & Passing

Substitutes: wall → fence, garage door, kerb, parent, sibling. No wall and nobody → the family's solo sibling (P02).

**P01 · Wall Pass** — 1 player. B, W.
Pass into the wall, control the return, repeat.
Nodes: inside, strong, two-touch → inside, weak, two-touch → alternating feet → one-touch strong → one-touch weak → outside foot pass → laces pass from 6 steps → receive with the far foot and pass with the other → moving side to side between two markers while passing.

**P02 · Toss & Cushion** — solo sibling for P01. 1 player. B.
Toss up, control the drop softly.
Nodes: thigh cushion, strong → weak → inside foot cushion, strong → weak → sole trap on the bounce → 11+: chest then foot → cushion then pass into wall.

**P03 · Sole Duo** — from *Sohlen-Duo*. 2 players. B, 4 M.
Partner passes, receiver drags the ball sideways with the sole around the next marker, passes back.
Nodes: strong sole → weak sole → shorter distances → one-touch pass back → alternate marker sides → timed count.

**P04 · Triangle Pass** — from *Triple-Control*. 3 players, or 2 plus a wall. B, 3 M.
Pass round the triangle and follow your pass to the next marker.
Nodes: clockwise, two-touch → anticlockwise → one-touch → weak foot only → control with the far foot → parent calls direction change.

**P05 · Position Swap** — from *Wechselspiel*. 4 players. 2 B.
Two balls, pass and swap positions with your receiver.
Nodes: two-touch → one-touch → weak foot only → tighter square → add a third ball, 11+.

**P06 · Gate Pass** — from *Mit Hütchentor*. 1 to 2 players. B, 2 M, W.
Pass through a gate to the wall or partner.
Nodes: strong, wide gate → weak → narrow gate → from further → on the move → count passes through in 60 seconds.

**P07 · Receive & Turn** — 1 to 2 players. B, W, 1 M.
Ball comes from wall or partner, first touch takes you away from where you were facing.
Nodes: inside turn, strong → weak → outside turn, strong → weak → turn then dribble to a marker → turn on parent's call left or right.

### 4.4 Shooting

Substitutes: goal → two shoes, a bin, a chalk box on a wall, a fence panel. Tiny indoor space → passing accuracy into a wall box instead of shooting.

**S01 · Placement Shot** — 1 player. B, T.
Inside of the foot, pick a spot, roll it in.
Nodes: still ball, strong → still ball, weak → one touch then shoot, strong → weak → after a 5 step dribble → parent calls left or right corner → smaller target.

**S02 · Laces Drive** — 1 player. B, T.
Toe down, hit through the middle, land on the shooting foot.
Nodes: still ball, strong → weak → rolling ball pushed ahead → after a slalom → count hits in 10 shots.

**S03 · Turn & Shoot** — 1 to 2 players. B, T, W or partner.
Receive with your back to the target, turn, finish.
Nodes: inside turn, strong → weak → outside turn → Cruyff turn → parent calls the turn.

**S04 · Lay-Off Finish** — from *Shadow Shots*. 2 players. B, T, 2 M.
One player carries, the other arrives late and finishes.
Nodes: carrier stops the ball, finisher shoots first time → carrier passes sideways → finisher cuts inside then shoots → cuts outside → swap roles every rep → parent chases as passive defender.

**S05 · Y-Finish** — from *Ypsilon*. 2 to 3 players. B, T, 3 M.
Pass out, receive on the move at an angle, shoot.
Nodes: right side → left side → weak foot finish → one-touch finish → timed count.

**S06 · Volleys** — 11+. 1 player. B, T.
From your own toss.
Nodes: thigh volley → foot volley, strong → weak → half-volley from a bounce.

### 4.5 Movement

**M01 · Quick Feet Square** — from *Doppelquadrat* idea. 1 player. 4 M, ball optional.
A square 2 big steps wide.
Nodes: forward and back → sideways shuffles → in and out on the diagonals → around the outside → same four with the ball.

**M02 · Line Steps** — L or chalk boxes or sticks. 1 player.
Nodes: one foot per box → two feet per box → sideways → in-in-out → hops → 11+: icky shuffle.

**M03 · Hops** — H or shoes or a ball. 1 player.
Nodes: two-footed over → single leg, strong → single leg, weak → sideways → hop then sprint 5 steps.

**M04 · Reaction Sprints** — 1 player. 3 to 4 M of different colours or numbered.
Parent calls a marker, child sprints, touches, returns.
Nodes: parent calls → parent points → with a ball → two calls in a row → parent fakes a call.

**M05 · Balance** — 1 player. ball optional.
Nodes: single leg 20 seconds, strong → weak → eyes closed → catch a tossed ball on one leg → tap the ball with the free foot while balancing.

**M06 · Shuttle** — 1 player. 3 M.
5 steps, 10 steps, 5 steps.
Nodes: no ball → with ball → touch the marker with the hand → with a turn type from D04 to D07 at each marker.

### 4.6 Game Sense (2 to 4 players)

**G01 · 1v1 to a Line** — 2 players. B, 4 M.
Nodes: parent stands still, beat them to the line → parent shuffles, no tackling → parent can tackle → three lives each.

**G02 · Keep-Ball** — 3 to 4 players. B, 4 M.
Nodes: 2v1 in a square, free touches → 3v1 → two-touch → 10 passes scores.

**G03 · Three Gates** — from *3-Torewettkampf*. 2 players. B, 6 M.
Nodes: dribble through any gate to score → cannot use the same gate twice in a row → weak foot scores double.

**G04 · Ball Tag** — 2 to 4 players. one B each, 4 M.
Nodes: tagger without ball, others dribble → tagger with ball → shrink the square.

**G05 · Mini Match** — 4 players. B, shoes for goals.
Nodes: 2v2 free → two-touch → goals only after three passes.

---

## 5. First-time experience

Target: under two minutes from install to the first exercise on screen.

**Login**
- Shows: Apple, Google, email. "Continue without account" link.
- Next: returning account loads children and lands on Home. New or guest goes to Add Child.
- Stores: parent id. Loads child profiles, node states, review dates, XP, badges, usual setup.

**Add Child**
- Asks: first name, birth year, dominant foot (Left / Right / Not sure yet), avatar, and one experience question: Brand new / Plays for fun / On a team about a year / Team 2+ years.
- Shows age as a plain number after birth year is picked, for example "Age 10".
- Stores: profile. Experience pre-marks nodes: Brand new marks nothing. Plays for fun marks F01 and F02. About a year marks F01 to F04 and D01. Team 2+ marks all difficulty-1 nodes on the main line. Pre-marked nodes go gold with a clock so they enter the review rotation.
- Next: Usual Setup.

**Usual Setup**
- Asks: space (Tiny indoor / Small yard or driveway / Medium outdoor / Big field), gear rows (see Resources screen), who usually trains (alone / with parent / sibling or friend / 3 to 4), weekly goal (2 / 3 / 4 sessions).
- Stores: defaults for the daily flow.
- Next: Ready.

**Ready**
- Shows: avatar, the first unit of the path with its first node pulsing, "First session takes 15 minutes."
- Choices: Train Now (time preset to 15, jumps to Space) or Remind Me Later.

**Foot check** (only if "Not sure yet") appears after the first session: "Which foot did [name] use more?"

---

## 6. Returning-user experience

Three taps from Home to the path when nothing changed.

**Home**
- Shows: avatar, name, age. Weekly ring. Train button. The path preview scrolled to the pulsing node. "Next up: Sole Rolls · sideways, weak foot."
- Choices: Train. Switch child. Scroll the path.

**How long today?**
- 5 / 10 / 15 / 20 / 30 / 45 / 60. Last value highlighted.
- Sets how many nodes run today.

**How much space?**
- Tiny indoor / Small yard or driveway / Medium outdoor / Big field. Usual highlighted.
- Filters gear-blocked nodes and sets the distance in every setup line.

**What do you have?** One screen, prefilled from usual setup.
- Balls: 1 / 2 / 3+
- Markers: 0 / 2 / 4 / 6+. Helper: "Cones, sticks, hurdles, shoes, bottles, jumpers. Anything you can put on the ground."
- Target: None / Goal / Wall or fence / Something to hit
- Extras: Ladder, Hurdles, Poles, Rebounder
- People: Just [name] / Parent joining / Sibling or friend / 3 to 4 players
- Choices: Looks Right, or tap a row.
- Three sessions with the same change updates the usual setup.

**Path**
- Shows the path coloured for today: pulsing, gold, gold-clock, locked, gear-blocked with reason, adapted dot.
- Tap the pulsing node, any gold node, or a review star. Side-branch nodes show the branch name and what unlocked them.
- Tapping a gear-blocked node shows the reason and offers "Use substitute" if one exists, otherwise "Show me what I can do today", which scrolls to the nearest doable node.

**Level Card**
- Shows: today's plan as a list. Warm-up (a due review), then the nodes that fit today's minutes starting from the tapped node, then the challenge. "You'll need: 1 ball, 4 markers." "Today's changes" only if a substitute or sibling applies.
- Choices: Start. Swap on any node for one alternative at the same difficulty. Back.

**Training** → **Session Complete** → back to Path with the next node pulsing.

---

## 7. Training experience

### 7.1 Session shape by minutes

A node runs 3 to 5 minutes. Time decides how many nodes.

| Minutes | Shape | Nodes done |
|---|---|---|
| 5 | Review 2 · New node 3 | half a node (done after two visits) |
| 10 | Review 2 · Node · Node | 2 |
| 15 | Review 3 · Node · Node · Challenge 3 | 2 |
| 20 | Review 3 · Node · Node · Node · Water · Challenge 4 | 3 |
| 30 | Review 4 · Node · Node · Node · Water · Review 3 · Node · Challenge 5 · Cool-down 2 | 4 |
| 45 | 30-minute shape plus two more nodes and a second water break | 6 |
| 60 | 45-minute shape plus 12 minutes of free play, or a Game Sense node with 2+ players | 6 to 7 |

The review slot always pulls the most overdue gold node. The challenge is the newest node of the day run against a timer with an optional count entry. With 2+ players and 20+ minutes the challenge becomes a Game Sense node if one is unlocked.

### 7.2 Exercise card, text only

Same layout every time so a parent learns it once. No images anywhere, so the words carry the setup.

```
Gates · weak foot only
Dribble through every gate using only your left foot.

Picture it
Four gates in a zigzag across the yard. Each gate is two shoes
one big step apart. Gates are four big steps from each other.

Set up
· Make 4 gates, 2 markers each, 1 big step apart.
· Zigzag them 4 big steps apart.

Do this
· Dribble through gate 1, 2, 3, 4 with your left foot only.
· Try one touch between gates.
· Turn and come back the same way.

Say this: "Left foot only. Look at the next gate, not the ball."

[ 4:00 timer ]           Easier   Harder   Skip   No gear
```

Rules for card copy:
- "Picture it" is one to three sentences describing the shape in everyday objects. It replaces the diagram.
- Distances in big steps. Angles as clock positions if needed. Never metres.
- At most two Set up bullets and three Do this bullets. Every bullet starts with a verb.
- One Say this cue, in quotes, written for the child's ear.
- Easier loads the family's previous node text for this rep. Harder loads the next. Skip records nothing. No gear runs the fallback ladder live and pauses the timer.

### 7.3 Between nodes

A five-second card shows the next node's Picture it and Set up so the parent moves markers while the child breathes. Tap to continue early.

### 7.4 Session Complete

Handed to the child. Shows XP equal to minutes, weekly ring filling, each node turning gold, a badge if earned, and the unit-complete animation if the last node of a unit was done. Optional emoji "How did it go?". Guest users see "Create an account to save this."

---

## 8. Progression

- **XP** = minutes trained. Weekly goal hit adds 25. XP unlocks avatar kits and boots only.
- **Weekly ring**, set by the parent to 2, 3, or 4 sessions. Missing a day costs nothing. Missing a week resets the ring, never the path.
- **Unit complete** when all its nodes are gold. Triggers the animation and unlocks the next unit on the main line, plus any branch that hangs off it.
- **Difficulty offset** per track, starting at zero. Two Harder taps on a track move it up one step and let the child skip the next node of the same variant type. Easier moves it down one step. Nothing is demoted.
- **First-session fast-track**: in the first three sessions, one Harder tap on a Ball Mastery node marks the rest of that unit's difficulty-1 nodes gold with a clock.
- **Badges**: First Session, Five Sessions, Twenty Sessions, Weekly Goal x4, Two-Footed (20 weak-foot nodes), Rainy Day (Tiny indoor session), Team Player (3+ players), Turn Master (D04 to D07 complete), Trickster (D08 to D10 complete), Wall Wizard (P01 complete), Sharpshooter (S01 and S02 complete).

### 8.1 Review and repetition

- Every gold node gets a review date: 3 days, then 7, 14, 30.
- The warm-up slot always takes the most overdue gold node, so the child never chooses to review.
- A review star sits every fourth main-line node and combines two or three due skills.
- Pre-marked nodes from the experience question start with a clock. Harder on one clears it and pushes its interval to 30 days. Easier resets it to 3 days and the path suggests it as the next tap.
- Replaying any gold node earns half XP, capped at two replays a week, and resets its clock.
- Easier on a review shortens the interval to 3 days and lowers the track offset one step. Completion is never removed.

---

## 9. Resource fallback

A missing resource never blocks a node. For each node in today's plan:

1. Have it → use it.
2. Substitute exists → same node, new Set up line, adapted dot on the path.
3. Sibling node for the same skill exists → swap, node still counts.
4. No sibling → drop it, extend the challenge.
5. Everything dropped → grey the node with a reason, point to the nearest doable node.

| Node needs | Substitute | Sibling if no substitute |
|---|---|---|
| Markers | Shoes, bottles, jumpers, sticks flat, chalk, patio lines | Variant using imaginary points, "5 big steps then turn" |
| Goal | Two shoes, a bin, a wall section, fence panel, chalk box | Passing accuracy into a wall box, or a Dribbling node |
| Wall | Fence, garage door, kerb, parent, sibling | P02 Toss & Cushion |
| Partner | Parent, sibling, friend, wall | Solo version of the same family |
| Poles | Stacked markers, upright bottles, a chair, a bag | Ground-marker slalom |
| Ladder | Chalk boxes, sticks in a row, paving gaps | Quick feet over a single line |
| Hurdles | Shoes, rolled towels, a ball | Step-overs of a ball on the ground |
| Second ball | none | One-ball variant with a reset step |
| No ball | none | Movement track only; ball nodes greyed "needs a ball" |
| Space too small | none | Tiny-space variant: sole work, no running |

The **No gear** chip during a node runs the same ladder live and records the resource as missing for the rest of today.

---

## 10. What happens when

**The child struggles.** Parent taps Easier. The previous node's text loads for this rep. Track offset drops one step. The node is not marked done unless the timer completes at the current level. Three sessions of Easier on one track shows a one-line note offering to hold the track with familiar nodes.

**It's easy.** Parent taps Harder. The next node's text loads. Two taps move the offset up and let the child skip the matching variant type in the next family. In the first three sessions, one Harder tap on Ball Mastery pre-marks the rest of that unit's difficulty-1 nodes.

**Several days skipped.** "Welcome back." No penalty. The first session back uses two review nodes instead of one, suggests the child's shortest usual duration, and picks the next new node at its base text. After 14 days the Level Card says "Easing back in today". Path never decays.

**Less gear than usual.** Untick on the Resources screen, or tap No gear mid-node. Fallback ladder runs. Three sessions of the same substitution updates the usual setup.

**Only 10 minutes.** Review 2 minutes, then two new nodes. Two nodes turn gold. Full session for the ring. 10 XP.

**Only one child but a friend shows up.** Add "Sibling or friend" on the Resources screen. Game Sense branch lights up if unlocked. The friend gets no profile and no XP unless the parent adds one.

---

## 11. Data model summary

- **Parent**: id, auth provider, consent date.
- **Child**: name, birth year, dominant foot, avatar, experience band, usual space, usual gear, usual players, weekly goal.
- **NodeState** per child per node: locked / available / done, done date, next review date, review interval index.
- **TrackOffset** per child per track: integer, Harder and Easier counts.
- **SessionLog**: date, minutes, space, gear, players, node ids in order, substitutes applied, chips tapped, challenge count, emoji.
- **DrillFamily**: id, track, players min and max, gear required, gear substitutes, sibling family, inspiration note, age tag.
- **Node**: id, family, order, name, variant dimension values, difficulty 1 to 5, duration, Picture it, Set up, Do this, Say this, easier node id, harder node id, space minimum.
- **Path**: ordered unit list for the main line, branch unit list with unlock unit ids.

Everything is on device. Node states and session logs sync to the account when online.

---

## 12. Suggested path order

Main line, first twenty units:

1. F01 Ball Circles
2. F02 Toe Taps
3. F03 Inside Touches
4. D01 Straight Dribble
5. M01 Quick Feet Square
6. F05 Sole Rolls
7. D04 Simple Turn
8. F04 Outside Touches
9. D02 Gates
10. F06 Pull-Backs
11. M04 Reaction Sprints
12. D05 Stop-Turn
13. F07 V-Move
14. D03 Slalom
15. D09 Inside Cut
16. F09 Juggling
17. D08 Step-Over
18. M06 Shuttle
19. D06 Drag-Back Turn
20. F08 Flipper Footwork

Then D10, D11, F10, M02, M03, M05, D07, F11, D12, D13.

Branches and where they hang:

| Branch unit | Unlocks after |
|---|---|
| P01 Wall Pass, P02 Toss & Cushion | Unit 3 F03 |
| S01 Placement Shot | Unit 4 D01 |
| G01 1v1 to a Line, G04 Ball Tag | Unit 7 D04 |
| P06 Gate Pass, P07 Receive & Turn | Unit 9 D02 |
| S02 Laces Drive, S03 Turn & Shoot | Unit 12 D05 |
| P03 Sole Duo, P04 Triangle Pass | Unit 14 D03 |
| G02 Keep-Ball, G03 Three Gates | Unit 15 D09 |
| S04 Lay-Off Finish, S05 Y-Finish | Unit 17 D08 |
| P05 Position Swap, G05 Mini Match | Unit 20 F08 |
| S06 Volleys | D12, age 11+ |

---

## 13. Flowchart

```
Open App
↓
Login (Apple / Google / Email / Guest) → loads path, reviews, XP
↓
[First time] Add Child (name, birth year → age, foot, experience) → Usual Setup → Ready
↓
Home → Train
↓
How long today?
↓
How much space?
↓
What do you have? (balls, markers of any kind, target, extras, people ≤ 4)
↓
Path, coloured for today → tap a node
↓
For each node in today's plan:
   have the gear? → use it
   substitute? → same node, new setup line
   sibling? → swap node, still counts
   neither? → drop, extend challenge
↓
Level Card → "You'll need" + "Today's changes" → Start
↓
Review node (a gold skill that's due)
↓
Node 1 · Node 2 · Node 3 … (count set by minutes)
↓
Water break (20 min and up)
↓
Challenge (newest node, timed, optional count; game with 2+ players)
↓
Cool-down (30 min and up)
↓
Session Complete → nodes turn gold, review dates set, XP, ring, badge, unit animation
↓
Path → next node pulses → "Next up: …"
```

---

## 14. Open items

- Card copy for roughly 280 nodes needs writing. Section 7.2 is the template. Budget about 60 words per node.
- Decide whether 11+ nodes are hidden from younger children or shown locked with "from age 11".
- Decide replay cap after seeing real usage. Two per week is the starting value.
- The soccerdrills.de material was used for ideas and structure only. Before launch, confirm no card text is a translation of theirs.