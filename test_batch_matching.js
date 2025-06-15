#!/usr/bin/env node

// =====================================================
// Batch Matching Service Test Script
// =====================================================
// Purpose: Test and analyze batch matching without executing matches

import { createClient } from '@supabase/supabase-js'

// Supabase configuration (from environment or defaults)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseKey)

// =====================================================
// BATCH MATCHING ANALYSIS (Replica of service logic)
// =====================================================

async function findBatchMatchCandidates() {
  try {
    console.log('🔍 Starting batch matching analysis...\n')
    
    // Get unmatched bank transactions
    const { data: unmatchedBankTx, error: bankError } = await supabase
      .from('bank_transactions')
      .select('id, amount, description, transaction_date')
      .eq('status', 'unmatched')
      .order('transaction_date')
    
    if (bankError) throw bankError
    
    console.log(`📊 Found ${unmatchedBankTx?.length || 0} unmatched bank transactions`)
    
    // Get matched provider reports
    const { data: matchedProviders, error: providerError } = await supabase
      .from('provider_reports')
      .select('id, provider, net_amount, settlement_date')
      .eq('status', 'matched')
      .order('settlement_date')
    
    if (providerError) throw providerError
    
    console.log(`📊 Found ${matchedProviders?.length || 0} matched provider reports`)
    console.log(`   - TWINT: ${matchedProviders?.filter(p => p.provider === 'twint').length || 0}`)
    console.log(`   - SumUp: ${matchedProviders?.filter(p => p.provider === 'sumup').length || 0}\n`)
    
    const candidates = []
    
    // Analyze each unmatched bank transaction
    for (const bankTx of unmatchedBankTx || []) {
      console.log(`🏦 Analyzing: ${bankTx.amount} CHF - ${bankTx.description} (${bankTx.transaction_date})`)
      
      // Strategy 1: Exact matches
      const exactMatches = (matchedProviders || []).filter(pr => 
        Math.abs(pr.net_amount - bankTx.amount) < 0.01
      )
      
      for (const exactMatch of exactMatches) {
        candidates.push({
          bankTransaction: bankTx,
          providerReports: [exactMatch],
          totalProviderAmount: exactMatch.net_amount,
          difference: Math.abs(exactMatch.net_amount - bankTx.amount),
          confidence: 100,
          matchType: 'exact',
          reasons: ['Perfect amount match', `${exactMatch.provider.toUpperCase()} settlement on ${exactMatch.settlement_date}`]
        })
        console.log(`   ✅ EXACT MATCH: ${exactMatch.net_amount} CHF ${exactMatch.provider} (${exactMatch.settlement_date})`)
      }
      
      // Strategy 2: Tolerance matches (±2 CHF)
      const toleranceMatches = (matchedProviders || []).filter(pr => {
        const diff = Math.abs(pr.net_amount - bankTx.amount)
        return diff > 0.01 && diff <= 2.0
      })
      
      for (const toleranceMatch of toleranceMatches) {
        const diff = Math.abs(toleranceMatch.net_amount - bankTx.amount)
        candidates.push({
          bankTransaction: bankTx,
          providerReports: [toleranceMatch],
          totalProviderAmount: toleranceMatch.net_amount,
          difference: diff,
          confidence: Math.round(95 - (diff * 10)),
          matchType: 'tolerance',
          reasons: [`Tolerance match (±${diff.toFixed(2)} CHF)`, `${toleranceMatch.provider.toUpperCase()} settlement on ${toleranceMatch.settlement_date}`]
        })
        console.log(`   🔶 TOLERANCE MATCH: ${toleranceMatch.net_amount} CHF ${toleranceMatch.provider} (diff: ${diff.toFixed(2)} CHF)`)
      }
      
      // Strategy 3: Batch matching (combinations)
      const batchCandidates = findBatchCombinations(bankTx, matchedProviders || [])
      candidates.push(...batchCandidates)
      
      if (exactMatches.length === 0 && toleranceMatches.length === 0 && batchCandidates.length === 0) {
        console.log(`   ❌ NO MATCHES FOUND`)
      }
      
      console.log('')
    }
    
    return candidates.sort((a, b) => b.confidence - a.confidence)
    
  } catch (error) {
    console.error('❌ Error in batch matching analysis:', error)
    return []
  }
}

function findBatchCombinations(bankTx, providerReports) {
  const candidates = []
  const tolerance = 2.0
  
  // Group by provider type
  const twintReports = providerReports.filter(pr => pr.provider === 'twint')
  const sumupReports = providerReports.filter(pr => pr.provider === 'sumup')
  
  // Try combinations of 2-4 reports
  for (let combSize = 2; combSize <= Math.min(4, providerReports.length); combSize++) {
    // TWINT combinations
    const twintCombos = getCombinations(twintReports, combSize)
    for (const combo of twintCombos) {
      const totalAmount = combo.reduce((sum, pr) => sum + pr.net_amount, 0)
      const diff = Math.abs(totalAmount - bankTx.amount)
      
      if (diff <= tolerance) {
        const confidence = Math.round(90 - (diff * 5) - (combSize * 5))
        candidates.push({
          bankTransaction: bankTx,
          providerReports: combo,
          totalProviderAmount: totalAmount,
          difference: diff,
          confidence: Math.max(60, confidence),
          matchType: 'batch',
          reasons: [
            `Batch of ${combSize} TWINT settlements`,
            `Total: ${totalAmount.toFixed(2)} CHF`,
            `Tolerance: ±${diff.toFixed(2)} CHF`
          ]
        })
        console.log(`   🔀 BATCH MATCH: ${combSize} TWINT = ${totalAmount.toFixed(2)} CHF (diff: ${diff.toFixed(2)} CHF)`)
      }
    }
    
    // SumUp combinations
    const sumupCombos = getCombinations(sumupReports, combSize)
    for (const combo of sumupCombos) {
      const totalAmount = combo.reduce((sum, pr) => sum + pr.net_amount, 0)
      const diff = Math.abs(totalAmount - bankTx.amount)
      
      if (diff <= tolerance) {
        const confidence = Math.round(90 - (diff * 5) - (combSize * 5))
        candidates.push({
          bankTransaction: bankTx,
          providerReports: combo,
          totalProviderAmount: totalAmount,
          difference: diff,
          confidence: Math.max(60, confidence),
          matchType: 'batch',
          reasons: [
            `Batch of ${combSize} SumUp settlements`,
            `Total: ${totalAmount.toFixed(2)} CHF`,
            `Tolerance: ±${diff.toFixed(2)} CHF`
          ]
        })
        console.log(`   🔀 BATCH MATCH: ${combSize} SumUp = ${totalAmount.toFixed(2)} CHF (diff: ${diff.toFixed(2)} CHF)`)
      }
    }
  }
  
  return candidates
}

function getCombinations(array, size) {
  if (size === 1) return array.map(item => [item])
  if (size > array.length) return []
  
  const combinations = []
  
  function backtrack(start, currentCombo) {
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
// MAIN TEST EXECUTION
// =====================================================

async function runBatchMatchingTest() {
  console.log('🚀 BATCH MATCHING SERVICE TEST\n')
  console.log('=' .repeat(60))
  
  try {
    // System diagnostics
    console.log('\n📋 SYSTEM STATUS')
    console.log('-'.repeat(30))
    
    const { data: allBankTx } = await supabase
      .from('bank_transactions')
      .select('status')
    
    const { data: allProviderReports } = await supabase
      .from('provider_reports')
      .select('status')
    
    const { data: existingMatches } = await supabase
      .from('transaction_matches')
      .select('matched_type')
    
    console.log(`Bank Transactions: ${allBankTx?.length || 0} total`)
    console.log(`  - Matched: ${allBankTx?.filter(tx => tx.status === 'matched').length || 0}`)
    console.log(`  - Unmatched: ${allBankTx?.filter(tx => tx.status === 'unmatched').length || 0}`)
    
    console.log(`Provider Reports: ${allProviderReports?.length || 0} total`)
    console.log(`  - Matched: ${allProviderReports?.filter(pr => pr.status === 'matched').length || 0}`)
    console.log(`  - Unmatched: ${allProviderReports?.filter(pr => pr.status === 'unmatched').length || 0}`)
    
    console.log(`Existing Transaction Matches: ${existingMatches?.length || 0}`)
    
    console.log('\n🔍 BATCH MATCHING ANALYSIS')
    console.log('-'.repeat(30))
    
    // Find candidates
    const candidates = await findBatchMatchCandidates()
    
    console.log(`\n📊 ANALYSIS RESULTS`)
    console.log('-'.repeat(30))
    console.log(`Total candidates found: ${candidates.length}`)
    
    if (candidates.length === 0) {
      console.log('ℹ️ No batch match candidates found.')
      return
    }
    
    // Group by confidence
    const highConfidence = candidates.filter(c => c.confidence >= 85)
    const mediumConfidence = candidates.filter(c => c.confidence >= 70 && c.confidence < 85)
    const lowConfidence = candidates.filter(c => c.confidence < 70)
    
    console.log(`\n🎯 CONFIDENCE BREAKDOWN`)
    console.log('-'.repeat(30))
    console.log(`High Confidence (≥85%): ${highConfidence.length} candidates`)
    console.log(`Medium Confidence (70-84%): ${mediumConfidence.length} candidates`)
    console.log(`Low Confidence (<70%): ${lowConfidence.length} candidates`)
    
    // Show detailed results
    console.log(`\n📝 DETAILED MATCH CANDIDATES`)
    console.log('=' .repeat(60))
    
    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i]
      const confidenceIcon = candidate.confidence >= 85 ? '🟢' : candidate.confidence >= 70 ? '🟡' : '🔴'
      
      console.log(`\n${confidenceIcon} CANDIDATE #${i + 1} - Confidence: ${candidate.confidence}%`)
      console.log(`   Type: ${candidate.matchType.toUpperCase()}`)
      console.log(`   Bank: ${candidate.bankTransaction.amount} CHF - ${candidate.bankTransaction.description}`)
      console.log(`   Provider${candidate.providerReports.length > 1 ? 's' : ''}: ${candidate.providerReports.length}x reports = ${candidate.totalProviderAmount.toFixed(2)} CHF`)
      
      for (const pr of candidate.providerReports) {
        console.log(`     - ${pr.provider.toUpperCase()}: ${pr.net_amount} CHF (${pr.settlement_date})`)
      }
      
      console.log(`   Difference: ±${candidate.difference.toFixed(2)} CHF`)
      console.log(`   Reasons: ${candidate.reasons.join(', ')}`)
    }
    
    // Recommendations
    console.log(`\n🎯 RECOMMENDATIONS`)
    console.log('=' .repeat(60))
    
    if (highConfidence.length > 0) {
      console.log(`✅ ${highConfidence.length} HIGH-CONFIDENCE matches ready for automatic execution`)
      console.log(`   These are safe to execute automatically.`)
    }
    
    if (mediumConfidence.length > 0) {
      console.log(`⚠️ ${mediumConfidence.length} MEDIUM-CONFIDENCE matches need manual review`)
      console.log(`   Review these before executing.`)
    }
    
    if (lowConfidence.length > 0) {
      console.log(`🔴 ${lowConfidence.length} LOW-CONFIDENCE matches need careful analysis`)
      console.log(`   These may be false positives.`)
    }
    
    console.log(`\n📋 NEXT STEPS`)
    console.log('-'.repeat(30))
    console.log(`1. Review the ${candidates.length} candidates above`)
    console.log(`2. Execute high-confidence matches automatically`)
    console.log(`3. Manually review medium/low confidence matches`)
    console.log(`4. Monitor results and adjust tolerance if needed`)
    
  } catch (error) {
    console.error('❌ Test execution failed:', error)
  }
}

// Execute the test
runBatchMatchingTest()
  .then(() => {
    console.log('\n🎉 Batch matching test completed successfully!')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n💥 Test failed:', error)
    process.exit(1)
  })