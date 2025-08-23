'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef } from 'react'

/**
 * Global Page Visibility Handler
 *
 * Handles browser tab focus/visibility changes with targeted
 * invalidation to avoid over-fetching and race conditions.
 *
 * Features:
 * - Debounced event handling
 * - Targeted query invalidation
 * - Excludes core auth/org queries
 * - Performance optimized
 */
export function PageVisibilityHandler() {
  const queryClient = useQueryClient()
  const isInitialLoad = useRef(true)
  const debounceTimer = useRef<number | undefined>(undefined) // V6.1 Pattern 18: Type Guard - React 19 useRef requires initial value

  const handleTabFocus = useCallback(() => {
    // Skip initial page load to avoid unnecessary requests
    if (isInitialLoad.current) {
      isInitialLoad.current = false
      return
    }

    // Clear any existing debounce timer
    if (debounceTimer.current) {
      window.clearTimeout(debounceTimer.current)
    }

    // Debounce to avoid multiple rapid calls
    debounceTimer.current = window.setTimeout(() => {
      // console.log('🔄 Tab refocused: Refreshing data queries...')

      // 🎯 TARGETED INVALIDATION: Only invalidate data queries
      // Use actual query key patterns from queryKeys.ts

      // Business data queries (organization-scoped)
      queryClient.invalidateQueries({
        queryKey: ['business'],
        exact: false,
      })

      // Note: We don't need to specify each sub-key individually
      // because ['business'] will match all business.* queries
      // like ['business', orgId, 'expenses'], ['business', orgId, 'cash'], etc.

      // This approach is more maintainable and covers:
      // - expenses, cash, sales, items, documents
      // - dashboard stats and real-time data
      // - all organization-scoped business data
    }, 300) // 300ms debounce to avoid rapid-fire events
  }, [queryClient])

  useEffect(() => {
    // 🎯 SINGLE EVENT STRATEGY: Only use visibilitychange for reliability
    // This is more reliable than window focus and avoids duplicates
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleTabFocus()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)

      // Cleanup debounce timer
      if (debounceTimer.current) {
        window.clearTimeout(debounceTimer.current)
      }
    }
  }, [handleTabFocus])

  // This component doesn't render anything
  return null
}
