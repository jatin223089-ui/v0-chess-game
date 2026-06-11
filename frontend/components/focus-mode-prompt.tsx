"use client"

import { Expand, X } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface FocusModePromptProps {
  onEnterFocusMode: () => void
}

export function FocusModePrompt({ onEnterFocusMode }: FocusModePromptProps) {
  const [open, setOpen] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)

  useEffect(() => {
    // Check if user has dismissed this before
    const dismissed = localStorage.getItem("focus-mode-prompt-dismissed")
    if (dismissed === "true") return

    // Show popup after 3 seconds of loading the page
    const timer = setTimeout(() => {
      setOpen(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const handleEnterFocusMode = () => {
    if (dontShowAgain) {
      localStorage.setItem("focus-mode-prompt-dismissed", "true")
    }
    setOpen(false)
    onEnterFocusMode()
  }

  const handleDismiss = () => {
    if (dontShowAgain) {
      localStorage.setItem("focus-mode-prompt-dismissed", "true")
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Expand className="h-5 w-5 text-primary" />
            Try Focus Mode
          </DialogTitle>
          <DialogDescription className="text-base">
            Get a distraction-free, immersive chess experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                ✓
              </div>
              <div>
                <p className="font-medium text-foreground">Larger Board</p>
                <p className="text-sm text-muted-foreground">
                  Maximized view for better piece visibility
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                ✓
              </div>
              <div>
                <p className="font-medium text-foreground">Cleaner Interface</p>
                <p className="text-sm text-muted-foreground">
                  Minimal distractions, maximum concentration
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                ✓
              </div>
              <div>
                <p className="font-medium text-foreground">Quick Access</p>
                <p className="text-sm text-muted-foreground">
                  Press <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-mono">⌘F</kbd> or{" "}
                  <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-mono">Ctrl+F</kbd> anytime
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 p-3">
            <input
              type="checkbox"
              id="dont-show"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="h-4 w-4 cursor-pointer rounded border-border"
            />
            <label
              htmlFor="dont-show"
              className="cursor-pointer text-sm text-muted-foreground"
            >
              Don't show this again
            </label>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button variant="outline" onClick={handleDismiss} className="flex-1">
            <X className="h-4 w-4" />
            Maybe Later
          </Button>
          <Button onClick={handleEnterFocusMode} className="flex-1">
            <Expand className="h-4 w-4" />
            Enter Focus Mode
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
