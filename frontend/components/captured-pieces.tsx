"use client"

import { ChessPiece } from "@/components/chess-piece"
import type { MoveRecord } from "@/hooks/use-chess-game"
import { cn } from "@/lib/utils"

type PieceType = "p" | "n" | "b" | "r" | "q"

const VALUES: Record<PieceType, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 }
const ORDER: PieceType[] = ["p", "n", "b", "r", "q"]

interface CapturedPiecesProps {
  /** Side whose captures we're showing (i.e. the captured side's color). */
  capturedColor: "w" | "b"
  history: MoveRecord[]
  className?: string
}

export function CapturedPieces({ capturedColor, history, className }: CapturedPiecesProps) {
  // Captured pieces of `capturedColor` are pieces that side LOST,
  // i.e. they appear in moves where move.captured exists and move.color != capturedColor.
  const lost: PieceType[] = []
  let lostValue = 0
  let gainedValue = 0
  for (const m of history) {
    if (!m.captured) continue
    const cap = m.captured as PieceType
    const value = VALUES[cap] ?? 0
    if (m.color !== capturedColor) {
      lost.push(cap)
      lostValue += value
    } else {
      gainedValue += value
    }
  }

  // Sort by piece value ascending.
  lost.sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b))

  // The pieces shown here are `capturedColor`'s lost material. If their
  // opponent is ahead in total material, display "+N" next to the row.
  const advantageForOpponent = lostValue - gainedValue

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex flex-wrap items-center gap-0.5">
        {lost.length === 0 ? (
          <span className="text-xs text-muted-foreground/50">—</span>
        ) : (
          lost.map((p, i) => (
            <span key={`${p}-${i}`} className="h-5 w-5 opacity-90">
              <ChessPiece type={p} color={capturedColor} />
            </span>
          ))
        )}
      </div>
      {advantageForOpponent > 0 && (
        <span className="font-mono text-xs text-[color:var(--eval-good)]">
          +{advantageForOpponent}
        </span>
      )}
    </div>
  )
}
