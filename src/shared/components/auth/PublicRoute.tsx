'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/shared/hooks/auth/useAuth'

interface PublicRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

/**
 * 🔓 PUBLIC ROUTE GUARD
 * 
 * Für nicht-authentifizierte Seiten wie Login, Register.
 * 
 * Verhalten:
 * - Wenn USER AUTHENTICATED → Redirect zu /organizations (oder redirectTo)
 * - Wenn USER NOT AUTHENTICATED → Zeige Content
 * 
 * Use Cases:
 * - Login Page
 * - Register Page  
 * - Landing Page
 */
export function PublicRoute({ 
  children, 
  redirectTo = '/organizations' 
}: PublicRouteProps) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('🔓 PUBLIC ROUTE - Auth check:', { isAuthenticated, loading })
    
    if (!loading && isAuthenticated) {
      console.log('🔓 PUBLIC ROUTE - User authenticated, redirecting to:', redirectTo)
      router.push(redirectTo)
    }
  }, [isAuthenticated, loading, router, redirectTo])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Authentifizierung wird geprüft...</span>
        </div>
      </div>
    )
  }

  // Show content only if user is NOT authenticated
  if (!isAuthenticated) {
    console.log('🔓 PUBLIC ROUTE - User not authenticated, showing content')
    return <>{children}</>
  }

  // User is authenticated, will redirect via useEffect
  return null
}