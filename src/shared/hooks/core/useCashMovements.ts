import { useState, useEffect } from 'react'
import { supabase } from '@/shared/lib/supabase/client'
import { useOrganization } from '@/shared/contexts/OrganizationContext'

export interface CashMovement {
  id?: string
  amount: number
  type: 'cash_in' | 'cash_out'
  description: string
  reference_type: 'sale' | 'expense' | 'adjustment'
  reference_id?: string
  user_id?: string
  created_at?: string
}

export interface CashMovementInput {
  amount: number
  type: 'cash_in' | 'cash_out'
  description: string
  reference_type: 'sale' | 'expense' | 'adjustment'
  reference_id?: string
}

export const useCashMovements = () => {
  const [currentBalance, setCurrentBalance] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 🔒 Multi-Tenant Organization Context
  const { currentOrganization } = useOrganization()

  // 🛡️ Security Guard - Organization required for all operations
  const securityGuard = () => {
    if (!currentOrganization) {
      throw new Error('Keine Organization ausgewählt. Multi-Tenant Sicherheit verletzt.')
    }
    return currentOrganization.id
  }

  // Aktuellen Kassenstand laden (🔒 Organization-aware)
  const getCurrentBalance = async (): Promise<number> => {
    try {
      setIsLoading(true)
      setError(null)

      // 🔒 Security: Organization required
      const organizationId = securityGuard()

      // ✅ Fixed: Use organization-aware RPC function
      const { data, error } = await supabase.rpc('get_current_cash_balance_for_org', {
        org_id: organizationId
      })

      if (error) {
        console.error('Fehler beim Laden des Kassenstands:', error)
        setError('Fehler beim Laden des Kassenstands')
        return 0
      }

      const balance = data || 0
      setCurrentBalance(balance)
      console.log('🔍 DEBUG: Current cash balance for org:', organizationId, '=', balance)
      return balance
    } catch (err) {
      console.error('Unerwarteter Fehler beim Laden des Kassenstands:', err)
      setError('Unerwarteter Fehler beim Laden des Kassenstands')
      return 0
    } finally {
      setIsLoading(false)
    }
  }

  // Cash Movement erstellen (🔒 Organization-aware)
  const createCashMovement = async (movement: CashMovementInput): Promise<CashMovement | null> => {
    try {
      setIsLoading(true)
      setError(null)

      // 🔒 Security: Organization & User required
      const organizationId = securityGuard()
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) {
        throw new Error('Benutzer nicht authentifiziert')
      }

      // Validierung
      if (movement.amount <= 0) {
        throw new Error('Betrag muss größer als 0 sein')
      }

      if (!movement.description.trim()) {
        throw new Error('Beschreibung ist erforderlich')
      }

      // ✅ Fixed: Include organization_id
      const { data, error } = await supabase
        .from('cash_movements')
        .insert({
          amount: movement.amount,
          type: movement.type,
          description: movement.description.trim(),
          reference_type: movement.reference_type,
          reference_id: movement.reference_id,
          user_id: userData.user.id,
          organization_id: organizationId // 🔒 CRITICAL FIX: Organization security
        })
        .select()
        .single()

      if (error) {
        console.error('Fehler beim Erstellen der Bargeld-Bewegung:', error)
        throw new Error('Fehler beim Erstellen der Bargeld-Bewegung')
      }

      // Balance neu laden
      await getCurrentBalance()

      console.log(`✅ Cash Movement erstellt: ${movement.type} ${movement.amount}€ - ${movement.description} (Org: ${organizationId})`)
      return data as CashMovement
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unerwarteter Fehler'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Cash Movement für Verkauf erstellen
  const createSaleCashMovement = async (saleId: string, amount: number): Promise<CashMovement | null> => {
    return createCashMovement({
      amount,
      type: 'cash_in',
      description: `Barzahlung (Verkauf: ${saleId})`,
      reference_type: 'sale',
      reference_id: saleId
    })
  }

  // Cash Movement für Ausgabe erstellen
  const createExpenseCashMovement = async (
    expenseId: string, 
    amount: number, 
    category: string, 
    description: string
  ): Promise<CashMovement | null> => {
    return createCashMovement({
      amount,
      type: 'cash_out',
      description: `${category}: ${description}`,
      reference_type: 'expense',
      reference_id: expenseId
    })
  }

  // Cash Movement rückgängig machen (🔒 Organization-aware)
  const reverseCashMovement = async (referenceId: string, referenceType: 'sale' | 'expense'): Promise<CashMovement | null> => {
    try {
      setIsLoading(true)
      setError(null)

      // 🔒 Security: Organization & User required
      const organizationId = securityGuard()
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) {
        throw new Error('Benutzer nicht authentifiziert')
      }

      // ✅ Fixed: Original Movement finden (mit organization_id filter)
      const { data: originalMovements, error: findError } = await supabase
        .from('cash_movements')
        .select('*')
        .eq('reference_id', referenceId)
        .eq('reference_type', referenceType)
        .eq('organization_id', organizationId) // 🔒 SECURITY: nur eigene Movements

      if (findError) {
        console.error('Fehler beim Suchen der ursprünglichen Bargeld-Bewegung:', findError)
        throw new Error('Fehler beim Suchen der ursprünglichen Bargeld-Bewegung')
      }

      if (!originalMovements || originalMovements.length === 0) {
        console.log(`Keine Bargeld-Bewegung gefunden für ${referenceType}: ${referenceId} (Org: ${organizationId})`)
        return null
      }

      const originalMovement = originalMovements[0] as CashMovement

      // Umgekehrte Bewegung erstellen
      const reverseType = originalMovement.type === 'cash_in' ? 'cash_out' : 'cash_in'
      const reverseDescription = `Stornierung: ${originalMovement.description}`

      return createCashMovement({
        amount: originalMovement.amount,
        type: reverseType,
        description: reverseDescription,
        reference_type: 'adjustment',
        reference_id: referenceId
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unerwarteter Fehler'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Manuelle Kassenanpassung
  const createCashAdjustment = async (amount: number, reason: string): Promise<CashMovement | null> => {
    const type = amount > 0 ? 'cash_in' : 'cash_out'
    const absoluteAmount = Math.abs(amount)
    
    return createCashMovement({
      amount: absoluteAmount,
      type,
      description: `Kassenanpassung: ${reason}`,
      reference_type: 'adjustment'
    })
  }

  // Cash Movements für Zeitraum abfragen (🔒 Organization-aware)
  const getCashMovementsForPeriod = async (startDate: Date, endDate: Date): Promise<CashMovement[]> => {
    try {
      setIsLoading(true)
      setError(null)

      // 🔒 Security: Organization required
      const organizationId = securityGuard()

      // ✅ Fixed: Include organization_id filter
      const { data, error } = await supabase
        .from('cash_movements')
        .select('*')
        .eq('organization_id', organizationId) // 🔒 SECURITY: nur eigene Movements
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Fehler beim Laden der Bargeld-Bewegungen:', error)
        throw new Error('Fehler beim Laden der Bargeld-Bewegungen')
      }

      return data as CashMovement[]
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unerwarteter Fehler'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Cash Movements für spezifische Referenz abfragen (🔒 Organization-aware)
  const getCashMovementsByReference = async (referenceId: string, referenceType: 'sale' | 'expense' | 'adjustment'): Promise<CashMovement[]> => {
    try {
      setIsLoading(true)
      setError(null)

      // 🔒 Security: Organization required
      const organizationId = securityGuard()

      // ✅ Fixed: Include organization_id filter
      const { data, error } = await supabase
        .from('cash_movements')
        .select('*')
        .eq('reference_id', referenceId)
        .eq('reference_type', referenceType)
        .eq('organization_id', organizationId) // 🔒 SECURITY: nur eigene Movements
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Fehler beim Laden der Bargeld-Bewegungen:', error)
        throw new Error('Fehler beim Laden der Bargeld-Bewegungen')
      }

      return data as CashMovement[]
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unerwarteter Fehler'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Kassenstand beim Mount und bei Organization-Changes laden
  useEffect(() => {
    if (currentOrganization) {
      getCurrentBalance()
    }
  }, [currentOrganization]) // 🔒 Reload when organization changes

  return {
    // State
    currentBalance,
    isLoading,
    error,

    // Core Functions
    createCashMovement,
    reverseCashMovement,
    createCashAdjustment,

    // Convenience Functions
    createSaleCashMovement,
    createExpenseCashMovement,

    // Queries
    getCurrentBalance,
    getCashMovementsForPeriod,
    getCashMovementsByReference
  }
}