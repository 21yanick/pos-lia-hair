'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  getBusinessSettings,
  upsertBusinessSettings,
  uploadLogo,
  deleteLogo,
  validateBusinessSettings
} from '@/shared/services/businessSettingsService'
import type { 
  BusinessSettings, 
  BusinessSettingsFormData 
} from '@/shared/types/businessSettings'

interface UseBusinessSettingsReturn {
  // State
  settings: BusinessSettings | null
  loading: boolean
  saving: boolean
  uploading: boolean
  
  // Actions
  loadSettings: () => Promise<void>
  updateSettings: (data: BusinessSettingsFormData) => Promise<void>
  uploadCompanyLogo: (file: File) => Promise<void>
  deleteCompanyLogo: () => Promise<void>
  uploadAppLogo: (file: File, theme: 'light' | 'dark') => Promise<void>
  deleteAppLogo: (theme: 'light' | 'dark') => Promise<void>
  
  // Utilities
  getFormattedAddress: () => string
  isConfigured: boolean
}

export function useBusinessSettings(): UseBusinessSettingsReturn {
  const [settings, setSettings] = useState<BusinessSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Load settings
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getBusinessSettings()
      setSettings(data)
    } catch (error) {
      console.error('Error loading business settings:', error)
      toast.error('Fehler beim Laden der Einstellungen')
    } finally {
      setLoading(false)
    }
  }, [])

  // Update settings
  const updateSettings = useCallback(async (data: BusinessSettingsFormData) => {
    try {
      setSaving(true)
      
      // Validate
      const validation = validateBusinessSettings(data)
      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0]
        toast.error(firstError)
        return
      }

      // Save
      const updatedSettings = await upsertBusinessSettings(data)
      setSettings(updatedSettings)
      toast.success('Einstellungen erfolgreich gespeichert')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Fehler beim Speichern der Einstellungen')
      throw error
    } finally {
      setSaving(false)
    }
  }, [])

  // Upload logo
  const uploadCompanyLogo = useCallback(async (file: File) => {
    try {
      setUploading(true)
      const { url, path } = await uploadLogo(file)
      
      // Update settings with new logo
      if (settings) {
        const updatedSettings = {
          ...settings,
          logo_url: url,
          logo_storage_path: path,
          updated_at: new Date().toISOString()
        }
        setSettings(updatedSettings)
        
        // Save to database
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
      }
      
      toast.success('Logo erfolgreich hochgeladen')
    } catch (error) {
      console.error('Error uploading logo:', error)
      toast.error('Fehler beim Hochladen des Logos')
      throw error
    } finally {
      setUploading(false)
    }
  }, [settings])

  // Delete logo
  const deleteCompanyLogo = useCallback(async () => {
    if (!settings?.logo_storage_path) return

    try {
      setUploading(true)
      await deleteLogo(settings.logo_storage_path)
      
      // Update settings without logo
      const updatedSettings = {
        ...settings,
        logo_url: undefined,
        logo_storage_path: undefined,
        updated_at: new Date().toISOString()
      }
      setSettings(updatedSettings)
      
      // Save to database
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
      
      toast.success('Logo erfolgreich entfernt')
    } catch (error) {
      console.error('Error deleting logo:', error)
      toast.error('Fehler beim Entfernen des Logos')
      throw error
    } finally {
      setUploading(false)
    }
  }, [settings])

  // Upload app logo
  const uploadAppLogo = useCallback(async (file: File, theme: 'light' | 'dark') => {
    if (!settings) return

    try {
      setUploading(true)
      const { url, path } = await uploadLogo(file, `app-logo-${theme}`)
      
      // Update settings with new app logo
      const updatedSettings = {
        ...settings,
        [`app_logo_${theme}_url`]: url,
        [`app_logo_${theme}_storage_path`]: path,
        updated_at: new Date().toISOString()
      }
      setSettings(updatedSettings)
      
      // Save to database
      if (settings.company_name) {
        await upsertBusinessSettings({
          company_name: settings.company_name,
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
      }
      
      toast.success(`${theme === 'light' ? 'Helles' : 'Dunkles'} App-Logo erfolgreich hochgeladen`)
    } catch (error) {
      console.error('Error uploading app logo:', error)
      toast.error(`Fehler beim Hochladen des ${theme === 'light' ? 'hellen' : 'dunklen'} App-Logos`)
      throw error
    } finally {
      setUploading(false)
    }
  }, [settings])

  // Delete app logo
  const deleteAppLogo = useCallback(async (theme: 'light' | 'dark') => {
    const storagePath = theme === 'light' ? settings?.app_logo_light_storage_path : settings?.app_logo_dark_storage_path
    if (!storagePath || !settings) return

    try {
      setUploading(true)
      await deleteLogo(storagePath)
      
      // Update settings without app logo
      const updatedSettings = {
        ...settings,
        [`app_logo_${theme}_url`]: undefined,
        [`app_logo_${theme}_storage_path`]: undefined,
        updated_at: new Date().toISOString()
      }
      setSettings(updatedSettings)
      
      // Save to database
      if (settings.company_name) {
        await upsertBusinessSettings({
          company_name: settings.company_name,
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
      }
      
      toast.success(`${theme === 'light' ? 'Helles' : 'Dunkles'} App-Logo erfolgreich entfernt`)
    } catch (error) {
      console.error('Error deleting app logo:', error)
      toast.error(`Fehler beim Entfernen des ${theme === 'light' ? 'hellen' : 'dunklen'} App-Logos`)
      throw error
    } finally {
      setUploading(false)
    }
  }, [settings])

  // Get formatted address
  const getFormattedAddress = useCallback(() => {
    if (!settings) return ''
    
    const parts = [
      settings.company_address,
      settings.company_postal_code && settings.company_city 
        ? `${settings.company_postal_code} ${settings.company_city}`
        : settings.company_city,
    ].filter(Boolean)
    
    return parts.join(', ')
  }, [settings])

  // Check if configured
  const isConfigured = Boolean(settings?.company_name)

  // Load on mount
  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  return {
    // State
    settings,
    loading,
    saving,
    uploading,
    
    // Actions
    loadSettings,
    updateSettings,
    uploadCompanyLogo,
    deleteCompanyLogo,
    uploadAppLogo,
    deleteAppLogo,
    
    // Utilities
    getFormattedAddress,
    isConfigured
  }
}