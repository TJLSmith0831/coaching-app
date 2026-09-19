import { authChild, handler, json, HttpError } from "../_shared/auth.ts";
import { hashPin } from "../_shared/pin.ts";

Deno.serve(handler(async (req, body) => {
  const pin = String(body.pin ?? "");
  if (!/^\d{4}$/.test(pin)) throw new HttpError(400, "pin must be 4 digits");
  const { db, child } = await authChild(req, body.child_id as string);
  const { error } = await db.from("children").update({ pin_hash: await hashPin(pin), pin_attempts: 0 }).eq("id", child.id);
  if (error) throw new HttpError(500, error.message);
  return json({ ok: true });
}));
