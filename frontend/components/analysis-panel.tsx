"use client"

import { Brain, TrendingDown, TrendingUp } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import type { AnalyzeResponse, ClassifyMoveResponse } from "@/lib/api"
import { cn } from "@/lib/utils"

const QUALITY_COLOR: Record<ClassifyMoveResponse["quality"], string> = {
  brilliant:  "text-[color:var(--eval-good)]",
  best:       "text-[color:var(--eval-good)]",
  good:       "text-foreground",
  inaccuracy: "text-primary",
  mistake:    "text-[color:var(--eval-bad)]",
  blunder:    "text-[color:var(--eval-bad)]",
}

const QUALITY_LABEL: Record<ClassifyMoveResponse["quality"], string> = {
  brilliant:  "Brilliant move",
  best:       "Best move",
  good:       "Good move",
  inaccuracy: "Inaccuracy",
  mistake:    "Mistake",
  blunder:    "Blunder",
}

interface AnalysisPanelProps {
  analysis: AnalyzeResponse | null
  lastMoveClassification: ClassifyMoveResponse | null
  loading: boolean
}

export function AnalysisPanel({
  analysis,
  lastMoveClassification,
  loading,
}: AnalysisPanelProps) {
  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2">
        <Brain className="h-4 w-4 text-primary" />
        <h3 className="font-serif text-base text-foreground">Position Analysis</h3>
      </div>

      {loading && !analysis ? (
        <div className="space-y-3">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : analysis ? (
        <>
          <EvalSummary value={analysis.evaluation} classification={analysis.classification} />

          <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
            {analysis.comment}
          </p>

          {analysis.best_line.length > 0 && (
            <div>
              <div className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Best continuation
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 rounded-md border border-border bg-background/40 px-3 py-2 font-mono text-sm">
                {analysis.best_line.map((san, i) => (
                  <span key={i} className="flex items-center gap-1">
                    {i % 2 === 0 && (
                      <span className="text-xs text-muted-foreground">
                        {Math.floor(i / 2) + 1}.
                      </span>
                    )}
                    <span className={cn(i === 0 && "text-primary")}>{san}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {lastMoveClassification && (
            <div className="mt-1 rounded-md border border-border bg-background/40 p-3">
              <div className="flex items-baseline justify-between gap-2">
                <span
                  className={cn(
                    "text-sm font-medium",
                    QUALITY_COLOR[lastMoveClassification.quality],
                  )}
                >
                  {QUALITY_LABEL[lastMoveClassification.quality]}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  Δ {lastMoveClassification.eval_delta > 0 ? "+" : ""}
                  {lastMoveClassification.eval_delta.toFixed(2)}
                </span>
              </div>
              <p className="mt-1 text-pretty text-xs leading-relaxed text-muted-foreground">
                {lastMoveClassification.comment}
              </p>
            </div>
          )}
        </>
      ) : (
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
          Click <span className="text-foreground">Analyze position</span> at any
          time to evaluate the current board, see the engine&apos;s
          recommended continuation, and review the quality of the last move.
        </p>
      )}
    </div>
  )
}

function EvalSummary({
  value,
  classification,
}: {
  value: number
  classification: string
}) {
  const positive = value > 0
  const color =
    Math.abs(value) < 0.5
      ? "text-eval-neutral"
      : positive
        ? "text-[color:var(--eval-good)]"
        : "text-[color:var(--eval-bad)]"
  const Icon = Math.abs(value) < 0.5 ? null : positive ? TrendingUp : TrendingDown
  return (
    <div className="flex items-baseline justify-between gap-3">
      <div className="flex items-baseline gap-2">
        <span className={cn("font-serif text-3xl tabular-nums", color)}>
          {value > 0 ? "+" : ""}
          {value.toFixed(2)}
        </span>
        {Icon && <Icon className={cn("h-4 w-4", color)} />}
      </div>
      <span className="text-xs uppercase tracking-wider text-muted-foreground">
        {classification}
      </span>
    </div>
  )
}
