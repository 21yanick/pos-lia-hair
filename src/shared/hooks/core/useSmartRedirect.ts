"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { organizationPersistence } from '@/shared/services/organizationPersistence'

type QuickAction = 'appointments' | 'pos' | 'customers' | 'dashboard' | 'transactions' | 'expenses' | 'banking'

interface SmartRedirectState {
  isRedirecting: boolean
  hasRedirected: boolean
  targetUrl: string | null
  fallbackReason: 'no-organization' | 'invalid-quick' | 'no-params' | null
}

export function useSmartRedirect(): SmartRedirectState {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, setState] = useState<SmartRedirectState>({
    isRedirecting: false,
    hasRedirected: false,
    targetUrl: null,
    fallbackReason: null
  })

  useEffect(() => {
    // Only run once on mount
    if (state.hasRedirected) return

    const quickParam = searchParams.get('quick') as QuickAction | null
    console.log('🚀 Smart Redirect - Quick param:', quickParam)

    // If no quick parameter, check for stored organization and redirect to dashboard
    if (!quickParam) {
      const storedOrg = organizationPersistence.load()
      
      if (storedOrg) {
        const targetUrl = `/org/${storedOrg.slug}/dashboard`
        console.log('🚀 Smart Redirect - No quick param, redirecting to dashboard:', targetUrl)
        
        setState(prev => ({
          ...prev,
          isRedirecting: true,
          targetUrl,
          fallbackReason: null
        }))
        
        router.push(targetUrl)
        
        setState(prev => ({
          ...prev,
          hasRedirected: true,
          isRedirecting: false
        }))
        return
      }

      console.log('🚀 Smart Redirect - No stored organization, showing fallback')
      setState(prev => ({
        ...prev,
        fallbackReason: 'no-organization'
      }))
      return
    }

    // Validate quick parameter
    const validQuickActions: QuickAction[] = [
      'appointments', 'pos', 'customers', 'dashboard', 
      'transactions', 'expenses', 'banking'
    ]

    if (!validQuickActions.includes(quickParam)) {
      console.log('🚀 Smart Redirect - Invalid quick param:', quickParam)
      setState(prev => ({
        ...prev,
        fallbackReason: 'invalid-quick'
      }))
      return
    }

    // Try to get stored organization
    const storedOrg = organizationPersistence.load()
    
    if (!storedOrg) {
      console.log('🚀 Smart Redirect - No stored organization for quick action')
      setState(prev => ({
        ...prev,
        fallbackReason: 'no-organization'
      }))
      return
    }

    // Build target URL and redirect
    const targetUrl = `/org/${storedOrg.slug}/${quickParam}`
    console.log('🚀 Smart Redirect - Redirecting to:', targetUrl)
    
    setState(prev => ({
      ...prev,
      isRedirecting: true,
      targetUrl,
      fallbackReason: null
    }))

    router.push(targetUrl)
    
    // Mark as redirected
    setState(prev => ({
      ...prev,
      hasRedirected: true,
      isRedirecting: false
    }))

  }, [router, searchParams, state.hasRedirected])

  return state
}