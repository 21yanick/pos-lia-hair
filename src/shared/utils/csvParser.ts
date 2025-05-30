// CSV Parser Utility using Papa Parse
// Handles CSV file parsing with robust error handling and validation

import Papa from 'papaparse'
import type { 
  ParsedCsvData, 
  CsvRow, 
  CsvParseOptions 
} from '@/shared/types/csvImport'

// =================================
// CSV Parser Class
// =================================

export class CsvParser {
  
  /**
   * Parse a CSV file with Papa Parse
   * @param file CSV file to parse
   * @param options Parse options
   * @returns Promise with parsed CSV data
   */
  static async parseFile(
    file: File, 
    options: CsvParseOptions = {}
  ): Promise<ParsedCsvData> {
    return new Promise((resolve, reject) => {
      const defaultOptions: Papa.ParseConfig = {
        header: false, // We'll handle headers manually for better control
        skipEmptyLines: true,
        delimiter: '', // Auto-detect
        encoding: 'UTF-8',
        complete: (results) => {
          try {
            const parsedData = this.processParseResults(results, options)
            resolve(parsedData)
          } catch (error) {
            reject(error)
          }
        },
        error: (error) => {
          reject(new Error(`CSV Parse Error: ${error.message}`))
        }
      }

      // Override defaults with user options
      const finalOptions: Papa.ParseConfig = {
        ...defaultOptions,
        delimiter: options.delimiter || '',
        skipEmptyLines: options.skipEmptyLines ?? true,
        preview: options.preview || 0 // 0 = parse all rows
      }

      Papa.parse(file, finalOptions)
    })
  }

  /**
   * Process Papa Parse results into our data structure
   * @param results Papa Parse results
   * @param options Original parse options
   * @returns Processed CSV data
   */
  private static processParseResults(
    results: Papa.ParseResult<string[]>,
    options: CsvParseOptions
  ): ParsedCsvData {
    
    if (!results.data || results.data.length === 0) {
      throw new Error('CSV file is empty or could not be parsed')
    }

    // Extract headers from first row
    const headers = this.extractHeaders(results.data[0])
    if (headers.length === 0) {
      throw new Error('CSV file has no valid headers')
    }

    // Convert remaining rows to objects
    const dataRows = results.data.slice(1)
    const { rows, emptyRows } = this.convertRowsToObjects(dataRows, headers)

    // Collect parsing errors
    const errors = results.errors?.map(error => 
      `Row ${error.row + 1}: ${error.message}`
    ) || []

    // Add validation errors
    if (headers.length !== new Set(headers).size) {
      errors.push('Duplicate column headers detected')
    }

    return {
      headers,
      rows,
      meta: {
        totalRows: results.data.length - 1, // Exclude header row
        emptyRows,
        errors
      }
    }
  }

  /**
   * Extract and validate headers from first row
   * @param headerRow First row of CSV
   * @returns Cleaned headers array
   */
  private static extractHeaders(headerRow: string[]): string[] {
    if (!headerRow || headerRow.length === 0) {
      return []
    }

    return headerRow
      .map(header => header?.toString().trim() || '')
      .filter(header => header.length > 0)
  }

  /**
   * Convert CSV rows to objects with header keys
   * @param dataRows CSV data rows
   * @param headers Column headers
   * @returns Object rows and empty row count
   */
  private static convertRowsToObjects(
    dataRows: string[][],
    headers: string[]
  ): { rows: CsvRow[], emptyRows: number } {
    
    const rows: CsvRow[] = []
    let emptyRows = 0

    for (const row of dataRows) {
      // Skip completely empty rows
      if (this.isEmptyRow(row)) {
        emptyRows++
        continue
      }

      // Convert row to object
      const rowObj: CsvRow = {}
      
      for (let i = 0; i < headers.length; i++) {
        const value = row[i]?.toString().trim() || ''
        rowObj[headers[i]] = value === '' ? undefined : value
      }

      rows.push(rowObj)
    }

    return { rows, emptyRows }
  }

  /**
   * Check if a CSV row is completely empty
   * @param row CSV row
   * @returns True if row is empty
   */
  private static isEmptyRow(row: string[]): boolean {
    return !row || row.every(cell => !cell || cell.toString().trim() === '')
  }

  /**
   * Auto-detect CSV delimiter
   * @param file CSV file
   * @returns Promise with detected delimiter
   */
  static async detectDelimiter(file: File): Promise<string> {
    return new Promise((resolve) => {
      Papa.parse(file, {
        preview: 5, // Only parse first 5 rows for detection
        complete: (results) => {
          // Papa Parse automatically detects delimiter
          const delimiter = results.meta.delimiter || ','
          resolve(delimiter)
        },
        error: () => {
          resolve(',') // Default to comma if detection fails
        }
      })
    })
  }

  /**
   * Validate CSV file before parsing
   * @param file File to validate
   * @returns Validation result
   */
  static validateFile(file: File): { isValid: boolean, errors: string[] } {
    const errors: string[] = []

    // Check file type
    if (!file.type.includes('csv') && !file.name.endsWith('.csv')) {
      errors.push('File must be a CSV file (.csv)')
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      errors.push(`File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`)
    }

    // Check file is not empty
    if (file.size === 0) {
      errors.push('File is empty')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Get preview of CSV data without full parsing
   * @param file CSV file
   * @param previewRows Number of rows to preview
   * @returns Promise with preview data
   */
  static async getPreview(
    file: File, 
    previewRows: number = 10
  ): Promise<ParsedCsvData> {
    const options: CsvParseOptions = {
      preview: previewRows + 1 // +1 for header row
    }
    
    return this.parseFile(file, options)
  }
}

// =================================
// CSV Data Utilities
// =================================

/**
 * Analyze CSV data structure and suggest import type
 * @param data Parsed CSV data
 * @returns Suggested import type and confidence
 */
export function suggestImportType(data: ParsedCsvData): {
  type: 'items' | 'sales' | 'expenses' | 'unknown'
  confidence: number
  reasoning: string[]
} {
  const headers = data.headers.map(h => h.toLowerCase())
  const reasoning: string[] = []
  
  // Item patterns
  const itemPatterns = ['name', 'product', 'service', 'price', 'preis']
  const itemMatches = headers.filter(h => 
    itemPatterns.some(pattern => h.includes(pattern))
  ).length
  
  // Sales patterns
  const salesPatterns = ['date', 'datum', 'amount', 'betrag', 'payment', 'zahlung', 'total']
  const salesMatches = headers.filter(h => 
    salesPatterns.some(pattern => h.includes(pattern))
  ).length
  
  // Expense patterns
  const expensePatterns = ['expense', 'ausgabe', 'cost', 'kosten', 'category', 'kategorie', 'supplier', 'lieferant']
  const expenseMatches = headers.filter(h => 
    expensePatterns.some(pattern => h.includes(pattern))
  ).length

  // Determine best match
  const maxMatches = Math.max(itemMatches, salesMatches, expenseMatches)
  
  if (maxMatches === 0) {
    return {
      type: 'unknown',
      confidence: 0,
      reasoning: ['No recognizable patterns found in headers']
    }
  }

  const confidence = Math.min(maxMatches / headers.length * 100, 100)

  if (itemMatches === maxMatches) {
    reasoning.push(`Found ${itemMatches} item-related headers`)
    return { type: 'items', confidence, reasoning }
  }
  
  if (salesMatches === maxMatches) {
    reasoning.push(`Found ${salesMatches} sales-related headers`)
    return { type: 'sales', confidence, reasoning }
  }
  
  if (expenseMatches === maxMatches) {
    reasoning.push(`Found ${expenseMatches} expense-related headers`)
    return { type: 'expenses', confidence, reasoning }
  }

  return {
    type: 'unknown',
    confidence: 0,
    reasoning: ['Could not determine import type']
  }
}

/**
 * Get statistics about CSV data
 * @param data Parsed CSV data
 * @returns Data statistics
 */
export function getCsvStats(data: ParsedCsvData): {
  totalRows: number
  totalColumns: number
  emptyRows: number
  emptyColumns: number
  dataQuality: number
} {
  const totalRows = data.rows.length
  const totalColumns = data.headers.length
  const emptyRows = data.meta.emptyRows

  // Count empty columns (columns with all empty values)
  const emptyColumns = data.headers.filter(header => 
    data.rows.every(row => !row[header] || row[header].trim() === '')
  ).length

  // Calculate data quality score (0-100)
  const filledCells = data.rows.reduce((count, row) => {
    return count + Object.values(row).filter(value => 
      value !== undefined && value.trim() !== ''
    ).length
  }, 0)
  
  const totalCells = totalRows * totalColumns
  const dataQuality = totalCells > 0 ? Math.round((filledCells / totalCells) * 100) : 0

  return {
    totalRows,
    totalColumns,
    emptyRows,
    emptyColumns,
    dataQuality
  }
}

/**
 * Export utility: Convert data back to CSV string
 * @param headers Column headers
 * @param rows Data rows
 * @returns CSV string
 */
export function generateCsvString(headers: string[], rows: (string | number)[][]): string {
  const csvData = [headers, ...rows]
  return Papa.unparse(csvData)
}