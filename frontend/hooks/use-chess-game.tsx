"use client"

import { Chess, type Square } from "chess.js"
import { useCallback, useMemo, useReducer, useRef } from "react"

import { analyzePosition, requestAiMove, type Difficulty } from "@/lib/api"
import { playSound } from "@/lib/sounds"

export interface MoveRecord {
  ply: number
  san: string
  uci: string
  from: Square
  to: Square
  color: "w" | "b"
  fenBefore: string
  fenAfter: string
  captured?: string
  promotion?: string
  isCheck: boolean
  isCheckmate: boolean
  flags?: string
  aiThoughtMs?: number
  aiEvaluation?: number
  quality?: "brilliant" | "best" | "good" | "inaccuracy" | "mistake" | "blunder"
}

export type GameStatus =
  | "idle"
  | "player-turn"
  | "ai-thinking"
  | "check"
  | "checkmate"
  | "stalemate"
  | "draw"
  | "resigned"

export interface HintMove {
  from: Square
  to: Square
}

interface State {
  fen: string
  history: MoveRecord[]
  status: GameStatus
  difficulty: Difficulty
  playerColor: "w" | "b"
  viewIndex: number | null // null = live; otherwise index into history
  lastMove: { from: Square; to: Square } | null
  errorMessage: string | null
  thinking: boolean
  hint: HintMove | null
}

const START_FEN = new Chess().fen()

const INITIAL_STATE: State = {
  fen: START_FEN,
  history: [],
  status: "player-turn",
  difficulty: "intermediate",
  playerColor: "w",
  viewIndex: null,
  lastMove: null,
  errorMessage: null,
  thinking: false,
  hint: null,
}

type Action =
  | { type: "RESET"; difficulty?: Difficulty; playerColor?: "w" | "b" }
  | { type: "APPLY_MOVE"; record: MoveRecord; nextFen: string; status: GameStatus }
  | { type: "SET_DIFFICULTY"; difficulty: Difficulty }
  | { type: "SET_THINKING"; thinking: boolean }
  | { type: "SET_ERROR"; message: string | null }
  | { type: "GOTO"; index: number | null }
  | { type: "RESIGN" }
  | { type: "ANNOTATE"; ply: number; quality: MoveRecord["quality"] }
  | { type: "TAKEBACK"; targetFen: string; remaining: MoveRecord[] }
  | { type: "SET_HINT"; hint: HintMove | null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "RESET":
      return {
        ...INITIAL_STATE,
        difficulty: action.difficulty ?? state.difficulty,
        playerColor: action.playerColor ?? state.playerColor,
        status:
          (action.playerColor ?? state.playerColor) === "w"
            ? "player-turn"
            : "ai-thinking",
      }
    case "APPLY_MOVE":
      return {
        ...state,
        fen: action.nextFen,
        history: [...state.history, action.record],
        status: action.status,
        lastMove: { from: action.record.from, to: action.record.to },
        viewIndex: null,
        errorMessage: null,
        hint: null,
      }
    case "SET_DIFFICULTY":
      return { ...state, difficulty: action.difficulty }
    case "SET_THINKING":
      return { ...state, thinking: action.thinking }
    case "SET_ERROR":
      return { ...state, errorMessage: action.message }
    case "GOTO":
      return { ...state, viewIndex: action.index }
    case "RESIGN":
      return { ...state, status: "resigned" }
    case "ANNOTATE": {
      const history = state.history.map((m) =>
        m.ply === action.ply ? { ...m, quality: action.quality } : m,
      )
      return { ...state, history }
    }
    case "TAKEBACK": {
      const last = action.remaining[action.remaining.length - 1]
      return {
        ...state,
        fen: action.targetFen,
        history: action.remaining,
        lastMove: last ? { from: last.from, to: last.to } : null,
        status: "player-turn",
        viewIndex: null,
        errorMessage: null,
        hint: null,
      }
    }
    case "SET_HINT":
      return { ...state, hint: action.hint }
    default:
      return state
  }
}

function gameStatusFromBoard(chess: Chess): GameStatus {
  if (chess.isCheckmate()) return "checkmate"
  if (chess.isStalemate()) return "stalemate"
  if (chess.isDraw()) return "draw"
  if (chess.isCheck()) return "check"
  return "player-turn"
}

function inferEventForMove(
  move: { captured?: string; promotion?: string; flags?: string },
  status: GameStatus,
) {
  if (status === "checkmate") return "checkmate" as const
  if (status === "stalemate" || status === "draw") return "draw" as const
  if (status === "check") return "check" as const
  if (move.flags && (move.flags.includes("k") || move.flags.includes("q")))
    return "castle" as const
  if (move.promotion) return "promotion" as const
  if (move.captured || (move.flags && move.flags.includes("e")))
    return "capture" as const
  return "move" as const
}

export function useChessGame() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  // Keep a single mutable Chess instance to avoid re-parsing FEN every move.
  const chessRef = useRef<Chess>(new Chess())

  // The board the user is currently looking at — either live or a past ply.
  const viewedFen = useMemo(() => {
    if (state.viewIndex === null) return state.fen
    if (state.viewIndex < 0) return START_FEN
    const record = state.history[state.viewIndex]
    return record?.fenAfter ?? state.fen
  }, [state.fen, state.history, state.viewIndex])

  const isLive = state.viewIndex === null
  const sideToMove: "w" | "b" = useMemo(() => {
    const c = new Chess(viewedFen)
    return c.turn()
  }, [viewedFen])

  const triggerAiMove = useCallback(
    async (currentFen: string, difficulty: Difficulty) => {
      dispatch({ type: "SET_THINKING", thinking: true })
      try {
        const ai = await requestAiMove(currentFen, difficulty)
        const board = new Chess(currentFen)
        const move = board.move({
          from: ai.from_square as Square,
          to: ai.to_square as Square,
          promotion: (ai.promotion ?? undefined) as
            | "q"
            | "r"
            | "b"
            | "n"
            | undefined,
        })
        if (!move) throw new Error("AI returned an illegal move")

        const nextFen = board.fen()
        const status = gameStatusFromBoard(board)
        const record: MoveRecord = {
          ply: chessRef.current.history().length,
          san: move.san,
          uci: ai.uci,
          from: move.from,
          to: move.to,
          color: move.color,
          fenBefore: currentFen,
          fenAfter: nextFen,
          captured: move.captured,
          promotion: move.promotion,
          flags: move.flags,
          isCheck: board.inCheck(),
          isCheckmate: board.isCheckmate(),
          aiThoughtMs: ai.nodes_thought_ms,
          aiEvaluation: ai.evaluation,
        }
        chessRef.current.load(nextFen)
        dispatch({
          type: "APPLY_MOVE",
          record: { ...record, ply: state.history.length + 1 },
          nextFen,
          status: status === "player-turn" ? "player-turn" : status,
        })
        playSound(inferEventForMove(move, status))
      } catch (err) {
        const message = err instanceof Error ? err.message : "AI move failed"
        dispatch({ type: "SET_ERROR", message })
      } finally {
        dispatch({ type: "SET_THINKING", thinking: false })
      }
    },
    [state.history.length],
  )

  const makePlayerMove = useCallback(
    async (from: Square, to: Square, promotion?: "q" | "r" | "b" | "n") => {
      if (!isLive) return false
      if (state.thinking) return false
      if (
        state.status === "checkmate" ||
        state.status === "stalemate" ||
        state.status === "draw"
      ) {
        return false
      }

      const board = new Chess(state.fen)
      if (board.turn() !== state.playerColor) return false

      const move = board.move({ from, to, promotion: promotion ?? "q" })
      if (!move) {
        playSound("illegal")
        return false
      }

      const nextFen = board.fen()
      const status = gameStatusFromBoard(board)
      const record: MoveRecord = {
        ply: state.history.length + 1,
        san: move.san,
        uci: `${move.from}${move.to}${move.promotion ?? ""}`,
        from: move.from,
        to: move.to,
        color: move.color,
        fenBefore: state.fen,
        fenAfter: nextFen,
        captured: move.captured,
        promotion: move.promotion,
        flags: move.flags,
        isCheck: board.inCheck(),
        isCheckmate: board.isCheckmate(),
      }
      chessRef.current.load(nextFen)
      dispatch({ type: "APPLY_MOVE", record, nextFen, status })
      playSound(inferEventForMove(move, status))

      if (
        status === "checkmate" ||
        status === "stalemate" ||
        status === "draw"
      ) {
        return true
      }
      // Hand control to the AI.
      void triggerAiMove(nextFen, state.difficulty)
      return true
    },
    [
      isLive,
      state.fen,
      state.thinking,
      state.status,
      state.playerColor,
      state.history.length,
      state.difficulty,
      triggerAiMove,
    ],
  )

  const legalMovesFrom = useCallback(
    (square: Square): { to: Square; capture: boolean; promotion?: string }[] => {
      const c = new Chess(viewedFen)
      const piece = c.get(square)
      if (!piece) return []
      const moves = c.moves({ square, verbose: true })
      return moves.map((m) => ({
        to: m.to as Square,
        capture: !!m.captured,
        promotion: m.promotion,
      }))
    },
    [viewedFen],
  )

  const newGame = useCallback(
    (opts?: { difficulty?: Difficulty; playerColor?: "w" | "b" }) => {
      chessRef.current = new Chess()
      dispatch({ type: "RESET", ...opts })
      playSound("start")
      if (opts?.playerColor === "b") {
        // AI plays white first.
        void triggerAiMove(START_FEN, opts.difficulty ?? state.difficulty)
      }
    },
    [state.difficulty, triggerAiMove],
  )

  const setDifficulty = useCallback((difficulty: Difficulty) => {
    dispatch({ type: "SET_DIFFICULTY", difficulty })
  }, [])

  const goto = useCallback((index: number | null) => {
    dispatch({ type: "GOTO", index })
  }, [])

  const resign = useCallback(() => {
    playSound("draw")
    dispatch({ type: "RESIGN" })
  }, [])

  const annotate = useCallback(
    (ply: number, quality: MoveRecord["quality"]) => {
      dispatch({ type: "ANNOTATE", ply, quality })
    },
    [],
  )

  /**
   * Take back the most recent full move pair (player + AI). If the player
   * is on move, takes back just the prior AI reply too. Does nothing if
   * fewer than 1 move exists.
   */
  const takeBack = useCallback(() => {
    if (state.thinking) return
    if (state.history.length === 0) return

    // Decide how many plies to remove so that it's the player's turn after.
    let removeCount = 0
    if (sideToMove === state.playerColor) {
      // Player to move — last ply was AI, the one before was player.
      removeCount = Math.min(2, state.history.length)
    } else {
      // AI to move (rare here) — just remove the player's last ply.
      removeCount = 1
    }

    const remaining = state.history.slice(0, state.history.length - removeCount)
    const targetFen =
      remaining.length > 0
        ? remaining[remaining.length - 1].fenAfter
        : START_FEN
    chessRef.current.load(targetFen)
    dispatch({ type: "TAKEBACK", targetFen, remaining })
    playSound("click")
  }, [state.history, state.thinking, sideToMove, state.playerColor])

  const requestHint = useCallback(async () => {
    if (!isLive) return
    if (state.thinking) return
    if (sideToMove !== state.playerColor) return
    try {
      const res = await analyzePosition(state.fen, 3)
      if (!res.best_move_uci) return
      const from = res.best_move_uci.slice(0, 2) as Square
      const to = res.best_move_uci.slice(2, 4) as Square
      dispatch({ type: "SET_HINT", hint: { from, to } })
      playSound("click")
    } catch {
      // ignore
    }
  }, [isLive, state.thinking, sideToMove, state.playerColor, state.fen])

  const clearHint = useCallback(() => {
    dispatch({ type: "SET_HINT", hint: null })
  }, [])

  return {
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
  }
}
