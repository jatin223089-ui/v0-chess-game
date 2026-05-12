"use client"

import { cn } from "@/lib/utils"

interface EvalBarProps {
  /** Evaluation in pawns from white's perspective. */
  evaluation: number | null
  orientation: "w" | "b"
  className?: string
}

export function EvalBar({ evaluation, orientation, className }: EvalBarProps) {
  // Map -8..+8 pawns to 0..100% with a soft tanh-like curve.
  const ev = evaluation ?? 0
  const clamped = Math.max(-8, Math.min(8, ev))
  const t = Math.tanh(clamped / 4) // -1 .. 1
  // whitePct = how much of the bar is white. From white's POV: bottom of the bar.
  const whitePct = 50 + t * 50

  const label =
    evaluation === null
      ? "—"
      : Math.abs(ev) >= 100
        ? ev > 0 ? "M" : "-M"
        : ev > 0
          ? `+${ev.toFixed(1)}`
          : ev.toFixed(1)

  const labelOnTop = orientation === "w" ? ev < 0 : ev > 0

  return (
    <div
      className={cn(
        "relative flex w-6 flex-col overflow-hidden rounded-sm border border-border bg-board-dark md:w-7",
        className,
      )}
      aria-label={`Position evaluation ${label}`}
    >
      {/* The bar is drawn from the orientation's bottom up. */}
      {orientation === "w" ? (
        <>
          <div
            className="bg-board-dark transition-[height] duration-500 ease-out"
            style={{ height: `${100 - whitePct}%` }}
          />
          <div
            className="bg-board-light transition-[height] duration-500 ease-out"
            style={{ height: `${whitePct}%` }}
          />
        </>
      ) : (
        <>
          <div
            className="bg-board-light transition-[height] duration-500 ease-out"
            style={{ height: `${whitePct}%` }}
          />
          <div
            className="bg-board-dark transition-[height] duration-500 ease-out"
            style={{ height: `${100 - whitePct}%` }}
          />
        </>
      )}

      <span
        className={cn(
          "absolute left-1/2 -translate-x-1/2 font-mono text-[10px] tabular-nums",
          labelOnTop ? "top-1 text-board-light" : "bottom-1 text-board-dark",
        )}
      >
        {label}
      </span>
    </div>
  )
}
