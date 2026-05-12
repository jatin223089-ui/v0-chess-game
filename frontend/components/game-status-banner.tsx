"use client"

import { CheckCircle2, CircleAlert, History, XCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import type { GameStatus } from "@/hooks/use-chess-game"

interface GameStatusBannerProps {
  status: GameStatus
  playerColor: "w" | "b"
  isLive: boolean
}

export function GameStatusBanner({ status, playerColor, isLive }: GameStatusBannerProps) {
  if (!isLive) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-border bg-card/60 px-3 py-2 text-sm">
        <History className="h-4 w-4 text-primary" />
        <span className="text-foreground">Reviewing a previous move</span>
        <span className="text-muted-foreground">— jump to live to keep playing</span>
      </div>
    )
  }

  let message: string | null = null
  let tone: "info" | "good" | "bad" | "warn" = "info"
  let Icon = CheckCircle2

  switch (status) {
    case "check":
      message = "Check!"
      tone = "warn"
      Icon = CircleAlert
      break
    case "checkmate": {
      // It's the side-to-move's TURN that has been mated. We can't know directly
      // from status — but the convention: whoever just moved won. So if it's
      // currently the player's turn (we can't tell here) we lost. We'll let
      // the caller surface a richer message; keep this generic.
      message = "Checkmate."
      tone = "bad"
      Icon = XCircle
      break
    }
    case "stalemate":
      message = "Stalemate — draw."
      tone = "info"
      Icon = CircleAlert
      break
    case "draw":
      message = "Draw."
      tone = "info"
      Icon = CircleAlert
      break
    case "resigned":
      message = "You resigned."
      tone = "bad"
      Icon = XCircle
      break
    default:
      return null
  }
  void playerColor

  const toneClass = {
    info: "border-border text-foreground",
    good: "border-[color:var(--eval-good)]/40 bg-[color:var(--eval-good)]/10 text-[color:var(--eval-good)]",
    bad: "border-[color:var(--eval-bad)]/40 bg-[color:var(--eval-bad)]/10 text-[color:var(--eval-bad)]",
    warn: "border-primary/50 bg-primary/10 text-primary",
  }[tone]

  return (
    <div className={cn("flex items-center gap-2 rounded-md border px-3 py-2 text-sm", toneClass)}>
      <Icon className="h-4 w-4" />
      <span className="font-medium">{message}</span>
    </div>
  )
}
