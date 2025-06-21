import type React from "react"

/**
 * 🔓 PUBLIC ROUTES LAYOUT
 * 
 * Für nicht-authentifizierte Seiten wie Login, Register, etc.
 * 
 * Was NICHT hier ist:
 * - OrganizationProvider (würde Race Conditions verursachen)
 * - Komplexe Auth-Guards (nur für protected routes nötig)
 * 
 * Was hier ist:
 * - Minimales Layout für public pages
 * - Shared styling/structure für auth pages
 */

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Public routes content - clean and simple */}
      {children}
    </div>
  )
}