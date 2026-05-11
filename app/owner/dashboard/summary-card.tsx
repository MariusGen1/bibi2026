"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Refresh, Sparkle } from "@/components/icons";
import type { WeeklySummary } from "@/lib/types";

export function SummaryCard({
  issueNo,
  restaurantSlug,
}: {
  issueNo: number;
  restaurantSlug: string;
}) {
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: restaurantSlug }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      const json = (await res.json()) as WeeklySummary;
      setSummary(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="relative border border-ink/15 bg-mist/40 p-6 sm:p-10">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkle className="h-4 w-4 text-saffron" />
          <span className="eyebrow">
            Bibi Weekly · Issue No. <span className="tnum">{issueNo}</span>
          </span>
        </div>
        <span className="eyebrow tnum opacity-70">
          {summary
            ? format(new Date(summary.generated_at), "MMM d, h:mm a")
            : "not yet written"}
        </span>
      </header>
      <div className="rule mt-3" />

      {!summary && !loading && (
        <EmptyState onGenerate={generate} />
      )}
      {loading && <LoadingState />}
      {error && !loading && (
        <div className="mt-8">
          <p className="text-sm text-tomato">{error}</p>
          <button
            onClick={generate}
            className="mt-4 inline-flex items-center gap-2 border border-ink/25 px-4 py-2 text-sm hover:bg-ink hover:text-paper"
          >
            <Refresh className="h-3.5 w-3.5" />
            Try again
          </button>
        </div>
      )}
      {summary && !loading && (
        <SummaryBody summary={summary} onRegenerate={generate} />
      )}
    </article>
  );
}

function EmptyState({ onGenerate }: { onGenerate: () => void }) {
  return (
    <div className="mt-6 grid grid-cols-12 items-center gap-8">
      <div className="col-span-12 sm:col-span-7">
        <h2 className="display text-4xl sm:text-5xl">
          What does <span className="display-italic">this week</span> say?
        </h2>
        <p className="mt-4 max-w-lg text-stone">
          Bibi reads every comment and rating from the last 30 days, ranks the
          three problems most worth fixing, the two dishes carrying the room,
          and the one trend nobody&#39;s noticed yet. Takes about five
          seconds.
        </p>
      </div>
      <div className="col-span-12 sm:col-span-5 sm:text-right">
        <button
          onClick={onGenerate}
          className="group inline-flex items-center gap-2 bg-ink px-6 py-4 text-paper hover:bg-tomato transition-colors"
        >
          <Sparkle className="h-4 w-4 text-saffron group-hover:text-paper" />
          <span>Write this week&#39;s summary</span>
        </button>
        <p className="eyebrow mt-3 opacity-70">Powered by Claude Opus 4.7</p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="mt-10 flex flex-col items-center gap-5 py-12">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-ink/15 border-t-tomato" />
        <Sparkle className="absolute inset-0 m-auto h-5 w-5 text-saffron" />
      </div>
      <p className="display-italic text-xl text-stone">
        Reading every comment…
      </p>
      <p className="eyebrow opacity-70">This usually takes 4–8 seconds</p>
    </div>
  );
}

function SummaryBody({
  summary,
  onRegenerate,
}: {
  summary: WeeklySummary;
  onRegenerate: () => void;
}) {
  return (
    <div className="mt-7">
      <div className="grid grid-cols-12 gap-8">
        {/* fix */}
        <div className="col-span-12 sm:col-span-7">
          <div className="eyebrow text-tomato flex items-center gap-2">
            <span className="numeral text-base leading-none">●</span>
            Fix this week
          </div>
          <ol className="mt-3 space-y-4">
            {summary.fix.map((f, i) => (
              <li key={i} className="flex gap-3">
                <span className="numeral text-lg leading-tight">
                  {String(i + 1).padStart(2, "0")}.
                </span>
                <div>
                  <div className="display text-xl leading-snug">
                    {f.title}
                  </div>
                  <div className="text-stone mt-1 text-[15px] leading-relaxed">
                    {f.detail}
                  </div>
                  {f.item && (
                    <div className="eyebrow mt-1 opacity-70">
                      → {f.item}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* working + trend */}
        <div className="col-span-12 sm:col-span-5 space-y-7">
          <div>
            <div className="eyebrow text-olive flex items-center gap-2">
              <span className="numeral text-base leading-none">●</span>
              Working
            </div>
            <ol className="mt-3 space-y-4">
              {summary.working.map((w, i) => (
                <li key={i} className="flex gap-3">
                  <span className="numeral text-base leading-tight">
                    {String(i + 1).padStart(2, "0")}.
                  </span>
                  <div>
                    <div className="display text-lg leading-snug">
                      {w.title}
                    </div>
                    <div className="text-stone mt-0.5 text-[14px] leading-relaxed">
                      {w.detail}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <div className="eyebrow flex items-center gap-2 opacity-80">
              <span className="numeral text-base leading-none">●</span>
              Trend
            </div>
            <div className="mt-3 border-l-2 border-ink pl-4">
              <div className="display-italic text-lg leading-snug">
                {summary.trend.title}
              </div>
              <div className="text-stone mt-1 text-[14px] leading-relaxed">
                {summary.trend.detail}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rule mt-8" />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <span className="eyebrow opacity-70">
          Read across{" "}
          <span className="tnum">{summary.total_submissions}</span> submissions
          · {summary.period_days} days
        </span>
        <button
          onClick={onRegenerate}
          className="inline-flex items-center gap-2 text-sm text-stone hover:text-ink"
        >
          <Refresh className="h-3.5 w-3.5" />
          Regenerate
        </button>
      </div>
    </div>
  );
}
