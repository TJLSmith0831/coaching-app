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
