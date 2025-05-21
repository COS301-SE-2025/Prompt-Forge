import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Prompt Forge",
  description: "Discover, Test & Master AI Prompts",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "antialiased")}>
        <ThemeProvider defaultTheme="dark" storageKey="prompt-forge-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
