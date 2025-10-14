'use client'

import { useCallback } from 'react'
import { toast } from 'sonner'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import { type Item, type ItemInsert, useItems } from '@/shared/hooks/business/useItems'

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
              ? parseInt(formData.duration_minutes, 10)
              : null,
          requires_booking: formData.type === 'service' ? formData.requires_booking : false,
          booking_buffer_minutes:
            formData.type === 'service' && formData.booking_buffer_minutes
              ? parseInt(formData.booking_buffer_minutes, 10)
              : 0,
        }

        if (currentItem) {
          // Update existing item
          const { error } = await updateItem({
            id: currentItem.id,
            ...itemData,
          })

          if (error) {
            toast.error('Fehler', {
              description: `Fehler beim Aktualisieren: ${error}`,
            })
            return false
          }

          toast.success('Erfolg', {
            description: 'Produkt erfolgreich aktualisiert',
          })
        } else {
          // Add new item
          const { error } = await addItem(itemData)

          if (error) {
            toast.error('Fehler', {
              description: `Fehler beim Hinzufügen: ${error}`,
            })
            return false
          }

          toast.success('Erfolg', {
            description: 'Produkt erfolgreich hinzugefügt',
          })
        }

        return true
      } catch (err) {
        console.error('Fehler beim Speichern:', err)
        toast.error('Fehler', {
          description: 'Ein unerwarteter Fehler ist aufgetreten',
        })
        return false
      }
    },
    [addItem, updateItem, currentOrganization?.id]
  )

  // 🚀 Performance-optimierter Favorite Toggle
  const handleToggleFavorite = useCallback(
    async (id: string, currentValue: boolean) => {
      const { error } = await toggleFavorite(id, currentValue)

      if (error) {
        toast.error('Fehler', {
          description: `Fehler beim Ändern des Favoriten-Status: ${error}`,
        })
      }
    },
    [toggleFavorite]
  )

  const handleToggleActive = useCallback(
    async (id: string, currentValue: boolean) => {
      const { error } = await toggleActive(id, currentValue)

      if (error) {
        toast.error('Fehler', {
          description: `Fehler beim Ändern des Aktiv-Status: ${error}`,
        })
      }
    },
    [toggleActive]
  )

  const handleDeleteItem = useCallback(
    async (id: string) => {
      if (confirm('Sind Sie sicher, dass Sie dieses Produkt löschen möchten?')) {
        const { error } = await deleteItem(id)

        if (error) {
          toast.error('Fehler', {
            description: `Fehler beim Löschen: ${error}`,
          })
        } else {
          toast.success('Erfolg', {
            description: 'Produkt erfolgreich gelöscht',
          })
        }
      }
    },
    [deleteItem]
  )

  const handleManualSync = useCallback(async () => {
    try {
      const result = await syncAuthUser()
      if (result.success) {
        toast.success('Erfolg', {
          description: 'Synchronisierung erfolgreich! Die Seite wird neu geladen...',
        })
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        toast.error('Fehler', {
          description: `Fehler: ${result.error}`,
        })
      }
    } catch (err: unknown) {
      toast.error('Fehler', {
        description: `Fehler: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`,
      })
    }
  }, [syncAuthUser])

  return {
    handleSaveItem,
    handleToggleFavorite,
    handleToggleActive,
    handleDeleteItem,
    handleManualSync,
    isSubmitting: loading,
  }
}
