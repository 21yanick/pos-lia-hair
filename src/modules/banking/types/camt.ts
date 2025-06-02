// =====================================================
// CAMT.053 TypeScript Types - Raiffeisen Bank Statement Import
// =====================================================
// Purpose: Type definitions for Swiss CAMT.053 XML parsing
// Based on: ISO 20022 CAMT.053.001.08 standard

export interface CAMTBalance {
  type: 'OPBD' | 'CLBD'  // Opening Balance / Closing Balance
  amount: number
  creditDebitIndicator: 'CRDT' | 'DBIT'
  date: Date
}

export interface CAMTBankTransactionCode {
  domain: string      // e.g. 'PMNT'
  family: string      // e.g. 'RCDT', 'ICDT', 'CCRD'
  subfamily?: string  // e.g. 'DMCT', 'POSD'
  proprietary?: string // e.g. '1000', '6010'
}

export interface CAMTEntry {
  // Core transaction data
  amount: number
  currency: string                           // Always 'CHF' for Swiss banks
  creditDebitIndicator: 'CRDT' | 'DBIT'    // Credit = Eingang, Debit = Ausgang
  reversalIndicator: boolean                 // Usually false
  
  // Dates
  bookingDate: Date                         // BookgDt - when bank processed
  valueDate: Date                           // ValDt - value date
  
  // References and codes  
  accountServiceReference: string           // AcctSvcrRef - UNIQUE bank reference
  bankTransactionCode?: CAMTBankTransactionCode
  
  // Description and details
  description: string                       // AddtlNtryInf - human readable
  
  // Status
  status: 'BOOK' | 'PDNG'                  // Usually 'BOOK' for completed
}

export interface CAMTAccount {
  iban: string                             // CH5180808002007735062
  currency: string                         // CHF
  ownerName: string                        // Lia-Hair by Zilfije Rupp
  servicerName: string                     // Raiffeisenbank Weissenstein
}

export interface CAMTStatement {
  // Statement metadata
  statementId: string                      // STM-C053-250601102207-01
  electronicSequenceNumber: number        // 5, 7, etc.
  creationDateTime: Date
  
  // Time period
  fromDateTime: Date                       // Statement period start
  toDateTime: Date                         // Statement period end
  
  // Account information
  account: CAMTAccount
  
  // Balances
  openingBalance: CAMTBalance
  closingBalance: CAMTBalance
  
  // All transactions in this statement
  entries: CAMTEntry[]
}

export interface CAMTDocument {
  // File metadata
  messageId: string                        // MSG-C053-250601102259-01
  creationDateTime: Date
  additionalInfo: string                   // PRODUCTIVE
  
  // Statement data
  statement: CAMTStatement
}

// =====================================================
// IMPORT PROCESSING TYPES
// =====================================================

export interface CAMTImportResult {
  success: boolean
  document?: CAMTDocument
  errors: string[]
  warnings: string[]
}

export interface CAMTDuplicateCheck {
  totalEntries: number
  newEntries: CAMTEntry[]
  duplicateEntries: CAMTEntry[]
  errorEntries: CAMTEntry[]
  fileAlreadyImported: boolean
  periodOverlap: boolean
}

export interface CAMTImportPreview {
  filename: string
  statement: CAMTStatement
  duplicateCheck: CAMTDuplicateCheck
  importable: boolean
}

// =====================================================
// DATABASE MAPPING TYPES  
// =====================================================

export interface BankTransactionInsert {
  bank_account_id: string
  transaction_date: string              // ISO date string
  booking_date: string                  // ISO date string
  amount: number                        // Signed: positive for CRDT, negative for DBIT
  description: string
  reference: string                     // AcctSvcrRef
  transaction_code?: string             // Serialized BkTxCd
  import_filename: string
  import_date: string                   // ISO datetime string
  raw_data: CAMTEntry                   // Original entry as JSONB
  status: 'unmatched'
  user_id: string
}

export interface BankImportSessionInsert {
  bank_account_id: string
  import_filename: string
  import_type: 'camt053'
  total_entries: number
  new_entries: number
  duplicate_entries: number
  error_entries: number
  statement_from_date: string           // ISO date string
  statement_to_date: string             // ISO date string
  status: 'pending' | 'completed' | 'failed'
  imported_by: string
  notes?: string
}

// =====================================================
// VALIDATION AND ERROR TYPES
// =====================================================

export interface CAMTValidationError {
  type: 'MISSING_FIELD' | 'INVALID_FORMAT' | 'INVALID_DATE' | 'INVALID_AMOUNT'
  field: string
  message: string
  entryIndex?: number
}

export interface CAMTParseError {
  type: 'XML_PARSE_ERROR' | 'SCHEMA_VALIDATION_ERROR' | 'BUSINESS_RULE_ERROR'
  message: string
  details?: string
}