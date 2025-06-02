'use client'

import { useState } from 'react'
import { supabase } from '@/shared/lib/supabase/client'
import type { Database } from '@/types/supabase'
import { 
  parseSettlementFile, 
  validateSettlementFile,
  type SettlementTransaction,
  type BankEntry,
  type SettlementImportResult 
} from '@/shared/utils/settlementImport'

// ============================================================================
// TYPES
// ============================================================================

export type Sale = Database['public']['Tables']['sales']['Row']

interface SettlementMatch {
  posTransaction: Sale
  settlementTransaction?: SettlementTransaction
  bankEntry?: BankEntry
  matchConfidence: number
  matchType: 'exact' | 'amount_date' | 'manual' | 'unmatched'
  variance?: number
}

interface SettlementImportState {
  loading: boolean
  error: string | null
  progress: {
    step: 'upload' | 'parsing' | 'matching' | 'updating' | 'completed'
    current: number
    total: number
    message: string
  }
  results: {
    imported: SettlementTransaction[]
    bankEntries: BankEntry[]
    matches: SettlementMatch[]
    unmatched: Sale[]
    updated: number
  }
}

// ============================================================================
// SETTLEMENT IMPORT HOOK
// ============================================================================

export function useSettlementImport() {
  const [state, setState] = useState<SettlementImportState>({
    loading: false,
    error: null,
    progress: {
      step: 'upload',
      current: 0,
      total: 0,
      message: ''
    },
    results: {
      imported: [],
      bankEntries: [],
      matches: [],
      unmatched: [],
      updated: 0
    }
  })

  const updateProgress = (
    step: SettlementImportState['progress']['step'],
    current: number,
    total: number,
    message: string
  ) => {
    setState(prev => ({
      ...prev,
      progress: { step, current, total, message }
    }))
  }

  // ============================================================================
  // SETTLEMENT FILE IMPORT
  // ============================================================================

  const importSettlementFile = async (file: File): Promise<{ success: boolean, error?: string }> => {
    try {
      console.log('🚀 Starting settlement import for file:', file.name, file.size, 'bytes')
      
      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
        progress: {
          step: 'upload',
          current: 0,
          total: 100,
          message: 'Validating file...'
        }
      }))

      // Validate file
      const validation = validateSettlementFile(file)
      console.log('📝 File validation result:', validation)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      updateProgress('upload', 10, 100, 'Reading file content...')

      // Read file content
      const content = await readFileContent(file)
      console.log('📄 File content length:', content.length, 'characters')
      console.log('📄 First 200 chars:', content.substring(0, 200))

      updateProgress('parsing', 20, 100, 'Parsing settlement data...')

      // Parse settlement file
      const parseResult = await parseSettlementFile(content, file.name)
      console.log('🔍 Parse result:', parseResult)
      if (!parseResult.success) {
        console.error('❌ Parsing failed:', parseResult.errors)
        throw new Error(parseResult.errors.join(', '))
      }

      updateProgress('matching', 40, 100, 'Loading POS transactions...')

      // Load pending POS transactions for matching
      const pendingTransactions = await loadPendingTransactions()
      console.log('💳 Loaded pending transactions:', pendingTransactions.length)
      console.log('💳 Sample pending transaction:', pendingTransactions[0])

      updateProgress('matching', 60, 100, 'Matching transactions...')

      // Match settlement data with POS transactions
      const matches = await matchSettlementData(pendingTransactions, parseResult)
      console.log('🎯 Generated matches:', matches.length)
      console.log('🎯 High confidence matches (≥70%):', matches.filter(m => m.matchConfidence >= 70).length)
      console.log('🎯 All match confidences:', matches.map(m => `${m.matchConfidence}%`))

      updateProgress('updating', 80, 100, 'Updating database...')

      // Update settlement data in database
      const updateCount = await updateSettlementData(matches)
      console.log('💾 Database update count:', updateCount)

      updateProgress('completed', 100, 100, `Import completed: ${updateCount} transactions updated`)

      // Update state with results
      setState(prev => ({
        ...prev,
        loading: false,
        results: {
          imported: parseResult.transactions,
          bankEntries: parseResult.bankEntries,
          matches,
          unmatched: matches.filter(m => m.matchType === 'unmatched').map(m => m.posTransaction),
          updated: updateCount
        }
      }))

      return { success: true }

    } catch (error: any) {
      console.error('Settlement import error:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Settlement import failed'
      }))
      return { success: false, error: error.message }
    }
  }

  // ============================================================================
  // MATCHING LOGIC
  // ============================================================================

  const matchSettlementData = async (
    posTransactions: Sale[],
    parseResult: SettlementImportResult
  ): Promise<SettlementMatch[]> => {
    const matches: SettlementMatch[] = []

    // Process settlement transactions (SumUp/TWINT)
    for (const settlement of parseResult.transactions) {
      const match = findBestMatch(posTransactions, settlement)
      matches.push(match)
    }

    // Process bank entries (for reconciliation)
    for (const bankEntry of parseResult.bankEntries) {
      const match = findBankMatch(posTransactions, bankEntry, parseResult.transactions)
      if (match) {
        matches.push(match)
      }
    }

    return matches
  }

  const findBestMatch = (
    posTransactions: Sale[],
    settlement: SettlementTransaction
  ): SettlementMatch => {
    console.log(`\n🎯 Finding match for settlement: ${settlement.transactionId}`)
    console.log(`   Provider: ${settlement.provider}, Amount: CHF ${settlement.grossAmount}`)
    console.log(`   Transaction Date: ${settlement.transactionDate}`)
    
    let bestMatch: SettlementMatch = {
      posTransaction: posTransactions[0], // Fallback
      settlementTransaction: settlement,
      matchConfidence: 0,
      matchType: 'unmatched'
    }

    const candidateTransactions = posTransactions.filter(pos => pos.payment_method === settlement.provider)
    console.log(`   Candidate POS transactions (${settlement.provider}): ${candidateTransactions.length}`)

    for (const pos of posTransactions) {
      // Skip if different payment method
      if (pos.payment_method !== settlement.provider) continue

      let confidence = 0
      let matchType: SettlementMatch['matchType'] = 'unmatched'
      const amountDiff = Math.abs((pos.total_amount || 0) - settlement.grossAmount)
      
      console.log(`   🔍 Checking POS ${pos.id}: CHF ${pos.total_amount}, created: ${pos.created_at}`)
      console.log(`      Amount difference: CHF ${amountDiff.toFixed(3)}`)

      // 1. Exact amount match
      if (amountDiff < 0.01) {
        confidence += 50
        matchType = 'amount_date'
        console.log(`      ✅ Amount match (+50 points)`)

        // 2. Date proximity (within 5 days for settlement delays, extended for cross-month)
        const posDate = new Date(pos.created_at)
        const settlementDate = new Date(settlement.transactionDate)
        const daysDiff = Math.abs((posDate.getTime() - settlementDate.getTime()) / (1000 * 60 * 60 * 24))
        console.log(`      📅 Date difference: ${daysDiff.toFixed(1)} days`)

        // Check if this is a cross-month settlement
        const crossMonth = posDate.getMonth() !== settlementDate.getMonth() || posDate.getFullYear() !== settlementDate.getFullYear()
        
        if (daysDiff <= 1) {
          confidence += 40 // Same day or next day
          console.log(`      ✅ Same/next day (+40 points)`)
        } else if (daysDiff <= 3) {
          confidence += 20 // Within 3 days
          console.log(`      ✅ Within 3 days (+20 points)`)
        } else if (daysDiff <= 5) {
          confidence += 10 // Within 5 days
          console.log(`      ✅ Within 5 days (+10 points)`)
        } else if (crossMonth && daysDiff <= 10) {
          confidence += 5 // Cross-month settlement, up to 10 days
          console.log(`      🗓️  Cross-month settlement within 10 days (+5 points)`)
          matchType = 'cross_month'
        } else {
          console.log(`      ⚠️  Date too far apart (no points)`)
        }
        
        // Extra penalty for cross-month (to prefer same-month matches)
        if (crossMonth) {
          confidence -= 5
          console.log(`      🗓️  Cross-month penalty (-5 points)`)
        }

        // 3. Provider reference match (if available)
        if (settlement.merchantReference && pos.id.includes(settlement.merchantReference)) {
          confidence += 30
          matchType = 'exact'
          console.log(`      ✅ Reference match (+30 points)`)
        }
      } else {
        console.log(`      ❌ Amount mismatch (no points)`)
      }

      console.log(`      📊 Total confidence: ${confidence}%`)

      // Update best match if this is better
      if (confidence > bestMatch.matchConfidence) {
        bestMatch = {
          posTransaction: pos,
          settlementTransaction: settlement,
          matchConfidence: confidence,
          matchType,
          variance: amountDiff
        }
        console.log(`      🎯 New best match!`)
      }
    }

    console.log(`   🏆 Best match: ${bestMatch.matchConfidence}% confidence (${bestMatch.matchType})`)
    return bestMatch
  }

  const findBankMatch = (
    posTransactions: Sale[],
    bankEntry: BankEntry,
    settlements: SettlementTransaction[]
  ): SettlementMatch | null => {
    // Only process credits from payment providers
    if (bankEntry.direction !== 'credit') return null
    if (bankEntry.provider === 'other') return null

    // Find settlement that matches this bank entry
    const matchingSettlement = settlements.find(s => 
      s.provider === bankEntry.provider &&
      Math.abs(s.netAmount - bankEntry.amount) < 0.01
    )

    if (!matchingSettlement) return null

    // Find POS transaction for this settlement
    const posTransaction = posTransactions.find(pos =>
      pos.payment_method === bankEntry.provider &&
      Math.abs((pos.total_amount || 0) - matchingSettlement.grossAmount) < 0.01
    )

    if (!posTransaction) return null

    return {
      posTransaction,
      settlementTransaction: matchingSettlement,
      bankEntry,
      matchConfidence: 95, // High confidence for bank-settlement matches
      matchType: 'exact',
      variance: Math.abs((posTransaction.total_amount || 0) - matchingSettlement.grossAmount)
    }
  }

  // ============================================================================
  // DATABASE OPERATIONS
  // ============================================================================

  const loadPendingTransactions = async (): Promise<Sale[]> => {
    // Load pending transactions from current and previous 2 months for cross-month settlements
    const now = new Date()
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1)
    
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .in('payment_method', ['twint', 'sumup'])
      .eq('settlement_status', 'pending')
      .gte('created_at', twoMonthsAgo.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to load pending transactions: ${error.message}`)
    }

    console.log(`📊 Loaded ${data?.length || 0} pending transactions (last 2 months for cross-month detection)`)
    return data || []
  }

  const updateSettlementData = async (matches: SettlementMatch[]): Promise<number> => {
    let updateCount = 0
    const highConfidenceMatches = matches.filter(m => m.matchConfidence >= 70)
    
    console.log('💾 Starting database updates:')
    console.log(`   - Total matches: ${matches.length}`)
    console.log(`   - High confidence matches (≥70%): ${highConfidenceMatches.length}`)
    console.log(`   - Low confidence matches (<70%): ${matches.length - highConfidenceMatches.length}`)

    for (const match of matches) {
      console.log(`\n🔍 Processing match: confidence=${match.matchConfidence}%, type=${match.matchType}`)
      console.log(`   POS Transaction: ${match.posTransaction.id} - CHF ${match.posTransaction.total_amount}`)
      
      // Only update high-confidence matches automatically
      // TODO: TEMPORARY - Lower threshold for debugging
      const confidenceThreshold = 50 // Lowered from 70 for debugging
      if (match.matchConfidence < confidenceThreshold) {
        console.log(`   ⏭️  Skipping (confidence < ${confidenceThreshold}%)`)
        continue
      }
      
      if (!match.settlementTransaction) {
        console.log(`   ⏭️  Skipping (no settlement data)`)
        continue
      }

      console.log(`   📊 Settlement data: gross=${match.settlementTransaction.grossAmount}, fee=${match.settlementTransaction.providerFee}, net=${match.settlementTransaction.netAmount}`)

      try {
        const { data, error } = await supabase
          .from('sales')
          .update({
            gross_amount: match.settlementTransaction.grossAmount,
            provider_fee: match.settlementTransaction.providerFee,
            net_amount: match.settlementTransaction.netAmount,
            settlement_status: 'settled',
            settlement_date: match.settlementTransaction.settlementDate,
            provider_reference_id: match.settlementTransaction.transactionId,
          })
          .eq('id', match.posTransaction.id)
          .select()

        if (error) {
          console.error(`   ❌ Database error for ${match.posTransaction.id}:`, error)
          continue
        }

        console.log(`   ✅ Successfully updated transaction ${match.posTransaction.id}`)
        console.log(`   📋 Updated data:`, data)
        updateCount++
      } catch (error) {
        console.error(`   💥 Exception updating transaction ${match.posTransaction.id}:`, error)
        continue
      }
    }

    console.log(`\n🎯 Database update summary: ${updateCount} transactions updated out of ${matches.length} matches`)
    return updateCount
  }

  // ============================================================================
  // MANUAL REVIEW FUNCTIONS
  // ============================================================================

  const approveMatch = async (match: SettlementMatch): Promise<{ success: boolean, error?: string }> => {
    if (!match.settlementTransaction) {
      return { success: false, error: 'No settlement data to approve' }
    }

    try {
      const { error } = await supabase
        .from('sales')
        .update({
          gross_amount: match.settlementTransaction.grossAmount,
          provider_fee: match.settlementTransaction.providerFee,
          net_amount: match.settlementTransaction.netAmount,
          settlement_status: 'settled',
          settlement_date: match.settlementTransaction.settlementDate,
          provider_reference_id: match.settlementTransaction.transactionId,
        })
        .eq('id', match.posTransaction.id)

      if (error) {
        throw error
      }

      // Update local state
      setState(prev => ({
        ...prev,
        results: {
          ...prev.results,
          updated: prev.results.updated + 1,
          unmatched: prev.results.unmatched.filter(u => u.id !== match.posTransaction.id)
        }
      }))

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const rejectMatch = async (match: SettlementMatch): Promise<{ success: boolean }> => {
    // Remove from matches, keep as unmatched for manual review
    setState(prev => ({
      ...prev,
      results: {
        ...prev.results,
        matches: prev.results.matches.filter(m => m !== match),
        unmatched: [...prev.results.unmatched, match.posTransaction]
      }
    }))

    return { success: true }
  }

  // ============================================================================
  // UTILITY FUNCTIONS  
  // ============================================================================

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = (e) => reject(new Error('Failed to read file'))
      reader.readAsText(file, 'utf-8')
    })
  }

  const resetImport = () => {
    setState({
      loading: false,
      error: null,
      progress: {
        step: 'upload',
        current: 0,
        total: 0,
        message: ''
      },
      results: {
        imported: [],
        bankEntries: [],
        matches: [],
        unmatched: [],
        updated: 0
      }
    })
  }

  return {
    ...state,
    importSettlementFile,
    approveMatch,
    rejectMatch,
    resetImport
  }
}