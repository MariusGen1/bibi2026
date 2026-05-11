"use client";

import { useMemo, useState, useTransition } from "react";
import type { MenuItem, Restaurant } from "@/lib/types";
import { StarRow } from "@/components/stars";
import { ArrowLeft, ArrowRight, Check, Phone, Sparkle } from "@/components/icons";
import { submitFeedback, type SubmitResult } from "./actions";
import { cn } from "@/lib/utils";

type Step = "pick" | "rate" | "overall" | "contact" | "done";

const ROMAN = ["I", "II", "III", "IV", "V"] as const;

export function FeedbackFlow({
  restaurant,
  menu,
}: {
  restaurant: Restaurant;
  menu: MenuItem[];
}) {
  const [step, setStep] = useState<Step>("pick");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [ratings, setRatings] = useState<
    Record<string, { rating: number; comment: string }>
  >({});
  const [overall, setOverall] = useState<number>(0);
  const [overallComment, setOverallComment] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [pending, startTransition] = useTransition();

  const pickedItems = useMemo(
    () => menu.filter((m) => picked.has(m.id)),
    [menu, picked]
  );

  // Categories with simple grouping for the pick step
  const byCategory = useMemo(() => {
    const m = new Map<string, MenuItem[]>();
    for (const item of menu) {
      const arr = m.get(item.category) ?? [];
      arr.push(item);
      m.set(item.category, arr);
    }
    return Array.from(m.entries());
  }, [menu]);

  const stepIdx = ["pick", "rate", "overall", "contact"].indexOf(step);

  function continueFromPick() {
    if (picked.size === 0) {
      setError("Pick at least one thing you ordered.");
      return;
    }
    // seed ratings for picked items
    setRatings((prev) => {
      const next = { ...prev };
      for (const id of picked) {
        if (!next[id]) next[id] = { rating: 0, comment: "" };
      }
      return next;
    });
    setError(null);
    setStep("rate");
  }

  function continueFromRate() {
    for (const id of picked) {
      const r = ratings[id]?.rating ?? 0;
      if (r < 1) {
        setError("Give each item a rating before moving on.");
        return;
      }
    }
    setError(null);
    setStep("overall");
  }

  function continueFromOverall() {
    if (overall < 1) {
      setError("Rate the overall experience.");
      return;
    }
    setError(null);
    setStep("contact");
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const payload = {
        restaurantId: restaurant.id,
        phone,
        overallRating: overall,
        overallComment: overallComment.trim() || null,
        items: pickedItems.map((it) => ({
          menuItemId: it.id,
          rating: ratings[it.id]?.rating ?? 0,
          comment: ratings[it.id]?.comment?.trim() || null,
        })),
      };
      const r = await submitFeedback(payload);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setResult(r);
      setStep("done");
    });
  }

  if (step === "done" && result?.ok) {
    return <DonePanel restaurant={restaurant} result={result} />;
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col px-5 pb-32 pt-8 sm:pt-12">
      {/* masthead */}
      <header className="rise">
        <div className="eyebrow">Bibi · Feedback</div>
        <div className="rule mt-2" />
        <div className="mt-3 flex items-baseline justify-between gap-3">
          <h1 className="display text-3xl sm:text-4xl">{restaurant.name}</h1>
          <span className="eyebrow tnum">No. {dateStamp()}</span>
        </div>
        <p className="mt-1 text-sm text-stone italic font-display">
          {restaurant.tagline ?? restaurant.city}
        </p>
        <div className="rule mt-4" />
        <StepIndicator current={stepIdx} />
      </header>

      <section className="mt-8 flex-1">
        {step === "pick" && (
          <PickStep
            byCategory={byCategory}
            picked={picked}
            setPicked={setPicked}
          />
        )}
        {step === "rate" && (
          <RateStep
            items={pickedItems}
            ratings={ratings}
            setRatings={setRatings}
          />
        )}
        {step === "overall" && (
          <OverallStep
            overall={overall}
            setOverall={setOverall}
            comment={overallComment}
            setComment={setOverallComment}
          />
        )}
        {step === "contact" && (
          <ContactStep
            phone={phone}
            setPhone={setPhone}
            discountPct={restaurant.discount_pct}
          />
        )}
      </section>

      {error && (
        <p className="fixed inset-x-0 bottom-24 mx-auto w-fit max-w-[90%] rounded-sm bg-tomato px-3 py-2 text-sm text-paper shadow-lg">
          {error}
        </p>
      )}

      {/* sticky action bar */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-ink/15 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3 px-5 py-3">
          <button
            type="button"
            onClick={() => {
              setError(null);
              if (step === "rate") setStep("pick");
              else if (step === "overall") setStep("rate");
              else if (step === "contact") setStep("overall");
            }}
            className={cn(
              "eyebrow flex items-center gap-1.5 px-2 py-2",
              step === "pick" && "invisible"
            )}
          >
            <ArrowLeft className="h-3 w-3" />
            Back
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (step === "pick") continueFromPick();
              else if (step === "rate") continueFromRate();
              else if (step === "overall") continueFromOverall();
              else if (step === "contact") submit();
            }}
            className={cn(
              "group inline-flex items-center gap-2 bg-ink px-5 py-3 text-paper",
              "text-sm tracking-wide hover:bg-tomato transition-colors",
              "disabled:opacity-60"
            )}
          >
            <span>
              {step === "contact"
                ? pending
                  ? "Sending…"
                  : "Send & get my code"
                : "Continue"}
            </span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </nav>
    </div>
  );
}

function dateStamp() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}.${String(
    d.getMonth() + 1
  ).padStart(2, "0")}`;
}

function StepIndicator({ current }: { current: number }) {
  const steps = ["Pick", "Rate", "Evening", "Code"];
  return (
    <ol className="mt-3 grid grid-cols-4 gap-2 text-center">
      {steps.map((s, i) => (
        <li
          key={s}
          className={cn(
            "eyebrow flex flex-col items-center gap-1.5 transition-opacity",
            i > current && "opacity-35"
          )}
        >
          <span className="numeral text-base leading-none">{ROMAN[i]}.</span>
          <span>{s}</span>
          <span
            className={cn(
              "h-px w-full",
              i <= current ? "bg-tomato" : "bg-ink/15"
            )}
          />
        </li>
      ))}
    </ol>
  );
}

// ─── steps ────────────────────────────────────────────────────────────────

function PickStep({
  byCategory,
  picked,
  setPicked,
}: {
  byCategory: [string, MenuItem[]][];
  picked: Set<string>;
  setPicked: (s: Set<string>) => void;
}) {
  function toggle(id: string) {
    const next = new Set(picked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setPicked(next);
  }
  return (
    <div className="rise">
      <h2 className="display text-[2.2rem] leading-[0.95]">
        What did you have <span className="display-italic">tonight?</span>
      </h2>
      <p className="mt-3 text-stone">
        Tap everything you ordered — we&#39;ll ask about each one next.
      </p>

      <div className="mt-8 space-y-8">
        {byCategory.map(([cat, items]) => (
          <div key={cat}>
            <div className="flex items-baseline justify-between">
              <span className="eyebrow">{cat}</span>
              <span className="eyebrow tnum opacity-60">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            </div>
            <div className="rule mt-2" />
            <ul className="mt-3 space-y-2">
              {items.map((item) => {
                const selected = picked.has(item.id);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => toggle(item.id)}
                      className={cn(
                        "group w-full text-left transition-colors",
                        "flex items-start gap-3 rounded-sm px-3 py-3",
                        selected
                          ? "bg-ink text-paper"
                          : "hover:bg-mist/70 active:bg-mist"
                      )}
                      aria-pressed={selected}
                    >
                      <span
                        className={cn(
                          "mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                          selected
                            ? "border-paper bg-paper text-ink"
                            : "border-ink/30 text-transparent"
                        )}
                      >
                        <Check className="h-3 w-3" />
                      </span>
                      <span className="flex-1">
                        <span className="flex items-baseline justify-between gap-3">
                          <span className="display text-lg">{item.name}</span>
                          <span
                            className={cn(
                              "tnum text-sm",
                              selected ? "text-paper/70" : "text-stone"
                            )}
                          >
                            ${(item.price_cents / 100).toFixed(0)}
                          </span>
                        </span>
                        {item.description && (
                          <span
                            className={cn(
                              "block text-sm leading-snug mt-0.5",
                              selected ? "text-paper/70" : "text-stone"
                            )}
                          >
                            {item.description}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {picked.size > 0 && (
        <p className="mt-8 text-sm text-stone">
          <span className="numeral">●</span> {picked.size} item
          {picked.size === 1 ? "" : "s"} selected
        </p>
      )}
    </div>
  );
}

function RateStep({
  items,
  ratings,
  setRatings,
}: {
  items: MenuItem[];
  ratings: Record<string, { rating: number; comment: string }>;
  setRatings: React.Dispatch<
    React.SetStateAction<Record<string, { rating: number; comment: string }>>
  >;
}) {
  return (
    <div className="rise">
      <h2 className="display text-[2.2rem] leading-[0.95]">
        How was <span className="display-italic">each one?</span>
      </h2>
      <p className="mt-3 text-stone">
        A star for each. Add a line if anything stood out — good or otherwise.
      </p>

      <ol className="mt-8 space-y-7">
        {items.map((item, idx) => {
          const cur = ratings[item.id] ?? { rating: 0, comment: "" };
          return (
            <li key={item.id}>
              <div className="flex items-baseline gap-3">
                <span className="numeral text-lg leading-none">
                  {String(idx + 1).padStart(2, "0")}.
                </span>
                <div className="flex-1">
                  <div className="display text-xl">{item.name}</div>
                  <div className="eyebrow opacity-70">{item.category}</div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <StarRow
                  value={cur.rating}
                  onChange={(n) =>
                    setRatings((p) => ({
                      ...p,
                      [item.id]: { ...cur, rating: n },
                    }))
                  }
                  size="lg"
                  ariaLabel={`Rating for ${item.name}`}
                />
              </div>
              <textarea
                value={cur.comment}
                onChange={(e) =>
                  setRatings((p) => ({
                    ...p,
                    [item.id]: { ...cur, comment: e.target.value },
                  }))
                }
                rows={2}
                placeholder="Optional — a line about this dish"
                className="mt-3 w-full resize-none border-b border-ink/20 bg-transparent pb-1 placeholder:text-stone/60 focus:border-tomato focus:outline-none"
              />
              <div className="rule mt-5" />
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function OverallStep({
  overall,
  setOverall,
  comment,
  setComment,
}: {
  overall: number;
  setOverall: (n: number) => void;
  comment: string;
  setComment: (s: string) => void;
}) {
  return (
    <div className="rise">
      <h2 className="display text-[2.2rem] leading-[0.95]">
        And the <span className="display-italic">evening overall?</span>
      </h2>
      <p className="mt-3 text-stone">
        Service, vibe, the works — anything not about a single dish.
      </p>

      <div className="mt-10 flex items-center gap-3">
        <StarRow
          value={overall}
          onChange={setOverall}
          size="lg"
          ariaLabel="Overall rating"
        />
        {overall > 0 && (
          <span className="display text-3xl tnum text-tomato">{overall}</span>
        )}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={5}
        placeholder="Anything to add? (server, music, wait time, the bathroom situation…)"
        className="mt-8 w-full resize-none border-b border-ink/20 bg-transparent pb-2 placeholder:text-stone/60 focus:border-tomato focus:outline-none"
      />
    </div>
  );
}

function ContactStep({
  phone,
  setPhone,
  discountPct,
}: {
  phone: string;
  setPhone: (s: string) => void;
  discountPct: number;
}) {
  return (
    <div className="rise">
      <h2 className="display text-[2.2rem] leading-[0.95]">
        Where do we <span className="display-italic">send your code?</span>
      </h2>
      <p className="mt-3 text-stone">
        We&#39;ll text you {discountPct}% off your next visit. One message, no spam,
        no marketing list — pinky swear.
      </p>

      <div className="mt-10 flex items-center gap-3 border-b border-ink/30 pb-2">
        <Phone className="h-5 w-5 text-stone" />
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(555) 123-4567"
          className="flex-1 bg-transparent text-lg tnum placeholder:text-stone/50 focus:outline-none"
        />
      </div>

      <p className="eyebrow mt-6 opacity-70">
        By submitting you agree to receive one SMS with your discount code.
      </p>
    </div>
  );
}

function DonePanel({
  restaurant,
  result,
}: {
  restaurant: Restaurant;
  result: Extract<SubmitResult, { ok: true }>;
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-5 py-12 text-center">
      <div className="rise w-full">
        <div className="eyebrow">Grazie</div>
        <div className="rule mt-3" />
        <h1 className="display mt-6 text-5xl sm:text-6xl">
          That&#39;s <span className="display-italic">on us.</span>
        </h1>
        <p className="mt-6 text-stone">
          We sent your code to your phone, but here&#39;s a copy:
        </p>

        <div className="mt-8 inline-flex flex-col items-center gap-2 border border-ink/20 bg-mist/60 px-10 py-8">
          <span className="eyebrow">{result.discountPct}% off · one use</span>
          <span className="display text-5xl tracking-[0.15em] tnum text-tomato">
            {result.code}
          </span>
          <span className="eyebrow opacity-70">Valid 30 days</span>
        </div>

        {result.sms.mode === "mocked" && (
          <div className="mt-8 mx-auto max-w-md border border-dashed border-ink/25 p-4 text-left">
            <div className="eyebrow flex items-center gap-2">
              <Sparkle className="h-3 w-3 text-saffron" />
              Demo · simulated SMS
            </div>
            <p className="mt-2 text-sm text-stone whitespace-pre-wrap">
              {result.sms.preview}
            </p>
          </div>
        )}
        {result.sms.mode === "error" && (
          <p className="mt-6 text-sm text-tomato">
            We saved your feedback, but the text didn&#39;t go through. Show this
            screen at the counter.
          </p>
        )}

        <p className="mt-12 text-sm text-stone">
          See you again at <span className="font-display italic">{restaurant.name}</span>.
        </p>
      </div>
    </div>
  );
}
