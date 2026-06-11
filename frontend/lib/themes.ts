// Board color themes. Each provides CSS custom properties that the board
// component consumes. This system makes it simple to switch visual styles
// without re-rendering the entire board.

export interface BoardTheme {
  id: string
  name: string
  hint: string
  light: string
  dark: string
  surface: string
  coords: string
}

export const BOARD_THEMES: Record<string, BoardTheme> = {
  classic: {
    id: "classic",
    name: "Classic",
    hint: "Beige & Brown",
    light: "#f0d9b5",
    dark: "#b58863",
    surface: "#1a1410",
    coords: "#b58863",
  },
  modern: {
    id: "modern",
    name: "Modern",
    hint: "Gray & Slate",
    light: "#e5e7eb",
    dark: "#6b7280",
    surface: "#111827",
    coords: "#6b7280",
  },
  wood: {
    id: "wood",
    name: "Wood",
    hint: "Tan & Walnut",
    light: "#d4af82",
    dark: "#8b5a3c",
    surface: "#1c1410",
    coords: "#8b5a3c",
  },
  ocean: {
    id: "ocean",
    name: "Ocean",
    hint: "Cyan & Teal",
    light: "#cffafe",
    dark: "#14b8a6",
    surface: "#042f2e",
    coords: "#14b8a6",
  },
  forest: {
    id: "forest",
    name: "Forest",
    hint: "Sage & Pine",
    light: "#d1fae5",
    dark: "#059669",
    surface: "#064e3b",
    coords: "#059669",
  },
  midnight: {
    id: "midnight",
    name: "Midnight",
    hint: "Indigo & Navy",
    light: "#c7d2fe",
    dark: "#4f46e5",
    surface: "#1e1b4b",
    coords: "#4f46e5",
  },
}

export const THEME_LIST = Object.values(BOARD_THEMES)

export type ThemeId = keyof typeof BOARD_THEMES

export function themeCssVars(theme: BoardTheme): React.CSSProperties {
  return {
    "--board-light": theme.light,
    "--board-dark": theme.dark,
    "--board-surface": theme.surface,
    "--board-coords": theme.coords,
  } as React.CSSProperties
}
