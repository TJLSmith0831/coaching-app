import { authChild, handler, json, HttpError, todayOf } from "../_shared/auth.ts";
import { loadProgress, saveProgress, seed } from "../_shared/state.ts";
import { completeSession, type DrillResult, type SportId } from "../_shared/core/index.ts";

Deno.serve(handler(async (req, body) => {
  const { db, child } = await authChild(req, body.child_id as string);
  const sessionId = body.session_id as string;
  const { data: s } = await db.from("sessions").select("*").eq("id", sessionId).eq("child_id", child.id).maybeSingle();
  if (!s) throw new HttpError(400, "session not started");
  if (s.completed_at) {
    const stored = (s.results as { summary?: unknown } | null)?.summary;
    const progress = await loadProgress(db, child, todayOf(body));
    return json({ progress, summary: stored, idempotent: true });
  }
  const results = (body.results as DrillResult[]) ?? [];
  if (!results.length) throw new HttpError(400, "results required");
  const today = todayOf(body);
  const { data: cs } = await db.from("child_sports").select("position_ids").eq("child_id", child.id).eq("sport_id", s.sport_id!).maybeSingle();
  const before = await loadProgress(db, child, today);
  const { progress, summary } = completeSession(before, {
    sportId: s.sport_id as SportId, unit: s.unit!, level: s.level!, results, replay: Boolean(body.replay), today,
    positionIds: cs?.position_ids ?? [],
  }, seed);
  await saveProgress(db, child.id, progress);
  await db.from("sessions").update({
    results: { drills: results, summary }, xp_earned: summary.xpEarned, stars: summary.stars, completed_at: new Date().toISOString(),
  }).eq("id", sessionId);
  return json({ progress, summary });
}));
