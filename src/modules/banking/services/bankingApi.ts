// =====================================================
// Banking API Services
// =====================================================
// Connects to Supabase views for Banking Module 2-Tab UI
// Uses the 4 optimized views created in 06_banking_system_rebuild.sql

'use client'

import { supabase } from '@/shared/lib/supabase/client'
// Note: Types from ../types/banking are imported in the Provider section with aliases to avoid conflicts

// =====================================================
// BANK ACCOUNTS
// =====================================================

// Import Clean Architecture types
import type { BankReconciliationMatchInsert } from '../types/banking'

// =====================================================
// RECONCILIATION SESSION MANAGEMENT (Clean Architecture)
// =====================================================

/**
 * Get or create current month reconciliation session
 * Clean Architecture: Session-aware reconciliation system
 */
async function getOrCreateReconciliationSession(organizationId: string): Promise<string> {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  // Try to find existing session for current month
  const { data: existingSession, error: findError } = await supabase
    .from('bank_reconciliation_sessions')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('year', year)
    .eq('month', month)
    .single()

  if (existingSession && !findError) {
    return existingSession.id
  }

  // Create new session for current month
  const { data: newSession, error: createError } = await supabase
    .from('bank_reconciliation_sessions')
    .insert({
      year,
      month,
      organization_id: organizationId,
      status: 'in_progress',
      bank_entries_count: 0,
      matched_entries_count: 0,
      unmatched_entries_count: 0,
      completion_percentage: 0,
    })
    .select('id')
    .single()

  if (createError || !newSession) {
    throw new Error(`Failed to create reconciliation session: ${createError?.message}`)
  }

  return newSession.id
}

// Clean Architecture: Database schema-aligned type
export interface BankAccount {
  id: string
  account_name: string // Database uses account_name, not name
  account_type: string
  bank_name: string
  bic: string | null
  created_at: string
  currency: string
  current_balance: number
  iban: string
  is_active: boolean
  last_transaction_date: string | null
  notes: string | null
  organization_id: string | null // Database uses organization_id, not user_id
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
// Type imported from ../types/banking (Clean Architecture)

export async function getUnmatchedSalesForProvider(organizationId: string) {
  const { data, error } = await supabase
    .from('unmatched_sales_for_provider')
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
// Type imported from ../types/banking (Clean Architecture)

export async function getUnmatchedProviderReports(organizationId: string) {
  const { data, error } = await supabase
    .from('unmatched_provider_reports')
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
    .from('unmatched_bank_transactions')
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
    .from('available_for_bank_matching')
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

export async function getBankingStats(
  organizationId: string
): Promise<{ data: BankingStats | null; error: unknown }> {
  try {
    // Get counts from each view with ORGANIZATION SECURITY
    const [salesResult, providerResult, bankResult, expensesResult] = await Promise.all([
      supabase
        .from('unmatched_sales_for_provider')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organizationId), // 🔒 SECURITY: Organization-scoped
      supabase
        .from('unmatched_provider_reports')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organizationId), // 🔒 SECURITY: Organization-scoped
      supabase
        .from('unmatched_bank_transactions')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organizationId), // 🔒 SECURITY: Organization-scoped
      supabase
        .from('available_for_bank_matching')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organizationId), // 🔒 SECURITY: Organization-scoped
    ])

    // Get total unmatched amount from bank transactions with ORGANIZATION SECURITY
    const { data: bankAmounts } = await supabase
      .from('unmatched_bank_transactions')
      .select('amount_abs')
      .eq('organization_id', organizationId) // 🔒 SECURITY: Organization-scoped

    const totalUnmatchedAmount =
      (bankAmounts as { amount_abs: number }[])?.reduce(
        (sum: number, item: { amount_abs: number }) => sum + (item.amount_abs || 0),
        0
      ) || 0

    const unmatchedSales = salesResult.count || 0
    const unmatchedProviderReports = providerResult.count || 0
    const unmatchedBankTransactions = bankResult.count || 0
    const unmatchedExpenses = expensesResult.count || 0

    // Calculate rough matching progress (inverse of unmatched items)
    const totalItems =
      unmatchedSales + unmatchedProviderReports + unmatchedBankTransactions + unmatchedExpenses
    const matchingProgress = totalItems > 0 ? Math.max(0, 100 - totalItems * 5) : 100

    const stats: BankingStats = {
      unmatchedSales,
      unmatchedProviderReports,
      unmatchedExpenses,
      unmatchedBankTransactions,
      totalUnmatchedAmount,
      matchingProgress,
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
        banking_status: 'provider_matched',
      })
      .eq('id', saleId)

    if (saleError) throw saleError

    // Update provider report with sale_id
    const { error: providerError } = await supabase
      .from('provider_reports')
      .update({
        sale_id: saleId,
        status: 'matched',
      })
      .eq('id', providerReportId)

    if (providerError) throw providerError

    return { success: true, error: null }
  } catch (error) {
    console.error('Error creating provider match:', error)
    return { success: false, error }
  }
}

// Create Bank Match (Tab 2: Bank Transaction ↔ Items) - Clean Architecture
export async function createBankMatch(
  bankTransactionId: string,
  matchedItems: Array<{
    type: 'sale' | 'expense' | 'cash_movement' | 'owner_transaction'
    id: string
    amount: number
  }>,
  organizationId: string
) {
  try {
    // Clean Architecture: Session-aware reconciliation system
    const sessionId = await getOrCreateReconciliationSession(organizationId)

    // Clean Architecture: Proper field mapping based on actual DB schema
    const matchInserts: BankReconciliationMatchInsert[] = matchedItems.map((item) => {
      const baseMatch: BankReconciliationMatchInsert = {
        session_id: sessionId, // REQUIRED field
        bank_transaction_id: bankTransactionId,
        match_type: 'manual', // varchar(20) NOT NULL
        confidence_score: 1.0, // numeric(3,2) 0-1 (100% confidence for manual matches)
        amount_difference: 0, // Perfect match assumed for manual
        status: 'approved', // Manual matches are pre-approved
        organization_id: organizationId,
        // Initialize specific reference fields to null
        provider_report_id: null,
        sale_id: null,
        expense_id: null,
        notes: null,
        created_by: null,
      }

      // Map item type to correct reference field
      switch (
        item.type // ✅ RESTORED: Use parameter property name in createBankMatch
      ) {
        case 'sale':
          baseMatch.sale_id = item.id
          baseMatch.notes = `Manual match to sale (amount: ${item.amount})`
          break
        case 'expense':
          baseMatch.expense_id = item.id
          baseMatch.notes = `Manual match to expense (amount: ${item.amount})`
          break
        case 'cash_movement':
        case 'owner_transaction':
          // These don't have direct reference fields in bank_reconciliation_matches
          // Store in notes for now (Clean Architecture - explicit decision)
          baseMatch.notes = `Manual match to ${item.type} (ID: ${item.id}, amount: ${item.amount})` // ✅ RESTORED: Use parameter property
          break
      }

      return baseMatch
    })

    // Clean Architecture: Properly typed database insert
    const { error: matchError } = await supabase
      .from('bank_reconciliation_matches')
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
      // ✅ RESTORED: Use parameter name in createBankMatch
      // V6.1: Clean Architecture - type-safe table selection
      type BankingTable = 'sales' | 'expenses' | 'cash_movements' | 'owner_transactions'
      let table: BankingTable
      let updateData: Record<string, unknown>

      if (item.type === 'sale') {
        // ✅ RESTORED: Use parameter property in createBankMatch
        table = 'sales'
        updateData = { bank_transaction_id: bankTransactionId, banking_status: 'fully_matched' }
      } else if (item.type === 'expense') {
        // ✅ RESTORED: Use parameter property in createBankMatch
        table = 'expenses'
        updateData = { bank_transaction_id: bankTransactionId, banking_status: 'matched' }
      } else if (item.type === 'cash_movement') {
        // ✅ RESTORED: Use parameter property in createBankMatch
        table = 'cash_movements'
        updateData = { bank_transaction_id: bankTransactionId, banking_status: 'matched' }
      } else if (item.type === 'owner_transaction') {
        // ✅ RESTORED: Use parameter property in createBankMatch
        table = 'owner_transactions'
        updateData = { related_bank_transaction_id: bankTransactionId, banking_status: 'matched' }
      } else {
        continue // Skip unknown types
      }

      // V6.1: Type-safe dynamic table update with union type
      const { error } = await supabase.from(table).update(updateData).eq('id', item.id)

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
  account_name: string // Clean Architecture: Match database schema
  bank_name: string
  iban: string // Database requires this field
  bic?: string // Optional in schema
  account_type?: string // Default: 'checking'
  currency?: string // Default: 'CHF'
  organization_id: string // Required for multi-tenancy
}) {
  // Clean Architecture: Map to exact database schema
  const accountData = {
    account_name: account.account_name,
    bank_name: account.bank_name,
    iban: account.iban,
    bic: account.bic || null,
    account_type: account.account_type || 'checking',
    currency: account.currency || 'CHF',
    organization_id: account.organization_id,
    is_active: true,
    current_balance: 0,
    notes: null,
  }

  const { data, error } = await supabase
    .from('bank_accounts')
    .insert([accountData])
    .select()
    .single()

  return { data, error }
}

// =====================================================
// INTELLIGENT MATCHING API FUNCTIONS
// =====================================================
// New endpoints for smart matching algorithms

// Import types from banking.ts (Clean Architecture)
import type {
  AvailableForBankMatching as BankingAvailableForBankMatching,
  UnmatchedBankTransaction as BankingUnmatchedBankTransaction,
  UnmatchedProviderReport,
  UnmatchedSaleForProvider,
} from '../types/banking'
import { bankMatchingService } from './bankMatching'
import type {
  BankMatchSuggestion,
  ProviderAutoMatchResult,
  ProviderDashboardData,
  ProviderMatchCandidate,
  ProviderMatchResult,
} from './matchingTypes'
import { providerMatchingService } from './providerMatching'

// =====================================================
// PROVIDER MATCHING (Tab 1)
// =====================================================

export async function getProviderMatchSuggestions(organizationId: string): Promise<{
  data: ProviderMatchResult | null
  error: unknown
}> {
  try {
    // Get current unmatched data - Clean Architecture: Organization-scoped
    const [salesResult, reportsResult] = await Promise.all([
      getUnmatchedSalesForProvider(organizationId),
      getUnmatchedProviderReports(organizationId),
    ])

    if (salesResult.error || reportsResult.error) {
      throw new Error(
        `Data fetch failed: ${salesResult.error?.message || reportsResult.error?.message}`
      )
    }

    const sales = (salesResult.data as unknown as UnmatchedSaleForProvider[]) || []
    const reports = (reportsResult.data as unknown as UnmatchedProviderReport[]) || []

    // Run intelligent matching
    const result = await providerMatchingService.findProviderMatches(sales, reports)

    if (!result.success) {
      throw new Error(result.error?.message || 'Provider matching failed')
    }

    return { data: result.data || null, error: null }
  } catch (error) {
    console.error('Error getting provider match suggestions:', error)
    return { data: null, error }
  }
}

export async function executeAutoProviderMatch(
  organizationId: string, // ✅ ADDED: Multi-Tenant security parameter
  candidates?: ProviderMatchCandidate[]
): Promise<{
  data: ProviderAutoMatchResult | null
  error: unknown
}> {
  try {
    let matchCandidates = candidates

    // If no candidates provided, get fresh suggestions
    if (!matchCandidates) {
      const suggestionsResult = await getProviderMatchSuggestions(organizationId) // ✅ FIXED: Pass organizationId
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
          errors.push(
            `Failed to match Sale ${candidate.sale.id} with Report ${candidate.providerReport.id}`
          )
        }
      } catch (error) {
        errors.push(
          `Error matching Sale ${candidate.sale.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    }

    const result: ProviderAutoMatchResult = {
      success: errors.length === 0,
      matchedPairs,
      errors,
      processedCandidates,
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
  bankTransactionId: string,
  organizationId: string // ✅ ADDED: Multi-Tenant security parameter
): Promise<{
  data: BankMatchSuggestion | null
  error: unknown
}> {
  try {
    // Get the specific bank transaction
    const { data: bankTransactions, error: bankError } = await supabase
      .from('unmatched_bank_transactions')
      .select('*')
      .eq('id', bankTransactionId)
      .single()

    if (bankError || !bankTransactions) {
      throw new Error(`Bank transaction not found: ${bankError?.message}`)
    }

    // Get available items for matching
    const availableResult = await getAvailableForBankMatching(organizationId) // ✅ FIXED: Pass organizationId
    if (availableResult.error) {
      throw new Error(`Failed to get available items: ${availableResult.error.message}`)
    }

    const availableItems =
      (availableResult.data as unknown as BankingAvailableForBankMatching[]) || []

    // Run intelligent matching
    const result = await bankMatchingService.findBankMatches(
      bankTransactions as unknown as BankingUnmatchedBankTransaction,
      availableItems
    )

    if (!result.success) {
      throw new Error(result.error?.message || 'Bank matching failed')
    }

    return { data: result.data || null, error: null }
  } catch (error) {
    console.error('Error getting bank match suggestions:', error)
    return { data: null, error }
  }
}

export async function getProviderSummaries(
  organizationId: string // ✅ ADDED: Multi-Tenant security parameter
): Promise<{
  data: ProviderDashboardData | null
  error: unknown
}> {
  try {
    // Get available items for summary
    const availableResult = await getAvailableForBankMatching(organizationId) // ✅ FIXED: Pass organizationId
    if (availableResult.error) {
      throw new Error(`Failed to get available items: ${availableResult.error.message}`)
    }

    const availableItems =
      (availableResult.data as unknown as BankingAvailableForBankMatching[]) || []

    // Generate provider summary
    const result = await bankMatchingService.generateProviderSummary(availableItems)

    if (!result.success) {
      throw new Error(result.error?.message || 'Provider summary generation failed')
    }

    return { data: result.data || null, error: null }
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
  organizationId: string,
  confidence?: number,
  matchType: 'manual' | 'suggested' = 'suggested'
) {
  try {
    // Clean Architecture: Session-aware reconciliation system
    const sessionId = await getOrCreateReconciliationSession(organizationId)

    // Get the selected items with their details
    const availableResult = await getAvailableForBankMatching(organizationId) // ✅ FIXED: Pass organizationId
    if (availableResult.error) {
      throw new Error(`Failed to get available items: ${availableResult.error.message}`)
    }

    const availableItems =
      (availableResult.data as unknown as BankingAvailableForBankMatching[]) || []
    const selectedItems = availableItems.filter((item) => selectedItemIds.includes(item.id))

    if (selectedItems.length === 0) {
      throw new Error('No valid items selected for matching')
    }

    // Clean Architecture: Proper field mapping based on actual DB schema
    const matchInserts: BankReconciliationMatchInsert[] = selectedItems.map((item) => {
      const baseMatch: BankReconciliationMatchInsert = {
        session_id: sessionId, // REQUIRED field
        bank_transaction_id: bankTransactionId,
        match_type: matchType === 'manual' ? 'manual' : 'fuzzy', // Map suggested → fuzzy
        confidence_score: confidence ? confidence / 100 : 0.8, // Convert % to 0-1 scale
        amount_difference: 0, // TODO: Calculate actual difference
        status: matchType === 'manual' ? 'approved' : 'pending', // Manual = approved, suggested = pending
        organization_id: organizationId,
        // Initialize specific reference fields to null
        provider_report_id: null,
        sale_id: null,
        expense_id: null,
        notes: null,
        created_by: null,
      }

      // Map item type to correct reference field
      const itemType = item.item_type as 'sale' | 'expense' | 'cash_movement' | 'owner_transaction'
      switch (itemType) {
        case 'sale':
          baseMatch.sale_id = item.id
          baseMatch.notes = `${matchType} match to sale (amount: ${item.amount}, confidence: ${confidence || 80}%)`
          break
        case 'expense':
          baseMatch.expense_id = item.id
          baseMatch.notes = `${matchType} match to expense (amount: ${item.amount}, confidence: ${confidence || 80}%)`
          break
        case 'cash_movement':
        case 'owner_transaction':
          // Store in notes for now (Clean Architecture - explicit decision)
          baseMatch.notes = `${matchType} match to ${itemType} (ID: ${item.id}, amount: ${item.amount}, confidence: ${confidence || 80}%)`
          break
      }

      return baseMatch
    })

    // Clean Architecture: Properly typed database insert
    const { error: matchError } = await supabase
      .from('bank_reconciliation_matches')
      .insert(matchInserts)

    if (matchError) throw matchError

    // Update bank transaction status
    const { error: bankError } = await supabase
      .from('bank_transactions')
      .update({ status: 'matched' })
      .eq('id', bankTransactionId)

    if (bankError) throw bankError

    // Update matched items status
    for (const item of selectedItems) {
      // ✅ FIXED: Use correct variable name
      // V6.1: Clean Architecture - type-safe table selection
      type BankingTable = 'sales' | 'expenses' | 'cash_movements' | 'owner_transactions'
      let table: BankingTable
      let updateData: Record<string, unknown>

      if (item.item_type === 'sale') {
        table = 'sales'
        updateData = { bank_transaction_id: bankTransactionId, banking_status: 'fully_matched' }
      } else if (item.item_type === 'expense') {
        table = 'expenses'
        updateData = { bank_transaction_id: bankTransactionId, banking_status: 'matched' }
      } else if (item.item_type === 'cash_movement') {
        table = 'cash_movements'
        updateData = { bank_transaction_id: bankTransactionId, banking_status: 'matched' }
      } else if (item.item_type === 'owner_transaction') {
        table = 'owner_transactions'
        updateData = { related_bank_transaction_id: bankTransactionId, banking_status: 'matched' }
      } else {
        continue // Skip unknown types
      }

      // V6.1: Type-safe dynamic table update with union type
      const { error } = await supabase.from(table).update(updateData).eq('id', item.id)

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
