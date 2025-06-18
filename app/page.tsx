import { redirect } from "next/navigation"

export default function Home() {
  // Clean Multi-Tenant Architecture: Direct redirect to primary organization
  // OrganizationGuard in /org/[slug] will handle auth checks & redirect to login if needed
  redirect("/org/lia-hair/dashboard")
  return null
}

