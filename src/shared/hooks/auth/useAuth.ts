'use client'

import type { User } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { supabase } from '@/shared/lib/supabase/client'

interface AuthReturn {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  signOut: () => Promise<void>
}

/**
 * Simplified Auth Hook - Core Authentication Only
 *
 * BEFORE: 170+ lines with complex DB loading, deprecated hooks
 * AFTER:  ~40 lines focused only on auth state
 *
 * Changes:
 * - Uses Supabase User directly (no DB user table queries)
 * - Stable useEffect without complex callbacks
 * - Mounted flag prevents memory leaks
 * - Removed deprecated permission/organization logic
 */
export function useAuth(): AuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Initial user load
    const initAuth = async () => {
      try {
        const {
          data: { user: authUser },
          error,
        } = await supabase.auth.getUser()

        if (mounted) {
          setUser(error ? null : authUser)
          setLoading(false)
        }
      } catch (error) {
        console.error('🔍 AUTH - Initial load error:', error)
        if (mounted) {
          setUser(null)
          setLoading(false)
        }
      }
    }

    initAuth()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null)
        if (!loading) setLoading(false) // Only set loading false if not already false
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [loading]) // No dependencies - stable effect

  // Simple sign out
  const signOut = async (): Promise<void> => {
    try {
      setUser(null) // Immediate UI update
      await supabase.auth.signOut()
      // Force navigation for clean state
      window.location.href = '/login'
    } catch (error) {
      console.error('❌ Sign out error:', error)
      // Force navigation even on error
      window.location.href = '/login'
    }
  }

  return {
    user,
    loading,
    isAuthenticated: !!user && !loading,
    signOut,
  }
}

/**
 * Simple Auth Guard Hook - Replaces complex useAuthGuard
 */
export function useAuthGuard() {
  const { user, loading, isAuthenticated } = useAuth()

  return {
    user,
    loading,
    isAuthenticated,
    isReady: !loading && !!user,
  }
}
