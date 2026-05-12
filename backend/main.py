"""
Chess AI backend with Minimax + alpha-beta pruning.

Stateless API: the frontend owns the game state (FEN/PGN) and the backend
only computes AI moves and position evaluations.
"""

from __future__ import annotations

import random
import time
from typing import Literal

import chess
import fastapi
import fastapi.middleware.cors
import pydantic

app = fastapi.FastAPI()

app.add_middleware(
    fastapi.middleware.cors.CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Evaluation
# ---------------------------------------------------------------------------

# Standard centipawn piece values.
PIECE_VALUES: dict[int, int] = {
    chess.PAWN: 100,
    chess.KNIGHT: 320,
    chess.BISHOP: 330,
    chess.ROOK: 500,
    chess.QUEEN: 900,
    chess.KING: 20000,
}

# Piece-square tables (from white's perspective, a1 = index 0).
# These nudge the engine toward classic positional principles: pawns push
# forward, knights toward the center, bishops on long diagonals, etc.
PAWN_PST = [
     0,   0,   0,   0,   0,   0,   0,   0,
     5,  10,  10, -20, -20,  10,  10,   5,
     5,  -5, -10,   0,   0, -10,  -5,   5,
     0,   0,   0,  20,  20,   0,   0,   0,
     5,   5,  10,  25,  25,  10,   5,   5,
    10,  10,  20,  30,  30,  20,  10,  10,
    50,  50,  50,  50,  50,  50,  50,  50,
     0,   0,   0,   0,   0,   0,   0,   0,
]

KNIGHT_PST = [
    -50, -40, -30, -30, -30, -30, -40, -50,
    -40, -20,   0,   5,   5,   0, -20, -40,
    -30,   5,  10,  15,  15,  10,   5, -30,
    -30,   0,  15,  20,  20,  15,   0, -30,
    -30,   5,  15,  20,  20,  15,   5, -30,
    -30,   0,  10,  15,  15,  10,   0, -30,
    -40, -20,   0,   0,   0,   0, -20, -40,
    -50, -40, -30, -30, -30, -30, -40, -50,
]

BISHOP_PST = [
    -20, -10, -10, -10, -10, -10, -10, -20,
    -10,   5,   0,   0,   0,   0,   5, -10,
    -10,  10,  10,  10,  10,  10,  10, -10,
    -10,   0,  10,  10,  10,  10,   0, -10,
    -10,   5,   5,  10,  10,   5,   5, -10,
    -10,   0,   5,  10,  10,   5,   0, -10,
    -10,   0,   0,   0,   0,   0,   0, -10,
    -20, -10, -10, -10, -10, -10, -10, -20,
]

ROOK_PST = [
     0,   0,   5,  10,  10,   5,   0,   0,
    -5,   0,   0,   0,   0,   0,   0,  -5,
    -5,   0,   0,   0,   0,   0,   0,  -5,
    -5,   0,   0,   0,   0,   0,   0,  -5,
    -5,   0,   0,   0,   0,   0,   0,  -5,
    -5,   0,   0,   0,   0,   0,   0,  -5,
     5,  10,  10,  10,  10,  10,  10,   5,
     0,   0,   0,   0,   0,   0,   0,   0,
]

QUEEN_PST = [
    -20, -10, -10,  -5,  -5, -10, -10, -20,
    -10,   0,   5,   0,   0,   0,   0, -10,
    -10,   5,   5,   5,   5,   5,   0, -10,
      0,   0,   5,   5,   5,   5,   0,  -5,
     -5,   0,   5,   5,   5,   5,   0,  -5,
    -10,   0,   5,   5,   5,   5,   0, -10,
    -10,   0,   0,   0,   0,   0,   0, -10,
    -20, -10, -10,  -5,  -5, -10, -10, -20,
]

KING_PST_MIDDLE = [
     20,  30,  10,   0,   0,  10,  30,  20,
     20,  20,   0,   0,   0,   0,  20,  20,
    -10, -20, -20, -20, -20, -20, -20, -10,
    -20, -30, -30, -40, -40, -30, -30, -20,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
]

PST: dict[int, list[int]] = {
    chess.PAWN: PAWN_PST,
    chess.KNIGHT: KNIGHT_PST,
    chess.BISHOP: BISHOP_PST,
    chess.ROOK: ROOK_PST,
    chess.QUEEN: QUEEN_PST,
    chess.KING: KING_PST_MIDDLE,
}

CHECKMATE_SCORE = 1_000_000


def evaluate_board(board: chess.Board) -> int:
    """Return a centipawn evaluation from white's perspective."""
    if board.is_checkmate():
        # The side to move has been mated.
        return -CHECKMATE_SCORE if board.turn == chess.WHITE else CHECKMATE_SCORE
    if board.is_stalemate() or board.is_insufficient_material():
        return 0

    score = 0
    for square, piece in board.piece_map().items():
        value = PIECE_VALUES[piece.piece_type]
        # Mirror the PST for black so we read the table from their side.
        pst_index = square if piece.color == chess.WHITE else chess.square_mirror(square)
        pst_bonus = PST[piece.piece_type][pst_index]
        if piece.color == chess.WHITE:
            score += value + pst_bonus
        else:
            score -= value + pst_bonus
    return score


# ---------------------------------------------------------------------------
# Minimax with alpha-beta pruning
# ---------------------------------------------------------------------------

def _move_ordering_key(board: chess.Board, move: chess.Move) -> int:
    """Order captures and promotions first so alpha-beta prunes more."""
    score = 0
    if board.is_capture(move):
        victim = board.piece_at(move.to_square)
        attacker = board.piece_at(move.from_square)
        if victim and attacker:
            score += 10 * PIECE_VALUES[victim.piece_type] - PIECE_VALUES[attacker.piece_type]
        else:
            score += 100  # en passant
    if move.promotion:
        score += PIECE_VALUES.get(move.promotion, 0)
    if board.gives_check(move):
        score += 50
    return -score  # sort descending


def minimax(
    board: chess.Board,
    depth: int,
    alpha: int,
    beta: int,
    maximizing: bool,
) -> int:
    if depth == 0 or board.is_game_over():
        return evaluate_board(board)

    moves = sorted(board.legal_moves, key=lambda m: _move_ordering_key(board, m))

    if maximizing:
        best = -CHECKMATE_SCORE * 2
        for move in moves:
            board.push(move)
            value = minimax(board, depth - 1, alpha, beta, False)
            board.pop()
            if value > best:
                best = value
            alpha = max(alpha, best)
            if beta <= alpha:
                break
        return best
    else:
        best = CHECKMATE_SCORE * 2
        for move in moves:
            board.push(move)
            value = minimax(board, depth - 1, alpha, beta, True)
            board.pop()
            if value < best:
                best = value
            beta = min(beta, best)
            if beta <= alpha:
                break
        return best


def choose_ai_move(
    board: chess.Board,
    depth: int,
    randomness: float = 0.0,
) -> tuple[chess.Move | None, int]:
    """Pick the best move for the side to move.

    `randomness` (0..1) lets the engine occasionally pick a near-best move so
    lower difficulties feel human and varied instead of robotic.
    """
    legal = list(board.legal_moves)
    if not legal:
        return None, evaluate_board(board)

    maximizing = board.turn == chess.WHITE
    scored: list[tuple[chess.Move, int]] = []

    moves = sorted(legal, key=lambda m: _move_ordering_key(board, m))
    for move in moves:
        board.push(move)
        value = minimax(board, depth - 1, -CHECKMATE_SCORE * 2, CHECKMATE_SCORE * 2, not maximizing)
        board.pop()
        scored.append((move, value))

    scored.sort(key=lambda x: x[1], reverse=maximizing)

    # Add some controlled noise at lower difficulties.
    if randomness > 0 and len(scored) > 1:
        best_value = scored[0][1]
        # All moves within `tolerance` centipawns of the best are candidates.
        tolerance = int(120 * randomness)
        candidates = [m for m, v in scored if abs(v - best_value) <= tolerance]
        if random.random() < randomness and candidates:
            return random.choice(candidates), best_value

    return scored[0][0], scored[0][1]


# ---------------------------------------------------------------------------
# Difficulty profiles
# ---------------------------------------------------------------------------

Difficulty = Literal["beginner", "casual", "intermediate", "advanced", "expert"]

DIFFICULTY_PROFILES: dict[Difficulty, dict[str, float]] = {
    "beginner":     {"depth": 1, "randomness": 0.85},
    "casual":       {"depth": 2, "randomness": 0.45},
    "intermediate": {"depth": 3, "randomness": 0.15},
    "advanced":     {"depth": 4, "randomness": 0.0},
    "expert":       {"depth": 5, "randomness": 0.0},
}


# ---------------------------------------------------------------------------
# API models
# ---------------------------------------------------------------------------

class AiMoveRequest(pydantic.BaseModel):
    fen: str
    difficulty: Difficulty = "intermediate"


class AiMoveResponse(pydantic.BaseModel):
    from_square: str
    to_square: str
    promotion: str | None
    san: str
    uci: str
    evaluation: float  # in pawns, positive = white advantage
    depth: int
    nodes_thought_ms: int


class AnalyzeRequest(pydantic.BaseModel):
    fen: str
    depth: int = 3


class AnalyzeResponse(pydantic.BaseModel):
    evaluation: float
    best_line: list[str]  # SAN moves
    best_move_uci: str | None
    classification: str   # "winning", "better", "equal", "worse", "losing"
    comment: str


class ClassifyMoveRequest(pydantic.BaseModel):
    fen_before: str
    fen_after: str
    move_uci: str
    depth: int = 2


class ClassifyMoveResponse(pydantic.BaseModel):
    quality: str          # "brilliant", "best", "good", "inaccuracy", "mistake", "blunder"
    eval_before: float
    eval_after: float
    eval_delta: float
    comment: str


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/ai-move", response_model=AiMoveResponse)
async def ai_move(req: AiMoveRequest) -> AiMoveResponse:
    try:
        board = chess.Board(req.fen)
    except ValueError as exc:
        raise fastapi.HTTPException(status_code=400, detail=f"Invalid FEN: {exc}")

    if board.is_game_over():
        raise fastapi.HTTPException(status_code=400, detail="Game is already over")

    profile = DIFFICULTY_PROFILES[req.difficulty]
    depth = int(profile["depth"])
    randomness = float(profile["randomness"])

    start = time.perf_counter()
    move, raw_eval = choose_ai_move(board, depth=depth, randomness=randomness)
    elapsed_ms = int((time.perf_counter() - start) * 1000)

    if move is None:
        raise fastapi.HTTPException(status_code=400, detail="No legal moves available")

    san = board.san(move)
    return AiMoveResponse(
        from_square=chess.square_name(move.from_square),
        to_square=chess.square_name(move.to_square),
        promotion=chess.piece_symbol(move.promotion) if move.promotion else None,
        san=san,
        uci=move.uci(),
        evaluation=round(raw_eval / 100.0, 2),
        depth=depth,
        nodes_thought_ms=elapsed_ms,
    )


def _classify(eval_pawns: float) -> tuple[str, str]:
    """Map a centipawn evaluation to a label + short comment (white's perspective)."""
    if eval_pawns >= 5:
        return "winning", "White has a decisive material or positional advantage."
    if eval_pawns >= 1.5:
        return "better", "White is clearly better and should press the advantage."
    if eval_pawns >= 0.5:
        return "slightly better", "White holds a small edge — careful play matters."
    if eval_pawns >= -0.5:
        return "equal", "The position is balanced with chances for both sides."
    if eval_pawns >= -1.5:
        return "slightly worse", "Black has a small edge — look for active defense."
    if eval_pawns >= -5:
        return "worse", "Black is clearly better. Counterplay is critical."
    return "losing", "Black has a decisive advantage. Look for tactical resources."


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest) -> AnalyzeResponse:
    try:
        board = chess.Board(req.fen)
    except ValueError as exc:
        raise fastapi.HTTPException(status_code=400, detail=f"Invalid FEN: {exc}")

    depth = max(1, min(req.depth, 4))

    if board.is_game_over():
        eval_pawns = evaluate_board(board) / 100.0
        classification, comment = _classify(eval_pawns)
        return AnalyzeResponse(
            evaluation=round(eval_pawns, 2),
            best_line=[],
            best_move_uci=None,
            classification=classification,
            comment=f"Game over. {comment}",
        )

    # Build a short principal-variation by repeatedly picking the best move.
    pv_board = board.copy()
    pv: list[str] = []
    best_move_uci: str | None = None
    for ply in range(min(6, depth * 2)):
        move, _ = choose_ai_move(pv_board, depth=depth, randomness=0.0)
        if move is None:
            break
        if ply == 0:
            best_move_uci = move.uci()
        pv.append(pv_board.san(move))
        pv_board.push(move)
        if pv_board.is_game_over():
            break

    eval_cp = evaluate_board(board) if not pv else evaluate_board(pv_board)
    eval_pawns = round(eval_cp / 100.0, 2)
    classification, comment = _classify(eval_pawns)

    return AnalyzeResponse(
        evaluation=eval_pawns,
        best_line=pv,
        best_move_uci=best_move_uci,
        classification=classification,
        comment=comment,
    )


@app.post("/classify-move", response_model=ClassifyMoveResponse)
async def classify_move(req: ClassifyMoveRequest) -> ClassifyMoveResponse:
    """Compare the eval before and after a move to label its quality."""
    try:
        board_before = chess.Board(req.fen_before)
        board_after = chess.Board(req.fen_after)
    except ValueError as exc:
        raise fastapi.HTTPException(status_code=400, detail=f"Invalid FEN: {exc}")

    depth = max(1, min(req.depth, 3))

    # Side that just moved.
    mover_is_white = board_before.turn == chess.WHITE

    # Find best response value from each position (deep eval).
    _, best_before = choose_ai_move(board_before, depth=depth, randomness=0.0)
    if board_after.is_game_over():
        eval_after_cp = evaluate_board(board_after)
    else:
        _, eval_after_cp = choose_ai_move(board_after, depth=depth, randomness=0.0)

    # Convert to the moving side's perspective.
    if mover_is_white:
        eval_before_pawns = best_before / 100.0
        eval_after_pawns = eval_after_cp / 100.0
    else:
        eval_before_pawns = -best_before / 100.0
        eval_after_pawns = -eval_after_cp / 100.0

    # Delta from the mover's perspective. Negative = worse for them.
    delta = eval_after_pawns - eval_before_pawns

    if delta >= -0.1:
        quality, comment = "best", "Strong move — keeps the best evaluation."
    elif delta >= -0.5:
        quality, comment = "good", "A solid choice that holds the position."
    elif delta >= -1.0:
        quality, comment = "inaccuracy", "Slightly imprecise — there was a stronger continuation."
    elif delta >= -2.5:
        quality, comment = "mistake", "A real misstep that worsens the position."
    else:
        quality, comment = "blunder", "A serious blunder — the evaluation swung sharply."

    # Detect "brilliant" — a sacrifice that still keeps a winning eval.
    move = chess.Move.from_uci(req.move_uci)
    if (
        quality == "best"
        and board_before.is_capture(move) is False
        and eval_after_pawns > 1.5
        and board_before.gives_check(move)
    ):
        quality, comment = "brilliant", "A striking move — initiative with a winning evaluation."

    return ClassifyMoveResponse(
        quality=quality,
        eval_before=round(eval_before_pawns, 2),
        eval_after=round(eval_after_pawns, 2),
        eval_delta=round(delta, 2),
        comment=comment,
    )
