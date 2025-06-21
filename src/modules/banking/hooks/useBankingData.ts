// =====================================================
// Banking Data Hook
// =====================================================
// Custom hook for Banking Module data fetching with React state management

'use client'

import { useState, useEffect } from 'react'
import {
  getUnmatchedSalesForProvider,
  getUnmatchedProviderReports,
  getUnmatchedBankTransactions,
  getAvailableForBankMatching,
  getBankingStats,
  createProviderMatch,
  createBankMatch,
  getBankAccounts,
  type UnmatchedSaleForProvider,
  type UnmatchedProviderReport,
  type UnmatchedBankTransaction,
  type AvailableForBankMatching,
  type BankingStats,
  type BankAccount
} from '../services/bankingApi'
import { getOwnerBalance, type OwnerBalance } from '../services/ownerTransactionsApi'
import { supabase } from '@/shared/lib/supabase/client'
import { useOrganization } from '@/modules/organization'

// =====================================================
// HOOK INTERFACE
// =====================================================

export interface UseBankingDataReturn {
  // Tab 1 Data
  unmatchedSales: UnmatchedSaleForProvider[]
  unmatchedProviderReports: UnmatchedProviderReport[]
  
  // Tab 2 Data
  unmatchedBankTransactions: UnmatchedBankTransaction[]
  availableForMatching: AvailableForBankMatching[]
  
  // Bank Accounts
  bankAccounts: BankAccount[] | null
  
  // Owner Balance
  ownerBalance: OwnerBalance | null
  
  // Stats
  stats: BankingStats | null
  
  // Loading states
  isLoading: boolean
  error: string | null
  
  // Actions
  handleProviderMatch: (saleId: string, providerReportId: string) => Promise<boolean>
  handleBankMatch: (bankTransactionId: string, matchedItems: Array<{ type: 'sale' | 'expense' | 'cash_movement' | 'owner_transaction', id: string, amount: number }>) => Promise<boolean>
  refetchData: () => Promise<void>
  
  // Provider Import Actions
  handleProviderImportSuccess: () => Promise<void>
}

// =====================================================
// CUSTOM HOOK
// =====================================================

export function useBankingData(): UseBankingDataReturn {
  // State for Tab 1 (Provider Reconciliation)
  const [unmatchedSales, setUnmatchedSales] = useState<UnmatchedSaleForProvider[]>([])
  const [unmatchedProviderReports, setUnmatchedProviderReports] = useState<UnmatchedProviderReport[]>([])
  
  // State for Tab 2 (Bank Reconciliation)
  const [unmatchedBankTransactions, setUnmatchedBankTransactions] = useState<UnmatchedBankTransaction[]>([])
  const [availableForMatching, setAvailableForMatching] = useState<AvailableForBankMatching[]>([])
  
  // Bank accounts
  const [bankAccounts, setBankAccounts] = useState<BankAccount[] | null>(null)
  
  // Owner Balance
  const [ownerBalance, setOwnerBalance] = useState<OwnerBalance | null>(null)
  
  // Stats and UI state
  const [stats, setStats] = useState<BankingStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 🔒 SECURITY: Multi-Tenant Organization Context
  const { currentOrganization } = useOrganization()

  // =====================================================
  // DATA FETCHING
  // =====================================================

  const fetchAllData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // 🔒 CRITICAL SECURITY: Organization required
      if (!currentOrganization) {
        throw new Error('Keine Organization ausgewählt. Bitte wählen Sie eine Organization.')
      }

      // Get current user ID for Owner Balance
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id

      // Fetch all data in parallel for performance with ORGANIZATION SECURITY
      const [
        salesResult,
        providerResult,
        bankResult,
        matchingResult,
        statsResult,
        accountsResult,
        ownerBalanceResult
      ] = await Promise.all([
        getUnmatchedSalesForProvider(currentOrganization.id), // 🔒 SECURITY: Organization-scoped
        getUnmatchedProviderReports(currentOrganization.id), // 🔒 SECURITY: Organization-scoped
        getUnmatchedBankTransactions(currentOrganization.id), // 🔒 SECURITY: Organization-scoped
        getAvailableForBankMatching(currentOrganization.id), // 🔒 SECURITY: Organization-scoped
        getBankingStats(currentOrganization.id), // 🔒 SECURITY: Organization-scoped
        getBankAccounts(currentOrganization.id), // 🔒 SECURITY: Organization-scoped
        userId ? getOwnerBalance(userId) : Promise.resolve({ data: null, error: null })
      ])

      // Check for errors and update state with proper type guards
      if (salesResult.error) {
        throw new Error(`Sales: ${salesResult.error.message || 'Unknown error'}`)
      }
      if (providerResult.error) {
        throw new Error(`Provider: ${providerResult.error.message || 'Unknown error'}`)
      }
      if (bankResult.error) {
        throw new Error(`Bank: ${bankResult.error.message || 'Unknown error'}`)
      }
      if (matchingResult.error) {
        throw new Error(`Matching: ${matchingResult.error.message || 'Unknown error'}`)
      }
      if (statsResult.error) {
        throw new Error(`Stats: ${statsResult.error.message || 'Unknown error'}`)
      }
      if (accountsResult.error) {
        throw new Error(`Accounts: ${accountsResult.error.message || 'Unknown error'}`)
      }
      if (ownerBalanceResult.error) {
        // console.warn('Owner Balance fetch failed:', ownerBalanceResult.error) // Non-critical, just warn
      }

      // Update state with proper null checks and type casting
      if (salesResult.data && !salesResult.error) {
        setUnmatchedSales(salesResult.data as UnmatchedSaleForProvider[])
      }
      if (providerResult.data && !providerResult.error) {
        setUnmatchedProviderReports(providerResult.data as UnmatchedProviderReport[])
      }
      if (bankResult.data && !bankResult.error) {
        setUnmatchedBankTransactions(bankResult.data as UnmatchedBankTransaction[])
      }
      if (matchingResult.data && !matchingResult.error) {
        setAvailableForMatching(matchingResult.data as AvailableForBankMatching[])
      }
      if (statsResult.data && !statsResult.error) {
        setStats(statsResult.data)
      }
      if (accountsResult.data && !accountsResult.error) {
        setBankAccounts(accountsResult.data as BankAccount[])
      }
      if (ownerBalanceResult.data && !ownerBalanceResult.error) {
        setOwnerBalance(ownerBalanceResult.data)
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error fetching banking data'
      setError(errorMessage)
      // console.error('Error fetching banking data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // =====================================================
  // MATCHING ACTIONS
  // =====================================================

  const handleProviderMatch = async (saleId: string, providerReportId: string): Promise<boolean> => {
    try {
      const result = await createProviderMatch(saleId, providerReportId)
      
      if (result.success) {
        // Remove matched items from local state (Tab 1)
        setUnmatchedSales(prev => prev.filter(sale => sale.id !== saleId))
        setUnmatchedProviderReports(prev => prev.filter(report => report.id !== providerReportId))
        
        // Refresh Tab 2 data - matched sale should now appear in available_for_bank_matching
        const [matchingResult, statsResult] = await Promise.all([
          getAvailableForBankMatching(currentOrganization!.id), // 🔒 SECURITY: Organization-scoped
          getBankingStats(currentOrganization!.id) // 🔒 SECURITY: Organization-scoped
        ])
        
        if (matchingResult.data && !matchingResult.error) {
          setAvailableForMatching(matchingResult.data as AvailableForBankMatching[])
        }
        
        if (statsResult.data && !statsResult.error) {
          setStats(statsResult.data)
        }
        
        return true
      } else {
        throw new Error((result.error as any)?.message || 'Failed to create provider match')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error creating match'
      setError(errorMessage)
      // console.error('Error creating provider match:', err)
      return false
    }
  }

  const handleBankMatch = async (
    bankTransactionId: string, 
    matchedItems: Array<{ type: 'sale' | 'expense' | 'cash_movement', id: string, amount: number }>
  ): Promise<boolean> => {
    try {
      const result = await createBankMatch(bankTransactionId, matchedItems)
      
      if (result.success) {
        // Remove matched items from local state
        setUnmatchedBankTransactions(prev => 
          prev.filter(transaction => transaction.id !== bankTransactionId)
        )
        
        // Remove matched items from available list
        const matchedIds = matchedItems.map(item => item.id)
        setAvailableForMatching(prev => 
          prev.filter(item => !matchedIds.includes(item.id))
        )
        
        // Refresh stats
        const statsResult = await getBankingStats(currentOrganization!.id) // 🔒 SECURITY: Organization-scoped
        if (statsResult.data && !statsResult.error) {
          setStats(statsResult.data)
        }
        
        return true
      } else {
        throw new Error((result.error as any)?.message || 'Failed to create bank match')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error creating match'
      setError(errorMessage)
      // console.error('Error creating bank match:', err)
      return false
    }
  }

  // =====================================================
  // EFFECTS
  // =====================================================

  // Initial data fetch and refetch on organization change
  useEffect(() => {
    if (currentOrganization) {
      fetchAllData()
    }
  }, [currentOrganization]) // 🔒 SECURITY: Refetch when organization changes

  // =====================================================
  // RETURN HOOK INTERFACE
  // =====================================================

  // =====================================================
  // PROVIDER IMPORT HANDLERS
  // =====================================================

  const handleProviderImportSuccess = async (): Promise<void> => {
    // Refresh all data to show new provider reports in Tab 1
    await fetchAllData()
  }

  return {
    // Tab 1 Data
    unmatchedSales,
    unmatchedProviderReports,
    
    // Tab 2 Data
    unmatchedBankTransactions,
    availableForMatching,
    
    // Bank Accounts
    bankAccounts,
    
    // Owner Balance
    ownerBalance,
    
    // Stats
    stats,
    
    // UI State
    isLoading,
    error,
    
    // Actions
    handleProviderMatch,
    handleBankMatch,
    refetchData: fetchAllData,
    
    // Provider Import Actions
    handleProviderImportSuccess
  }
}

// =====================================================
// EXPORTS
// =====================================================

export default useBankingData