'use client'

import { useState } from 'react'
import { supabase } from '@/shared/lib/supabase/client'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import { getSwissDayRange } from '@/shared/utils/dateUtils'

// Minimal types for cash operations
export type CashMovement = {
  id: string
  type: 'cash_in' | 'cash_out'
  amount: number
  description: string
  date: string
  movement_number: string
  reference_type: string | null
  reference_id: string | null
  created_at: string
  organization_id: string
  // Enriched data for sales
  sale_receipt_number?: string | null
}

export function useCashBalance() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 🔒 SECURITY: Multi-Tenant Organization Context
  const { currentOrganization } = useCurrentOrganization()

  // Get current cash balance (organization-scoped)
  const getCurrentCashBalance = async () => {
    try {
      // 🔒 CRITICAL SECURITY: Organization required
      if (!currentOrganization) {
        throw new Error('Keine Organization ausgewählt.')
      }

      // Use organization-aware cash balance function
      const { data, error } = await supabase.rpc('get_current_cash_balance_for_org', {
        org_id: currentOrganization.id
      })

      if (error) {
        // console.error('Fehler beim Abrufen des Bargeld-Bestands:', error)
        throw error
      }

      return { success: true, balance: data || 0 }
    } catch (err: any) {
      console.error('Fehler beim Abrufen des Bargeld-Bestands:', err)
      return { success: false, error: err.message, balance: 0 }
    }
  }

  // Get cash movements for a month (organization-scoped)
  const getCashMovementsForMonth = async (monthStart: Date, monthEnd: Date) => {
    try {
      setLoading(true)
      setError(null)

      // 🔒 CRITICAL SECURITY: Organization required
      if (!currentOrganization) {
        throw new Error('Keine Organization ausgewählt.')
      }

      // Convert to UTC for database query
      const startUTC = new Date(monthStart.getFullYear(), monthStart.getMonth(), monthStart.getDate()).toISOString()
      const endUTC = new Date(monthEnd.getFullYear(), monthEnd.getMonth(), monthEnd.getDate(), 23, 59, 59).toISOString()

      // Get cash movements with ORGANIZATION SECURITY
      const { data, error } = await supabase
        .from('cash_movements')
        .select('*')
        .eq('organization_id', currentOrganization.id) // 🔒 SECURITY: Organization-scoped
        .gte('created_at', startUTC)
        .lte('created_at', endUTC)
        .order('created_at', { ascending: false })

      if (error) {
        // console.error('Datenbankfehler beim Abrufen der Bargeld-Bewegungen:', error)
        throw error
      }

      // Enrich with sales data where reference_type = 'sale'
      const enrichedData = await Promise.all(
        (data || []).map(async (movement) => {
          if (movement.reference_type === 'sale' && movement.reference_id) {
            try {
              const { data: saleData, error: saleError } = await supabase
                .from('sales')
                .select('receipt_number')
                .eq('id', movement.reference_id)
                .eq('organization_id', currentOrganization.id) // 🔒 SECURITY: Organization-scoped
                .single()
              
              if (saleError) {
                // console.error(`Failed to fetch sale data for ${movement.reference_id}:`, saleError)
              }
              
              return {
                ...movement,
                sale_receipt_number: saleData?.receipt_number || null,
              }
            } catch (err) {
              console.error(`Error enriching movement ${movement.movement_number}:`, err)
              return movement
            }
          }
          return movement
        })
      )

      return { success: true, movements: enrichedData || [] }
    } catch (err: any) {
      console.error('Fehler beim Abrufen der Bargeld-Bewegungen:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message, movements: [] }
    } finally {
      setLoading(false)
    }
  }

  // Get cash movements for a specific date (organization-scoped)
  const getCashMovementsForDate = async (date: string) => {
    try {
      setLoading(true)
      setError(null)

      // 🔒 CRITICAL SECURITY: Organization required
      if (!currentOrganization) {
        throw new Error('Keine Organization ausgewählt.')
      }

      // Parse Swiss date and get UTC range for database query
      const swissDate = new Date(date + 'T12:00:00')
      const { start, end } = getSwissDayRange(swissDate)

      const { data, error } = await supabase
        .from('cash_movements')
        .select('*')
        .eq('organization_id', currentOrganization.id) // 🔒 SECURITY: Organization-scoped
        .gte('created_at', start)
        .lte('created_at', end)
        .order('created_at', { ascending: false })

      if (error) {
        // console.error('Datenbankfehler beim Abrufen der Bargeld-Bewegungen:', error)
        throw error
      }

      return { success: true, movements: data || [] }
    } catch (err: any) {
      console.error('Fehler beim Abrufen der Bargeld-Bewegungen:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message, movements: [] }
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    getCurrentCashBalance,
    getCashMovementsForMonth,
    getCashMovementsForDate
  }
}