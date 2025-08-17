// CSV Import Type Definitions
// Extends existing import system with CSV-specific functionality

import type { ExpenseImport, ItemImport, SaleImport } from '@/shared/types/import'

// =================================
// CSV Data Types
// =================================

export interface CsvRow {
  [key: string]: string | undefined // CSV values are always strings initially
}

export interface ParsedCsvData {
  headers: string[]
  rows: CsvRow[]
  meta: {
    totalRows: number
    emptyRows: number
    errors: string[]
  }
}

// =================================
// Column Mapping Types
// =================================

export type CsvImportType =
  | 'items'
  | 'sales'
  | 'expenses'
  | 'users'
  | 'owner_transactions'
  | 'bank_accounts'
  | 'suppliers'

// Field definitions for each import type
export interface ItemFieldMapping {
  name: string
  default_price: string
  type: string
  is_favorite?: string
  active?: string
}

export interface SaleFieldMapping {
  date: string
  time?: string
  total_amount: string
  payment_method: string
  status?: string
  items: string // Multi-item format: "Name:Price;Name2:Price2"
  notes?: string
}

export interface ExpenseFieldMapping {
  date: string
  amount: string
  description: string
  category: string
  payment_method: string
  supplier_name?: string
  invoice_number?: string
  notes?: string
}

export interface UserFieldMapping {
  name: string
  username: string
  email: string
  role: string
  active?: string
}

export interface OwnerTransactionFieldMapping {
  transaction_type: string
  amount: string
  description: string
  transaction_date: string
  payment_method: string
  notes?: string
}

export interface BankAccountFieldMapping {
  name: string
  bank_name: string
  iban?: string
  account_number?: string
  current_balance?: string
  is_active?: string
  notes?: string
}

export interface SupplierFieldMapping {
  name: string
  category: string
  contact_email?: string
  contact_phone?: string
  website?: string
  address_line1?: string
  address_line2?: string
  city?: string
  postal_code?: string
  country?: string
  iban?: string
  vat_number?: string
  is_active?: string
  notes?: string
}

export type FieldMapping =
  | ItemFieldMapping
  | SaleFieldMapping
  | ExpenseFieldMapping
  | UserFieldMapping
  | OwnerTransactionFieldMapping
  | BankAccountFieldMapping
  | SupplierFieldMapping

// =================================
// Column Mapping Configuration
// =================================

export interface ColumnMapping {
  csvHeader: string
  targetField: string | null
  required: boolean
  validated: boolean
  sampleValue?: string
}

export interface CsvMappingConfig {
  importType: CsvImportType
  mappings: Record<string, ColumnMapping>
  isValid: boolean
  validationErrors: string[]
}

// =================================
// CSV Import State
// =================================

export interface CsvImportState {
  status: 'idle' | 'file-loaded' | 'mapping' | 'preview' | 'importing' | 'success' | 'error'
  file: File | null
  parsedData: ParsedCsvData | null
  mappingConfig: CsvMappingConfig | null
  transformedData: {
    items?: ItemImport[]
    sales?: SaleImport[]
    expenses?: ExpenseImport[]
    users?: any[]
    owner_transactions?: any[]
    bank_accounts?: any[]
  } | null
  errors: string[]
  progress: number
}

// =================================
// Field Definitions for UI
// =================================

export interface FieldDefinition {
  key: string
  label: string
  required: boolean
  type: 'string' | 'number' | 'date' | 'time' | 'enum'
  enumValues?: string[]
  description?: string
  example?: string
}

// Predefined field definitions for each import type
export const FIELD_DEFINITIONS: Record<CsvImportType, FieldDefinition[]> = {
  items: [
    {
      key: 'name',
      label: 'Produktname',
      required: true,
      type: 'string',
      description: 'Name des Produkts oder Service',
      example: 'Haarschnitt Damen',
    },
    {
      key: 'default_price',
      label: 'Standardpreis',
      required: true,
      type: 'number',
      description: 'Preis in CHF',
      example: '65.00',
    },
    {
      key: 'type',
      label: 'Typ',
      required: true,
      type: 'enum',
      enumValues: ['service', 'product'],
      description: 'Produkt oder Service',
      example: 'service',
    },
    {
      key: 'is_favorite',
      label: 'Favorit',
      required: false,
      type: 'enum',
      enumValues: ['true', 'false', 'ja', 'nein', '1', '0'],
      description: 'Als Favorit markieren',
      example: 'true',
    },
    {
      key: 'active',
      label: 'Aktiv',
      required: false,
      type: 'enum',
      enumValues: ['true', 'false', 'ja', 'nein', '1', '0'],
      description: 'Aktiv/Inaktiv Status',
      example: 'true',
    },
  ],
  sales: [
    {
      key: 'date',
      label: 'Datum',
      required: true,
      type: 'date',
      description: 'Verkaufsdatum (YYYY-MM-DD)',
      example: '2024-01-15',
    },
    {
      key: 'time',
      label: 'Uhrzeit',
      required: false,
      type: 'time',
      description: 'Verkaufszeit (HH:MM)',
      example: '14:30',
    },
    {
      key: 'total_amount',
      label: 'Gesamtbetrag',
      required: true,
      type: 'number',
      description: 'Verkaufsbetrag in CHF',
      example: '65.00',
    },
    {
      key: 'payment_method',
      label: 'Zahlungsmethode',
      required: true,
      type: 'enum',
      enumValues: ['cash', 'twint', 'sumup'],
      description: 'Art der Zahlung',
      example: 'cash',
    },
    {
      key: 'items',
      label: 'Items',
      required: true,
      type: 'string',
      description: 'Items im Format: "Name:Preis;Name2:Preis2" (Semikolon-getrennt)',
      example: 'Haarschnitt Damen:60.00;Styling:25.00',
    },
    {
      key: 'notes',
      label: 'Notizen',
      required: false,
      type: 'string',
      description: 'Zusätzliche Bemerkungen',
      example: 'Stammkunde',
    },
  ],
  expenses: [
    {
      key: 'date',
      label: 'Datum',
      required: true,
      type: 'date',
      description: 'Ausgabendatum (YYYY-MM-DD)',
      example: '2024-01-15',
    },
    {
      key: 'amount',
      label: 'Betrag',
      required: true,
      type: 'number',
      description: 'Ausgabenbetrag in CHF',
      example: '150.00',
    },
    {
      key: 'description',
      label: 'Beschreibung',
      required: true,
      type: 'string',
      description: 'Was wurde gekauft/bezahlt',
      example: 'Miete Januar',
    },
    {
      key: 'category',
      label: 'Kategorie',
      required: true,
      type: 'enum',
      enumValues: ['rent', 'supplies', 'salary', 'utilities', 'insurance', 'other'],
      description: 'Ausgabenkategorie',
      example: 'rent',
    },
    {
      key: 'payment_method',
      label: 'Zahlungsmethode',
      required: true,
      type: 'enum',
      enumValues: ['bank', 'cash', 'überweisung', 'bar'],
      description: 'Art der Zahlung',
      example: 'bank',
    },
    {
      key: 'supplier_name',
      label: 'Lieferant',
      required: false,
      type: 'string',
      description: 'Name des Lieferanten/Empfängers',
      example: 'Migros',
    },
    {
      key: 'invoice_number',
      label: 'Rechnungsnummer',
      required: false,
      type: 'string',
      description: 'Externe Rechnungsnummer',
      example: 'RE-2024-001',
    },
    {
      key: 'notes',
      label: 'Notizen',
      required: false,
      type: 'string',
      description: 'Zusätzliche Bemerkungen',
      example: 'Monatliche Miete',
    },
  ],
  users: [
    {
      key: 'name',
      label: 'Name',
      required: true,
      type: 'string',
      description: 'Vollständiger Name des Benutzers',
      example: 'Maria Müller',
    },
    {
      key: 'username',
      label: 'Benutzername',
      required: true,
      type: 'string',
      description: 'Eindeutiger Benutzername',
      example: 'maria.mueller',
    },
    {
      key: 'email',
      label: 'E-Mail',
      required: true,
      type: 'string',
      description: 'E-Mail Adresse',
      example: 'maria@salon.ch',
    },
    {
      key: 'role',
      label: 'Rolle',
      required: true,
      type: 'enum',
      enumValues: ['admin', 'staff'],
      description: 'Benutzerrolle',
      example: 'staff',
    },
    {
      key: 'active',
      label: 'Aktiv',
      required: false,
      type: 'enum',
      enumValues: ['true', 'false', 'ja', 'nein', '1', '0'],
      description: 'Aktiv/Inaktiv Status',
      example: 'true',
    },
  ],
  owner_transactions: [
    {
      key: 'transaction_type',
      label: 'Transaktionstyp',
      required: true,
      type: 'enum',
      enumValues: ['deposit', 'expense', 'withdrawal'],
      description: 'Art der Transaktion',
      example: 'deposit',
    },
    {
      key: 'amount',
      label: 'Betrag',
      required: true,
      type: 'number',
      description: 'Transaktionsbetrag in CHF',
      example: '2000.00',
    },
    {
      key: 'description',
      label: 'Beschreibung',
      required: true,
      type: 'string',
      description: 'Beschreibung der Transaktion',
      example: 'Eigenkapital Einlage',
    },
    {
      key: 'transaction_date',
      label: 'Datum',
      required: true,
      type: 'date',
      description: 'Transaktionsdatum (YYYY-MM-DD)',
      example: '2024-01-15',
    },
    {
      key: 'payment_method',
      label: 'Zahlungsmethode',
      required: true,
      type: 'enum',
      enumValues: ['bank_transfer', 'private_card', 'private_cash'],
      description: 'Art der Zahlung',
      example: 'bank_transfer',
    },
    {
      key: 'notes',
      label: 'Notizen',
      required: false,
      type: 'string',
      description: 'Zusätzliche Bemerkungen',
      example: 'Startkapital für Salon',
    },
  ],
  bank_accounts: [
    {
      key: 'name',
      label: 'Kontoname',
      required: true,
      type: 'string',
      description: 'Name/Bezeichnung des Kontos',
      example: 'Geschäftskonto UBS',
    },
    {
      key: 'bank_name',
      label: 'Bankname',
      required: true,
      type: 'string',
      description: 'Name der Bank',
      example: 'UBS AG',
    },
    {
      key: 'iban',
      label: 'IBAN',
      required: false,
      type: 'string',
      description: 'IBAN Nummer',
      example: 'CH93 0076 2011 6238 5295 7',
    },
    {
      key: 'account_number',
      label: 'Kontonummer',
      required: false,
      type: 'string',
      description: 'Interne Kontonummer',
      example: '123456789',
    },
    {
      key: 'current_balance',
      label: 'Aktueller Saldo',
      required: false,
      type: 'number',
      description: 'Startguthaben in CHF',
      example: '5000.00',
    },
    {
      key: 'is_active',
      label: 'Aktiv',
      required: false,
      type: 'enum',
      enumValues: ['true', 'false', 'ja', 'nein', '1', '0'],
      description: 'Konto aktiv/inaktiv',
      example: 'true',
    },
    {
      key: 'notes',
      label: 'Notizen',
      required: false,
      type: 'string',
      description: 'Zusätzliche Bemerkungen',
      example: 'Hauptgeschäftskonto',
    },
  ],
  suppliers: [
    {
      key: 'name',
      label: 'Lieferantenname',
      required: true,
      type: 'string',
      description: 'Name des Lieferanten',
      example: 'Migros',
    },
    {
      key: 'category',
      label: 'Kategorie',
      required: true,
      type: 'enum',
      enumValues: [
        'beauty_supplies',
        'equipment',
        'utilities',
        'rent',
        'insurance',
        'professional_services',
        'retail',
        'online_marketplace',
        'real_estate',
        'other',
      ],
      description: 'Lieferantenkategorie',
      example: 'beauty_supplies',
    },
    {
      key: 'contact_email',
      label: 'E-Mail',
      required: false,
      type: 'string',
      description: 'Kontakt E-Mail Adresse',
      example: 'info@migros.ch',
    },
    {
      key: 'contact_phone',
      label: 'Telefon',
      required: false,
      type: 'string',
      description: 'Kontakt Telefonnummer',
      example: '+41 44 123 45 67',
    },
    {
      key: 'website',
      label: 'Website',
      required: false,
      type: 'string',
      description: 'Website URL',
      example: 'https://www.migros.ch',
    },
    {
      key: 'address_line1',
      label: 'Adresse',
      required: false,
      type: 'string',
      description: 'Strassenadresse',
      example: 'Limmatstrasse 152',
    },
    {
      key: 'address_line2',
      label: 'Adresszusatz',
      required: false,
      type: 'string',
      description: 'Zusätzliche Adressinformationen',
      example: '3. Stock, c/o Schmidt',
    },
    {
      key: 'city',
      label: 'Stadt',
      required: false,
      type: 'string',
      description: 'Stadt/Ort',
      example: 'Zürich',
    },
    {
      key: 'postal_code',
      label: 'PLZ',
      required: false,
      type: 'string',
      description: 'Postleitzahl',
      example: '8005',
    },
    {
      key: 'country',
      label: 'Land',
      required: false,
      type: 'string',
      description: 'Land (Default: CH)',
      example: 'CH',
    },
    {
      key: 'iban',
      label: 'IBAN',
      required: false,
      type: 'string',
      description: 'IBAN Nummer für Zahlungen',
      example: 'CH93 0076 2011 6238 5295 7',
    },
    {
      key: 'vat_number',
      label: 'MwSt-Nummer',
      required: false,
      type: 'string',
      description: 'Mehrwertsteuernummer',
      example: 'CHE-123.456.789',
    },
    {
      key: 'is_active',
      label: 'Aktiv',
      required: false,
      type: 'enum',
      enumValues: ['true', 'false', 'ja', 'nein', '1', '0'],
      description: 'Lieferant aktiv/inaktiv',
      example: 'true',
    },
    {
      key: 'notes',
      label: 'Notizen',
      required: false,
      type: 'string',
      description: 'Zusätzliche Bemerkungen',
      example: 'Hauptlieferant für Kosmetik',
    },
  ],
}

// =================================
// CSV Import Options
// =================================

export interface CsvParseOptions {
  delimiter?: string
  encoding?: string
  skipEmptyLines?: boolean
  header?: boolean
  preview?: number // Number of rows to preview
}

export interface CsvImportOptions {
  parseOptions: CsvParseOptions
  mappingConfig: CsvMappingConfig
  validateOnly?: boolean
  targetUserId: string
}

// =================================
// CSV Template Generation
// =================================

export interface CsvTemplate {
  type: CsvImportType
  headers: string[]
  sampleRows: string[][]
  description: string
  filename: string
}

// =================================
// Validation Results
// =================================

export interface CsvValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  stats: {
    totalRows: number
    validRows: number
    errorRows: number
    duplicateNames?: string[] // For items
  }
}

// =================================
// Helper Types
// =================================

export interface CsvPreviewData {
  headers: string[]
  rows: CsvRow[]
  totalRows: number
  displayRows: number
  hasMore: boolean
}
