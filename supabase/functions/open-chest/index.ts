import { authChild, handler, json, HttpError, todayOf } from "../_shared/auth.ts";
import { loadProgress, saveProgress } from "../_shared/state.ts";
import { openChest, rollChest, type SportId } from "../_shared/core/index.ts";

Deno.serve(handler(async (req, body) => {
  const { db, child } = await authChild(req, body.child_id as string);
  const sportId = body.sport_id as SportId, unit = body.unit as number, level = body.level as number;
  let progress = await loadProgress(db, child, todayOf(body));
  const path = progress.paths[sportId];
  if (!path) throw new HttpError(400, "no path");
  const node = path.skeleton.units[unit]?.levels[level];
  if (!node || node.kind !== "chest") throw new HttpError(400, "not a chest");
  const key = `${unit}:${level}`;
  const already = path.chestsOpened[key];
  if (already !== undefined) return json({ progress, xp: already, idempotent: true });
  const { xp } = rollChest(`${child.id}:${sportId}:${unit}:${level}`);
  progress = openChest(progress, sportId, unit, level, xp);
  await saveProgress(db, child.id, progress);
  return json({ progress, xp });
}));
