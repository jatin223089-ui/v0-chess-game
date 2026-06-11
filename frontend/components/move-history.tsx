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
              : `${Math.ceil(moves.length / 2)} ${Math.ceil(moves.length / 2) === 1 ? "turn" : "turns"} • ${moves.length} ${moves.length === 1 ? "move" : "moves"}`}
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
            title="Go to start position"
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
            title="Previous move (←)"
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
            title="Next move (→)"
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
            title="Go to current position"
          >
            <ChevronLast className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {pairs.length === 0 ? (
          <div className="flex h-full min-h-32 flex-col items-center justify-center gap-2 px-4 py-8 text-center">
            <div className="text-4xl">♟️</div>
            <p className="text-sm font-medium text-foreground">Ready to Play!</p>
            <p className="text-xs text-muted-foreground">
              Click a piece to see legal moves
            </p>
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
                  className="grid grid-cols-[3.5rem_1fr_1fr] items-center text-sm"
                >
                  <span className="px-3 py-2 text-center font-mono text-xs font-semibold text-muted-foreground">
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

      {/* Legend for move annotations */}
      {moves.some(m => m.quality) && (
        <div className="border-t border-border px-4 py-2">
          <div className="text-[10px] text-muted-foreground space-y-0.5">
            <p className="font-medium">Move Quality:</p>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
              <span>!! = Brilliant</span>
              <span>! = Best</span>
              <span>?! = Inaccuracy</span>
              <span>? = Mistake</span>
              <span>?? = Blunder</span>
            </div>
          </div>
        </div>
      )}
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
  
  // Add piece symbols for better readability
  const pieceSymbols: Record<string, string> = {
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙'
  }
  
  // Parse SAN to add visual piece symbols
  const formatSAN = (san: string) => {
    const piece = san[0]
    if (pieceSymbols[piece]) {
      return pieceSymbols[piece] + san.slice(1)
    }
    // For pawn moves (no piece letter)
    return san
  }
  
  return (
    <button
      type="button"
      onClick={onClick}
      title={`View position after ${move.san}`}
      className={cn(
        "group flex items-center gap-1.5 px-3 py-2.5 text-left font-medium text-sm transition-colors",
        active
          ? "bg-primary/15 text-primary font-semibold"
          : "hover:bg-muted/60",
      )}
    >
      <span className={cn(
        "flex items-center gap-0.5",
        active ? "text-primary" : qualityClass
      )}>
        <span className="font-mono">{formatSAN(move.san)}</span>
        {glyph && (
          <span className="text-xs font-bold ml-0.5">{glyph}</span>
        )}
        {move.isCheckmate && <span className="text-xs font-bold">#</span>}
      </span>
    </button>
  )
}
