'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Debug Navigation Hook
 * Tracks URL changes and router events for debugging organization switching
 */
export function useDebugNavigation() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // console.log('🧭 NAVIGATION DEBUG - Pathname changed:', pathname)

    // Extract org slug from current path
    const orgMatch = pathname.match(/^\/org\/([^/]+)/)
    if (orgMatch) {
      // console.log('🧭 NAVIGATION DEBUG - Current org slug:', orgMatch[1])
    } else {
      // console.log('🧭 NAVIGATION DEBUG - No org slug in path')
    }
  }, [pathname])

  // Helper function to track router.push calls
  const debugPush = (url: string) => {
    // console.log('🧭 NAVIGATION DEBUG - router.push called:', url)
    router.push(url)
  }

  const debugReplace = (url: string) => {
    // console.log('🧭 NAVIGATION DEBUG - router.replace called:', url)
    router.replace(url)
  }

  return {
    pathname,
    debugPush,
    debugReplace,
    currentOrgSlug: pathname.match(/^\/org\/([^/]+)/)?.[1] || null,
  }
}
