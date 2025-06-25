'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/shared/lib/supabase/client'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'

export interface OrganizationStats {
  organizationUsersCount: number
  productsCount: number
  salesCount: number
  expensesCount: number
}

export function useSystemStats() {
  const [stats, setStats] = useState<OrganizationStats>({
    organizationUsersCount: 0,
    productsCount: 0,
    salesCount: 0,
    expensesCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 🔒 SECURITY: Multi-Tenant Organization Context
  const { currentOrganization } = useCurrentOrganization()

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)

      // 🔒 CRITICAL SECURITY: Organization required
      if (!currentOrganization) {
        throw new Error('Keine Organization ausgewählt.')
      }

      // console.log('Loading organization stats for:', currentOrganization.name)

      // Check auth status first
      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (authError) {
        // console.error('Auth error:', authError)
        throw new Error('Authentifizierungsfehler: ' + authError.message)
      }
      if (!authData?.user) {
        throw new Error('Nicht angemeldet')
      }

      // console.log('User authenticated:', authData.user.email)

      // 🔒 SECURITY: Organization-scoped parallel queries
      const [orgUsersResult, itemsResult, salesResult, expensesResult] = await Promise.all([
        // Organization users instead of global users
        supabase
          .from('organization_users')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', currentOrganization.id) // 🔒 SECURITY: Organization-scoped
          .eq('active', true),
        // Organization items
        supabase
          .from('items')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', currentOrganization.id), // 🔒 SECURITY: Organization-scoped
        // Organization sales
        supabase
          .from('sales')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', currentOrganization.id), // 🔒 SECURITY: Organization-scoped
        // Organization expenses
        supabase
          .from('expenses')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', currentOrganization.id) // 🔒 SECURITY: Organization-scoped
      ])

      // console.log('Organization Query results:', {
      //   orgUsers: { count: orgUsersResult.count, error: orgUsersResult.error },
      //   items: { count: itemsResult.count, error: itemsResult.error },
      //   sales: { count: salesResult.count, error: salesResult.error },
      //   expenses: { count: expensesResult.count, error: expensesResult.error }
      // })

      // Check for errors (organization-scoped)
      if (orgUsersResult.error) {
        // console.error('Error fetching organization users count:', orgUsersResult.error)
        throw orgUsersResult.error
      }
      if (itemsResult.error) {
        // console.error('Error fetching organization items count:', itemsResult.error)
        throw itemsResult.error
      }
      if (salesResult.error) {
        // console.error('Error fetching organization sales count:', salesResult.error)
        throw salesResult.error
      }
      if (expensesResult.error) {
        // console.error('Error fetching organization expenses count:', expensesResult.error)
        throw expensesResult.error
      }

      // Update stats (organization-scoped)
      const newStats = {
        organizationUsersCount: orgUsersResult.count || 0,
        productsCount: itemsResult.count || 0,
        salesCount: salesResult.count || 0,
        expensesCount: expensesResult.count || 0
      }

      // console.log('Final organization stats:', newStats)
      setStats(newStats)

    } catch (err: any) {
      console.error('Error loading system stats:', err)
      setError(err.message || 'Fehler beim Laden der Systemstatistiken')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentOrganization) {
      loadStats()
    }
  }, [currentOrganization]) // 🔒 SECURITY: Refetch when organization changes

  return {
    stats,
    loading,
    error,
    refetch: loadStats
  }
}