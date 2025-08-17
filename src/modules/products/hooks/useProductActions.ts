'use client'

import { useCallback } from 'react'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import { type Item, type ItemInsert, useItems } from '@/shared/hooks/business/useItems'
import { useToast } from '@/shared/hooks/core/useToast'

export interface ProductFormData {
  name: string
  type: 'service' | 'product'
  default_price: string
  is_favorite: boolean
  active: boolean
  // Service-specific fields
  duration_minutes: string
  requires_booking: boolean
  booking_buffer_minutes: string
}

interface UseProductActionsReturn {
  // CRUD Actions - Performance optimiert mit useCallback
  handleSaveItem: (formData: ProductFormData, currentItem: Item | null) => Promise<boolean>
  handleToggleFavorite: (id: string, currentValue: boolean) => Promise<void>
  handleToggleActive: (id: string, currentValue: boolean) => Promise<void>
  handleDeleteItem: (id: string) => Promise<void>
  handleManualSync: () => Promise<void>

  // Loading states
  isSubmitting: boolean
}

export function useProductActions(): UseProductActionsReturn {
  const { toast } = useToast()
  const { currentOrganization } = useCurrentOrganization()
  const { addItem, updateItem, toggleFavorite, toggleActive, deleteItem, syncAuthUser, loading } =
    useItems()

  // 🚀 Performance-optimierter Save Handler
  const handleSaveItem = useCallback(
    async (formData: ProductFormData, currentItem: Item | null): Promise<boolean> => {
      try {
        // TypeScript-Fehler behoben: organization_id hinzugefügt
        const itemData: ItemInsert = {
          name: formData.name,
          type: formData.type,
          default_price: parseFloat(formData.default_price),
          is_favorite: formData.is_favorite,
          active: formData.active,
          organization_id: currentOrganization?.id || '', // 🔧 TypeScript-Fix
          // Service-specific fields
          duration_minutes:
            formData.type === 'service' && formData.duration_minutes
              ? parseInt(formData.duration_minutes)
              : null,
          requires_booking: formData.type === 'service' ? formData.requires_booking : false,
          booking_buffer_minutes:
            formData.type === 'service' && formData.booking_buffer_minutes
              ? parseInt(formData.booking_buffer_minutes)
              : 0,
        }

        if (currentItem) {
          // Update existing item
          const { error } = await updateItem({
            id: currentItem.id,
            ...itemData,
          })

          if (error) {
            toast({
              title: 'Fehler',
              description: `Fehler beim Aktualisieren: ${error}`,
              variant: 'destructive',
            })
            return false
          }

          toast({
            title: 'Erfolg',
            description: 'Produkt erfolgreich aktualisiert',
          })
        } else {
          // Add new item
          const { error } = await addItem(itemData)

          if (error) {
            toast({
              title: 'Fehler',
              description: `Fehler beim Hinzufügen: ${error}`,
              variant: 'destructive',
            })
            return false
          }

          toast({
            title: 'Erfolg',
            description: 'Produkt erfolgreich hinzugefügt',
          })
        }

        return true
      } catch (err) {
        console.error('Fehler beim Speichern:', err)
        toast({
          title: 'Fehler',
          description: 'Ein unerwarteter Fehler ist aufgetreten',
          variant: 'destructive',
        })
        return false
      }
    },
    [addItem, updateItem, currentOrganization?.id, toast]
  )

  // 🚀 Performance-optimierter Favorite Toggle
  const handleToggleFavorite = useCallback(
    async (id: string, currentValue: boolean) => {
      const { error } = await toggleFavorite(id, currentValue)

      if (error) {
        toast({
          title: 'Fehler',
          description: `Fehler beim Ändern des Favoriten-Status: ${error}`,
          variant: 'destructive',
        })
      }
    },
    [toggleFavorite, toast]
  )

  // 🚀 Performance-optimierter Active Toggle
  const handleToggleActive = useCallback(
    async (id: string, currentValue: boolean) => {
      const { error } = await toggleActive(id, currentValue)

      if (error) {
        toast({
          title: 'Fehler',
          description: `Fehler beim Ändern des Aktiv-Status: ${error}`,
          variant: 'destructive',
        })
      }
    },
    [toggleActive, toast]
  )

  // 🚀 Performance-optimierter Delete Handler
  const handleDeleteItem = useCallback(
    async (id: string) => {
      if (confirm('Sind Sie sicher, dass Sie dieses Produkt löschen möchten?')) {
        const { error } = await deleteItem(id)

        if (error) {
          toast({
            title: 'Fehler',
            description: `Fehler beim Löschen: ${error}`,
            variant: 'destructive',
          })
        } else {
          toast({
            title: 'Erfolg',
            description: 'Produkt erfolgreich gelöscht',
          })
        }
      }
    },
    [deleteItem, toast]
  )

  // 🚀 Performance-optimierter Manual Sync
  const handleManualSync = useCallback(async () => {
    try {
      const result = await syncAuthUser()
      if (result.success) {
        toast({
          title: 'Erfolg',
          description: 'Synchronisierung erfolgreich! Die Seite wird neu geladen...',
        })
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        toast({
          title: 'Fehler',
          description: `Fehler: ${result.error}`,
          variant: 'destructive',
        })
      }
    } catch (err: any) {
      toast({
        title: 'Fehler',
        description: `Fehler: ${err.message}`,
        variant: 'destructive',
      })
    }
  }, [syncAuthUser, toast])

  return {
    handleSaveItem,
    handleToggleFavorite,
    handleToggleActive,
    handleDeleteItem,
    handleManualSync,
    isSubmitting: loading,
  }
}
