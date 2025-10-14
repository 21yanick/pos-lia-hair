/**
 * Customer Service Functions
 *
 * Pure business logic functions for customer management operations
 * Multi-tenant secure with organization-scoped operations
 *
 * Features:
 * - Customer CRUD operations with multi-tenant security
 * - Customer notes management (flexible block system)
 * - Search functionality
 * - Comprehensive error handling
 */

'use client'

import { supabase } from '@/shared/lib/supabase/client'
import type { Database } from '@/types/database'

// ========================================
// Types
// ========================================

export type Customer = Database['public']['Tables']['customers']['Row']
export type CustomerInsert = Omit<
  Database['public']['Tables']['customers']['Insert'],
  'id' | 'created_at' | 'updated_at'
>
export type CustomerUpdate = Partial<
  Omit<Database['public']['Tables']['customers']['Update'], 'id' | 'created_at' | 'updated_at'>
> & { id: string }

export type CustomerNote = Database['public']['Tables']['customer_notes']['Row']
export type CustomerNoteInsert = Omit<
  Database['public']['Tables']['customer_notes']['Insert'],
  'id' | 'created_at' | 'updated_at'
>
export type CustomerNoteUpdate = Partial<
  Omit<Database['public']['Tables']['customer_notes']['Update'], 'id' | 'created_at' | 'updated_at'>
> & { id: string }

export interface CustomerWithNotes extends Customer {
  notes: CustomerNote[]
}

export type CustomerFormData = {
  name: string
  phone?: string
  email?: string
  // V6.1: Add missing is_active field (exists in database schema)
  is_active?: boolean | null
}

// ========================================
// Utility Functions
// ========================================

/**
 * Get current user ID from session
 */
async function getCurrentUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    throw new Error('Benutzer nicht authentifiziert')
  }
  return user.id
}

/**
 * Validate organization ID for multi-tenant security
 */
export function validateOrganizationId(organizationId: string | undefined): string {
  if (!organizationId) {
    throw new Error('Keine Organization ausgewählt. Multi-Tenant Sicherheit verletzt.')
  }
  return organizationId
}

// ========================================
// Customer CRUD Operations
// ========================================

/**
 * Get all customers for an organization
 */
export async function getCustomers(
  organizationId: string,
  options?: {
    active_only?: boolean
    search?: string
    limit?: number
    offset?: number
  }
): Promise<{ data: Customer[]; count: number }> {
  const validOrgId = validateOrganizationId(organizationId)

  let query = supabase
    .from('customers')
    .select('*', { count: 'exact' })
    .eq('organization_id', validOrgId) // 🔒 Multi-Tenant Security
    .order('name', { ascending: true })

  if (options?.active_only) {
    query = query.eq('is_active', true)
  }

  if (options?.search) {
    query = query.or(
      `name.ilike.%${options.search}%,phone.ilike.%${options.search}%,email.ilike.%${options.search}%`
    )
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 50) - 1)
  }

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Error fetching customers: ${error.message}`)
  }

  return { data: data || [], count: count || 0 }
}

/**
 * Search customers by name, phone, or email
 */
export async function searchCustomers(
  organizationId: string,
  query: string,
  filter: 'active' | 'archived' | 'all' = 'active'
): Promise<Customer[]> {
  if (!query || query.length < 2) {
    return []
  }

  const validOrgId = validateOrganizationId(organizationId)

  let queryBuilder = supabase
    .from('customers')
    .select('*')
    .eq('organization_id', validOrgId) // 🔒 Multi-Tenant Security
    .or(`name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)

  // Filter anwenden
  if (filter === 'active') {
    queryBuilder = queryBuilder.eq('is_active', true)
  } else if (filter === 'archived') {
    queryBuilder = queryBuilder.eq('is_active', false)
  }
  // 'all' → kein Filter

  const { data, error } = await queryBuilder.order('name', { ascending: true }).limit(10)

  if (error) {
    throw new Error(`Error searching customers: ${error.message}`)
  }

  return data || []
}

/**
 * Get customer by ID
 */
export async function getCustomerById(
  id: string,
  organizationId: string
): Promise<Customer | null> {
  const validOrgId = validateOrganizationId(organizationId)

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .eq('organization_id', validOrgId) // 🔒 Multi-Tenant Security
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw new Error(`Error fetching customer: ${error.message}`)
  }

  return data
}

/**
 * Create new customer
 */
export async function createCustomer(
  organizationId: string,
  data: CustomerFormData
): Promise<Customer> {
  const validOrgId = validateOrganizationId(organizationId)
  const userId = await getCurrentUserId()

  const customerData: CustomerInsert = {
    name: data.name,
    phone: data.phone || null,
    email: data.email || null,
    organization_id: validOrgId,
    created_by: userId,
    is_active: true,
  }

  const { data: customer, error } = await supabase
    .from('customers')
    .insert(customerData)
    .select()
    .single()

  if (error) {
    throw new Error(`Error creating customer: ${error.message}`)
  }

  return customer
}

/**
 * Update customer
 */
export async function updateCustomer(
  customerId: string,
  data: Partial<CustomerFormData>,
  organizationId: string
): Promise<Customer> {
  const validOrgId = validateOrganizationId(organizationId)

  const updateData: Partial<CustomerInsert> = {
    ...data,
    // V6.1 Pattern 18: Type Guard - updated_at auto-managed by database, removed from manual updates
  }

  // Only explicitly set phone/email to null if they were provided in the update
  if ('phone' in data) {
    updateData.phone = data.phone || null
  }
  if ('email' in data) {
    updateData.email = data.email || null
  }

  const { data: customer, error } = await supabase
    .from('customers')
    .update(updateData)
    .eq('id', customerId)
    .eq('organization_id', validOrgId) // 🔒 Multi-Tenant Security
    .select()
    .single()

  if (error) {
    throw new Error(`Error updating customer: ${error.message}`)
  }

  return customer
}

/**
 * Delete customer only if no sales exist (Protected Delete)
 * Returns error with sales count if customer has sales
 */
export async function deleteCustomerProtected(
  customerId: string,
  organizationId: string
): Promise<{ success: true } | { success: false; salesCount: number; error: string }> {
  const validOrgId = validateOrganizationId(organizationId)

  // 1. Count customer sales (completed + cancelled)
  const { count, error: countError } = await supabase
    .from('sales')
    .select('id', { count: 'exact', head: true })
    .eq('customer_id', customerId)
    .eq('organization_id', validOrgId)
    .in('status', ['completed', 'cancelled'])

  if (countError) {
    throw new Error(`Error counting customer sales: ${countError.message}`)
  }

  const salesCount = count || 0

  // 2. Block deletion if sales exist
  if (salesCount > 0) {
    return {
      success: false,
      salesCount,
      error: `Dieser Kunde hat ${salesCount} Verkauf${salesCount !== 1 ? 'e' : ''}. Bitte löschen Sie zuerst die Verkäufe oder ordnen Sie sie einem anderen Kunden zu.`,
    }
  }

  // 3. Hard Delete (CASCADE deletes customer_notes automatically)
  const { error: deleteError } = await supabase
    .from('customers')
    .delete()
    .eq('id', customerId)
    .eq('organization_id', validOrgId) // 🔒 Multi-Tenant Security

  if (deleteError) {
    throw new Error(`Error deleting customer: ${deleteError.message}`)
  }

  return { success: true }
}

// ========================================
// Customer with Notes Operations
// ========================================

/**
 * Get customer with all notes
 */
export async function getCustomerWithNotes(
  customerId: string,
  organizationId: string
): Promise<CustomerWithNotes | null> {
  const validOrgId = validateOrganizationId(organizationId)

  // Get customer
  const customer = await getCustomerById(customerId, validOrgId)
  if (!customer) return null

  // Get notes
  const { data: notes, error } = await supabase
    .from('customer_notes')
    .select('*')
    .eq('customer_id', customerId)
    .eq('organization_id', validOrgId) // 🔒 Multi-Tenant Security
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Error fetching customer notes: ${error.message}`)
  }

  return {
    ...customer,
    notes: notes || [],
  }
}

// ========================================
// Customer Notes Operations
// ========================================

/**
 * Create customer note
 */
export async function createCustomerNote(
  customerId: string,
  blockName: string,
  content: string,
  organizationId: string
): Promise<CustomerNote> {
  const validOrgId = validateOrganizationId(organizationId)
  const userId = await getCurrentUserId()

  const noteData: CustomerNoteInsert = {
    customer_id: customerId,
    block_name: blockName,
    content: content,
    organization_id: validOrgId,
    created_by: userId,
  }

  const { data: note, error } = await supabase
    .from('customer_notes')
    .insert(noteData)
    .select()
    .single()

  if (error) {
    throw new Error(`Error creating customer note: ${error.message}`)
  }

  return note
}

/**
 * Update customer note
 */
export async function updateCustomerNote(
  noteId: string,
  data: { block_name?: string; content?: string },
  organizationId: string
): Promise<CustomerNote> {
  const validOrgId = validateOrganizationId(organizationId)

  const updateData = {
    ...data,
    updated_at: new Date().toISOString(),
  }

  const { data: note, error } = await supabase
    .from('customer_notes')
    .update(updateData)
    .eq('id', noteId)
    .eq('organization_id', validOrgId) // 🔒 Multi-Tenant Security
    .select()
    .single()

  if (error) {
    throw new Error(`Error updating customer note: ${error.message}`)
  }

  return note
}

/**
 * Delete customer note
 */
export async function deleteCustomerNote(noteId: string, organizationId: string): Promise<void> {
  const validOrgId = validateOrganizationId(organizationId)

  const { error } = await supabase
    .from('customer_notes')
    .delete()
    .eq('id', noteId)
    .eq('organization_id', validOrgId) // 🔒 Multi-Tenant Security

  if (error) {
    throw new Error(`Error deleting customer note: ${error.message}`)
  }
}
