# ♟️ Gambit Chess Game

A full-stack chess game with AI opponent powered by Minimax algorithm with alpha-beta pruning. Play against an intelligent AI engine with multiple difficulty levels, analyze positions, and learn from move classifications.

![Chess Game](https://img.shields.io/badge/Chess-Game-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-green?style=for-the-badge&logo=fastapi)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)

## ✨ Features

### 🎮 Gameplay
- **Play vs AI** - Challenge the Gambit Engine with 5 difficulty levels (Beginner to Expert)
- **Choose Your Side** - Play as White or Black
- **Move History** - Full PGN notation with move navigation
- **Take Back Moves** - Undo moves and try different strategies
- **Hints & Analysis** - Get AI-powered hints and position evaluations
- **Move Classification** - Every move is rated (Brilliant, Best, Good, Inaccuracy, Mistake, Blunder)
- **Game Status** - Real-time check, checkmate, stalemate, and draw detection

### 🎨 UI/UX
- **Multiple Board Themes** - 6 beautiful board themes to choose from
- **Fullscreen/Focus Mode** - Distraction-free gameplay
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Keyboard Shortcuts** - Fast navigation with keyboard controls
- **Smooth Animations** - Piece animations and transitions
- **Sound Effects** - Synthesized audio for moves, captures, checks, and more
- **Right-Click Drawing** - Mark squares and draw arrows on the board

### 🤖 AI Engine
- **Minimax Algorithm** - Classic game theory approach with alpha-beta pruning
- **Piece-Square Tables** - Positional evaluation for strategic play
- **Move Ordering** - Optimized search with capture/promotion prioritization
- **Multiple Depth Levels** - From depth 1 (Beginner) to depth 5 (Expert)
- **Evaluation Feedback** - Centipawn scores and position classification

### 📺 Watch Page
- Curated collection of chess tutorial videos
- Filter by category (Matches, Tutorials, Highlights, Analysis)
- Direct links to popular chess YouTubers
- YouTube integration for seamless viewing
- Video thumbnails and metadata
- Quick search links to YouTube for specific topics

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 16.2 (App Router with Turbopack)
- **Language**: TypeScript 5.7
- **Chess Logic**: chess.js library
- **UI Components**: Custom components built with Radix UI primitives
- **Styling**: Tailwind CSS 4.2
- **State Management**: React Hooks (useReducer)

### Backend
- **Framework**: FastAPI (Python 3.12+)
- **Chess Engine**: python-chess library
- **Algorithm**: Minimax with alpha-beta pruning
- **API Design**: RESTful, stateless architecture
- **CORS**: Enabled for local development

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (for frontend)
- Python 3.12+ (for backend)
- npm/yarn/pnpm (for frontend dependencies)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd v0-chess-game-main
```

2. **Setup Backend**
```bash
cd backend
pip install -e .
# or
python -m pip install -e .
```

3. **Setup Frontend**
```bash
cd frontend
npm install
# or
yarn install
# or
pnpm install
```

4. **Configure Environment**
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
python -m uvicorn main:app --reload
```
Backend runs on: http://127.0.0.1:8000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on: http://localhost:3000

### API Documentation
Once the backend is running, visit:
- **Swagger UI**: http://127.0.0.1:8000/docs
- **ReDoc**: http://127.0.0.1:8000/redoc

## 🎮 How to Play

1. **Start a New Game** - Select difficulty and color preference
2. **Make Your Move** - Click a piece, then click the destination square
3. **Get Hints** - Press `]` or click the Hint button when stuck
4. **Analyze Position** - Click "Analyze position" for AI evaluation
5. **Navigate Moves** - Use arrow keys or navigation buttons to review moves
6. **Try Different Lines** - Take back moves and explore alternatives

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `F` | Flip board |
| `⌘ F` or `Ctrl F` | Enter fullscreen/focus mode |
| `←` | Previous move |
| `→` | Next move |
| `[` | Take back move |
| `]` | Show hint |
| `Esc` | Exit fullscreen |
| `Right Click` | Mark squares / draw arrows |

## 🎯 AI Difficulty Levels

| Level | Depth | Rating | Description |
|-------|-------|--------|-------------|
| **Beginner** | 1 | ~600 | Plays plausible moves; makes occasional blunders |
| **Casual** | 2 | ~1000 | Sees one move ahead reliably; still mistakes |
| **Intermediate** | 3 | ~1400 | Solid tactical play with minor inaccuracies |
| **Advanced** | 4 | ~1700 | Looks four moves ahead; tactical and accurate |
| **Expert** | 5 | ~1900 | Deep search with positional play; a real challenge |

## 📁 Project Structure

```
v0-chess-game-main/
├── backend/
│   ├── main.py                 # FastAPI application with AI engine
│   ├── pyproject.toml          # Python dependencies
│   └── backend.egg-info/       # Package metadata
├── frontend/
│   ├── app/
│   │   ├── page.tsx            # Main game page
│   │   ├── watch/page.tsx      # Watch page
│   │   ├── layout.tsx          # Root layout
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── chess-board.tsx     # Chess board component
│   │   ├── chess-piece.tsx     # Piece rendering
│   │   ├── control-panel.tsx   # Game controls
│   │   ├── fullscreen-game.tsx # Focus mode view
│   │   ├── move-history.tsx    # Move list
│   │   ├── analysis-panel.tsx  # Position analysis
│   │   └── ui/                 # Reusable UI components
│   ├── hooks/
│   │   ├── use-chess-game.tsx  # Main game logic
│   │   └── use-settings.tsx    # User preferences
│   ├── lib/
│   │   ├── api.ts              # Backend API client
│   │   ├── sounds.ts           # Audio synthesis
│   │   ├── themes.ts           # Board themes
│   │   └── utils.ts            # Utilities
│   ├── package.json
│   └── .env.local              # Environment config
└── README.md
```

## 🔌 API Endpoints

### `POST /ai-move`
Request an AI move for a given position.
```json
{
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "difficulty": "intermediate"
}
```

### `POST /analyze`
Analyze a position and get the best continuation.
```json
{
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "depth": 3
}
```

### `POST /classify-move`
Classify a move's quality (brilliant, best, good, inaccuracy, mistake, blunder).
```json
{
  "fen_before": "...",
  "fen_after": "...",
  "move_uci": "e2e4",
  "depth": 2
}
```

### `GET /health`
Health check endpoint.

## 🎨 Customization

### Board Themes
The app includes 6 pre-configured themes:
- Classic (Beige & Brown)
- Modern (Gray & Slate)
- Wood (Tan & Walnut)
- Ocean (Cyan & Teal)
- Forest (Sage & Pine)
- Midnight (Indigo & Navy)

Edit `frontend/lib/themes.ts` to add more themes.

### Settings
All user preferences are saved to localStorage:
- Board theme
- Coordinate display
- Legal move highlighting
- Last move highlighting
- Piece animations
- Sound effects
- Auto-queen promotion
- Resignation confirmation

## 🛠️ Technologies Used

### Frontend
- **Next.js 16.2** - React framework with App Router
- **TypeScript 5.7** - Type safety
- **Tailwind CSS 4.2** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **chess.js** - Chess move validation and game logic
- **Lucide React** - Icon library
- **Web Audio API** - Sound synthesis

### Backend
- **FastAPI** - Modern Python web framework
- **python-chess** - Chess move generation and validation
- **uvicorn** - ASGI server
- **Pydantic** - Data validation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the MIT License.

## 🔗 Built with v0

This repository is linked to a [v0](https://v0.app) project.

[Continue working on v0 →](https://v0.app/chat/projects/prj_2bwqWSgwSbcw3sWwOLwDnwaDSZP5)

<a href="https://v0.app/chat/api/kiro/clone/jatin223089-ui/v0-chess-game" alt="Open in Kiro"><img src="https://pdgvvgmkdvyeydso.public.blob.vercel-storage.com/open%20in%20kiro.svg?sanitize=true" /></a>

---

Made with ♟️ by the community
