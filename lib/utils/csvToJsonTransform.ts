// CSV to JSON Transformer
// Converts mapped CSV data to JSON format compatible with useImport hook

import type {
  CsvRow,
  ParsedCsvData,
  CsvMappingConfig,
  CsvValidationResult,
  CsvImportType
} from '@/lib/types/csvImport'

import type {
  ItemImport,
  SaleImport,
  ExpenseImport
} from '@/lib/types/import'

// =================================
// Main Transformer Class
// =================================

export class CsvToJsonTransformer {

  /**
   * Transform CSV data to JSON format based on mapping configuration
   * @param csvData Parsed CSV data
   * @param mappingConfig Column mapping configuration
   * @returns Transformed JSON data ready for import
   */
  static transform(
    csvData: ParsedCsvData,
    mappingConfig: CsvMappingConfig
  ): {
    items?: ItemImport[]
    sales?: SaleImport[]
    expenses?: ExpenseImport[]
  } {
    
    if (!mappingConfig.isValid) {
      throw new Error('Invalid mapping configuration. Cannot transform data.')
    }

    switch (mappingConfig.importType) {
      case 'items':
        return { items: this.transformItems(csvData, mappingConfig) }
      
      case 'sales':
        return { sales: this.transformSales(csvData, mappingConfig) }
      
      case 'expenses':
        return { expenses: this.transformExpenses(csvData, mappingConfig) }
      
      default:
        throw new Error(`Unsupported import type: ${mappingConfig.importType}`)
    }
  }

  /**
   * Transform CSV rows to ItemImport format
   * @param csvData Parsed CSV data
   * @param mappingConfig Mapping configuration
   * @returns Array of ItemImport objects
   */
  private static transformItems(
    csvData: ParsedCsvData,
    mappingConfig: CsvMappingConfig
  ): ItemImport[] {
    
    const items: ItemImport[] = []
    
    for (const row of csvData.rows) {
      try {
        const item: ItemImport = {
          name: this.getRequiredString(row, 'name', mappingConfig),
          default_price: this.getRequiredNumber(row, 'default_price', mappingConfig),
          type: this.getRequiredEnum(row, 'type', mappingConfig, ['service', 'product']) as 'service' | 'product',
          is_favorite: this.getOptionalBoolean(row, 'is_favorite', mappingConfig) ?? false,
          active: this.getOptionalBoolean(row, 'active', mappingConfig) ?? true
        }
        
        items.push(item)
        
      } catch (error) {
        throw new Error(`Row ${csvData.rows.indexOf(row) + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    
    return items
  }

  /**
   * Transform CSV rows to SaleImport format
   * @param csvData Parsed CSV data
   * @param mappingConfig Mapping configuration
   * @returns Array of SaleImport objects
   */
  private static transformSales(
    csvData: ParsedCsvData,
    mappingConfig: CsvMappingConfig
  ): SaleImport[] {
    
    const sales: SaleImport[] = []
    
    for (const row of csvData.rows) {
      try {
        const sale: SaleImport = {
          date: this.getRequiredDate(row, 'date', mappingConfig),
          time: this.getOptionalTime(row, 'time', mappingConfig) ?? '12:00',
          total_amount: this.getRequiredNumber(row, 'total_amount', mappingConfig),
          payment_method: this.normalizePaymentMethod(
            this.getRequiredEnum(row, 'payment_method', mappingConfig, ['cash', 'twint', 'sumup'])
          ) as 'cash' | 'twint' | 'sumup',
          status: 'completed' as const,
          items: [{
            item_name: this.getRequiredString(row, 'item_name', mappingConfig),
            price: this.getRequiredNumber(row, 'item_price', mappingConfig),
            notes: this.getOptionalString(row, 'notes', mappingConfig) || undefined
          }],
          notes: this.getOptionalString(row, 'notes', mappingConfig) || undefined
        }
        
        // Validate that item price equals total amount
        if (Math.abs(sale.items[0].price - sale.total_amount) > 0.01) {
          throw new Error(`Item price (${sale.items[0].price}) must equal total amount (${sale.total_amount})`)
        }
        
        sales.push(sale)
        
      } catch (error) {
        throw new Error(`Row ${csvData.rows.indexOf(row) + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    
    return sales
  }

  /**
   * Transform CSV rows to ExpenseImport format
   * @param csvData Parsed CSV data
   * @param mappingConfig Mapping configuration
   * @returns Array of ExpenseImport objects
   */
  private static transformExpenses(
    csvData: ParsedCsvData,
    mappingConfig: CsvMappingConfig
  ): ExpenseImport[] {
    
    const expenses: ExpenseImport[] = []
    
    for (const row of csvData.rows) {
      try {
        const expense: ExpenseImport = {
          date: this.getRequiredDate(row, 'date', mappingConfig),
          amount: this.getRequiredNumber(row, 'amount', mappingConfig),
          description: this.getRequiredString(row, 'description', mappingConfig),
          category: this.normalizeExpenseCategory(
            this.getRequiredEnum(row, 'category', mappingConfig, [
              'rent', 'supplies', 'salary', 'utilities', 'insurance', 'other'
            ])
          ) as 'rent' | 'supplies' | 'salary' | 'utilities' | 'insurance' | 'other',
          payment_method: this.normalizeExpensePaymentMethod(
            this.getRequiredEnum(row, 'payment_method', mappingConfig, ['bank', 'cash', 'überweisung', 'bar'])
          ) as 'bank' | 'cash',
          supplier_name: this.getOptionalString(row, 'supplier_name', mappingConfig) || undefined,
          invoice_number: this.getOptionalString(row, 'invoice_number', mappingConfig) || undefined,
          notes: this.getOptionalString(row, 'notes', mappingConfig) || undefined
        }
        
        expenses.push(expense)
        
      } catch (error) {
        throw new Error(`Row ${csvData.rows.indexOf(row) + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    
    return expenses
  }

  // =================================
  // Value Extraction Methods
  // =================================

  private static getRequiredString(
    row: CsvRow,
    fieldName: string,
    mappingConfig: CsvMappingConfig
  ): string {
    const mapping = mappingConfig.mappings[fieldName]
    if (!mapping || !mapping.csvHeader) {
      throw new Error(`Required field '${fieldName}' is not mapped`)
    }
    
    const value = row[mapping.csvHeader]?.trim()
    if (!value) {
      throw new Error(`Required field '${fieldName}' is empty`)
    }
    
    return value
  }

  private static getOptionalString(
    row: CsvRow,
    fieldName: string,
    mappingConfig: CsvMappingConfig
  ): string | null {
    const mapping = mappingConfig.mappings[fieldName]
    if (!mapping || !mapping.csvHeader) {
      return null
    }
    
    const value = row[mapping.csvHeader]?.trim()
    return value || null
  }

  private static getRequiredNumber(
    row: CsvRow,
    fieldName: string,
    mappingConfig: CsvMappingConfig
  ): number {
    const stringValue = this.getRequiredString(row, fieldName, mappingConfig)
    
    // Clean numeric string (remove currency symbols, thousands separators)
    const cleanValue = stringValue
      .replace(/[CHF\s₣]/g, '') // Remove currency symbols
      .replace(/[,\.]/g, (match, offset, string) => {
        // Keep only the last . or , as decimal separator
        const lastDecimalPos = Math.max(string.lastIndexOf('.'), string.lastIndexOf(','))
        return offset === lastDecimalPos ? '.' : ''
      })
    
    const number = parseFloat(cleanValue)
    
    if (isNaN(number) || number < 0) {
      throw new Error(`Field '${fieldName}' must be a positive number, got: ${stringValue}`)
    }
    
    return number
  }

  private static getOptionalNumber(
    row: CsvRow,
    fieldName: string,
    mappingConfig: CsvMappingConfig
  ): number | null {
    try {
      return this.getRequiredNumber(row, fieldName, mappingConfig)
    } catch {
      return null
    }
  }

  private static getRequiredDate(
    row: CsvRow,
    fieldName: string,
    mappingConfig: CsvMappingConfig
  ): string {
    const stringValue = this.getRequiredString(row, fieldName, mappingConfig)
    
    // Try to parse various date formats
    const dateFormats = [
      /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD (ISO format)
      /^\d{2}\.\d{2}\.\d{4}$/, // DD.MM.YYYY (German format)
      /^\d{2}\/\d{2}\/\d{4}$/, // DD/MM/YYYY or MM/DD/YYYY
      /^\d{1,2}\.\d{1,2}\.\d{4}$/, // D.M.YYYY or DD.M.YYYY etc.
    ]
    
    let normalizedDate = stringValue
    
    // Convert German format to ISO format
    if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(stringValue)) {
      const parts = stringValue.split('.')
      const day = parts[0].padStart(2, '0')
      const month = parts[1].padStart(2, '0')
      const year = parts[2]
      normalizedDate = `${year}-${month}-${day}`
    }
    
    // Validate the date
    const date = new Date(normalizedDate)
    if (isNaN(date.getTime())) {
      throw new Error(`Field '${fieldName}' must be a valid date (YYYY-MM-DD or DD.MM.YYYY), got: ${stringValue}`)
    }
    
    // Return in ISO format (YYYY-MM-DD)
    return normalizedDate.match(/^\d{4}-\d{2}-\d{2}$/) ? normalizedDate : date.toISOString().split('T')[0]
  }

  private static getOptionalTime(
    row: CsvRow,
    fieldName: string,
    mappingConfig: CsvMappingConfig
  ): string | null {
    const stringValue = this.getOptionalString(row, fieldName, mappingConfig)
    if (!stringValue) return null
    
    // Validate time format (HH:MM)
    const timePattern = /^([01]?\d|2[0-3]):([0-5]\d)$/
    if (!timePattern.test(stringValue)) {
      throw new Error(`Field '${fieldName}' must be in HH:MM format, got: ${stringValue}`)
    }
    
    return stringValue
  }

  private static getRequiredEnum(
    row: CsvRow,
    fieldName: string,
    mappingConfig: CsvMappingConfig,
    allowedValues: string[]
  ): string {
    const stringValue = this.getRequiredString(row, fieldName, mappingConfig).toLowerCase()
    
    if (!allowedValues.map(v => v.toLowerCase()).includes(stringValue)) {
      throw new Error(`Field '${fieldName}' must be one of: ${allowedValues.join(', ')}, got: ${stringValue}`)
    }
    
    return stringValue
  }

  private static getOptionalBoolean(
    row: CsvRow,
    fieldName: string,
    mappingConfig: CsvMappingConfig
  ): boolean | null {
    const stringValue = this.getOptionalString(row, fieldName, mappingConfig)
    if (!stringValue) return null
    
    const lowerValue = stringValue.toLowerCase()
    
    // True values
    if (['true', 'yes', 'ja', '1', 'y', 'x'].includes(lowerValue)) {
      return true
    }
    
    // False values
    if (['false', 'no', 'nein', '0', 'n', ''].includes(lowerValue)) {
      return false
    }
    
    throw new Error(`Field '${fieldName}' must be a boolean value (true/false, ja/nein, 1/0), got: ${stringValue}`)
  }

  // =================================
  // Value Normalization Methods
  // =================================

  private static normalizePaymentMethod(value: string): string {
    const normalized = value.toLowerCase()
    
    switch (normalized) {
      case 'cash':
        return 'cash'
      
      case 'sumup':
        return 'sumup'
      
      case 'twint':
        return 'twint'
      
      default:
        return normalized
    }
  }

  private static normalizeExpensePaymentMethod(value: string): string {
    const normalized = value.toLowerCase()
    
    switch (normalized) {
      case 'überweisung':
      case 'bank':
        return 'bank'
      
      case 'bar':
      case 'cash':
        return 'cash'
      
      default:
        return normalized
    }
  }

  private static normalizeExpenseCategory(value: string): string {
    const normalized = value.toLowerCase()
    
    // German to English mapping
    const categoryMap: { [key: string]: string } = {
      'miete': 'rent',
      'material': 'supplies',
      'supplies': 'supplies',
      'lohn': 'salary',
      'gehalt': 'salary',
      'salary': 'salary',
      'strom': 'utilities',
      'wasser': 'utilities',
      'utilities': 'utilities',
      'versicherung': 'insurance',
      'insurance': 'insurance',
      'sonstiges': 'other',
      'andere': 'other',
      'other': 'other'
    }
    
    return categoryMap[normalized] || normalized
  }
}

// =================================
// Validation Functions
// =================================

/**
 * Validate transformed data before import
 * @param data Transformed JSON data
 * @param importType Type of import
 * @returns Validation result
 */
export function validateTransformedData(
  data: { items?: ItemImport[], sales?: SaleImport[], expenses?: ExpenseImport[] },
  importType: CsvImportType
): CsvValidationResult {
  
  const errors: string[] = []
  const warnings: string[] = []
  let totalRows = 0
  let validRows = 0
  let duplicateNames: string[] = []

  switch (importType) {
    case 'items':
      if (data.items) {
        totalRows = data.items.length
        const itemValidation = validateItems(data.items)
        errors.push(...itemValidation.errors)
        warnings.push(...itemValidation.warnings)
        validRows = totalRows - itemValidation.errorCount
        duplicateNames = itemValidation.duplicateNames
      }
      break
    
    case 'sales':
      if (data.sales) {
        totalRows = data.sales.length
        const saleValidation = validateSales(data.sales)
        errors.push(...saleValidation.errors)
        warnings.push(...saleValidation.warnings)
        validRows = totalRows - saleValidation.errorCount
      }
      break
    
    case 'expenses':
      if (data.expenses) {
        totalRows = data.expenses.length
        const expenseValidation = validateExpenses(data.expenses)
        errors.push(...expenseValidation.errors)
        warnings.push(...expenseValidation.warnings)
        validRows = totalRows - expenseValidation.errorCount
      }
      break
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    stats: {
      totalRows,
      validRows,
      errorRows: totalRows - validRows,
      duplicateNames
    }
  }
}

function validateItems(items: ItemImport[]) {
  const errors: string[] = []
  const warnings: string[] = []
  let errorCount = 0
  
  // Check for duplicate names
  const names = items.map(item => item.name.toLowerCase())
  const duplicateNames = names.filter((name, index) => names.indexOf(name) !== index)
  
  if (duplicateNames.length > 0) {
    errors.push(`Duplicate item names found: ${[...new Set(duplicateNames)].join(', ')}`)
  }
  
  items.forEach((item, index) => {
    if (item.default_price <= 0) {
      errors.push(`Row ${index + 1}: Price must be positive`)
      errorCount++
    }
    
    if (item.name.length < 2) {
      warnings.push(`Row ${index + 1}: Item name is very short`)
    }
  })
  
  return { errors, warnings, errorCount, duplicateNames: [...new Set(duplicateNames)] }
}

function validateSales(sales: SaleImport[]) {
  const errors: string[] = []
  const warnings: string[] = []
  let errorCount = 0
  
  sales.forEach((sale, index) => {
    if (sale.total_amount <= 0) {
      errors.push(`Row ${index + 1}: Total amount must be positive`)
      errorCount++
    }
    
    if (new Date(sale.date) > new Date()) {
      warnings.push(`Row ${index + 1}: Sale date is in the future`)
    }
  })
  
  return { errors, warnings, errorCount }
}

function validateExpenses(expenses: ExpenseImport[]) {
  const errors: string[] = []
  const warnings: string[] = []
  let errorCount = 0
  
  expenses.forEach((expense, index) => {
    if (expense.amount <= 0) {
      errors.push(`Row ${index + 1}: Amount must be positive`)
      errorCount++
    }
    
    if (new Date(expense.date) > new Date()) {
      warnings.push(`Row ${index + 1}: Expense date is in the future`)
    }
  })
  
  return { errors, warnings, errorCount }
}