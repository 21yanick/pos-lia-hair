'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { parseRaiffeisenCAMT053, type BankEntry } from '@/lib/utils/settlementImport'

// ============================================================================
// TYPES
// ============================================================================

export interface BankReconciliationMatch {
  id: string
  bankEntry: BankEntry
  posTransaction?: any // From sales table
  expense?: any // From expenses table
  matchType: 'settlement_verification' | 'expense_reconciliation' | 'unmatched'
  confidence: number
  variance?: number
  status: 'pending' | 'approved' | 'rejected'
  // Batch settlement fields
  batchTransactions?: any[]
  batchTotal?: number
}

export interface ReconciliationSummary {
  totalBankEntries: number
  matched: number
  unmatched: number
  settlementCredits: number
  expenseDebits: number
  variance: number
}

interface BankReconciliationState {
  bankEntries: BankEntry[]
  reconciliationMatches: BankReconciliationMatch[]
  summary: ReconciliationSummary
  loading: boolean
  error: string | null
  sessionId: string | null
  isCompleted: boolean
}

// ============================================================================
// BANK RECONCILIATION HOOK
// ============================================================================

export function useBankReconciliation() {
  const [state, setState] = useState<BankReconciliationState>({
    bankEntries: [],
    reconciliationMatches: [],
    summary: {
      totalBankEntries: 0,
      matched: 0,
      unmatched: 0,
      settlementCredits: 0,
      expenseDebits: 0,
      variance: 0
    },
    loading: false,
    error: null,
    sessionId: null,
    isCompleted: false
  })

  // ============================================================================
  // BANK RECONCILIATION SESSION MANAGEMENT
  // ============================================================================

  const loadExistingReconciliation = async (month: string): Promise<{ 
    exists: boolean, 
    isCompleted: boolean, 
    sessionId?: string 
  }> => {
    try {
      const [year, monthNum] = month.split('-').map(Number)
      
      const { data, error } = await supabase.rpc('check_bank_reconciliation_completion', {
        p_year: year,
        p_month: monthNum
      })
      
      if (error) {
        console.error('Error checking existing reconciliation:', error)
        return { exists: false, isCompleted: false }
      }
      
      if (data && data.length > 0) {
        const result = data[0]
        setState(prev => ({
          ...prev,
          sessionId: result.session_id,
          isCompleted: result.is_completed,
          summary: {
            ...prev.summary,
            totalBankEntries: result.total_entries,
            matched: result.matched_entries,
            unmatched: result.total_entries - result.matched_entries
          }
        }))
        
        return {
          exists: true,
          isCompleted: result.is_completed,
          sessionId: result.session_id
        }
      }
      
      return { exists: false, isCompleted: false }
    } catch (error: any) {
      console.error('Error loading existing reconciliation:', error)
      return { exists: false, isCompleted: false }
    }
  }

  // ============================================================================
  // BANK STATEMENT IMPORT
  // ============================================================================

  const importBankStatement = async (
    file: File, 
    month: string
  ): Promise<{ success: boolean, error?: string, entriesFound?: number }> => {
    try {
      console.log('🏦 Starting bank reconciliation for:', file.name, month)
      
      setState(prev => ({
        ...prev,
        loading: true,
        error: null
      }))

      // Read and parse XML
      const content = await readFileContent(file)
      const bankEntries = parseRaiffeisenCAMT053(content)
      
      console.log(`🏦 Parsed ${bankEntries.length} bank entries`)

      // Load relevant data for matching
      // Parse month to get date range
      const [year, monthNum] = month.split('-').map(Number)
      const startDate = new Date(year, monthNum - 1, 1)
      const endDate = new Date(year, monthNum, 0, 23, 59, 59)
      
      // Load sales for the month directly from Supabase
      const { data: salesData } = await supabase
        .from('sales')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .eq('settlement_status', 'settled')
      
      // Load expenses for the month directly from Supabase  
      const { data: expensesData } = await supabase
        .from('expenses')
        .select('*')
        .gte('payment_date', startDate.toISOString().split('T')[0])
        .lte('payment_date', endDate.toISOString().split('T')[0])
        .eq('payment_method', 'bank')
      
      const monthlySales = salesData || []
      const monthlyExpenses = expensesData || []

      console.log(`🏦 Loaded ${monthlySales.length} settled sales and ${monthlyExpenses.length} bank expenses for matching`)

      // Perform reconciliation matching
      const matches = await performReconciliation(bankEntries, monthlySales, monthlyExpenses)
      
      console.log(`🏦 Generated ${matches.length} reconciliation matches`)

      // Calculate summary
      const summary = calculateSummary(bankEntries, matches)

      setState(prev => ({
        ...prev,
        bankEntries,
        reconciliationMatches: matches,
        summary,
        loading: false
      }))

      return { 
        success: true, 
        entriesFound: bankEntries.length 
      }

    } catch (error: any) {
      console.error('🏦 Bank reconciliation error:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Bank reconciliation failed'
      }))
      return { 
        success: false, 
        error: error.message 
      }
    }
  }

  // ============================================================================
  // RECONCILIATION LOGIC
  // ============================================================================

  const performReconciliation = async (
    bankEntries: BankEntry[],
    sales: any[],
    expenses: any[]
  ): Promise<BankReconciliationMatch[]> => {
    const matches: BankReconciliationMatch[] = []

    for (const bankEntry of bankEntries) {
      console.log(`\\n🔍 Reconciling bank entry: ${bankEntry.direction} CHF ${bankEntry.amount} - ${bankEntry.description}`)
      
      let match: BankReconciliationMatch = {
        id: `${bankEntry.bankReference}_${bankEntry.date}`,
        bankEntry,
        matchType: 'unmatched',
        confidence: 0,
        status: 'pending'
      }

      // 1. Settlement Verification (Credits from TWINT/SumUp)
      if (bankEntry.direction === 'credit' && (bankEntry.provider === 'twint' || bankEntry.provider === 'sumup')) {
        const settlementMatch = findSettlementMatch(bankEntry, sales)
        if (settlementMatch) {
          match = {
            ...match,
            posTransaction: settlementMatch.transaction,
            matchType: 'settlement_verification',
            confidence: settlementMatch.confidence,
            variance: settlementMatch.variance
          }
          console.log(`  ✅ Settlement match found: ${settlementMatch.confidence}% confidence`)
        }
      }
      
      // 2. Expense Reconciliation (Debits)
      else if (bankEntry.direction === 'debit') {
        const expenseMatch = findExpenseMatch(bankEntry, expenses)
        if (expenseMatch) {
          match = {
            ...match,
            expense: expenseMatch.expense,
            matchType: 'expense_reconciliation',
            confidence: expenseMatch.confidence,
            variance: expenseMatch.variance
          }
          console.log(`  ✅ Expense match found: ${expenseMatch.confidence}% confidence`)
        }
      }

      // 3. Other Credits (Cash deposits, etc.)
      else if (bankEntry.direction === 'credit' && bankEntry.provider === 'other') {
        // TODO: Match against cash deposits or other income
        console.log(`  ℹ️  Other credit entry (not matched): ${bankEntry.description}`)
      }

      // 4. Batch Settlement Detection (if no individual match found)
      if (match.confidence === 0 && bankEntry.direction === 'credit' && (bankEntry.provider === 'twint' || bankEntry.provider === 'sumup')) {
        const batchMatch = findBatchSettlementMatch(bankEntry, sales)
        if (batchMatch) {
          match = {
            ...match,
            posTransaction: batchMatch.transactions[0], // Primary transaction for display
            matchType: 'settlement_verification',
            confidence: batchMatch.confidence,
            variance: batchMatch.variance,
            // Add batch info
            batchTransactions: batchMatch.transactions,
            batchTotal: batchMatch.total
          }
          console.log(`  ✅ Batch settlement match found: ${batchMatch.transactions.length} transactions, ${batchMatch.confidence}% confidence`)
        }
      }

      if (match.confidence === 0) {
        console.log(`  ⚠️  No match found for ${bankEntry.direction} CHF ${bankEntry.amount}`)
      }

      matches.push(match)
    }

    return matches
  }

  const findSettlementMatch = (
    bankEntry: BankEntry, 
    sales: any[]
  ): { transaction: any, confidence: number, variance: number } | null => {
    // Look for settled transactions from the same provider
    const candidateTransactions = sales.filter(sale => 
      sale.payment_method === bankEntry.provider &&
      sale.settlement_status === 'settled' &&
      sale.net_amount !== null
    )

    console.log(`    🔍 Settlement candidates: ${candidateTransactions.length} ${bankEntry.provider} transactions`)

    for (const transaction of candidateTransactions) {
      let confidence = 0
      const amountVariance = Math.abs(bankEntry.amount - (transaction.net_amount || 0))
      
      console.log(`    📊 Checking: POS net CHF ${transaction.net_amount} vs Bank CHF ${bankEntry.amount} (variance: CHF ${amountVariance.toFixed(2)})`)

      // 1. Exact amount match (net amount from settlement = bank credit)
      if (amountVariance < 0.01) {
        confidence += 60
        console.log(`    ✅ Exact amount match (+60 points)`)
      } else if (amountVariance < 0.10) {
        confidence += 40 // Small rounding differences
        console.log(`    ✅ Near amount match (+40 points)`)
      } else {
        console.log(`    ❌ Amount mismatch (no points)`)
        continue
      }

      // 2. Date proximity (settlement date vs bank booking date)
      if (transaction.settlement_date) {
        const settlementDate = new Date(transaction.settlement_date)
        const bankDate = new Date(bankEntry.date)
        const daysDiff = Math.abs((settlementDate.getTime() - bankDate.getTime()) / (1000 * 60 * 60 * 24))
        
        console.log(`    📅 Date diff: ${daysDiff.toFixed(1)} days (settlement: ${transaction.settlement_date}, bank: ${bankEntry.date})`)
        
        if (daysDiff <= 1) {
          confidence += 30
          console.log(`    ✅ Same/next day (+30 points)`)
        } else if (daysDiff <= 3) {
          confidence += 15
          console.log(`    ✅ Within 3 days (+15 points)`)
        }
      }

      // 3. Provider reference in bank description
      if (transaction.provider_reference_id && bankEntry.description.includes(transaction.provider_reference_id)) {
        confidence += 10
        console.log(`    ✅ Reference ID match (+10 points)`)
      }

      console.log(`    📊 Total confidence: ${confidence}%`)

      if (confidence >= 60) { // Minimum threshold for settlement verification
        return {
          transaction,
          confidence,
          variance: amountVariance
        }
      }
    }

    return null
  }

  const findExpenseMatch = (
    bankEntry: BankEntry, 
    expenses: any[]
  ): { expense: any, confidence: number, variance: number } | null => {
    // Look for bank expenses (not cash)
    const candidateExpenses = expenses.filter(expense => 
      expense.payment_method === 'bank'
    )

    console.log(`    🔍 Expense candidates: ${candidateExpenses.length} bank expenses`)

    for (const expense of candidateExpenses) {
      let confidence = 0
      const amountVariance = Math.abs(bankEntry.amount - expense.amount)
      
      console.log(`    📊 Checking: Expense CHF ${expense.amount} vs Bank CHF ${bankEntry.amount} (variance: CHF ${amountVariance.toFixed(2)})`)

      // 1. Exact amount match
      if (amountVariance < 0.01) {
        confidence += 70
        console.log(`    ✅ Exact amount match (+70 points)`)
      } else if (amountVariance < 1.00) {
        confidence += 50 // Small differences
        console.log(`    ✅ Near amount match (+50 points)`)
      } else {
        console.log(`    ❌ Amount mismatch (no points)`)
        continue
      }

      // 2. Date proximity (payment date vs bank booking date)
      const expenseDate = new Date(expense.payment_date || expense.created_at)
      const bankDate = new Date(bankEntry.date)
      const daysDiff = Math.abs((expenseDate.getTime() - bankDate.getTime()) / (1000 * 60 * 60 * 24))
      
      console.log(`    📅 Date diff: ${daysDiff.toFixed(1)} days (expense: ${expense.payment_date}, bank: ${bankEntry.date})`)
      
      if (daysDiff <= 1) {
        confidence += 25
        console.log(`    ✅ Same/next day (+25 points)`)
      } else if (daysDiff <= 7) {
        confidence += 10
        console.log(`    ✅ Within week (+10 points)`)
      }

      // 3. Description similarity (simple keyword matching)
      if (expense.description && bankEntry.description) {
        const expenseWords = expense.description.toLowerCase().split(' ').filter(w => w.length > 3)
        const bankWords = bankEntry.description.toLowerCase()
        const commonWords = expenseWords.filter(word => bankWords.includes(word))
        
        if (commonWords.length > 0) {
          confidence += Math.min(commonWords.length * 5, 15) // Max 15 points for description
          console.log(`    ✅ Description similarity (+${Math.min(commonWords.length * 5, 15)} points): ${commonWords.join(', ')}`)
        }
      }

      console.log(`    📊 Total confidence: ${confidence}%`)

      if (confidence >= 70) { // Minimum threshold for expense reconciliation
        return {
          expense,
          confidence,
          variance: amountVariance
        }
      }
    }

    return null
  }

  const findBatchSettlementMatch = (
    bankEntry: BankEntry,
    sales: any[]
  ): { transactions: any[], confidence: number, variance: number, total: number } | null => {
    console.log(`\\n🔍 Batch settlement detection for CHF ${bankEntry.amount} (${bankEntry.provider})`)
    
    // Get all settled transactions from the same provider
    const candidateTransactions = sales.filter(sale => 
      sale.payment_method === bankEntry.provider &&
      sale.settlement_status === 'settled' &&
      sale.net_amount !== null
    )

    console.log(`    📊 Available ${bankEntry.provider} transactions: ${candidateTransactions.length}`)
    
    // Generate all possible combinations (2-5 transactions max for performance)
    const maxCombinationSize = Math.min(5, candidateTransactions.length)
    
    for (let combinationSize = 2; combinationSize <= maxCombinationSize; combinationSize++) {
      console.log(`    🔍 Checking combinations of ${combinationSize} transactions...`)
      
      const combinations = generateCombinations(candidateTransactions, combinationSize)
      
      for (const combination of combinations) {
        const totalNetAmount = combination.reduce((sum, tx) => sum + (tx.net_amount || 0), 0)
        const variance = Math.abs(bankEntry.amount - totalNetAmount)
        
        console.log(`    📊 Combination of ${combination.length}: CHF ${totalNetAmount.toFixed(2)} (variance: CHF ${variance.toFixed(2)})`)
        
        let confidence = 0
        
        // 1. Exact or near-exact amount match
        if (variance < 0.01) {
          confidence += 80 // High confidence for exact match
          console.log(`    ✅ Exact batch amount match (+80 points)`)
        } else if (variance < 0.50) {
          confidence += 60 // Good confidence for near match
          console.log(`    ✅ Near batch amount match (+60 points)`)
        } else if (variance < 2.00) {
          confidence += 40 // Moderate confidence for close match
          console.log(`    ✅ Close batch amount match (+40 points)`)
        } else {
          console.log(`    ❌ Amount variance too large (${variance.toFixed(2)})`)
          continue
        }
        
        // 2. Date proximity - check if transactions are from similar timeframe
        const transactionDates = combination.map(tx => new Date(tx.created_at))
        const minDate = new Date(Math.min(...transactionDates.map(d => d.getTime())))
        const maxDate = new Date(Math.max(...transactionDates.map(d => d.getTime())))
        const daySpread = (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
        
        console.log(`    📅 Transaction date spread: ${daySpread.toFixed(1)} days`)
        
        if (daySpread <= 1) {
          confidence += 15 // Same day batch
          console.log(`    ✅ Same day batch (+15 points)`)
        } else if (daySpread <= 7) {
          confidence += 10 // Weekly batch
          console.log(`    ✅ Weekly batch (+10 points)`)
        } else if (daySpread <= 14) {
          confidence += 5 // Bi-weekly batch
          console.log(`    ✅ Bi-weekly batch (+5 points)`)
        }
        
        // 3. Settlement date proximity to bank entry
        const bankDate = new Date(bankEntry.date)
        const avgSettlementDate = combination
          .filter(tx => tx.settlement_date)
          .reduce((sum, tx, _, arr) => {
            const settlementDate = new Date(tx.settlement_date)
            return sum + settlementDate.getTime() / arr.length
          }, 0)
        
        if (avgSettlementDate > 0) {
          const avgDate = new Date(avgSettlementDate)
          const daysDiff = Math.abs((bankDate.getTime() - avgDate.getTime()) / (1000 * 60 * 60 * 24))
          
          console.log(`    📅 Settlement to bank date diff: ${daysDiff.toFixed(1)} days`)
          
          if (daysDiff <= 3) {
            confidence += 10
            console.log(`    ✅ Settlement timing match (+10 points)`)
          }
        }
        
        console.log(`    📊 Batch confidence: ${confidence}%`)
        
        // Return first decent batch match (threshold: 70%)
        if (confidence >= 70) {
          return {
            transactions: combination,
            confidence,
            variance,
            total: totalNetAmount
          }
        }
      }
    }
    
    console.log(`    ❌ No suitable batch combination found`)
    return null
  }

  // Helper function to generate combinations
  const generateCombinations = <T>(array: T[], size: number): T[][] => {
    if (size === 1) return array.map(item => [item])
    if (size > array.length) return []
    
    const combinations: T[][] = []
    
    function backtrack(start: number, currentCombination: T[]) {
      if (currentCombination.length === size) {
        combinations.push([...currentCombination])
        return
      }
      
      for (let i = start; i < array.length; i++) {
        currentCombination.push(array[i])
        backtrack(i + 1, currentCombination)
        currentCombination.pop()
      }
    }
    
    backtrack(0, [])
    return combinations
  }

  // ============================================================================
  // MATCH MANAGEMENT
  // ============================================================================

  const approveMatch = async (matchId: string): Promise<{ success: boolean, error?: string }> => {
    try {
      setState(prev => {
        const updatedMatches = prev.reconciliationMatches.map(match =>
          match.id === matchId ? { ...match, status: 'approved' as const } : match
        )
        
        // Recalculate summary based on updated matches
        const newSummary = calculateSummary(prev.bankEntries, updatedMatches)
        
        return {
          ...prev,
          reconciliationMatches: updatedMatches,
          summary: newSummary
        }
      })

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const rejectMatch = async (matchId: string): Promise<{ success: boolean, error?: string }> => {
    try {
      setState(prev => {
        const updatedMatches = prev.reconciliationMatches.map(match =>
          match.id === matchId ? { ...match, status: 'rejected' as const } : match
        )
        
        // Recalculate summary based on updated matches
        const newSummary = calculateSummary(prev.bankEntries, updatedMatches)
        
        return {
          ...prev,
          reconciliationMatches: updatedMatches,
          summary: newSummary
        }
      })

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const resetReconciliation = () => {
    setState({
      bankEntries: [],
      reconciliationMatches: [],
      summary: {
        totalBankEntries: 0,
        matched: 0,
        unmatched: 0,
        settlementCredits: 0,
        expenseDebits: 0,
        variance: 0
      },
      loading: false,
      error: null,
      sessionId: null,
      isCompleted: false
    })
  }

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================


  const calculateSummary = (
    bankEntries: BankEntry[], 
    matches: BankReconciliationMatch[]
  ): ReconciliationSummary => {
    // Count unique bank entries that have been APPROVED
    const approvedBankEntryIds = new Set(
      matches
        .filter(m => m.status === 'approved')
        .map(m => m.bankEntry.id || `${m.bankEntry.date}-${m.bankEntry.amount}-${m.bankEntry.direction}`)
    )
    
    // Count unique bank entries that are PENDING review (high confidence)
    const pendingBankEntryIds = new Set(
      matches
        .filter(m => m.status === 'pending' && m.confidence >= 60)
        .map(m => m.bankEntry.id || `${m.bankEntry.date}-${m.bankEntry.amount}-${m.bankEntry.direction}`)
    )
    
    const matched = approvedBankEntryIds.size
    const unmatched = bankEntries.length - matched - pendingBankEntryIds.size
    const settlementCredits = bankEntries.filter(e => e.direction === 'credit' && e.provider !== 'other').length
    const expenseDebits = bankEntries.filter(e => e.direction === 'debit').length
    const variance = matches.reduce((sum, match) => sum + (match.variance || 0), 0)

    return {
      totalBankEntries: bankEntries.length,
      matched,
      unmatched: Math.max(0, unmatched), // Never negative
      settlementCredits,
      expenseDebits,
      variance
    }
  }

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = (e) => reject(new Error('Failed to read file'))
      reader.readAsText(file, 'utf-8')
    })
  }

  return {
    ...state,
    importBankStatement,
    approveMatch,
    rejectMatch,
    resetReconciliation,
    loadExistingReconciliation
  }
}