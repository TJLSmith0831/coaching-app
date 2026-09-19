import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export const admin = (): SupabaseClient =>
  createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

/** Verifies the caller's JWT and that they own child_id. Returns { userId, db (service role) }. */
export async function authChild(req: Request, childId: string | undefined) {
  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.startsWith("Bearer ")) throw new HttpError(401, "missing token");
  const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } },
  });
  const { data: { user }, error } = await userClient.auth.getUser();
  if (error || !user) throw new HttpError(401, "invalid token");
  if (!childId) throw new HttpError(400, "child_id required");
  const db = admin();
  const { data: child } = await db.from("children").select("*").eq("id", childId).eq("parent_id", user.id).is("deleted_at", null).maybeSingle();
  if (!child) throw new HttpError(403, "not your child");
  return { userId: user.id, db, child };
}

export function handler(fn: (req: Request, body: Record<string, unknown>) => Promise<Response>) {
  return async (req: Request) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
    try {
      const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
      const res = await fn(req, body);
      Object.entries(cors).forEach(([k, v]) => res.headers.set(k, v));
      return res;
    } catch (e) {
      const status = e instanceof HttpError ? e.status : 500;
      const res = json({ error: e instanceof Error ? e.message : String(e) }, status);
      Object.entries(cors).forEach(([k, v]) => res.headers.set(k, v));
      return res;
    }
  };
}

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export const todayOf = (body: Record<string, unknown>) =>
  typeof body.today === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.today) ? body.today : new Date().toISOString().slice(0, 10);
