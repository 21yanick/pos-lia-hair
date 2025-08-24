'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useSidebar } from '@/shared/components/ui/sidebar'

export function SidebarAutoClose() {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()

  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is intentionally used as route change trigger
  useEffect(() => {
    // Auto-close sidebar on route change (mobile only)
    if (isMobile) {
      setOpenMobile(false)
    }
  }, [pathname, isMobile, setOpenMobile]) // V6.1 Performance Fix: pathname dependency needed for route change detection

  return null
}
