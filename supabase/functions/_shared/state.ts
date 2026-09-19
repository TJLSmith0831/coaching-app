import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { newChildProgress, ensureQuests, seed, type ChildProgress } from "./core/index.ts";
import { HttpError } from "./auth.ts";

export { seed };

export async function loadProgress(db: SupabaseClient, child: { id: string; daily_goal_xp: number }, today: string): Promise<ChildProgress> {
  const { data } = await db.from("child_progress").select("progress").eq("child_id", child.id).maybeSingle();
  const p = (data?.progress as ChildProgress | undefined) ?? newChildProgress(child.daily_goal_xp);
  return ensureQuests(p, today, seed);
}

export async function saveProgress(db: SupabaseClient, childId: string, progress: ChildProgress) {
  const { error } = await db.from("child_progress").upsert({ child_id: childId, progress, updated_at: new Date().toISOString() });
  if (error) throw new HttpError(500, error.message);
}

export function ageOf(child: { birth_year: number | null; birth_month: number | null }, today: string): number {
  if (!child.birth_year) return 10;
  const y = +today.slice(0, 4), m = +today.slice(5, 7);
  return y - child.birth_year - (child.birth_month && m < child.birth_month ? 1 : 0);
}
