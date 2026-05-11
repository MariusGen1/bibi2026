"use server";

import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { discountMessage, sendSms, type SmsResult } from "@/lib/sms";
import { formatPhone, generateDiscountCode } from "@/lib/utils";

const Schema = z.object({
  restaurantId: z.string().uuid(),
  phone: z.string().min(7),
  overallRating: z.number().int().min(1).max(5),
  overallComment: z.string().max(2000).optional().nullable(),
  items: z
    .array(
      z.object({
        menuItemId: z.string().uuid(),
        rating: z.number().int().min(1).max(5),
        comment: z.string().max(1000).optional().nullable(),
      })
    )
    .min(1)
    .max(20),
});

export type SubmitResult =
  | {
      ok: true;
      code: string;
      discountPct: number;
      sms: SmsResult;
    }
  | { ok: false; error: string };

export async function submitFeedback(
  raw: unknown
): Promise<SubmitResult> {
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Some answers look off — please try again.",
    };
  }
  const data = parsed.data;
  const phoneE164 = formatPhone(data.phone);
  if (!phoneE164) {
    return {
      ok: false,
      error: "That phone number doesn't look right.",
    };
  }

  const sb = supabaseAdmin();

  const { data: rest, error: restErr } = await sb
    .from("restaurants")
    .select("id, name, discount_pct")
    .eq("id", data.restaurantId)
    .maybeSingle();
  if (restErr || !rest) {
    return { ok: false, error: "Restaurant not found." };
  }

  const code = generateDiscountCode();

  const { data: sub, error: subErr } = await sb
    .from("submissions")
    .insert({
      restaurant_id: rest.id,
      phone: phoneE164,
      overall_rating: data.overallRating,
      overall_comment: data.overallComment || null,
      discount_code: code,
    })
    .select()
    .single();
  if (subErr || !sub) {
    console.error(subErr);
    return { ok: false, error: "Could not save feedback. Try again." };
  }

  const fbRows = data.items.map((it) => ({
    submission_id: sub.id,
    menu_item_id: it.menuItemId,
    rating: it.rating,
    comment: it.comment || null,
  }));
  const { error: fbErr } = await sb.from("item_feedback").insert(fbRows);
  if (fbErr) {
    console.error(fbErr);
  }

  const sms = await sendSms(
    phoneE164,
    discountMessage({
      restaurantName: rest.name,
      code,
      discountPct: rest.discount_pct,
    })
  );

  return {
    ok: true,
    code,
    discountPct: rest.discount_pct,
    sms,
  };
}
