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
  title: "LIA HAIR - POS System",
  description: "Professional Hair Salon Point of Sale System - Appointments, Sales, Customer Management",
  generator: 'Next.js',
  manifest: '/manifest.json',
  keywords: ['hair salon', 'pos system', 'appointments', 'beauty', 'switzerland', 'pwa'],
  authors: [{ name: 'LIA HAIR' }],
  creator: 'LIA HAIR',
  publisher: 'LIA HAIR',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LIA HAIR',
    startupImage: [
      '/icons/apple-touch-icon.png',
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'LIA HAIR',
    'application-name': 'LIA HAIR',
    'msapplication-TileColor': '#2a2a2e',
    'msapplication-tap-highlight': 'no',
  },
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
        <link rel="icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="theme-color" content="#2a2a2e" />
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