// =====================================================
// Banking API Services
// =====================================================
// Connects to Supabase views for Banking Module 2-Tab UI
// Uses the 4 optimized views created in 06_banking_system_rebuild.sql

'use client'

import { supabase } from '@/shared/lib/supabase/client'
// Note: Types from ../types/banking are imported but may not be directly used
// They're referenced in interfaces and function signatures

// =====================================================
// BANK ACCOUNTS
// =====================================================

export interface BankAccount {
  id: string
  name: string
  bank_name: string
  iban?: string | null
  current_balance: number
  last_statement_date?: string | null
  is_active: boolean
  user_id: string
  created_at: string
  updated_at: string
}

export async function getBankAccounts(organizationId: string) {
  const { data, error } = await supabase
    .from('bank_accounts')
    .select('*')
    .eq('is_active', true)
    .eq('organization_id', organizationId) // 🔒 SECURITY: Organization-scoped
    .order('created_at', { ascending: false })

  if (error) {
    // console.error('Error fetching bank accounts:', error)
    return { data: [], error }
  }

  return { data: data || [], error: null }
}

// =====================================================
// TAB 1: PROVIDER RECONCILIATION DATA
// =====================================================

// Left Side: Unmatched Sales for Provider Matching
export interface UnmatchedSaleForProvider {
  id: string
  created_at: string
  total_amount: number
  payment_method: string
  payment_display: string
  customer_name?: string
  banking_status: string
}

export async function getUnmatchedSalesForProvider(organizationId: string) {
  const { data, error } = await supabase
    .from('unmatched_sales_for_provider' as any)
    .select('*')
    .eq('organization_id', organizationId) // 🔒 SECURITY: Organization-scoped
    .order('created_at', { ascending: false })

  if (error) {
    // console.error('Error fetching unmatched sales:', error)
    return { data: [], error }
  }

  return { data: data || [], error: null }
}

// Right Side: Unmatched Provider Reports  
export interface UnmatchedProviderReport {
  id: string
  provider: string
  provider_display: string
  transaction_date: string
  gross_amount: number
  fees: number
  net_amount: number
  payment_method: string | null
  status: string
}

export async function getUnmatchedProviderReports(organizationId: string) {
  const { data, error } = await supabase
    .from('unmatched_provider_reports' as any)
    .select('*')
    .eq('organization_id', organizationId) // 🔒 SECURITY: Organization-scoped
    .order('transaction_date', { ascending: false })

  if (error) {
    // console.error('Error fetching unmatched provider reports:', error)
    return { data: [], error }
  }

  return { data: data || [], error: null }
}

// =====================================================
// TAB 2: BANK RECONCILIATION DATA
// =====================================================

// Left Side: Unmatched Bank Transactions
export interface UnmatchedBankTransaction {
  id: string
  bank_account_id: string
  bank_account_name: string
  transaction_date: string
  amount: number
  amount_abs: number
  description: string
  direction_display: string
  status: string
}

export async function getUnmatchedBankTransactions(organizationId: string) {
  const { data, error } = await supabase
    .from('unmatched_bank_transactions' as any)
    .select('*')
    .eq('organization_id', organizationId) // 🔒 SECURITY: Organization-scoped
    .order('transaction_date', { ascending: false })

  if (error) {
    // console.error('Error fetching unmatched bank transactions:', error)
    return { data: [], error }
  }

  return { data: data || [], error: null }
}

// Right Side: Available Items for Bank Matching
export interface AvailableForBankMatching {
  id: string
  item_type: 'sale' | 'expense' | 'cash_movement' | 'owner_transaction'
  date: string
  amount: number
  description: string
  banking_status: string
}

export async function getAvailableForBankMatching(organizationId: string) {
  const { data, error } = await supabase
    .from('available_for_bank_matching' as any)
    .select('*')
    .eq('organization_id', organizationId) // 🔒 SECURITY: Organization-scoped
    .order('date', { ascending: false })

  if (error) {
    // console.error('Error fetching available items for bank matching:', error)
    return { data: [], error }
  }

  return { data: data || [], error: null }
}

// =====================================================
// BANKING STATS FOR DASHBOARD
// =====================================================

export interface BankingStats {
  unmatchedSales: number
  unmatchedProviderReports: number
  unmatchedExpenses: number
  unmatchedBankTransactions: number
  totalUnmatchedAmount: number
  matchingProgress: number
}

export async function getBankingStats(organizationId: string): Promise<{ data: BankingStats | null, error: any }> {
  try {
    // Get counts from each view with ORGANIZATION SECURITY
    const [salesResult, providerResult, bankResult, expensesResult] = await Promise.all([
      supabase.from('unmatched_sales_for_provider' as any)
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organizationId), // 🔒 SECURITY: Organization-scoped
      supabase.from('unmatched_provider_reports' as any)
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organizationId), // 🔒 SECURITY: Organization-scoped
      supabase.from('unmatched_bank_transactions' as any)
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organizationId), // 🔒 SECURITY: Organization-scoped
      supabase.from('available_for_bank_matching' as any)
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organizationId) // 🔒 SECURITY: Organization-scoped
    ])

    // Get total unmatched amount from bank transactions with ORGANIZATION SECURITY
    const { data: bankAmounts } = await supabase
      .from('unmatched_bank_transactions' as any)
      .select('amount_abs')
      .eq('organization_id', organizationId) // 🔒 SECURITY: Organization-scoped

    const totalUnmatchedAmount = (bankAmounts as any)?.reduce((sum: number, item: any) => sum + (item.amount_abs || 0), 0) || 0

    const unmatchedSales = salesResult.count || 0
    const unmatchedProviderReports = providerResult.count || 0
    const unmatchedBankTransactions = bankResult.count || 0
    const unmatchedExpenses = expensesResult.count || 0

    // Calculate rough matching progress (inverse of unmatched items)
    const totalItems = unmatchedSales + unmatchedProviderReports + unmatchedBankTransactions + unmatchedExpenses
    const matchingProgress = totalItems > 0 ? Math.max(0, 100 - (totalItems * 5)) : 100

    const stats: BankingStats = {
      unmatchedSales,
      unmatchedProviderReports,
      unmatchedExpenses,
      unmatchedBankTransactions,
      totalUnmatchedAmount,
      matchingProgress
    }

    return { data: stats, error: null }

  } catch (error) {
    console.error('Error fetching banking stats:', error)
    return { data: null, error }
  }
}

// =====================================================
// MATCHING OPERATIONS
// =====================================================

// Create Provider Match (Tab 1: Sale ↔ Provider Report)
export async function createProviderMatch(saleId: string, providerReportId: string) {
  try {
    // Update sale with provider_report_id
    const { error: saleError } = await supabase
      .from('sales')
      .update({ 
        provider_report_id: providerReportId,
        banking_status: 'provider_matched'
      })
      .eq('id', saleId)

    if (saleError) throw saleError

    // Update provider report with sale_id
    const { error: providerError } = await supabase
      .from('provider_reports')
      .update({ 
        sale_id: saleId,
        status: 'matched'
      })
      .eq('id', providerReportId)

    if (providerError) throw providerError

    return { success: true, error: null }

  } catch (error) {
    console.error('Error creating provider match:', error)
    return { success: false, error }
  }
}

// Create Bank Match (Tab 2: Bank Transaction ↔ Items)
export async function createBankMatch(
  bankTransactionId: string, 
  matchedItems: Array<{ type: 'sale' | 'expense' | 'cash_movement' | 'owner_transaction', id: string, amount: number }>
) {
  try {
    // Create transaction matches
    const matchInserts = matchedItems.map(item => ({
      bank_transaction_id: bankTransactionId,
      matched_type: item.type,
      matched_id: item.id,
      matched_amount: item.amount,
      match_type: 'manual' as const,
      match_confidence: 100.0
    }))

    const { error: matchError } = await supabase
      .from('transaction_matches')
      .insert(matchInserts)

    if (matchError) throw matchError

    // Update bank transaction status
    const { error: bankError } = await supabase
      .from('bank_transactions')
      .update({ status: 'matched' })
      .eq('id', bankTransactionId)

    if (bankError) throw bankError

    // Update matched items status
    for (const item of matchedItems) {
      let table: string
      let updateData: any
      
      if (item.type === 'sale') {
        table = 'sales'
        updateData = { bank_transaction_id: bankTransactionId, banking_status: 'fully_matched' }
      } else if (item.type === 'expense') {
        table = 'expenses'
        updateData = { bank_transaction_id: bankTransactionId, banking_status: 'matched' }
      } else if (item.type === 'cash_movement') {
        table = 'cash_movements'
        updateData = { bank_transaction_id: bankTransactionId, banking_status: 'matched' }
      } else if (item.type === 'owner_transaction') {
        table = 'owner_transactions'
        updateData = { related_bank_transaction_id: bankTransactionId, banking_status: 'matched' }
      } else {
        continue // Skip unknown types
      }

      const { error } = await supabase
        .from(table as any)
        .update(updateData)
        .eq('id', item.id)

      if (error) throw error
    }

    return { success: true, error: null }

  } catch (error) {
    console.error('Error creating bank match:', error)
    return { success: false, error }
  }
}

// =====================================================
// BANK ACCOUNTS MANAGEMENT (Additional functions)
// =====================================================

export async function createBankAccount(account: {
  name: string
  bank_name: string
  iban?: string
  account_number?: string
  user_id: string
}) {
  const { data, error } = await supabase
    .from('bank_accounts')
    .insert([account] as any)
    .select()
    .single()

  return { data, error }
}

// =====================================================
// INTELLIGENT MATCHING API FUNCTIONS
// =====================================================
// New endpoints for smart matching algorithms

import { providerMatchingService } from './providerMatching'
import { bankMatchingService } from './bankMatching'
import type {
  ProviderMatchResult,
  ProviderAutoMatchResult,
  BankMatchSuggestion,
  ProviderSummaryDashboard,
  ProviderMatchCandidate
} from './matchingTypes'
// Import types from banking.ts to avoid conflicts
import type {
  UnmatchedSaleForProvider as BankingUnmatchedSaleForProvider,
  UnmatchedProviderReport as BankingUnmatchedProviderReport,
  UnmatchedBankTransaction as BankingUnmatchedBankTransaction,
  AvailableForBankMatching as BankingAvailableForBankMatching
} from '../types/banking'

// =====================================================
// PROVIDER MATCHING (Tab 1)
// =====================================================

export async function getProviderMatchSuggestions(): Promise<{
  data: ProviderMatchResult | null
  error: any
}> {
  try {
    // Get current unmatched data
    const [salesResult, reportsResult] = await Promise.all([
      getUnmatchedSalesForProvider(),
      getUnmatchedProviderReports()
    ])

    if (salesResult.error || reportsResult.error) {
      throw new Error(`Data fetch failed: ${salesResult.error?.message || reportsResult.error?.message}`)
    }

    const sales = (salesResult.data as unknown as BankingUnmatchedSaleForProvider[]) || []
    const reports = (reportsResult.data as unknown as BankingUnmatchedProviderReport[]) || []

    // Run intelligent matching
    const result = await providerMatchingService.findProviderMatches(sales, reports)

    if (!result.success) {
      throw new Error(result.error?.message || 'Provider matching failed')
    }

    return { data: result.data!, error: null }

  } catch (error) {
    console.error('Error getting provider match suggestions:', error)
    return { data: null, error }
  }
}

export async function executeAutoProviderMatch(
  candidates?: ProviderMatchCandidate[]
): Promise<{
  data: ProviderAutoMatchResult | null
  error: any
}> {
  try {
    let matchCandidates = candidates

    // If no candidates provided, get fresh suggestions
    if (!matchCandidates) {
      const suggestionsResult = await getProviderMatchSuggestions()
      if (suggestionsResult.error || !suggestionsResult.data) {
        throw new Error('Failed to get match suggestions')
      }
      matchCandidates = suggestionsResult.data.autoMatchable
    }

    // Execute the auto-matching with actual API calls
    const processedCandidates: ProviderMatchCandidate[] = []
    const errors: string[] = []
    let matchedPairs = 0

    for (const candidate of matchCandidates) {
      try {
        // Create the actual provider match
        const matchResult = await createProviderMatch(
          candidate.sale.id,
          candidate.providerReport.id
        )

        if (matchResult.success) {
          matchedPairs++
          processedCandidates.push(candidate)
        } else {
          errors.push(`Failed to match Sale ${candidate.sale.id} with Report ${candidate.providerReport.id}`)
        }
      } catch (error) {
        errors.push(`Error matching Sale ${candidate.sale.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    const result: ProviderAutoMatchResult = {
      success: errors.length === 0,
      matchedPairs,
      errors,
      processedCandidates
    }

    return { data: result, error: null }

  } catch (error) {
    console.error('Error executing auto provider match:', error)
    return { data: null, error }
  }
}

// =====================================================
// BANK MATCHING (Tab 2)
// =====================================================

export async function getBankMatchSuggestions(
  bankTransactionId: string
): Promise<{
  data: BankMatchSuggestion | null
  error: any
}> {
  try {
    // Get the specific bank transaction
    const { data: bankTransactions, error: bankError } = await supabase
      .from('unmatched_bank_transactions' as any)
      .select('*')
      .eq('id', bankTransactionId)
      .single()

    if (bankError || !bankTransactions) {
      throw new Error(`Bank transaction not found: ${bankError?.message}`)
    }

    // Get available items for matching
    const availableResult = await getAvailableForBankMatching()
    if (availableResult.error) {
      throw new Error(`Failed to get available items: ${availableResult.error.message}`)
    }

    const availableItems = (availableResult.data as unknown as BankingAvailableForBankMatching[]) || []

    // Run intelligent matching
    const result = await bankMatchingService.findBankMatches(
      bankTransactions as unknown as BankingUnmatchedBankTransaction,
      availableItems
    )

    if (!result.success) {
      throw new Error(result.error?.message || 'Bank matching failed')
    }

    return { data: result.data!, error: null }

  } catch (error) {
    console.error('Error getting bank match suggestions:', error)
    return { data: null, error }
  }
}

export async function getProviderSummaries(): Promise<{
  data: ProviderSummaryDashboard | null
  error: any
}> {
  try {
    // Get available items for summary
    const availableResult = await getAvailableForBankMatching()
    if (availableResult.error) {
      throw new Error(`Failed to get available items: ${availableResult.error.message}`)
    }

    const availableItems = (availableResult.data as unknown as BankingAvailableForBankMatching[]) || []

    // Generate provider summary
    const result = await bankMatchingService.generateProviderSummary(availableItems)

    if (!result.success) {
      throw new Error(result.error?.message || 'Provider summary generation failed')
    }

    return { data: result.data!, error: null }

  } catch (error) {
    console.error('Error getting provider summaries:', error)
    return { data: null, error }
  }
}

// =====================================================
// ENHANCED BANK MATCH WITH INTELLIGENCE
// =====================================================

export async function createIntelligentBankMatch(
  bankTransactionId: string,
  selectedItemIds: string[],
  confidence?: number,
  matchType: 'manual' | 'suggested' = 'suggested'
) {
  try {
    // Get the selected items with their details
    const availableResult = await getAvailableForBankMatching()
    if (availableResult.error) {
      throw new Error(`Failed to get available items: ${availableResult.error.message}`)
    }

    const availableItems = (availableResult.data as unknown as BankingAvailableForBankMatching[]) || []
    const selectedItems = availableItems.filter(item => selectedItemIds.includes(item.id))

    if (selectedItems.length === 0) {
      throw new Error('No valid items selected for matching')
    }

    // Convert to the format expected by createBankMatch
    const matchedItems = selectedItems.map(item => ({
      type: item.item_type as 'sale' | 'expense' | 'cash_movement' | 'owner_transaction',
      id: item.id,
      amount: item.amount
    }))

    // Create the matches in transaction_matches table with enhanced metadata
    const matchInserts = matchedItems.map(item => ({
      bank_transaction_id: bankTransactionId,
      matched_type: item.type,
      matched_id: item.id,
      matched_amount: item.amount,
      match_type: matchType,
      match_confidence: confidence || 100.0
    }))

    const { error: matchError } = await supabase
      .from('transaction_matches')
      .insert(matchInserts)

    if (matchError) throw matchError

    // Update bank transaction status
    const { error: bankError } = await supabase
      .from('bank_transactions')
      .update({ status: 'matched' })
      .eq('id', bankTransactionId)

    if (bankError) throw bankError

    // Update matched items status  
    for (const item of matchedItems) {
      let table: string
      let updateData: any
      
      if (item.type === 'sale') {
        table = 'sales'
        updateData = { bank_transaction_id: bankTransactionId, banking_status: 'fully_matched' }
      } else if (item.type === 'expense') {
        table = 'expenses'
        updateData = { bank_transaction_id: bankTransactionId, banking_status: 'matched' }
      } else if (item.type === 'cash_movement') {
        table = 'cash_movements'
        updateData = { bank_transaction_id: bankTransactionId, banking_status: 'matched' }
      } else if (item.type === 'owner_transaction') {
        table = 'owner_transactions'
        updateData = { related_bank_transaction_id: bankTransactionId, banking_status: 'matched' }
      } else {
        continue // Skip unknown types
      }

      const { error } = await supabase
        .from(table as any)
        .update(updateData)
        .eq('id', item.id)

      if (error) throw error
    }

    return { success: true, error: null }

  } catch (error) {
    console.error('Error creating intelligent bank match:', error)
    return { success: false, error }
  }
}

// =====================================================
// PROVIDER IMPORT SESSION TYPE (for export only)
// =====================================================
// Note: Provider import API functions are in providerImporter.ts

export interface ProviderImportSession {
  id: string
  provider: 'twint' | 'sumup'
  filename: string
  import_type: string
  total_records: number
  new_records: number
  duplicate_records: number
  error_records: number
  date_range_from?: string
  date_range_to?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  imported_by: string
  created_at: string
  completed_at?: string
  notes?: string
}