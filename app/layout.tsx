import type React from "react"
import type { Metadata } from "next"
// ✅ GDPR-COMPLIANT: Local Inter Variable Font hosting
import { ThemeProvider } from "@/shared/components/theme-provider"
import { QueryProvider } from "@/shared/lib/react-query"
import { OrganizationProvider } from "@/modules/organization"
import { Toaster } from "@/shared/components/ui/sonner"
import { MobileDebugPanel } from "@/shared/components/debug/MobileDebugPanel"
import { inter } from "@/shared/styles/fonts"
import "./globals.css"

export const metadata: Metadata = {
  title: "Coiffeursalon POS System",
  description: "Ein modernes Point-of-Sale System für einen Schweizer Coiffeursalon",
  generator: 'v0.dev'
}

// 🏗️ CLIENT-SIDE AUTH ARCHITECTURE
// OrganizationProvider läuft immer, aber macht nur Organization Logic
// Auth Guards in Pages handhaben alle Auth Redirects
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
            <OrganizationProvider>
              {children}
            </OrganizationProvider>
            <Toaster />
            <MobileDebugPanel />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}