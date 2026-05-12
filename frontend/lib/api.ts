// Client for the Python FastAPI chess backend.
// Vercel routes `/api/*` to the backend service automatically.

export type Difficulty =
  | "beginner"
  | "casual"
  | "intermediate"
  | "advanced"
  | "expert"

export interface AiMoveResponse {
  from_square: string
  to_square: string
  promotion: string | null
  san: string
  uci: string
  evaluation: number
  depth: number
  nodes_thought_ms: number
}

export interface AnalyzeResponse {
  evaluation: number
  best_line: string[]
  best_move_uci: string | null
  classification: string
  comment: string
}

export interface ClassifyMoveResponse {
  quality: "brilliant" | "best" | "good" | "inaccuracy" | "mistake" | "blunder"
  eval_before: number
  eval_after: number
  eval_delta: number
  comment: string
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`API ${path} failed (${res.status}): ${text}`)
  }
  return res.json() as Promise<T>
}

export function requestAiMove(fen: string, difficulty: Difficulty) {
  return post<AiMoveResponse>("/ai-move", { fen, difficulty })
}

export function analyzePosition(fen: string, depth = 3) {
  return post<AnalyzeResponse>("/analyze", { fen, depth })
}

export function classifyMove(
  fenBefore: string,
  fenAfter: string,
  moveUci: string,
  depth = 2,
) {
  return post<ClassifyMoveResponse>("/classify-move", {
    fen_before: fenBefore,
    fen_after: fenAfter,
    move_uci: moveUci,
    depth,
  })
}
