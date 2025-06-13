'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/shared/lib/supabase/client'

export interface SystemStats {
  usersCount: number
  productsCount: number
  salesCount: number
  expensesCount: number
}

export function useSystemStats() {
  const [stats, setStats] = useState<SystemStats>({
    usersCount: 0,
    productsCount: 0,
    salesCount: 0,
    expensesCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Loading system stats...')

      // Check auth status first
      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (authError) {
        console.error('Auth error:', authError)
        throw new Error('Authentifizierungsfehler: ' + authError.message)
      }
      if (!authData?.user) {
        throw new Error('Nicht angemeldet')
      }

      console.log('User authenticated:', authData.user.email)

      // Parallel queries to get all counts
      const [usersResult, itemsResult, salesResult, expensesResult] = await Promise.all([
        supabase
          .from('users')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('items')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('sales')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('expenses')
          .select('*', { count: 'exact', head: true })
      ])

      console.log('Query results:', {
        users: { count: usersResult.count, error: usersResult.error },
        items: { count: itemsResult.count, error: itemsResult.error },
        sales: { count: salesResult.count, error: salesResult.error },
        expenses: { count: expensesResult.count, error: expensesResult.error }
      })

      // Check for errors
      if (usersResult.error) {
        console.error('Error fetching users count:', usersResult.error)
        throw usersResult.error
      }
      if (itemsResult.error) {
        console.error('Error fetching items count:', itemsResult.error)
        throw itemsResult.error
      }
      if (salesResult.error) {
        console.error('Error fetching sales count:', salesResult.error)
        throw salesResult.error
      }
      if (expensesResult.error) {
        console.error('Error fetching expenses count:', expensesResult.error)
        throw expensesResult.error
      }

      // Update stats
      const newStats = {
        usersCount: usersResult.count || 0,
        productsCount: itemsResult.count || 0,
        salesCount: salesResult.count || 0,
        expensesCount: expensesResult.count || 0
      }

      console.log('Final stats:', newStats)
      setStats(newStats)

    } catch (err: any) {
      console.error('Error loading system stats:', err)
      setError(err.message || 'Fehler beim Laden der Systemstatistiken')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  return {
    stats,
    loading,
    error,
    refetch: loadStats
  }
}