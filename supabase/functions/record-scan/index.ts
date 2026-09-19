import { authChild, handler, json, HttpError, todayOf } from "../_shared/auth.ts";
import { loadProgress, saveProgress, seed } from "../_shared/state.ts";
import { recordScan } from "../_shared/core/index.ts";

Deno.serve(handler(async (req, body) => {
  const mode = body.mode as "spot" | "gear";
  if (mode !== "spot" && mode !== "gear") throw new HttpError(400, "mode must be spot|gear");
  const { db, child } = await authChild(req, body.child_id as string);
  const today = todayOf(body);
  let spotId: string | undefined;
  if (mode === "spot") {
    const s = (body.spot ?? {}) as Record<string, unknown>;
    const { data, error } = await db.from("spots").insert({
      child_id: child.id, label: String(s.label ?? "My spot"), surface: s.surface as string, space: s.space as string,
      fixtures: (s.fixtures as string[]) ?? [], confidence: (s.confidence as number) ?? null,
    }).select("id").single();
    if (error) throw new HttpError(500, error.message);
    spotId = data.id;
  } else {
    const ids = ((body.equipment_type_ids as string[]) ?? []).filter((id) => seed.equipment.some((e) => e.id === id));
    if (ids.length) {
      const { error } = await db.from("child_equipment").upsert(ids.map((id) => ({ child_id: child.id, equipment_type_id: id, source: "scan" })));
      if (error) throw new HttpError(500, error.message);
    }
  }
  const progress = recordScan(await loadProgress(db, child, today), mode, today, seed);
  await saveProgress(db, child.id, progress);
  return json({ progress, spot_id: spotId });
}));
