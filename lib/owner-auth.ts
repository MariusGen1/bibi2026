import { cookies } from "next/headers";

const COOKIE = "bibi_owner";
const SLUG = "luigis";

export async function isOwnerLoggedIn(): Promise<boolean> {
  const c = await cookies();
  return c.get(COOKIE)?.value === SLUG;
}

export async function setOwnerLoggedIn() {
  const c = await cookies();
  c.set(COOKIE, SLUG, {
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

export function ownerPassword(): string {
  return process.env.OWNER_DEMO_PASSWORD ?? "luigi";
}
