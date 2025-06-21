'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/shared/hooks/auth/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
  fallback?: React.ReactNode
}

/**
 * 🔒 PROTECTED ROUTE GUARD
 * 
 * Für authentifizierte Seiten.
 * 
 * Verhalten:
 * - Wenn USER NOT AUTHENTICATED → Redirect zu /login (oder redirectTo)
 * - Wenn USER AUTHENTICATED → Zeige Content
 * 
 * Use Cases:
 * - /organizations
 * - /organizations/create
 * - Dashboard pages
 * - Settings pages
 */
export function ProtectedRoute({ 
  children, 
  redirectTo = '/login',
  fallback
}: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('🔒 PROTECTED ROUTE - Auth check:', { isAuthenticated, loading })
    
    if (!loading && !isAuthenticated) {
      console.log('🔒 PROTECTED ROUTE - User not authenticated, redirecting to:', redirectTo)
      router.push(redirectTo)
    }
  }, [isAuthenticated, loading, router, redirectTo])

  // Show loading while checking auth
  if (loading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Authentifizierung wird geprüft...</span>
        </div>
      </div>
    )
  }

  // Show content only if user IS authenticated
  if (isAuthenticated) {
    console.log('🔒 PROTECTED ROUTE - User authenticated, showing content')
    return <>{children}</>
  }

  // User is not authenticated, will redirect via useEffect
  return null
}