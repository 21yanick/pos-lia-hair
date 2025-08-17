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

export { BulkOperationsPanel } from './components/BulkOperationsPanel'
// Main components - specific exports instead of wildcard
export { default as CleanTransactionPage } from './components/CleanTransactionPage'
export { DateRangePicker } from './components/DateRangePicker'
export { default as TransactionCenterPage } from './components/TransactionCenterPage'
export { usePdfActions } from './hooks/usePdfActions'
// Hooks - specific exports instead of wildcard
export { useTransactionCenter } from './hooks/useTransactionCenter'
export { useUnifiedTransactions } from './hooks/useUnifiedTransactions'

// Services (keep existing)
// export { SwissComplianceEngine } from './services/swissComplianceEngine' // Removed over-engineering
// export { ProviderFeesCalculator } from './services/providerFeesCalculator' // Removed over-engineering
// export { SwissTransactionQueryBuilder } from './services/queryBuilder' // Removed over-engineering

// Clean main component
export { default as CleanTransactionPage } from './components/CleanTransactionPage'

// Legacy components (for backwards compatibility)
export { default as TransactionCenterPage } from './components/TransactionCenterPage'
// Types (avoid duplicate exports)
export type {
  BankingStatus,
  BulkOperationRequest,
  BulkOperationType,
  PaymentMethod,
  PdfRequirement,
  PdfStatus,
  QuickFilterPreset,
  TransactionExportData,
  TransactionSearchQuery,
  TransactionSort,
  TransactionStats,
  TransactionStatus,
  TransactionType,
  UnifiedTransaction,
  UnifiedTransactionsResponse,
} from './types/unifiedTransactions'
