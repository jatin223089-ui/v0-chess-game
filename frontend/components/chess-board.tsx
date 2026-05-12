"use client"

import { Chess, type Square } from "chess.js"
import { useMemo, useState } from "react"

import { ChessPiece } from "@/components/chess-piece"
import { cn } from "@/lib/utils"

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1] as const

export interface ChessBoardProps {
  fen: string
  orientation: "w" | "b"
  interactive: boolean
  lastMove: { from: Square; to: Square } | null
  highlightSquare?: Square | null // e.g. the king in check
  bestMoveHint?: { from: Square; to: Square } | null
  legalMovesFrom: (sq: Square) => { to: Square; capture: boolean; promotion?: string }[]
  onMove: (from: Square, to: Square, promotion?: "q" | "r" | "b" | "n") => void | Promise<unknown>
  playerColor: "w" | "b"
  sideToMove: "w" | "b"
}

type PieceType = "p" | "n" | "b" | "r" | "q" | "k"
type PieceColor = "w" | "b"

interface SquareInfo {
  square: Square
  piece: { type: PieceType; color: PieceColor } | null
  fileIndex: number
  rankIndex: number
  isLight: boolean
}

function buildSquares(fen: string, orientation: "w" | "b"): SquareInfo[] {
  const chess = new Chess(fen)
  const files = orientation === "w" ? FILES : ([...FILES].reverse() as typeof FILES)
  const ranks = orientation === "w" ? RANKS : ([...RANKS].reverse() as typeof RANKS)

  const out: SquareInfo[] = []
  ranks.forEach((rank, rankIndex) => {
    files.forEach((file, fileIndex) => {
      const square = `${file}${rank}` as Square
      const piece = chess.get(square)
      const isLight = (fileIndex + rankIndex) % 2 === 0
      out.push({
        square,
        piece: piece ? { type: piece.type as PieceType, color: piece.color as PieceColor } : null,
        fileIndex,
        rankIndex,
        isLight,
      })
    })
  })
  return out
}

export function ChessBoard({
  fen,
  orientation,
  interactive,
  lastMove,
  highlightSquare,
  bestMoveHint,
  legalMovesFrom,
  onMove,
  playerColor,
  sideToMove,
}: ChessBoardProps) {
  const [selected, setSelected] = useState<Square | null>(null)

  const squares = useMemo(() => buildSquares(fen, orientation), [fen, orientation])

  const legalTargets = useMemo(() => {
    if (!selected) return new Map<Square, { capture: boolean; promotion?: string }>()
    const map = new Map<Square, { capture: boolean; promotion?: string }>()
    for (const m of legalMovesFrom(selected)) {
      map.set(m.to, { capture: m.capture, promotion: m.promotion })
    }
    return map
  }, [selected, legalMovesFrom])

  const checkSquare = useMemo<Square | null>(() => {
    if (highlightSquare) return highlightSquare
    const c = new Chess(fen)
    if (!c.inCheck()) return null
    // Find the king of the side to move.
    const board = c.board()
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const p = board[r][f]
        if (p && p.type === "k" && p.color === c.turn()) {
          const file = FILES[f]
          const rank = 8 - r
          return `${file}${rank}` as Square
        }
      }
    }
    return null
  }, [fen, highlightSquare])

  const handleSquareClick = (square: Square, piece: SquareInfo["piece"]) => {
    if (!interactive) return
    if (sideToMove !== playerColor) return

    // Selecting a piece of your own
    if (piece && piece.color === playerColor) {
      setSelected(square === selected ? null : square)
      return
    }

    // Attempting a move to an empty/enemy square
    if (selected && legalTargets.has(square)) {
      const info = legalTargets.get(square)!
      const promotion = info.promotion as "q" | "r" | "b" | "n" | undefined
      void onMove(selected, square, promotion)
      setSelected(null)
      return
    }

    // Otherwise clear selection
    setSelected(null)
  }

  return (
    <div className="board-glow relative aspect-square w-full overflow-hidden rounded-md bg-board-dark">
      <div className="grid h-full w-full grid-cols-8 grid-rows-8">
        {squares.map(({ square, piece, fileIndex, rankIndex, isLight }) => {
          const isLastFrom = lastMove?.from === square
          const isLastTo = lastMove?.to === square
          const isLastMove = isLastFrom || isLastTo
          const isSelected = selected === square
          const isLegalTarget = legalTargets.has(square)
          const isCapture = isLegalTarget && legalTargets.get(square)?.capture
          const isCheck = checkSquare === square
          const isHintFrom = bestMoveHint?.from === square
          const isHintTo = bestMoveHint?.to === square

          // Coordinate labels on edges (a-h on bottom rank, 1-8 on first file).
          const showRank = fileIndex === 0
          const showFile = rankIndex === 7

          return (
            <button
              key={square}
              type="button"
              onClick={() => handleSquareClick(square, piece)}
              aria-label={`${square}${piece ? `, ${piece.color === "w" ? "white" : "black"} ${piece.type}` : ", empty"}`}
              className={cn(
                "relative flex items-center justify-center transition-colors",
                isLight ? "bg-board-light" : "bg-board-dark",
                interactive ? "cursor-pointer" : "cursor-default",
              )}
            >
              {/* Last-move highlight (warm overlay) */}
              {isLastMove && (
                <div className="pointer-events-none absolute inset-0 bg-move-highlight" />
              )}

              {/* Selection ring */}
              {isSelected && (
                <div className="pointer-events-none absolute inset-0 ring-4 ring-inset ring-primary/80" />
              )}

              {/* Best-move hint arrow ends */}
              {(isHintFrom || isHintTo) && (
                <div className="pointer-events-none absolute inset-1 rounded-sm ring-2 ring-primary/70" />
              )}

              {/* Check glow */}
              {isCheck && (
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(circle at center, var(--check-glow) 0%, transparent 70%)",
                    opacity: 0.55,
                  }}
                />
              )}

              {/* Piece */}
              {piece && (
                <div className="piece-enter relative z-10 h-[88%] w-[88%]">
                  <ChessPiece type={piece.type} color={piece.color} />
                </div>
              )}

              {/* Legal-move indicator */}
              {isLegalTarget && !piece && (
                <span
                  className="pointer-events-none absolute z-0 block rounded-full bg-legal-dot"
                  style={{ width: "26%", height: "26%" }}
                />
              )}
              {isLegalTarget && piece && (
                <span
                  className="pointer-events-none absolute inset-[6%] z-0 rounded-full ring-[6px] ring-legal-dot"
                  aria-hidden="true"
                />
              )}

              {/* Coordinate labels */}
              {showRank && (
                <span
                  className={cn(
                    "pointer-events-none absolute left-1 top-0.5 text-[10px] font-medium md:text-xs",
                    isLight ? "text-board-dark/70" : "text-board-light/70",
                  )}
                >
                  {square[1]}
                </span>
              )}
              {showFile && (
                <span
                  className={cn(
                    "pointer-events-none absolute bottom-0 right-1 text-[10px] font-medium md:text-xs",
                    isLight ? "text-board-dark/70" : "text-board-light/70",
                  )}
                >
                  {square[0]}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
