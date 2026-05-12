"use client"

import { Crown } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { AnalysisPanel } from "@/components/analysis-panel"
import { ChessBoard } from "@/components/chess-board"
import { ControlPanel } from "@/components/control-panel"
import { EvalBar } from "@/components/eval-bar"
import { GameStatusBanner } from "@/components/game-status-banner"
import { MoveHistory } from "@/components/move-history"
import { PlayerCard } from "@/components/player-card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useChessGame } from "@/hooks/use-chess-game"
import {
  analyzePosition,
  classifyMove,
  type AnalyzeResponse,
  type ClassifyMoveResponse,
  type Difficulty,
} from "@/lib/api"

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  beginner: "Beginner",
  casual: "Casual",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
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
  } = useChessGame()

  // Local UI state for the optional color choice on the "New Game" form.
  const [pendingColor, setPendingColor] = useState<"w" | "b">("w")

  // Analysis state — refreshes whenever the user clicks Analyze, and lazily
  // refreshes the "last move" classification after each completed full ply.
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [lastMoveClassification, setLastMoveClassification] =
    useState<ClassifyMoveResponse | null>(null)

  const gameOver =
    state.status === "checkmate" ||
    state.status === "stalemate" ||
    state.status === "draw" ||
    state.status === "resigned"

  const orientation = state.playerColor

  const handleAnalyze = async () => {
    setAnalyzing(true)
    try {
      const result = await analyzePosition(viewedFen, 3)
      setAnalysis(result)
    } catch {
      // best-effort; surface nothing if the network fails
    } finally {
      setAnalyzing(false)
    }
  }

  const handleNewGame = () => {
    setAnalysis(null)
    setLastMoveClassification(null)
    newGame({ difficulty: state.difficulty, playerColor: pendingColor })
  }

  // Whenever the player just completed a move, ask the backend to classify
  // it (best/good/inaccuracy/...) so we can annotate the move list.
  useEffect(() => {
    const last = state.history[state.history.length - 1]
    if (!last) return
    if (last.color !== state.playerColor) return
    if (last.quality) return // already classified

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

  // Pull the freshest AI evaluation for the live eval bar.
  const currentEval = useMemo(() => {
    if (analysis) return analysis.evaluation
    // Find the most recent AI move with an evaluation.
    for (let i = state.history.length - 1; i >= 0; i--) {
      const m = state.history[i]
      if (typeof m.aiEvaluation === "number") return m.aiEvaluation
    }
    return 0
  }, [analysis, state.history])

  const aiDifficultyLabel = DIFFICULTY_LABEL[state.difficulty]

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
      subtitle={`${aiDifficultyLabel} · Minimax depth ${
        state.difficulty === "beginner" ? 1
          : state.difficulty === "casual" ? 2
          : state.difficulty === "intermediate" ? 3
          : state.difficulty === "advanced" ? 4 : 5
      }`}
      color={state.playerColor === "w" ? "b" : "w"}
      active={isLive && sideToMove !== state.playerColor}
      thinking={state.thinking}
      history={state.history}
    />
  )

  return (
    <main className="min-h-dvh bg-background">
      <Header />

      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          {/* Board column */}
          <section className="flex flex-col gap-4">
            <GameStatusBanner
              status={state.status}
              playerColor={state.playerColor}
              isLive={isLive}
            />

            {/* Top player (the AI when player is white) */}
            {orientation === "w" ? aiCard : humanCard}

            <div className="flex items-stretch gap-3">
              <EvalBar evaluation={currentEval} orientation={orientation} />
              <div className="flex-1">
                <ChessBoard
                  fen={viewedFen}
                  orientation={orientation}
                  interactive={
                    isLive &&
                    !gameOver &&
                    !state.thinking &&
                    sideToMove === state.playerColor
                  }
                  lastMove={isLive ? state.lastMove : null}
                  bestMoveHint={null}
                  legalMovesFrom={legalMovesFrom}
                  onMove={makePlayerMove}
                  playerColor={state.playerColor}
                  sideToMove={sideToMove}
                />
              </div>
            </div>

            {/* Bottom player (you, when you're white) */}
            {orientation === "w" ? humanCard : aiCard}

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
                    onResign={resign}
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

            <FactCard
              thinking={state.thinking}
              difficulty={state.difficulty}
              moves={state.history.length}
            />
          </aside>
        </div>
      </div>

      <Footer />
    </main>
  )
}

function Header() {
  return (
    <header className="border-b border-border bg-card/40 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Crown className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <div className="font-serif text-lg text-foreground">Gambit</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Chess Study · Minimax AI
            </div>
          </div>
        </div>
        <nav className="hidden items-center gap-6 text-xs uppercase tracking-wider text-muted-foreground md:flex">
          <span>FastAPI + Next.js</span>
          <Separator orientation="vertical" className="h-4" />
          <span>α/β pruning</span>
        </nav>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="mt-8 border-t border-border bg-card/40">
      <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 text-xs text-muted-foreground lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <span>
          Engine: Python · python-chess · Minimax with α-β pruning, piece-square tables.
        </span>
        <span>Client: Next.js · chess.js · custom SVG board.</span>
      </div>
    </footer>
  )
}

function FactCard({
  thinking,
  difficulty,
  moves,
}: {
  thinking: boolean
  difficulty: Difficulty
  moves: number
}) {
  return (
    <div className="rounded-lg border border-border bg-card/60 p-4">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Engine
      </div>
      <dl className="mt-2 grid grid-cols-3 gap-3 text-center">
        <Fact label="Status" value={thinking ? "thinking" : "ready"} />
        <Fact label="Level" value={DIFFICULTY_LABEL[difficulty]} />
        <Fact label="Plies" value={String(moves)} />
      </dl>
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 font-serif text-sm text-foreground">{value}</dd>
    </div>
  )
}
