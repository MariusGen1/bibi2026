import { supabaseAdmin } from "./supabase";
import type {
  MenuItem,
  Restaurant,
  SubmissionWithItems,
} from "./types";

export async function getRestaurantBySlug(
  slug: string
): Promise<Restaurant | null> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("restaurants")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getMenuItems(restaurantId: string): Promise<MenuItem[]> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("menu_items")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .eq("active", true)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getRecentSubmissions(
  restaurantId: string,
  days = 60
): Promise<SubmissionWithItems[]> {
  const sb = supabaseAdmin();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await sb
    .from("submissions")
    .select(
      `*, item_feedback ( *, menu_item:menu_items ( id, name, category ) )`
    )
    .eq("restaurant_id", restaurantId)
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as SubmissionWithItems[];
}

export type ItemStat = {
  id: string;
  name: string;
  category: string;
  avg: number;
  count: number;
  avgLastWeek: number | null;
  countLastWeek: number;
  avgPriorWeek: number | null;
  countPriorWeek: number;
  trendDelta: number | null; // last7 vs prior7
};

export function rollupItemStats(
  submissions: SubmissionWithItems[]
): ItemStat[] {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const last7 = now - 7 * day;
  const prior7 = now - 14 * day;

  const buckets = new Map<
    string,
    {
      id: string;
      name: string;
      category: string;
      ratings30: number[];
      ratings7: number[];
      ratingsPrior7: number[];
    }
  >();

  for (const sub of submissions) {
    const ts = new Date(sub.created_at).getTime();
    for (const f of sub.item_feedback) {
      const key = f.menu_item.id;
      const b = buckets.get(key) ?? {
        id: f.menu_item.id,
        name: f.menu_item.name,
        category: f.menu_item.category,
        ratings30: [],
        ratings7: [],
        ratingsPrior7: [],
      };
      b.ratings30.push(f.rating);
      if (ts >= last7) b.ratings7.push(f.rating);
      else if (ts >= prior7) b.ratingsPrior7.push(f.rating);
      buckets.set(key, b);
    }
  }

  const avg = (xs: number[]) =>
    xs.length === 0 ? null : xs.reduce((a, b) => a + b, 0) / xs.length;

  const out: ItemStat[] = [];
  for (const b of buckets.values()) {
    const a30 = avg(b.ratings30);
    const a7 = avg(b.ratings7);
    const aP = avg(b.ratingsPrior7);
    out.push({
      id: b.id,
      name: b.name,
      category: b.category,
      avg: a30 ?? 0,
      count: b.ratings30.length,
      avgLastWeek: a7,
      countLastWeek: b.ratings7.length,
      avgPriorWeek: aP,
      countPriorWeek: b.ratingsPrior7.length,
      trendDelta: a7 != null && aP != null ? a7 - aP : null,
    });
  }

  out.sort((a, b) => b.count - a.count);
  return out;
}

export type OverallStats = {
  total: number;
  avg: number;
  last7: { total: number; avg: number | null };
  prior7: { total: number; avg: number | null };
};

export function rollupOverall(
  submissions: SubmissionWithItems[]
): OverallStats {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const last7Cut = now - 7 * day;
  const prior7Cut = now - 14 * day;

  let total = 0;
  let sum = 0;
  const last7: number[] = [];
  const prior7: number[] = [];

  for (const s of submissions) {
    total++;
    sum += s.overall_rating;
    const ts = new Date(s.created_at).getTime();
    if (ts >= last7Cut) last7.push(s.overall_rating);
    else if (ts >= prior7Cut) prior7.push(s.overall_rating);
  }

  const avg = (xs: number[]) =>
    xs.length === 0 ? null : xs.reduce((a, b) => a + b, 0) / xs.length;

  return {
    total,
    avg: total ? sum / total : 0,
    last7: { total: last7.length, avg: avg(last7) },
    prior7: { total: prior7.length, avg: avg(prior7) },
  };
}
