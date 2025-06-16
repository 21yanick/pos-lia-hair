export interface BusinessSettings {
  id: string
  user_id: string
  
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
  
  // Logo
  logo_url?: string
  logo_storage_path?: string
  
  // Settings
  default_currency: string
  tax_rate: number
  pdf_show_logo: boolean
  pdf_show_company_details: boolean
  custom_expense_categories?: Record<string, string>
  
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
  default_currency: string
  tax_rate: number
  pdf_show_logo: boolean
  pdf_show_company_details: boolean
  custom_expense_categories?: Record<string, string>
}

export const DEFAULT_BUSINESS_SETTINGS: Partial<BusinessSettings> = {
  default_currency: 'CHF',
  tax_rate: 7.7,
  pdf_show_logo: true,
  pdf_show_company_details: true,
  custom_expense_categories: {},
}