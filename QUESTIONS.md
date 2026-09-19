# QUESTIONS.md
## This is the file where agents and humans can coordinate 

There are three humans, Lars, Nico, and Tristan. Each is using a Claude agent. This file is where each 
agent helps keep track of the progress of it's user and work.

## Log

### 2026-09-19 — Tristan's agent
- Spec bumped to v2.1 in `docs/MVP_SPEC.md` §I with approved decisions: Baseball as 5th sport; one Path per sport personalized by position + improvement goals; surprise chests (server-rolled); Family Quest 3 parent check-ins/week; bundled 4 MB gear TFLite model; dachshund mascot (name TBD); optimistic UI; TypeScript-only stack (Edge Functions in Deno TS, no pgTAP/plpgsql).
- `CLAUDE.md` updated to match (RPCs → Edge Functions, pgTAP → Vitest integration, optimistic UI rule).
- Started build order step 1: `packages/core` (generator + game math, Vitest). Uncommitted until Tristan reviews.
- Open for anyone: mascot name; who owns step 2 (`supabase/` migrations + Edge Functions) vs step 3 (auth + PIN screens)? Claim here before starting.

### 2026-09-19 — Tristan's agent (build kickoff)
- Goal set: build the full MVP demo Expo app + backend. Committing and pushing after every step.
- Backend via **Supabase MCP** (not CLI, no Docker, no local Supabase). Added `supabase` (https://mcp.supabase.com/mcp, OAuth) to `.mcp.json`. **Tristan: run `/mcp` and authenticate Supabase; restart the session if it isn't listed.** Until then migrations/edge functions are authored in `supabase/` and applied through the MCP once connected.
- Expo SDK 57 / RN 0.86 / React 19.2 scaffolded at `apps/mobile`. Removed template CLAUDE.md/AGENTS.md so root files stay the source of truth.
- Demo runs local-first (zustand persisted store = optimistic truth) and syncs to Supabase Edge Functions when `EXPO_PUBLIC_SUPABASE_URL` is set. Same UI works before the backend is linked.
- Gear TFLite model: demo uses the heuristic + always-shown confirm sheet (Expo Go compatible). Real model needs a dev-client build; tracked as next step after MVP demo.

### 2026-09-19 — Tristan's agent (steps 1–5 landed)
- Supabase MCP connected. Created project **coaching-app** (ref `exaayuehkdmpdxrfhtuj`, us-east-1, $0/mo). Schema + Edge Functions being deployed via MCP by a sub-agent; see `supabase/README.md` when it lands.
- `packages/core` now has seed content (5 sports, 25 tracks, 18 positions, 67 drills, 14 badges, 8 quest templates), mascot lines, and the shared `progress.ts` reducer (`completeSession`, `openChest`, `ensureQuests`, `recordScan`, `parentCheckin`). 34 tests.
- **Deliberate simplification (logged):** per-child gamification state is one JSONB blob (`child_progress.progress`) shaped as `ChildProgress`, not the normalized ledger/streak/quest tables in spec §D. Seed content lives in TS only, no seed tables. Normalize later when parent analytics need SQL. `// ponytail:` comments mark it.
- `apps/mobile` (Expo SDK 57, expo-router, NativeWind 4, shadcn-style primitives): all screens from spec §A written — auth, parent onboarding wizard, Who's playing, PIN, kid onboarding, Path (per-sport tabs, nodes, chests), Session (time picker → player → summary), Scan (Spot + Gear, on-device 32×32 decode + color heuristic, confirm sheet always shown), Quests, Me, parent Dashboard/Children/Plan/Rewards/Settings, Child detail. Typecheck clean; `expo export --platform ios` bundles.
- Optimistic UI: `lib/store.ts` (zustand, persisted) runs the core reducer locally first, queues Edge Function calls, rolls back only on 4xx via `sync-progress`. Without `EXPO_PUBLIC_SUPABASE_URL` the app runs fully local (demo mode).
- Not done yet: `.env` with project URL/key (waiting on backend sub-agent), simulator smoke test, Maestro flows (maestro not installed), TFLite gear model (heuristic in place).


### 2026-09-19 — Lars's agent (design prototype)
- Added `design/`: verbatim export of Lars's claude.ai/design prototype "Kick-Off" (10 screens, "Organic" design system: cream ground, terracotta actions, sage accents, Caprasimo + Figtree, pill shapes) plus `design/README.md`. Reference only, nothing in the app imports it.
- `design/README.md` has the tokens, an HSL mapping for `apps/mobile/global.css`, the reusable UI patterns (path node, chip, mascot bubble, pill tab bar), a prototype → spec screen map, and the gaps. Spec wins on behavior, prototype on look. `CLAUDE.md` points to it.
- The prototype predates spec v2.1: soccer only, ball mascot "Kicky", node = single drill, different tabs/quests. Do not port those; they are listed under "Gaps".
- In progress (Lars): second design pass in claude.ai/design for the screens the prototype lacks (auth, PIN, time picker, scan, summary variants, parent area). Will be re-exported into `design/prototype/`.
- **Open for anyone:** restyling `apps/mobile` to the Organic theme (`global.css` vars, fonts, `components/ui/*`) is unclaimed. Claim here before starting so it doesn't collide with screen work.
