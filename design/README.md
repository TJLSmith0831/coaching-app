# design/ — UI prototype (reference only)

`prototype/` is an export of Lars's claude.ai/design project "Kick-Off" (Kids Soccer Training App). It is a **visual reference for agents building `apps/mobile`**, not app code. Nothing in here is imported by the app, and the HTML is not meant to be ported line by line.

Source: https://claude.ai/design/p/21483876-56f9-46d8-9142-242a3645b59e (exported 2026-09-19). Files are verbatim; re-export rather than hand-editing them.

`docs/MVP_SPEC.md` stays the source of truth for scope, flows, and rules. Where the prototype and the spec disagree, **the spec wins** and the prototype only supplies the look. Known disagreements are listed under "Gaps" below.

## Files

| Path | What it is |
|---|---|
| `prototype/Kick-Off App.dc.html` | The 10 screens + the click-through logic (template in `<x-dc>`, state in the `<script data-dc-script>` class at the bottom) |
| `prototype/_ds/organic-…/styles.css` | Design tokens (`:root` variables) + component classes. **Start here for colors, type, spacing, radii.** |
| `prototype/_ds/organic-…/readme.md` | Design-system guide: direction, do/don't, component list |
| `prototype/_ds/organic-…/_ds_bundle.js` | Empty component bundle (no JS components in this system) |
| `prototype/support.js`, `prototype/image-slot.js` | claude.ai/design runtime. Generated, ignore. |

The `.dc.html` only renders inside claude.ai/design (the runtime expects the host to provide React). Read it as source; open the link above to click through it.

## How to use it in `apps/mobile`

All spec screens already exist in `apps/mobile/app/**` with a generic shadcn theme. The job is a **restyle, not a rebuild**: keep screen logic, store, and tests; change the theme and the shared primitives so every screen picks the look up.

1. Theme variables in `apps/mobile/global.css` (HSL triplets consumed by `tailwind.config.js`). Approximate mapping:

   | Variable | Prototype token | HSL |
   |---|---|---|
   | `--background` | `--color-bg` `#f5ead8` | `37 59% 90%` |
   | `--foreground` | `--color-text` `#201e1d` | `20 5% 12%` |
   | `--card` | white cards on tinted ground | `0 0% 100%` |
   | `--primary` / `--ring` | `--color-accent` `#c67139` (terracotta) | `24 55% 50%` |
   | `--secondary` | `--color-accent-2` `#7a8a5e` (sage) | `82 19% 45%` |
   | `--accent` | `--color-accent-2-200` `#e1eecc` (selected fill) | `83 50% 87%` |
   | `--muted` / `--muted-foreground` | `neutral-200` `#eee7db` / `neutral-700` `#645c50` | `38 36% 90%` / `36 11% 35%` |
   | `--border` / `--input` | `neutral-300` `#dcd3c4` | `38 26% 82%` |
   | `--radius` | cards 22–30, controls pill | `1.5rem`; buttons/chips/inputs `rounded-full` |

   Add the full `accent` / `sage` / `neutral` 100–900 ramps to `tailwind.config.js` for tinted fills and pressed states.
2. Fonts: Caprasimo (headings) + Figtree (body) via `@expo-google-fonts/*`, wired in `components/ui/text.tsx`.
3. Primitives in `components/ui/` (`button`, `chip`, `card`, `progress`, `screen`): pill shapes, hard bottom edge on primary buttons, sage selected state on chips, sage-tinted ground for kid screens and cream for parent screens.
4. Then `components/path-header.tsx`, the Path nodes, the tab bars, and `components/mascot.tsx` (bubble pattern).

## Design tokens

Reference values from `styles.css`. Do not hard-code hex values in screens.

| Role | Value |
|---|---|
| Ground / surface | `#f5ead8` / `#ebddc5`; kid screens sit on sage `accent-2-100 #f0fae1` |
| Text | `#201e1d` |
| Accent (terracotta, primary actions) | `#c67139`, ramp `accent-100…900` (`#fff2eb … #402310`) |
| Accent 2 (sage, selected/done states) | `#7a8a5e`, ramp `accent-2-100…900` (`#f0fae1 … #272e1b`) |
| Neutral ramp | `#f9f4ed … #2e2b25` |
| Fonts | Headings **Caprasimo** 400, body **Figtree** 400/600/700 (Google Fonts → `expo-font`) |
| Radii | 8 / 16 / 28; cards ~22–30, buttons/chips/inputs fully pill (`999`) |
| Spacing | 4.4 / 8.8 / 13.2 / 17.6 / 26.4 / 35.2 |
| Shadows | soft ink-tinted `sm/md/lg`; primary buttons and path nodes use a hard "3D" bottom edge (`0 4px 0 accent-700`, `0 6px 0 …`) |
| Icons | Lucide, stroke width 2.75 (`lucide-react-native`) |

Recurring patterns worth turning into components: mascot + speech bubble, selectable pill chip (sage border/fill when on, white when off), selectable card row, progress bar (pill), ring progress (conic), path node (64pt circle: done = sage + check, current = terracotta + play + pulse + "Start here!" bubble, locked = neutral + lock, chest = light terracotta + star), floating pill tab bar, white stat card, dashed "mascot" circle = placeholder for final mascot art.

Animations: `ko-pulse` (current node), `ko-pop` (reward reveal), `ko-up` (staggered card entrance), `ko-bob` (mascot idle), `ko-wave` (mascot hello).

## Screen map: prototype → spec

| # | Prototype screen | Spec screen (`MVP_SPEC.md`) | Notes |
|---|---|---|---|
| 1 | Parent setup (name, age, where they play) | B.1 AddChild | Spec: nickname, birth month/year, avatar; age bands 8–10 / 11–13 |
| 2 | Surroundings & gear (photo → chips) | B.1 Gear + B.3 Scanner confirm sheet | One combined scan; spec has separate Spot and Gear modes |
| 3 | Time & skills (minutes, days, level, goals) | B.1 ChildSports (level) + Availability + kid "improvement goals" | Spec: minutes per weekday + reminder time; goals = 1–2 skill tracks |
| 4 | Meet your coach | B.2 "Meet <Mascot>" | Mascot slot is a placeholder |
| 5 | Training path | A.4 Path | Layout, node states, streak/XP pills, unit card, tab bar |
| 6 | Drill | A.4 Session Player | Timer ring, 3 steps, mascot tip, "I did it!" |
| 7 | Rewards ("Drill done!") | A.4 Summary | XP, streak, new badge, unlock progress, weekly challenge |
| 8 | Challenges | A.4 Quests | One big weekly challenge + side quests |
| 9 | Badges | A.4 Me (badges grid, level ring) | 12 badges, player level ring |
| 10 | Locker (mascot outfits, kits) | A.4 Me (avatar/cosmetics) | Cosmetics; see gap on XP spending |

## Gaps (prototype vs. spec) — build from the spec, style from the prototype

Conflicts:
- **Soccer only.** Spec has five sports: sport picker, positions, and a sport tab strip on Path are not designed.
- **Mascot.** Prototype uses "Kicky" (a soccer ball) with a placeholder for a new mascot; spec §F.3 says dachshund, name TBD ("Coach"). Use the `Mascot` component with poses from the spec; reuse only the bubble/placement pattern.
- **Path node = one drill** in the prototype ("2/6 drills"); in the spec a node is a *level* = one timed session of several drills, with 1–3 stars, goal units of 7 nodes, a chest every 3rd node, and a Unit Review at the end.
- **Tabs.** Prototype: Train / Challenges / Badges / Locker. Spec: Path / Practice / Scan / Quests / Me.
- **Goals and skill names** don't match the seed tracks (Ball Control, Passing, Dribbling, Shooting, Position Skills) and aren't limited to 1–2.
- **Quests.** Prototype: one weekly solo challenge + weekly side quests. Spec: 3 *daily* quests + a weekly *Family Quest* with a parent side.
- **XP as currency** ("120 XP to spend" in Locker). Spec: XP is never spent on cosmetics; cosmetics come from chests, XP cost exists only for parent-defined rewards.
- **Level math.** Prototype `xp/100`; spec `floor(sqrt(total_xp/50))`. Badge list (12) differs from the spec's 14.
- **Age bands** 8–9 / 10–11 / 12–13 vs. spec 8–10 / 11–13.

Not designed at all (these screens exist in `apps/mobile`; derive their look from the tokens and patterns above). A second design pass covering them is in progress (Lars):
- Auth: Welcome, SignUp/SignIn, ForgotPassword; Consent; Permissions explainer
- Set kid PIN, "Who's Playing?" picker, PIN entry
- Kid onboarding: avatar, sport order + positions, usual practice spot, daily goal pick
- Time picker before a session (time chips, spot chips, gear check)
- Session Player actions: Skip / Too hard / Too easy, read-aloud, media (image/video)
- Summary: stars, daily goal ring, chest opening, level-up modal
- Kid Scan tab (Spot | Gear), camera-denied and low-confidence states
- Whole parent area: Dashboard, Children/ChildDetail, Plan, Rewards (create/approve), Settings
- States: empty, loading, error, offline, streak at risk, gear missing

Already in line with the kid-UX rules: primary buttons are 56pt high, every action has an icon or mark, no typing on kid screens. The Drill screen exceeds the "≤2 lines of text" rule (description + 3 steps + mascot tip).
