import { authChild, handler, json, HttpError, todayOf } from "../_shared/auth.ts";
import { loadProgress, saveProgress, seed } from "../_shared/state.ts";
import { buildSkeleton, ensurePath, type SportId, type Level } from "../_shared/core/index.ts";

Deno.serve(handler(async (req, body) => {
  const sportId = body.sport_id as SportId;
  if (!seed.sports.some((s) => s.id === sportId)) throw new HttpError(400, "unknown sport");
  const { db, child } = await authChild(req, body.child_id as string);
  const { data: cs } = await db.from("child_sports").select("*").eq("child_id", child.id).eq("sport_id", sportId).maybeSingle();
  if (!cs) throw new HttpError(400, "sport not enabled for child");
  const skeleton = buildSkeleton({
    sportId,
    tracks: seed.tracks.filter((t) => t.sportId === sportId),
    positions: seed.positions.filter((p) => p.sportId === sportId && cs.position_ids.includes(p.id)),
    goalTrackIds: cs.goal_track_ids,
    level: (cs.level as Level) ?? "beginner",
    difficultyCap: child.difficulty_cap,
  });
  let progress = await loadProgress(db, child, todayOf(body));
  progress = ensurePath(progress, sportId, skeleton);
  await saveProgress(db, child.id, progress);
  return json({ progress });
}));
