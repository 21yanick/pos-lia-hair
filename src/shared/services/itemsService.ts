/**
 * Items Service Functions
 * 
 * Pure business logic functions for product/service item operations
 * Extracted from useItems hook for React Query migration
 * 
 * Features:
 * - Multi-tenant security (organization-scoped)
 * - Comprehensive error handling
 * - CRUD operations for items
 * - Type safety with Database types
 * - Optimized for React Query caching
 */

'use client'

import { supabase } from '@/shared/lib/supabase/client'
import type { Database } from '@/types/supabase'

// ========================================
// Types
// ========================================

export type Item = Database['public']['Tables']['items']['Row']
export type ItemInsert = Omit<Database['public']['Tables']['items']['Insert'], 'id' | 'created_at'>
export type ItemUpdate = Partial<Omit<Database['public']['Tables']['items']['Update'], 'id' | 'created_at'>> & { id: string }

export type ItemsQueryResult = {
  success: true
  data: Item[]
} | {
  success: false
  error: string
}

export type ItemMutationResult = {
  success: true
  data: Item
} | {
  success: false
  error: string
}

export type ItemDeleteResult = {
  success: true
} | {
  success: false
  error: string
}

// ========================================
// Security & Validation
// ========================================

/**
 * Validate organization ID is provided
 */
export function validateOrganizationId(organizationId: string | undefined): string {
  if (!organizationId) {
    throw new Error('Keine Organization ausgewählt. Multi-Tenant Sicherheit verletzt.')
  }
  return organizationId
}

/**
 * Validate service-specific fields
 */
export function validateServiceData(itemData: ItemInsert | ItemUpdate): void {
  if (itemData.type === 'service') {
    // Services must have duration_minutes
    if (!itemData.duration_minutes || itemData.duration_minutes <= 0) {
      throw new Error('Services müssen eine gültige Dauer (in Minuten) haben.')
    }
    
    // Validate reasonable duration (5 minutes to 8 hours)
    if (itemData.duration_minutes < 5 || itemData.duration_minutes > 480) {
      throw new Error('Service-Dauer muss zwischen 5 und 480 Minuten liegen.')
    }
  } else if (itemData.type === 'product') {
    // Products should not have service-specific fields
    if (itemData.duration_minutes !== null && itemData.duration_minutes !== undefined) {
      throw new Error('Produkte dürfen keine Service-Dauer haben.')
    }
  }
}

/**
 * Apply service defaults for new items
 */
export function applyServiceDefaults(itemData: ItemInsert): ItemInsert {
  if (itemData.type === 'service') {
    return {
      ...itemData,
      requires_booking: itemData.requires_booking ?? true, // Services require booking by default
      booking_buffer_minutes: itemData.booking_buffer_minutes ?? 0 // No buffer by default
    }
  }
  
  return {
    ...itemData,
    duration_minutes: null,
    requires_booking: false,
    booking_buffer_minutes: 0
  }
}

/**
 * Get current user ID with validation
 */
export async function getCurrentUserId(): Promise<string> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) {
    throw new Error('Nicht angemeldet. Bitte melden Sie sich an.')
  }
  return userData.user.id
}

// ========================================
// Core Items Operations
// ========================================

/**
 * Get all items for an organization (excluding deleted items)
 */
export async function getItems(organizationId: string): Promise<Item[]> {
  const validOrgId = validateOrganizationId(organizationId)
  
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('organization_id', validOrgId)
    .neq('deleted', true) // Exclude deleted items
    .order('name')
  
  if (error) {
    // console.error('Error loading items:', error)
    throw new Error('Fehler beim Laden der Artikel')
  }
  
  return data || []
}

/**
 * Get active items only (for POS)
 */
export async function getActiveItems(organizationId: string): Promise<Item[]> {
  const validOrgId = validateOrganizationId(organizationId)
  
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('organization_id', validOrgId)
    .eq('active', true)
    .neq('deleted', true) // Exclude deleted items
    .order('name')
  
  if (error) {
    // console.error('Error loading active items:', error)
    throw new Error('Fehler beim Laden der aktiven Artikel')
  }
  
  return data || []
}

/**
 * Get favorite items only
 */
export async function getFavoriteItems(organizationId: string): Promise<Item[]> {
  const validOrgId = validateOrganizationId(organizationId)
  
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('organization_id', validOrgId)
    .eq('is_favorite', true)
    .eq('active', true)
    .neq('deleted', true) // Exclude deleted items
    .order('name')
  
  if (error) {
    // console.error('Error loading favorite items:', error)
    throw new Error('Fehler beim Laden der Favoriten-Artikel')
  }
  
  return data || []
}

/**
 * Search items by name or category
 */
export async function searchItems(
  organizationId: string, 
  query: string,
  activeOnly = true
): Promise<Item[]> {
  const validOrgId = validateOrganizationId(organizationId)
  
  let queryBuilder = supabase
    .from('items')
    .select('*')
    .eq('organization_id', validOrgId)
    .neq('deleted', true) // Always exclude deleted items
    .or(`name.ilike.%${query}%,category.ilike.%${query}%`)
  
  if (activeOnly) {
    queryBuilder = queryBuilder.eq('active', true)
  }
  
  const { data, error } = await queryBuilder.order('name')
  
  if (error) {
    // console.error('Error searching items:', error)
    throw new Error('Fehler bei der Artikel-Suche')
  }
  
  return data || []
}

// ========================================
// CRUD Operations
// ========================================

/**
 * Create a new item
 */
export async function createItem(
  itemData: ItemInsert, 
  organizationId: string
): Promise<ItemMutationResult> {
  try {
    const validOrgId = validateOrganizationId(organizationId)
    
    // Apply service defaults and validate
    const itemWithDefaults = applyServiceDefaults(itemData)
    validateServiceData(itemWithDefaults)
    
    // Prepare data with organization_id
    const completeItemData = {
      ...itemWithDefaults,
      organization_id: validOrgId
    }
    
    const { data, error } = await supabase
      .from('items')
      .insert(completeItemData)
      .select('*')
      .single()
    
    if (error) {
      // console.error('Error creating item:', error)
      throw error
    }
    
    return { success: true, data }
  } catch (err: any) {
    console.error('Error in createItem:', err)
    return { 
      success: false, 
      error: err.message || 'Fehler beim Erstellen des Artikels'
    }
  }
}

/**
 * Update an existing item
 */
export async function updateItem(
  itemUpdate: ItemUpdate, 
  organizationId: string
): Promise<ItemMutationResult> {
  try {
    const validOrgId = validateOrganizationId(organizationId)
    const { id, ...updateData } = itemUpdate
    
    // Validate service data if type is being updated or service fields are modified
    if (updateData.type || updateData.duration_minutes !== undefined) {
      validateServiceData(itemUpdate)
    }
    
    const { data, error } = await supabase
      .from('items')
      .update(updateData)
      .eq('id', id)
      .eq('organization_id', validOrgId) // Multi-tenant security
      .select('*')
      .single()
    
    if (error) {
      // console.error('Error updating item:', error)
      throw error
    }
    
    return { success: true, data }
  } catch (err: any) {
    console.error('Error in updateItem:', err)
    return { 
      success: false, 
      error: err.message || 'Fehler beim Aktualisieren des Artikels'
    }
  }
}

/**
 * Delete an item (Soft Delete)
 * Sets deleted = true instead of physical deletion to preserve referential integrity
 * This is different from active/inactive which controls POS vs appointment visibility
 */
export async function deleteItem(
  itemId: string, 
  organizationId: string
): Promise<ItemDeleteResult> {
  try {
    const validOrgId = validateOrganizationId(organizationId)
    
    // Soft delete: Set deleted = true instead of physical deletion
    // This preserves referential integrity with sale_items and appointment_services
    // while hiding the item from all lists
    const { error } = await supabase
      .from('items')
      .update({ deleted: true })
      .eq('id', itemId)
      .eq('organization_id', validOrgId) // Multi-tenant security
    
    if (error) {
      // console.error('Error deleting item:', error)
      throw error
    }
    
    return { success: true }
  } catch (err: any) {
    console.error('Error in deleteItem:', err)
    return { 
      success: false, 
      error: err.message || 'Fehler beim Löschen des Artikels'
    }
  }
}

/**
 * Restore a soft-deleted item
 * Sets deleted = false to restore the item to the lists
 */
export async function restoreItem(
  itemId: string, 
  organizationId: string
): Promise<ItemDeleteResult> {
  try {
    const validOrgId = validateOrganizationId(organizationId)
    
    const { error } = await supabase
      .from('items')
      .update({ deleted: false })
      .eq('id', itemId)
      .eq('organization_id', validOrgId) // Multi-tenant security
    
    if (error) {
      // console.error('Error restoring item:', error)
      throw error
    }
    
    return { success: true }
  } catch (err: any) {
    console.error('Error in restoreItem:', err)
    return { 
      success: false, 
      error: err.message || 'Fehler beim Wiederherstellen des Artikels'
    }
  }
}

// ========================================
// Toggle Operations
// ========================================

/**
 * Toggle item favorite status
 */
export async function toggleItemFavorite(
  itemId: string, 
  currentValue: boolean,
  organizationId: string
): Promise<ItemMutationResult> {
  try {
    const validOrgId = validateOrganizationId(organizationId)
    
    const { data, error } = await supabase
      .from('items')
      .update({ is_favorite: !currentValue })
      .eq('id', itemId)
      .eq('organization_id', validOrgId) // Multi-tenant security
      .select('*')
      .single()
    
    if (error) {
      // console.error('Error toggling favorite:', error)
      throw error
    }
    
    return { success: true, data }
  } catch (err: any) {
    console.error('Error in toggleItemFavorite:', err)
    return { 
      success: false, 
      error: err.message || 'Fehler beim Ändern des Favoriten-Status'
    }
  }
}

/**
 * Toggle item active status
 */
export async function toggleItemActive(
  itemId: string, 
  currentValue: boolean,
  organizationId: string
): Promise<ItemMutationResult> {
  try {
    const validOrgId = validateOrganizationId(organizationId)
    
    const { data, error } = await supabase
      .from('items')
      .update({ active: !currentValue })
      .eq('id', itemId)
      .eq('organization_id', validOrgId) // Multi-tenant security
      .select('*')
      .single()
    
    if (error) {
      // console.error('Error toggling active status:', error)
      throw error
    }
    
    return { success: true, data }
  } catch (err: any) {
    console.error('Error in toggleItemActive:', err)
    return { 
      success: false, 
      error: err.message || 'Fehler beim Ändern des Aktiv-Status'
    }
  }
}

// ========================================
// Bulk Operations
// ========================================

/**
 * Bulk update multiple items
 */
export async function bulkUpdateItems(
  updates: Array<{ id: string; data: Partial<ItemUpdate> }>,
  organizationId: string
): Promise<{ success: number; failed: number; errors: string[] }> {
  const validOrgId = validateOrganizationId(organizationId)
  const results = { success: 0, failed: 0, errors: [] as string[] }
  
  for (const update of updates) {
    try {
      const result = await updateItem(
        { id: update.id, ...update.data } as ItemUpdate, 
        validOrgId
      )
      
      if (result.success) {
        results.success++
      } else {
        results.failed++
        results.errors.push(`${update.id}: ${result.error}`)
      }
    } catch (err: any) {
      results.failed++
      results.errors.push(`${update.id}: ${err.message}`)
    }
  }
  
  return results
}

/**
 * Get items count by category
 */
export async function getItemsCountByCategory(organizationId: string): Promise<Record<string, number>> {
  const validOrgId = validateOrganizationId(organizationId)
  
  const { data, error } = await supabase
    .from('items')
    .select('category')
    .eq('organization_id', validOrgId)
    .eq('active', true)
    .neq('deleted', true) // Exclude deleted items
  
  if (error) {
    // console.error('Error getting items count by category:', error)
    throw new Error('Fehler beim Laden der Kategorie-Statistiken')
  }
  
  // Count items by category
  const counts: Record<string, number> = {}
  data?.forEach(item => {
    const category = item.category || 'Ohne Kategorie'
    counts[category] = (counts[category] || 0) + 1
  })
  
  return counts
}

// ========================================
// Cache Optimization Helpers
// ========================================

/**
 * Get items optimized for React Query caching
 * Returns data structured for optimal cache usage
 */
export async function getItemsOptimized(organizationId: string) {
  const items = await getItems(organizationId)
  
  return {
    items,
    metadata: {
      total: items.length,
      active: items.filter(item => item.active).length,
      favorites: items.filter(item => item.is_favorite).length,
      categories: [...new Set(items.map(item => item.category).filter(Boolean))],
      lastUpdated: new Date().toISOString()
    }
  }
}