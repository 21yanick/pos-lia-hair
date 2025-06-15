// Business Settings Service
// CRUD operations for company data and configuration

import { supabase } from '@/shared/lib/supabase/client'
import type { BusinessSettings, BusinessSettingsFormData } from '@/shared/types/businessSettings'

// =================================
// Business Settings CRUD Operations
// =================================

export async function getBusinessSettings(): Promise<BusinessSettings | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('business_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return data || null
  } catch (error) {
    console.error('Error loading business settings:', error)
    throw error
  }
}

export async function upsertBusinessSettings(
  settingsData: BusinessSettingsFormData
): Promise<BusinessSettings> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('business_settings')
      .upsert({
        user_id: user.id,
        ...settingsData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error saving business settings:', error)
    throw error
  }
}

// =================================
// Logo Upload Operations
// =================================

export async function uploadLogo(file: File): Promise<{
  url: string
  path: string
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // File validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only JPEG, PNG, WebP and SVG files are allowed')
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      throw new Error('Logo file must be smaller than 5MB')
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const fileName = `${user.id}/logo-${Date.now()}.${fileExtension}`

    // Delete old logo if exists
    const currentSettings = await getBusinessSettings()
    if (currentSettings?.logo_storage_path) {
      await deleteLogo(currentSettings.logo_storage_path)
    }

    // Upload new file
    const { data, error } = await supabase.storage
      .from('business-logos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('business-logos')
      .getPublicUrl(fileName)

    return {
      url: urlData.publicUrl,
      path: fileName
    }
  } catch (error) {
    console.error('Error uploading logo:', error)
    throw error
  }
}

export async function deleteLogo(logoPath: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from('business-logos')
      .remove([logoPath])

    if (error) throw error
  } catch (error) {
    console.error('Error deleting logo:', error)
    throw error
  }
}

// =================================
// Validation
// =================================

export function validateBusinessSettings(settings: BusinessSettingsFormData): {
  isValid: boolean
  errors: Record<string, string>
} {
  const errors: Record<string, string> = {}

  // Company name required
  if (!settings.company_name?.trim()) {
    errors.company_name = 'Company name is required'
  } else if (settings.company_name.length < 2) {
    errors.company_name = 'Company name must be at least 2 characters'
  }

  // Email validation
  if (settings.company_email && !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(settings.company_email)) {
    errors.company_email = 'Invalid email address'
  }

  // Website validation
  if (settings.company_website && !/^https?:\/\/.+/.test(settings.company_website)) {
    errors.company_website = 'Website must start with http:// or https://'
  }

  // Tax rate validation
  if (settings.tax_rate < 0 || settings.tax_rate > 100) {
    errors.tax_rate = 'Tax rate must be between 0 and 100%'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}