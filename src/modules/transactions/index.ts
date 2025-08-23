/**
 * Transactions Module Index
 *
 * V6.1: Clean Transaction Module - Only Existing Components
 *
 * This module provides transaction management with:
 * - V6.1 unified_transactions_view integration
 * - Swiss compliance features
 * - Clean component architecture
 * - Performance optimized hooks
 */

// V6.1: Actual existing components
export { BulkOperationsPanel } from './components/BulkOperationsPanel'
export { CustomerAssignDialog } from './components/CustomerAssignDialog'
export { DateRangePicker } from './components/DateRangePicker'
export { default as TransactionPage } from './components/TransactionPage'

// V6.1: Actual existing hooks
export { useDebounce } from './hooks/useDebounce'
export { usePdfActions } from './hooks/usePdfActions'
export { useTransactionCustomer } from './hooks/useTransactionCustomer'
export { useTransactionsQuery } from './hooks/useTransactionsQuery'
export { useUnifiedTransactions } from './hooks/useUnifiedTransactions'
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
