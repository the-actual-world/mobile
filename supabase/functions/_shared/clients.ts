import { createClient as createSupabaseClient } from "supabase";
import type { Database } from "./supabase.ts";

export function createClient(
  type: "normal",
  req: Request,
): ReturnType<typeof createSupabaseNormal>;
export function createClient(
  type: "admin",
): ReturnType<typeof createSupabaseAdmin>;

export function createClient(type: "normal" | "admin", req?: Request) {
  if (type === "normal") {
    if (!req) {
      throw new Error("Request is required for normal clients.");
    }
    return createSupabaseNormal(req);
  } else {
    return createSupabaseAdmin();
  }
}

function createSupabaseNormal(req: Request) {
  return createSupabaseClient<Database>(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    },
  );
}

function createSupabaseAdmin() {
  return createSupabaseClient<Database>(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    },
  );
}
