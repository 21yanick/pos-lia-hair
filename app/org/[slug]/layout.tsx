import type React from "react"
import { OrganizationRoute } from "@/shared/components/auth"
import { AppSidebar } from "@/shared/components/layout/app-sidebar"
import { Header } from "@/shared/components/layout/header"
import { SidebarAutoClose } from "@/shared/components/layout/sidebar-auto-close"
import { SidebarProvider, SidebarInset } from "@/shared/components/ui/sidebar"

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
    <OrganizationRoute>
      <SidebarProvider>
        <SidebarAutoClose />
        <AppSidebar />
        <SidebarInset>
          <Header />
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </OrganizationRoute>
  )
}