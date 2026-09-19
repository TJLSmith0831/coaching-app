import { createClient as create, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

export type { Database } from "./types";
export type Db = SupabaseClient<Database>;
export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];

export function createClient(url: string, key: string, storage?: { getItem(k: string): Promise<string | null> | string | null; setItem(k: string, v: string): Promise<void> | void; removeItem(k: string): Promise<void> | void }): Db {
  return create<Database>(url, key, {
    auth: { storage: storage as never, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
  });
}

/** 4xx from an Edge Function: the server rejected the request. Roll back optimistic state. */
export class HardRejection extends Error {
  constructor(public status: number, message: string) { super(message); this.name = "HardRejection"; }
}

/** Invoke an Edge Function. Throws HardRejection on 4xx, plain Error on network/5xx (keep queued, retry). */
export async function callFn<T>(client: Db, name: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await client.functions.invoke<T>(name, { body });
  if (!error) return data as T;
  const ctx = (error as { context?: Response }).context;
  const status = ctx?.status ?? 0;
  let message = error.message;
  try { message = ((await ctx?.json()) as { error?: string })?.error ?? message; } catch { /* keep default */ }
  if (status >= 400 && status < 500) throw new HardRejection(status, message);
  throw new Error(message);
}

// ---- Typed Edge Function wrappers (names/routing live here so screens never hardcode them) ----
type J = Record<string, unknown>;
export const fns = {
  setChildPin: (c: Db, b: { child_id: string; pin: string }) => callFn<{ ok: true }>(c, "set-child-pin", b),
  verifyChildPin: (c: Db, b: { child_id: string; pin: string }) => callFn<{ ok: true }>(c, "verify-child-pin", b),
  generatePath: <P>(c: Db, b: { child_id: string; sport_id: string; today?: string }) => callFn<{ progress: P }>(c, "generate-path", b),
  startSession: (c: Db, b: { session_id: string; child_id: string; sport_id: string; unit: number; level: number; time_budget_sec: number; spot_id?: string | null; planned_drill_ids: string[]; today?: string }) =>
    callFn<{ ok: true }>(c, "start-session", b),
  completeSession: <P, S>(c: Db, b: { session_id: string; child_id: string; results: J[]; today: string; replay?: boolean }) =>
    callFn<{ progress: P; summary: S; idempotent?: boolean }>(c, "complete-session", b),
  openChest: <P>(c: Db, b: { child_id: string; sport_id: string; unit: number; level: number; today?: string }) =>
    callFn<{ progress: P; xp: number; idempotent?: boolean }>(c, "progress", { action: "open-chest", ...b }),
  recordScan: <P>(c: Db, b: { child_id: string; mode: "spot" | "gear"; today: string; spot?: J; equipment_type_ids?: string[] }) =>
    callFn<{ progress: P; spot_id?: string }>(c, "progress", { action: "record-scan", ...b }),
  parentCheckin: <P>(c: Db, b: { child_id: string; kind: "viewed" | "cheered" | "approved"; today: string }) =>
    callFn<{ progress: P }>(c, "progress", { action: "parent-checkin", ...b }),
  syncProgress: <P>(c: Db, b: { child_id: string; today: string }) => callFn<{ progress: P }>(c, "progress", { action: "sync-progress", ...b }),
};
