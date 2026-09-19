import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/** null when env is missing → app runs fully local (demo mode). */
export const supabase: SupabaseClient | null =
  url && key
    ? createClient(url, key, { auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false } })
    : null;

export class HardRejection extends Error {
  constructor(public status: number, message: string) { super(message); }
}

/** Invoke an Edge Function. Throws HardRejection on 4xx (roll back), Error otherwise (retry). */
export async function callFn<T = unknown>(name: string, body: Record<string, unknown>): Promise<T | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.functions.invoke<T>(name, { body });
  if (error) {
    const status = (error as { context?: { status?: number } }).context?.status ?? 0;
    if (status >= 400 && status < 500) throw new HardRejection(status, error.message);
    throw error;
  }
  return data;
}
