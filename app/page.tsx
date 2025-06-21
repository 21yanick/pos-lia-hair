import { redirect } from "next/navigation"

/**
 * 🏠 ROOT LANDING PAGE - CLIENT-SIDE AUTH ARCHITECTURE
 * 
 * Simple redirect to /organizations.
 * Auth Guards on /organizations handle authentication logic.
 */

export default function Home() {
  redirect("/organizations")
  return null
}