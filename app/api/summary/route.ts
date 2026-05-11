import { NextResponse } from "next/server";
import { generateWeeklySummary } from "@/lib/claude";
import {
  getRecentSubmissions,
  getRestaurantBySlug,
  rollupItemStats,
} from "@/lib/queries";
import { isOwnerLoggedIn } from "@/lib/owner-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!(await isOwnerLoggedIn())) {
    return NextResponse.json({ error: "not authenticated" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as { slug?: string };
  const slug = body.slug ?? "luigis";

  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) {
    return NextResponse.json({ error: "restaurant not found" }, { status: 404 });
  }

  const submissions = await getRecentSubmissions(restaurant.id, 30);
  if (submissions.length === 0) {
    return NextResponse.json({
      generated_at: new Date().toISOString(),
      period_days: 30,
      total_submissions: 0,
      fix: [],
      working: [],
      trend: {
        title: "No data yet",
        detail: "Bibi needs a few submissions before it has anything to say.",
      },
    });
  }

  const itemStats = rollupItemStats(submissions);
  try {
    const summary = await generateWeeklySummary({
      restaurantName: restaurant.name,
      submissions,
      periodDays: 30,
      itemStats: itemStats.map((s) => ({
        name: s.name,
        category: s.category,
        avg: s.avg,
        count: s.count,
        avgLastWeek: s.avgLastWeek,
        countLastWeek: s.countLastWeek,
        avgPriorWeek: s.avgPriorWeek,
        countPriorWeek: s.countPriorWeek,
      })),
    });
    return NextResponse.json(summary);
  } catch (err) {
    console.error("[summary] generation failed", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Bibi couldn't write the summary: ${message}` },
      { status: 500 }
    );
  }
}
