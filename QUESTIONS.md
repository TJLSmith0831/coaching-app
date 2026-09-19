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

