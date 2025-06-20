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
 * Get all items for an organization
 */
export async function getItems(organizationId: string): Promise<Item[]> {
  const validOrgId = validateOrganizationId(organizationId)
  
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('organization_id', validOrgId)
    .order('name')
  
  if (error) {
    console.error('Error loading items:', error)
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
    .order('name')
  
  if (error) {
    console.error('Error loading active items:', error)
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
    .order('name')
  
  if (error) {
    console.error('Error loading favorite items:', error)
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
    .or(`name.ilike.%${query}%,category.ilike.%${query}%`)
  
  if (activeOnly) {
    queryBuilder = queryBuilder.eq('active', true)
  }
  
  const { data, error } = await queryBuilder.order('name')
  
  if (error) {
    console.error('Error searching items:', error)
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
    
    // Prepare data with organization_id
    const completeItemData = {
      ...itemData,
      organization_id: validOrgId
    }
    
    const { data, error } = await supabase
      .from('items')
      .insert(completeItemData)
      .select('*')
      .single()
    
    if (error) {
      console.error('Error creating item:', error)
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
    
    const { data, error } = await supabase
      .from('items')
      .update(updateData)
      .eq('id', id)
      .eq('organization_id', validOrgId) // Multi-tenant security
      .select('*')
      .single()
    
    if (error) {
      console.error('Error updating item:', error)
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
 * Delete an item
 */
export async function deleteItem(
  itemId: string, 
  organizationId: string
): Promise<ItemDeleteResult> {
  try {
    const validOrgId = validateOrganizationId(organizationId)
    
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId)
      .eq('organization_id', validOrgId) // Multi-tenant security
    
    if (error) {
      console.error('Error deleting item:', error)
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
      console.error('Error toggling favorite:', error)
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
      console.error('Error toggling active status:', error)
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
  
  if (error) {
    console.error('Error getting items count by category:', error)
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