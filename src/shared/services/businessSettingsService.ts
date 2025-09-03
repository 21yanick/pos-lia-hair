// Business Settings Service
// CRUD operations for company data and configuration (Multi-Tenant)
//
// 🔄 AUTO-SYNC PATTERN:
// When company_name is updated via upsertBusinessSettings(),
// it automatically syncs to organizations.display_name to keep
// business settings and sidebar display consistent.
// This maintains Single Source of Truth for user-visible company name.

import { organizationService } from '@/modules/organization/services/organizationService'
import { supabase } from '@/shared/lib/supabase/client'
import type {
  BookingRules,
  BusinessSettings,
  BusinessSettingsFormData,
  DayWorkingHours,
  DisplayPreferences,
  VacationPeriod,
  WeekDay,
  WorkingHours,
} from '@/shared/types/businessSettings'
import type { Json } from '@/types/supabase_generated_v6.1' // V6.1: Json type for JSONB fields

// Helper function to get current organization ID
async function getCurrentOrganizationId(): Promise<string> {
  // Note: This should ideally come from OrganizationContext, but services need to be context-free
  // For now, we'll use a pragmatic approach and get it from URL or session storage
  if (typeof window !== 'undefined') {
    // First check session storage for current organization
    const storedOrgId = sessionStorage.getItem('currentOrganizationId')
    if (storedOrgId) {
      return storedOrgId
    }

    // Then try to extract from URL
    const path = window.location.pathname
    const match = path.match(/^\/org\/([^/]+)/)
    if (match) {
      const slug = match[1]
      // Get organization ID by slug
      const { data } = await supabase.from('organizations').select('id').eq('slug', slug).single()

      if (data?.id) {
        // Store for next time
        sessionStorage.setItem('currentOrganizationId', data.id)
        return data.id
      }
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

    if (process.env.NODE_ENV === 'development') {
      // console.log('🔍 DEBUG business_settings request:', {
      //   organizationId,
      //   filter: `organization_id=eq.${organizationId}`,
      // })
    }

    const requestStart = Date.now()
    const { data, error } = await supabase
      .from('business_settings')
      .select('*')
      .eq('organization_id', organizationId) // 🔒 Multi-Tenant Security
      .maybeSingle()

    const _requestTime = Date.now() - requestStart

    if (process.env.NODE_ENV === 'development') {
      // console.log('🔍 DEBUG business_settings response:', {
      //   requestTime: `${requestTime}ms`,
      //   data,
      //   error,
      //   errorCode: error?.code,
      //   errorMessage: error?.message,
      //   errorDetails: error?.details,
      //   errorHint: error?.hint,
      // })
    }

    if (error && error.code !== 'PGRST116') {
      // console.error('🚨 business_settings ERROR (non-404):', error)
      throw error
    }

    // V6.1: Safe type casting for business_settings query result
    return (data as BusinessSettings) || null
  } catch (error) {
    console.error('🚨 business_settings CATCH:', error)
    throw error
  }
}

export async function upsertBusinessSettings(
  settingsData: BusinessSettingsFormData
): Promise<BusinessSettings> {
  try {
    const organizationId = await getCurrentOrganizationId()

    // Get current user for audit trail
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) throw new Error('User not authenticated')

    // 🔄 Auto-Sync Pattern: Check if company_name changed for display_name sync
    const shouldSyncDisplayName = settingsData.company_name?.trim()

    const { data, error } = await supabase
      .from('business_settings')
      .upsert(
        {
          organization_id: organizationId, // 🔒 Multi-Tenant Security
          ...settingsData,
          // V6.1 Pattern 19: Schema Property Alignment - JSONB structured data compatibility
          working_hours: settingsData.working_hours as unknown as Json, // V6.1 Pattern 18: JSONB Json Type Compatibility
          booking_rules: settingsData.booking_rules as unknown as Json, // V6.1 Pattern 18: JSONB Json Type Compatibility
          display_preferences: settingsData.display_preferences as unknown as Json, // V6.1 Pattern 18: JSONB Json Type Compatibility
          vacation_periods: settingsData.vacation_periods as unknown as Json, // V6.1 Pattern 18: JSONB Json Type Compatibility
          // Audit trail is handled by database triggers
          // created_by: auto-set on INSERT
          // updated_by: auto-set on UPDATE
          // updated_at: auto-set by trigger
        },
        {
          onConflict: 'organization_id', // 🔒 One settings record per organization
        }
      )
      .select()
      .single()

    if (error) throw error

    // 🎯 Auto-Sync Pattern: Sync company_name → organization.display_name
    if (shouldSyncDisplayName) {
      try {
        await organizationService.updateOrganization(organizationId, {
          display_name: settingsData.company_name.trim(),
        })
        // ✅ Silent success - user doesn't need to know about this sync
      } catch (orgError) {
        // ⚠️ Non-critical error - business settings were saved, but display_name sync failed
        console.warn('Auto-sync to organization display_name failed:', orgError)
        // Don't throw error - business settings update was successful
      }
    }

    // V6.1: Type casting for business_settings result
    return data as BusinessSettings
  } catch (error) {
    console.error('Error saving business settings:', error)
    throw error
  }
}

// =================================
// Logo Upload Operations
// =================================

export async function uploadLogo(
  file: File,
  prefix: string = 'logo'
): Promise<{
  url: string
  path: string
}> {
  try {
    // console.log('🔍 DEBUG uploadLogo START:', {
    //   fileName: file.name,
    //   fileSize: file.size,
    //   fileType: file.type,
    //   prefix
    // })

    const organizationId = await getCurrentOrganizationId()
    // console.log('🔍 DEBUG uploadLogo organizationId:', organizationId)

    // File validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      // console.error('🚨 File type not allowed:', file.type)
      throw new Error('Only JPEG, PNG and SVG files are allowed')
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      // console.error('🚨 File too large:', file.size)
      throw new Error('Logo file must be smaller than 5MB')
    }

    // Generate unique filename (Multi-Tenant: use organization_id)
    const fileExtension = file.name.split('.').pop()
    const fileName = `${organizationId}/${prefix}-${Date.now()}.${fileExtension}`
    // console.log('🔍 DEBUG uploadLogo fileName:', fileName)

    // Delete old logo if exists (only for standard logo, not app logos)
    if (prefix === 'logo') {
      const currentSettings = await getBusinessSettings()
      if (currentSettings?.logo_storage_path) {
        await deleteLogo(currentSettings.logo_storage_path)
      }
    }

    // Upload new file
    const { error } = await supabase.storage.from('business-logos').upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

    if (error) throw error

    // Get public URL
    const { data: urlData } = supabase.storage.from('business-logos').getPublicUrl(fileName)

    return {
      url: urlData.publicUrl,
      path: fileName,
    }
  } catch (error) {
    console.error('Error uploading logo:', error)
    throw error
  }
}

export async function deleteLogo(logoPath: string): Promise<void> {
  try {
    const { error } = await supabase.storage.from('business-logos').remove([logoPath])

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
  if (
    settings.company_email &&
    !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(settings.company_email)
  ) {
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
    errors,
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

// =================================
// Appointment Settings Operations
// =================================

/**
 * Update working hours for the organization
 */
export async function updateWorkingHours(workingHours: WorkingHours): Promise<BusinessSettings> {
  try {
    const organizationId = await getCurrentOrganizationId()

    const { data, error } = await supabase
      .from('business_settings')
      .update({
        // V6.1 Pattern 19: Schema Property Alignment - JSONB compatibility
        working_hours: workingHours as unknown as Json, // V6.1 Pattern 18: JSONB Json Type Compatibility
      })
      .eq('organization_id', organizationId)
      .select()
      .single()

    if (error) throw error
    // V6.1: Type casting for business_settings result
    return data as BusinessSettings
  } catch (error) {
    console.error('Error updating working hours:', error)
    throw error
  }
}

/**
 * Update booking rules for the organization
 */
export async function updateBookingRules(bookingRules: BookingRules): Promise<BusinessSettings> {
  try {
    const organizationId = await getCurrentOrganizationId()

    const { data, error } = await supabase
      .from('business_settings')
      .update({
        // V6.1 Pattern 19: Schema Property Alignment - JSONB compatibility
        booking_rules: bookingRules as unknown as Json, // V6.1 Pattern 18: JSONB Json Type Compatibility
      })
      .eq('organization_id', organizationId)
      .select()
      .single()

    if (error) throw error
    // V6.1: Type casting for business_settings result
    return data as BusinessSettings
  } catch (error) {
    console.error('Error updating booking rules:', error)
    throw error
  }
}

/**
 * Update display preferences for the organization
 */
export async function updateDisplayPreferences(
  displayPreferences: DisplayPreferences
): Promise<BusinessSettings> {
  try {
    const organizationId = await getCurrentOrganizationId()

    const { data, error } = await supabase
      .from('business_settings')
      .update({
        // V6.1 Pattern 19: Schema Property Alignment - JSONB compatibility
        display_preferences: displayPreferences as unknown as Json, // V6.1 Pattern 18: JSONB Json Type Compatibility
      })
      .eq('organization_id', organizationId)
      .select()
      .single()

    if (error) throw error
    // V6.1: Type casting for business_settings result
    return data as BusinessSettings
  } catch (error) {
    console.error('Error updating display preferences:', error)
    throw error
  }
}

/**
 * Update vacation periods for the organization
 */
export async function updateVacationPeriods(
  vacationPeriods: VacationPeriod[]
): Promise<BusinessSettings> {
  try {
    const organizationId = await getCurrentOrganizationId()

    const { data, error } = await supabase
      .from('business_settings')
      .update({
        // V6.1 Pattern 19: Schema Property Alignment - JSONB compatibility
        vacation_periods: vacationPeriods as unknown as Json, // V6.1 Pattern 18: JSONB Json Type Compatibility
      })
      .eq('organization_id', organizationId)
      .select()
      .single()

    if (error) throw error
    // V6.1: Type casting for business_settings result
    return data as BusinessSettings
  } catch (error) {
    console.error('Error updating vacation periods:', error)
    throw error
  }
}

/**
 * Add a new vacation period
 */
export async function addVacationPeriod(vacationPeriod: VacationPeriod): Promise<BusinessSettings> {
  try {
    const currentSettings = await getBusinessSettings()
    if (!currentSettings) {
      throw new Error('Business settings not found')
    }

    const updatedVacationPeriods = [...(currentSettings.vacation_periods || []), vacationPeriod]
    return await updateVacationPeriods(updatedVacationPeriods)
  } catch (error) {
    console.error('Error adding vacation period:', error)
    throw error
  }
}

/**
 * Remove a vacation period by index
 */
export async function removeVacationPeriod(index: number): Promise<BusinessSettings> {
  try {
    const currentSettings = await getBusinessSettings()
    if (!currentSettings) {
      throw new Error('Business settings not found')
    }

    const updatedVacationPeriods = (currentSettings.vacation_periods || []).filter(
      (_, i) => i !== index
    )
    return await updateVacationPeriods(updatedVacationPeriods)
  } catch (error) {
    console.error('Error removing vacation period:', error)
    throw error
  }
}

// =================================
// Business Logic Helper Functions
// =================================

/**
 * Check if organization is open on a specific date and time
 */
export async function isOrganizationOpen(date: Date, time: string): Promise<boolean> {
  try {
    const settings = await getBusinessSettings()
    if (!settings?.working_hours) return false

    // Get day of week
    const weekdays: WeekDay[] = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ]
    const dayOfWeek = weekdays[date.getDay()]
    const dayHours = settings.working_hours[dayOfWeek]

    // Check if day is closed
    if (dayHours.closed) return false

    // Check if time is within working hours
    if (time < dayHours.start || time >= dayHours.end) return false

    // Check break times
    const isInBreak = dayHours.breaks.some(
      (breakTime: { start: string; end: string }) => time >= breakTime.start && time < breakTime.end // V6.1 Pattern 17: Explicit type annotation
    )
    if (isInBreak) return false

    // Check vacation periods
    const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD
    const isOnVacation = (settings.vacation_periods || []).some(
      (vacation) => dateStr >= vacation.start && dateStr <= vacation.end
    )
    if (isOnVacation) return false

    return true
  } catch (error) {
    console.error('Error checking organization hours:', error)
    return false
  }
}

/**
 * Get working hours for a specific day
 */
export async function getWorkingHoursForDay(date: Date): Promise<DayWorkingHours | null> {
  try {
    const settings = await getBusinessSettings()
    if (!settings?.working_hours) return null

    const weekdays: WeekDay[] = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ]
    const dayOfWeek = weekdays[date.getDay()]

    return settings.working_hours[dayOfWeek]
  } catch (error) {
    console.error('Error getting working hours for day:', error)
    return null
  }
}

/**
 * Generate available time slots for a specific date
 */
export async function generateAvailableTimeSlots(date: Date): Promise<string[]> {
  try {
    const settings = await getBusinessSettings()
    if (!settings?.working_hours || !settings?.booking_rules) return []

    const dayHours = await getWorkingHoursForDay(date)
    if (!dayHours || dayHours.closed) return []

    const slots: string[] = []
    const { slotInterval } = settings.booking_rules

    // Parse start and end times
    const [startHour, startMinute] = dayHours.start.split(':').map(Number)
    const [endHour, endMinute] = dayHours.end.split(':').map(Number)

    let currentTime = startHour * 60 + startMinute // Convert to minutes
    const endTime = endHour * 60 + endMinute

    while (currentTime < endTime) {
      const hours = Math.floor(currentTime / 60)
      const minutes = currentTime % 60
      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`

      // Check if time is not during a break
      const isInBreak = dayHours.breaks.some(
        (breakTime: { start: string; end: string }) =>
          timeStr >= breakTime.start && timeStr < breakTime.end // V6.1 Pattern 17: Explicit type annotation
      )

      if (!isInBreak) {
        slots.push(timeStr)
      }

      currentTime += slotInterval
    }

    return slots
  } catch (error) {
    console.error('Error generating time slots:', error)
    return []
  }
}

// =================================
// Validation Functions
// =================================

/**
 * Validate working hours configuration
 */
export function validateWorkingHours(workingHours: WorkingHours): {
  isValid: boolean
  errors: Record<string, string>
} {
  const errors: Record<string, string> = {}

  const weekdays: WeekDay[] = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ]

  weekdays.forEach((day) => {
    const dayHours = workingHours[day]

    if (!dayHours.closed) {
      // Validate time format and range
      if (dayHours.start >= dayHours.end) {
        errors[`${day}_hours`] = `${day}: Start time must be before end time`
      }

      // Validate breaks
      dayHours.breaks.forEach((breakTime, index) => {
        if (breakTime.start >= breakTime.end) {
          errors[`${day}_break_${index}`] = `${day}: Break start must be before break end`
        }

        if (breakTime.start < dayHours.start || breakTime.end > dayHours.end) {
          errors[`${day}_break_${index}_range`] = `${day}: Break must be within working hours`
        }
      })
    }
  })

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Validate vacation period
 */
export function validateVacationPeriod(vacation: VacationPeriod): {
  isValid: boolean
  errors: Record<string, string>
} {
  const errors: Record<string, string> = {}

  if (!vacation.reason.trim()) {
    errors.reason = 'Reason is required'
  }

  if (vacation.start > vacation.end) {
    errors.dates = 'Start date must be before or equal to end date'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
