// ===================================================================
// INTEGRATION LAYER - Clean interface between generated + custom types
// ===================================================================
// Auto-generated: 17.08.2025 21:59 CET
// Source: V6.1 Database Schema via SSH Tunnel + Supabase CLI
// Tables: 38 total (26 core + 12 views/additional)
// Size: 76KB generated TypeScript definitions
// ===================================================================

import type { Database as GeneratedDB, Json } from './supabase_generated_v6.1'

// ===================================================================
// RE-EXPORT GENERATED STRUCTURE WITH CLEAN NAMES
// ===================================================================
export type DatabaseSchema = GeneratedDB['public']
export type { Json }
export type Tables = DatabaseSchema['Tables']
export type Views = DatabaseSchema['Views']
export type Functions = DatabaseSchema['Functions']
export type Enums = DatabaseSchema['Enums']

// ===================================================================
// CORE TABLE TYPES - V6.1 Complete (38 Tables/Views)
// ===================================================================

// ▶️ FOUNDATION TABLES
export type OrganizationRow = Tables['organizations']['Row']
export type OrganizationInsert = Tables['organizations']['Insert']
export type OrganizationUpdate = Tables['organizations']['Update']

export type UserRow = Tables['users']['Row']
export type UserInsert = Tables['users']['Insert']
export type UserUpdate = Tables['users']['Update']

export type OrganizationUserRow = Tables['organization_users']['Row']
export type OrganizationUserInsert = Tables['organization_users']['Insert']

export type BusinessSettingsRow = Tables['business_settings']['Row']
export type BusinessSettingsInsert = Tables['business_settings']['Insert']
export type BusinessSettingsUpdate = Tables['business_settings']['Update']

// ▶️ POS SYSTEM TABLES
export type ItemRow = Tables['items']['Row']
export type ItemInsert = Tables['items']['Insert']
export type ItemUpdate = Tables['items']['Update']

export type SaleRow = Tables['sales']['Row']
export type SaleInsert = Tables['sales']['Insert']
export type SaleUpdate = Tables['sales']['Update']

export type SaleItemRow = Tables['sale_items']['Row']
export type SaleItemInsert = Tables['sale_items']['Insert']
export type SaleItemUpdate = Tables['sale_items']['Update']

export type CustomerRow = Tables['customers']['Row']
export type CustomerInsert = Tables['customers']['Insert']
export type CustomerUpdate = Tables['customers']['Update']

export type CustomerNoteRow = Tables['customer_notes']['Row']
export type CustomerNoteInsert = Tables['customer_notes']['Insert']

// ▶️ FINANCIAL TABLES
export type ExpenseRow = Tables['expenses']['Row']
export type ExpenseInsert = Tables['expenses']['Insert']
export type ExpenseUpdate = Tables['expenses']['Update']

export type SupplierRow = Tables['suppliers']['Row']
export type SupplierInsert = Tables['suppliers']['Insert']
export type SupplierUpdate = Tables['suppliers']['Update']

export type CashMovementRow = Tables['cash_movements']['Row']
export type CashMovementInsert = Tables['cash_movements']['Insert']
export type CashMovementUpdate = Tables['cash_movements']['Update']

export type OwnerTransactionRow = Tables['owner_transactions']['Row']
export type OwnerTransactionInsert = Tables['owner_transactions']['Insert']
export type OwnerTransactionUpdate = Tables['owner_transactions']['Update']

// ▶️ BANKING & COMPLIANCE TABLES
export type BankAccountRow = Tables['bank_accounts']['Row']
export type BankAccountInsert = Tables['bank_accounts']['Insert']
export type BankAccountUpdate = Tables['bank_accounts']['Update']

export type BankTransactionRow = Tables['bank_transactions']['Row']
export type BankTransactionInsert = Tables['bank_transactions']['Insert']
export type BankTransactionUpdate = Tables['bank_transactions']['Update']

export type ProviderReportRow = Tables['provider_reports']['Row']
export type ProviderReportInsert = Tables['provider_reports']['Insert']
export type ProviderReportUpdate = Tables['provider_reports']['Update']

export type BankReconciliationMatchRow = Tables['bank_reconciliation_matches']['Row']
export type BankReconciliationMatchInsert = Tables['bank_reconciliation_matches']['Insert']
export type BankReconciliationMatchUpdate = Tables['bank_reconciliation_matches']['Update']

export type DocumentSequenceRow = Tables['document_sequences']['Row']
export type DocumentSequenceInsert = Tables['document_sequences']['Insert']
export type DocumentSequenceUpdate = Tables['document_sequences']['Update']

// ▶️ APPOINTMENT SYSTEM TABLES
export type AppointmentRow = Tables['appointments']['Row']
export type AppointmentInsert = Tables['appointments']['Insert']
export type AppointmentUpdate = Tables['appointments']['Update']

export type AppointmentServiceRow = Tables['appointment_services']['Row']
export type AppointmentServiceInsert = Tables['appointment_services']['Insert']
export type AppointmentServiceUpdate = Tables['appointment_services']['Update']

// Customer relation type (for Supabase joins: customer:customers(...))
export type CustomerRelation = {
  id: string
  name: string
  phone: string | null
  email: string | null
}

// ▶️ AUDIT & REPORTING TABLES
export type AuditLogRow = Tables['audit_log']['Row']
export type AuditLogInsert = Tables['audit_log']['Insert']

export type DailySummaryRow = Tables['daily_summaries']['Row']
export type DailySummaryInsert = Tables['daily_summaries']['Insert']
export type DailySummaryUpdate = Tables['daily_summaries']['Update']

export type MonthlySummaryRow = Tables['monthly_summaries']['Row']
export type MonthlySummaryInsert = Tables['monthly_summaries']['Insert']
export type MonthlySummaryUpdate = Tables['monthly_summaries']['Update']

export type DocumentRow = Tables['documents']['Row']
export type DocumentInsert = Tables['documents']['Insert']
export type DocumentUpdate = Tables['documents']['Update']

// ▶️ V6.1 MIGRATION 07: PDF Versioning Extensions
// These columns were added in migration 07_pdf_versioning_tracking_v6.sql
// They extend the documents table for audit trail support
export type DocumentWithVersioning = DocumentRow & {
  replaced_by: string | null
  replacement_reason: 'customer_changed' | 'correction' | 'data_fix' | null
}

export type DocumentArchiveUpdate = {
  file_path: string
  replacement_reason: 'customer_changed' | 'correction' | 'data_fix'
  notes: string
}

export type DocumentLinkUpdate = {
  replaced_by: string
}

// ▶️ ADDITIONAL V6.1 TABLES
export type DailyClosureLockRow = Tables['daily_closure_locks']['Row']
export type BankReconciliationSessionRow = Tables['bank_reconciliation_sessions']['Row']

// ===================================================================
// VIEW TYPES - V6.1 Analytics and Reports
// ===================================================================
export type UnifiedTransactionView = Views['unified_transactions_view']['Row']
export type AppointmentsWithServicesView = Views['appointments_with_services']['Row']
export type AvailableForBankMatchingView = Views['available_for_bank_matching']['Row']
export type UnmatchedBankTransactionsView = Views['unmatched_bank_transactions']['Row']
export type UnmatchedProviderReportsView = Views['unmatched_provider_reports']['Row']
export type UnmatchedSalesForProviderView = Views['unmatched_sales_for_provider']['Row']
export type CustomerActivitySummaryView = Views['customer_activity_summary']['Row']
export type SalesPerformanceSummaryView = Views['sales_performance_summary']['Row']
export type SupplierSpendingAnalysisView = Views['supplier_spending_analysis']['Row']
export type MonthlyFinancialOverviewView = Views['monthly_financial_overview']['Row']

// ===================================================================
// FUNCTION TYPES - V6.1 Business Logic (86 Functions)
// ===================================================================
export type GetCurrentCashBalanceArgs = Functions['get_current_cash_balance']['Args']
export type GetCurrentCashBalanceReturn = Functions['get_current_cash_balance']['Returns']

export type GetCurrentCashBalanceForOrgArgs = Functions['get_current_cash_balance_for_org']['Args']
export type GetCurrentCashBalanceForOrgReturn =
  Functions['get_current_cash_balance_for_org']['Returns']

export type CalculateDailySummaryArgs = Functions['calculate_daily_summary']['Args']
export type CalculateDailySummaryReturn = Functions['calculate_daily_summary']['Returns']

export type BootstrapOrganizationCompleteArgs = Functions['bootstrap_organization_complete']['Args']
export type BootstrapOrganizationCompleteReturn =
  Functions['bootstrap_organization_complete']['Returns']

export type GenerateDocumentNumberArgs = Functions['generate_document_number']['Args']
export type GenerateDocumentNumberReturn = Functions['generate_document_number']['Returns']

export type ValidateSystemHealthReturn = Functions['validate_system_health']['Returns']

export type GetOwnerBalanceArgs = Functions['get_owner_balance']['Args']
export type GetOwnerBalanceReturn = Functions['get_owner_balance']['Returns']

// ===================================================================
// ENUM TYPES - V6.1 Custom Types
// ===================================================================
export type SupplierCategory = Enums['supplier_category']

// ===================================================================
// UTILITY TYPES - Common patterns
// ===================================================================

// Payment method types (extracted from schema)
export type PaymentMethod = 'cash' | 'twint' | 'sumup'
export type BankingStatus = 'unmatched' | 'provider_matched' | 'bank_matched' | 'fully_matched'
export type SettlementStatus = 'pending' | 'settled' | 'failed' | 'weekend_delay' | 'charged_back'
export type DocumentSequenceType =
  | 'sale_receipt'
  | 'expense_receipt'
  | 'invoice'
  | 'cash_movement'
  | 'bank_transaction'
  | 'document'

// Organization-scoped query pattern
export type OrganizationScoped<T> = T & {
  organization_id: string
}

// ===================================================================
// MAIN DATABASE EXPORT - For all application code
// ===================================================================

// Main Database type - replaces legacy @/types/supabase import
export type Database = GeneratedDB

// Re-export for direct usage
export type { Database as GeneratedDB } from './supabase_generated_v6.1'

// Short aliases for common patterns
export type DB = GeneratedDB
export type DBTables = Tables
export type DBViews = Views
export type DBFunctions = Functions

// ===================================================================
// TYPE VALIDATION - Ensure critical types exist
// ===================================================================

// Compile-time validation that critical V6.1 types exist
type _ValidationCheck = {
  organizations: OrganizationRow
  sales: SaleRow
  business_settings: BusinessSettingsRow
  audit_log: AuditLogRow
  appointments_with_services: AppointmentsWithServicesView
  supplier_category_enum: SupplierCategory
}

// ===================================================================
// GENERATION METADATA
// ===================================================================
export const TYPES_METADATA = {
  generated_at: '2025-08-17T21:59:00.000Z',
  source: 'V6.1 Database Schema via SSH Tunnel + Supabase CLI',
  tables_count: 38,
  method: 'SSH Port Forward + npx supabase gen types',
  size_kb: 76,
  version: 'v6.1-enhanced',
} as const
