"use client"

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Crown,
  Expand,
  Github,
  Keyboard,
  Lightbulb,
  RotateCw,
  Undo2,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { AnalysisPanel } from "@/components/analysis-panel"
import { ChessBoard } from "@/components/chess-board"
import { ControlPanel } from "@/components/control-panel"
import { EvalBar } from "@/components/eval-bar"
import { FullscreenGame } from "@/components/fullscreen-game"
import { GameStatusBanner } from "@/components/game-status-banner"
import { MoveHistory } from "@/components/move-history"
import { PlayerCard } from "@/components/player-card"
import { SettingsDialog } from "@/components/settings-dialog"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useChessGame } from "@/hooks/use-chess-game"
import { useSettings } from "@/hooks/use-settings"
import {
  analyzePosition,
  classifyMove,
  type AnalyzeResponse,
  type ClassifyMoveResponse,
  type Difficulty,
} from "@/lib/api"
import { themeCssVars } from "@/lib/themes"

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  beginner: "Beginner",
  casual: "Casual",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
}

const DEPTH_FOR_DIFFICULTY: Record<Difficulty, number> = {
  beginner: 1,
  casual: 2,
  intermediate: 3,
  advanced: 4,
  expert: 5,
}

export default function Page() {
  const {
    state,
    viewedFen,
    isLive,
    sideToMove,
    makePlayerMove,
    legalMovesFrom,
    newGame,
    setDifficulty,
    goto,
    resign,
    annotate,
    takeBack,
    requestHint,
    clearHint,
  } = useChessGame()

  const { theme } = useSettings()

  const [pendingColor, setPendingColor] = useState<"w" | "b">("w")
  const [boardFlipped, setBoardFlipped] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [lastMoveClassification, setLastMoveClassification] =
    useState<ClassifyMoveResponse | null>(null)

  const gameOver =
    state.status === "checkmate" ||
    state.status === "stalemate" ||
    state.status === "draw" ||
    state.status === "resigned"

  // Effective orientation = player color XOR flipped.
  const orientation: "w" | "b" = useMemo(() => {
    if (!boardFlipped) return state.playerColor
    return state.playerColor === "w" ? "b" : "w"
  }, [boardFlipped, state.playerColor])

  const handleAnalyze = async () => {
    setAnalyzing(true)
    try {
      const result = await analyzePosition(viewedFen, 3)
      setAnalysis(result)
    } catch {
      // best-effort
    } finally {
      setAnalyzing(false)
    }
  }

  const handleNewGame = () => {
    setAnalysis(null)
    setLastMoveClassification(null)
    setBoardFlipped(false)
    newGame({ difficulty: state.difficulty, playerColor: pendingColor })
  }

  const handleResign = () => {
    resign()
  }

  // Classify the player's last move after each ply.
  useEffect(() => {
    const last = state.history[state.history.length - 1]
    if (!last) return
    if (last.color !== state.playerColor) return
    if (last.quality) return

    let cancelled = false
    classifyMove(last.fenBefore, last.fenAfter, last.uci, 2)
      .then((res) => {
        if (cancelled) return
        annotate(last.ply, res.quality)
        setLastMoveClassification(res)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.history.length])

  // Auto-clear hint after a short delay so it doesn't linger.
  useEffect(() => {
    if (!state.hint) return
    const id = window.setTimeout(() => clearHint(), 4000)
    return () => window.clearTimeout(id)
  }, [state.hint, clearHint])

  // Keyboard shortcuts (desktop): F to flip, [ for take-back, ] for hint, Cmd+F for fullscreen.
  useEffect(() => {
    if (fullscreen) return // fullscreen owns its own shortcuts
    const onKey = (e: KeyboardEvent) => {
      if (
        (e.target as HTMLElement | null)?.tagName === "INPUT" ||
        (e.target as HTMLElement | null)?.tagName === "TEXTAREA"
      )
        return
      if (e.key === "f" || e.key === "F") {
        if (e.metaKey || e.ctrlKey) {
          e.preventDefault()
          setFullscreen(true)
        } else {
          setBoardFlipped((v) => !v)
        }
      } else if (e.key === "[") takeBack()
      else if (e.key === "]") void requestHint()
      else if (e.key === "ArrowLeft") {
        const next =
          state.viewIndex === null
            ? state.history.length - 2
            : Math.max(-1, state.viewIndex - 1)
        goto(next)
      } else if (e.key === "ArrowRight") {
        const cur =
          state.viewIndex === null ? state.history.length - 1 : state.viewIndex
        if (cur < state.history.length - 1) goto(cur + 1)
        else goto(null)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [fullscreen, takeBack, requestHint, goto, state.viewIndex, state.history.length])

  const currentEval = useMemo(() => {
    if (analysis) return analysis.evaluation
    for (let i = state.history.length - 1; i >= 0; i--) {
      const m = state.history[i]
      if (typeof m.aiEvaluation === "number") return m.aiEvaluation
    }
    return 0
  }, [analysis, state.history])

  const aiDifficultyLabel = DIFFICULTY_LABEL[state.difficulty]

  const interactive =
    isLive &&
    !gameOver &&
    !state.thinking &&
    sideToMove === state.playerColor

  if (fullscreen) {
    return (
      <FullscreenGame
        fen={state.fen}
        viewedFen={viewedFen}
        history={state.history}
        viewIndex={state.viewIndex}
        isLive={isLive}
        thinking={state.thinking}
        sideToMove={sideToMove}
        playerColor={state.playerColor}
        difficulty={state.difficulty}
        evaluation={currentEval}
        lastMove={state.lastMove}
        hint={state.hint}
        gameOver={gameOver}
        status={state.status}
        onMove={makePlayerMove}
        legalMovesFrom={legalMovesFrom}
        onClose={() => setFullscreen(false)}
        onFlip={() => setBoardFlipped((v) => !v)}
        orientation={orientation}
        onGoto={goto}
        onTakeBack={takeBack}
        onHint={() => void requestHint()}
        onResign={handleResign}
        onNewGame={handleNewGame}
        onDifficulty={(d) => setDifficulty(d)}
      />
    )
  }

  const humanCard = (
    <PlayerCard
      kind="human"
      name="You"
      subtitle={state.playerColor === "w" ? "Playing White" : "Playing Black"}
      color={state.playerColor}
      active={isLive && sideToMove === state.playerColor && !state.thinking}
      history={state.history}
    />
  )
  const aiCard = (
    <PlayerCard
      kind="ai"
      name="Gambit Engine"
      subtitle={`${aiDifficultyLabel} · α/β depth ${DEPTH_FOR_DIFFICULTY[state.difficulty]}`}
      color={state.playerColor === "w" ? "b" : "w"}
      active={isLive && sideToMove !== state.playerColor}
      thinking={state.thinking}
      history={state.history}
    />
  )

  return (
    <TooltipProvider delayDuration={150}>
      <main className="min-h-dvh bg-background" style={themeCssVars(theme)}>
        <Header
          onFullscreen={() => setFullscreen(true)}
          onFlip={() => setBoardFlipped((v) => !v)}
        />

        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
            {/* Board column */}
            <section className="flex flex-col gap-4">
              <GameStatusBanner
                status={state.status}
                playerColor={state.playerColor}
                isLive={isLive}
              />

              {orientation === "w" ? aiCard : humanCard}

              <div className="flex items-stretch gap-3">
                <EvalBar evaluation={currentEval} orientation={orientation} />
                <div className="flex-1">
                  <ChessBoard
                    fen={viewedFen}
                    orientation={orientation}
                    interactive={interactive}
                    lastMove={isLive ? state.lastMove : null}
                    bestMoveHint={state.hint}
                    legalMovesFrom={legalMovesFrom}
                    onMove={makePlayerMove}
                    playerColor={state.playerColor}
                    sideToMove={sideToMove}
                  />
                </div>
              </div>

              {orientation === "w" ? humanCard : aiCard}

              {/* Board toolbar */}
              <BoardToolbar
                onFullscreen={() => setFullscreen(true)}
                onFlip={() => setBoardFlipped((v) => !v)}
                onTakeBack={takeBack}
                onHint={() => void requestHint()}
                onGoto={goto}
                viewIndex={state.viewIndex}
                historyLen={state.history.length}
                canInteract={interactive}
                thinking={state.thinking}
              />

              {state.errorMessage && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {state.errorMessage}
                </div>
              )}
            </section>

            {/* Sidebar */}
            <aside className="flex flex-col gap-4">
              <div className="rounded-lg border border-border bg-card">
                <Tabs defaultValue="play" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 rounded-b-none border-b border-border bg-transparent p-1">
                    <TabsTrigger value="play">Game</TabsTrigger>
                    <TabsTrigger value="history">Moves</TabsTrigger>
                    <TabsTrigger value="analysis">Analysis</TabsTrigger>
                  </TabsList>
                  <TabsContent value="play" className="m-0">
                    <ControlPanel
                      difficulty={state.difficulty}
                      onDifficultyChange={(d) => setDifficulty(d)}
                      playerColor={pendingColor}
                      onPlayerColorChange={setPendingColor}
                      onNewGame={handleNewGame}
                      onResign={handleResign}
                      onAnalyze={handleAnalyze}
                      analyzing={analyzing}
                      gameOver={gameOver}
                    />
                  </TabsContent>
                  <TabsContent value="history" className="m-0 h-[480px]">
                    <MoveHistory
                      moves={state.history}
                      viewIndex={state.viewIndex}
                      onGoto={goto}
                    />
                  </TabsContent>
                  <TabsContent value="analysis" className="m-0">
                    <AnalysisPanel
                      analysis={analysis}
                      lastMoveClassification={lastMoveClassification}
                      loading={analyzing}
                    />
                  </TabsContent>
                </Tabs>
              </div>

              <ShortcutsCard />
            </aside>
          </div>
        </div>
      </main>
    </TooltipProvider>
  )
}

function Header({
  onFullscreen,
  onFlip,
}: {
  onFullscreen: () => void
  onFlip: () => void
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/60 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Crown className="h-4.5 w-4.5" />
          </span>
          <div className="leading-tight">
            <div className="font-serif text-lg text-foreground">Gambit</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Play · Study · Analyze
            </div>
          </div>
        </div>

        <nav className="hidden items-center gap-6 text-xs uppercase tracking-wider text-muted-foreground md:flex">
          <a href="#" className="text-foreground">Play</a>
          <a href="#" className="hover:text-foreground">Puzzles</a>
          <a href="#" className="hover:text-foreground">Learn</a>
          <a href="#" className="hover:text-foreground">Watch</a>
        </nav>

        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onFlip} aria-label="Flip board">
                <RotateCw className="h-4 w-4" />
                <span className="hidden sm:inline">Flip</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Flip board (F)</TooltipContent>
          </Tooltip>
          <SettingsDialog />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onFullscreen} aria-label="Fullscreen">
                <Expand className="h-4 w-4" />
                <span className="hidden sm:inline">Focus</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Enter focus mode</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  )
}

function BoardToolbar({
  onFullscreen,
  onFlip,
  onTakeBack,
  onHint,
  onGoto,
  viewIndex,
  historyLen,
  canInteract,
  thinking,
}: {
  onFullscreen: () => void
  onFlip: () => void
  onTakeBack: () => void
  onHint: () => void
  onGoto: (index: number | null) => void
  viewIndex: number | null
  historyLen: number
  canInteract: boolean
  thinking: boolean
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card/60 px-2.5 py-2">
      <div className="flex items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              aria-label="First"
              onClick={() => onGoto(-1)}
              disabled={historyLen === 0}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>First position</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Previous"
              onClick={() => {
                const next =
                  viewIndex === null
                    ? historyLen - 2
                    : Math.max(-1, viewIndex - 1)
                onGoto(next)
              }}
              disabled={historyLen === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Previous move (←)</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Next"
              onClick={() => {
                const cur = viewIndex === null ? historyLen - 1 : viewIndex
                if (cur < historyLen - 1) onGoto(cur + 1)
                else onGoto(null)
              }}
              disabled={historyLen === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Next move (→)</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Latest"
              onClick={() => onGoto(null)}
              disabled={historyLen === 0}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Latest position</TooltipContent>
        </Tooltip>
      </div>

      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onTakeBack}
              disabled={historyLen === 0 || thinking}
              aria-label="Take back"
            >
              <Undo2 className="h-4 w-4" />
              <span className="hidden sm:inline">Take back</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Take back last move ([)</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onHint}
              disabled={!canInteract}
              aria-label="Hint"
            >
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Hint</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Show best move (])</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={onFlip} aria-label="Flip">
              <RotateCw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Flip board (F)</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={onFullscreen} aria-label="Fullscreen">
              <Expand className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Focus mode (⌘F)</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

function ShortcutsCard() {
  const items: { keys: string[]; label: string }[] = [
    { keys: ["F"], label: "Flip board" },
    { keys: ["⌘", "F"], label: "Focus mode" },
    { keys: ["←", "→"], label: "Navigate moves" },
    { keys: ["["], label: "Take back" },
    { keys: ["]"], label: "Hint" },
    { keys: ["Right click"], label: "Mark square / draw arrow" },
  ]
  return (
    <div className="rounded-lg border border-border bg-card/60 p-4">
      <div className="flex items-center gap-2">
        <Keyboard className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Shortcuts
        </span>
      </div>
      <ul className="mt-3 space-y-1.5 text-xs">
        {items.map((it) => (
          <li key={it.label} className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">{it.label}</span>
            <span className="flex items-center gap-1">
              {it.keys.map((k) => (
                <kbd
                  key={k}
                  className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-foreground"
                >
                  {k}
                </kbd>
              ))}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <Github className="h-3 w-3" />
        Open source · MIT
      </div>
    </div>
  )
}
