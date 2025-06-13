// Import System Type Definitions
// Centralized types for the entire import system

// =================================
// Import Configuration
// =================================

export interface ImportConfig {
  validateOnly: boolean          // Dry-run Modus
  batchSize: number             // Records pro Batch  
  targetUserId: string          // User für Sales/Expenses
  systemUserId: string          // System User für Summaries
  generateMissingReceipts: boolean // Dummy PDFs für Expenses
  overwriteExisting: boolean    // Duplikat-Behandlung
  useSystemUserForSummaries: boolean // System User für Daily Summaries
}

export interface ImportState {
  status: 'idle' | 'processing' | 'success' | 'error'
  progress: number
  currentPhase: string
  results: ImportResults | null
  errors: string[]
}

export interface ImportResults {
  itemsImported: number
  usersImported: number
  ownerTransactionsImported: number
  bankAccountsImported: number
  salesImported: number
  expensesImported: number
  cashMovementsGenerated: number
  documentsGenerated: number
  dailySummariesCalculated: number
  totalProcessingTime: number
}

// =================================
// Import Data Types
// =================================

export interface ItemImport {
  name: string
  default_price: number
  type: 'service' | 'product'
  is_favorite?: boolean
  active?: boolean
}

export interface SaleImport {
  date: string
  time: string
  total_amount: number
  payment_method: 'cash' | 'twint' | 'sumup'
  status: 'completed'
  items: {
    item_name: string
    price: number
    notes?: string
  }[]
  notes?: string
}

export interface ExpenseImport {
  date: string
  amount: number
  description: string
  category: 'rent' | 'supplies' | 'salary' | 'utilities' | 'insurance' | 'other'
  payment_method: 'bank' | 'cash'
  supplier_name?: string
  invoice_number?: string
  notes?: string
}

// =================================
// Import Process Types
// =================================

export enum ImportPhase {
  VALIDATION = 'validation',
  BUSINESS_DATA_IMPORT = 'business_data_import',     // Items (shared)
  USER_DATA_IMPORT = 'user_data_import',             // Sales, Expenses
  CASH_MOVEMENT_GENERATION = 'cash_movement_generation',
  DOCUMENT_GENERATION = 'document_generation',
  SUMMARY_RECALCULATION = 'summary_recalculation'
}

// =================================
// Constants
// =================================

export const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000'

export const DEFAULT_CONFIG: ImportConfig = {
  validateOnly: false,
  batchSize: 100,
  targetUserId: '',
  systemUserId: SYSTEM_USER_ID,
  generateMissingReceipts: true,
  overwriteExisting: false,
  useSystemUserForSummaries: true
}

// =================================
// Import Data Container
// =================================

export interface ImportDataContainer {
  items?: ItemImport[]
  users?: any[]
  owner_transactions?: any[]
  bank_accounts?: any[]
  sales?: SaleImport[]
  expenses?: ExpenseImport[]
}

// =================================
// Validation Types
// =================================

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}