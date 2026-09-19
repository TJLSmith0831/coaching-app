import { authChild, handler, json, HttpError } from "../_shared/auth.ts";
import { verifyPin } from "../_shared/pin.ts";

const MAX = 5, WINDOW_MS = 60_000;

Deno.serve(handler(async (req, body) => {
  const pin = String(body.pin ?? "");
  const { db, child } = await authChild(req, body.child_id as string);
  const since = child.pin_attempt_at ? Date.now() - new Date(child.pin_attempt_at).getTime() : Infinity;
  const attempts = since < WINDOW_MS ? child.pin_attempts : 0;
  if (attempts >= MAX) throw new HttpError(429, "too many attempts, wait a minute");
  const ok = await verifyPin(pin, child.pin_hash);
  await db.from("children").update({
    pin_attempts: ok ? 0 : attempts + 1,
    pin_attempt_at: new Date().toISOString(),
  }).eq("id", child.id);
  if (!ok) throw new HttpError(401, "wrong pin");
  return json({ ok: true });
}));
