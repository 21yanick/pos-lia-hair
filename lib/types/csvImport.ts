// CSV Import Type Definitions
// Extends existing import system with CSV-specific functionality

import { ItemImport, SaleImport, ExpenseImport } from '@/lib/hooks/business/useImport'

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

export type CsvImportType = 'items' | 'sales' | 'expenses'

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
  item_name: string // For single-item sales
  item_price: string // For single-item sales
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

export type FieldMapping = ItemFieldMapping | SaleFieldMapping | ExpenseFieldMapping

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
      example: 'Haarschnitt Damen'
    },
    {
      key: 'default_price',
      label: 'Standardpreis',
      required: true,
      type: 'number',
      description: 'Preis in CHF',
      example: '65.00'
    },
    {
      key: 'type',
      label: 'Typ',
      required: true,
      type: 'enum',
      enumValues: ['service', 'product'],
      description: 'Produkt oder Service',
      example: 'service'
    },
    {
      key: 'is_favorite',
      label: 'Favorit',
      required: false,
      type: 'enum',
      enumValues: ['true', 'false', 'ja', 'nein', '1', '0'],
      description: 'Als Favorit markieren',
      example: 'true'
    },
    {
      key: 'active',
      label: 'Aktiv',
      required: false,
      type: 'enum',
      enumValues: ['true', 'false', 'ja', 'nein', '1', '0'],
      description: 'Aktiv/Inaktiv Status',
      example: 'true'
    }
  ],
  sales: [
    {
      key: 'date',
      label: 'Datum',
      required: true,
      type: 'date',
      description: 'Verkaufsdatum (YYYY-MM-DD)',
      example: '2024-01-15'
    },
    {
      key: 'time',
      label: 'Uhrzeit',
      required: false,
      type: 'time',
      description: 'Verkaufszeit (HH:MM)',
      example: '14:30'
    },
    {
      key: 'total_amount',
      label: 'Gesamtbetrag',
      required: true,
      type: 'number',
      description: 'Verkaufsbetrag in CHF',
      example: '65.00'
    },
    {
      key: 'payment_method',
      label: 'Zahlungsmethode',
      required: true,
      type: 'enum',
      enumValues: ['cash', 'twint', 'sumup'],
      description: 'Art der Zahlung',
      example: 'cash'
    },
    {
      key: 'item_name',
      label: 'Service/Produkt',
      required: true,
      type: 'string',
      description: 'Name des verkauften Items',
      example: 'Haarschnitt Damen'
    },
    {
      key: 'item_price',
      label: 'Item Preis',
      required: true,
      type: 'number',
      description: 'Preis des Items (muss gleich Gesamtbetrag sein)',
      example: '65.00'
    },
    {
      key: 'notes',
      label: 'Notizen',
      required: false,
      type: 'string',
      description: 'Zusätzliche Bemerkungen',
      example: 'Stammkunde'
    }
  ],
  expenses: [
    {
      key: 'date',
      label: 'Datum',
      required: true,
      type: 'date',
      description: 'Ausgabendatum (YYYY-MM-DD)',
      example: '2024-01-15'
    },
    {
      key: 'amount',
      label: 'Betrag',
      required: true,
      type: 'number',
      description: 'Ausgabenbetrag in CHF',
      example: '150.00'
    },
    {
      key: 'description',
      label: 'Beschreibung',
      required: true,
      type: 'string',
      description: 'Was wurde gekauft/bezahlt',
      example: 'Miete Januar'
    },
    {
      key: 'category',
      label: 'Kategorie',
      required: true,
      type: 'enum',
      enumValues: ['rent', 'supplies', 'salary', 'utilities', 'insurance', 'other'],
      description: 'Ausgabenkategorie',
      example: 'rent'
    },
    {
      key: 'payment_method',
      label: 'Zahlungsmethode',
      required: true,
      type: 'enum',
      enumValues: ['bank', 'cash', 'überweisung', 'bar'],
      description: 'Art der Zahlung',
      example: 'bank'
    },
    {
      key: 'supplier_name',
      label: 'Lieferant',
      required: false,
      type: 'string',
      description: 'Name des Lieferanten/Empfängers',
      example: 'Migros'
    },
    {
      key: 'invoice_number',
      label: 'Rechnungsnummer',
      required: false,
      type: 'string',
      description: 'Externe Rechnungsnummer',
      example: 'RE-2024-001'
    },
    {
      key: 'notes',
      label: 'Notizen',
      required: false,
      type: 'string',
      description: 'Zusätzliche Bemerkungen',
      example: 'Monatliche Miete'
    }
  ]
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