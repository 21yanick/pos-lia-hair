import type React from "react"
import { OrganizationGuard } from "@/shared/components/auth/OrganizationGuard"
import { Sidebar } from "@/shared/components/layout/sidebar"
import { Header } from "@/shared/components/layout/header"

interface OrganizationLayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export default async function OrganizationLayout({
  children,
  params,
}: OrganizationLayoutProps) {
  const { slug } = await params
  
  return (
    <OrganizationGuard slug={slug} requireOrganization={true}>
      <div className="flex h-screen bg-muted/30">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </OrganizationGuard>
  )
}