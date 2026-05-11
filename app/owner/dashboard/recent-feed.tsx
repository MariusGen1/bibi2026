import { formatDistanceToNow } from "date-fns";
import { StaticStars } from "@/components/stars";
import type { SubmissionWithItems } from "@/lib/types";

export function RecentFeed({
  submissions,
}: {
  submissions: SubmissionWithItems[];
}) {
  if (submissions.length === 0) {
    return (
      <p className="mt-6 text-stone">
        No feedback yet. Stick a QR on the bottom of the receipt.
      </p>
    );
  }
  return (
    <ul className="mt-4 space-y-6">
      {submissions.map((s) => (
        <li key={s.id} className="border-b border-ink/10 pb-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex items-center gap-3">
              <StaticStars value={s.overall_rating} size="sm" />
              <span className="display text-lg tnum">{s.overall_rating}</span>
              <span className="eyebrow opacity-70">overall</span>
            </div>
            <span className="eyebrow tnum opacity-70">
              {formatDistanceToNow(new Date(s.created_at), { addSuffix: true })}
            </span>
          </div>

          {s.overall_comment && (
            <p className="mt-2 display-italic text-lg leading-snug">
              &ldquo;{s.overall_comment}&rdquo;
            </p>
          )}

          {s.item_feedback.length > 0 && (
            <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {s.item_feedback.map((f) => (
                <li key={f.id} className="flex items-baseline gap-2 text-sm">
                  <StaticStars value={f.rating} size="xs" />
                  <span className="display text-[15px]">{f.menu_item.name}</span>
                  {f.comment && (
                    <span className="text-stone italic">
                      — &ldquo;{f.comment}&rdquo;
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}
