'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import { cacheConfig, queryKeys } from '@/shared/lib/react-query'
import { ensureUserExists, syncAuthUser } from '@/shared/services/authService'
import {
  createItem,
  deleteItem,
  getItemsOptimized,
  type Item,
  type ItemInsert,
  type ItemUpdate,
  toggleItemActive,
  toggleItemFavorite,
  updateItem,
} from '@/shared/services/itemsService'

/**
 * React Query-powered Items Hook
 *
 * Features:
 * - Smart caching for product catalog (15min stale time)
 * - Optimistic updates for instant CRUD feedback
 * - Automatic cache invalidation and synchronization
 * - Multi-tenant security
 * - Legacy-compatible interface
 * - Auth user synchronization
 *
 * Performance Optimizations:
 * - High cache potential (products change rarely)
 * - Parallel queries where possible
 * - Smart invalidation strategies
 * - Background refetching for data freshness
 */

interface UseItemsQueryReturn {
  // State Management (Legacy Compatible)
  items: Item[]
  loading: boolean
  error: string | null

  // CRUD Operations (Legacy Compatible)
  addItem: (newItem: ItemInsert) => Promise<{ data: Item | null; error: string | null }>
  updateItem: (updatedItem: ItemUpdate) => Promise<{ data: Item | null; error: string | null }>
  deleteItem: (id: string) => Promise<{ error: string | null }>

  // Toggle Operations (Legacy Compatible)
  toggleFavorite: (
    id: string,
    currentValue: boolean
  ) => Promise<{ data: Item | null; error: string | null }>
  toggleActive: (
    id: string,
    currentValue: boolean
  ) => Promise<{ data: Item | null; error: string | null }>

  // Auth Operations (Legacy Compatible)
  syncAuthUser: () => Promise<{ success: boolean; error?: string; user?: unknown }>
}

export function useItemsQuery(): UseItemsQueryReturn {
  const { currentOrganization } = useCurrentOrganization()
  const queryClient = useQueryClient()

  // Local state for legacy compatibility
  const [error, setError] = useState<string | null>(null)

  const organizationId = currentOrganization?.id

  if (process.env.NODE_ENV === 'development') {
    // console.log('🟢 Using React Query Items Hook')
  }

  // ========================================
  // Query: Items List with Auto-Sync
  // ========================================
  const {
    data: items = [],
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: queryKeys.business.items.optimized(organizationId || ''),
    queryFn: async () => {
      if (!organizationId) {
        throw new Error('No organization selected')
      }

      // Auto-sync user if needed (with retry logic)
      try {
        const syncResult = await ensureUserExists(2)
        if (!syncResult.success) {
          // console.warn('User sync failed but continuing with items load:', syncResult.error)
        }
      } catch (_syncError) {
        // console.warn('User sync error but continuing:', syncError)
      }

      // Load items (this will throw if user doesn't have access)
      const optimizedData = await getItemsOptimized(organizationId)
      return optimizedData.items
    },
    enabled: !!organizationId,
    staleTime: cacheConfig.items.staleTime, // 15 minutes
    gcTime: cacheConfig.items.gcTime, // 1 hour
    retry: (failureCount, error: unknown) => {
      // Don't retry on permission errors
      if (
        error instanceof Error &&
        (error.message.includes('organization') || error.message.includes('401'))
      ) {
        return false
      }
      return failureCount < 2
    },
    meta: {
      errorMessage: 'Fehler beim Laden der Artikel',
    },
  })

  // ========================================
  // Mutation: Create Item
  // ========================================
  const createItemMutation = useMutation({
    mutationFn: async (newItem: ItemInsert) => {
      if (!organizationId) {
        throw new Error('No organization selected')
      }

      const result = await createItem(newItem, organizationId)

      if (!result.success) {
        throw new Error(result.error)
      }

      return result.data
    },
    onMutate: async (newItem) => {
      if (!organizationId) return

      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.business.items.all(organizationId),
      })

      // Snapshot the previous value
      const previousItems = queryClient.getQueryData(
        queryKeys.business.items.optimized(organizationId)
      ) as Item[]

      // Create optimistic item
      const optimisticItem: Item = {
        id: `temp-${Date.now()}`,
        name: newItem.name,
        default_price: newItem.default_price || 0, // V6.1 Pattern 19: Schema Property Alignment - price → default_price
        type: newItem.type,
        duration_minutes: newItem.duration_minutes || null, // V6.1 Pattern 19: Schema Property Alignment - use database columns
        active: newItem.active ?? true,
        is_favorite: newItem.is_favorite ?? false,
        organization_id: organizationId,
        created_at: new Date().toISOString(),
        booking_buffer_minutes: newItem.booking_buffer_minutes || null, // V6.1 Pattern 19: Schema Property Alignment
        deleted: newItem.deleted ?? false, // V6.1 Pattern 19: Schema Property Alignment
        requires_booking: newItem.requires_booking ?? false, // V6.1 Pattern 19: Schema Property Alignment
      }

      // Optimistically update the cache
      queryClient.setQueryData(
        queryKeys.business.items.optimized(organizationId),
        (old: Item[] = []) => [...old, optimisticItem]
      )

      // Return context with the snapshotted value
      return { previousItems, optimisticItem }
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousItems && organizationId) {
        queryClient.setQueryData(
          queryKeys.business.items.optimized(organizationId),
          context.previousItems
        )
      }

      setError(error.message || 'Fehler beim Hinzufügen des Artikels')
      toast.error(error.message || 'Fehler beim Hinzufügen des Artikels')
    },
    onSuccess: () => {
      setError(null)
      toast.success('Artikel erfolgreich hinzugefügt')

      if (process.env.NODE_ENV === 'development') {
        // console.log('🟢 React Query: Item created')
      }
    },
    onSettled: () => {
      // Always refetch after mutation to ensure data consistency
      if (organizationId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.business.items.all(organizationId),
        })
      }
    },
  })

  // ========================================
  // Mutation: Update Item
  // ========================================
  const updateItemMutation = useMutation({
    mutationFn: async (updatedItem: ItemUpdate) => {
      if (!organizationId) {
        throw new Error('No organization selected')
      }

      const result = await updateItem(updatedItem, organizationId)

      if (!result.success) {
        throw new Error(result.error)
      }

      return result.data
    },
    onMutate: async (updatedItem) => {
      if (!organizationId) return

      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.business.items.all(organizationId),
      })

      // Snapshot the previous value
      const previousItems = queryClient.getQueryData(
        queryKeys.business.items.optimized(organizationId)
      ) as Item[]

      // Optimistically update the item
      queryClient.setQueryData(
        queryKeys.business.items.optimized(organizationId),
        (old: Item[] = []) =>
          old.map((item) =>
            item.id === updatedItem.id
              ? { ...item, ...updatedItem, updated_at: new Date().toISOString() }
              : item
          )
      )

      // Return context with the snapshotted value
      return { previousItems }
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousItems && organizationId) {
        queryClient.setQueryData(
          queryKeys.business.items.optimized(organizationId),
          context.previousItems
        )
      }

      setError(error.message || 'Fehler beim Aktualisieren des Artikels')
      toast.error(error.message || 'Fehler beim Aktualisieren des Artikels')
    },
    onSuccess: () => {
      setError(null)
      toast.success('Artikel erfolgreich aktualisiert')
    },
    onSettled: () => {
      // Always refetch after mutation
      if (organizationId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.business.items.all(organizationId),
        })
      }
    },
  })

  // ========================================
  // Mutation: Delete Item
  // ========================================
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      if (!organizationId) {
        throw new Error('No organization selected')
      }

      const result = await deleteItem(itemId, organizationId)

      if (!result.success) {
        throw new Error(result.error)
      }

      return itemId
    },
    onMutate: async (itemId) => {
      if (!organizationId) return

      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.business.items.all(organizationId),
      })

      // Snapshot the previous value
      const previousItems = queryClient.getQueryData(
        queryKeys.business.items.optimized(organizationId)
      ) as Item[]

      // Optimistically remove the item
      queryClient.setQueryData(
        queryKeys.business.items.optimized(organizationId),
        (old: Item[] = []) => old.filter((item) => item.id !== itemId)
      )

      // Return context with the snapshotted value
      return { previousItems }
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousItems && organizationId) {
        queryClient.setQueryData(
          queryKeys.business.items.optimized(organizationId),
          context.previousItems
        )
      }

      setError(error.message || 'Fehler beim Löschen des Artikels')
      toast.error(error.message || 'Fehler beim Löschen des Artikels')
    },
    onSuccess: () => {
      setError(null)
      toast.success('Artikel erfolgreich gelöscht')
    },
    onSettled: () => {
      // Always refetch after mutation
      if (organizationId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.business.items.all(organizationId),
        })
      }
    },
  })

  // ========================================
  // Mutation: Toggle Favorite
  // ========================================
  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ id, currentValue }: { id: string; currentValue: boolean }) => {
      if (!organizationId) {
        throw new Error('No organization selected')
      }

      const result = await toggleItemFavorite(id, currentValue, organizationId)

      if (!result.success) {
        throw new Error(result.error)
      }

      return result.data
    },
    onMutate: async ({ id, currentValue }) => {
      if (!organizationId) return

      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.business.items.all(organizationId),
      })

      // Snapshot the previous value
      const previousItems = queryClient.getQueryData(
        queryKeys.business.items.optimized(organizationId)
      ) as Item[]

      // Optimistically update the favorite status
      queryClient.setQueryData(
        queryKeys.business.items.optimized(organizationId),
        (old: Item[] = []) =>
          old.map((item) =>
            item.id === id
              ? { ...item, is_favorite: !currentValue, updated_at: new Date().toISOString() }
              : item
          )
      )

      // Return context with the snapshotted value
      return { previousItems }
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousItems && organizationId) {
        queryClient.setQueryData(
          queryKeys.business.items.optimized(organizationId),
          context.previousItems
        )
      }

      setError(error.message || 'Fehler beim Ändern des Favoriten-Status')
    },
    onSuccess: () => {
      setError(null)
    },
    onSettled: () => {
      // Invalidate favorites list
      if (organizationId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.business.items.favorites(organizationId),
        })
      }
    },
  })

  // ========================================
  // Mutation: Toggle Active
  // ========================================
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, currentValue }: { id: string; currentValue: boolean }) => {
      if (!organizationId) {
        throw new Error('No organization selected')
      }

      const result = await toggleItemActive(id, currentValue, organizationId)

      if (!result.success) {
        throw new Error(result.error)
      }

      return result.data
    },
    onMutate: async ({ id, currentValue }) => {
      if (!organizationId) return

      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.business.items.all(organizationId),
      })

      // Snapshot the previous value
      const previousItems = queryClient.getQueryData(
        queryKeys.business.items.optimized(organizationId)
      ) as Item[]

      // Optimistically update the active status
      queryClient.setQueryData(
        queryKeys.business.items.optimized(organizationId),
        (old: Item[] = []) =>
          old.map((item) =>
            item.id === id
              ? { ...item, active: !currentValue, updated_at: new Date().toISOString() }
              : item
          )
      )

      // Return context with the snapshotted value
      return { previousItems }
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousItems && organizationId) {
        queryClient.setQueryData(
          queryKeys.business.items.optimized(organizationId),
          context.previousItems
        )
      }

      setError(error.message || 'Fehler beim Ändern des Aktiv-Status')
    },
    onSuccess: () => {
      setError(null)
    },
    onSettled: () => {
      // Invalidate active items list
      if (organizationId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.business.items.active(organizationId),
        })
      }
    },
  })

  // ========================================
  // Legacy Compatible Functions
  // ========================================

  // Add Item (Legacy Compatible)
  const addItem = async (newItem: ItemInsert) => {
    try {
      const result = await createItemMutation.mutateAsync(newItem)
      return { data: result, error: null }
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err.message : 'Fehler beim Hinzufügen' }
    }
  }

  // Update Item (Legacy Compatible)
  const updateItemLegacy = async (updatedItem: ItemUpdate) => {
    try {
      const result = await updateItemMutation.mutateAsync(updatedItem)
      return { data: result, error: null }
    } catch (err: unknown) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Fehler bei der Aktualisierung',
      }
    }
  }

  // Delete Item (Legacy Compatible)
  const deleteItemLegacy = async (id: string) => {
    try {
      await deleteItemMutation.mutateAsync(id)
      return { error: null }
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Fehler beim Löschen' }
    }
  }

  // Toggle Favorite (Legacy Compatible)
  const toggleFavorite = async (id: string, currentValue: boolean) => {
    try {
      const result = await toggleFavoriteMutation.mutateAsync({ id, currentValue })
      return { data: result, error: null }
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err.message : 'Fehler beim Aktualisieren' }
    }
  }

  // Toggle Active (Legacy Compatible)
  const toggleActive = async (id: string, currentValue: boolean) => {
    try {
      const result = await toggleActiveMutation.mutateAsync({ id, currentValue })
      return { data: result, error: null }
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err.message : 'Fehler beim Aktualisieren' }
    }
  }

  // Sync Auth User (Legacy Compatible)
  const syncAuthUserLegacy = async () => {
    try {
      const result = await syncAuthUser()
      return result
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Fehler bei der Synchronisierung',
      }
    }
  }

  // ========================================
  // Combined Loading and Error States
  // ========================================
  const loading =
    isLoading ||
    createItemMutation.isPending ||
    updateItemMutation.isPending ||
    deleteItemMutation.isPending ||
    toggleFavoriteMutation.isPending ||
    toggleActiveMutation.isPending

  const combinedError = error || (queryError instanceof Error ? queryError.message : null) || null // V6.1 Pattern 17: Null Safety - safe error message access

  // ========================================
  // Return Interface (Legacy Compatible)
  // ========================================
  return {
    // State Management (Legacy Compatible)
    items,
    loading,
    error: combinedError,

    // CRUD Operations (Legacy Compatible)
    addItem,
    updateItem: updateItemLegacy,
    deleteItem: deleteItemLegacy,

    // Toggle Operations (Legacy Compatible)
    toggleFavorite,
    toggleActive,

    // Auth Operations (Legacy Compatible)
    syncAuthUser: syncAuthUserLegacy,
  }
}
