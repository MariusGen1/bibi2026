import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { randomInt } from "node:crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateDiscountCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += alphabet[randomInt(0, alphabet.length)];
  }
  return code;
}

export function formatPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.length >= 8 && raw.trim().startsWith("+")) return `+${digits}`;
  return null;
}
