export interface BusinessSettings {
  id: string
  user_id: string
  organization_id: string

  // Company Data
  company_name?: string
  company_tagline?: string
  company_address?: string
  company_postal_code?: string
  company_city?: string
  company_phone?: string
  company_email?: string
  company_website?: string
  company_uid?: string

  // Logo (Business - for PDFs, receipts)
  logo_url?: string
  logo_storage_path?: string

  // App Logos (for UI, navigation, login)
  app_logo_light_url?: string
  app_logo_light_storage_path?: string
  app_logo_dark_url?: string
  app_logo_dark_storage_path?: string

  // Settings
  default_currency: string
  tax_rate: number
  pdf_show_logo: boolean
  pdf_show_company_details: boolean
  custom_expense_categories?: Record<string, string>
  custom_supplier_categories?: Record<string, string>

  // Appointment Settings (JSONB fields from database)
  working_hours: WorkingHours
  booking_rules: BookingRules
  display_preferences: DisplayPreferences
  vacation_periods: VacationPeriod[]

  // Timestamps
  created_at: string
  updated_at: string
}

export interface BusinessSettingsFormData {
  company_name: string
  company_tagline?: string
  company_address?: string
  company_postal_code?: string
  company_city?: string
  company_phone?: string
  company_email?: string
  company_website?: string
  company_uid?: string
  logo_url?: string
  logo_storage_path?: string
  app_logo_light_url?: string
  app_logo_light_storage_path?: string
  app_logo_dark_url?: string
  app_logo_dark_storage_path?: string
  default_currency: string
  tax_rate: number
  pdf_show_logo: boolean
  pdf_show_company_details: boolean
  custom_expense_categories?: Record<string, string>
  custom_supplier_categories?: Record<string, string>
  working_hours?: WorkingHours
  booking_rules?: BookingRules
  display_preferences?: DisplayPreferences
  vacation_periods?: VacationPeriod[]
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
