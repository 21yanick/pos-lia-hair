'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useSidebar } from '@/shared/components/ui/sidebar'

export function SidebarAutoClose() {
  const _pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()

  useEffect(() => {
    // Auto-close sidebar on route change (mobile only)
    if (isMobile) {
      setOpenMobile(false)
    }
  }, [isMobile, setOpenMobile])

  return null
}
