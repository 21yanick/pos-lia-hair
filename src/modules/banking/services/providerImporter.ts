// =====================================================
// Provider Import Service - TWINT & SumUp
// =====================================================
// Purpose: Orchestrate provider CSV import process
// Similar to camtImporter.ts but for provider CSV files

import { supabase } from '@/shared/lib/supabase/client'
import { formatDateForAPI } from '@/shared/utils/dateUtils'
import type {
  ProviderDuplicateCheck,
  ProviderImportError,
  ProviderImportPreview,
  ProviderImportResult,
  ProviderImportSession,
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
    // Create import session
    const importSession = await createProviderImportSession(preview, userId)

    // Execute import
    const result = await executeProviderImport(preview.newRecords, importSession.id, userId)

    // Update session status
    await updateProviderImportSession(importSession.id, 'completed', {
      records_imported: result.recordsImported,
      records_failed: result.recordsFailed,
    })

    return {
      ...result,
      importSessionId: importSession.id,
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

  // Check if file was already imported
  const { data: existingFile } = await supabase
    .from('provider_import_sessions')
    .select('id')
    .eq('filename', filename)
    .eq('status', 'completed')
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

async function createProviderImportSession(
  preview: ProviderImportPreview,
  userId: string
): Promise<ProviderImportSession> {
  const session: Omit<ProviderImportSession, 'id' | 'created_at'> = {
    provider: preview.provider,
    filename: preview.filename,
    import_type: 'csv',
    total_records: preview.totalRecords,
    new_records: preview.newRecords.length,
    duplicate_records: preview.duplicateRecords.length,
    error_records: preview.invalidRecords.length,
    date_range_from: formatDateForAPI(preview.dateRange.from),
    date_range_to: formatDateForAPI(preview.dateRange.to),
    status: 'pending',
    imported_by: userId,
    notes: `Provider: ${preview.detectedFormat}, Records: ${preview.newRecords.length} new, ${preview.duplicateRecords.length} duplicates`,
  }

  const { data, error } = await supabase
    .from('provider_import_sessions')
    .insert(session)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create import session: ${error.message}`)
  }

  return data
}

async function executeProviderImport(
  records: ProviderRecord[],
  sessionId: string,
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
      // Prepare provider_reports data
      const providerReports = batch.map((record) => ({
        provider: record.provider,
        transaction_date: formatDateForAPI(record.transaction_date),
        settlement_date: formatDateForAPI(record.settlement_date),
        gross_amount: record.gross_amount,
        fees: record.fees,
        net_amount: record.net_amount,
        provider_transaction_id: record.provider_transaction_id,
        provider_reference: record.provider_reference,
        payment_method: record.provider,
        currency: record.currency,
        import_filename: sessionId, // Use session ID as filename reference
        raw_data: record.raw_data,
        status: 'unmatched', // Must match provider_reports_status_check constraint
        user_id: userId,
        notes: record.description,
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

async function updateProviderImportSession(
  sessionId: string,
  status: 'completed' | 'failed',
  updates: { records_imported?: number; records_failed?: number }
): Promise<void> {
  const updateData: {
    status: 'completed' | 'failed'
    completed_at: string
    records_imported?: number
    records_failed?: number
  } = {
    status,
    completed_at: new Date().toISOString(),
  }

  // Add update fields that exist in the table
  if (updates.records_imported !== undefined) {
    updateData.records_imported = updates.records_imported
  }
  if (updates.records_failed !== undefined) {
    updateData.records_failed = updates.records_failed
  }

  const { error } = await supabase
    .from('provider_import_sessions')
    .update(updateData)
    .eq('id', sessionId)

  if (error) {
    // console.error('Failed to update import session:', error)
    // Don't throw - this is not critical for the import process
  }
}

// =====================================================
// EXPORTS
// =====================================================
// Functions are already exported inline above
