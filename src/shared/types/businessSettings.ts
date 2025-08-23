export interface BusinessSettings {
  id: string
  user_id?: string // V6.1: Optional - organization-scoped, no user_id required
  organization_id: string

  // Company Data - V6.1: Allow null from database
  company_name?: string | null
  company_tagline?: string | null
  company_address?: string | null
  company_postal_code?: string | null
  company_city?: string | null
  company_phone?: string | null
  company_email?: string | null
  company_website?: string | null
  company_uid?: string | null

  // Logo (Business - for PDFs, receipts) - V6.1: Allow null
  logo_url?: string | null
  logo_storage_path?: string | null

  // App Logos (for UI, navigation, login) - V6.1: Allow null
  app_logo_light_url?: string | null
  app_logo_light_storage_path?: string | null
  app_logo_dark_url?: string | null
  app_logo_dark_storage_path?: string | null

  // Settings
  default_currency: string
  tax_rate: number
  pdf_show_logo: boolean
  pdf_show_company_details: boolean
  custom_expense_categories?: Record<string, string>
  custom_supplier_categories?: Record<string, string>

  // Appointment Settings (JSONB fields from database)
  // V6.1: JSONB fields compatible with both structured types and Json
  working_hours: WorkingHours | Record<string, any> | null
  booking_rules: BookingRules | Record<string, any> | null
  display_preferences: DisplayPreferences | Record<string, any> | null
  vacation_periods: VacationPeriod[] | any[] | null

  // Timestamps
  created_at: string
  updated_at: string
}

export interface BusinessSettingsFormData {
  company_name: string
  // V6.1: Align with database nullable columns (string | null)
  company_tagline?: string | null
  company_address?: string | null
  company_postal_code?: string | null
  company_city?: string | null
  company_phone?: string | null
  company_email?: string | null
  company_website?: string | null
  company_uid?: string | null
  logo_url?: string | null
  logo_storage_path?: string | null
  app_logo_light_url?: string | null
  app_logo_light_storage_path?: string | null
  app_logo_dark_url?: string | null
  app_logo_dark_storage_path?: string | null
  default_currency: string
  tax_rate: number
  pdf_show_logo: boolean
  pdf_show_company_details: boolean
  custom_expense_categories?: Record<string, string>
  custom_supplier_categories?: Record<string, string>
  // V6.1: JSONB fields compatible with both structured types and Json
  working_hours?: WorkingHours | Record<string, any> | null
  booking_rules?: BookingRules | Record<string, any> | null
  display_preferences?: DisplayPreferences | Record<string, any> | null
  vacation_periods?: VacationPeriod[] | any[] | null
}

// =================================
// Appointment Settings Types
// =================================

export type WeekDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export interface DayWorkingHours {
  start: string // "09:00"
  end: string // "18:00"
  closed: boolean // false
  breaks: {
    start: string // "12:00"
    end: string // "13:00"
  }[]
}

export type WorkingHours = {
  [K in WeekDay]: DayWorkingHours
}

export interface BookingRules {
  slotInterval: 15 | 30 // Booking grid in minutes
  defaultDuration: 30 | 45 | 60 // Default service time
  maxAdvanceDays: 30 | 60 | 90 // How far ahead bookings allowed
  minAdvanceHours: 1 | 2 | 4 | 24 // Minimum notice required
  bufferMinutes: 0 | 5 | 10 // Time between appointments
}

export interface DisplayPreferences {
  timelineStart: string // "08:00" - Timeline display start
  timelineEnd: string // "19:00" - Timeline display end
}

export interface VacationPeriod {
  start: string // "2024-07-15" - Start date (YYYY-MM-DD)
  end: string // "2024-07-29" - End date (YYYY-MM-DD)
  reason: string // "Sommerurlaub" - Description
}

// =================================
// Default Values
// =================================

export const DEFAULT_WORKING_HOURS: WorkingHours = {
  monday: {
    start: '09:00',
    end: '18:00',
    closed: false,
    breaks: [{ start: '12:00', end: '13:00' }],
  },
  tuesday: { start: '09:00', end: '18:00', closed: false, breaks: [] },
  wednesday: { start: '09:00', end: '18:00', closed: false, breaks: [] },
  thursday: { start: '09:00', end: '18:00', closed: false, breaks: [] },
  friday: { start: '09:00', end: '18:00', closed: false, breaks: [] },
  saturday: { start: '09:00', end: '16:00', closed: false, breaks: [] },
  sunday: { start: '10:00', end: '16:00', closed: true, breaks: [] },
}

export const DEFAULT_BOOKING_RULES: BookingRules = {
  slotInterval: 15,
  defaultDuration: 60,
  maxAdvanceDays: 90,
  minAdvanceHours: 2,
  bufferMinutes: 5,
}

export const DEFAULT_DISPLAY_PREFERENCES: DisplayPreferences = {
  timelineStart: '08:00',
  timelineEnd: '19:00',
}

export const DEFAULT_BUSINESS_SETTINGS: Partial<BusinessSettings> = {
  default_currency: 'CHF',
  tax_rate: 7.7,
  pdf_show_logo: true,
  pdf_show_company_details: true,
  custom_expense_categories: {},
  custom_supplier_categories: {},
  working_hours: DEFAULT_WORKING_HOURS,
  booking_rules: DEFAULT_BOOKING_RULES,
  display_preferences: DEFAULT_DISPLAY_PREFERENCES,
  vacation_periods: [],
}

// =================================
// V6.1 JSONB Type Safety Guards
// =================================

/**
 * Safely extract WorkingHours from JSONB union type
 * V6.1: JSONB fields can be stored as Record<string, any> or null
 */
export function safeWorkingHours(
  value: WorkingHours | Record<string, any> | null | undefined
): WorkingHours {
  // Return default if null/undefined
  if (!value) return DEFAULT_WORKING_HOURS

  // Check if it has the expected WorkingHours structure
  if (
    typeof value === 'object' &&
    'monday' in value &&
    'tuesday' in value &&
    typeof value.monday === 'object' &&
    'start' in value.monday &&
    'end' in value.monday
  ) {
    return value as WorkingHours
  }

  // Fallback to default if structure doesn't match
  return DEFAULT_WORKING_HOURS
}

/**
 * Safely extract BookingRules from JSONB union type
 */
export function safeBookingRules(
  value: BookingRules | Record<string, any> | null | undefined
): BookingRules {
  if (!value) return DEFAULT_BOOKING_RULES

  // Check if it has the expected BookingRules structure
  if (
    typeof value === 'object' &&
    'slotInterval' in value &&
    'defaultDuration' in value &&
    typeof value.slotInterval === 'number'
  ) {
    return value as BookingRules
  }

  return DEFAULT_BOOKING_RULES
}

/**
 * Safely extract DisplayPreferences from JSONB union type
 */
export function safeDisplayPreferences(
  value: DisplayPreferences | Record<string, any> | null | undefined
): DisplayPreferences {
  if (!value) return DEFAULT_DISPLAY_PREFERENCES

  // Check if it has the expected DisplayPreferences structure
  if (
    typeof value === 'object' &&
    'timelineStart' in value &&
    'timelineEnd' in value &&
    typeof value.timelineStart === 'string'
  ) {
    return value as DisplayPreferences
  }

  return DEFAULT_DISPLAY_PREFERENCES
}

/**
 * Safely extract VacationPeriods from JSONB union type
 */
export function safeVacationPeriods(
  value: VacationPeriod[] | any[] | null | undefined
): VacationPeriod[] {
  if (!value || !Array.isArray(value)) return []

  // Filter out invalid entries and ensure proper structure
  return value.filter(
    (period): period is VacationPeriod =>
      typeof period === 'object' &&
      period !== null &&
      'start' in period &&
      'end' in period &&
      'reason' in period &&
      typeof period.start === 'string' &&
      typeof period.end === 'string' &&
      typeof period.reason === 'string'
  )
}
