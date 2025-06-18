// Business Settings Service  
// CRUD operations for company data and configuration (Multi-Tenant)

import { supabase } from '@/shared/lib/supabase/client'
import type { BusinessSettings, BusinessSettingsFormData } from '@/shared/types/businessSettings'

// Helper function to get current organization ID
async function getCurrentOrganizationId(): Promise<string> {
  // Note: This should ideally come from OrganizationContext, but services need to be context-free
  // For now, we'll use a pragmatic approach and get it from URL or session storage
  if (typeof window !== 'undefined') {
    const path = window.location.pathname
    const match = path.match(/^\/org\/([^\/]+)/)
    if (match) {
      const slug = match[1]
      // Get organization ID by slug
      const { data } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', slug)
        .single()
      
      if (data?.id) return data.id
    }
  }
  throw new Error('No organization context available')
}

// =================================
// Business Settings CRUD Operations
// =================================

export async function getBusinessSettings(): Promise<BusinessSettings | null> {
  try {
    const organizationId = await getCurrentOrganizationId()

    const { data, error } = await supabase
      .from('business_settings')
      .select('*')
      .eq('organization_id', organizationId) // 🔒 Multi-Tenant Security
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
    const organizationId = await getCurrentOrganizationId()

    const { data, error } = await supabase
      .from('business_settings')
      .upsert({
        organization_id: organizationId, // 🔒 Multi-Tenant Security
        ...settingsData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'organization_id' // Changed from user_id to organization_id
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
    const organizationId = await getCurrentOrganizationId()

    // File validation
    const allowedTypes = ['image/jpeg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only JPEG and PNG files are allowed')
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      throw new Error('Logo file must be smaller than 5MB')
    }

    // Generate unique filename (Multi-Tenant: use organization_id)
    const fileExtension = file.name.split('.').pop()
    const fileName = `${organizationId}/logo-${Date.now()}.${fileExtension}`

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

// =================================
// Logo URL Resolution
// =================================

/**
 * Resolves logo URLs for different environments
 * In development: Converts localhost URLs to Docker-internal URLs for server-side PDF generation
 * In production: Returns original URL unchanged
 */
export function resolveLogoUrl(logoUrl: string | undefined): string | undefined {
  if (!logoUrl) return undefined
  
  // Only resolve URLs in development environment and server-side context
  if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
    // Convert localhost Supabase URLs to Docker-internal URLs (Kong API Gateway)
    return logoUrl.replace('localhost:8000', 'supabase-kong:8000')
  }
  
  // Return original URL in production or client-side contexts
  return logoUrl
}