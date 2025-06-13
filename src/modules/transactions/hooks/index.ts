/**
 * Transaction Hooks Index
 * 
 * Clean exports for all transaction-related hooks
 */

// Main orchestrator hook
export { useTransactionCenter } from './useTransactionCenter'

// Specialized hooks
export { useSwissTransactionData } from './useSwissTransactionData'
export { useTransactionSearch } from './useTransactionSearch'
export { useTransactionFilters } from './useTransactionFilters'
export { useTransactionStats } from './useTransactionStats'
export { usePagination } from './usePagination'

// Keep existing hooks for compatibility
export { useUnifiedTransactions } from './useUnifiedTransactions'
export { usePdfActions } from './usePdfActions'

// Type exports
export type { EnhancedUnifiedTransaction } from './useSwissTransactionData'
export type { SearchState, SearchMetadata } from './useTransactionSearch'
export type { ActiveFilters, FilterPreset, FilterAnalytics } from './useTransactionFilters'
export type { EnhancedTransactionStats, StatsCalculationOptions } from './useTransactionStats'
export type { PaginationState, PaginationActions, PaginationContext } from './usePagination'
export type { TransactionCenterState, TransactionCenterConfig } from './useTransactionCenter'