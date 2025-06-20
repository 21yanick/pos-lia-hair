"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { useSidebar } from "@/shared/components/ui/sidebar"

export function SidebarAutoClose() {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()

  useEffect(() => {
    // Auto-close sidebar on route change (mobile only)
    if (isMobile) {
      setOpenMobile(false)
    }
  }, [pathname, isMobile, setOpenMobile])

  return null
}