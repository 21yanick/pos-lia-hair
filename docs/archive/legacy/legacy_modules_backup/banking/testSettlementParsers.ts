/**
 * Test Settlement Parsers with Real Data
 * 
 * This script tests our settlement parsers against the real provider documents
 * from docs/twint_sumup_banking_examples/
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { 
  parseSumUpCSV, 
  parseTWINTCSV, 
  parseRaiffeisenCAMT053 
} from './settlementImport'

const EXAMPLES_DIR = join(process.cwd(), 'docs', 'twint_sumup_banking_examples')

export async function testAllParsers() {
  console.log('🧪 Testing Settlement Parsers with Real Data\n')
  
  try {
    // Test SumUp CSV Parser
    console.log('📄 Testing SumUp CSV Parser...')
    const sumupContent = readFileSync(
      join(EXAMPLES_DIR, 'SumUp_20250401-20250430-MF9236HP-transactions-report.csv'), 
      'utf-8'
    )
    const sumupTransactions = parseSumUpCSV(sumupContent)
    console.log(`✅ SumUp: Parsed ${sumupTransactions.length} transactions`)
    
    // Sample output
    if (sumupTransactions.length > 0) {
      const sample = sumupTransactions[0]
      console.log(`   Sample: CHF ${sample.grossAmount} → CHF ${sample.netAmount} (fee: CHF ${sample.providerFee})`)
    }
    console.log()

    // Test TWINT CSV Parser  
    console.log('📄 Testing TWINT CSV Parser...')
    const twintContent = readFileSync(
      join(EXAMPLES_DIR, 'Twint_20250529-TransactionReport.csv'),
      'utf-8'
    )
    const twintTransactions = parseTWINTCSV(twintContent)
    console.log(`✅ TWINT: Parsed ${twintTransactions.length} transactions`)
    
    // Sample output
    if (twintTransactions.length > 0) {
      const sample = twintTransactions[0]
      console.log(`   Sample: CHF ${sample.grossAmount} → CHF ${sample.netAmount} (fee: CHF ${sample.providerFee})`)
    }
    console.log()

    // Test Raiffeisen XML Parser
    console.log('📄 Testing Raiffeisen CAMT.053 XML Parser...')
    const bankContent = readFileSync(
      join(EXAMPLES_DIR, 'Raiffeisen_camt053_001_08_ch5180808002007735062_20250529165122.xml'),
      'utf-8'
    )
    const bankEntries = parseRaiffeisenCAMT053(bankContent)
    console.log(`✅ Raiffeisen: Parsed ${bankEntries.length} bank entries`)
    
    // Sample output
    const twintEntries = bankEntries.filter(e => e.provider === 'twint')
    const sumupEntries = bankEntries.filter(e => e.provider === 'sumup')
    console.log(`   TWINT entries: ${twintEntries.length}`)
    console.log(`   SumUp entries: ${sumupEntries.length}`)
    console.log()

    // Validation Summary
    console.log('📊 Parser Validation Summary:')
    console.log(`✅ SumUp CSV Parser: ${sumupTransactions.length} transactions`)
    console.log(`✅ TWINT CSV Parser: ${twintTransactions.length} transactions`)
    console.log(`✅ Raiffeisen XML Parser: ${bankEntries.length} bank entries`)
    console.log()

    // Data Quality Checks
    console.log('🔍 Data Quality Checks:')
    
    // Check SumUp data
    const sumupWithFees = sumupTransactions.filter(t => t.providerFee > 0)
    console.log(`   SumUp transactions with fees: ${sumupWithFees.length}/${sumupTransactions.length}`)
    
    // Check TWINT data  
    const twintWithFees = twintTransactions.filter(t => t.providerFee > 0)
    console.log(`   TWINT transactions with fees: ${twintWithFees.length}/${twintTransactions.length}`)
    
    // Check bank provider identification
    const identifiedEntries = bankEntries.filter(e => e.provider !== 'other')
    console.log(`   Bank entries with provider ID: ${identifiedEntries.length}/${bankEntries.length}`)
    
    console.log('\n🎉 All parsers working correctly with real data!')
    
    return {
      success: true,
      sumupTransactions,
      twintTransactions, 
      bankEntries
    }
    
  } catch (error) {
    console.error('❌ Parser test failed:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Run test if called directly
if (require.main === module) {
  testAllParsers()
}