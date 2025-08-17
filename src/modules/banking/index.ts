// =====================================================
// Banking Module - Public API
// =====================================================
// Main exports for Banking Module

export { BankingPage } from './BankingPage'
// Import components
export { BankImportDialog } from './components/BankImportDialog'
export { CashTransferDialog } from './components/CashTransferDialog'
export { ProviderImportDialog } from './components/ProviderImportDialog'
export { useBankingData } from './hooks/useBankingData'

// Re-export key types
export type {
  AvailableForBankMatching,
  BankingStats,
  ProviderImportSession,
  UnmatchedBankTransaction,
  UnmatchedProviderReport,
  UnmatchedSaleForProvider,
} from './services/bankingApi'

// Re-export provider types
export type {
  ProviderImportPreview,
  ProviderImportResult,
  ProviderRecord,
} from './types/provider'
