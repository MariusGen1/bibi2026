"use server";

import { redirect } from "next/navigation";
import { ownerPassword, setOwnerLoggedIn, clearOwnerLogin } from "@/lib/owner-auth";

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "").trim();
  if (password !== ownerPassword()) {
    redirect("/owner?e=1");
  }
  await setOwnerLoggedIn();
  redirect("/owner/dashboard");
}

export async function logoutAction() {
  await clearOwnerLogin();
  redirect("/owner");
}
