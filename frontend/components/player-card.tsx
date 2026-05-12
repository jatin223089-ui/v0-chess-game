"use client"

import { Bot, Crown, User } from "lucide-react"

import { CapturedPieces } from "@/components/captured-pieces"
import type { MoveRecord } from "@/hooks/use-chess-game"
import { cn } from "@/lib/utils"

interface PlayerCardProps {
  kind: "human" | "ai"
  name: string
  subtitle: string
  color: "w" | "b"
  active: boolean
  thinking?: boolean
  history: MoveRecord[]
}

export function PlayerCard({
  kind,
  name,
  subtitle,
  color,
  active,
  thinking,
  history,
}: PlayerCardProps) {
  const Icon = kind === "ai" ? Bot : User
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-md border bg-card/60 px-3 py-2.5 transition",
        active
          ? "border-primary/60 bg-primary/5"
          : "border-border",
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full border",
            color === "w"
              ? "border-board-dark/40 bg-board-light text-board-dark"
              : "border-board-light/30 bg-board-dark text-board-light",
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-medium text-foreground">
              {name}
            </span>
            {active && (
              <Crown className="h-3 w-3 text-primary" aria-hidden="true" />
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{subtitle}</span>
            {thinking && (
              <span className="thinking-pulse flex items-center gap-1 text-primary">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                thinking
              </span>
            )}
          </div>
        </div>
      </div>

      <CapturedPieces capturedColor={color} history={history} />
    </div>
  )
}
