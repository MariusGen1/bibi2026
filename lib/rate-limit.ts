import { headers } from "next/headers";

type Bucket = { count: number; resetAt: number };
const store = new Map<string, Bucket>();

export async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip") ?? "local";
}

export type RateLimitResult = { ok: boolean; retryAfterSec: number };

// In-memory token bucket keyed by `${route}:${ip}`. Single-process only —
// fine for one Vercel function, swap to Upstash before scaling out.
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  maybeGc();
  const now = Date.now();
  const b = store.get(key);
  if (!b || b.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }
  if (b.count >= limit) {
    return { ok: false, retryAfterSec: Math.ceil((b.resetAt - now) / 1000) };
  }
  b.count += 1;
  return { ok: true, retryAfterSec: 0 };
}

let lastGc = 0;
function maybeGc() {
  const now = Date.now();
  if (now - lastGc < 60_000) return;
  lastGc = now;
  for (const [k, v] of store) {
    if (v.resetAt <= now) store.delete(k);
  }
}
