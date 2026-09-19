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

