// One function, four small actions: open-chest | record-scan | parent-checkin | sync-progress.
// ponytail: single deploy instead of four ~50KB bundles; split out if any action needs its own scaling/auth.
import { authChild, handler, json, HttpError, todayOf } from "../_shared/auth.ts";
import { loadProgress, saveProgress, seed } from "../_shared/state.ts";
import { openChest, parentCheckin, recordScan, rollChest, type SportId } from "../_shared/core/index.ts";

const CHECKIN_KINDS = new Set(["viewed", "cheered", "approved"]);

Deno.serve(handler(async (req, body) => {
  const action = String(body.action ?? "");
  const { db, child, userId } = await authChild(req, body.child_id as string);
  const today = todayOf(body);
  let progress = await loadProgress(db, child, today);

  switch (action) {
    case "sync-progress": {
      await saveProgress(db, child.id, progress);
      return json({ progress });
    }
    case "open-chest": {
      const sportId = body.sport_id as SportId, unit = body.unit as number, level = body.level as number;
      const path = progress.paths[sportId];
      if (!path) throw new HttpError(400, "no path");
      const node = path.skeleton.units[unit]?.levels[level];
      if (!node || node.kind !== "chest") throw new HttpError(400, "not a chest");
      const already = path.chestsOpened[`${unit}:${level}`];
      if (already !== undefined) return json({ progress, xp: already, idempotent: true });
      const { xp } = rollChest(`${child.id}:${sportId}:${unit}:${level}`);
      progress = openChest(progress, sportId, unit, level, xp);
      await saveProgress(db, child.id, progress);
      return json({ progress, xp });
    }
    case "record-scan": {
      const mode = body.mode as "spot" | "gear";
      if (mode !== "spot" && mode !== "gear") throw new HttpError(400, "mode must be spot|gear");
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
      progress = recordScan(progress, mode, today, seed);
      await saveProgress(db, child.id, progress);
      return json({ progress, spot_id: spotId });
    }
    case "parent-checkin": {
      const kind = String(body.kind ?? "");
      if (!CHECKIN_KINDS.has(kind)) throw new HttpError(400, "kind must be viewed|cheered|approved");
      const { error } = await db.from("parent_checkins").upsert(
        { parent_id: userId, child_id: child.id, kind, day: today }, { onConflict: "child_id,day,kind", ignoreDuplicates: true });
      if (error) throw new HttpError(500, error.message);
      progress = parentCheckin(progress, today);
      await saveProgress(db, child.id, progress);
      return json({ progress });
    }
    default:
      throw new HttpError(400, "unknown action");
  }
}));
