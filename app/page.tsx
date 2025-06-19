import { redirect } from "next/navigation"

export default function Home() {
  // Multi-Tenant Architecture: Redirect to organizations page
  // This route has proper auth guards and will:
  // - Redirect to /login if not authenticated
  // - Show organization selector if multiple orgs
  // - Auto-redirect to single org dashboard if only one org
  redirect("/organizations")
  return null
}

