import { cn } from "@/lib/utils"

export function SiteNav({ className }: { className?: string }) {
  return (
    <nav
      className={cn(
        "flex shrink-0 items-center gap-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:gap-5 sm:text-xs",
        className,
      )}
      aria-label="Main"
    >
      <a href="/" className="text-foreground hover:text-foreground">
        Play
      </a>
      <a href="/watch" className="hover:text-foreground">
        Watch
      </a>
    </nav>
  )
}
