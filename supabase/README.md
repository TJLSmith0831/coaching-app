# Supabase backend

Project: `coaching-app` (ref `exaayuehkdmpdxrfhtuj`, us-east-1). Managed via the Supabase MCP only. No CLI, no Docker.

## Env for the Expo app (`apps/mobile/.env`)

```
EXPO_PUBLIC_SUPABASE_URL=https://exaayuehkdmpdxrfhtuj.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_cSR9dYwQBnJX4XxUpyPCSA_OFiJGsAP
```

(Legacy JWT anon key also works; see `get_publishable_keys` via MCP.)

## Schema (`migrations/0001_init.sql`, `0002_harden_functions.sql`)

`profiles` (auto-created by trigger on signup), `children`, `child_sports`, `child_equipment`, `spots`, `availability`,
`child_progress` (one JSONB `ChildProgress` blob per child), `sessions`, `rewards`, `reward_claims`, `parent_checkins`.
Storage bucket `scan-photos` (private, `{parent_id}/…`).

RLS on everything. Clients write `children`, `child_sports`, `child_equipment`, `spots`, `availability`, `rewards`, `reward_claims` directly.
`child_progress` and `sessions` are **read-only** for clients; only Edge Functions (service role) write them.
Helper `private.owns_child(uuid)` backs every child-scoped policy.

## Edge Functions (`functions/`)

All require the parent's JWT and verify child ownership. All game math comes from `packages/core` via `functions/_shared/core/`
(a copy; regenerate with `supabase/scripts/sync-core.sh` and redeploy after changing core).

| Function | Body | Notes |
|---|---|---|
| `set-child-pin` | `{child_id, pin}` | PBKDF2-SHA256 (100k) via Web Crypto |
| `verify-child-pin` | `{child_id, pin}` | 5 attempts / minute |
| `generate-path` | `{child_id, sport_id, today?}` | `buildSkeleton` + `ensurePath`; preserves progress |
| `start-session` | `{session_id, child_id, sport_id, unit, level, time_budget_sec, spot_id?, planned_drill_ids, today?}` | validates drills vs age/cap/gear |
| `complete-session` | `{session_id, child_id, results, today, replay?}` | idempotent on session_id; returns `{progress, summary}` |
| `progress` | `{action: "open-chest" \| "record-scan" \| "parent-checkin" \| "sync-progress", child_id, today, ...}` | four small actions in one deploy |

Use the typed wrappers in `packages/db` (`fns.openChest`, `fns.recordScan`, …) instead of calling names directly.
`callFn` throws `HardRejection` on 4xx (roll back optimistic state) and a plain `Error` otherwise (keep queued, retry).

## Redeploying

Edit source → `scripts/sync-core.sh` → `deploy_edge_function` via MCP with `<fn>/index.ts` + every file under `_shared/` (including `_shared/core/**`) in `files`.
