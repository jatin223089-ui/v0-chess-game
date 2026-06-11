"use client"

import { useState } from "react"
import { Crown, ExternalLink, Play, Trophy, Tv, Youtube } from "lucide-react"

import { SiteNav } from "@/components/site-nav"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

/** YouTube IDs checked with youtube.com/oembed (invalid IDs break links and thumbnails). */
const videos = [
  {
    id: "OCSbzArwB10",
    title: "How To Play Chess: The Ultimate Beginner Guide",
    channel: "GothamChess",
    views: "14M",
    category: "tutorials",
  },
  {
    id: "oTAPKCHvTh8",
    title: "Bravest Rook in Chess History — Steinitz's Immortal",
    channel: "Agadmator",
    views: "3.5M",
    category: "highlights",
  },
  {
    id: "2a93Fqqy9mM",
    title: "DESTROY with 1. d4: London and Queen's Gambit Openings",
    channel: "GothamChess",
    views: "800K",
    category: "analysis",
  },
  {
    id: "ej_fnsdsksA",
    title: "How To Play Chess: Learn All the Rules of the Game",
    channel: "Chess.com",
    views: "3.5M",
    category: "tutorials",
  },
  {
    id: "lnMg7otrVpE",
    title: "The Nimzo-Larsen Attack — Ideas, Principles, Plans",
    channel: "Hanging Pawns",
    views: "450K",
    category: "tutorials",
  },
  {
    id: "dv52uwNfFZg",
    title: '"The Applause" | Fischer vs Spassky | (1972) | Game 6',
    channel: "Agadmator",
    views: "3.2M",
    category: "matches",
  },
  {
    id: "fKRQT5-wAmg",
    title: "Magnus Carlsen's Best Game Ever",
    channel: "GothamChess",
    views: "2.9M",
    category: "highlights",
  },
  {
    id: "NLAY18hFFLo",
    title: "A Complete 1.d4 Opening Repertoire for White",
    channel: "Hanging Pawns",
    views: "190K",
    category: "tutorials",
  },
  {
    id: "EAHhI6IXdts",
    title: "Top 32 Checkmates You Must Know — Basic Mating Patterns",
    channel: "Chess Talk",
    views: "1.2M",
    category: "tutorials",
  },
  {
    id: "QscEFFZcrfY",
    title: "I Sacrificed My Queen for Checkmate",
    channel: "Agadmator",
    views: "1.6M",
    category: "highlights",
  },
  {
    id: "00Nfr_FfHwA",
    title: "Every Chess Beginner Should Watch This Lesson",
    channel: "GothamChess",
    views: "1.1M",
    category: "tutorials",
  },
  {
    id: "xmXwdoRG43U",
    title: "Magnus Carlsen Blind & Timed Chess Simul (Full)",
    channel: "Magnus Carlsen",
    views: "4.5M",
    category: "matches",
  },
]

const categories = [
  { id: "all", name: "All" },
  { id: "matches", name: "Matches" },
  { id: "tutorials", name: "Tutorials" },
  { id: "highlights", name: "Highlights" },
  { id: "analysis", name: "Analysis" },
]

export default function WatchPage() {
  const [activeCategory, setActiveCategory] = useState("all")

  return (
    <main className="min-h-dvh w-full min-w-0 overflow-x-hidden bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card/60 backdrop-blur">
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-2.5 sm:px-4 sm:py-3 lg:px-8">
          <a href="/" className="flex min-w-0 items-center gap-2 sm:gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Crown className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0 leading-tight">
              <div className="font-serif text-base text-foreground sm:text-lg">Gambit</div>
              <div className="hidden text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:block">
                Play Chess
              </div>
            </div>
          </a>
          <SiteNav className="justify-self-center" />
          <a
            href="https://www.youtube.com/results?search_query=chess+tutorial"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground hover:text-foreground sm:gap-2 sm:text-sm"
          >
            <Youtube className="h-5 w-5 shrink-0 text-red-500" />
            <span className="hidden min-[400px]:inline">Search</span>
            <ExternalLink className="hidden h-3 w-3 shrink-0 sm:inline" />
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-3 py-6 pb-8 sm:px-4 sm:py-8 sm:pb-10 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="flex items-center gap-3 font-serif text-2xl font-bold sm:text-3xl">
              <Tv className="h-7 w-7 shrink-0 sm:h-8 sm:w-8" />
              Watch
            </h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              Chess videos from YouTube
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-lg bg-muted px-4 py-6 text-center sm:p-8">
          <p className="text-sm text-muted-foreground sm:text-base">
            Tap a video to open it on YouTube
          </p>
        </div>

        <Tabs
          value={activeCategory}
          onValueChange={setActiveCategory}
          className="w-full"
        >
          <TabsList className="mb-6 h-auto min-h-9 w-full max-w-full flex-nowrap justify-start gap-1 overflow-x-auto rounded-lg p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className="shrink-0 px-3 text-xs sm:text-sm"
              >
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((cat) => {
            const filtered =
              cat.id === "all"
                ? videos
                : videos.filter((v) => v.category === cat.id)
            return (
              <TabsContent key={cat.id} value={cat.id} className="mt-0 outline-none">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                  {filtered.map((video) => (
                    <a
                      key={video.id}
                      href={`https://www.youtube.com/watch?v=${video.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block min-w-0"
                    >
                      <Card className="cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:ring-2 hover:ring-primary active:opacity-90">
                        <div className="relative aspect-video bg-muted">
                          <img
                            src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                            alt={video.title}
                            className="h-full w-full object-cover"
                          />
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20 sm:bg-black/30 sm:opacity-0 sm:transition-opacity sm:hover:opacity-100">
                            <div className="rounded-full bg-red-500 p-3 sm:p-4">
                              <Play className="h-6 w-6 text-white sm:h-8 sm:w-8" fill="white" />
                            </div>
                          </div>
                          <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 font-mono text-[10px] text-white sm:text-xs">
                            ▶ YouTube
                          </div>
                        </div>
                        <CardContent className="p-3 sm:p-4">
                          <CardTitle className="line-clamp-2 text-sm leading-snug">
                            {video.title}
                          </CardTitle>
                          <CardDescription className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                            <span className="font-medium text-foreground">{video.channel}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{video.views} views</span>
                          </CardDescription>
                        </CardContent>
                      </Card>
                    </a>
                  ))}
                </div>
              </TabsContent>
            )
          })}
        </Tabs>

        {/* Quick Links */}
        <div className="mt-12">
          <h2 className="mb-4 text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Popular Chess Content
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "GothamChess", subs: "2.5M", url: "https://www.youtube.com/c/GothamChess" },
              { name: "Chess.com", subs: "3.1M", url: "https://www.youtube.com/c/ChessCom" },
              { name: "Agadmator", subs: "1.8M", url: "https://www.youtube.com/c/Agadmator" },
              { name: "Hikaru", subs: "900K", url: "https://www.youtube.com/c/GMHikaru" },
            ].map((channel) => (
              <a
                key={channel.name}
                href={channel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card className="transition-colors hover:bg-accent">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white font-bold">
                      {channel.name[0]}
                    </div>
                    <div>
                      <div className="font-medium">{channel.name}</div>
                      <div className="text-xs text-muted-foreground">{channel.subs} subscribers</div>
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>

        {/* Direct YouTube Links */}
        <div className="mt-8">
          <h3 className="mb-3 text-lg font-semibold">Watch on YouTube</h3>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://www.youtube.com/results?search_query=chess+tutorial+beginner"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
            >
              <Youtube className="h-4 w-4" />
              Chess Tutorials
            </a>
            <a
              href="https://www.youtube.com/results?search_query=chess+puzzles"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700"
            >
              <Youtube className="h-4 w-4" />
              Chess Puzzles
            </a>
            <a
              href="https://www.youtube.com/results?search_query=world+chess+championship"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700"
            >
              <Youtube className="h-4 w-4" />
              Championships
            </a>
            <a
              href="https://www.youtube.com/results?search_query=chess+analysis"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700"
            >
              <Youtube className="h-4 w-4" />
              Analysis
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}