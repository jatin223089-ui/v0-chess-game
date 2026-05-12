"use client"

import { Check, Settings2, Volume2, VolumeX } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useSettings } from "@/hooks/use-settings"
import { THEME_LIST, type BoardTheme } from "@/lib/themes"
import { cn } from "@/lib/utils"

interface SettingsDialogProps {
  trigger?: React.ReactNode
}

export function SettingsDialog({ trigger }: SettingsDialogProps) {
  const { settings, theme, update, reset } = useSettings()

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="sm" aria-label="Settings">
            <Settings2 className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 pb-4 pt-6">
          <DialogTitle className="font-serif text-xl">Display & Audio</DialogTitle>
          <DialogDescription>
            Customize how the board looks and plays. Preferences save automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] space-y-6 overflow-y-auto px-6 py-5">
          {/* Board theme picker */}
          <section>
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Board Theme
            </Label>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {THEME_LIST.map((t) => (
                <ThemeSwatch
                  key={t.id}
                  theme={t}
                  active={settings.themeId === t.id}
                  onSelect={() => update("themeId", t.id)}
                />
              ))}
            </div>
          </section>

          <Separator />

          {/* Toggles */}
          <section className="space-y-3">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Board
            </Label>
            <ToggleRow
              id="coords"
              label="Show coordinates"
              description="Display file letters and rank numbers on the board."
              checked={settings.showCoordinates}
              onChange={(v) => update("showCoordinates", v)}
            />
            <ToggleRow
              id="legal"
              label="Show legal moves"
              description="Highlight valid target squares for the selected piece."
              checked={settings.showLegalMoves}
              onChange={(v) => update("showLegalMoves", v)}
            />
            <ToggleRow
              id="last"
              label="Highlight last move"
              description="Tint the squares of the most recently played move."
              checked={settings.highlightLastMove}
              onChange={(v) => update("highlightLastMove", v)}
            />
            <ToggleRow
              id="anim"
              label="Piece animations"
              description="Subtle pop-in animation when pieces are placed."
              checked={settings.animationsEnabled}
              onChange={(v) => update("animationsEnabled", v)}
            />
          </section>

          <Separator />

          <section className="space-y-3">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Audio
            </Label>
            <ToggleRow
              id="sound"
              label="Sound effects"
              description="Synthesized move, capture, check, and checkmate cues."
              checked={settings.soundEnabled}
              onChange={(v) => update("soundEnabled", v)}
              icon={
                settings.soundEnabled ? (
                  <Volume2 className="h-3.5 w-3.5" />
                ) : (
                  <VolumeX className="h-3.5 w-3.5" />
                )
              }
            />
          </section>

          <Separator />

          <section className="space-y-3">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Gameplay
            </Label>
            <ToggleRow
              id="auto-q"
              label="Auto-promote to Queen"
              description="Pawns reaching the back rank become a Queen automatically."
              checked={settings.autoQueen}
              onChange={(v) => update("autoQueen", v)}
            />
            <ToggleRow
              id="confirm-resign"
              label="Confirm before resigning"
              description="Ask before ending the game."
              checked={settings.confirmResign}
              onChange={(v) => update("confirmResign", v)}
            />
          </section>
        </div>

        <div className="flex items-center justify-between border-t border-border bg-card/40 px-6 py-3 text-xs">
          <span className="text-muted-foreground">
            Current theme: <span className="text-foreground">{theme.name}</span>
          </span>
          <Button variant="ghost" size="sm" onClick={reset}>
            Reset to defaults
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ThemeSwatch({
  theme,
  active,
  onSelect,
}: {
  theme: BoardTheme
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        "group relative flex flex-col gap-2 rounded-md border p-2 text-left transition",
        active
          ? "border-primary bg-primary/5"
          : "border-border bg-background hover:border-primary/40",
      )}
    >
      <div className="flex h-14 w-full overflow-hidden rounded-sm">
        <Mini2x2 light={theme.light} dark={theme.dark} />
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-foreground">
            {theme.name}
          </div>
          <div className="truncate text-[10px] text-muted-foreground">
            {theme.hint}
          </div>
        </div>
        {active && (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-3 w-3" />
          </span>
        )}
      </div>
    </button>
  )
}

function Mini2x2({ light, dark }: { light: string; dark: string }) {
  return (
    <div className="grid h-full w-full grid-cols-4 grid-rows-2">
      {Array.from({ length: 8 }).map((_, i) => {
        const row = Math.floor(i / 4)
        const col = i % 4
        const isLight = (row + col) % 2 === 0
        return (
          <div
            key={i}
            style={{ background: isLight ? light : dark }}
          />
        )
      })}
    </div>
  )
}

function ToggleRow({
  id,
  label,
  description,
  checked,
  onChange,
  icon,
}: {
  id: string
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
  icon?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-1 items-start gap-2">
        {icon && <span className="mt-0.5 text-muted-foreground">{icon}</span>}
        <div>
          <Label htmlFor={id} className="cursor-pointer text-sm text-foreground">
            {label}
          </Label>
          <p className="text-pretty text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
