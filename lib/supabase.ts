import { createClient, type SupabaseClientOptions } from "@supabase/supabase-js";
import WebSocket from "ws";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

// Node 20 doesn't have a global WebSocket and @supabase/realtime-js
// constructs its client eagerly. We never use realtime, but we still need
// to hand it a transport so the constructor doesn't throw.
const baseOptions: SupabaseClientOptions<"public"> = {
  auth: { persistSession: false },
  realtime: { transport: WebSocket as unknown as typeof globalThis.WebSocket },
};

/**
 * Server-side client with the service role key. Use ONLY from server-side
 * code (route handlers, server actions, server components). Never expose
 * this client to the browser.
 */
export function supabaseAdmin() {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    baseOptions
  );
}

/**
 * Public anon client. Safe for the browser but we mostly use the admin
 * client server-side in this project (no per-user RLS yet).
 */
export function supabasePublic() {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    baseOptions
  );
}
