// =====================================================
// Provider Import Service - TWINT & SumUp
// =====================================================
// Purpose: Orchestrate provider CSV import process
// Similar to camtImporter.ts but for provider CSV files

import { supabase } from '@/shared/lib/supabase/client'
import { formatDateForAPI } from '@/shared/utils/dateUtils'
import type { Json } from '@/types/supabase_generated_v6.1' // V6.1: Json type for JSONB fields
import type {
  ProviderDuplicateCheck,
  ProviderImportError,
  ProviderImportPreview,
  ProviderImportResult,
  ProviderRecord,
} from '../types/provider'
import {
  detectProviderType,
  parseSumUpCsv,
  parseTWINTCsv,
  validateProviderRecord,
} from './providerParsers'

// =====================================================
// PREVIEW PROVIDER FILE
// =====================================================

export async function previewProviderFile(file: File): Promise<ProviderImportPreview> {
  try {
    // Read file content
    const csvContent = await file.text()

    // Auto-detect provider type
    const detection = detectProviderType(csvContent)

    if (detection.provider === 'unknown') {
      throw new Error(
        'Could not detect provider type. Please ensure this is a valid TWINT or SumUp CSV file.'
      )
    }

    // Parse CSV based on detected provider
    let parseResult: { records: ProviderRecord[]; errors: ProviderImportError[] }

    if (detection.provider === 'twint') {
      parseResult = parseTWINTCsv(csvContent)
    } else {
      parseResult = parseSumUpCsv(csvContent)
    }

    const { records, errors } = parseResult

    // Validate records
    const validRecords: ProviderRecord[] = []
    const invalidRecords: ProviderImportError[] = [...errors]

    records.forEach((record, index) => {
      const validationErrors = validateProviderRecord(record)
      if (validationErrors.length === 0) {
        validRecords.push(record)
      } else {
        invalidRecords.push({
          rowIndex: index + 1,
          field: 'validation',
          value: JSON.stringify(record),
          error: validationErrors.map((e) => e.message).join('; '),
          rawRow: record.raw_data as unknown as Record<string, string>,
        })
      }
    })

    // Check for duplicates
    const duplicateCheck = await checkProviderDuplicates(validRecords, file.name)

    // Calculate summary statistics
    const totalAmount = duplicateCheck.newRecords.reduce(
      (sum, record) => sum + record.gross_amount,
      0
    )
    const totalFees = duplicateCheck.newRecords.reduce((sum, record) => sum + record.fees, 0)

    // Date range
    let dateRange = { from: new Date(), to: new Date() }
    if (duplicateCheck.newRecords.length > 0) {
      const dates = duplicateCheck.newRecords.map((r) => r.transaction_date)
      dateRange = {
        from: new Date(Math.min(...dates.map((d) => d.getTime()))),
        to: new Date(Math.max(...dates.map((d) => d.getTime()))),
      }
    }

    // Generate warnings
    const warnings: string[] = []
    if (duplicateCheck.duplicateRecords.length > 0) {
      warnings.push(
        `${duplicateCheck.duplicateRecords.length} duplicate transactions found and will be skipped`
      )
    }
    if (invalidRecords.length > 0) {
      warnings.push(`${invalidRecords.length} records have validation errors and will be skipped`)
    }
    if (detection.confidence < 0.8) {
      warnings.push(
        `Provider detection confidence is low (${Math.round(detection.confidence * 100)}%)`
      )
    }

    return {
      filename: file.name,
      provider: detection.provider,
      detectedFormat:
        detection.provider === 'twint' ? 'TWINT CSV Report' : 'SumUp Transactions Report',
      totalRecords: records.length,
      validRecords,
      invalidRecords,
      duplicateRecords: duplicateCheck.duplicateRecords,
      newRecords: duplicateCheck.newRecords,
      totalAmount,
      totalFees,
      dateRange,
      importable: duplicateCheck.newRecords.length > 0,
      warnings,
    }
  } catch (error) {
    throw new Error(
      `Failed to preview provider file: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

// =====================================================
// IMPORT PROVIDER FILE
// =====================================================

export async function importProviderFile(
  preview: ProviderImportPreview,
  userId: string
): Promise<ProviderImportResult> {
  const startTime = Date.now()

  try {
    // V6.1: Direct import without session tracking
    const result = await executeProviderImport(preview.newRecords, preview.filename, userId)

    return {
      ...result,
      importSessionId: preview.filename, // Use filename as reference
      processingTimeMs: Date.now() - startTime,
    }
  } catch (error) {
    throw new Error(
      `Failed to import provider file: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

// =====================================================
// DUPLICATE DETECTION
// =====================================================

async function checkProviderDuplicates(
  records: ProviderRecord[],
  filename: string
): Promise<ProviderDuplicateCheck> {
  const newRecords: ProviderRecord[] = []
  const duplicateRecords: ProviderRecord[] = []
  const errorRecords: ProviderImportError[] = []

  // V6.1: Check if file was already imported using provider_reports table
  const { data: existingFile } = await supabase
    .from('provider_reports')
    .select('id')
    .eq('report_filename', filename)
    .limit(1)

  const fileAlreadyImported = (existingFile?.length || 0) > 0

  // Check each record for duplicates
  for (const record of records) {
    try {
      const { data: existing } = await supabase
        .from('provider_reports')
        .select('id')
        .eq('provider', record.provider)
        .eq('provider_transaction_id', record.provider_transaction_id)
        .eq('transaction_date', formatDateForAPI(record.transaction_date))
        .eq('gross_amount', record.gross_amount)
        .limit(1)

      if (existing && existing.length > 0) {
        duplicateRecords.push(record)
      } else {
        newRecords.push(record)
      }
    } catch (error) {
      errorRecords.push({
        rowIndex: 0,
        field: 'duplicate_check',
        value: record.provider_transaction_id,
        error: `Failed to check for duplicates: ${error instanceof Error ? error.message : 'Unknown error'}`,
        rawRow: record.raw_data as unknown as Record<string, string>,
      })
    }
  }

  return {
    totalRecords: records.length,
    newRecords,
    duplicateRecords,
    errorRecords,
    fileAlreadyImported,
  }
}

// =====================================================
// DATABASE OPERATIONS
// =====================================================

// V6.1 NOTE: Session functions removed - V6.1 uses direct filename tracking
// Import tracking handled via report_filename field in provider_reports table

async function executeProviderImport(
  records: ProviderRecord[],
  filename: string,
  userId: string
): Promise<Omit<ProviderImportResult, 'importSessionId' | 'processingTimeMs'>> {
  const importedRecords: ProviderRecord[] = []
  const errors: ProviderImportError[] = []
  const providerReportIds: string[] = []

  // Process records in batches of 50
  const batchSize = 50
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize)

    try {
      // V6.1: Adapt to settlement-level provider_reports schema
      const providerReports = batch.map((record) => ({
        provider: record.provider,
        report_date: formatDateForAPI(record.transaction_date), // V6.1 required field
        settlement_date: formatDateForAPI(record.settlement_date),
        gross_amount: record.gross_amount,
        fees: record.fees,
        net_amount: record.net_amount,
        transaction_count: 1, // V6.1 required field - single transaction per report
        currency: record.currency,
        report_filename: filename, // V6.1 field name
        raw_data: record.raw_data as unknown as Json, // V6.1 Pattern 18: JSONB Json Type Compatibility
        status: 'pending', // V6.1 constraint: pending/matched/settled
        organization_id: userId, // V6.1 multi-tenant
      }))

      // Insert batch
      const { data, error } = await supabase
        .from('provider_reports')
        .insert(providerReports)
        .select('id')

      if (error) {
        // Handle individual record errors
        batch.forEach((record, index) => {
          errors.push({
            rowIndex: i + index + 1,
            field: 'database_insert',
            value: record.provider_transaction_id,
            error: error.message,
            rawRow: record.raw_data as unknown as Record<string, string>,
          })
        })
      } else {
        // Success - track imported records
        importedRecords.push(...batch)
        if (data) {
          providerReportIds.push(...data.map((row) => row.id))
        }
      }
    } catch (error) {
      // Handle batch errors
      batch.forEach((record, index) => {
        errors.push({
          rowIndex: i + index + 1,
          field: 'batch_processing',
          value: record.provider_transaction_id,
          error: error instanceof Error ? error.message : 'Unknown batch error',
          rawRow: record.raw_data as unknown as Record<string, string>,
        })
      })
    }
  }

  return {
    success: importedRecords.length > 0,
    recordsProcessed: records.length,
    recordsImported: importedRecords.length,
    recordsSkipped: 0, // Duplicates were already filtered out
    recordsFailed: errors.length,
    importedRecords,
    errors,
    providerReportIds,
  }
}

// V6.1 NOTE: Session update functions removed - V6.1 uses direct import tracking

// =====================================================
// EXPORTS
// =====================================================
// Functions are already exported inline above
