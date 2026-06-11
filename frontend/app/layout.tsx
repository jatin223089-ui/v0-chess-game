import type { Metadata, Viewport } from "next"
import { Inter, Playfair_Display } from "next/font/google"

import { SettingsProvider } from "@/hooks/use-settings"

import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Gambit — Play Chess Against AI",
  description:
    "An interactive chess study with a Minimax AI opponent, move history, and built-in position analysis.",
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#1a1612",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} bg-background`}>
      <body className="min-h-dvh overflow-x-hidden font-sans antialiased">
        <SettingsProvider>{children}</SettingsProvider>
      </body>
    </html>
  )
}
