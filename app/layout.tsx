import type React from "react"
import type { Metadata } from "next"
// ✅ GDPR-COMPLIANT: Local Inter Variable Font hosting
import { ThemeProvider } from "@/shared/components/theme-provider"
import { QueryProvider } from "@/shared/lib/react-query"
import { Toaster } from "@/shared/components/ui/sonner"
// EnterprisePDFProvider removed - replaced by simple PDF modal hook
import { inter } from "@/shared/styles/fonts"
import "./globals.css"

export const metadata: Metadata = {
  title: "Coiffeursalon POS System",
  description: "Ein modernes Point-of-Sale System für einen Schweizer Coiffeursalon",
  generator: 'v0.dev'
}

// 🏗️ SIMPLIFIED ARCHITECTURE
// No global OrganizationProvider - using URL-based organization selection
// Auth & Organization context handled at page/component level
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" suppressHydrationWarning className="h-full">
      <head>
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}