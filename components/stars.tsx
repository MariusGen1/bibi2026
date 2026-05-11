"use client";

import { useState } from "react";
import { Star } from "./icons";
import { cn } from "@/lib/utils";

export function StarRow({
  value,
  onChange,
  size = "md",
  ariaLabel,
}: {
  value: number;
  onChange: (n: number) => void;
  size?: "md" | "lg";
  ariaLabel?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;
  const cls =
    size === "lg" ? "h-10 w-10 sm:h-11 sm:w-11" : "h-7 w-7 sm:h-8 sm:w-8";
  return (
    <div
      className="flex items-center gap-1.5"
      role="radiogroup"
      aria-label={ariaLabel}
      onMouseLeave={() => setHover(null)}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = display >= n;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
            onMouseEnter={() => setHover(n)}
            onFocus={() => setHover(n)}
            onBlur={() => setHover(null)}
            onClick={() => onChange(n)}
            className={cn(
              "star-btn transition-colors",
              filled ? "text-tomato" : "text-ink/25 hover:text-ink/45"
            )}
          >
            <Star
              filled={filled}
              className={cn(cls, value === n && hover == null && "pop")}
            />
          </button>
        );
      })}
    </div>
  );
}

export function StaticStars({
  value,
  size = "sm",
  showValue = false,
}: {
  value: number;
  size?: "xs" | "sm" | "md";
  showValue?: boolean;
}) {
  const cls =
    size === "xs"
      ? "h-3 w-3"
      : size === "md"
      ? "h-5 w-5"
      : "h-4 w-4";
  const rounded = Math.round(value);
  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-flex items-center gap-0.5 text-tomato">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            filled={rounded >= n}
            className={cn(cls, rounded >= n ? "" : "text-ink/20")}
          />
        ))}
      </span>
      {showValue && (
        <span className="tnum text-ink/70 text-sm ml-1">
          {value.toFixed(1)}
        </span>
      )}
    </span>
  );
}
