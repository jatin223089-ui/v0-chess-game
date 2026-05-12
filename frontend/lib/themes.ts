// Board themes — each theme drives CSS custom properties at runtime, so the
// chess board doesn't have to know about colors at all. Adding a theme means
// extending this registry; no other file changes required.

export type ThemeId =
  | "classic"
  | "tournament"
  | "forest"
  | "ocean"
  | "midnight"
  | "neon"
  | "coral"

export interface BoardTheme {
  id: ThemeId
  name: string
  /** Short label shown next to the swatch in the picker. */
  hint: string
  light: string
  dark: string
  /** Soft overlay applied to last-move squares. */
  highlight: string
  /** Tint for the small dot/ring marking a legal move target. */
  legalDot: string
  /** Radial glow under a king that's in check. */
  checkGlow: string
  /** Outer panel/background tint behind the board itself. */
  surface: string
  /** Stroke color for user-drawn arrows / squares. */
  ink: string
}

export const BOARD_THEMES: Record<ThemeId, BoardTheme> = {
  classic: {
    id: "classic",
    name: "Classic Wood",
    hint: "Warm tournament wood",
    light: "#e9d6a8",
    dark: "#8c6a44",
    highlight: "rgba(247, 199, 92, 0.45)",
    legalDot: "rgba(34, 28, 18, 0.32)",
    checkGlow: "#e85a3b",
    surface: "#1a1612",
    ink: "#f7c75c",
  },
  tournament: {
    id: "tournament",
    name: "Tournament",
    hint: "Classic chess olympiad",
    light: "#f0d9b5",
    dark: "#b58863",
    highlight: "rgba(255, 213, 79, 0.45)",
    legalDot: "rgba(30, 30, 30, 0.30)",
    checkGlow: "#e85a3b",
    surface: "#171513",
    ink: "#ffb74d",
  },
  forest: {
    id: "forest",
    name: "Forest",
    hint: "Online standard green",
    light: "#ebecd0",
    dark: "#739552",
    highlight: "rgba(247, 236, 91, 0.55)",
    legalDot: "rgba(20, 30, 18, 0.32)",
    checkGlow: "#e74c3c",
    surface: "#121814",
    ink: "#a3d977",
  },
  ocean: {
    id: "ocean",
    name: "Ocean",
    hint: "Calm tournament blue",
    light: "#dde6ed",
    dark: "#5d7e9b",
    highlight: "rgba(255, 209, 102, 0.45)",
    legalDot: "rgba(15, 25, 40, 0.32)",
    checkGlow: "#e94e4e",
    surface: "#0f1620",
    ink: "#7cc4ff",
  },
  midnight: {
    id: "midnight",
    name: "Midnight",
    hint: "Slate study mode",
    light: "#4a4944",
    dark: "#22211e",
    highlight: "rgba(255, 196, 99, 0.40)",
    legalDot: "rgba(245, 240, 230, 0.30)",
    checkGlow: "#ef5350",
    surface: "#0d0c0b",
    ink: "#e9b262",
  },
  neon: {
    id: "neon",
    name: "Neon",
    hint: "Cyber arcade",
    light: "#1d2740",
    dark: "#0c1124",
    highlight: "rgba(255, 89, 196, 0.45)",
    legalDot: "rgba(120, 230, 255, 0.55)",
    checkGlow: "#ff45a0",
    surface: "#05060f",
    ink: "#7df9ff",
  },
  coral: {
    id: "coral",
    name: "Coral",
    hint: "Warm sunset",
    light: "#f6e0c4",
    dark: "#c97c63",
    highlight: "rgba(255, 213, 79, 0.50)",
    legalDot: "rgba(60, 30, 25, 0.30)",
    checkGlow: "#d62828",
    surface: "#1a1310",
    ink: "#ffa07a",
  },
}

export const THEME_LIST = Object.values(BOARD_THEMES)

/** Returns inline CSS variables that components reference. */
export function themeCssVars(theme: BoardTheme): React.CSSProperties {
  return {
    ["--board-light" as string]: theme.light,
    ["--board-dark" as string]: theme.dark,
    ["--move-highlight" as string]: theme.highlight,
    ["--legal-dot" as string]: theme.legalDot,
    ["--check-glow" as string]: theme.checkGlow,
    ["--board-surface" as string]: theme.surface,
    ["--board-ink" as string]: theme.ink,
  }
}
