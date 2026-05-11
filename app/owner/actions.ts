"use server";

import { redirect } from "next/navigation";
import { verifyOwnerPassword, setOwnerLoggedIn, clearOwnerLogin } from "@/lib/owner-auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function loginAction(formData: FormData) {
  const ip = await clientIp();
  const rl = rateLimit(`login:${ip}`, 5, 60_000);
  if (!rl.ok) {
    redirect("/owner?e=rate");
  }
  const password = String(formData.get("password") ?? "").trim();
  if (!verifyOwnerPassword(password)) {
    redirect("/owner?e=1");
  }
  await setOwnerLoggedIn();
  redirect("/owner/dashboard");
}

export async function logoutAction() {
  await clearOwnerLogin();
  redirect("/owner");
}
