"use client"

import { Chess, type Square } from "chess.js"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { ChessPiece } from "@/components/chess-piece"
import { useSettings } from "@/hooks/use-settings"
import { themeCssVars } from "@/lib/themes"
import { cn } from "@/lib/utils"

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const
/** File order when Black is at the bottom (mirrors `FILES` for White). */
const FILES_BLACK = ["h", "g", "f", "e", "d", "c", "b", "a"] as const
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1] as const
/** Rank order when Black is at the bottom (mirrors `RANKS` for White). */
const RANKS_BLACK = [1, 2, 3, 4, 5, 6, 7, 8] as const

export interface ChessBoardProps {
  fen: string
  orientation: "w" | "b"
  interactive: boolean
  lastMove: { from: Square; to: Square } | null
  highlightSquare?: Square | null
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

interface Arrow {
  from: Square
  to: Square
}

function buildSquares(fen: string, orientation: "w" | "b"): SquareInfo[] {
  const chess = new Chess(fen)
  const files = orientation === "w" ? FILES : FILES_BLACK
  const ranks = orientation === "w" ? RANKS : RANKS_BLACK

  const out: SquareInfo[] = []
  ranks.forEach((rank, rankIndex) => {
    files.forEach((file, fileIndex) => {
      const square = `${file}${rank}` as Square
      const piece = chess.get(square)
      const isLight = (fileIndex + rankIndex) % 2 === 0
      out.push({
        square,
        piece: piece
          ? { type: piece.type as PieceType, color: piece.color as PieceColor }
          : null,
        fileIndex,
        rankIndex,
        isLight,
      })
    })
  })
  return out
}

/** Maps an algebraic square ("e4") to grid coords (file 0..7, rank 0..7) for the current orientation. */
function squareToCoord(sq: Square, orientation: "w" | "b"): { f: number; r: number } {
  const file = sq[0]
  const rank = parseInt(sq[1], 10)
  const files = orientation === "w" ? FILES : FILES_BLACK
  const ranks = orientation === "w" ? RANKS : RANKS_BLACK
  return {
    f: files.indexOf(file as (typeof FILES)[number]),
    r: ranks.indexOf(rank as (typeof RANKS)[number]),
  }
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
  const { settings, theme } = useSettings()
  const [selected, setSelected] = useState<Square | null>(null)

  // Right-click annotations (persist until next move / cleared).
  const [arrows, setArrows] = useState<Arrow[]>([])
  const [markedSquares, setMarkedSquares] = useState<Square[]>([])
  const rightDownRef = useRef<{ from: Square; moved: boolean } | null>(null)

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

  // Clear annotations whenever the position changes (a real move was made).
  useEffect(() => {
    setArrows([])
    setMarkedSquares([])
  }, [fen])

  const handleSquareClick = (square: Square, piece: SquareInfo["piece"]) => {
    if (!interactive) return
    if (sideToMove !== playerColor) return

    if (piece && piece.color === playerColor) {
      setSelected(square === selected ? null : square)
      return
    }

    if (selected && legalTargets.has(square)) {
      const info = legalTargets.get(square)!
      const promotion = info.promotion as "q" | "r" | "b" | "n" | undefined
      void onMove(selected, square, promotion)
      setSelected(null)
      return
    }

    setSelected(null)
  }

  const handleRightDown = useCallback((sq: Square, e: React.MouseEvent) => {
    if (e.button !== 2) return
    e.preventDefault()
    rightDownRef.current = { from: sq, moved: false }
  }, [])

  const handleRightUp = useCallback((sq: Square, e: React.MouseEvent) => {
    if (e.button !== 2) return
    e.preventDefault()
    const start = rightDownRef.current
    rightDownRef.current = null
    if (!start) return

    if (start.from === sq) {
      // Toggle square highlight
      setMarkedSquares((prev) =>
        prev.includes(sq) ? prev.filter((x) => x !== sq) : [...prev, sq],
      )
    } else {
      // Toggle arrow start -> sq
      setArrows((prev) => {
        const existing = prev.findIndex(
          (a) => a.from === start.from && a.to === sq,
        )
        if (existing >= 0) return prev.filter((_, i) => i !== existing)
        return [...prev, { from: start.from, to: sq }]
      })
    }
  }, [])

  const handleSquareEnter = useCallback((_sq: Square) => {
    if (rightDownRef.current) rightDownRef.current.moved = true
  }, [])

  return (
    <div
      className="relative aspect-square w-full touch-manipulation"
      style={themeCssVars(theme)}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="board-glow relative h-full w-full overflow-hidden rounded-md">
        <div className="grid h-full w-full grid-cols-8 grid-rows-8">
          {squares.map(
            ({ square, piece, fileIndex, rankIndex, isLight }) => {
              const isLastFrom = lastMove?.from === square && settings.highlightLastMove
              const isLastTo = lastMove?.to === square && settings.highlightLastMove
              const isLastMove = isLastFrom || isLastTo
              const isSelected = selected === square
              const isLegalTarget = settings.showLegalMoves && legalTargets.has(square)
              const isCapture =
                isLegalTarget && legalTargets.get(square)?.capture
              const isCheck = checkSquare === square
              const isHintFrom = bestMoveHint?.from === square
              const isHintTo = bestMoveHint?.to === square
              const isMarked = markedSquares.includes(square)

              const showRank = fileIndex === 0 && settings.showCoordinates
              const showFile = rankIndex === 7 && settings.showCoordinates

              return (
                <button
                  key={square}
                  type="button"
                  onClick={() => handleSquareClick(square, piece)}
                  onMouseDown={(e) => handleRightDown(square, e)}
                  onMouseUp={(e) => handleRightUp(square, e)}
                  onMouseEnter={() => handleSquareEnter(square)}
                  aria-label={`${square}${piece ? `, ${piece.color === "w" ? "white" : "black"} ${piece.type}` : ", empty"}`}
                  style={{
                    background: isLight
                      ? "var(--board-light)"
                      : "var(--board-dark)",
                  }}
                  className={cn(
                    "relative flex items-center justify-center transition-colors select-none",
                    interactive ? "cursor-pointer" : "cursor-default",
                  )}
                >
                  {/* Last-move highlight */}
                  {isLastMove && (
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{ background: "var(--move-highlight)" }}
                    />
                  )}

                  {/* Selection ring */}
                  {isSelected && (
                    <div
                      className="pointer-events-none absolute inset-0 ring-4 ring-inset"
                      style={{
                        boxShadow: "inset 0 0 0 4px var(--board-ink)",
                      }}
                    />
                  )}

                  {/* Best-move hint glow */}
                  {(isHintFrom || isHintTo) && (
                    <div
                      className="pointer-events-none absolute inset-1 rounded-sm"
                      style={{
                        boxShadow: "0 0 0 2px var(--board-ink)",
                      }}
                    />
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

                  {/* User-marked square (right-click) */}
                  {isMarked && (
                    <div
                      className="pointer-events-none absolute inset-[6%] rounded-full"
                      style={{
                        boxShadow: "inset 0 0 0 4px rgba(235, 64, 52, 0.85)",
                      }}
                    />
                  )}

                  {/* Piece */}
                  {piece && (
                    <div
                      className={cn(
                        "relative z-10 h-[88%] w-[88%]",
                        settings.animationsEnabled && "piece-enter",
                      )}
                    >
                      <ChessPiece type={piece.type} color={piece.color} />
                    </div>
                  )}

                  {/* Legal-move indicator */}
                  {isLegalTarget && !piece && !isCapture && (
                    <span
                      className="pointer-events-none absolute z-0 block rounded-full"
                      style={{
                        width: "26%",
                        height: "26%",
                        background: "var(--legal-dot)",
                      }}
                    />
                  )}
                  {isLegalTarget && (piece || isCapture) && (
                    <span
                      className="pointer-events-none absolute inset-[6%] z-0 rounded-full"
                      style={{
                        boxShadow: "inset 0 0 0 5px var(--legal-dot)",
                      }}
                      aria-hidden="true"
                    />
                  )}

                  {/* Coordinate labels */}
                  {showRank && (
                    <span
                      className="pointer-events-none absolute left-1 top-0.5 text-[10px] font-semibold md:text-xs"
                      style={{
                        color: isLight
                          ? "rgba(0,0,0,0.45)"
                          : "rgba(255,255,255,0.55)",
                      }}
                    >
                      {square[1]}
                    </span>
                  )}
                  {showFile && (
                    <span
                      className="pointer-events-none absolute bottom-0 right-1 text-[10px] font-semibold md:text-xs"
                      style={{
                        color: isLight
                          ? "rgba(0,0,0,0.45)"
                          : "rgba(255,255,255,0.55)",
                      }}
                    >
                      {square[0]}
                    </span>
                  )}
                </button>
              )
            },
          )}
        </div>

        {/* Arrow overlay (right-click drag annotations) */}
        <ArrowOverlay arrows={arrows} orientation={orientation} />
      </div>
    </div>
  )
}

/**
 * Renders user-drawn arrows on top of the board. Coordinates are normalized
 * 0..8 so the SVG scales perfectly regardless of physical pixel size.
 */
function ArrowOverlay({
  arrows,
  orientation,
}: {
  arrows: Arrow[]
  orientation: "w" | "b"
}) {
  if (arrows.length === 0) return null
  return (
    <svg
      viewBox="0 0 8 8"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <defs>
        <marker
          id="arrow-head"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="4"
          markerHeight="4"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--board-ink)" />
        </marker>
      </defs>
      {arrows.map((arrow, i) => {
        const a = squareToCoord(arrow.from, orientation)
        const b = squareToCoord(arrow.to, orientation)
        const x1 = a.f + 0.5
        const y1 = a.r + 0.5
        const x2 = b.f + 0.5
        const y2 = b.r + 0.5
        // Shorten so the arrowhead doesn't punch past the target center.
        const dx = x2 - x1
        const dy = y2 - y1
        const len = Math.hypot(dx, dy)
        const trim = 0.32
        const ux = dx / len
        const uy = dy / len
        const ex = x2 - ux * trim
        const ey = y2 - uy * trim
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={ex}
            y2={ey}
            stroke="var(--board-ink)"
            strokeWidth={0.13}
            strokeLinecap="round"
            markerEnd="url(#arrow-head)"
            opacity={0.9}
          />
        )
      })}
    </svg>
  )
}
