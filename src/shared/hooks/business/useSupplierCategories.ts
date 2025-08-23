'use client'

import { useCallback, useMemo } from 'react'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import { upsertBusinessSettings } from '@/shared/services/businessSettingsService'
import { SUPPLIER_CATEGORIES } from '@/shared/types/suppliers'
import { useBusinessSettings } from './useBusinessSettings'

// Default Supplier Categories (from existing types)
const DEFAULT_SUPPLIER_CATEGORIES: Record<string, string> = SUPPLIER_CATEGORIES

export function useSupplierCategories() {
  const { settings: businessSettings, loading, loadSettings: refetch } = useBusinessSettings()
  const error = null // useBusinessSettings doesn't provide error, so we set it to null

  // 🔒 SECURITY: Multi-Tenant Organization Context
  const { currentOrganization } = useCurrentOrganization()

  // Kombinierte Kategorien: Default + Custom
  const categories = useMemo(() => {
    const customCategories = businessSettings?.custom_supplier_categories || {}
    return {
      ...DEFAULT_SUPPLIER_CATEGORIES,
      ...customCategories,
    }
  }, [businessSettings?.custom_supplier_categories])

  // Kategorien als Array für UI
  const categoriesArray = useMemo(() => {
    return Object.entries(categories).map(([key, label]) => ({
      key,
      label,
      isDefault: key in DEFAULT_SUPPLIER_CATEGORIES,
    }))
  }, [categories])

  // Custom Kategorien hinzufügen
  const addCategory = useCallback(
    async (key: string, label: string) => {
      // 🔒 CRITICAL SECURITY: Organization required
      if (!currentOrganization) {
        return { success: false, error: 'Keine Organization ausgewählt.' }
      }

      if (!businessSettings) {
        // Erstelle Default Business Settings falls keine existieren
        try {
          const defaultSettings = {
            company_name: 'Mein Unternehmen',
            default_currency: 'CHF',
            tax_rate: 7.7,
            pdf_show_logo: true,
            pdf_show_company_details: true,
            custom_expense_categories: {},
            custom_supplier_categories: {},
          }

          await upsertBusinessSettings(defaultSettings)
          await refetch() // Lade Settings neu

          // Versuche es nochmal nach dem Erstellen
          const updatedCustomCategories = { [key]: label }

          await upsertBusinessSettings({
            ...defaultSettings,
            custom_supplier_categories: updatedCustomCategories,
          })

          await refetch()
          return { success: true }
        } catch (err: unknown) {
          console.error('Error creating business settings:', err)
          return {
            success: false,
            error: `Could not create business settings: ${err instanceof Error ? err.message : String(err)}`,
          }
        }
      }

      // Validierung
      if (key in DEFAULT_SUPPLIER_CATEGORIES) {
        return { success: false, error: 'Key conflicts with default category' }
      }

      if (key in (businessSettings.custom_supplier_categories || {})) {
        return { success: false, error: 'Category already exists' }
      }

      try {
        const updatedCustomCategories = {
          ...businessSettings.custom_supplier_categories,
          [key]: label,
        }

        // V6.1 Pattern 21: Database to Form Data Transformation
        await upsertBusinessSettings({
          ...businessSettings,
          // Ensure form-safe string values (never null)
          company_name: businessSettings.company_name ?? '',
          company_tagline: businessSettings.company_tagline ?? '',
          company_address: businessSettings.company_address ?? '',
          company_postal_code: businessSettings.company_postal_code ?? '',
          company_city: businessSettings.company_city ?? '',
          company_phone: businessSettings.company_phone ?? '',
          company_email: businessSettings.company_email ?? '',
          company_website: businessSettings.company_website ?? '',
          company_uid: businessSettings.company_uid ?? '',
          custom_supplier_categories: updatedCustomCategories,
        })

        await refetch()
        return { success: true }
      } catch (err: unknown) {
        console.error('Error in addCategory:', err)
        return { success: false, error: err instanceof Error ? err.message : String(err) } // V6.1: Unknown error handling
      }
    },
    [businessSettings, refetch, currentOrganization]
  )

  // Custom Kategorie aktualisieren
  const updateCategory = useCallback(
    async (key: string, newLabel: string) => {
      // 🔒 CRITICAL SECURITY: Organization required
      if (!currentOrganization) {
        return { success: false, error: 'Keine Organization ausgewählt.' }
      }

      if (!businessSettings) return { success: false, error: 'Business settings not loaded' }

      // Nur Custom-Kategorien können aktualisiert werden
      if (key in DEFAULT_SUPPLIER_CATEGORIES) {
        return { success: false, error: 'Cannot modify default categories' }
      }

      try {
        const updatedCustomCategories = {
          ...businessSettings.custom_supplier_categories,
          [key]: newLabel,
        }

        // V6.1 Pattern 21: Database to Form Data Transformation
        await upsertBusinessSettings({
          ...businessSettings,
          // Ensure form-safe string values (never null)
          company_name: businessSettings.company_name ?? '',
          company_tagline: businessSettings.company_tagline ?? '',
          company_address: businessSettings.company_address ?? '',
          company_postal_code: businessSettings.company_postal_code ?? '',
          company_city: businessSettings.company_city ?? '',
          company_phone: businessSettings.company_phone ?? '',
          company_email: businessSettings.company_email ?? '',
          company_website: businessSettings.company_website ?? '',
          company_uid: businessSettings.company_uid ?? '',
          custom_supplier_categories: updatedCustomCategories,
        })

        await refetch()
        return { success: true }
      } catch (err: unknown) {
        return { success: false, error: err instanceof Error ? err.message : String(err) } // V6.1: Unknown error handling
      }
    },
    [businessSettings, refetch, currentOrganization]
  )

  // Custom Kategorie löschen
  const removeCategory = useCallback(
    async (key: string) => {
      // 🔒 CRITICAL SECURITY: Organization required
      if (!currentOrganization) {
        return { success: false, error: 'Keine Organization ausgewählt.' }
      }

      if (!businessSettings) return { success: false, error: 'Business settings not loaded' }

      // Default-Kategorien können nicht gelöscht werden
      if (key in DEFAULT_SUPPLIER_CATEGORIES) {
        return { success: false, error: 'Cannot remove default categories' }
      }

      try {
        const updatedCustomCategories = { ...businessSettings.custom_supplier_categories }
        delete updatedCustomCategories[key]

        // V6.1 Pattern 21: Database to Form Data Transformation
        await upsertBusinessSettings({
          ...businessSettings,
          // Ensure form-safe string values (never null)
          company_name: businessSettings.company_name ?? '',
          company_tagline: businessSettings.company_tagline ?? '',
          company_address: businessSettings.company_address ?? '',
          company_postal_code: businessSettings.company_postal_code ?? '',
          company_city: businessSettings.company_city ?? '',
          company_phone: businessSettings.company_phone ?? '',
          company_email: businessSettings.company_email ?? '',
          company_website: businessSettings.company_website ?? '',
          company_uid: businessSettings.company_uid ?? '',
          custom_supplier_categories: updatedCustomCategories,
        })

        await refetch()
        return { success: true }
      } catch (err: unknown) {
        return { success: false, error: err instanceof Error ? err.message : String(err) } // V6.1: Unknown error handling
      }
    },
    [businessSettings, refetch, currentOrganization]
  )

  // Kategorie-Key validieren
  const validateCategoryKey = useCallback(
    (key: string): { isValid: boolean; error?: string } => {
      if (!key || key.trim() === '') {
        return { isValid: false, error: 'Key cannot be empty' }
      }

      if (!/^[a-z_]+$/.test(key)) {
        return { isValid: false, error: 'Key must contain only lowercase letters and underscores' }
      }

      if (key in DEFAULT_SUPPLIER_CATEGORIES) {
        return { isValid: false, error: 'Key conflicts with default category' }
      }

      if (key in (businessSettings?.custom_supplier_categories || {})) {
        return { isValid: false, error: 'Key already exists' }
      }

      return { isValid: true }
    },
    [businessSettings?.custom_supplier_categories]
  )

  return {
    // Data
    categories,
    categoriesArray,
    defaultCategories: DEFAULT_SUPPLIER_CATEGORIES,
    customCategories: businessSettings?.custom_supplier_categories || {},

    // State
    loading,
    error,

    // Actions
    addCategory,
    updateCategory,
    removeCategory,
    validateCategoryKey,

    // Utils
    isDefaultCategory: (key: string) => key in DEFAULT_SUPPLIER_CATEGORIES,
    getCategoryLabel: (key: string) => categories[key] || key,
  }
}
