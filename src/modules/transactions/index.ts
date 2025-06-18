/**
 * Transactions Module Index
 * 
 * Swiss POS Transaction Center 2.0 - Complete Module Export
 * 
 * This module provides comprehensive transaction management with:
 * - Swiss timezone and compliance features
 * - Real provider fees from provider_reports
 * - Enhanced search and filtering
 * - Clean component architecture
 * - Performance optimized hooks
 */

// Main components - specific exports instead of wildcard
export { default as CleanTransactionPage } from './components/CleanTransactionPage'
export { default as TransactionCenterPage } from './components/TransactionCenterPage'
export { BulkOperationsPanel } from './components/BulkOperationsPanel'
export { DateRangePicker } from './components/DateRangePicker'

// Hooks - specific exports instead of wildcard
export { useTransactionCenter } from './hooks/useTransactionCenter'
export { useUnifiedTransactions } from './hooks/useUnifiedTransactions'
export { usePdfActions } from './hooks/usePdfActions'

// Services (keep existing)
// export { SwissComplianceEngine } from './services/swissComplianceEngine' // Removed over-engineering
// export { ProviderFeesCalculator } from './services/providerFeesCalculator' // Removed over-engineering  
// export { SwissTransactionQueryBuilder } from './services/queryBuilder' // Removed over-engineering

// Types (avoid duplicate exports)
export type {
  UnifiedTransaction,
  TransactionType,
  PaymentMethod,
  TransactionStatus,
  BankingStatus,
  PdfStatus,
  PdfRequirement,
  TransactionSearchQuery,
  QuickFilterPreset,
  TransactionSort,
  BulkOperationType,
  BulkOperationRequest,
  TransactionStats,
  UnifiedTransactionsResponse,
  TransactionExportData
} from './types/unifiedTransactions'

// Legacy components (for backwards compatibility)
export { default as TransactionCenterPage } from './components/TransactionCenterPage'

// Clean main component
export { default as CleanTransactionPage } from './components/CleanTransactionPage'