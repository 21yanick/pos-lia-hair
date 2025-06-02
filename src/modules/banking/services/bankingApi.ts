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

export async function getBankAccounts() {
  const { data, error } = await supabase
    .from('bank_accounts')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching bank accounts:', error)
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

export async function getUnmatchedSalesForProvider() {
  const { data, error } = await supabase
    .from('unmatched_sales_for_provider' as any)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching unmatched sales:', error)
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

export async function getUnmatchedProviderReports() {
  const { data, error } = await supabase
    .from('unmatched_provider_reports' as any)
    .select('*')
    .order('transaction_date', { ascending: false })

  if (error) {
    console.error('Error fetching unmatched provider reports:', error)
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

export async function getUnmatchedBankTransactions() {
  const { data, error } = await supabase
    .from('unmatched_bank_transactions' as any)
    .select('*')
    .order('transaction_date', { ascending: false })

  if (error) {
    console.error('Error fetching unmatched bank transactions:', error)
    return { data: [], error }
  }

  return { data: data || [], error: null }
}

// Right Side: Available Items for Bank Matching
export interface AvailableForBankMatching {
  id: string
  item_type: 'sale' | 'expense' | 'cash_movement'
  date: string
  amount: number
  description: string
  banking_status: string
}

export async function getAvailableForBankMatching() {
  const { data, error } = await supabase
    .from('available_for_bank_matching' as any)
    .select('*')
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching available items for bank matching:', error)
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

export async function getBankingStats(): Promise<{ data: BankingStats | null, error: any }> {
  try {
    // Get counts from each view
    const [salesResult, providerResult, bankResult, expensesResult] = await Promise.all([
      supabase.from('unmatched_sales_for_provider' as any).select('id', { count: 'exact', head: true }),
      supabase.from('unmatched_provider_reports' as any).select('id', { count: 'exact', head: true }),
      supabase.from('unmatched_bank_transactions' as any).select('id', { count: 'exact', head: true }),
      supabase.from('available_for_bank_matching' as any).select('id', { count: 'exact', head: true })
    ])

    // Get total unmatched amount from bank transactions
    const { data: bankAmounts } = await supabase
      .from('unmatched_bank_transactions' as any)
      .select('amount_abs')

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
      const table = item.type === 'sale' ? 'sales' : 
                   item.type === 'expense' ? 'expenses' : 
                   item.type === 'owner_transaction' ? 'owner_transactions' : 'cash_movements'
      
      const updateData = item.type === 'sale' 
        ? { bank_transaction_id: bankTransactionId, banking_status: 'fully_matched' as any }
        : item.type === 'owner_transaction'
        ? { related_bank_transaction_id: bankTransactionId, banking_status: 'matched' as any }
        : { bank_transaction_id: bankTransactionId, banking_status: 'matched' as any }

      const { error } = await supabase
        .from(table)
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