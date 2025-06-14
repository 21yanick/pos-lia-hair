// Supplier Types for Master Table Implementation
// Provides normalized supplier data for consistent analytics

import type { Database } from '@/types/supabase'

// Core supplier types (from database)
export type Supplier = Database['public']['Tables']['suppliers']['Row']
export type SupplierInsert = Omit<Database['public']['Tables']['suppliers']['Insert'], 'id' | 'created_at' | 'updated_at'>
export type SupplierUpdate = Partial<Omit<Database['public']['Tables']['suppliers']['Update'], 'id' | 'created_at' | 'updated_at'>> & { id: string }

// Supplier Category enum for better TypeScript support
export type SupplierCategory = 
  | 'beauty_supplies'    // Haarprodukte, Kosmetik
  | 'equipment'          // Geräte, Möbel  
  | 'utilities'          // Strom, Wasser, Internet
  | 'rent'              // Miete, Nebenkosten
  | 'insurance'         // Versicherungen
  | 'professional_services' // Steuerberater, Anwalt
  | 'retail'            // Coop, Migros für Büromaterial
  | 'online_marketplace' // AliExpress, Amazon
  | 'real_estate'       // Immobilienfirmen
  | 'other'             // Sonstiges

// Category labels for UI display
export const SUPPLIER_CATEGORIES: Record<SupplierCategory, string> = {
  beauty_supplies: 'Beauty & Supplies',
  equipment: 'Ausrüstung & Möbel',
  utilities: 'Versorgung & Internet',
  rent: 'Miete & Nebenkosten',
  insurance: 'Versicherungen',
  professional_services: 'Professionelle Dienste',
  retail: 'Einzelhandel',
  online_marketplace: 'Online Marketplace',
  real_estate: 'Immobilien',
  other: 'Sonstiges'
} as const

// Enhanced supplier with aggregated data for analytics
export interface SupplierWithStats extends Supplier {
  total_expenses: number
  expense_count: number
  last_expense_date: string | null
  average_expense: number
  categories_used: string[]
}

// Supplier search and autocomplete
export interface SupplierSearchResult {
  id: string
  name: string
  normalized_name: string
  category: SupplierCategory
  last_used: string | null
  usage_count: number
}

// Supplier form data for create/edit
export interface SupplierFormData {
  name: string
  category: SupplierCategory
  contact_email?: string
  contact_phone?: string
  website?: string
  address_line1?: string
  address_line2?: string
  postal_code?: string
  city?: string
  country?: string
  iban?: string
  vat_number?: string
  notes?: string
  is_active: boolean
}

// Supplier analytics data
export interface SupplierAnalytics {
  total_suppliers: number
  active_suppliers: number
  top_suppliers_by_expense: Array<{
    supplier: Supplier
    total_amount: number
    expense_count: number
  }>
  expenses_by_category: Array<{
    category: SupplierCategory
    total_amount: number
    supplier_count: number
  }>
  monthly_trends: Array<{
    month: string
    new_suppliers: number
    total_expenses: number
  }>
}

// Supplier validation schemas (for forms)
export interface SupplierValidationError {
  field: keyof SupplierFormData
  message: string
}

// Supplier import data (for CSV import)
export interface SupplierImport {
  name: string
  category: SupplierCategory
  contact_email?: string
  contact_phone?: string
  website?: string
  iban?: string
  vat_number?: string
  notes?: string
}

// Supplier normalization utilities
export interface SupplierNormalization {
  original_name: string
  normalized_name: string
  suggested_category: SupplierCategory
  confidence: number // 0-1 score for automatic categorization
}

// Hooks and API interfaces
export interface UseSupplierSearchOptions {
  query: string
  category?: SupplierCategory
  active_only?: boolean
  limit?: number
  include_stats?: boolean
}

export interface UseSupplierStatsOptions {
  supplier_id?: string
  date_from?: string
  date_to?: string
  categories?: SupplierCategory[]
}

// Migration and legacy support
export interface SupplierMigrationStatus {
  total_expenses: number
  migrated_expenses: number
  unmigrated_expenses: number
  duplicate_suppliers: string[]
  migration_errors: string[]
}