import { authChild, handler, json, todayOf } from "../_shared/auth.ts";
import { loadProgress, saveProgress } from "../_shared/state.ts";

Deno.serve(handler(async (req, body) => {
  const { db, child } = await authChild(req, body.child_id as string);
  const progress = await loadProgress(db, child, todayOf(body));
  await saveProgress(db, child.id, progress);
  return json({ progress });
}));
