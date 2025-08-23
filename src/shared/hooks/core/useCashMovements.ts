'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import { cacheConfig, queryKeys } from '@/shared/lib/react-query'
import { supabase } from '@/shared/lib/supabase/client'

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

interface UseCashMovementsQueryReturn {
  // Data & States (Legacy Compatible)
  currentBalance: number
  movements: CashMovement[]
  isLoading: boolean
  error: string | null // Legacy compatible: string instead of Error

  // Query Info (React Query specific)
  isBalanceLoading: boolean
  isMovementsLoading: boolean
  isFetching: boolean
  isStale: boolean

  // Core Functions (Legacy Compatible)
  createCashMovement: (movement: CashMovementInput) => Promise<CashMovement>
  reverseCashMovement: (
    referenceId: string,
    referenceType: 'sale' | 'expense'
  ) => Promise<CashMovement | null>
  createCashAdjustment: (amount: number, reason: string) => Promise<CashMovement | null>

  // Convenience Functions (Legacy Compatible)
  createSaleCashMovement: (saleId: string, amount: number) => Promise<CashMovement | null>
  createExpenseCashMovement: (
    expenseId: string,
    amount: number,
    category: string,
    description: string
  ) => Promise<CashMovement | null>

  // Queries (Legacy Compatible)
  getCurrentBalance: () => Promise<number>
  getCashMovementsForPeriod: (startDate: Date, endDate: Date) => Promise<CashMovement[]>
  getCashMovementsByReference: (
    referenceId: string,
    referenceType: 'sale' | 'expense' | 'adjustment'
  ) => Promise<CashMovement[]>

  // Query Management (React Query specific)
  refetchBalance: () => Promise<unknown>
  refetchMovements: () => Promise<unknown>
  invalidateAll: () => Promise<void>
}

/**
 * React Query-powered Cash Movements Hook
 *
 * Features:
 * - Real-time cash balance tracking
 * - Automatic cache invalidation on movements
 * - Optimistic updates for instant UI feedback
 * - Background refetching for accurate data
 * - Multi-tenant security
 */
export function useCashMovements(): UseCashMovementsQueryReturn {
  const { currentOrganization } = useCurrentOrganization()
  const queryClient = useQueryClient()

  const organizationId = currentOrganization?.id

  // ========================================
  // Query: Current Cash Balance
  // ========================================
  const {
    data: currentBalance = 0,
    isLoading: isBalanceLoading,
    error: balanceError,
    refetch: refetchBalance,
    isStale: isBalanceStale,
    isFetching: isBalanceFetching,
  } = useQuery({
    queryKey: queryKeys.business.cash.balance(organizationId || ''),
    queryFn: async () => {
      if (!organizationId) {
        throw new Error('No organization selected')
      }

      const { data, error } = await supabase.rpc('get_current_cash_balance_for_org', {
        org_id: organizationId,
      })

      if (error) {
        // console.error('Error loading cash balance:', error)
        throw new Error('Fehler beim Laden des Kassenstands')
      }

      const balance = data || 0

      if (process.env.NODE_ENV === 'development') {
        // console.log('🟢 React Query: Cash balance loaded:', balance)
      }

      return balance
    },
    enabled: !!organizationId,
    staleTime: cacheConfig.cashMovements.staleTime,
    gcTime: cacheConfig.cashMovements.gcTime,
    refetchInterval: 1000 * 60, // Refetch every minute for real-time updates
    refetchOnWindowFocus: true,
    meta: {
      errorMessage: 'Fehler beim Laden des Kassenstands',
    },
  })

  // ========================================
  // Query: Cash Movements History (Optional)
  // ========================================
  const {
    data: movements = [],
    isLoading: isMovementsLoading,
    error: movementsError,
    refetch: refetchMovements,
    isStale: isMovementsStale,
    isFetching: isMovementsFetching,
  } = useQuery({
    queryKey: queryKeys.business.cash.movements(organizationId || ''),
    queryFn: async () => {
      if (!organizationId) {
        throw new Error('No organization selected')
      }

      const { data, error } = await supabase
        .from('cash_movements')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(50) // Latest 50 movements

      if (error) {
        // console.error('Error loading cash movements:', error)
        throw new Error('Fehler beim Laden der Kassenbewegungen')
      }

      return (data || []) as CashMovement[] // V6.1 Pattern 19: Schema Property Alignment - string literal type casting
    },
    enabled: !!organizationId,
    staleTime: cacheConfig.cashMovements.staleTime,
    gcTime: cacheConfig.cashMovements.gcTime,
    meta: {
      errorMessage: 'Fehler beim Laden der Kassenbewegungen',
    },
  })

  // ========================================
  // Mutation: Create Cash Movement
  // ========================================
  const createMovementMutation = useMutation({
    mutationFn: async (movement: CashMovementInput): Promise<CashMovement> => {
      if (!organizationId) {
        throw new Error('No organization selected')
      }

      // Get current user
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) {
        throw new Error('User not authenticated')
      }

      // Validation
      if (movement.amount <= 0) {
        throw new Error('Betrag muss größer als 0 sein')
      }

      if (!movement.description.trim()) {
        throw new Error('Beschreibung ist erforderlich')
      }

      // Create movement
      const { data, error } = await supabase
        .from('cash_movements')
        .insert({
          amount: movement.amount,
          type: movement.type,
          description: movement.description.trim(),
          reference_type: movement.reference_type,
          reference_id: movement.reference_id,
          user_id: userData.user.id,
          organization_id: organizationId,
        })
        .select()
        .single()

      if (error) {
        // console.error('Error creating cash movement:', error)
        throw new Error('Fehler beim Erstellen der Kassenbewegung')
      }

      return data as CashMovement // V6.1 Pattern 19: Schema Property Alignment - string literal type casting
    },
    onMutate: async (newMovement) => {
      if (!organizationId) return

      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.business.cash.balance(organizationId),
      })
      await queryClient.cancelQueries({
        queryKey: queryKeys.business.cash.movements(organizationId),
      })

      // Snapshot the previous values
      const previousBalance = queryClient.getQueryData(
        queryKeys.business.cash.balance(organizationId)
      ) as number
      const previousMovements = queryClient.getQueryData(
        queryKeys.business.cash.movements(organizationId)
      ) as CashMovement[]

      // Optimistically update the balance
      const balanceChange =
        newMovement.type === 'cash_in' ? newMovement.amount : -newMovement.amount

      queryClient.setQueryData(queryKeys.business.cash.balance(organizationId), (old: number = 0) =>
        Math.max(0, old + balanceChange)
      )

      // Optimistically add the movement to the list
      const optimisticMovement: CashMovement = {
        ...newMovement,
        id: `temp-${Date.now()}`,
        created_at: new Date().toISOString(),
        user_id: 'current-user', // Will be replaced by real data
      }

      queryClient.setQueryData(
        queryKeys.business.cash.movements(organizationId),
        (old: CashMovement[] = []) => [optimisticMovement, ...old]
      )

      // Return context with the snapshotted values
      return { previousBalance, previousMovements }
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context && organizationId) {
        if (context.previousBalance !== undefined) {
          queryClient.setQueryData(
            queryKeys.business.cash.balance(organizationId),
            context.previousBalance
          )
        }
        if (context.previousMovements) {
          queryClient.setQueryData(
            queryKeys.business.cash.movements(organizationId),
            context.previousMovements
          )
        }
      }

      toast.error(error.message || 'Fehler beim Erstellen der Kassenbewegung')
    },
    onSuccess: (_data, variables) => {
      const actionType = variables.type === 'cash_in' ? 'Einzahlung' : 'Auszahlung'
      toast.success(`${actionType} erfolgreich erstellt`)

      if (process.env.NODE_ENV === 'development') {
        // console.log('🟢 React Query: Cash movement created:', data)
      }
    },
    onSettled: () => {
      // Always refetch after mutation to ensure data consistency
      if (organizationId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.business.cash.balance(organizationId),
        })
        queryClient.invalidateQueries({
          queryKey: queryKeys.business.cash.movements(organizationId),
        })

        // Also invalidate related financial data
        queryClient.invalidateQueries({
          queryKey: queryKeys.business.reports.financial(organizationId),
        })
      }
    },
  })

  // ========================================
  // Utility Functions
  // ========================================
  const invalidateAll = async () => {
    if (organizationId) {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.business.cash.balance(organizationId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.business.cash.movements(organizationId),
        }),
      ])
    }
  }

  // ========================================
  // Legacy Compatible Helper Functions
  // ========================================

  // Reverse Cash Movement (Legacy Compatible)
  const reverseCashMovement = async (
    referenceId: string,
    referenceType: 'sale' | 'expense'
  ): Promise<CashMovement | null> => {
    if (!organizationId) throw new Error('No organization selected')

    // Find original movement
    const { data: originalMovements, error: findError } = await supabase
      .from('cash_movements')
      .select('*')
      .eq('reference_id', referenceId)
      .eq('reference_type', referenceType)
      .eq('organization_id', organizationId)

    if (findError || !originalMovements || originalMovements.length === 0) {
      return null
    }

    const originalMovement = originalMovements[0] as CashMovement
    const reverseType = originalMovement.type === 'cash_in' ? 'cash_out' : 'cash_in'

    return createMovementMutation.mutateAsync({
      amount: originalMovement.amount,
      type: reverseType,
      description: `Stornierung: ${originalMovement.description}`,
      reference_type: 'adjustment',
      reference_id: referenceId,
    })
  }

  // Create Cash Adjustment (Legacy Compatible)
  const createCashAdjustment = async (
    amount: number,
    reason: string
  ): Promise<CashMovement | null> => {
    const type = amount > 0 ? 'cash_in' : 'cash_out'
    const absoluteAmount = Math.abs(amount)

    return createMovementMutation.mutateAsync({
      amount: absoluteAmount,
      type,
      description: `Kassenanpassung: ${reason}`,
      reference_type: 'adjustment',
    })
  }

  // Create Sale Cash Movement (Legacy Compatible)
  const createSaleCashMovement = async (
    saleId: string,
    amount: number
  ): Promise<CashMovement | null> => {
    return createMovementMutation.mutateAsync({
      amount,
      type: 'cash_in',
      description: `Barzahlung (Verkauf: ${saleId})`,
      reference_type: 'sale',
      reference_id: saleId,
    })
  }

  // Create Expense Cash Movement (Legacy Compatible)
  const createExpenseCashMovement = async (
    expenseId: string,
    amount: number,
    category: string,
    description: string
  ): Promise<CashMovement | null> => {
    return createMovementMutation.mutateAsync({
      amount,
      type: 'cash_out',
      description: `${category}: ${description}`,
      reference_type: 'expense',
      reference_id: expenseId,
    })
  }

  // Get Cash Movements for Period (Legacy Compatible)
  const getCashMovementsForPeriod = async (
    startDate: Date,
    endDate: Date
  ): Promise<CashMovement[]> => {
    if (!organizationId) throw new Error('No organization selected')

    const { data, error } = await supabase
      .from('cash_movements')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false })

    if (error) throw new Error('Fehler beim Laden der Bargeld-Bewegungen')
    return (data || []) as CashMovement[] // V6.1 Pattern 19: Schema Property Alignment - string literal type casting
  }

  // Get Cash Movements by Reference (Legacy Compatible)
  const getCashMovementsByReference = async (
    referenceId: string,
    referenceType: 'sale' | 'expense' | 'adjustment'
  ): Promise<CashMovement[]> => {
    if (!organizationId) throw new Error('No organization selected')

    const { data, error } = await supabase
      .from('cash_movements')
      .select('*')
      .eq('reference_id', referenceId)
      .eq('reference_type', referenceType)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    if (error) throw new Error('Fehler beim Laden der Bargeld-Bewegungen')
    return (data || []) as CashMovement[] // V6.1 Pattern 19: Schema Property Alignment - string literal type casting
  }

  // Get Current Balance (Legacy Compatible)
  const getCurrentBalance = async (): Promise<number> => {
    await refetchBalance()
    return currentBalance
  }

  // ========================================
  // Combined Loading and Error States
  // ========================================
  const isLoading = isBalanceLoading || isMovementsLoading || createMovementMutation.isPending
  const error = balanceError || movementsError || null
  const isFetching = isBalanceFetching || isMovementsFetching
  const isStale = isBalanceStale || isMovementsStale

  // ========================================
  // Return Interface (Legacy Compatible)
  // ========================================
  return {
    // Data & States (Legacy Compatible)
    currentBalance,
    movements,
    isLoading,
    error: error?.message || null, // Legacy compatible: string error

    // Query Info (React Query specific)
    isBalanceLoading,
    isMovementsLoading,
    isFetching,
    isStale,

    // Core Functions (Legacy Compatible)
    createCashMovement: createMovementMutation.mutateAsync,
    reverseCashMovement,
    createCashAdjustment,

    // Convenience Functions (Legacy Compatible)
    createSaleCashMovement,
    createExpenseCashMovement,

    // Queries (Legacy Compatible)
    getCurrentBalance,
    getCashMovementsForPeriod,
    getCashMovementsByReference,

    // Query Management (React Query specific)
    refetchBalance,
    refetchMovements,
    invalidateAll,
  }
}
