import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  getRecentSubmissions,
  getRestaurantBySlug,
  rollupItemStats,
  rollupOverall,
} from "@/lib/queries";
import { isOwnerLoggedIn } from "@/lib/owner-auth";
import { logoutAction } from "../actions";
import { SummaryCard } from "./summary-card";
import { ItemsTable } from "./items-table";
import { RecentFeed } from "./recent-feed";
import { StaticStars } from "@/components/stars";
import { ArrowUp, ArrowDown, Minus } from "@/components/icons";

export const dynamic = "force-dynamic";

const SLUG = "luigis";

export default async function Dashboard() {
  if (!(await isOwnerLoggedIn())) {
    redirect("/owner");
  }

  const restaurant = await getRestaurantBySlug(SLUG);
  if (!restaurant) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-20">
        <p>
          No restaurant seeded. Run <code>npm run seed</code>.
        </p>
      </main>
    );
  }

  const submissions = await getRecentSubmissions(restaurant.id, 60);
  const itemStats = rollupItemStats(submissions);
  const overall = rollupOverall(submissions);
  const nowMs = new Date().getTime();
  const issueNo = Math.max(
    1,
    Math.floor(
      (nowMs - new Date(restaurant.created_at).getTime()) /
        (7 * 24 * 60 * 60 * 1000)
    )
  );

  const last7Delta =
    overall.last7.avg != null && overall.prior7.avg != null
      ? overall.last7.avg - overall.prior7.avg
      : null;

  return (
    <main className="mx-auto max-w-6xl px-6 py-8 sm:py-12">
      {/* masthead */}
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <Link href="/" className="eyebrow hover:text-ink">Bibi</Link>
          <span className="eyebrow mx-2 opacity-50">/</span>
          <span className="eyebrow text-ink">{restaurant.name}</span>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="eyebrow text-stone hover:text-tomato"
          >
            Log out
          </button>
        </form>
      </header>
      <div className="rule mt-3" />

      {/* hero — the AI summary */}
      <section className="mt-8 sm:mt-10">
        <SummaryCard issueNo={issueNo} restaurantSlug={SLUG} />
      </section>

      {/* KPI strip */}
      <section className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
        <Kpi
          label="Submissions · 60d"
          value={overall.total.toString()}
          sub={`${overall.last7.total} in last 7d`}
        />
        <Kpi
          label="Avg overall · 60d"
          value={overall.avg.toFixed(2)}
          renderSub={() => (
            <StaticStars value={overall.avg} size="xs" />
          )}
        />
        <Kpi
          label="Avg · last 7d"
          value={overall.last7.avg?.toFixed(2) ?? "—"}
          renderSub={() => <TrendDelta delta={last7Delta} suffix="vs prior 7d" />}
        />
        <Kpi
          label="Items rated"
          value={itemStats.length.toString()}
          sub={`${itemStats.reduce((a, s) => a + s.count, 0)} ratings logged`}
        />
      </section>

      {/* item table */}
      <section className="mt-14">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="eyebrow">The menu, by the numbers</div>
            <h2 className="display mt-1 text-3xl sm:text-4xl">
              Item-level <span className="display-italic">scoreboard</span>
            </h2>
          </div>
          <span className="eyebrow opacity-70 tnum">
            {format(new Date(), "MMM d, yyyy")}
          </span>
        </div>
        <div className="rule mt-3" />
        <ItemsTable items={itemStats} />
      </section>

      {/* recent feedback */}
      <section className="mt-16 mb-20">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="eyebrow">Latest entries</div>
            <h2 className="display mt-1 text-3xl sm:text-4xl">
              Off the <span className="display-italic">floor</span>
            </h2>
          </div>
          <span className="eyebrow opacity-70 tnum">
            {Math.min(submissions.length, 20)} of {submissions.length}
          </span>
        </div>
        <div className="rule mt-3" />
        <RecentFeed submissions={submissions.slice(0, 20)} />
      </section>
    </main>
  );
}

function Kpi({
  label,
  value,
  sub,
  renderSub,
}: {
  label: string;
  value: string;
  sub?: string;
  renderSub?: () => React.ReactNode;
}) {
  return (
    <div className="border-t border-ink/15 pt-4">
      <div className="eyebrow">{label}</div>
      <div className="display mt-2 text-4xl sm:text-5xl tnum">{value}</div>
      <div className="mt-2 text-sm text-stone">
        {renderSub ? renderSub() : sub}
      </div>
    </div>
  );
}

function TrendDelta({
  delta,
  suffix,
}: {
  delta: number | null;
  suffix: string;
}) {
  if (delta == null) {
    return (
      <span className="inline-flex items-center gap-1 text-stone">
        <Minus className="h-3 w-3" />
        not enough data
      </span>
    );
  }
  if (Math.abs(delta) < 0.05) {
    return (
      <span className="inline-flex items-center gap-1 text-stone">
        <Minus className="h-3 w-3" />
        flat {suffix}
      </span>
    );
  }
  const up = delta > 0;
  return (
    <span
      className={`inline-flex items-center gap-1 tnum ${
        up ? "text-olive" : "text-tomato"
      }`}
    >
      {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {delta > 0 ? "+" : ""}
      {delta.toFixed(2)} {suffix}
    </span>
  );
}
