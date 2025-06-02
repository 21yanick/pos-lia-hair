// =====================================================
// Banking Module - Public API
// =====================================================
// Main exports for Banking Module

export { BankingPage } from './BankingPage'
export { useBankingData } from './hooks/useBankingData'

// Import components
export { BankImportDialog } from './components/BankImportDialog'
export { ProviderImportDialog } from './components/ProviderImportDialog'
export { CashTransferDialog } from './components/CashTransferDialog'

// Re-export key types
export type { 
  UnmatchedSaleForProvider,
  UnmatchedProviderReport, 
  UnmatchedBankTransaction,
  AvailableForBankMatching,
  BankingStats,
  ProviderImportSession
} from './services/bankingApi'

// Re-export provider types
export type {
  ProviderRecord,
  ProviderImportPreview,
  ProviderImportResult
} from './types/provider'