#!/usr/bin/env node

// =====================================================
// Execute Batch Matching - Direct SQL Approach
// =====================================================
// Purpose: Execute the 3 exact matches we identified

import { createClient } from '@supabase/supabase-js'

// Use actual Supabase configuration
const supabaseUrl = 'https://vkwrdaafzwonowfqmxtz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrd3JkYWFmendvbm93ZnFteHR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQyOTkzNjUsImV4cCI6MjA0OTg3NTM2NX0.FZO3MhJOv6OyWnIpCaOX8YQD68D3kbM0fS6HVqj_yUY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function executeExactMatches() {
  console.log('🎯 EXECUTING EXACT BATCH MATCHES')
  console.log('=' .repeat(50))
  
  try {
    // First, let's see what we have
    console.log('\n📊 ANALYZING CURRENT DATA...')
    
    const { data: unmatchedBankTx, error: bankError } = await supabase
      .from('bank_transactions')
      .select('id, amount, description, transaction_date')
      .eq('status', 'unmatched')
      .order('transaction_date')
    
    if (bankError) throw bankError
    
    const { data: matchedProviders, error: providerError } = await supabase
      .from('provider_reports')
      .select('id, provider, net_amount, settlement_date')
      .eq('status', 'matched')
      .order('settlement_date')
    
    if (providerError) throw providerError
    
    console.log(`Unmatched Bank Transactions: ${unmatchedBankTx?.length || 0}`)
    console.log(`Matched Provider Reports: ${matchedProviders?.length || 0}`)
    
    if (!unmatchedBankTx || !matchedProviders) {
      console.log('❌ No data found')
      return
    }
    
    console.log('\n🔍 BANK TRANSACTIONS TO MATCH:')
    unmatchedBankTx.forEach(tx => {
      console.log(`  - ${tx.amount} CHF: ${tx.description} (${tx.transaction_date})`)
    })
    
    console.log('\n🔍 AVAILABLE PROVIDER REPORTS:')
    matchedProviders.forEach(pr => {
      console.log(`  - ${pr.net_amount} CHF ${pr.provider.toUpperCase()} (${pr.settlement_date})`)
    })
    
    // Find exact matches
    console.log('\n🎯 FINDING EXACT MATCHES...')
    
    const exactMatches = []
    
    for (const bankTx of unmatchedBankTx) {
      for (const provider of matchedProviders) {
        const diff = Math.abs(bankTx.amount - provider.net_amount)
        if (diff < 0.01) { // Exact match
          exactMatches.push({
            bankTx,
            provider,
            difference: diff
          })
          console.log(`  ✅ EXACT: ${bankTx.amount} CHF Bank ↔ ${provider.net_amount} CHF ${provider.provider.toUpperCase()}`)
        }
      }
    }
    
    console.log(`\n🎯 FOUND ${exactMatches.length} EXACT MATCHES`)
    
    if (exactMatches.length === 0) {
      console.log('ℹ️ No exact matches found')
      return
    }
    
    // Execute the matches
    console.log('\n🚀 EXECUTING MATCHES...')
    
    let successCount = 0
    
    for (const match of exactMatches) {
      try {
        console.log(`\n🔗 Matching: ${match.bankTx.amount} CHF ${match.provider.provider.toUpperCase()}`)
        
        // Create transaction match
        const { error: matchError } = await supabase
          .from('transaction_matches')
          .insert({
            bank_transaction_id: match.bankTx.id,
            matched_type: 'provider_batch',
            matched_id: match.provider.id,
            matched_amount: match.provider.net_amount,
            match_confidence: 100,
            match_details: {
              match_type: 'exact',
              provider_type: match.provider.provider,
              settlement_date: match.provider.settlement_date,
              difference: match.difference,
              auto_matched: true
            }
          })
        
        if (matchError) {
          console.log(`  ❌ Match creation failed: ${matchError.message}`)
          continue
        }
        
        // Update bank transaction status
        const { error: bankUpdateError } = await supabase
          .from('bank_transactions')
          .update({ status: 'matched' })
          .eq('id', match.bankTx.id)
        
        if (bankUpdateError) {
          console.log(`  ❌ Bank update failed: ${bankUpdateError.message}`)
          continue
        }
        
        console.log(`  ✅ Successfully matched!`)
        successCount++
        
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`)
      }
    }
    
    console.log(`\n🎉 BATCH MATCHING COMPLETED`)
    console.log(`   Successfully matched: ${successCount}/${exactMatches.length}`)
    
    // Check remaining unmatched
    const { data: remainingUnmatched } = await supabase
      .from('bank_transactions')
      .select('amount, description')
      .eq('status', 'unmatched')
    
    console.log(`   Remaining unmatched: ${remainingUnmatched?.length || 0}`)
    
    if (remainingUnmatched && remainingUnmatched.length > 0) {
      console.log('\n🔄 REMAINING UNMATCHED BANK TRANSACTIONS:')
      remainingUnmatched.forEach(tx => {
        console.log(`  - ${tx.amount} CHF: ${tx.description}`)
      })
      console.log('\n💡 These may need batch/tolerance matching or manual review.')
    }
    
  } catch (error) {
    console.error('❌ Execution failed:', error)
  }
}

// Execute
executeExactMatches()
  .then(() => {
    console.log('\n✨ Batch matching execution completed!')
  })
  .catch(error => {
    console.error('\n💥 Execution failed:', error)
  })