// Supplier Services
// Business logic for supplier management and normalization

import { supabase } from '@/shared/lib/supabase/client'
import type {
  Supplier,
  SupplierCategory,
  SupplierFormData,
  SupplierInsert,
  SupplierNormalization,
  SupplierSearchResult,
  SupplierUpdate,
  SupplierWithStats,
} from '@/shared/types/suppliers'

// =================================
// Supplier CRUD Operations
// =================================

export async function getSuppliers(
  organizationId: string,
  options?: {
    active_only?: boolean
    category?: SupplierCategory
    search?: string
    limit?: number
    offset?: number
  }
): Promise<{ data: Supplier[]; count: number }> {
  if (!organizationId) {
    throw new Error('Organization ID ist erforderlich')
  }

  let query = supabase
    .from('suppliers')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId) // 🔒 Multi-Tenant Security
    .order('name', { ascending: true })

  if (options?.active_only) {
    query = query.eq('is_active', true)
  }

  if (options?.category) {
    query = query.eq('category', options.category)
  }

  if (options?.search) {
    query = query.or(`name.ilike.%${options.search}%,normalized_name.ilike.%${options.search}%`)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 50) - 1)
  }

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Error fetching suppliers: ${error.message}`)
  }

  return { data: data || [], count: count || 0 }
}

export async function getSupplierById(
  id: string,
  organizationId: string
): Promise<Supplier | null> {
  if (!organizationId) {
    throw new Error('Organization ID ist erforderlich')
  }

  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', id)
    .eq('organization_id', organizationId) // 🔒 Multi-Tenant Security
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw new Error(`Error fetching supplier: ${error.message}`)
  }

  return data
}

export async function createSupplier(
  supplierData: SupplierFormData,
  userId: string,
  organizationId: string
): Promise<Supplier> {
  if (!organizationId) {
    throw new Error('Organization ID ist erforderlich')
  }

  const normalizedName = normalizeSupplierName(supplierData.name)

  const insertData: SupplierInsert = {
    name: supplierData.name.trim(),
    normalized_name: normalizedName,
    category: supplierData.category,
    contact_email: supplierData.contact_email?.trim() || null,
    contact_phone: supplierData.contact_phone?.trim() || null,
    website: supplierData.website?.trim() || null,
    address_line1: supplierData.address_line1?.trim() || null,
    address_line2: supplierData.address_line2?.trim() || null,
    postal_code: supplierData.postal_code?.trim() || null,
    city: supplierData.city?.trim() || null,
    country: supplierData.country?.trim() || 'CH',
    iban: supplierData.iban?.trim() || null,
    vat_number: supplierData.vat_number?.trim() || null,
    notes: supplierData.notes?.trim() || null,
    is_active: supplierData.is_active,
    created_by: userId,
    organization_id: organizationId, // 🔒 Multi-Tenant Security - DAS WAR DAS PROBLEM!
  }

  const { data, error } = await supabase.from('suppliers').insert(insertData).select().single()

  if (error) {
    if (error.code === '23505') {
      // Unique constraint violation
      throw new Error('Ein Lieferant mit diesem Namen existiert bereits')
    }
    throw new Error(`Error creating supplier: ${error.message}`)
  }

  return data
}

export async function updateSupplier(
  id: string,
  updates: Partial<SupplierFormData>,
  organizationId: string
): Promise<Supplier> {
  if (!organizationId) {
    throw new Error('Organization ID ist erforderlich')
  }
  const updateData: Partial<SupplierUpdate> = { id }

  if (updates.name) {
    updateData.name = updates.name.trim()
    updateData.normalized_name = normalizeSupplierName(updates.name)
  }

  if (updates.category) updateData.category = updates.category
  if (updates.contact_email !== undefined)
    updateData.contact_email = updates.contact_email?.trim() || null
  if (updates.contact_phone !== undefined)
    updateData.contact_phone = updates.contact_phone?.trim() || null
  if (updates.website !== undefined) updateData.website = updates.website?.trim() || null
  if (updates.address_line1 !== undefined)
    updateData.address_line1 = updates.address_line1?.trim() || null
  if (updates.address_line2 !== undefined)
    updateData.address_line2 = updates.address_line2?.trim() || null
  if (updates.postal_code !== undefined)
    updateData.postal_code = updates.postal_code?.trim() || null
  if (updates.city !== undefined) updateData.city = updates.city?.trim() || null
  if (updates.country !== undefined) updateData.country = updates.country?.trim() || 'CH'
  if (updates.iban !== undefined) updateData.iban = updates.iban?.trim() || null
  if (updates.vat_number !== undefined) updateData.vat_number = updates.vat_number?.trim() || null
  if (updates.notes !== undefined) updateData.notes = updates.notes?.trim() || null
  if (updates.is_active !== undefined) updateData.is_active = updates.is_active

  const { data, error } = await supabase
    .from('suppliers')
    .update(updateData)
    .eq('id', id)
    .eq('organization_id', organizationId) // 🔒 Multi-Tenant Security
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      // Unique constraint violation
      throw new Error('Ein Lieferant mit diesem Namen existiert bereits')
    }
    throw new Error(`Error updating supplier: ${error.message}`)
  }

  return data
}

export async function deleteSupplier(id: string, organizationId: string): Promise<void> {
  if (!organizationId) {
    throw new Error('Organization ID ist erforderlich')
  }

  // Check if supplier is used in expenses (organization-scoped)
  const { data: expenses, error: expenseError } = await supabase
    .from('expenses')
    .select('id')
    .eq('supplier_id', id)
    .eq('organization_id', organizationId) // 🔒 Multi-Tenant Security
    .limit(1)

  if (expenseError) {
    throw new Error(`Error checking supplier usage: ${expenseError.message}`)
  }

  if (expenses && expenses.length > 0) {
    throw new Error(
      'Lieferant kann nicht gelöscht werden, da er in Ausgaben verwendet wird. Deaktivieren Sie ihn stattdessen.'
    )
  }

  const { error } = await supabase
    .from('suppliers')
    .delete()
    .eq('id', id)
    .eq('organization_id', organizationId) // 🔒 Multi-Tenant Security

  if (error) {
    throw new Error(`Error deleting supplier: ${error.message}`)
  }
}

// =================================
// Supplier Search & Autocomplete
// =================================

export async function searchSuppliers(
  query: string,
  organizationId: string,
  options?: {
    category?: SupplierCategory
    active_only?: boolean
    limit?: number
    include_stats?: boolean
  }
): Promise<SupplierSearchResult[]> {
  if (!organizationId) {
    throw new Error('Organization ID ist erforderlich')
  }

  const limit = options?.limit || 10

  let baseQuery = supabase
    .from('suppliers')
    .select(`
      id,
      name,
      normalized_name,
      category,
      updated_at
    `)
    .eq('organization_id', organizationId) // 🔒 Multi-Tenant Security
    .order('name', { ascending: true })
    .limit(limit)

  if (options?.active_only !== false) {
    baseQuery = baseQuery.eq('is_active', true)
  }

  if (options?.category) {
    baseQuery = baseQuery.eq('category', options.category)
  }

  // Search in name and normalized_name
  const normalizedQuery = normalizeSupplierName(query)
  baseQuery = baseQuery.or(`normalized_name.ilike.%${normalizedQuery}%,name.ilike.%${query}%`)

  const { data, error } = await baseQuery

  if (error) {
    throw new Error(`Error searching suppliers: ${error.message}`)
  }

  // Convert to search results format
  const results: SupplierSearchResult[] = (data || []).map((supplier) => ({
    id: supplier.id,
    name: supplier.name,
    normalized_name: supplier.normalized_name,
    category: supplier.category as SupplierCategory,
    last_used: supplier.updated_at,
    usage_count: 0, // TODO: Add usage stats if needed
  }))

  return results
}

export async function getOrCreateSupplier(
  supplierName: string,
  userId: string,
  organizationId: string,
  suggestedCategory?: SupplierCategory
): Promise<string> {
  if (!organizationId) {
    throw new Error('Organization ID ist erforderlich')
  }

  const normalizedName = normalizeSupplierName(supplierName)

  // Try to find existing supplier (organization-scoped)
  const { data: existing } = await supabase
    .from('suppliers')
    .select('id')
    .eq('normalized_name', normalizedName)
    .eq('organization_id', organizationId) // 🔒 Multi-Tenant Security
    .single()

  if (existing) {
    return existing.id
  }

  // Create new supplier
  const category = suggestedCategory || categorizeSupplier(supplierName)

  const newSupplier = await createSupplier(
    {
      name: supplierName.trim(),
      category,
      is_active: true,
    },
    userId,
    organizationId
  )

  return newSupplier.id
}

// =================================
// Supplier Analytics
// =================================

export async function getSupplierWithStats(
  id: string,
  organizationId: string
): Promise<SupplierWithStats | null> {
  if (!organizationId) {
    throw new Error('Organization ID ist erforderlich')
  }

  const { data, error } = await supabase
    .from('suppliers')
    .select(`
      *,
      expenses!supplier_id (
        amount,
        payment_date,
        category
      )
    `)
    .eq('id', id)
    .eq('organization_id', organizationId) // 🔒 Multi-Tenant Security
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Error fetching supplier stats: ${error.message}`)
  }

  const expenses = data.expenses || []
  const total_expenses = expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0)
  const expense_count = expenses.length
  const last_expense_date =
    expenses.length > 0
      ? expenses.reduce(
          (latest: string, exp: any) => (exp.payment_date > latest ? exp.payment_date : latest),
          expenses[0].payment_date
        )
      : null
  const average_expense = expense_count > 0 ? total_expenses / expense_count : 0
  const categories_used = [...new Set(expenses.map((exp: any) => exp.category))]

  return {
    ...data,
    total_expenses,
    expense_count,
    last_expense_date,
    average_expense,
    categories_used,
  }
}

// =================================
// Utility Functions
// =================================

export function normalizeSupplierName(name: string): string {
  if (!name) return ''

  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[^\w\s]/g, '') // Remove special characters except letters, numbers, spaces
}

export function categorizeSupplier(supplierName: string): SupplierCategory {
  const normalized = normalizeSupplierName(supplierName)

  // Beauty & Supplies
  if (
    normalized.includes('newflag') ||
    normalized.includes('heavenly beauty') ||
    normalized.includes('beauty') ||
    normalized.includes('cosmetic') ||
    normalized.includes('hair')
  ) {
    return 'beauty_supplies'
  }

  // Retail
  if (
    normalized.includes('coop') ||
    normalized.includes('migros') ||
    normalized.includes('denner') ||
    normalized.includes('volg')
  ) {
    return 'retail'
  }

  // Online Marketplace
  if (
    normalized.includes('aliexpress') ||
    normalized.includes('amazon') ||
    normalized.includes('ebay')
  ) {
    return 'online_marketplace'
  }

  // Utilities
  if (
    normalized.includes('ewz') ||
    normalized.includes('swisscom') ||
    normalized.includes('sunrise') ||
    normalized.includes('salt') ||
    normalized.includes('elektrizitat') ||
    normalized.includes('strom') ||
    normalized.includes('wasser') ||
    normalized.includes('gas')
  ) {
    return 'utilities'
  }

  // Real Estate
  if (
    normalized.includes('immobilien') ||
    normalized.includes('real estate') ||
    normalized.includes('hausverwaltung') ||
    normalized.includes('liegenschaft')
  ) {
    return 'real_estate'
  }

  // Equipment
  if (
    normalized.includes('equipment') ||
    normalized.includes('mobel') ||
    normalized.includes('furniture') ||
    normalized.includes('stuhl') ||
    normalized.includes('chair')
  ) {
    return 'equipment'
  }

  // Insurance
  if (
    normalized.includes('versicherung') ||
    normalized.includes('insurance') ||
    normalized.includes('axa') ||
    normalized.includes('zurich') ||
    normalized.includes('helvetia')
  ) {
    return 'insurance'
  }

  return 'other'
}

export function validateSupplierData(data: SupplierFormData): string[] {
  const errors: string[] = []

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name muss mindestens 2 Zeichen lang sein')
  }

  if (data.contact_email && !isValidEmail(data.contact_email)) {
    errors.push('Ungültiges E-Mail Format')
  }

  if (data.iban && !isValidIBAN(data.iban)) {
    errors.push('Ungültiges IBAN Format')
  }

  if (data.website && !isValidURL(data.website)) {
    errors.push('Ungültiges Website Format')
  }

  return errors
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function isValidIBAN(iban: string): boolean {
  const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9\s]{4,32}$/
  return ibanRegex.test(iban.replace(/\s/g, '').toUpperCase())
}

function isValidURL(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
