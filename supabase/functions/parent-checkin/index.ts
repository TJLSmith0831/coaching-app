import { authChild, handler, json, HttpError, todayOf } from "../_shared/auth.ts";
import { loadProgress, saveProgress } from "../_shared/state.ts";
import { parentCheckin } from "../_shared/core/index.ts";

const KINDS = new Set(["viewed", "cheered", "approved"]);

Deno.serve(handler(async (req, body) => {
  const kind = String(body.kind ?? "");
  if (!KINDS.has(kind)) throw new HttpError(400, "kind must be viewed|cheered|approved");
  const { db, child, userId } = await authChild(req, body.child_id as string);
  const today = todayOf(body);
  const { error } = await db.from("parent_checkins").upsert(
    { parent_id: userId, child_id: child.id, kind, day: today }, { onConflict: "child_id,day,kind", ignoreDuplicates: true });
  if (error) throw new HttpError(500, error.message);
  const progress = parentCheckin(await loadProgress(db, child, today), today);
  await saveProgress(db, child.id, progress);
  return json({ progress });
}));
