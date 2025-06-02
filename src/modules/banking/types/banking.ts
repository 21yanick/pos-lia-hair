// =====================================================
// Banking Module TypeScript Types
// =====================================================
// Auto-generated from DB schema: 06_banking_system_rebuild.sql
// Date: 2025-01-06

// =====================================================
// CORE BANKING TYPES
// =====================================================

export type BankAccountRow = {
  id: string
  name: string
  bank_name: string
  iban: string | null
  account_number: string | null
  current_balance: number
  last_statement_date: string | null
  is_active: boolean
  user_id: string
  created_at: string
  updated_at: string
  notes: string | null
}

export type BankAccountInsert = {
  id?: string
  name: string
  bank_name: string
  iban?: string | null
  account_number?: string | null
  current_balance?: number
  last_statement_date?: string | null
  is_active?: boolean
  user_id: string
  created_at?: string
  updated_at?: string
  notes?: string | null
}

export type BankAccountUpdate = {
  id?: string
  name?: string
  bank_name?: string
  iban?: string | null
  account_number?: string | null
  current_balance?: number
  last_statement_date?: string | null
  is_active?: boolean
  user_id?: string
  created_at?: string
  updated_at?: string
  notes?: string | null
}

// =====================================================
// BANK TRANSACTIONS
// =====================================================

export type BankTransactionStatus = 'unmatched' | 'matched' | 'ignored'

export type BankTransactionRow = {
  id: string
  bank_account_id: string
  transaction_date: string
  booking_date: string | null
  amount: number
  description: string
  reference: string | null
  transaction_code: string | null
  import_batch_id: string | null
  import_filename: string | null
  import_date: string
  raw_data: any | null // JSONB
  status: BankTransactionStatus
  user_id: string
  created_at: string
  updated_at: string
  notes: string | null
}

export type BankTransactionInsert = {
  id?: string
  bank_account_id: string
  transaction_date: string
  booking_date?: string | null
  amount: number
  description: string
  reference?: string | null
  transaction_code?: string | null
  import_batch_id?: string | null
  import_filename?: string | null
  import_date?: string
  raw_data?: any | null
  status?: BankTransactionStatus
  user_id: string
  created_at?: string
  updated_at?: string
  notes?: string | null
}

export type BankTransactionUpdate = {
  id?: string
  bank_account_id?: string
  transaction_date?: string
  booking_date?: string | null
  amount?: number
  description?: string
  reference?: string | null
  transaction_code?: string | null
  import_batch_id?: string | null
  import_filename?: string | null
  import_date?: string
  raw_data?: any | null
  status?: BankTransactionStatus
  user_id?: string
  created_at?: string
  updated_at?: string
  notes?: string | null
}

// =====================================================
// PROVIDER REPORTS (TWINT/SumUp)
// =====================================================

export type Provider = 'twint' | 'sumup'
export type ProviderReportStatus = 'unmatched' | 'matched' | 'discrepancy'

export type ProviderReportRow = {
  id: string
  provider: Provider
  transaction_date: string
  settlement_date: string | null
  gross_amount: number
  fees: number
  net_amount: number
  provider_transaction_id: string | null
  provider_reference: string | null
  payment_method: string | null
  currency: string
  import_filename: string
  import_date: string
  raw_data: any | null // JSONB
  sale_id: string | null
  status: ProviderReportStatus
  user_id: string
  created_at: string
  updated_at: string
  notes: string | null
}

export type ProviderReportInsert = {
  id?: string
  provider: Provider
  transaction_date: string
  settlement_date?: string | null
  gross_amount: number
  fees?: number
  net_amount: number
  provider_transaction_id?: string | null
  provider_reference?: string | null
  payment_method?: string | null
  currency?: string
  import_filename: string
  import_date?: string
  raw_data?: any | null
  sale_id?: string | null
  status?: ProviderReportStatus
  user_id: string
  created_at?: string
  updated_at?: string
  notes?: string | null
}

export type ProviderReportUpdate = {
  id?: string
  provider?: Provider
  transaction_date?: string
  settlement_date?: string | null
  gross_amount?: number
  fees?: number
  net_amount?: number
  provider_transaction_id?: string | null
  provider_reference?: string | null
  payment_method?: string | null
  currency?: string
  import_filename?: string
  import_date?: string
  raw_data?: any | null
  sale_id?: string | null
  status?: ProviderReportStatus
  user_id?: string
  created_at?: string
  updated_at?: string
  notes?: string | null
}

// =====================================================
// TRANSACTION MATCHING
// =====================================================

export type MatchedType = 'sale' | 'expense' | 'provider_batch' | 'cash_movement'
export type MatchType = 'automatic' | 'manual' | 'suggested'

export type TransactionMatchRow = {
  id: string
  bank_transaction_id: string
  matched_type: MatchedType
  matched_id: string
  matched_amount: number
  match_confidence: number
  match_type: MatchType
  matched_by: string | null
  matched_at: string
  notes: string | null
}

export type TransactionMatchInsert = {
  id?: string
  bank_transaction_id: string
  matched_type: MatchedType
  matched_id: string
  matched_amount: number
  match_confidence?: number
  match_type?: MatchType
  matched_by?: string | null
  matched_at?: string
  notes?: string | null
}

export type TransactionMatchUpdate = {
  id?: string
  bank_transaction_id?: string
  matched_type?: MatchedType
  matched_id?: string
  matched_amount?: number
  match_confidence?: number
  match_type?: MatchType
  matched_by?: string | null
  matched_at?: string
  notes?: string | null
}

// =====================================================
// EXTENDED TYPES FOR EXISTING TABLES
// =====================================================

export type BankingStatus = 'unmatched' | 'provider_matched' | 'bank_matched' | 'fully_matched'
export type SimpleBankingStatus = 'unmatched' | 'matched'

// Extended Sale with Banking fields
export type SaleWithBanking = {
  id: string
  // ... existing sale fields
  provider_report_id: string | null
  bank_transaction_id: string | null
  banking_status: BankingStatus
}

// Extended Expense with Banking fields  
export type ExpenseWithBanking = {
  id: string
  // ... existing expense fields
  bank_transaction_id: string | null
  banking_status: SimpleBankingStatus
}

// Extended Cash Movement with Banking fields
export type CashMovementWithBanking = {
  id: string
  // ... existing cash movement fields
  bank_transaction_id: string | null
  banking_status: SimpleBankingStatus
  movement_type: MovementType
}

// Movement Type for Cash Movements
export type MovementType = 'cash_operation' | 'bank_transfer'

// =====================================================
// UI COMPONENT TYPES
// =====================================================

// Tab 1: Provider Reconciliation
export type UnmatchedSaleForProvider = {
  id: string
  created_at: string
  total_amount: number
  payment_method: string
  payment_display: string
  customer_name?: string
  banking_status: BankingStatus
}

export type UnmatchedProviderReport = {
  id: string
  provider: Provider
  provider_display: string
  transaction_date: string
  gross_amount: number
  fees: number
  net_amount: number
  payment_method: string | null
  status: ProviderReportStatus
}

// Tab 2: Bank Reconciliation
export type UnmatchedBankTransaction = {
  id: string
  bank_account_id: string
  bank_account_name: string
  transaction_date: string
  amount: number
  amount_abs: number
  description: string
  direction_display: string
  status: BankTransactionStatus
}

export type AvailableForBankMatching = {
  id: string
  item_type: 'sale' | 'expense' | 'cash_movement'
  date: string
  amount: number
  description: string
  banking_status: BankingStatus | SimpleBankingStatus
}

// =====================================================
// BUSINESS LOGIC TYPES
// =====================================================

// Provider Import Data Structure
export interface TWINTCsvRow {
  'Datum Überweisung': string
  'Datum Abrechnung': string
  'Währung': string
  'Transaktionsgebühr': string
  'Gutgeschriebener Betrag': string
  'Betrag Transaktion': string
  'Transaktionsdatum': string
  'Transaktionszeit': string
  'Order ID': string
  'Transaktions-ID': string
}

export interface SumUpCsvRow {
  'E-Mail': string
  'Datum': string
  'Transaktions-ID': string
  'Zahlungsart': string
  'Status': string
  'Kartentyp': string
  'Betrag inkl. MwSt.': string
  'Gebühr': string
  'Auszahlung': string
  'Auszahlungsdatum': string
}

// Matching Algorithm
export interface MatchingCandidate {
  sale: SaleWithBanking
  providerReport: ProviderReportRow
  confidence: number
  reasons: string[]
  amountMatch: boolean
  dateMatch: boolean
  methodMatch: boolean
}

export interface BankMatchingCandidate {
  bankTransaction: BankTransactionRow
  matchableItems: AvailableForBankMatching[]
  totalAmount: number
  confidence: number
  reasons: string[]
}

// File Import Results
export interface ImportResult {
  success: boolean
  filename: string
  recordsProcessed: number
  recordsImported: number
  errors: string[]
  warnings: string[]
  duplicates: number
}

// Banking Dashboard Stats
export interface BankingStats {
  unmatchedSales: number
  unmatchedProviderReports: number
  unmatchedExpenses: number
  unmatchedBankTransactions: number
  totalUnmatchedAmount: number
  matchingProgress: number // percentage
}

// Click-to-Connect State
export interface ClickToConnectState {
  mode: 'idle' | 'sale_selected' | 'provider_selected' | 'both_selected'
  selectedSale: string | null
  selectedProvider: string | null
  selectedBank: string | null
  selectedItems: string[] // for multi-select
  confidence: number | null
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface BankingApiResponse<T> {
  data: T | null
  error: string | null
  count?: number
}

export interface BankingCreateMatchRequest {
  saleId: string
  providerReportId: string
  confidence: number
  matchType: MatchType
  notes?: string
}

export interface BankCreateMatchRequest {
  bankTransactionId: string
  matchedItems: Array<{
    type: MatchedType
    id: string
    amount: number
  }>
  confidence: number
  matchType: MatchType
  notes?: string
}

// =====================================================
// FORM TYPES
// =====================================================

export interface FileUploadForm {
  file: File
  provider: Provider | 'bank'
  bankAccountId?: string
}

export interface CashTransferForm {
  amount: number
  description: string
  direction: 'to_bank' | 'from_bank'
  movement_type: MovementType
}

export interface ManualMatchForm {
  bankTransactionId: string
  matchedType: MatchedType
  matchedId: string
  matchedAmount: number
  notes?: string
}

// =====================================================
// CAMT IMPORT TYPES
// =====================================================

export interface BankImportSession {
  id: string
  bank_account_id: string
  import_filename: string
  import_type: 'camt053' | 'csv'
  total_entries: number
  new_entries: number
  duplicate_entries: number
  error_entries: number
  statement_from_date?: string
  statement_to_date?: string
  status: 'pending' | 'completed' | 'failed'
  imported_by?: string
  imported_at: string
  notes?: string
}

export interface ImportPreviewData {
  filename: string
  totalEntries: number
  newEntries: number
  duplicateEntries: number
  errorEntries: number
  fileAlreadyImported: boolean
  periodOverlap: boolean
  importable: boolean
  statementPeriod?: {
    from: string
    to: string
  }
}

export interface ImportExecutionResult {
  success: boolean
  importedCount: number
  errors: string[]
  sessionId?: string
}

// =====================================================
// EXPORT
// =====================================================

export * from './camt'