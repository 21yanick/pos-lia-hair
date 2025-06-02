// =====================================================
// Provider CSV Parsers - TWINT & SumUp
// =====================================================
// Purpose: Parse Swiss provider CSV exports into standardized format
// Supports: TWINT transaction reports & SumUp settlement reports

import type { 
  TWINTCsvRow, 
  SumUpCsvRow, 
  ProviderRecord, 
  ProviderDetectionResult,
  ProviderParserConfig,
  ProviderValidationError,
  ProviderImportError
} from '../types/provider'

// =====================================================
// PROVIDER AUTO-DETECTION
// =====================================================

export function detectProviderType(csvContent: string): ProviderDetectionResult {
  const lines = csvContent.split('\n').slice(0, 10) // Check first 10 lines
  const content = lines.join('\n').toLowerCase()
  
  // TWINT indicators
  const twintIndicators: string[] = []
  if (content.includes('datum überweisung')) twintIndicators.push('Header: Datum Überweisung')
  if (content.includes('transaktionsgebühr')) twintIndicators.push('Header: Transaktionsgebühr')
  if (content.includes('gutgeschriebener betrag')) twintIndicators.push('Header: Gutgeschriebener Betrag')
  if (content.includes('kennung verkaufsstelle')) twintIndicators.push('Header: Kennung Verkaufsstelle')
  if (lines.some(line => line.includes(';'))) twintIndicators.push('Semicolon delimiter')
  
  // SumUp indicators  
  const sumupIndicators: string[] = []
  if (content.includes('transaktions-id')) sumupIndicators.push('Header: Transaktions-ID')
  if (content.includes('zahlungsart')) sumupIndicators.push('Header: Zahlungsart')
  if (content.includes('betrag inkl. mwst.')) sumupIndicators.push('Header: Betrag inkl. MwSt.')
  if (content.includes('auszahlung')) sumupIndicators.push('Header: Auszahlung')
  if (lines.some(line => line.includes('umsatz'))) sumupIndicators.push('Content: Umsatz transactions')
  
  // Determine provider based on indicators
  if (twintIndicators.length >= 3) {
    return {
      provider: 'twint',
      confidence: Math.min(0.9, twintIndicators.length * 0.2),
      indicators: twintIndicators,
      config: {
        provider: 'twint',
        delimiter: ';',
        hasQuotes: true,
        skipLines: 3,
        dateFormat: 'german',
        decimalSeparator: '.'
      }
    }
  }
  
  if (sumupIndicators.length >= 3) {
    return {
      provider: 'sumup',
      confidence: Math.min(0.9, sumupIndicators.length * 0.2),
      indicators: sumupIndicators,
      config: {
        provider: 'sumup',
        delimiter: ',',
        hasQuotes: false,
        skipLines: 0,
        dateFormat: 'iso',
        decimalSeparator: '.'
      }
    }
  }
  
  return {
    provider: 'unknown',
    confidence: 0,
    indicators: [],
    config: {
      provider: 'twint', // Default fallback
      delimiter: ';',
      hasQuotes: true,
      skipLines: 3,
      dateFormat: 'german',
      decimalSeparator: '.'
    }
  }
}

// =====================================================
// TWINT CSV PARSER
// =====================================================

export function parseTWINTCsv(csvContent: string): {
  records: ProviderRecord[]
  errors: ProviderImportError[]
} {
  const records: ProviderRecord[] = []
  const errors: ProviderImportError[] = []
  
  try {
    // Remove BOM character if present
    const cleanContent = csvContent.replace(/^\uFEFF/, '')
    const lines = cleanContent.split('\n')
    
    // Skip first 3 metadata lines
    // Line 0: "Datum Überweisung";"01.11.2024" 
    // Line 1: "Datum Abrechnung";"01.11.2024"
    // Line 2: "Währung";"CHF"
    // Line 3: Headers
    
    if (lines.length < 5) {
      throw new Error('TWINT CSV file too short - missing header or data rows')
    }
    
    const headerLine = lines[3]
    const dataLines = lines.slice(4).filter(line => line.trim().length > 0)
    
    // Parse header to get column mapping
    const headers = parseCSVLine(headerLine, ';', true)
    
    // Validate required headers
    const requiredHeaders = [
      'Überweisung am', // Real TWINT header name
      'Transaktionsgebühr', 
      'Gutgeschriebener Betrag',
      'Betrag Transaktion',
      'Transaktionsdatum',
      'Transaktions-ID'
    ]
    
    for (const required of requiredHeaders) {
      if (!headers.includes(required)) {
        throw new Error(`Missing required TWINT header: ${required}`)
      }
    }
    
    // Parse data rows
    dataLines.forEach((line, index) => {
      try {
        const values = parseCSVLine(line, ';', true)
        
        if (values.length !== headers.length) {
          errors.push({
            rowIndex: index + 5, // +5 because of skipped lines + header
            field: 'row_length',
            value: `${values.length} columns`,
            error: `Expected ${headers.length} columns, got ${values.length}`,
            rawRow: Object.fromEntries(headers.map((h, i) => [h, values[i] || '']))
          })
          return
        }
        
        // Create row object
        const row: TWINTCsvRow = {} as TWINTCsvRow
        headers.forEach((header, i) => {
          ;(row as any)[header] = values[i] || ''
        })
        
        // Parse into ProviderRecord
        const record = parseTWINTRow(row, index + 5)
        records.push(record)
        
      } catch (error) {
        errors.push({
          rowIndex: index + 5,
          field: 'parsing',
          value: line,
          error: error instanceof Error ? error.message : 'Unknown parsing error',
          rawRow: { raw: line }
        })
      }
    })
    
  } catch (error) {
    errors.push({
      rowIndex: 0,
      field: 'file',
      value: csvContent.substring(0, 100),
      error: error instanceof Error ? error.message : 'Unknown file parsing error',
      rawRow: {}
    })
  }
  
  return { records, errors }
}

function parseTWINTRow(row: TWINTCsvRow, rowIndex: number): ProviderRecord {
  // Parse dates (German format: "31.10.2024")
  const transactionDate = parseGermanDate(row['Transaktionsdatum'])
  const settlementDate = parseGermanDate(row['Überweisung am']) // First column = settlement date
  
  // Parse amounts (German number format but likely with dots)
  const grossAmount = parseFloat(row['Betrag Transaktion'].replace(',', '.'))
  const fees = parseFloat(row['Transaktionsgebühr'].replace(',', '.'))
  const netAmount = parseFloat(row['Gutgeschriebener Betrag'].replace(',', '.'))
  
  // Validate amounts
  if (isNaN(grossAmount) || isNaN(fees) || isNaN(netAmount)) {
    throw new Error('Invalid amount values in TWINT row')
  }
  
  // Basic math validation (net = gross - fees, allowing for small rounding)
  const expectedNet = grossAmount - fees
  if (Math.abs(netAmount - expectedNet) > 0.02) {
    console.warn(`TWINT amount mismatch at row ${rowIndex}: net=${netAmount}, expected=${expectedNet}`)
  }
  
  return {
    provider: 'twint',
    transaction_date: transactionDate,
    settlement_date: settlementDate,
    gross_amount: grossAmount,
    fees: fees,
    net_amount: netAmount,
    provider_transaction_id: row['Transaktions-ID'],
    provider_reference: row['Händlertransaktions-ID'],
    description: `TWINT Transaction ${row['Transaktions-ID'].substring(0, 8)}`,
    currency: 'CHF',
    raw_data: row
  }
}

// =====================================================
// SUMUP CSV PARSER
// =====================================================

export function parseSumUpCsv(csvContent: string): {
  records: ProviderRecord[]
  errors: ProviderImportError[]
} {
  const records: ProviderRecord[] = []
  const errors: ProviderImportError[] = []
  
  try {
    const lines = csvContent.split('\n').filter(line => line.trim().length > 0)
    
    if (lines.length < 2) {
      throw new Error('SumUp CSV file too short - missing header or data rows')
    }
    
    const headerLine = lines[0]
    const dataLines = lines.slice(1)
    
    // Parse header
    const headers = parseCSVLine(headerLine, ',', false)
    
    // Validate required headers
    const requiredHeaders = [
      'Datum',
      'Transaktions-ID',
      'Zahlungsart',
      'Status',
      'Betrag inkl. MwSt.',
      'Gebühr',
      'Auszahlung'
    ]
    
    for (const required of requiredHeaders) {
      if (!headers.includes(required)) {
        throw new Error(`Missing required SumUp header: ${required}`)
      }
    }
    
    // Parse data rows
    dataLines.forEach((line, index) => {
      try {
        const values = parseCSVLine(line, ',', false)
        
        if (values.length !== headers.length) {
          errors.push({
            rowIndex: index + 2, // +2 because of header
            field: 'row_length',
            value: `${values.length} columns`,
            error: `Expected ${headers.length} columns, got ${values.length}`,
            rawRow: Object.fromEntries(headers.map((h, i) => [h, values[i] || '']))
          })
          return
        }
        
        // Create row object
        const row: SumUpCsvRow = {} as SumUpCsvRow
        headers.forEach((header, i) => {
          ;(row as any)[header] = values[i] || ''
        })
        
        // Filter: Only process "Umsatz" transactions that are "Erfolgreich"
        if (row['Zahlungsart'] !== 'Umsatz' || row['Status'] !== 'Erfolgreich') {
          return // Skip this row silently
        }
        
        // Parse into ProviderRecord
        const record = parseSumUpRow(row, index + 2)
        records.push(record)
        
      } catch (error) {
        errors.push({
          rowIndex: index + 2,
          field: 'parsing',
          value: line,
          error: error instanceof Error ? error.message : 'Unknown parsing error',
          rawRow: { raw: line }
        })
      }
    })
    
  } catch (error) {
    errors.push({
      rowIndex: 0,
      field: 'file',
      value: csvContent.substring(0, 100),
      error: error instanceof Error ? error.message : 'Unknown file parsing error',
      rawRow: {}
    })
  }
  
  return { records, errors }
}

function parseSumUpRow(row: SumUpCsvRow, rowIndex: number): ProviderRecord {
  // Parse dates (ISO format: "2024-11-27 12:43:22")
  const transactionDate = new Date(row['Datum'])
  const settlementDate = transactionDate // SumUp settles same day
  
  // Parse amounts (dot decimal format)
  const grossAmount = parseFloat(row['Betrag inkl. MwSt.'])
  const fees = parseFloat(row['Gebühr'])
  const netAmount = parseFloat(row['Auszahlung'])
  
  // Validate amounts
  if (isNaN(grossAmount) || isNaN(fees) || isNaN(netAmount)) {
    throw new Error('Invalid amount values in SumUp row')
  }
  
  // Validate dates
  if (isNaN(transactionDate.getTime())) {
    throw new Error('Invalid date format in SumUp row')
  }
  
  // Basic math validation (net = gross - fees, allowing for small rounding)
  const expectedNet = grossAmount - fees
  if (Math.abs(netAmount - expectedNet) > 0.02) {
    console.warn(`SumUp amount mismatch at row ${rowIndex}: net=${netAmount}, expected=${expectedNet}`)
  }
  
  return {
    provider: 'sumup',
    transaction_date: transactionDate,
    settlement_date: settlementDate,
    gross_amount: grossAmount,
    fees: fees,
    net_amount: netAmount,
    provider_transaction_id: row['Transaktions-ID'],
    provider_reference: row['E-Mail'],
    description: row['Beschreibung'] || `SumUp Transaction ${row['Transaktions-ID']}`,
    currency: 'CHF',
    raw_data: row
  }
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

function parseCSVLine(line: string, delimiter: string, hasQuotes: boolean): string[] {
  if (!hasQuotes) {
    return line.split(delimiter).map(cell => cell.trim())
  }
  
  // Handle quoted CSV (TWINT format)
  const result: string[] = []
  let current = ''
  let inQuotes = false
  let i = 0
  
  while (i < line.length) {
    const char = line[i]
    
    if (char === '"') {
      // Check for escaped quote
      if (i + 1 < line.length && line[i + 1] === '"') {
        current += '"'
        i += 2
      } else {
        inQuotes = !inQuotes
        i++
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim())
      current = ''
      i++
    } else {
      current += char
      i++
    }
  }
  
  result.push(current.trim())
  return result
}

function parseGermanDate(dateString: string): Date {
  // Parse German date format: "31.10.2024"
  const parts = dateString.split('.')
  if (parts.length !== 3) {
    throw new Error(`Invalid German date format: ${dateString}`)
  }
  
  const day = parseInt(parts[0])
  const month = parseInt(parts[1]) - 1 // Month is 0-indexed in JS
  const year = parseInt(parts[2])
  
  const date = new Date(year, month, day)
  
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date values: ${dateString}`)
  }
  
  return date
}

// =====================================================
// VALIDATION FUNCTIONS
// =====================================================

export function validateProviderRecord(record: ProviderRecord): ProviderValidationError[] {
  const errors: ProviderValidationError[] = []
  
  // Validate required fields
  if (!record.provider_transaction_id) {
    errors.push({
      type: 'MISSING_FIELD',
      field: 'provider_transaction_id',
      message: 'Provider transaction ID is required'
    })
  }
  
  if (record.gross_amount <= 0) {
    errors.push({
      type: 'INVALID_AMOUNT',
      field: 'gross_amount',
      message: 'Gross amount must be positive'
    })
  }
  
  if (record.fees < 0) {
    errors.push({
      type: 'INVALID_AMOUNT',
      field: 'fees',
      message: 'Fees cannot be negative'
    })
  }
  
  if (record.net_amount <= 0) {
    errors.push({
      type: 'INVALID_AMOUNT',
      field: 'net_amount',
      message: 'Net amount must be positive'
    })
  }
  
  // Validate dates
  if (isNaN(record.transaction_date.getTime())) {
    errors.push({
      type: 'INVALID_DATE',
      field: 'transaction_date',
      message: 'Invalid transaction date'
    })
  }
  
  if (isNaN(record.settlement_date.getTime())) {
    errors.push({
      type: 'INVALID_DATE',
      field: 'settlement_date', 
      message: 'Invalid settlement date'
    })
  }
  
  // Validate provider
  if (!['twint', 'sumup'].includes(record.provider)) {
    errors.push({
      type: 'INVALID_PROVIDER',
      field: 'provider',
      message: 'Provider must be twint or sumup'
    })
  }
  
  return errors
}

// =====================================================
// EXPORTS
// =====================================================
// Functions are already exported inline above