import { authChild, handler, json, HttpError, todayOf } from "../_shared/auth.ts";
import { ageOf, seed } from "../_shared/state.ts";

Deno.serve(handler(async (req, body) => {
  const { db, child } = await authChild(req, body.child_id as string);
  const ids = Array.isArray(body.planned_drill_ids) ? (body.planned_drill_ids as string[]) : [];
  if (!ids.length) throw new HttpError(400, "planned_drill_ids required");
  const { data: eq } = await db.from("child_equipment").select("equipment_type_id").eq("child_id", child.id);
  const have = new Set((eq ?? []).map((e) => e.equipment_type_id));
  const age = ageOf(child, todayOf(body));
  for (const id of ids) {
    const d = seed.drills.find((x) => x.id === id);
    if (!d) throw new HttpError(400, `unknown drill ${id}`);
    if (d.sportId !== body.sport_id) throw new HttpError(400, `drill ${id} is not ${body.sport_id}`);
    if (age < d.ageMin || age > d.ageMax) throw new HttpError(400, `drill ${id} not for age ${age}`);
    if (d.difficulty > child.difficulty_cap + 1) throw new HttpError(400, `drill ${id} above cap`);
    if (!d.isShadow && !d.equipmentRequired.every((e) => have.has(e))) throw new HttpError(400, `missing gear for ${id}`);
  }
  const { error } = await db.from("sessions").upsert({
    id: body.session_id as string, child_id: child.id, sport_id: body.sport_id as string,
    unit: body.unit as number, level: body.level as number, spot_id: (body.spot_id as string) ?? null,
    time_budget_sec: body.time_budget_sec as number, planned_drill_ids: ids, started_at: new Date().toISOString(),
  });
  if (error) throw new HttpError(500, error.message);
  return json({ ok: true });
}));
