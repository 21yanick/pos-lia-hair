import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/shared/components/theme-provider"
import { OrganizationProvider } from "@/shared/contexts/OrganizationContext"
import { Toaster } from "@/shared/components/ui/sonner"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Coiffeursalon POS System",
  description: "Ein modernes Point-of-Sale System für einen Schweizer Coiffeursalon",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" suppressHydrationWarning className="h-full">
      <head>
        <link rel="preload" href="/Logo_black.png" as="image" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <OrganizationProvider>
            {children}
            <Toaster />
          </OrganizationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}