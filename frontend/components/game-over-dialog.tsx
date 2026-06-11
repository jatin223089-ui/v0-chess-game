"use client"

import { Trophy, Crown, Handshake, Flag, RotateCcw, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { GameStatus } from "@/hooks/use-chess-game"

interface GameOverDialogProps {
  status: GameStatus
  playerColor: "w" | "b"
  sideToMove: "w" | "b"
  onNewGame: () => void
  onAnalyze?: () => void
}

export function GameOverDialog({
  status,
  playerColor,
  sideToMove,
  onNewGame,
  onAnalyze,
}: GameOverDialogProps) {
  const [open, setOpen] = useState(false)

  const isGameOver =
    status === "checkmate" ||
    status === "stalemate" ||
    status === "draw" ||
    status === "resigned"

  useEffect(() => {
    if (isGameOver) {
      // Small delay to let the final move animation complete
      const timer = setTimeout(() => {
        setOpen(true)
      }, 800)
      return () => clearTimeout(timer)
    } else {
      setOpen(false)
    }
  }, [isGameOver, status])

  const getGameOverInfo = () => {
    if (status === "checkmate") {
      const playerWon = sideToMove !== playerColor
      return {
        title: playerWon ? "🎉 Victory!" : "Game Over",
        icon: playerWon ? Trophy : Crown,
        iconColor: playerWon ? "text-yellow-500" : "text-red-500",
        description: playerWon
          ? "Checkmate! You won the game!"
          : "Checkmate! You lost the game.",
        message: playerWon
          ? "Congratulations! You delivered checkmate to your opponent."
          : "The AI delivered checkmate. Better luck next time!",
        bgColor: playerWon ? "bg-yellow-500/10" : "bg-red-500/10",
        borderColor: playerWon ? "border-yellow-500/30" : "border-red-500/30",
      }
    }

    if (status === "stalemate") {
      return {
        title: "Draw by Stalemate",
        icon: Handshake,
        iconColor: "text-blue-500",
        description: "The game is a draw!",
        message: "The player to move has no legal moves but is not in check.",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/30",
      }
    }

    if (status === "draw") {
      return {
        title: "Draw",
        icon: Handshake,
        iconColor: "text-blue-500",
        description: "The game is a draw!",
        message: "The game ended in a draw (50-move rule, repetition, or insufficient material).",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/30",
      }
    }

    if (status === "resigned") {
      return {
        title: "Game Resigned",
        icon: Flag,
        iconColor: "text-gray-500",
        description: "You resigned the game.",
        message: "You chose to resign. The game is over.",
        bgColor: "bg-gray-500/10",
        borderColor: "border-gray-500/30",
      }
    }

    return {
      title: "Game Over",
      icon: Flag,
      iconColor: "text-gray-500",
      description: "The game has ended.",
      message: "The game is over.",
      bgColor: "bg-gray-500/10",
      borderColor: "border-gray-500/30",
    }
  }

  const info = getGameOverInfo()
  const Icon = info.icon

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center">
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-full ${info.bgColor} border-2 ${info.borderColor}`}
            >
              <Icon className={`h-10 w-10 ${info.iconColor}`} />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl pt-4">
            {info.title}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {info.description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div
            className={`rounded-lg border ${info.borderColor} ${info.bgColor} p-4 text-center`}
          >
            <p className="text-sm text-foreground">{info.message}</p>
          </div>

          {status === "checkmate" && sideToMove !== playerColor && (
            <div className="mt-4 space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                What is Checkmate?
              </p>
              <p className="text-xs text-muted-foreground">
                Checkmate means the king is under attack (in check) and has no way to escape.
                The game is over and cannot continue.
              </p>
            </div>
          )}

          {status === "checkmate" && sideToMove === playerColor && (
            <div className="mt-4 space-y-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-destructive">
                What is Checkmate?
              </p>
              <p className="text-xs text-muted-foreground">
                Your king was under attack with no way to escape. The game is over.
                Try a lower difficulty or use hints to improve!
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
          <Button onClick={onNewGame} className="w-full" size="lg">
            <RotateCcw className="h-4 w-4" />
            Start New Game
          </Button>
          {onAnalyze && (
            <Button
              onClick={() => {
                setOpen(false)
                onAnalyze()
              }}
              variant="outline"
              className="w-full"
            >
              <TrendingUp className="h-4 w-4" />
              Analyze Game
            </Button>
          )}
          <Button
            onClick={() => setOpen(false)}
            variant="ghost"
            className="w-full"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
