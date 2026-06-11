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
import { Separator } from "@/components/ui/separator"
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
        title: playerWon ? "Victory!" : "Game Over",
        emoji: playerWon ? "🎉" : "♔",
        icon: playerWon ? Trophy : Crown,
        description: playerWon
          ? "Checkmate! You won the game."
          : "Checkmate! You lost the game.",
        message: playerWon
          ? "Congratulations! You successfully delivered checkmate."
          : "The AI delivered checkmate. Don't give up — try again!",
        explanation: playerWon
          ? "Your opponent's king is under attack with no way to escape. Well played!"
          : "Your king was under attack with no escape. Try a lower difficulty or use hints to improve your game.",
      }
    }

    if (status === "stalemate") {
      return {
        title: "Stalemate — Draw",
        emoji: "🤝",
        icon: Handshake,
        description: "The game is a draw.",
        message: "The player to move has no legal moves but is not in check.",
        explanation: "This is called a stalemate. Neither player wins — the game ends in a draw.",
      }
    }

    if (status === "draw") {
      return {
        title: "Draw",
        emoji: "🤝",
        icon: Handshake,
        description: "The game is a draw.",
        message: "The game ended in a draw by agreement or automatic rule.",
        explanation: "Draws can occur from the 50-move rule, threefold repetition, or insufficient material to checkmate.",
      }
    }

    if (status === "resigned") {
      return {
        title: "Game Resigned",
        emoji: "🏳️",
        icon: Flag,
        description: "You resigned the game.",
        message: "You chose to resign. The game is over.",
        explanation: "Resignation is a valid way to end a game when the position is lost.",
      }
    }

    return {
      title: "Game Over",
      emoji: "♟️",
      icon: Flag,
      description: "The game has ended.",
      message: "The game is over.",
      explanation: "",
    }
  }

  const info = getGameOverInfo()
  const Icon = info.icon

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center pb-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
              <span className="text-4xl">{info.emoji}</span>
            </div>
          </div>
          <DialogTitle className="text-center font-serif text-2xl pt-2">
            {info.title}
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-1">
            {info.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg border border-border bg-muted/40 p-4 text-center">
            <p className="text-sm text-foreground leading-relaxed">{info.message}</p>
          </div>

          {info.explanation && (
            <div className="space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                {status === "checkmate" && sideToMove !== playerColor
                  ? "What is Checkmate?"
                  : status === "checkmate"
                  ? "Learn & Improve"
                  : "About This Result"}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {info.explanation}
              </p>
            </div>
          )}
        </div>

        <Separator />

        <DialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
          <Button onClick={onNewGame} className="w-full" size="lg">
            <RotateCcw className="h-4 w-4" />
            Start New Game
          </Button>
          <div className="flex w-full gap-2">
            {onAnalyze && (
              <Button
                onClick={() => {
                  setOpen(false)
                  onAnalyze()
                }}
                variant="outline"
                className="flex-1"
              >
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Analyze</span>
              </Button>
            )}
            <Button
              onClick={() => setOpen(false)}
              variant="ghost"
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
