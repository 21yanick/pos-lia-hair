import type React from "react"
import { OrganizationProvider } from "@/modules/organization"

/**
 * 🔒 AUTHENTICATED ROUTES LAYOUT
 * 
 * Für authentifizierte Seiten die Organization Context benötigen.
 * 
 * Was hier ist:
 * - OrganizationProvider (für Organization-spezifische Logic)
 * - Auth-Guards werden in den jeweiligen Komponenten gehandhabt
 * 
 * Was NICHT hier ist:
 * - Public route handling (das ist in (auth) Layout)
 * - Global providers (das ist im Root Layout)
 * 
 * LÖST DAS PROBLEM:
 * - OrganizationProvider läuft nur auf authenticated pages
 * - Keine Race Conditions zwischen Middleware und Provider
 * - Saubere Trennung von Public/Authenticated Logic
 */

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <OrganizationProvider>
      {children}
    </OrganizationProvider>
  )
}