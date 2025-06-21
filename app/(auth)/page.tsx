import { redirect } from "next/navigation"

/**
 * 🏠 ROOT LANDING PAGE
 * 
 * Diese Page wird bei pos.lia-hair.ch geladen.
 * 
 * Da sie in der (auth) Route Group ist:
 * - Kein OrganizationProvider aktiv
 * - Middleware handled Authentication (redirect to /login if needed)
 * - Authentifizierte User werden zu /organizations weitergeleitet
 */

export default function Home() {
  // Redirect zu organizations für authentifizierte User
  // Middleware handled nicht-authentifizierte User (redirect to /login)
  redirect("/organizations")
  return null
}