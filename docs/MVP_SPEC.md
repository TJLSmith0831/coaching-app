# Coaching App — MVP Spec & User Flows (v2)

Ages 8–13 (kids) + parents who set everything up.
Stack: React Native + Expo (TypeScript), shadcn for RN (`react-native-reusables` + NativeWind), Supabase.
Status: v2.1 APPROVED 2026-09-19 (decisions in section I). **[ASSUMPTION]** = needs yes/no. **[DEFAULT]** = built unless told otherwise. **[P1]** = after MVP.

Changes from v1: "Dual-Link" replaced by Duolingo-style path gamification; scanner gains a Gear mode; time-budgeted practice plan generator added; mascot slot reserved; shadcn confirmed.
v2.1: decisions applied (one path per sport personalized by position + improvement goals, surprise chests, Baseball, 4 MB gear model, dachshund mascot), optimistic UI, single-language TypeScript stack.

---

## 0. MVP summary

- Parent creates an account, adds kids, picks sports/positions/level in under 5 minutes. Kid logs in with a 4-digit PIN on the shared device.
- Five sports: Soccer, Basketball, American Football (flag), Tennis, Baseball/Softball. Age bands 8–10 and 11–13.
- Scanner has two modes. **Spot**: point at the yard/driveway/park → surface, space, fixtures. **Gear**: point at the equipment pile → balls, racket, glove, cones, hoop. Both run on-device, both prefill chips the kid confirms. Photos stay on the phone unless the parent opts in.
- Kid or parent enters time available ("I have 10 minutes") and weekly availability. The **Plan Generator** builds **one Path per sport**, personalized by position and the kid's chosen **improvement goals** ("get better at shooting"): Units → Levels → Sessions, filled just-in-time so a level always fits today's time and gear.
- Duolingo-style gamification: a scrolling Path with locked/unlocked/crowned level nodes, XP, daily goal, streak + weekly freeze, daily quests, badges, treasure chests on the path, and a weekly **Family Quest** shared with the parent. No hearts, no public leagues.
- Mascot: a **dachshund** coach (name TBD, placeholder "Coach") appears in empty states, session summaries, streak nudges, and the path header. Final art lands later; MVP ships placeholder poses + copy strings written in-voice.
- Optimistic UI everywhere: every kid/parent action renders its result instantly from a local reducer, syncs in the background, and rolls back only on a hard server rejection.
- Single-language stack: TypeScript end to end. Game math lives in `packages/core` and runs in Supabase Edge Functions (Deno/TS). SQL is limited to migrations + RLS policies.
- Parent dashboard: per-child path progress, streak health, session log, weekly availability, rewards approval.
- Supabase: parent-only Auth, children as rows with bcrypt PIN, RLS everywhere, all XP/progress writes through SECURITY DEFINER RPCs.
- TDD: Vitest for the generator and game math first, Vitest integration tests for RLS + Edge Functions, RN Testing Library per screen state, Maestro for 5 critical flows. CI blocks on red.
- Beta success: median time to first kid session ≤ 8 min; 40% of kids reach a 3-day streak in week 1; 70% of scans accepted without correction.

---

## 1. Sports list

### 1.1 Web search — biggest five sports globally by fans (2026)

| Rank | Sport | Est. fans |
|---|---|---|
| 1 | Soccer | 3.5–4B |
| 2 | Cricket | 2.5B |
| 3 | Basketball | 2.4B |
| 4 | Field Hockey | 2B |
| 5 | American Football (Tennis close behind) | ~1B |

US youth ages 6–12: Soccer #1, Basketball #2, Football #3 (flag > tackle), then Baseball, Volleyball, Pickleball rising.

### 1.2 Final MVP list

| Sport | Reason |
|---|---|
| Soccer | #1 globally and US youth. Requested. |
| Basketball | #3 globally, #2 US youth. Requested. |
| American Football (flag) | Requested. Flag only: safety + solo-practice friendly. |
| Tennis | Requested. Top-6 globally, best solo wall practice. |
| Baseball/Softball | **Approved.** Replaces Cricket/Field Hockey for a US launch. Swap to Cricket for IN/UK/AUS is a seed-file change. |

### 1.3 Skill tracks, positions, drills (ages 8–13)

Each sport has 4–5 **skill tracks**; the Path's Units map 1:1 to tracks. Positions weight which tracks come first.

**Soccer** — Positions: Goalkeeper, Defender, Midfielder, Forward
Tracks: Ball Control → Passing → Dribbling → Shooting → Position Skills
Drills (samples): toe taps, wall passes both feet, cone dribble, juggling ladder 5→10→20, 1v0 finishing at target, GK catch-and-set. Gear: ball; wall/cones/goal optional.

**Basketball** — Positions: Guard, Wing, Big (finer split at 11–13)
Tracks: Handles → Passing → Shooting Form → Finishing → Defense
Drills: stationary dribble both hands, crossover series, form shooting, layup footwork, wall pass, defensive slides. Gear: ball; hoop optional.

**American Football (flag)** — Positions: Quarterback, Receiver, Running Back, Defender
Tracks: Ball Security → Throwing → Routes → Catching → Flag Defense
Drills: carry series, 3-step drop + throw at target, route tree (3 routes 8–10, 6 at 11–13), catching ladder, flag-pull mirror. Gear: ball; cones optional.

**Tennis** — Play styles instead of positions: Baseliner, Net Player, All-Court (11–13)
Tracks: Racket Feel → Forehand → Backhand → Serve → Footwork
Drills: bounce-ups, wall rally FH/BH, shadow swings, serve toss, split-step. Gear: racket + ball; wall strongly preferred.

**Baseball/Softball** — Positions: Pitcher, Catcher, Infield, Outfield
Tracks: Throwing → Fielding → Hitting → Base Running → Position Skills
Drills: throwing mechanics at target, wall grounders (tennis ball), pop-fly self-toss, tee/shadow swings, base-running footwork, catcher transfer. Gear: glove + soft ball; tee/bat optional.

Drill row fields the generator uses: `sport_id, skill_track, position_ids[], age_min, age_max, difficulty 1–5, duration_sec, min_space, needs_wall, needs_goal_or_hoop, equipment_required[], equipment_optional[], xp, video_url`. Every track has ≥1 drill that needs **only** the sport's core ball/racket and small space, so the generator never dead-ends.

---

## A. User roles and key screens

### A.1 Roles

| Role | Auth | Can |
|---|---|---|
| Parent | Supabase Auth (email, Apple, Google) | Everything: children, availability, gear, rewards, permissions, privacy. |
| Child | 4-digit PIN inside parent's session on shared device **[DEFAULT]** | Practice, scan, view path/progress, edit own cosmetics + sport focus + difficulty within parent cap. |

Children are rows, not auth users. JWT is always the parent's; `activeChildId` is client state passed to RPCs; RLS checks ownership.

### A.2 Navigation map

```
Root
├── Auth stack: Welcome · SignUp/SignIn · ForgotPassword
├── Parent Onboarding stack: ParentProfile · Consent · AddChild · ChildSports · Gear · Availability · Permissions · Done
├── Who's Playing? (profile picker; long-press header avatar from anywhere)
├── Parent tabs
│   ├── Dashboard   per-child: path unit/level, streak, XP week, Family Quest, approvals
│   ├── Children    list → ChildDetail (sports, positions, level, gear, PIN, difficulty cap, delete)
│   ├── Plan        weekly availability grid + reminder time; "Regenerate path" button
│   ├── Rewards     create / approve
│   └── Settings
└── Kid tabs (locked to child_id)
    ├── Path        sport tab strip → scrolling unit/level nodes, mascot header, daily goal ring, streak
    ├── Practice    time picker → Session Player → Summary
    ├── Scan        Spot | Gear segmented control
    ├── Quests      daily quests, weekly Family Quest, chests
    └── Me          XP, badges, avatar, sport focus, kid settings
```

### A.3 Parent screens

| Screen | Purpose | States |
|---|---|---|
| Dashboard | Child cards: current unit/level, streak, XP this week, Family Quest bar, pending claims | empty, loading, error, streak-at-risk |
| ChildDetail | Edit sports/positions/level, gear list (+ "Scan gear"), PIN reset, difficulty cap, delete child | confirm on PIN reset + delete |
| Plan | 7-day grid: minutes per day (0/5/10/15/20/30), reminder time; regenerate | regenerate confirm ("keeps completed levels") |
| Rewards | Create (title, cost XP or milestone), approve/deny claims | empty with 3 suggestions |
| Settings | Account, notifications, permissions, privacy (export/delete), sign out | |

### A.4 Kid screens

| Screen | Purpose | States |
|---|---|---|
| Path | Sport tabs at top (one path per enabled sport). Vertical nodes per unit: locked / current (pulsing) / done 1–3 stars / chest. Tap current → time picker. Mascot at top with today's line. | no path yet, all units done ("New unit unlocking…"), streak at risk |
| Time picker | "How long do you have?" 5 / 10 / 15 / 20 min chips + "Where are you?" spot chips + "Got your gear?" checklist prefilled | gear missing → generator swaps drills, shows "No ball? Try these" |
| Session Player | Drill card (image/video, 2-line text, read-aloud) → timer → Did it! / Skip / Too hard / Too easy → next | paused, media failed (text+image), offline |
| Summary | XP tick-up → daily goal ring → streak +1 → stars for level → chest if any → mascot line | level-up modal, badge modal, Family Quest progress |
| Scan | Spot / Gear modes | see B.3 |
| Quests | 3 daily quests, 1 weekly Family Quest, chest progress | all done state |
| Me | Level ring, XP, badges grid, avatar, sport focus, settings gear | |

Kid UX rules: ≤2 lines of text per screen, icon on every action, primary button ≥56pt, no typing except PIN, read-aloud on by default for 8–10.

---

## B. End-to-end user flows

### B.1 Parent flow

```
[Welcome] → [SignUp]
 → [ParentProfile: first name, timezone auto, ZIP optional]
 → [Consent: ToS + Privacy + "I am the parent/guardian"]                      (B.1.1)
 → [AddChild: nickname, birth month/year → age band, avatar]
 → [ChildSports: up to 3 sports → positions + level Beginner/Some/Team; drag to set focus]
 → [Gear: "What do you have at home?"  chips per selected sport, prefilled common set
      + [Scan gear with camera] shortcut → B.3 Gear mode]
 → [Availability: 7-day grid of minutes; default Mon/Wed/Sat 10 min; reminder 5:30pm]
 → [Set kid PIN]
 → [+ Add another child?] → loop
 → [Permissions explainer: Camera, Notifications, Location (optional). OS prompt only on "Enable"]
 → [Generating path… 1s] → [Path preview: Unit 1 name + 5 nodes; "Hand the phone to <kid>"]
 → Dashboard
```

Ongoing: open app → last profile. Sunday 6pm digest **[DEFAULT, local notification]**: "Ava finished 3 levels this week. Family Quest: 2/3. 1 reward to approve."

**B.1.1 Consent / minors [ASSUMPTIONS]**
- Parent is account holder. Kids give nickname only, no email/phone/full name.
- No chat, no public leaderboards, no kid-to-kid data.
- Scan photos processed on-device and discarded unless parent enables "Save scan photos" (off by default).
- Location optional and only for [P1] "nearby spots."
- Consent version + timestamp stored. Legal/COPPA review before launch; this spec is not compliance.

### B.2 Kid flow

```
[Who's Playing? → avatar] → [PIN]
 first time:
 → [Meet <Mascot>: 1 screen, placeholder art, "I'm your coach buddy. Let's find your first level!"]
 → [Avatar: 3 taps]
 → [Confirm sports order + position cards ("Try them all" for 8–10)]
 → [Per sport: "What do you want to get better at?" pick 1–2 skill tracks as big cards → improvement goals]
 → [Where do you usually practice? Backyard / Driveway / Park / Indoors]
 → [Gear check: parent's list shown as checkboxes; "Scan my gear" button]
 → [Daily goal: Casual 20 XP / Regular 40 XP / Serious 60 XP  (parent can override)]
 → [Path (focus sport): Unit 1, node 1 pulsing] → tap → [Time: 10 min preselected] → [Session Player]
 → [Summary: +XP, goal ring fills, streak 1, ⭐⭐, badge "First Whistle", mascot cheers]
 → [Path: node 2 unlocked]
recurring:
[Path] → current node → time picker → session → summary → next node / chest / unit complete
 streak at risk (after 6pm, goal not met): mascot nudge on Path + local notification to parent device
```

### B.3 Scanning flow (Spot and Gear)

```
[Scan tab: segmented Spot | Gear]
 permission:
 ├ undetermined → explainer ("photo stays on your phone") → OS prompt
 ├ denied → "Camera is off. Ask a parent to turn it on." [Open Settings] [Pick manually]
 └ granted →
 [Camera preview + overlay]
   Spot: "Point at where you'll practice. Step back so we see the ground."
   Gear: "Put your gear on the ground and fit it all in the frame."
 → [Shutter] → 1 frame 1080p JPEG q0.8 → [Analyzing… 0.5–2s, mascot animation]
 → interpret on-device (E.4)
   Spot → surface {grass, concrete, court, indoor, unknown}, space {small, medium, large}, fixtures {wall, hoop, goal, fence}, confidence
   Gear → set of {soccer_ball, basketball, football, tennis_ball, racket, glove, bat, tee, cones, hoop, goal, net}, per-item confidence
 → [Confirm sheet]  ALWAYS shown, chips prefilled from detection (high-confidence = checked, low = suggested, missing = unchecked)
   Spot: "Looks like Driveway · medium · wall ✓" → [Save spot ⭐] [Start a level here]
   Gear: "Found: ⚽ 🏀 🎾  Missing? tap to add" → [Save gear] → path regenerates locked levels if gear changed
 → confidence < 0.5 or error (busy, dark, >5s) → same confirm sheet, nothing prechecked, toast "Couldn't tell, tap what's here"
```

Scanner outputs: `spots` row (tags, optional photo) and `child_equipment` rows. Both feed the generator immediately.

**Scanner scope [DEFAULT]:** matcher, not landmark recognition or maps. Answers "what can I do right here with what I have." Nearby parks via Places API = [P1].

### B.4 Plan generation flow

```
inputs: child (age band, difficulty cap), child_sports (focus, positions, level),
        child_equipment, spots, availability, level_progress history, drill feedback (too hard/easy)
 step 1  PATH SKELETON (on onboarding / regenerate; stored)
   ONE PATH PER SPORT the child has enabled; kid switches sport via a tab strip on the Path screen
   unit order = skill tracks sorted by score = Σ position.track_weights[track] * 2 + (track in improvement_goals ? 5 : 0)
              ties → seed sort; every track appears at least once per path
   goal tracks get 7 levels, others 5; level k: target_difficulty = clamp(base(level) + k*0.5, 1, cap)
   every 3rd node = chest (surprise contents, rolled server-side at completion); unit end = "Unit Review" (mix of tracks so far)
   personalization hash = (positions, goals, level, cap) → stored on path; change → regenerate locked levels only
 step 2  SESSION FILL (just-in-time when kid taps a node; not stored until start)
   candidates = drills where sport, track, age fits, |difficulty - target| ≤ 1,
                equipment_required ⊆ child_equipment, min_space ≤ spot.space,
                (needs_wall → spot.wall), (needs_goal_or_hoop → spot.fixture)
   score = -|difficulty-target|*2 - recency_penalty + feedback_adjust
   greedy pack by duration until time_budget - 30s; min 2 drills; if <2, relax equipment_optional then space
   if still <2 → "shadow" variants (no-gear versions) flagged in seed; never return empty
 step 3  COMPLETE → RPC scores stars: 3 = all done + no "too hard"; 2 = ≥ 70% done; 1 = finished
         "too easy" ×2 in a level → next level target +0.5; "too hard" ×2 → -0.5 (bounded by cap)
 regenerate: only locked levels rebuilt; completed/current preserved
```

The generator is pure TypeScript in `packages/core`, deterministic given inputs + seed, fully unit-tested (H).

### B.5 Settings flow

Parent → Settings tab. Kid → Me → gear. Parent-only rows show a padlock in kid view.

---

## C. Settings model

| Setting | Parent | Kid | Where |
|---|---|---|---|
| Account, delete account | ✔ | – | Settings › Account |
| Child nickname, birth month/year, avatar | ✔ | avatar only | ChildDetail / Me |
| Sports, positions, level, focus | ✔ | reorder + position within enabled sports | ChildDetail / Me › Sports |
| Improvement goals (1–2 tracks per sport) | ✔ | ✔ | ChildDetail / Me › Sports |
| Gear list | ✔ + scan | ✔ + scan | ChildDetail / Scan › Gear |
| Weekly availability, reminder time | ✔ | view | Plan |
| Daily XP goal | ✔ override | ✔ pick | ChildDetail / Me |
| Difficulty cap 1–5 | ✔ | pick within cap | ChildDetail / Kid settings |
| Regenerate path | ✔ | – | Plan |
| Rewards | ✔ create/approve | view/claim | Rewards / Quests |
| Camera / Location / Notifications | ✔ | – | Settings › Permissions |
| Save scan photos (default off) | ✔ | – | Settings › Privacy |
| Sound / haptics / read-aloud | ✔ | ✔ | Kid settings |
| Export data, delete child data | ✔ | – | Settings › Privacy |

Storage: `profiles.settings` and `children.settings` JSONB, Zod-validated client-side **[DEFAULT]**; DB CHECK [P1].

---

## D. Data model (Supabase / Postgres)

Every table: `id uuid pk default gen_random_uuid()`, `created_at`, `updated_at` trigger, RLS on. `parent_id` → `auth.users`.

```
profiles            id → auth.users, first_name, timezone, zip null, consent_version, consented_at, settings jsonb
children            id, parent_id, nickname, birth_month, birth_year, avatar jsonb, pin_hash, pin_attempts int,
                    difficulty_cap int default 3, daily_goal_xp int default 40, settings jsonb, deleted_at null

-- seed (public read)
sports              id text pk, name, icon, sort
skill_tracks        id text pk, sport_id, name, sort
positions           id text pk, sport_id, name, age_min, age_max, sort, track_weights jsonb  -- {"shooting":2,"passing":1}
drills              id text pk, sport_id, skill_track_id, name, instructions, video_url, image_url,
                    duration_sec, difficulty int, age_min, age_max, min_space text,
                    needs_wall bool, needs_goal_or_hoop bool,
                    equipment_required text[], equipment_optional text[], position_ids text[], xp int,
                    is_shadow bool   -- no-gear fallback variant
equipment_types     id text pk ('soccer_ball','racket','glove','cones',...), name, icon, sport_ids text[]
badges              id text pk, name, description, icon, rule jsonb
quest_templates     id text pk, kind ('daily'|'family'), title, rule jsonb, xp_reward

-- per child
child_sports        (child_id, sport_id) pk, level text, position_ids text[], goal_track_ids text[], is_focus bool
child_equipment     (child_id, equipment_type_id) pk, source text ('manual'|'scan'), confidence null
spots               id, child_id, label, surface, space, fixtures text[], confidence, photo_path null, lat/lng null, is_favorite
availability        child_id pk, minutes_by_dow int[7], reminder_time time

paths               id, child_id, sport_id, generated_at, generator_version int, personalization_hash text, active bool
                    unique (child_id, sport_id) where active
path_units          id, path_id, skill_track_id, sort, title, is_goal bool
path_levels         id, unit_id, sort, kind ('level'|'chest'|'review'), target_difficulty numeric,
                    status ('locked'|'current'|'done'), stars int null, completed_at null,
                    chest_contents jsonb null   -- rolled server-side on open, never pre-revealed

sessions            id, child_id, level_id null, sport_id, spot_id null, time_budget_sec,
                    started_at, completed_at null, planned_drill_ids text[], xp_earned int, source ('path'|'free')
session_drills      (session_id, drill_id) pk, status ('done'|'skipped'), feedback ('too_easy'|'ok'|'too_hard') null, seconds

-- gamification
xp_ledger           id, child_id, delta, reason ('drill'|'session'|'stars'|'chest'|'quest'|'streak'|'badge'), ref_id null
streaks             child_id pk, current, longest, last_activity_date date, freezes_available int default 1
daily_progress      (child_id, date) pk, xp int, goal_met bool
quests              id, child_id, template_id, period_start date, kind, target, progress, xp_reward, completed_at null
                    -- kind 'family': parent_progress int also tracked
child_badges        (child_id, badge_id) pk, earned_at
rewards             id, parent_id, child_id null, title, cost_xp null, milestone jsonb null, active
reward_claims       id, reward_id, child_id, status ('pending'|'approved'|'denied'), claimed_at, resolved_at
```

RLS on every `child_id` table:
```sql
using (exists (select 1 from children c where c.id = child_id and c.parent_id = auth.uid()))
```
Seed tables: `select` for `authenticated`, no writes.

---

## E. API and integration plan

### E.1 Auth
- Supabase Auth, parents only: email/password, Sign in with Apple, Google. Session in `expo-secure-store`.
- RPC `verify_child_pin(child_id, pin)` → bcrypt compare, 5 attempts/min via `pin_attempts` + timestamp, returns ok. Client sets `activeChildId` (Zustand).
- Kid's own device via link code = [P1].

### E.2 Server logic — TypeScript Edge Functions (single-language stack)
All game math lives in `packages/core` and is executed by Supabase Edge Functions (Deno, TS) using the service role after verifying the parent JWT + child ownership. No plpgsql business logic; SQL is migrations + RLS + a few CHECK constraints.

| Function | Does |
|---|---|
| `generate-path` (child_id, sport_id) | runs `core.buildSkeleton`, upserts paths/units/levels, preserves done/current |
| `start-session` (child_id, level_id, time_budget_sec, spot_id, planned_drill_ids) | client already ran `core.fillSession` from cached seed; server re-validates each drill against equipment/age/cap, rejects mismatches |
| `complete-session` (session_id, drill_results) | `core.scoreStars`, `core.applyXp`, `core.advanceStreak`, `core.evalQuests`, `core.evalBadges`, `core.rollChest`; writes ledger/progress; idempotent on session_id; returns summary payload |
| `parent-checkin` (child_id, kind) | Family Quest parent side |
| `claim-reward`, `resolve-claim`, `record-scan`, `set-equipment`, `verify-child-pin` | thin writes; PIN compare with bcrypt in TS, 5/min |

Same `packages/core` code runs on device for optimistic previews and on the server for truth, so client and server never disagree on rules.

### E.3 Reads
- Supabase JS + TanStack Query; seed tables cached in MMKV for 7 days; path + progress query per child.
- Offline: `complete_session` queued in MMKV, replayed on reconnect; streak date = device-local date at completion.

### E.3.1 Optimistic UI [approved]
- Every mutation has a local reducer in `packages/core` that produces the expected next state (XP, stars, streak, quest progress, node unlock). The screen renders that immediately; the Edge Function call runs in the background.
- TanStack Query `onMutate` writes the optimistic state to the cache and MMKV; `onError` with a **hard rejection** (4xx validation, ownership) rolls back and shows a one-line mascot message. Network errors do **not** roll back: the mutation stays queued and retries with backoff.
- Server response reconciles: chest contents (rolled server-side) and any badge the client didn't predict are applied on arrival with their own animation, so surprises still feel like surprises.
- Idempotency keys (client-generated `session_id`) make retries safe.

### E.4 Camera / scanner
- `expo-camera` preview + capture; `useCameraPermissions()`.
- **Spot** interpretation **[DEFAULT]**: on-device color-cluster + edge-density heuristic (224px). `// ponytail: heuristic; swap to TFLite via react-native-fast-tflite when field accuracy <70%`.
- **Gear** interpretation **[approved]**: on-device MobileNet-class image classifier (TFLite, ~4 MB, bundled) mapped to `equipment_types` with confidence; heuristic fallback (orange sphere = basketball, yellow-green small sphere = tennis ball) if the model fails to load. The confirm sheet is always shown, so detection quality only affects taps saved, never correctness.
- No raw image leaves device. Photos saved to Storage only with parent opt-in.

### E.5 Storage
- `scan-photos` private bucket, path `{parent_id}/{child_id}/{uuid}.jpg`, RLS by prefix, opt-in only, ≤1 MB.
- `drill-media` public bucket, ~40 clips + stills at launch; fallback to still + text.

### E.6 Notifications
- `expo-notifications`, local: session reminder from `availability`, streak-at-risk 6pm if goal unmet, Sunday digest. Server push [P1].

---

## F. Gamification — Duolingo-style

### F.1 Core loop

Open → Path shows one pulsing node → pick time → 5–20 min session → summary shows XP, goal ring, streak, stars → next node unlocks. One session a day meets the default goal. Every screen answers "what's next" with a single tap.

### F.2 Mechanics

| Object | Rule |
|---|---|
| Path | One per child per sport. Units = skill tracks ordered by position + improvement goals; goal units have 7 nodes, others 5; chest every 3rd; Unit Review at end. Only the current node is tappable; done nodes replayable for half XP. |
| Stars | 1–3 per level (B.4 step 3). Unit shows total stars; 3-star all nodes = "Gold Unit" badge. |
| XP | drill.xp 5–15 each; session complete +10; 3 stars +15; chest 20–50; quests 10–50. Replay = half. |
| Daily goal | Casual 20 / Regular 40 / Serious 60 XP. Goal ring on Path header. Meeting goal = streak day. |
| Streak | +1 per local day goal met. 1 freeze/week auto-applies. Breaks after 2 misses. Longest stored. Milestones 3/7/14/30 → badge + chest. |
| Daily quests | 3/day from templates: "Earn 30 XP", "Finish 1 level", "Do a drill both-footed", "Scan a spot". Reset at local midnight. |
| Family Quest | Weekly, shared **[approved]**. Kid side: "Complete 3 levels". Parent side: "Check in 3 days" (view dashboard, cheer, or approve). Both sides done = chest for kid + badge tier. |
| Chests | Path nodes and quest rewards. **Surprise reveal [approved]**: contents rolled server-side on open from a fixed table (XP 20/35/50 at 60/30/10%, plus 1 cosmetic per unit guaranteed). Kid taps to open, mascot reacts. No paid currency, no duplicates-as-filler. |
| Badges (MVP 14) | First Whistle, Hat Trick (3 levels), Week Warrior (7), Month Strong (30), Gold Unit, Explorer (3 spots), Gear Head (gear scan), Both Feet, Sharpshooter, Route Runner, Wall Rally 20, Glove Work, Family ×1 / ×5 |
| Rewards | Parent-defined real-world rewards, XP cost or milestone, kid claims → parent approves. XP not deducted until approval. |
| Levels (player) | `player_level = floor(sqrt(total_xp/50))`. Shown on Me. Cosmetic only. |
| Leagues | **Not in MVP.** [P1] private Family League (siblings only). No public leaderboards for minors. |
| Hearts | Not used. Practice has no wrong answers; punishment mechanics conflict with the 8–13 goal. |

### F.3 Mascot — dachshund coach [approved species, art later]

- Species: **dachshund**. Name: placeholder "Coach" **[ASSUMPTION: name TBD]**. Personality: short legs, big whistle, tries every drill first and is bad at jumping. Copy leans on that.
- `Mascot` component, `pose: idle | cheer | think | sleep | nudge | stretch`. MVP renders placeholder SVGs per pose sized for the header (96pt) and inline (48pt).
- Copy in `packages/core/mascot-lines.ts`, keyed per moment, 3 variants each, written in-voice: onboarding hello, analyzing, summary praise, streak-at-risk nudge, chest open, unit complete, empty path, hard-rejection error.
- Appears: Path header, scan analyzing, summary, chest open, quests empty state, parent dashboard tip card.
- Constraint: encouraging only, max 1 nudge/day, no guilt copy.

### F.4 Where gamification touches each loop

- **Onboarding:** first session in <10 min → First Whistle + 2–3 stars + goal met + streak 1. Family Quest starts at parent 1/3 (setup counts).
- **Daily:** one node, one goal ring, quests.
- **Weekly:** Family Quest, digest, unit completion.
- **Parent:** dashboard check-in = a quest move; cheer button (emoji on last session) → kid sees it on Path.

---

## G. Acceptance criteria (MVP gate)

Must ship:
1. Parent signup (email + Apple), onboarding incl. gear + availability, resumable, path generated at end.
2. Kid PIN login, kid onboarding, mascot placeholder, daily goal pick, first level in <10 min.
3. 5 sports seeded: tracks, positions, ≥8 drills per sport, ≥1 shadow drill per track, ≥40 media items.
4. Generator: per-sport skeleton personalized by position + goals, JIT fill, star scoring, difficulty adaptation, regenerate-preserves-progress, all unit-tested.
5. Scanner Spot + Gear modes, permission states, confirm sheet, fallback, saves feed generator.
6. Path UI with sport tabs, node states, surprise chests, unit review; Session Player; Summary with XP/goal/streak/stars. All mutations optimistic with rollback on hard rejection.
7. Streaks + freeze, daily quests, Family Quest, 14 badges, rewards create/claim/approve.
8. Parent Dashboard, Plan (availability + regenerate), ChildDetail, Settings per C.
9. RLS proven by TS integration tests against local Supabase; Edge Function validation rejects drills the child can't do.
10. Offline session completion; privacy: opt-in photo storage, export, child delete.

Beta metrics (20–30 families, 4 weeks):
- Parent onboarding completion ≥ 80%; median time-to-first-kid-session ≤ 8 min.
- D1→D7 kid retention ≥ 40%; 3-day streak in week 1 for 40%.
- ≥ 3 levels/week for 50% of active kids; "too hard"+"too easy" feedback < 20% of drills after level 5 (adaptation works).
- Scan accepted without tag edits ≥ 70% (Spot) / ≥ 60% (Gear).
- Family Quest completed by 50% of families in weeks 2–4.
- Zero RLS violations; crash-free sessions ≥ 99%.

---

## H. TDD plan

Every task starts with a failing test. CI blocks merge on red.

| Layer | Tool | Coverage | Location |
|---|---|---|---|
| Domain (pure TS) | Vitest | Generator skeleton (per-sport, unit order by position weights + goals, goal units 7 nodes, every track present, chest placement, cap), optimistic reducers equal server results for same inputs, JIT fill (equipment/space/wall filters, never-empty guarantee, time packing, recency, feedback adaptation), star scoring, XP/level math, streak incl. freeze + tz midnight, quest evaluation, badge rules, Zod settings schemas, scanner heuristics on 30 fixture images, gear classifier label mapping | `packages/core/**/*.test.ts` |
| DB + Edge Functions | Vitest integration against `supabase start` (two parent JWTs) | RLS cross-parent denial on every child table; `complete-session` idempotency; `start-session` rejects invalid drills; `verify-child-pin` rate limit; `generate-path` preserves done levels; ledger sum = total XP; chest roll distribution | `supabase/tests/*.test.ts` |
| Screens | Jest + RN Testing Library | Every state in A.3/A.4; tap targets ≥56pt on kid screens; a11y labels; mascot pose per moment | `apps/mobile/src/**/*.test.tsx` |
| E2E | Maestro | (1) parent onboarding → path preview, (2) kid PIN → first level → summary → node 2, (3) gear scan (mock camera) → confirm → path regenerates, (4) spot scan → start level here, (5) reward claim → parent approve → Family Quest | `e2e/*.yaml` |
| Contracts | `supabase gen types` checked in; CI fails on drift; Edge Function payloads typed with Zod schemas shared from `packages/core` | `packages/db/types.ts` |

Build order (red → green → refactor each):
1. `packages/core`: generator + game math + tests. Zero RN imports.
2. `supabase`: migrations + RLS, seed (5 sports), Edge Functions (TS) wrapping `packages/core`, integration tests.
3. Auth, Who's Playing, PIN.
4. Parent onboarding (incl. Gear chips + Availability) → path preview.
5. Kid onboarding → Path → time picker → Session Player → Summary.
6. Scanner Spot then Gear (classifier tested on fixtures before camera UI).
7. Quests, streaks, badges, chests, Family Quest, Rewards, Dashboard.
8. Settings, privacy actions, offline queue.
9. Maestro flows.

Repo (pnpm monorepo):
```
apps/mobile      Expo app (expo-router)
packages/core    generator, game math, optimistic reducers, mascot lines — pure TS, runs on device and in Deno
packages/db      generated types + typed RPC wrappers
supabase/        migrations, seed, functions, tests
e2e/             Maestro
```

Dependencies (fixed list): expo, expo-router, expo-camera, expo-secure-store, expo-notifications, expo-location, react-native-reusables, nativewind, @supabase/supabase-js, @tanstack/react-query, zustand, zod, react-native-mmkv, react-native-fast-tflite, vitest, @testing-library/react-native, maestro.

---

## I. Decisions (approved 2026-09-19)

| # | Question | Decision |
|---|---|---|
| 1 | Fifth sport | Baseball/Softball |
| 2 | Path structure | One path per sport, personalized by position + kid-chosen improvement goals |
| 3 | Chests | Surprise reveal, rolled server-side |
| 4 | Family Quest parent side | 3 check-ins/week (default kept) |
| 5 | Gear classifier | Bundled ~4 MB TFLite model |
| 6 | Mascot | Dachshund; name TBD |
| + | UI | Optimistic everywhere, rollback only on hard rejection |
| + | Stack | TypeScript only: RN/Expo client, `packages/core`, Deno Edge Functions. SQL limited to migrations/RLS. |

Still assumed: English-only, iOS + Android, no social features, COPPA/legal review pre-launch, mascot name.
