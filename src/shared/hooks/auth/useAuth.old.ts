'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/shared/lib/supabase/client'
// REMOVED: useOrganization import to break circular dependency
// Organization data should be accessed via useOrganization hook separately
import {
  type AuthContextType,
  Organization,
  OrganizationRole,
  type Permission,
  type User,
} from '@/shared/types/organizations'

export function useAuth(): AuthContextType {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Load current user
  const loadUser = useCallback(async () => {
    try {
      const {
        data: { user: authUser },
        error,
      } = await supabase.auth.getUser()

      if (error || !authUser) {
        setUser(null)
        return
      }

      // Get user details from database
      const { data: dbUser, error: dbError } = await supabase
        .from('users')
        .select('id, name, username, email')
        .eq('id', authUser.id)
        .single()

      if (dbError) {
        // Fallback to auth user data
        const fallbackUser = {
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.user_metadata?.name,
          username: authUser.user_metadata?.username,
        }
        setUser(fallbackUser)
        return
      }
      setUser({
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        username: dbUser.username,
      })
    } catch (err) {
      console.error('🔍 AUTH - Error in loadUser:', err)
      setUser(null)
    }
  }, [])

  // Sign out user
  const signOut = useCallback(async () => {
    try {
      // console.log('🚪 Starting logout process...')

      // Clear user state immediately for better UX
      setUser(null)

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()

      if (error) {
        // console.error('❌ Supabase logout error:', error)
        // Still continue with navigation even if logout partially failed
      } else {
        // console.log('✅ Supabase logout successful')
      }

      // Force navigation to login page (works better with org routes)
      window.location.href = '/login'
    } catch (error) {
      console.error('❌ Error signing out:', error)
      // Force navigation even on error
      window.location.href = '/login'
    }
  }, [])

  // Check if user has specific permission
  // NOTE: This is now a stub - permission checking should be done via useOrganizationPermissions
  const hasPermission = useCallback((permission: Permission): boolean => {
    return false
  }, [])

  // Initialize user on mount
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true)
      await loadUser()
      setLoading(false)
    }

    initializeAuth()
  }, [loadUser])

  // Listen for auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUser()
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [loadUser])

  const isAuthenticated = !!user && !loading

  return {
    user,
    loading,
    isAuthenticated,
    signOut,
    hasPermission, // Deprecated - use useOrganizationPermissions instead
  }
}

// Hook for auth-protected operations
export function useAuthGuard() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const requireAuth = useCallback(() => {
    if (!loading && !user) {
      router.push('/login')
      return false
    }
    return true
  }, [user, loading, router])

  const requireOrganization = useCallback(() => {
    return true
  }, [])

  return {
    user,
    isAuthenticated: !!user,
    isReady: !loading && !!user,
    requireAuth,
    requireOrganization, // Deprecated
  }
}

// Hook for permission-based rendering
// NOTE: This hook is deprecated - use useOrganizationPermissions instead
export function usePermissions() {
  const can = useCallback((permission: Permission): boolean => {
    return false // Stub
  }, [])

  return {
    can,
    isOwner: false,
    isAdmin: false,
    isStaff: false,
    role: undefined,
    organization: undefined,
  }
}

// Legacy compatibility hook for existing code
export function useLegacyAuth() {
  const { user } = useAuth()

  // This provides the same interface as the old direct supabase calls
  // to ease migration of existing business hooks
  const getUserData = useCallback(async () => {
    if (!user) {
      throw new Error('Nicht angemeldet. Bitte melden Sie sich an.')
    }

    return {
      user: {
        id: user.id,
        email: user.email,
      },
    }
  }, [user])

  const getOrganizationId = useCallback(() => {
    throw new Error('getOrganizationId is deprecated - use useOrganization hook instead')
  }, [])

  return {
    getUserData,
    getOrganizationId, // Deprecated
    user,
    organization: undefined, // Deprecated
  }
}
