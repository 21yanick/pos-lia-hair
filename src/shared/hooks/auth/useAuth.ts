'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/shared/lib/supabase/client'
import { useOrganization } from '@/shared/contexts/OrganizationContext'
import {
  User,
  AuthContextType,
  Permission,
  Organization,
  OrganizationRole,
} from '@/shared/types/organizations'

export function useAuth(): AuthContextType {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  
  const {
    currentOrganization,
    userRole,
    hasPermission: orgHasPermission,
    loading: orgLoading,
  } = useOrganization()

  // Load current user
  const loadUser = useCallback(async () => {
    try {
      const { data: { user: authUser }, error } = await supabase.auth.getUser()
      
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
        console.error('Error loading user from database:', dbError)
        // Fallback to auth user data
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.user_metadata?.name,
          username: authUser.user_metadata?.username,
        })
        return
      }

      setUser({
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        username: dbUser.username,
      })
    } catch (err) {
      console.error('Error in loadUser:', err)
      setUser(null)
    }
  }, [supabase])

  // Sign out user
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }, [supabase, router])

  // Check if user has specific permission
  const hasPermission = useCallback((permission: Permission): boolean => {
    return orgHasPermission(permission)
  }, [orgHasPermission])

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUser()
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, loadUser])

  const isAuthenticated = !!user && !loading

  return {
    user,
    currentOrganization,
    userRole,
    loading: loading || orgLoading,
    isAuthenticated,
    signOut,
    hasPermission,
  }
}

// Hook for auth-protected operations
export function useAuthGuard() {
  const { user, currentOrganization, loading } = useAuth()
  const router = useRouter()

  const requireAuth = useCallback(() => {
    if (!loading && !user) {
      router.push('/login')
      return false
    }
    return true
  }, [user, loading, router])

  const requireOrganization = useCallback(() => {
    if (!loading && user && !currentOrganization) {
      router.push('/organizations')
      return false
    }
    return true
  }, [user, currentOrganization, loading, router])

  return {
    user,
    organization: currentOrganization,
    isAuthenticated: !!user,
    isReady: !loading && !!user && !!currentOrganization,
    requireAuth,
    requireOrganization,
  }
}

// Hook for permission-based rendering
export function usePermissions() {
  const { hasPermission, userRole, currentOrganization } = useAuth()

  const can = useCallback((permission: Permission): boolean => {
    return hasPermission(permission)
  }, [hasPermission])

  const isOwner = userRole === 'owner'
  const isAdmin = userRole === 'admin' || userRole === 'owner'
  const isStaff = userRole === 'staff' || userRole === 'admin' || userRole === 'owner'

  return {
    can,
    isOwner,
    isAdmin,
    isStaff,
    role: userRole,
    organization: currentOrganization,
  }
}

// Legacy compatibility hook for existing code
export function useLegacyAuth() {
  const { user, currentOrganization } = useAuth()

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
    if (!currentOrganization) {
      throw new Error('Keine Organisation ausgewählt.')
    }
    return currentOrganization.id
  }, [currentOrganization])

  return {
    getUserData,
    getOrganizationId,
    user,
    organization: currentOrganization,
  }
}