// =====================================================
// Owner Transactions API Services
// =====================================================
// CRUD Operations for Owner Transactions with Banking Integration
// Connects to owner_transactions table created in 13_owner_transactions.sql

'use client'

import { supabase } from '@/shared/lib/supabase/client'
import { 
  OwnerTransactionRow, 
  OwnerTransactionInsert, 
  OwnerTransactionUpdate,
  OwnerBalance 
} from '../types/banking'

// =====================================================
// OWNER TRANSACTIONS CRUD
// =====================================================

export async function createOwnerTransaction(transaction: OwnerTransactionInsert) {
  try {
    // Step 1: Create Owner Transaction
    const { data: ownerTransaction, error: ownerError } = await supabase
      .from('owner_transactions')
      .insert([transaction])
      .select()
      .single()

    if (ownerError) throw ownerError

    // Step 2: Create Cash Movement if private_cash and deposit/withdrawal
    if (transaction.payment_method === 'private_cash' && 
        (transaction.transaction_type === 'deposit' || transaction.transaction_type === 'withdrawal')) {
      
      const cashMovementType = transaction.transaction_type === 'deposit' ? 'cash_in' : 'cash_out'
      const cashDescription = transaction.transaction_type === 'deposit' 
        ? `Owner Einlage: ${transaction.description}`
        : `Owner Entnahme: ${transaction.description}`

      const { error: cashError } = await supabase
        .from('cash_movements')
        .insert([{
          amount: transaction.amount,
          type: cashMovementType,
          description: cashDescription,
          reference_type: 'owner_transaction',
          reference_id: ownerTransaction.id,
          user_id: transaction.user_id,
          movement_type: 'cash_operation',
          banking_status: 'unmatched'
        }])

      if (cashError) {
        // Rollback: Delete the owner transaction if cash movement fails
        await supabase
          .from('owner_transactions')
          .delete()
          .eq('id', ownerTransaction.id)
        
        throw new Error(`Cash movement creation failed: ${cashError.message}`)
      }
    }

    return { data: ownerTransaction, error: null }
  } catch (error) {
    console.error('Error creating owner transaction:', error)
    return { data: null, error }
  }
}

export async function getOwnerTransactions(userId: string): Promise<{ data: OwnerTransactionRow[], error: any }> {
  try {
    const { data, error } = await supabase
      .from('owner_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('transaction_date', { ascending: false })

    if (error) throw error

    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error fetching owner transactions:', error)
    return { data: [], error }
  }
}

export async function updateOwnerTransaction(id: string, updates: OwnerTransactionUpdate) {
  try {
    const { data, error } = await supabase
      .from('owner_transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error updating owner transaction:', error)
    return { data: null, error }
  }
}

export async function deleteOwnerTransaction(id: string) {
  try {
    const { error } = await supabase
      .from('owner_transactions')
      .delete()
      .eq('id', id)

    if (error) throw error

    return { success: true, error: null }
  } catch (error) {
    console.error('Error deleting owner transaction:', error)
    return { success: false, error }
  }
}

// =====================================================
// OWNER BALANCE CALCULATION
// =====================================================

export async function getOwnerBalance(userId: string): Promise<{ data: OwnerBalance | null, error: any }> {
  try {
    // Call the PostgreSQL function
    const { data, error } = await supabase
      .rpc('get_owner_loan_balance', { user_uuid: userId })

    if (error) throw error

    // Get detailed breakdown for UI
    const [depositsResult, expensesResult, withdrawalsResult] = await Promise.all([
      supabase
        .from('owner_transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('transaction_type', 'deposit'),
      
      supabase
        .from('owner_transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('transaction_type', 'expense'),
        
      supabase
        .from('owner_transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('transaction_type', 'withdrawal')
    ])

    const total_deposits = depositsResult.data?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0
    const total_expenses = expensesResult.data?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0
    const total_withdrawals = withdrawalsResult.data?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0

    const balance: OwnerBalance = {
      total_deposits,
      total_expenses,
      total_withdrawals,
      net_balance: data || 0 // From PostgreSQL function
    }

    return { data: balance, error: null }

  } catch (error) {
    console.error('Error fetching owner balance:', error)
    return { data: null, error }
  }
}

// =====================================================
// OWNER TRANSACTIONS FOR BANKING MODULE
// =====================================================

export async function getOwnerTransactionsForBanking(userId: string) {
  try {
    // Get unmatched bank_transfer owner transactions (appear in Banking Tab 2)
    const { data, error } = await supabase
      .from('owner_transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('payment_method', 'bank_transfer')
      .eq('banking_status', 'unmatched')
      .order('transaction_date', { ascending: false })

    if (error) throw error

    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error fetching owner transactions for banking:', error)
    return { data: [], error }
  }
}

// =====================================================
// BANKING INTEGRATION
// =====================================================

export async function markOwnerTransactionAsMatched(
  ownerTransactionId: string, 
  bankTransactionId: string
) {
  try {
    const { data, error } = await supabase
      .from('owner_transactions')
      .update({
        related_bank_transaction_id: bankTransactionId,
        banking_status: 'matched'
      })
      .eq('id', ownerTransactionId)
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error marking owner transaction as matched:', error)
    return { data: null, error }
  }
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

export async function getOwnerTransactionsByDateRange(
  userId: string,
  startDate: string,
  endDate: string
) {
  try {
    const { data, error } = await supabase
      .from('owner_transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)
      .order('transaction_date', { ascending: false })

    if (error) throw error

    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error fetching owner transactions by date range:', error)
    return { data: [], error }
  }
}

export async function getOwnerTransactionsByType(
  userId: string,
  transactionType: 'deposit' | 'expense' | 'withdrawal'
) {
  try {
    const { data, error } = await supabase
      .from('owner_transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('transaction_type', transactionType)
      .order('transaction_date', { ascending: false })

    if (error) throw error

    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error fetching owner transactions by type:', error)
    return { data: [], error }
  }
}