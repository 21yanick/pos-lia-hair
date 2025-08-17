// =====================================================
// Batch Matching Service - Provider Settlement Batching
// =====================================================
// Purpose: Intelligent matching of bank settlements with provider batches
// Handles: Tolerance matching, batch grouping, many-to-one relationships

import { supabase } from '@/shared/lib/supabase/client'
import { formatDateForAPI } from '@/shared/utils/dateUtils'

// =====================================================
// TYPES
// =====================================================

export interface BatchMatchCandidate {
  bankTransaction: {
    id: string
    amount: number
    description: string
    transaction_date: string
  }
  providerReports: {
    id: string
    provider: string
    net_amount: number
    settlement_date: string
    sale_id: string
  }[]
  totalProviderAmount: number
  difference: number
  confidence: number
  matchType: 'exact' | 'tolerance' | 'batch'
  reasons: string[]
}

export interface BatchMatchResult {
  success: boolean
  matchedCount: number
  createdMatches: {
    bankTransactionId: string
    providerReportIds: string[]
    matchType: string
    confidence: number
  }[]
  errors: string[]
}

// =====================================================
// BATCH MATCHING ALGORITHM
// =====================================================

export async function findBatchMatchCandidates(
  organizationId: string // ✅ CRITICAL FIX: Multi-Tenant organization security
): Promise<BatchMatchCandidate[]> {
  try {
    // console.log('🔍 Starting batch matching analysis...')

    // Get unmatched bank transactions
    const { data: unmatchedBankTx, error: bankError } = await supabase
      .from('bank_transactions')
      .select('id, amount, description, transaction_date')
      .eq('status', 'unmatched')
      .eq('organization_id', organizationId) // ✅ CRITICAL FIX: Organization filter
      .order('transaction_date')

    if (bankError) throw bankError

    // Get matched provider reports (these should be available for bank matching)
    const { data: matchedProviders, error: providerError } = await supabase
      .from('provider_reports')
      .select(`
        id, 
        provider, 
        net_amount, 
        settlement_date,
        sales!inner(id)
      `)
      .eq('status', 'matched')
      .eq('organization_id', organizationId) // ✅ CRITICAL FIX: Organization filter
      .order('settlement_date')

    if (providerError) throw providerError

    const candidates: BatchMatchCandidate[] = []

    // For each unmatched bank transaction, find potential provider matches
    for (const bankTx of unmatchedBankTx || []) {
      // console.log(`\n🏦 Analyzing bank transaction: ${bankTx.amount} CHF - ${bankTx.description}`)

      // Strategy 1: Exact single match
      const exactMatch = (matchedProviders || []).find(
        (pr) => Math.abs(pr.net_amount - bankTx.amount) < 0.01
      )

      if (exactMatch) {
        candidates.push({
          bankTransaction: bankTx,
          providerReports: [
            {
              id: exactMatch.id,
              provider: exactMatch.provider,
              net_amount: exactMatch.net_amount,
              settlement_date: exactMatch.settlement_date,
              sale_id: exactMatch.sales[0]?.id || '',
            },
          ],
          totalProviderAmount: exactMatch.net_amount,
          difference: Math.abs(exactMatch.net_amount - bankTx.amount),
          confidence: 100,
          matchType: 'exact',
          reasons: ['Exact amount match', `${exactMatch.provider.toUpperCase()} settlement`],
        })
        // console.log(`  ✅ EXACT MATCH: ${exactMatch.net_amount} CHF ${exactMatch.provider}`)
        continue
      }

      // Strategy 2: Tolerance match (±2 CHF)
      const toleranceMatches = (matchedProviders || []).filter((pr) => {
        const diff = Math.abs(pr.net_amount - bankTx.amount)
        return diff > 0.01 && diff <= 2.0
      })

      for (const toleranceMatch of toleranceMatches) {
        const diff = Math.abs(toleranceMatch.net_amount - bankTx.amount)
        candidates.push({
          bankTransaction: bankTx,
          providerReports: [
            {
              id: toleranceMatch.id,
              provider: toleranceMatch.provider,
              net_amount: toleranceMatch.net_amount,
              settlement_date: toleranceMatch.settlement_date,
              sale_id: toleranceMatch.sales[0]?.id || '',
            },
          ],
          totalProviderAmount: toleranceMatch.net_amount,
          difference: diff,
          confidence: Math.round(95 - diff * 10), // 95% for 0.1 diff, 85% for 1.0 diff
          matchType: 'tolerance',
          reasons: [
            `Tolerance match (±${diff.toFixed(2)} CHF)`,
            `${toleranceMatch.provider.toUpperCase()} settlement`,
          ],
        })
        // console.log(`  🔶 TOLERANCE MATCH: ${toleranceMatch.net_amount} CHF ${toleranceMatch.provider} (diff: ${diff.toFixed(2)})`)
      }

      // Strategy 3: Batch matching (multiple providers sum to bank amount)
      const batchCandidates = await findBatchCombinations(bankTx, matchedProviders || [])
      candidates.push(...batchCandidates)
    }

    // Sort by confidence and return
    return candidates.sort((a, b) => b.confidence - a.confidence)
  } catch (error) {
    console.error('Error finding batch match candidates:', error)
    return []
  }
}

// =====================================================
// BATCH COMBINATION FINDER
// =====================================================

async function findBatchCombinations(
  bankTx: any,
  providerReports: any[]
): Promise<BatchMatchCandidate[]> {
  const candidates: BatchMatchCandidate[] = []
  const tolerance = 2.0 // ±2 CHF tolerance

  // Group providers by type and date range
  const twintReports = providerReports.filter((pr) => pr.provider === 'twint')
  const sumupReports = providerReports.filter((pr) => pr.provider === 'sumup')

  // Try combinations of 2-4 provider reports
  for (let combSize = 2; combSize <= Math.min(4, providerReports.length); combSize++) {
    // Try TWINT combinations
    const twintCombos = getCombinations(twintReports, combSize)
    for (const combo of twintCombos) {
      const totalAmount = combo.reduce((sum, pr) => sum + pr.net_amount, 0)
      const diff = Math.abs(totalAmount - bankTx.amount)

      if (diff <= tolerance) {
        const confidence = Math.round(90 - diff * 5 - combSize * 5) // Penalty for complexity
        candidates.push({
          bankTransaction: bankTx,
          providerReports: combo.map((pr) => ({
            id: pr.id,
            provider: pr.provider,
            net_amount: pr.net_amount,
            settlement_date: pr.settlement_date,
            sale_id: pr.sales[0]?.id || '',
          })),
          totalProviderAmount: totalAmount,
          difference: diff,
          confidence: Math.max(60, confidence),
          matchType: 'batch',
          reasons: [
            `Batch of ${combSize} TWINT settlements`,
            `Total: ${totalAmount.toFixed(2)} CHF`,
            `Tolerance: ±${diff.toFixed(2)} CHF`,
          ],
        })
        // console.log(`  🔀 BATCH MATCH: ${combSize} TWINT reports = ${totalAmount.toFixed(2)} CHF (diff: ${diff.toFixed(2)})`)
      }
    }

    // Try SumUp combinations
    const sumupCombos = getCombinations(sumupReports, combSize)
    for (const combo of sumupCombos) {
      const totalAmount = combo.reduce((sum, pr) => sum + pr.net_amount, 0)
      const diff = Math.abs(totalAmount - bankTx.amount)

      if (diff <= tolerance) {
        const confidence = Math.round(90 - diff * 5 - combSize * 5)
        candidates.push({
          bankTransaction: bankTx,
          providerReports: combo.map((pr) => ({
            id: pr.id,
            provider: pr.provider,
            net_amount: pr.net_amount,
            settlement_date: pr.settlement_date,
            sale_id: pr.sales[0]?.id || '',
          })),
          totalProviderAmount: totalAmount,
          difference: diff,
          confidence: Math.max(60, confidence),
          matchType: 'batch',
          reasons: [
            `Batch of ${combSize} SumUp settlements`,
            `Total: ${totalAmount.toFixed(2)} CHF`,
            `Tolerance: ±${diff.toFixed(2)} CHF`,
          ],
        })
        // console.log(`  🔀 BATCH MATCH: ${combSize} SumUp reports = ${totalAmount.toFixed(2)} CHF (diff: ${diff.toFixed(2)})`)
      }
    }
  }

  return candidates
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

function getCombinations<T>(array: T[], size: number): T[][] {
  if (size === 1) return array.map((item) => [item])
  if (size > array.length) return []

  const combinations: T[][] = []

  function backtrack(start: number, currentCombo: T[]) {
    if (currentCombo.length === size) {
      combinations.push([...currentCombo])
      return
    }

    for (let i = start; i < array.length; i++) {
      currentCombo.push(array[i])
      backtrack(i + 1, currentCombo)
      currentCombo.pop()
    }
  }

  backtrack(0, [])
  return combinations
}

// =====================================================
// EXECUTE BATCH MATCHES
// =====================================================

export async function executeBatchMatches(
  candidates: BatchMatchCandidate[]
): Promise<BatchMatchResult> {
  const result: BatchMatchResult = {
    success: true,
    matchedCount: 0,
    createdMatches: [],
    errors: [],
  }

  try {
    // console.log(`🚀 Executing ${candidates.length} batch matches...`)

    for (const candidate of candidates) {
      try {
        // Create transaction matches for each provider report
        const matches = candidate.providerReports.map((pr) => ({
          bank_transaction_id: candidate.bankTransaction.id,
          matched_type: 'provider_batch',
          matched_id: pr.id,
          matched_amount: pr.net_amount,
          match_confidence: candidate.confidence,
          match_details: {
            match_type: candidate.matchType,
            total_amount: candidate.totalProviderAmount,
            difference: candidate.difference,
            reasons: candidate.reasons,
            provider_count: candidate.providerReports.length,
          },
        }))

        // Insert transaction matches
        const { error: matchError } = await supabase.from('transaction_matches').insert(matches)

        if (matchError) throw matchError

        // Update bank transaction status
        const { error: bankUpdateError } = await supabase
          .from('bank_transactions')
          .update({ status: 'matched' })
          .eq('id', candidate.bankTransaction.id)

        if (bankUpdateError) throw bankUpdateError

        result.matchedCount++
        result.createdMatches.push({
          bankTransactionId: candidate.bankTransaction.id,
          providerReportIds: candidate.providerReports.map((pr) => pr.id),
          matchType: candidate.matchType,
          confidence: candidate.confidence,
        })

        // console.log(`  ✅ Matched: ${candidate.bankTransaction.amount} CHF → ${candidate.providerReports.length} provider reports`)
      } catch (error) {
        const errorMessage = `Failed to match bank transaction ${candidate.bankTransaction.id}: ${error}`
        result.errors.push(errorMessage)
        // console.error(`  ❌ ${errorMessage}`)
      }
    }

    result.success = result.errors.length === 0
    // console.log(`🎉 Batch matching completed: ${result.matchedCount} successful matches, ${result.errors.length} errors`)

    return result
  } catch (error) {
    console.error('Error executing batch matches:', error)
    return {
      success: false,
      matchedCount: 0,
      createdMatches: [],
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    }
  }
}

// =====================================================
// PUBLIC API
// =====================================================

export async function runAutomaticBatchMatching(
  organizationId: string // ✅ CRITICAL FIX: Multi-Tenant organization parameter
): Promise<BatchMatchResult> {
  // console.log('🤖 Starting automatic batch matching...')

  // Find candidates
  const candidates = await findBatchMatchCandidates(organizationId) // ✅ Pass organization

  if (candidates.length === 0) {
    // console.log('ℹ️ No batch match candidates found')
    return {
      success: true,
      matchedCount: 0,
      createdMatches: [],
      errors: [],
    }
  }

  // Filter high-confidence candidates for automatic execution
  const highConfidenceCandidates = candidates.filter((c) => c.confidence >= 85)

  // console.log(`Found ${candidates.length} total candidates, ${highConfidenceCandidates.length} high-confidence (≥85%)`)

  if (highConfidenceCandidates.length === 0) {
    // console.log('ℹ️ No high-confidence candidates for automatic matching')
    return {
      success: true,
      matchedCount: 0,
      createdMatches: [],
      errors: ['No high-confidence matches found. Manual review recommended.'],
    }
  }

  // Execute high-confidence matches
  return await executeBatchMatches(highConfidenceCandidates)
}

export { findBatchMatchCandidates, executeBatchMatches }
