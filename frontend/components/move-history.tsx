"use client"

import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { MoveRecord } from "@/hooks/use-chess-game"

interface MoveHistoryProps {
  moves: MoveRecord[]
  viewIndex: number | null // null = live
  onGoto: (index: number | null) => void
}

const QUALITY_STYLES: Record<NonNullable<MoveRecord["quality"]>, string> = {
  brilliant:  "text-[color:var(--eval-good)]",
  best:       "text-[color:var(--eval-good)]",
  good:       "text-foreground",
  inaccuracy: "text-primary",
  mistake:    "text-[color:var(--eval-bad)]",
  blunder:    "text-[color:var(--eval-bad)]",
}

const QUALITY_GLYPH: Record<NonNullable<MoveRecord["quality"]>, string> = {
  brilliant:  "‼",
  best:       "!",
  good:       "",
  inaccuracy: "?!",
  mistake:    "?",
  blunder:    "??",
}

export function MoveHistory({ moves, viewIndex, onGoto }: MoveHistoryProps) {
  // Group moves into (white, black) pairs.
  const pairs: { number: number; white?: MoveRecord; black?: MoveRecord }[] = []
  moves.forEach((m, i) => {
    const pairIndex = Math.floor(i / 2)
    if (!pairs[pairIndex]) pairs[pairIndex] = { number: pairIndex + 1 }
    if (m.color === "w") pairs[pairIndex].white = m
    else pairs[pairIndex].black = m
  })

  const liveIndex = moves.length - 1
  const activeIndex = viewIndex ?? liveIndex

  const goPrev = () => {
    const current = viewIndex ?? liveIndex
    if (current <= 0) onGoto(-1)
    else onGoto(current - 1)
  }
  const goNext = () => {
    const current = viewIndex ?? liveIndex
    if (current >= liveIndex) onGoto(null)
    else onGoto(current + 1)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h3 className="font-serif text-base text-foreground">Move History</h3>
          <p className="text-xs text-muted-foreground">
            {moves.length === 0
              ? "No moves yet"
              : `${moves.length} ${moves.length === 1 ? "move" : "moves"} played`}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onGoto(-1)}
            disabled={moves.length === 0}
            aria-label="Jump to start"
          >
            <ChevronFirst className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={goPrev}
            disabled={moves.length === 0}
            aria-label="Previous move"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={goNext}
            disabled={moves.length === 0 || viewIndex === null}
            aria-label="Next move"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onGoto(null)}
            disabled={moves.length === 0 || viewIndex === null}
            aria-label="Jump to live"
          >
            <ChevronLast className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {pairs.length === 0 ? (
          <div className="flex h-full min-h-32 items-center justify-center px-4 py-8 text-center text-sm text-muted-foreground">
            Make your first move to begin the game.
          </div>
        ) : (
          <ol className="divide-y divide-border/60">
            {pairs.map((pair) => {
              const whiteIndex = pair.white ? pair.white.ply - 1 : -1
              const blackIndex = pair.black ? pair.black.ply - 1 : -1
              const whiteActive = whiteIndex === activeIndex
              const blackActive = blackIndex === activeIndex
              return (
                <li
                  key={pair.number}
                  className="grid grid-cols-[3rem_1fr_1fr] items-center text-sm"
                >
                  <span className="px-4 py-2 font-mono text-xs text-muted-foreground">
                    {pair.number}.
                  </span>
                  <MoveCell
                    move={pair.white}
                    active={whiteActive}
                    onClick={() => pair.white && onGoto(whiteIndex)}
                  />
                  <MoveCell
                    move={pair.black}
                    active={blackActive}
                    onClick={() => pair.black && onGoto(blackIndex)}
                  />
                </li>
              )
            })}
          </ol>
        )}
      </ScrollArea>
    </div>
  )
}

function MoveCell({
  move,
  active,
  onClick,
}: {
  move?: MoveRecord
  active: boolean
  onClick: () => void
}) {
  if (!move) {
    return <span className="px-3 py-2 text-muted-foreground/40">—</span>
  }
  const glyph = move.quality ? QUALITY_GLYPH[move.quality] : ""
  const qualityClass = move.quality ? QUALITY_STYLES[move.quality] : "text-foreground"
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex items-center gap-1 px-3 py-2 text-left font-mono text-sm transition-colors",
        active
          ? "bg-primary/15 text-primary"
          : "hover:bg-muted",
      )}
    >
      <span className={cn(active ? "text-primary" : qualityClass)}>{move.san}</span>
      {glyph && (
        <span
          className={cn(
            "text-xs",
            active ? "text-primary" : qualityClass,
          )}
        >
          {glyph}
        </span>
      )}
      {move.isCheckmate && <span className="text-xs text-primary">#</span>}
    </button>
  )
}
