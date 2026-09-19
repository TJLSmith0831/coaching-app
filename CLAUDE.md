# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

Pre-code. The repo holds only [docs/MVP_SPEC.md](docs/MVP_SPEC.md) (v2 draft), which is the source of truth for scope, data model, RPCs, gamification rules, and build order. Read the relevant section before implementing. `[DEFAULT]` items are built unless told otherwise, `[ASSUMPTION]` items need approval, `[P1]` items are post-MVP. No build, lint, or test commands exist yet. Add them here once the monorepo is scaffolded.

`graphify-out/` (code graph, gitignored) and `.palisade/` are tooling artifacts. `.mcp.json` wires the graphify MCP server to that graph.

## Agent coordination

Use `QUESTIONS.md` at the repo root for agent coordination: log open questions, blockers, and cross-agent handoffs there instead of guessing, and check it before starting work.

## Product

Kids' (ages 8–13) sports practice app with a parent-run setup. Five sports: soccer, basketball, flag football, tennis, baseball/softball. Kids follow a Duolingo-style Path (Units → Levels → Sessions) generated from sport, position, age, gear, practice spot, and available time. Stack: React Native + Expo (TypeScript), `react-native-reusables` + NativeWind (shadcn for RN), Supabase.

## Planned layout (pnpm monorepo)

```
apps/mobile      Expo app (expo-router)
packages/core    generator, game math, mascot lines. Pure TS, zero RN imports
packages/db      generated Supabase types + typed RPC wrappers
supabase/        migrations, seed, edge functions, pgTAP tests
e2e/             Maestro flows
```

Testing tools per layer: Vitest (`packages/core`), pgTAP via `supabase test db`, Jest + RN Testing Library (screens), Maestro (5 critical flows). Work is test-first and CI blocks on red. Build order is in spec §H.

## Architecture constraints that span files

- **Children are rows, not auth users.** The JWT is always the parent's. The client holds `activeChildId` (Zustand) and passes it to RPCs. Kid PIN goes through the `verify_child_pin` RPC (bcrypt, rate-limited), never client-side. RLS on every `child_id` table checks `children.parent_id = auth.uid()`. Seed tables are read-only to `authenticated`.
- **All XP, progress, streak, quest, badge, and chest writes go through SECURITY DEFINER RPCs** (`complete_session`, `start_session`, `generate_path`, …). Clients never write these tables directly. `complete_session` must be idempotent on `session_id`.
- **The plan generator is one shared, deterministic TS package** (`packages/core`) used in two places: the `generate_path` Edge Function (path skeleton, preserves done/current levels) and the client (JIT session fill from cached seed data, offline-safe). `start_session` re-validates the client's `planned_drill_ids` server-side against equipment, age, and cap. The generator must never return an empty session (relax optional equipment, then space, then fall back to `is_shadow` drills).
- **Offline:** `complete_session` calls are queued in MMKV and replayed. Streak date is the device-local date at completion. Seed tables are cached in MMKV for 7 days.
- **Scanner is on-device only.** Spot mode uses a color/edge heuristic, Gear mode a bundled TFLite classifier with a heuristic fallback. The confirm sheet is always shown, so detection errors cost taps, never correctness. Raw photos leave the device only if the parent opts in (`scan-photos` bucket, default off).
- **Kid-safety product rules:** no chat, no public leaderboards, no hearts, kids give a nickname only, encouraging-only mascot copy (max 1 nudge/day). Kid UI: ≤2 lines of text per screen, primary button ≥56pt, no typing except PIN.
- **Sports, tracks, drills, and equipment are seed data.** Swapping the fifth sport (e.g. Cricket) is a seed-file change only. Every skill track needs ≥1 drill needing only core gear and small space.
- **Settings** live in `profiles.settings` and `children.settings` JSONB, validated with Zod client-side.
- Generated DB types (`packages/db/types.ts`) are checked in and CI fails on drift.
