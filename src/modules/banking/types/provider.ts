// =====================================================
// Provider Import Types - TWINT & SumUp CSV Processing
// =====================================================
// Purpose: Type definitions for provider CSV import functionality
// Supports: TWINT transaction reports & SumUp settlement reports

// =====================================================
// PROVIDER CSV ROW TYPES
// =====================================================

export interface TWINTCsvRow {
  'Datum Überweisung': string // Settlement date: "01.11.2024"
  Transaktionsgebühr: string // Fees: "0.39"
  'Gutgeschriebener Betrag': string // Net amount: "29.61"
  'Betrag Transaktion': string // Gross amount: "30"
  Transaktionsdatum: string // Transaction date: "31.10.2024"
  Transaktionszeit: string // Transaction time: "09:47"
  'Transaktions-ID': string // Transaction ID: UUID
  'Händlertransaktions-ID': string // Merchant transaction ID: UUID
  'Kennung Verkaufsstelle': string // Store name: "Sample Business"
}

export interface SumUpCsvRow {
  'E-Mail': string // Store email: "admin@example.ch"
  Datum: string // Transaction date: "2024-11-27 12:43:22"
  'Transaktions-ID': string // Transaction ID: "TTHLYLAXES"
  Zahlungsart: string // Payment type: "Umsatz" | "Auszahlung"
  Status: string // Status: "Erfolgreich" | "Abgebrochen"
  'Betrag inkl. MwSt.': string // Gross amount: "200.0"
  Netto: string // Net amount for tax: "185.01"
  Gebühr: string // Fees: "3.0"
  Auszahlung: string // Payout amount: "197.0"
  Auszahlungsdatum: string // Payout date: "2024-11-28"
  Beschreibung: string // Description: "1 x Individueller Betrag"
}

// =====================================================
// PARSED PROVIDER RECORDS
// =====================================================

export interface ProviderRecord {
  // Core transaction data
  provider: 'twint' | 'sumup'
  transaction_date: Date
  settlement_date: Date
  gross_amount: number // Matches POS sales total_amount
  fees: number // Provider fees (transparency)
  net_amount: number // What gets paid out

  // Provider identifiers
  provider_transaction_id: string // For duplicate detection
  provider_reference?: string // Additional reference

  // Metadata
  description?: string // Human readable description
  currency: 'CHF' // Always CHF for Swiss providers

  // Raw data preservation
  raw_data: TWINTCsvRow | SumUpCsvRow // Original CSV row
}

// =====================================================
// IMPORT PREVIEW TYPES
// =====================================================

export interface ProviderImportPreview {
  // File metadata
  filename: string
  provider: 'twint' | 'sumup'
  detectedFormat: string // "TWINT CSV" | "SumUp Transactions Report"

  // Parsing results
  totalRecords: number
  validRecords: ProviderRecord[]
  invalidRecords: ProviderImportError[]

  // Duplicate detection
  duplicateRecords: ProviderRecord[]
  newRecords: ProviderRecord[]

  // Summary statistics
  totalAmount: number // Sum of all gross amounts
  totalFees: number // Sum of all fees
  dateRange: {
    from: Date
    to: Date
  }

  // Import readiness
  importable: boolean // Can proceed with import
  warnings: string[] // Non-fatal issues
}

export interface ProviderImportError {
  rowIndex: number
  field: string
  value: string
  error: string
  rawRow: Record<string, string>
}

// =====================================================
// IMPORT EXECUTION TYPES
// =====================================================

export interface ProviderImportResult {
  success: boolean
  importSessionId?: string

  // Import statistics
  recordsProcessed: number
  recordsImported: number
  recordsSkipped: number
  recordsFailed: number

  // Results
  importedRecords?: ProviderRecord[]
  errors?: ProviderImportError[]

  // Database references
  providerReportIds?: string[] // Created provider_reports IDs

  // Timing
  processingTimeMs: number
}

// =====================================================
// V6.1 NOTE: provider_import_sessions table removed
// =====================================================
// V6.1 uses report_filename field in provider_reports table for direct tracking
// with duplicate prevention via provider/transaction_date/gross_amount uniqueness

// =====================================================
// DUPLICATE DETECTION TYPES
// =====================================================

export interface ProviderDuplicateCheck {
  totalRecords: number
  newRecords: ProviderRecord[]
  duplicateRecords: ProviderRecord[]
  errorRecords: ProviderImportError[]
  fileAlreadyImported: boolean
}

// =====================================================
// VALIDATION TYPES
// =====================================================

export interface ProviderValidationError {
  type: 'MISSING_FIELD' | 'INVALID_FORMAT' | 'INVALID_DATE' | 'INVALID_AMOUNT' | 'INVALID_PROVIDER'
  field: string
  message: string
  recordIndex?: number
}

// =====================================================
// CSV PARSING CONFIGURATION
// =====================================================

export interface ProviderParserConfig {
  provider: 'twint' | 'sumup'
  delimiter: ';' | ',' // TWINT uses semicolon, SumUp uses comma
  hasQuotes: boolean // TWINT has quotes, SumUp doesn't always
  skipLines: number // TWINT skips 3 metadata lines, SumUp skips 0
  dateFormat: 'german' | 'iso' // TWINT: "31.10.2024", SumUp: "2024-11-27 12:43:22"
  decimalSeparator: '.' | ',' // Usually dot for both
}

// =====================================================
// AUTO-DETECTION TYPES
// =====================================================

export interface ProviderDetectionResult {
  provider: 'twint' | 'sumup' | 'unknown'
  confidence: number // 0.0 to 1.0
  indicators: string[] // What helped identify the format
  config: ProviderParserConfig
}

// =====================================================
// V6.1 NOTE: All types exported normally at declaration
// No need for redundant export type block (TS5+ stricter)
// =====================================================
