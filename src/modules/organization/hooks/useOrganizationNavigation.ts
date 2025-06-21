'use client'

import { useCallback, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Organization } from '@/shared/types/organizations'

// Hook für URL-basierte Navigation und Slug-Extraktion
export function useOrganizationNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  
  // Extrahiere aktuellen Slug aus URL (memoized für Performance)
  const currentSlug = useMemo(() => {
    const match = pathname.match(/^\/org\/([^\/]+)/)
    return match ? match[1] : null
  }, [pathname])
  
  // Navigiere zu einer spezifischen Organisation
  const navigateToOrganization = useCallback((slugOrOrg: string | Organization) => {
    const slug = typeof slugOrOrg === 'string' ? slugOrOrg : slugOrOrg.slug
    
    // Nur navigieren wenn wir nicht schon dort sind
    if (!pathname.startsWith(`/org/${slug}`)) {
      router.push(`/org/${slug}/dashboard`)
    }
  }, [pathname, router])
  
  // Navigiere zur Organisations-Auswahl
  const navigateToOrganizationSelection = useCallback(() => {
    router.push('/organizations')
  }, [router])
  
  // Navigiere zu einer spezifischen Seite innerhalb der Organisation
  const navigateToOrganizationPage = useCallback((page: string) => {
    if (currentSlug) {
      router.push(`/org/${currentSlug}/${page}`)
    }
  }, [currentSlug, router])
  
  // Prüfe ob wir uns im Kontext einer Organisation befinden
  const isInOrganizationContext = currentSlug !== null
  
  return {
    currentSlug,
    isInOrganizationContext,
    navigateToOrganization,
    navigateToOrganizationSelection,
    navigateToOrganizationPage,
  }
}