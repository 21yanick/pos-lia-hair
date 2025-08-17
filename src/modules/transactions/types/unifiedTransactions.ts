// Unified Transaction Types für Transaction Center
// Basiert auf unified_transactions_view aus der Database

export type TransactionType = 'sale' | 'expense' | 'cash_movement' | 'bank_transaction'
export type TypeCode = 'VK' | 'AG' | 'CM' | 'BT'
export type PaymentMethod = 'cash' | 'twint' | 'sumup' | 'bank'
export type TransactionStatus =
  | 'completed'
  | 'cancelled'
  | 'refunded'
  | 'unmatched'
  | 'matched'
  | 'ignored'
export type BankingStatus =
  | 'unmatched'
  | 'provider_matched'
  | 'bank_matched'
  | 'fully_matched'
  | 'matched'

// PDF Status Types - Business Logic Aware
export type PdfStatus = 'available' | 'missing' | 'not_needed' | 'generating'
export type PdfRequirement = 'required' | 'optional' | 'not_applicable'

// Haupt-Interface für unified transactions
export interface UnifiedTransaction {
  id: string
  transaction_type: TransactionType
  type_code: TypeCode
  receipt_number: string | null
  transaction_date: string
  amount: number
  payment_method: PaymentMethod
  status: TransactionStatus
  user_id: string
  description: string

  // Customer Information (only for sales)
  customer_id: string | null
  customer_name: string | null

  // PDF/Document Status
  document_id: string | null
  has_pdf: boolean
  pdf_status: PdfStatus
  pdf_requirement: PdfRequirement

  // Banking/Reconciliation Status
  banking_status: BankingStatus | null

  // Display Helper (aus DB View)
  date_only: string // YYYY-MM-DD
  time_only: string // HH:MM
  description_lower: string // für Search
  receipt_number_lower: string // für Search

  // Provider Fees Integration (NEW)
  provider_fee?: number | null
  net_amount?: number | null
  provider_report_id?: string | null
  has_real_provider_fees?: boolean
}

// Search & Filter Interface
export interface TransactionSearchQuery {
  // Receipt Number Search (priorität)
  receiptNumber?: string // "VK2025000076", "AG2025", "CM2025"

  // Content Search
  description?: string // "Haarschnitt", "Migros", "Owner"

  // Amount Search
  exactAmount?: number // 47.50
  amountFrom?: number // >= 20.00
  amountTo?: number // <= 100.00

  // Date Range
  dateFrom?: string // YYYY-MM-DD
  dateTo?: string // YYYY-MM-DD

  // Type Filters
  transactionTypes?: TransactionType[] // ['sale', 'expense']
  typeCodes?: TypeCode[] // ['VK', 'AG']

  // Payment Method
  paymentMethods?: PaymentMethod[] // ['cash', 'twint', 'sumup']

  // Status Filters
  statuses?: TransactionStatus[] // ['completed', 'cancelled']
  bankingStatuses?: BankingStatus[] // ['unmatched', 'matched']

  // PDF Status
  hasPdf?: boolean // true/false/undefined (alle)

  // Pagination
  limit?: number
  offset?: number
}

// Quick Filter Presets
export type QuickFilterPreset =
  | 'today' // Heute
  | 'this_week' // Diese Woche
  | 'this_month' // Dieser Monat
  | 'last_month' // Letzter Monat
  | 'with_pdf' // Nur mit PDF
  | 'without_pdf' // Nur ohne PDF
  | 'sales_only' // Nur Verkäufe
  | 'expenses_only' // Nur Ausgaben
  | 'cash_movements_only' // Nur Kassenbewegungen
  | 'bank_transactions_only' // Nur Bank Transaktionen
  | 'cash_only' // Nur Bargeld
  | 'unmatched_only' // Nur unabgeglichen
  | 'matched_only' // Nur zugeordnet

// Sort Options
export interface TransactionSort {
  field: 'transaction_date' | 'amount' | 'receipt_number' | 'type_code'
  direction: 'asc' | 'desc'
}

// Bulk Operations
export type BulkOperationType =
  | 'download_pdfs' // ZIP Download
  | 'regenerate_pdfs' // Fehlende PDFs erstellen
  | 'export_csv' // CSV Export
  | 'export_excel' // Excel Export
  | 'print_list' // Druckliste

export interface BulkOperationRequest {
  type: BulkOperationType
  transactionIds: string[]
  options?: {
    includeDetails?: boolean
    filename?: string
    dateRange?: {
      from: string
      to: string
    }
  }
}

// Transaction Statistics für Übersicht
export interface TransactionStats {
  total: number
  byType: {
    sale: number
    expense: number
    cash_movement: number
    bank_transaction: number
  }
  byStatus: {
    completed: number
    cancelled: number
    unmatched: number
    matched: number
  }
  // Business-aware PDF Statistics
  pdfStats: {
    available: number // PDFs vorhanden
    missing: number // PDFs fehlen (should exist)
    notNeeded: number // Kein PDF nötig (CM/BT)
    generating: number // PDFs werden erstellt
    totalRequired: number // Anzahl Transaktionen die PDFs brauchen
  }
  // Legacy fields for compatibility
  withPdf: number
  withoutPdf: number
  totalAmount: number
  amountByType: {
    sale: number
    expense: number
    cash_movement: number
    bank_transaction: number
  }
}

// API Response Types
export interface UnifiedTransactionsResponse {
  transactions: UnifiedTransaction[]
  stats: TransactionStats
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

// Export Data Types
export interface TransactionExportData {
  transactions: UnifiedTransaction[]
  stats: TransactionStats
  filters: TransactionSearchQuery
  exportedAt: string
  exportedBy: string
}
