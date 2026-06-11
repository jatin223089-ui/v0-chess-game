# 🎮 Features Guide

This document provides a detailed overview of all features in the Gambit Chess Game.

## 🚀 Focus Mode Prompt (New!)

When you first visit the game, a friendly popup appears after 3 seconds suggesting you try Focus Mode for the best experience.

### Benefits Highlighted:
- ✓ **Larger Board** - Maximized view for better piece visibility
- ✓ **Cleaner Interface** - Minimal distractions, maximum concentration  
- ✓ **Quick Access** - Press `⌘F` (Mac) or `Ctrl+F` (Windows) anytime

### User Options:
- **Enter Focus Mode** - Immediately enters fullscreen/focus mode
- **Maybe Later** - Dismisses the popup and continues with normal view
- **Don't show again** - Checkbox to permanently dismiss the suggestion

The prompt is stored in browser localStorage, so if you check "Don't show again", it won't appear on future visits.

## 🎯 Core Gameplay Features

### Chess Rules & Movement
- ✅ Full chess rules implementation using chess.js library
- ✅ Legal move validation
- ✅ Castling (both kingside and queenside)
- ✅ En passant captures
- ✅ Pawn promotion (auto-queen or manual selection)
- ✅ Check, checkmate, and stalemate detection
- ✅ Draw detection (50-move rule, threefold repetition, insufficient material)

### AI Opponent
- **5 Difficulty Levels**: Beginner (~600) to Expert (~1900)
- **Minimax Algorithm** with alpha-beta pruning
- **Depth Search**: 1-5 plies depending on difficulty
- **Position Evaluation**: Piece values + piece-square tables
- **Move Ordering**: Captures and promotions prioritized for better pruning
- **Randomness Factor**: Lower difficulties include intentional variety

### Move Quality Analysis
Every player move is automatically classified:
- ⚡ **Brilliant** (`!!`) - Outstanding tactical or sacrificial move
- ✓ **Best** (`!`) - Optimal move in the position
- ✓ **Good** - Solid move that maintains advantage
- ⚠️ **Inaccuracy** (`?!`) - Slightly imprecise
- ❌ **Mistake** (`?`) - Worsens position significantly
- 🚫 **Blunder** (`??`) - Serious error with large evaluation swing

## 🎨 Visual Features

### Board Themes (6 Available)
1. **Classic** (Default) - Beige & Brown tournament style
2. **Modern** - Gray & Slate contemporary
3. **Wood** - Tan & Walnut natural
4. **Ocean** - Cyan & Teal aquatic
5. **Forest** - Sage & Pine nature
6. **Midnight** - Indigo & Navy night

Each theme includes:
- Coordinated light/dark square colors
- Theme-specific legal move indicators
- Custom move highlights
- Check warning glow
- Arrow and selection colors

### Visual Indicators
- 🟢 **Legal Move Dots** - Show where selected piece can move
- 🔴 **Capture Rings** - Highlight capturable pieces
- 💛 **Last Move Highlight** - Shows previous move made
- 🔴 **Check Glow** - Radial glow on king in check
- 💡 **Hint Arrows** - Shows best move when hint requested
- ✍️ **User Annotations** - Right-click to draw arrows and mark squares

### Settings & Preferences
- ☑️ Show/hide board coordinates
- ☑️ Show/hide legal moves
- ☑️ Highlight last move
- ☑️ Piece animations on/off
- 🔊 Sound effects toggle
- ♕ Auto-promote to Queen
- ⚠️ Confirm before resigning

## 📖 Move Notation & History

### Enhanced Move Display
- **Chess Piece Symbols**: ♔ ♕ ♖ ♗ ♘ ♙
- **Standard Algebraic Notation** (SAN): e4, Nf3, Bxc6, O-O
- **Move Quality Annotations**: !, !!, ?, ??, ?!
- **Clickable Moves** - Click any move to view that position
- **Turn Counter** - Shows turns vs total moves (e.g., "13 turns • 26 moves")

### Move History Legend
Automatically shows when quality annotations appear:
```
!! = Brilliant
! = Best
?! = Inaccuracy
? = Mistake
?? = Blunder
```

### Navigation
- ⏮️ Jump to start position
- ◀️ Previous move (← arrow key)
- ▶️ Next move (→ arrow key)  
- ⏭️ Jump to current position

## 🎮 User Interface

### Main View Components
1. **Game Board** - 8x8 chess board with pieces
2. **Player Cards** - Show active player and captured pieces
3. **Move History Panel** - Scrollable list of all moves
4. **Control Panel** - Game settings and actions
5. **Analysis Panel** - Position evaluation and suggestions

### Focus Mode (Fullscreen)
- 🖥️ Maximized board for better visibility
- 🎯 Cleaner interface with fewer distractions
- 📱 Responsive scaling on all devices
- ⌨️ Keyboard shortcuts work (F, Esc, arrows, [, ])

### Beginner's Guide (New!)
Helpful panel in control section:
- Click a piece to see where it can move
- Green dots show legal moves
- Click a highlighted square to move
- Use hints (]) when stuck

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `F` | Flip board orientation |
| `⌘F` / `Ctrl+F` | Enter/exit focus mode |
| `←` | Previous move |
| `→` | Next move |
| `[` | Take back last move |
| `]` | Request hint (shows best move) |
| `Esc` | Exit focus mode |

## 🖱️ Mouse Controls

### Left Click
- **Select piece** - Click your piece to select it
- **Move piece** - Click highlighted square to move
- **Deselect** - Click elsewhere to deselect
- **Navigate moves** - Click moves in history to view position

### Right Click (Drawing)
- **Click & release** on square = Mark square (red circle)
- **Click, drag, release** = Draw arrow from start to end square
- **Click same annotation** = Remove it
- Annotations clear automatically on next move

## 🔊 Sound Effects

Synthesized audio cues for:
- ♟️ **Move** - Regular piece movement
- ⚔️ **Capture** - Taking opponent's piece
- 🏰 **Castle** - Castling move
- 👑 **Promotion** - Pawn promotion
- ⚠️ **Check** - King in check
- 🏁 **Checkmate** - Game over by checkmate
- 🤝 **Draw** - Game drawn
- 🎵 **Start** - New game begins
- 🖱️ **Click** - UI interactions
- ❌ **Illegal** - Invalid move attempt

## 🤖 AI Features

### Difficulty Profiles
```
Beginner     - Depth 1, High randomness, ~600 ELO
Casual       - Depth 2, Medium randomness, ~1000 ELO
Intermediate - Depth 3, Low randomness, ~1400 ELO
Advanced     - Depth 4, No randomness, ~1700 ELO
Expert       - Depth 5, No randomness, ~1900 ELO
```

### Position Analysis
- **Evaluate Position** - Get AI assessment of current position
- **Classification** - "Winning", "Better", "Equal", "Worse", "Losing"
- **Best Line** - Shows principal variation (best continuation)
- **Centipawn Score** - Numerical advantage (+2.5 = 2.5 pawns ahead)
- **Comment** - Natural language explanation

### Hints System
Press `]` or click Hint button to:
- See the AI's recommended best move
- Highlighted with special glow effect
- Auto-clears after 4 seconds
- Only available on your turn

## 📱 Responsive Design

### Mobile Optimizations
- Touch-friendly piece selection
- Swipe gestures for move navigation (planned)
- Portrait and landscape support
- Optimized board sizing
- Fullscreen mode recommended

### Desktop Enhancements
- Larger board for better visibility
- Keyboard shortcuts for power users
- Multi-panel layout with sidebar
- Hover effects and tooltips

## 🎓 Learning Features

### Automatic Move Classification
- Every move you make is evaluated by the AI
- Get instant feedback on move quality
- Learn from mistakes with evaluation deltas
- See which moves improved/worsened position

### Analysis Mode
- Analyze any position at any time
- Get AI suggestions for best moves
- Understand position evaluation
- Learn strategic and tactical concepts

### Take-Back Feature
- Undo moves to try different lines
- Takes back both your move and AI response
- Great for learning and experimentation
- No penalty - practice freely!

## 📺 Watch Section

Educational content integration:
- Curated chess tutorial videos
- Filter by category (Matches, Tutorials, Highlights, Analysis)
- Links to popular chess YouTubers (GothamChess, Agadmator, etc.)
- Direct YouTube integration
- Video thumbnails and metadata
- Quick search links for specific topics

## 🎯 Planned Features

Future enhancements under consideration:
- Opening book integration
- Endgame tablebase support
- Game save/load with PGN export
- Multiplayer mode (online)
- Puzzle mode with tactics training
- Time controls (blitz, rapid, classical)
- Match history and statistics
- Player rating system
- Tournament mode
- Custom board themes creator

---

**Tip**: For the best experience, we recommend using Focus Mode (⌘F) which maximizes the board and minimizes distractions!
