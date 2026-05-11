import { StaticStars } from "@/components/stars";
import { ArrowDown, ArrowUp, Minus } from "@/components/icons";
import type { ItemStat } from "@/lib/queries";

export function ItemsTable({ items }: { items: ItemStat[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="mt-4 w-full text-left text-sm">
        <thead className="eyebrow text-stone">
          <tr className="border-b border-ink/15">
            <th className="py-3 pr-4 font-medium">Item</th>
            <th className="py-3 pr-4 font-medium">Category</th>
            <th className="py-3 pr-4 font-medium text-right">★ 30d</th>
            <th className="py-3 pr-4 font-medium text-right">N</th>
            <th className="py-3 pr-4 font-medium text-right">★ 7d</th>
            <th className="py-3 font-medium text-right">Δ vs prior 7d</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr
              key={it.id}
              className="border-b border-ink/10 hover:bg-mist/40"
            >
              <td className="py-3 pr-4">
                <div className="display text-lg leading-tight">{it.name}</div>
              </td>
              <td className="py-3 pr-4 text-stone">{it.category}</td>
              <td className="py-3 pr-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <StaticStars value={it.avg} size="xs" />
                  <span className="tnum">{it.avg.toFixed(2)}</span>
                </div>
              </td>
              <td className="py-3 pr-4 text-right tnum text-stone">
                {it.count}
              </td>
              <td className="py-3 pr-4 text-right tnum">
                {it.avgLastWeek != null ? it.avgLastWeek.toFixed(2) : "—"}
                <span className="text-stone/70 ml-1 text-xs">
                  /{it.countLastWeek}
                </span>
              </td>
              <td className="py-3 text-right">
                <TrendBadge delta={it.trendDelta} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TrendBadge({ delta }: { delta: number | null }) {
  if (delta == null) {
    return (
      <span className="inline-flex items-center gap-1 text-stone/60">
        <Minus className="h-3 w-3" />
        —
      </span>
    );
  }
  if (Math.abs(delta) < 0.1) {
    return (
      <span className="inline-flex items-center gap-1 text-stone">
        <Minus className="h-3 w-3" />
        flat
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
      {delta.toFixed(2)}
    </span>
  );
}
