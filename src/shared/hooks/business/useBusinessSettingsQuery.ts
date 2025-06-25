'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import {
  getBusinessSettings,
  upsertBusinessSettings,
  uploadLogo,
  deleteLogo,
  validateBusinessSettings
} from '@/shared/services/businessSettingsService'
import { queryKeys, cacheConfig } from '@/shared/lib/react-query'
import type { 
  BusinessSettings, 
  BusinessSettingsFormData 
} from '@/shared/types/businessSettings'

/**
 * React Query-powered Business Settings Hook
 * 
 * Features:
 * - Automatic caching and deduplication
 * - Background refetching
 * - Optimistic updates
 * - Error handling
 * - Loading states
 */

interface UseBusinessSettingsQueryReturn {
  // Data & States
  settings: BusinessSettings | null
  loading: boolean
  saving: boolean
  uploading: boolean
  error: Error | null
  
  // Query Info
  isStale: boolean
  isFetching: boolean
  isSuccess: boolean
  
  // Actions
  updateSettings: (data: BusinessSettingsFormData) => Promise<void>
  uploadCompanyLogo: (file: File) => Promise<void>
  deleteCompanyLogo: () => Promise<void>
  uploadAppLogo: (file: File, theme: 'light' | 'dark') => Promise<void>
  deleteAppLogo: (theme: 'light' | 'dark') => Promise<void>
  
  // Utilities
  getFormattedAddress: () => string
  isConfigured: boolean
  
  // Query Management
  refetch: () => Promise<any>
  invalidate: () => Promise<void>
}

export function useBusinessSettingsQuery(): UseBusinessSettingsQueryReturn {
  const { currentOrganization } = useCurrentOrganization()
  const queryClient = useQueryClient()
  
  const organizationId = currentOrganization?.id

  // ========================================
  // Query: Business Settings
  // ========================================
  const {
    data: settings,
    isLoading: loading,
    error,
    isStale,
    isFetching,
    isSuccess,
    refetch
  } = useQuery({
    queryKey: queryKeys.business.settings.detail(organizationId || ''),
    queryFn: async () => {
      if (!organizationId) {
        throw new Error('No organization selected')
      }
      return await getBusinessSettings()
    },
    enabled: !!organizationId, // Only run when we have an organization
    staleTime: cacheConfig.businessSettings.staleTime,
    gcTime: cacheConfig.businessSettings.gcTime,
    retry: (failureCount, error: any) => {
      // Don't retry on permission errors
      if (error?.message?.includes('organization') || error?.message?.includes('401')) {
        return false
      }
      return failureCount < 2
    },
    meta: {
      errorMessage: 'Fehler beim Laden der Geschäftseinstellungen'
    }
  })

  // ========================================
  // Mutation: Update Settings
  // ========================================
  const updateMutation = useMutation({
    mutationFn: async (data: BusinessSettingsFormData) => {
      if (!organizationId) {
        throw new Error('No organization selected')
      }
      
      // Validate first
      const validation = validateBusinessSettings(data)
      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0]
        throw new Error(firstError)
      }

      return await upsertBusinessSettings(data)
    },
    onMutate: async (newData) => {
      if (!organizationId) return

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.business.settings.detail(organizationId) 
      })

      // Snapshot the previous value
      const previousSettings = queryClient.getQueryData(
        queryKeys.business.settings.detail(organizationId)
      )

      // Optimistically update to the new value
      queryClient.setQueryData(
        queryKeys.business.settings.detail(organizationId),
        (old: BusinessSettings | null) => {
          if (!old) return null
          return {
            ...old,
            ...newData,
            updated_at: new Date().toISOString()
          }
        }
      )

      // Return context with the snapshotted value
      return { previousSettings }
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousSettings && organizationId) {
        queryClient.setQueryData(
          queryKeys.business.settings.detail(organizationId),
          context.previousSettings
        )
      }
      
      toast.error(error.message || 'Fehler beim Speichern der Einstellungen')
    },
    onSuccess: () => {
      toast.success('Einstellungen erfolgreich gespeichert')
    },
    onSettled: () => {
      // Always refetch after mutation
      if (organizationId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.business.settings.detail(organizationId) 
        })
      }
    }
  })

  // ========================================
  // Mutation: Upload Company Logo
  // ========================================
  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!organizationId || !settings) {
        throw new Error('No organization or settings available')
      }

      const { url, path } = await uploadLogo(file)
      
      // Update settings with new logo
      await upsertBusinessSettings({
        company_name: settings.company_name || '',
        company_tagline: settings.company_tagline,
        company_address: settings.company_address,
        company_postal_code: settings.company_postal_code,
        company_city: settings.company_city,
        company_phone: settings.company_phone,
        company_email: settings.company_email,
        company_website: settings.company_website,
        company_uid: settings.company_uid,
        default_currency: settings.default_currency,
        tax_rate: settings.tax_rate,
        pdf_show_logo: settings.pdf_show_logo,
        pdf_show_company_details: settings.pdf_show_company_details,
        logo_url: url,
        logo_storage_path: path,
      })

      return { url, path }
    },
    onSuccess: () => {
      toast.success('Logo erfolgreich hochgeladen')
      // Invalidate to refetch updated settings
      if (organizationId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.business.settings.detail(organizationId) 
        })
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Fehler beim Hochladen des Logos')
    }
  })

  // ========================================
  // Mutation: Delete Company Logo
  // ========================================
  const deleteLogoMutation = useMutation({
    mutationFn: async () => {
      if (!settings?.logo_storage_path || !organizationId) {
        throw new Error('No logo to delete')
      }

      await deleteLogo(settings.logo_storage_path)
      
      // Update settings without logo
      await upsertBusinessSettings({
        company_name: settings.company_name || '',
        company_tagline: settings.company_tagline,
        company_address: settings.company_address,
        company_postal_code: settings.company_postal_code,
        company_city: settings.company_city,
        company_phone: settings.company_phone,
        company_email: settings.company_email,
        company_website: settings.company_website,
        company_uid: settings.company_uid,
        default_currency: settings.default_currency,
        tax_rate: settings.tax_rate,
        pdf_show_logo: settings.pdf_show_logo,
        pdf_show_company_details: settings.pdf_show_company_details,
        logo_url: undefined,
        logo_storage_path: undefined,
      })
    },
    onSuccess: () => {
      toast.success('Logo erfolgreich entfernt')
      if (organizationId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.business.settings.detail(organizationId) 
        })
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Fehler beim Entfernen des Logos')
    }
  })

  // ========================================
  // Mutation: Upload App Logo
  // ========================================
  const uploadAppLogoMutation = useMutation({
    mutationFn: async ({ file, theme }: { file: File; theme: 'light' | 'dark' }) => {
      if (!settings || !organizationId) {
        throw new Error('No settings available')
      }

      const { url, path } = await uploadLogo(file, `app-logo-${theme}`)
      
      // Update settings with new app logo
      await upsertBusinessSettings({
        company_name: settings.company_name || '',
        company_tagline: settings.company_tagline,
        company_address: settings.company_address,
        company_postal_code: settings.company_postal_code,
        company_city: settings.company_city,
        company_phone: settings.company_phone,
        company_email: settings.company_email,
        company_website: settings.company_website,
        company_uid: settings.company_uid,
        default_currency: settings.default_currency,
        tax_rate: settings.tax_rate,
        pdf_show_logo: settings.pdf_show_logo,
        pdf_show_company_details: settings.pdf_show_company_details,
        logo_url: settings.logo_url,
        logo_storage_path: settings.logo_storage_path,
        app_logo_light_url: theme === 'light' ? url : settings.app_logo_light_url,
        app_logo_light_storage_path: theme === 'light' ? path : settings.app_logo_light_storage_path,
        app_logo_dark_url: theme === 'dark' ? url : settings.app_logo_dark_url,
        app_logo_dark_storage_path: theme === 'dark' ? path : settings.app_logo_dark_storage_path,
      })

      return { url, path, theme }
    },
    onSuccess: (data) => {
      const themeLabel = data.theme === 'light' ? 'Helles' : 'Dunkles'
      toast.success(`${themeLabel} App-Logo erfolgreich hochgeladen`)
      if (organizationId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.business.settings.detail(organizationId) 
        })
      }
    },
    onError: (error, variables) => {
      const themeLabel = variables.theme === 'light' ? 'hellen' : 'dunklen'
      toast.error(error.message || `Fehler beim Hochladen des ${themeLabel} App-Logos`)
    }
  })

  // ========================================
  // Mutation: Delete App Logo
  // ========================================
  const deleteAppLogoMutation = useMutation({
    mutationFn: async (theme: 'light' | 'dark') => {
      if (!settings || !organizationId) {
        throw new Error('No settings available')
      }

      const storagePath = theme === 'light' 
        ? settings.app_logo_light_storage_path 
        : settings.app_logo_dark_storage_path

      if (!storagePath) {
        throw new Error('No app logo to delete')
      }

      await deleteLogo(storagePath)
      
      // Update settings without app logo
      await upsertBusinessSettings({
        company_name: settings.company_name || '',
        company_tagline: settings.company_tagline,
        company_address: settings.company_address,
        company_postal_code: settings.company_postal_code,
        company_city: settings.company_city,
        company_phone: settings.company_phone,
        company_email: settings.company_email,
        company_website: settings.company_website,
        company_uid: settings.company_uid,
        default_currency: settings.default_currency,
        tax_rate: settings.tax_rate,
        pdf_show_logo: settings.pdf_show_logo,
        pdf_show_company_details: settings.pdf_show_company_details,
        logo_url: settings.logo_url,
        logo_storage_path: settings.logo_storage_path,
        app_logo_light_url: theme === 'light' ? undefined : settings.app_logo_light_url,
        app_logo_light_storage_path: theme === 'light' ? undefined : settings.app_logo_light_storage_path,
        app_logo_dark_url: theme === 'dark' ? undefined : settings.app_logo_dark_url,
        app_logo_dark_storage_path: theme === 'dark' ? undefined : settings.app_logo_dark_storage_path,
      })

      return theme
    },
    onSuccess: (theme) => {
      const themeLabel = theme === 'light' ? 'Helles' : 'Dunkles'
      toast.success(`${themeLabel} App-Logo erfolgreich entfernt`)
      if (organizationId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.business.settings.detail(organizationId) 
        })
      }
    },
    onError: (error, theme) => {
      const themeLabel = theme === 'light' ? 'hellen' : 'dunklen'
      toast.error(error.message || `Fehler beim Entfernen des ${themeLabel} App-Logos`)
    }
  })

  // ========================================
  // Utility Functions
  // ========================================
  const getFormattedAddress = () => {
    if (!settings) return ''
    
    const parts = [
      settings.company_address,
      settings.company_postal_code && settings.company_city 
        ? `${settings.company_postal_code} ${settings.company_city}`
        : settings.company_city,
    ].filter(Boolean)
    
    return parts.join(', ')
  }

  const invalidate = async () => {
    if (organizationId) {
      await queryClient.invalidateQueries({ 
        queryKey: queryKeys.business.settings.detail(organizationId) 
      })
    }
  }

  // ========================================
  // Return Interface
  // ========================================
  return {
    // Data & States
    settings: settings || null,
    loading,
    saving: updateMutation.isPending,
    uploading: uploadLogoMutation.isPending || deleteLogoMutation.isPending || 
               uploadAppLogoMutation.isPending || deleteAppLogoMutation.isPending,
    error: error as Error | null,
    
    // Query Info
    isStale,
    isFetching,
    isSuccess,
    
    // Actions
    updateSettings: updateMutation.mutateAsync,
    uploadCompanyLogo: uploadLogoMutation.mutateAsync,
    deleteCompanyLogo: deleteLogoMutation.mutateAsync,
    uploadAppLogo: (file: File, theme: 'light' | 'dark') => 
      uploadAppLogoMutation.mutateAsync({ file, theme }),
    deleteAppLogo: deleteAppLogoMutation.mutateAsync,
    
    // Utilities
    getFormattedAddress,
    isConfigured: Boolean(settings?.company_name),
    
    // Query Management
    refetch,
    invalidate,
  }
}