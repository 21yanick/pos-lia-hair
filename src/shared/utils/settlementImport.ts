/**
 * Settlement Import System - Phase 1A: File Parsers
 * 
 * Parses settlement documents from:
 * - SumUp Transaction Reports (CSV)
 * - TWINT Transaction Reports (CSV) 
 * - Raiffeisen Bank Statements (CAMT.053 XML)
 * 
 * Based on real provider document analysis (2024-05-29)
 */

import { parseISO, format } from 'date-fns'

// ============================================================================
// TYPES - Settlement Data Structures
// ============================================================================

export interface SettlementTransaction {
  provider: 'sumup' | 'twint'
  transactionId: string
  grossAmount: number
  providerFee: number
  netAmount: number
  transactionDate: string
  settlementDate: string
  settlementBatchId?: string
  status: 'settled' | 'failed' | 'pending'
  merchantReference?: string
}

export interface BankEntry {
  amount: number
  date: string
  provider: 'twint' | 'sumup' | 'other'
  description: string
  bankReference: string
  direction: 'credit' | 'debit'
}

export interface SettlementImportResult {
  success: boolean
  transactions: SettlementTransaction[]
  bankEntries: BankEntry[]
  matched: number
  unmatched: number
  errors: string[]
}

// ============================================================================
// SUMUP CSV PARSER
// ============================================================================

/**
 * Parses SumUp Transaction Report CSV
 * 
 * Expected format (based on real data):
 * E-Mail,Datum,Transaktions-ID,Zahlungsart,Status,Kartentyp,Letzte 4 Ziffern,
 * Durchgeführt mit,Zahlungsmethode,Eingabemodus,Autorisierungscode,Beschreibung,
 * Betrag inkl. MwSt.,Netto,Steuerbetrag,Trinkgeldbetrag,Gebühr,Auszahlung,
 * Auszahlungsdatum,Auszahlungs-ID,Referenz
 */
export function parseSumUpCSV(csvContent: string): SettlementTransaction[] {
  console.log('🔍 Starting SumUp CSV parsing...')
  const lines = csvContent.split('\n')
  const transactions: SettlementTransaction[] = []
  
  console.log(`📄 Total lines in CSV: ${lines.length}`)
  console.log(`📄 Header line: ${lines[0]}`)
  
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    try {
      // Parse CSV line (comma-separated)
      const fields = parseCSVLine(line)
      console.log(`📝 Line ${i}: ${fields.length} fields`)
      
      // Skip empty lines or invalid data
      if (fields.length < 21) {
        console.log(`⏭️  Skipping line ${i}: insufficient fields (${fields.length} < 21)`)
        continue
      }
      
      const [
        email, datum, transaktionsId, zahlungsart, status, kartentyp,
        letzte4Ziffern, durchgefuehrtMit, zahlungsmethode, eingabemodus,
        autorisierungscode, beschreibung, betragInklMwst, netto, steuerbetrag,
        trinkgeldbetrag, gebuehr, auszahlung, auszahlungsdatum, auszahlungsId, referenz
      ] = fields
      
      console.log(`📊 Line ${i} data: type="${zahlungsart}", status="${status}", payout_date="${auszahlungsdatum}", payout_id="${auszahlungsId}"`)
      
      // Process settlement rows (Auszahlung = payout/settlement)
      if (zahlungsart !== 'Auszahlung') {
        console.log(`⏭️  Skipping line ${i}: not a settlement row (transaction_type="${zahlungsart}", should be "Auszahlung")`)
        continue
      }
      if (status !== 'Gezahlt') {
        console.log(`⏭️  Skipping line ${i}: settlement not paid (status="${status}", should be "Gezahlt")`)
        continue
      }
      if (!auszahlungsdatum || !auszahlungsId) {
        console.log(`⏭️  Skipping line ${i}: missing settlement data (payout_date="${auszahlungsdatum}", payout_id="${auszahlungsId}")`)
        continue
      }
      
      // Parse amounts (German locale with decimal comma)
      const grossAmount = parseGermanDecimal(betragInklMwst)
      const providerFee = parseGermanDecimal(gebuehr)
      const netAmount = parseGermanDecimal(auszahlung)
      
      // Parse dates (German format: YYYY-MM-DD HH:mm:ss)
      const transactionDate = parseGermanDateTime(datum)
      const settlementDate = parseGermanDate(auszahlungsdatum)
      
      transactions.push({
        provider: 'sumup',
        transactionId: transaktionsId,
        grossAmount,
        providerFee,
        netAmount,
        transactionDate,
        settlementDate,
        settlementBatchId: auszahlungsId,
        status: 'settled',
        merchantReference: referenz
      })
      
    } catch (error) {
      console.warn(`Error parsing SumUp line ${i}:`, error)
      continue
    }
  }
  
  console.log(`✅ SumUp CSV parsed: ${transactions.length} settlement transactions`)
  return transactions
}

// ============================================================================
// TWINT CSV PARSER
// ============================================================================

/**
 * Parses TWINT Settlement Report CSV
 * 
 * Expected format (based on real TWINT settlement files):
 * Line 1: "Datum Überweisung";"01.11.2024"
 * Line 2: "Datum Abrechnung";"01.11.2024"  
 * Line 3: "Währung";"CHF"
 * Line 4: Header with fields
 * Line 5+: Transaction data
 * 
 * Each settlement is a separate CSV file with net amounts already calculated
 */
export function parseTWINTCSV(csvContent: string): SettlementTransaction[] {
  console.log('🔍 Starting TWINT CSV parsing...')
  const lines = csvContent.split('\n')
  const transactions: SettlementTransaction[] = []
  
  console.log(`📄 Total lines in TWINT CSV: ${lines.length}`)
  console.log(`📄 First 5 lines:`)
  lines.slice(0, 5).forEach((line, i) => console.log(`  ${i+1}: ${line}`))
  
  // Parse metadata from first 3 lines
  let settlementDate = ''
  let currency = ''
  
  // Extract settlement date from line 1: "Datum Überweisung";"01.11.2024"
  const settlementDateMatch = lines[0]?.match(/"Datum Überweisung";"([^"]+)"/)
  if (settlementDateMatch) {
    settlementDate = parseGermanDate(settlementDateMatch[1])
    console.log(`📅 Settlement date extracted: ${settlementDate}`)
  }
  
  // Extract currency from line 3: "Währung";"CHF"
  const currencyMatch = lines[2]?.match(/"Währung";"([^"]+)"/)
  if (currencyMatch) {
    currency = currencyMatch[1]
    console.log(`💰 Currency extracted: ${currency}`)
  }
  
  // Find header line (line 4, contains transaction fields)
  let headerIndex = -1
  for (let i = 3; i < lines.length; i++) {
    if (lines[i].includes('Transaktionsgebühr') && lines[i].includes('Gutgeschriebener Betrag')) {
      headerIndex = i
      break
    }
  }
  
  if (headerIndex === -1) {
    console.error('❌ TWINT CSV header not found. Expected header with "Transaktionsgebühr" and "Gutgeschriebener Betrag"')
    console.error('📄 Available lines:')
    lines.slice(0, 10).forEach((line, i) => console.error(`  ${i+1}: ${line}`))
    throw new Error('TWINT CSV header not found')
  }
  
  console.log(`📋 Header found at line ${headerIndex + 1}: ${lines[headerIndex]}`)
  
  // Parse data lines
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    try {
      // Parse CSV line (semicolon-separated, German locale)
      const fields = parseCSVLine(line, ';')
      console.log(`📝 Line ${i}: ${fields.length} fields`, fields)
      
      // Expected fields from real TWINT settlement format:
      // "Überweisung am";"Transaktionsgebühr";"Währung";"Gutgeschriebener Betrag";"Kennung Verkaufsstelle";"UUID Store";"Betrag Transaktion";"Währung";"Transaktionsdatum";"Transaktionszeit";"Typ";"Order ID";"Terminal ID";"Transaktions-ID";"Händlertransaktions-ID"
      if (fields.length < 15) {
        console.log(`⏭️  Skipping line ${i}: insufficient fields (${fields.length} < 15)`)
        continue
      }
      
      const [
        ueberweisungAm, transaktionsgebuehr, waehrung1, gutgeschriebenerBetrag,
        kennungVerkaufsstelle, uuidStore, betragTransaktion, waehrung2,
        transaktionsdatum, transaktionszeit, typ, orderId, terminalId,
        transaktionsId, haendlertransaktionsId
      ] = fields
      
      console.log(`📊 Line ${i} data: type="${typ}", date="${transaktionsdatum}", time="${transaktionszeit}"`)
      console.log(`📊 Amounts: gross="${betragTransaktion}", fee="${transaktionsgebuehr}", net="${gutgeschriebenerBetrag}"`)
      
      // Only process Product transactions (actual payments)
      if (typ !== 'Product') {
        console.log(`⏭️  Skipping line ${i}: not a product transaction (type="${typ}")`)
        continue
      }
      
      // Parse amounts (German locale)
      const grossAmount = parseGermanDecimal(betragTransaktion)
      const providerFee = parseGermanDecimal(transaktionsgebuehr)
      const netAmount = parseGermanDecimal(gutgeschriebenerBetrag)
      
      // Parse transaction date and time (DD.MM.YYYY format) - THIS is what we match against POS!
      const transactionDate = parseGermanDateTime(`${transaktionsdatum} ${transaktionszeit}`, 'DD.MM.YYYY HH:mm')
      
      console.log(`📊 Parsed amounts: gross=${grossAmount}, fee=${providerFee}, net=${netAmount}`)
      console.log(`📊 🎯 TRANSACTION DATE (for matching): ${transactionDate}`)
      console.log(`📊 💰 Settlement date (for records): ${settlementDate}`)
      
      transactions.push({
        provider: 'twint',
        transactionId: orderId, // Use Order ID as main transaction identifier
        grossAmount,
        providerFee,
        netAmount,
        transactionDate, // 🎯 This is the POS transaction date (e.g., 31.10.2024 09:47)
        settlementDate: settlementDate || estimateSettlementDate(transactionDate, 'twint'), // This is when TWINT paid out (e.g., 01.11.2024)
        status: 'settled',
        merchantReference: haendlertransaktionsId
      })
      
    } catch (error) {
      console.warn(`Error parsing TWINT line ${i}:`, error)
      continue
    }
  }
  
  console.log(`✅ TWINT CSV parsed: ${transactions.length} payment transactions`)
  return transactions
}

// ============================================================================
// RAIFFEISEN CAMT.053 XML PARSER
// ============================================================================

/**
 * Parses Raiffeisen Bank Statement (CAMT.053 XML)
 * 
 * Expected format: ISO 20022 CAMT.053 standard
 * Provider identification via <AddtlNtryInf> field
 */
export function parseRaiffeisenCAMT053(xmlContent: string): BankEntry[] {
  const entries: BankEntry[] = []
  
  try {
    // Simple XML parsing (for production, use proper XML parser)
    const entryMatches = xmlContent.match(/<Ntry>[\s\S]*?<\/Ntry>/g)
    
    if (!entryMatches) {
      throw new Error('No bank entries found in CAMT.053 XML')
    }
    
    for (const entryXML of entryMatches) {
      try {
        // Extract amount and currency
        const amtMatch = entryXML.match(/<Amt Ccy="([^"]+)">([^<]+)<\/Amt>/)
        if (!amtMatch) continue
        
        const amount = parseFloat(amtMatch[2])
        const currency = amtMatch[1]
        
        if (currency !== 'CHF') continue // Only process CHF amounts
        
        // Extract credit/debit indicator
        const directionMatch = entryXML.match(/<CdtDbtInd>([^<]+)<\/CdtDbtInd>/)
        const direction = directionMatch?.[1] === 'CRDT' ? 'credit' : 'debit'
        
        // Extract booking date
        const dateMatch = entryXML.match(/<BookgDt>\s*<Dt>([^<]+)<\/Dt>\s*<\/BookgDt>/)
        if (!dateMatch) continue
        
        const date = dateMatch[1]
        
        // Extract additional info (provider identification)
        const infoMatch = entryXML.match(/<AddtlNtryInf>([^<]+)<\/AddtlNtryInf>/)
        const description = infoMatch?.[1] || ''
        
        // Extract account servicer reference
        const refMatch = entryXML.match(/<AcctSvcrRef>([^<]+)<\/AcctSvcrRef>/)
        const bankReference = refMatch?.[1] || ''
        
        // Identify provider
        let provider: 'twint' | 'sumup' | 'other' = 'other'
        if (description.includes('TWINT Acquiring AG')) {
          provider = 'twint'
        } else if (description.includes('SUMUP PAYMENTS LIMITED')) {
          provider = 'sumup'
        }
        
        entries.push({
          amount,
          date,
          provider,
          description,
          bankReference,
          direction
        })
        
      } catch (error) {
        console.warn('Error parsing bank entry:', error)
        continue
      }
    }
    
  } catch (error) {
    console.error('Error parsing CAMT.053 XML:', error)
    throw error
  }
  
  console.log(`✅ Raiffeisen CAMT.053 parsed: ${entries.length} bank entries`)
  return entries
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Parse CSV line with proper quote handling
 */
function parseCSVLine(line: string, delimiter: string = ','): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"'
        i++ // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === delimiter && !inQuotes) {
      // Field separator
      fields.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  // Add final field
  fields.push(current.trim())
  
  return fields
}

/**
 * Parse German decimal format (1.234,56 or 1234.56)
 */
function parseGermanDecimal(value: string): number {
  if (!value || value === '') return 0
  
  // Remove quotes if present
  value = value.replace(/"/g, '')
  
  // Handle German format with comma as decimal separator
  if (value.includes(',') && value.includes('.')) {
    // Format: 1.234,56 (German)
    value = value.replace(/\./g, '').replace(',', '.')
  } else if (value.includes(',')) {
    // Format: 1234,56 (German)
    value = value.replace(',', '.')
  }
  // Format: 1234.56 (English) - no change needed
  
  return parseFloat(value) || 0
}

/**
 * Parse German date format (YYYY-MM-DD, YYYY.MM.DD, or DD.MM.YYYY)
 */
function parseGermanDate(dateString: string): string {
  if (!dateString) return ''
  
  // Remove quotes
  dateString = dateString.replace(/"/g, '')
  
  // Handle different date formats
  if (dateString.includes('.')) {
    const parts = dateString.split('.')
    if (parts.length === 3) {
      // Check if it's DD.MM.YYYY or YYYY.MM.DD format
      if (parts[0].length === 4) {
        // Format: YYYY.MM.DD
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`
      } else {
        // Format: DD.MM.YYYY
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
      }
    }
  }
  
  // Format: YYYY-MM-DD (already correct)
  return dateString.split(' ')[0] // Remove time if present
}

/**
 * Parse German datetime format
 */
function parseGermanDateTime(dateTimeString: string, inputFormat?: string): string {
  if (!dateTimeString) return ''
  
  // Remove quotes
  dateTimeString = dateTimeString.replace(/"/g, '')
  
  try {
    if (inputFormat === 'YYYY.MM.DD HH:mm') {
      // Old TWINT format: 2025.04.02 10:04
      const [datePart, timePart] = dateTimeString.split(' ')
      const [year, month, day] = datePart.split('.')
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart}:00`
    } else if (inputFormat === 'DD.MM.YYYY HH:mm') {
      // New TWINT settlement format: 31.10.2024 09:47
      const [datePart, timePart] = dateTimeString.split(' ')
      const [day, month, year] = datePart.split('.')
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart}:00`
    } else {
      // SumUp format: 2025-04-30 18:19:06
      return dateTimeString.replace(' ', 'T')
    }
  } catch (error) {
    console.warn('Error parsing datetime:', dateTimeString, error)
    return dateTimeString.split(' ')[0] // Return just date part
  }
}

/**
 * Estimate settlement date based on provider and Swiss business days
 */
function estimateSettlementDate(transactionDate: string, provider: 'twint' | 'sumup'): string {
  try {
    const date = parseISO(transactionDate.split('T')[0])
    
    // Add settlement days (T+1 for both providers typically)
    const settlementDays = 1
    const settlementDate = new Date(date)
    settlementDate.setDate(settlementDate.getDate() + settlementDays)
    
    // TODO: Add Swiss holiday logic from dateUtils.ts
    // For now, simple date calculation
    
    return format(settlementDate, 'yyyy-MM-dd')
  } catch (error) {
    console.warn('Error estimating settlement date:', error)
    return transactionDate.split('T')[0]
  }
}

// ============================================================================
// MAIN PARSER FUNCTIONS
// ============================================================================

/**
 * Parse settlement file based on content and filename
 */
export async function parseSettlementFile(
  content: string, 
  filename: string
): Promise<SettlementImportResult> {
  const errors: string[] = []
  let transactions: SettlementTransaction[] = []
  let bankEntries: BankEntry[] = []
  
  try {
    if (filename.toLowerCase().includes('sumup') && filename.endsWith('.csv')) {
      transactions = parseSumUpCSV(content)
    } else if (filename.toLowerCase().includes('twint') && filename.endsWith('.csv')) {
      transactions = parseTWINTCSV(content)
    } else if (filename.toLowerCase().includes('raiffeisen') && filename.endsWith('.xml')) {
      bankEntries = parseRaiffeisenCAMT053(content)
    } else {
      throw new Error(`Unsupported file format: ${filename}`)
    }
    
    return {
      success: true,
      transactions,
      bankEntries,
      matched: 0, // Will be calculated in matching phase
      unmatched: transactions.length + bankEntries.length,
      errors
    }
    
  } catch (error) {
    errors.push(`File parsing error: ${error}`)
    return {
      success: false,
      transactions: [],
      bankEntries: [],
      matched: 0,
      unmatched: 0,
      errors
    }
  }
}

/**
 * Get supported file types for validation
 */
export function getSupportedFileTypes(): string[] {
  return [
    'text/csv',
    'application/csv', 
    'text/xml',
    'application/xml'
  ]
}

/**
 * Validate file before parsing
 */
export function validateSettlementFile(file: File): { valid: boolean, error?: string } {
  const maxSize = 50 * 1024 * 1024 // 50MB
  const supportedTypes = getSupportedFileTypes()
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File too large (max 50MB)' }
  }
  
  if (!supportedTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.xml')) {
    return { valid: false, error: 'Unsupported file type. Please upload CSV or XML files.' }
  }
  
  return { valid: true }
}