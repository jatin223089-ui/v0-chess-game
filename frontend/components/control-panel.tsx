"use client"

import { Flag, RotateCcw, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import type { Difficulty } from "@/lib/api"

interface ControlPanelProps {
  difficulty: Difficulty
  onDifficultyChange: (d: Difficulty) => void
  playerColor: "w" | "b"
  onPlayerColorChange: (c: "w" | "b") => void
  onNewGame: () => void
  onResign: () => void
  onAnalyze: () => void
  analyzing: boolean
  gameOver: boolean
}

const DIFFICULTY_META: Record<
  Difficulty,
  { label: string; description: string; depth: number; rating: string }
> = {
  beginner: {
    label: "Beginner",
    description: "Plays plausible moves; makes occasional blunders.",
    depth: 1,
    rating: "~600",
  },
  casual: {
    label: "Casual",
    description: "Sees one move ahead reliably; still mistakes.",
    depth: 2,
    rating: "~1000",
  },
  intermediate: {
    label: "Intermediate",
    description: "Solid tactical play with minor inaccuracies.",
    depth: 3,
    rating: "~1400",
  },
  advanced: {
    label: "Advanced",
    description: "Looks four moves ahead; tactical and accurate.",
    depth: 4,
    rating: "~1700",
  },
  expert: {
    label: "Expert",
    description: "Deep search with positional play. A real challenge.",
    depth: 5,
    rating: "~1900",
  },
}

export function ControlPanel({
  difficulty,
  onDifficultyChange,
  playerColor,
  onPlayerColorChange,
  onNewGame,
  onResign,
  onAnalyze,
  analyzing,
  gameOver,
}: ControlPanelProps) {
  const meta = DIFFICULTY_META[difficulty]
  return (
    <div className="flex flex-col gap-5 p-4">
      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <label
            htmlFor="difficulty"
            className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            AI Difficulty
          </label>
          <span className="font-mono text-[10px] text-muted-foreground/70">
            depth {meta.depth} · {meta.rating}
          </span>
        </div>
        <Select
          value={difficulty}
          onValueChange={(v) => onDifficultyChange(v as Difficulty)}
        >
          <SelectTrigger id="difficulty" className="w-full bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(DIFFICULTY_META) as Difficulty[]).map((d) => (
              <SelectItem key={d} value={d}>
                <div className="flex w-full items-center justify-between gap-3">
                  <span>{DIFFICULTY_META[d].label}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    d{DIFFICULTY_META[d].depth}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="mt-2 text-pretty text-xs leading-relaxed text-muted-foreground">
          {meta.description}
        </p>
      </div>

      <div>
        <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Play As
        </div>
        <div className="grid grid-cols-2 gap-2">
          <ColorChoice
            color="w"
            active={playerColor === "w"}
            onSelect={() => onPlayerColorChange("w")}
          />
          <ColorChoice
            color="b"
            active={playerColor === "b"}
            onSelect={() => onPlayerColorChange("b")}
          />
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-2">
        <Button onClick={onNewGame} className="w-full" variant="default">
          <RotateCcw className="h-4 w-4" />
          New Game
        </Button>
        <Button
          onClick={onAnalyze}
          disabled={analyzing}
          variant="secondary"
          className="w-full"
        >
          <Sparkles className="h-4 w-4" />
          {analyzing ? "Analyzing…" : "Analyze position"}
        </Button>
        <Button
          onClick={onResign}
          disabled={gameOver}
          variant="ghost"
          className="w-full text-muted-foreground hover:text-destructive"
        >
          <Flag className="h-4 w-4" />
          Resign
        </Button>
      </div>
    </div>
  )
}

function ColorChoice({
  color,
  active,
  onSelect,
}: {
  color: "w" | "b"
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={
        "flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm transition " +
        (active
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground")
      }
      aria-pressed={active}
    >
      <span
        className="inline-block h-4 w-4 rounded-full border border-border"
        style={{
          background: color === "w" ? "var(--board-light)" : "var(--board-dark)",
        }}
      />
      {color === "w" ? "White" : "Black"}
    </button>
  )
}
