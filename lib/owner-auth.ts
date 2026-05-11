import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE = "bibi_session";
const SLUG = "luigis";

function sessionSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set in production (>=16 chars)");
  }
  return "bibi-dev-secret-change-me-please";
}

function sign(value: string): string {
  return createHmac("sha256", sessionSecret()).update(value).digest("hex");
}

export async function isOwnerLoggedIn(): Promise<boolean> {
  const c = await cookies();
  const raw = c.get(COOKIE)?.value;
  if (!raw) return false;
  const dot = raw.indexOf(".");
  if (dot <= 0) return false;
  const slug = raw.slice(0, dot);
  const mac = raw.slice(dot + 1);
  if (slug !== SLUG) return false;
  const expected = sign(slug);
  if (mac.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(mac, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

export async function setOwnerLoggedIn() {
  const c = await cookies();
  c.set(COOKIE, `${SLUG}.${sign(SLUG)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function clearOwnerLogin() {
  const c = await cookies();
  c.delete(COOKIE);
}

export function verifyOwnerPassword(input: string): boolean {
  const expected = process.env.OWNER_DEMO_PASSWORD ?? "luigi";
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
