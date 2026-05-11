/**
 * Bibi seed — populates "Luigi's Trattoria" with ~12 menu items and
 * ~120 realistic submissions spread over the last 60 days, with planted
 * signal so the AI summary has something genuinely useful to surface
 * during the demo:
 *
 *   • Carbonara has slipped in the last 14 days — new line cook
 *     (was ★4.5 → recent ★3.0, "too salty", "bacon burnt")
 *   • Tiramisu is consistently ★5 but under-ordered (hidden gem)
 *   • Truffle Fries have cold-temperature complaints in last 7 days
 *   • Lasagna ratings are inconsistent (kitchen variability)
 *   • Branzino is ★4.7 but ordered rarely (push it)
 *   • Negroni gets praised in overall comments (bar program strength)
 *
 * Run with:
 *   npm run seed
 */

import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";
import { generateDiscountCode } from "../lib/utils";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
  realtime: { transport: WebSocket as unknown as typeof globalThis.WebSocket },
});

// ─── menu ────────────────────────────────────────────────────────────────
const MENU = [
  { name: "Bruschetta al Pomodoro",  category: "Antipasti", price_cents: 1200, description: "Heirloom tomato, garlic, basil, sea salt on grilled sourdough." },
  { name: "Burrata della Casa",      category: "Antipasti", price_cents: 1800, description: "Pugliese burrata, roasted peach, prosciutto di Parma." },
  { name: "Truffle Fries",           category: "Sides",     price_cents:  900, description: "Hand-cut potatoes, black truffle oil, pecorino, parsley." },
  { name: "Spaghetti alla Carbonara",category: "Pasta",     price_cents: 2400, description: "Guanciale, egg yolk, Pecorino Romano, cracked black pepper." },
  { name: "Cacio e Pepe",            category: "Pasta",     price_cents: 2200, description: "Tonnarelli, Pecorino Romano, telicherry pepper, finished tableside." },
  { name: "Lasagna della Nonna",     category: "Pasta",     price_cents: 2600, description: "Eight-hour ragù, béchamel, fior di latte, Parmigiano-Reggiano." },
  { name: "Margherita Pizza",        category: "Pizza",     price_cents: 1900, description: "San Marzano, fior di latte, basil, 90-second wood fire." },
  { name: "Pizza Diavola",           category: "Pizza",     price_cents: 2100, description: "Spicy soppressata, calabrian chili, fior di latte, honey drizzle." },
  { name: "Branzino al Forno",       category: "Mains",     price_cents: 3800, description: "Whole roasted branzino, fennel, Castelvetrano olives, lemon." },
  { name: "Bistecca Fiorentina",     category: "Mains",     price_cents: 5600, description: "32oz dry-aged porterhouse, rosemary, olive oil, sea salt." },
  { name: "Tiramisu",                category: "Dolci",     price_cents:  950, description: "Savoiardi, espresso, mascarpone, Marsala, cocoa." },
  { name: "Negroni",                 category: "Bar",       price_cents: 1400, description: "Equal parts gin, Campari, Carpano Antica, orange peel." },
];

// ─── narrative patterns ──────────────────────────────────────────────────
type Pattern = {
  itemName: string;
  // weight in random ordering bias (higher = more likely on a ticket)
  weight: number;
  // (rating, comment?) generators per "era"
  recent: () => { rating: number; comment?: string };  // last 14 days
  older:  () => { rating: number; comment?: string };  // 15-60 days ago
};

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const sometimes = (p: number) => Math.random() < p;
const intBetween = (lo: number, hi: number) =>
  lo + Math.floor(Math.random() * (hi - lo + 1));

const PATTERNS: Record<string, Pattern> = {
  "Spaghetti alla Carbonara": {
    itemName: "Spaghetti alla Carbonara",
    weight: 1.4,
    recent: () => {
      const r = pick([2, 3, 3, 3, 4]);
      const comment = pick([
        "Too salty tonight — couldn't finish it.",
        "Bacon was burnt, kind of bitter.",
        "Pasta was overcooked and oversalted.",
        "Not the carbonara I remember from here.",
        "Wayyy too salty. Used to be my favorite.",
        undefined, undefined,
      ]);
      return { rating: r, comment };
    },
    older: () => {
      const r = pick([4, 4, 5, 5, 5]);
      const comment = pick([
        "Perfect carbonara — silky, peppery, just right.",
        "Best in the neighborhood.",
        undefined, undefined, undefined,
      ]);
      return { rating: r, comment };
    },
  },
  Tiramisu: {
    itemName: "Tiramisu",
    weight: 0.4, // under-ordered
    recent: () => ({
      rating: pick([5, 5, 5, 4]),
      comment: pick([
        "The tiramisu was unreal. Order it.",
        "Best tiramisu I've had in NYC.",
        "Wish we'd known about the tiramisu earlier — incredible.",
        undefined,
      ]),
    }),
    older: () => ({
      rating: pick([5, 5, 5, 4]),
      comment: pick([
        "Tiramisu was the highlight of the meal.",
        "So good. Light, boozy, perfect.",
        undefined, undefined,
      ]),
    }),
  },
  "Truffle Fries": {
    itemName: "Truffle Fries",
    weight: 1.1,
    recent: () => {
      const cold = sometimes(0.5);
      if (cold) {
        return {
          rating: pick([2, 3, 3]),
          comment: pick([
            "Fries came out cold.",
            "Cold by the time they reached us.",
            "Soggy and lukewarm — flavor was great but temperature was off.",
            "Came cold again — third visit in a row.",
          ]),
        };
      }
      return { rating: pick([4, 4, 5]), comment: undefined };
    },
    older: () => ({
      rating: pick([4, 4, 5, 5]),
      comment: pick(["Fries are addictive.", undefined, undefined, undefined]),
    }),
  },
  "Lasagna della Nonna": {
    itemName: "Lasagna della Nonna",
    weight: 1.0,
    recent: () => {
      const r = pick([2, 3, 4, 4, 5]);
      const comment =
        r <= 3
          ? pick([
              "Lasagna was dry tonight.",
              "Cheese on top was burnt.",
              "Not as good as last time.",
            ])
          : pick(["Lasagna was outstanding.", undefined, undefined]);
      return { rating: r, comment };
    },
    older: () => {
      const r = pick([3, 4, 4, 5, 5]);
      return {
        rating: r,
        comment:
          r >= 5
            ? pick(["Lasagna was unreal.", undefined])
            : undefined,
      };
    },
  },
  "Branzino al Forno": {
    itemName: "Branzino al Forno",
    weight: 0.45,
    recent: () => ({
      rating: pick([5, 5, 4, 5]),
      comment: pick([
        "Branzino was perfect — crispy skin, lemony.",
        "The fish was the best thing on the table.",
        undefined,
      ]),
    }),
    older: () => ({
      rating: pick([5, 4, 5, 5]),
      comment: pick(["Branzino is special.", undefined, undefined]),
    }),
  },
};

const DEFAULT_PATTERN = (name: string): Pattern => ({
  itemName: name,
  weight: 1.0,
  recent: () => ({
    rating: pick([3, 4, 4, 5, 5]),
    comment: sometimes(0.18)
      ? pick(["Great.", "Loved it.", "Good but not memorable.", "Tasty."])
      : undefined,
  }),
  older: () => ({
    rating: pick([4, 4, 4, 5, 5]),
    comment: sometimes(0.12)
      ? pick(["Solid.", "Loved it.", "Will order again."])
      : undefined,
  }),
});

// ─── overall comments ────────────────────────────────────────────────────
const POS_OVERALL = [
  "Beautiful evening — service was warm, food was honest.",
  "Felt like being in Rome. We'll be back.",
  "Vinyl on the speakers, candles, the works. Loved it.",
  "Marco at the bar made the best negroni I've ever had.",
  "Hidden gem. Tell everyone except your enemies.",
  "Negronis were exactly right. Killer bar program.",
  "Anniversary dinner — they comp'd a tiramisu. Class act.",
];
const NEG_OVERALL = [
  "Service was slow tonight, food took 45 min after antipasti.",
  "Loud — couldn't hear the table.",
  "Waited 20 min for the check at the end.",
  "Server forgot our wine order.",
  "Bathrooms need attention.",
];
const MIX_OVERALL = [
  "Food was great, service a bit scattered.",
  "Loved the wine list — kitchen was uneven.",
  "Vibe is incredible, food is hit-or-miss this month.",
];

// ─── helpers ─────────────────────────────────────────────────────────────
function daysAgo(d: number): Date {
  const now = new Date();
  now.setDate(now.getDate() - d);
  // jitter into evening dinner hours
  now.setHours(intBetween(18, 22), intBetween(0, 59), intBetween(0, 59), 0);
  return now;
}

async function main() {
  console.log("[seed] Wiping old data…");
  // delete in dependency order
  await supabase.from("item_feedback").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("submissions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("menu_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("restaurants").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  console.log("[seed] Inserting restaurant…");
  const { data: rest, error: restErr } = await supabase
    .from("restaurants")
    .insert({
      slug: "luigis",
      name: "Luigi's Trattoria",
      tagline: "A neighborhood Italian, since 1987.",
      city: "Brooklyn, NY",
      discount_pct: 10,
    })
    .select()
    .single();
  if (restErr || !rest) throw restErr;

  console.log("[seed] Inserting menu…");
  const menuRows = MENU.map((m, idx) => ({
    ...m,
    restaurant_id: rest.id,
    display_order: idx,
  }));
  const { data: items, error: itemsErr } = await supabase
    .from("menu_items")
    .insert(menuRows)
    .select();
  if (itemsErr || !items) throw itemsErr;

  const byName = new Map(items.map((i) => [i.name, i]));

  console.log("[seed] Generating ~120 submissions across 60 days…");
  const NUM = 120;
  let inserted = 0;

  for (let i = 0; i < NUM; i++) {
    // bias more toward recent days so weekly trends are visible
    const day =
      Math.random() < 0.55
        ? intBetween(0, 13)
        : intBetween(14, 59);
    const created = daysAgo(day);
    const isRecent = day < 14;

    // ticket size 1–4 items
    const ticketSize = pick([1, 2, 2, 3, 3, 4]);
    const ordered = new Set<string>();
    // weighted draw
    const pool = MENU.flatMap((m) => {
      const p = PATTERNS[m.name] ?? DEFAULT_PATTERN(m.name);
      const reps = Math.max(1, Math.round(p.weight * 10));
      return Array(reps).fill(m.name);
    });
    while (ordered.size < ticketSize) ordered.add(pick(pool));

    const itemRows: { menu_item_id: string; rating: number; comment: string | null; created_at: string }[] = [];
    const ratings: number[] = [];
    for (const name of ordered) {
      const pat = PATTERNS[name] ?? DEFAULT_PATTERN(name);
      const { rating, comment } = isRecent ? pat.recent() : pat.older();
      ratings.push(rating);
      itemRows.push({
        menu_item_id: byName.get(name)!.id,
        rating,
        comment: comment ?? null,
        created_at: created.toISOString(),
      });
    }

    // overall rating roughly tracks item average ± noise
    const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    const overall = Math.max(1, Math.min(5, Math.round(avg + (Math.random() - 0.5) * 0.6)));

    let overallComment: string | null = null;
    const r = Math.random();
    if (overall >= 4 && r < 0.45) overallComment = pick(POS_OVERALL);
    else if (overall <= 3 && r < 0.55) overallComment = pick(NEG_OVERALL);
    else if (r < 0.15) overallComment = pick(MIX_OVERALL);

    const { data: sub, error: subErr } = await supabase
      .from("submissions")
      .insert({
        restaurant_id: rest.id,
        phone: null,
        overall_rating: overall,
        overall_comment: overallComment,
        discount_code: generateDiscountCode(),
        created_at: created.toISOString(),
      })
      .select()
      .single();
    if (subErr || !sub) throw subErr;

    const fbRows = itemRows.map((row) => ({
      ...row,
      submission_id: sub.id,
    }));
    const { error: fbErr } = await supabase.from("item_feedback").insert(fbRows);
    if (fbErr) throw fbErr;

    inserted++;
    if (inserted % 20 === 0) console.log(`  …${inserted}/${NUM}`);
  }

  console.log(`[seed] Done. ${inserted} submissions across Luigi's.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
