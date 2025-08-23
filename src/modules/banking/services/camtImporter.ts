// =====================================================
// CAMT.053 Importer - Database Integration & Duplicate Detection
// =====================================================
// Purpose: Import parsed CAMT data into database with duplicate prevention

import { supabase } from '@/shared/lib/supabase/client'
import { formatDateForAPI } from '@/shared/utils/dateUtils'
import type { BankTransactionInsert } from '@/types/database' // V6.1: Use real database type
import type { Json } from '@/types/supabase_generated_v6.1' // V6.1: Json type for JSONB fields
import type { CAMTDocument, CAMTDuplicateCheck, CAMTEntry, CAMTImportPreview } from '../types/camt'

// =====================================================
// DUPLICATE DETECTION
// =====================================================

export async function checkCAMTDuplicates(
  document: CAMTDocument,
  filename: string,
  bankAccountId: string
): Promise<CAMTDuplicateCheck> {
  const statement = document.statement
  const entries = statement.entries

  try {
    // 1. FILE-LEVEL CHECK: Has this file been imported before?
    const { data: fileCheck } = await supabase.rpc('check_file_already_imported', {
      p_filename: filename,
      p_bank_account_id: bankAccountId,
    })

    const fileAlreadyImported = fileCheck === true

    // 2. PERIOD-LEVEL CHECK: Do we have transactions in this date range?
    const { data: periodCheck } = await supabase.rpc('check_period_overlap', {
      p_from_date: formatDateForAPI(statement.fromDateTime),
      p_to_date: formatDateForAPI(statement.toDateTime),
      p_bank_account_id: bankAccountId,
    })

    const periodOverlap = periodCheck === true

    // 3. REFERENCE-LEVEL CHECK: Which AcctSvcrRef already exist?
    const references = entries.map((entry) => entry.accountServiceReference)
    const { data: duplicateRefs } = await supabase.rpc('check_duplicate_references', {
      p_references: references,
      p_bank_account_id: bankAccountId,
    })

    const duplicateReferences = new Set((duplicateRefs as string[]) || [])

    // 4. CATEGORIZE ENTRIES
    const newEntries: CAMTEntry[] = []
    const duplicateEntries: CAMTEntry[] = []
    const errorEntries: CAMTEntry[] = []

    for (const entry of entries) {
      // Check for validation errors (minimal validation)
      if (!entry.accountServiceReference) {
        errorEntries.push(entry)
        continue
      }

      // Check if reference already exists
      if (duplicateReferences.has(entry.accountServiceReference)) {
        duplicateEntries.push(entry)
      } else {
        newEntries.push(entry)
      }
    }

    return {
      totalEntries: entries.length,
      newEntries,
      duplicateEntries,
      errorEntries,
      fileAlreadyImported,
      periodOverlap,
    }
  } catch (error) {
    console.error('Error checking duplicates:', error)

    // Fallback: treat all as new entries if check fails
    return {
      totalEntries: entries.length,
      newEntries: entries,
      duplicateEntries: [],
      errorEntries: [],
      fileAlreadyImported: false,
      periodOverlap: false,
    }
  }
}

// =====================================================
// IMPORT PREVIEW GENERATION
// =====================================================

export async function generateImportPreview(
  document: CAMTDocument,
  filename: string,
  bankAccountId: string
): Promise<CAMTImportPreview> {
  const duplicateCheck = await checkCAMTDuplicates(document, filename, bankAccountId)

  // Determine if import is possible
  const importable =
    duplicateCheck.newEntries.length > 0 && duplicateCheck.errorEntries.length === 0

  return {
    filename,
    statement: document.statement,
    duplicateCheck,
    importable,
  }
}

// =====================================================
// DATABASE MAPPING
// =====================================================

function mapCAMTEntryToBankTransaction(
  entry: CAMTEntry,
  bankAccountId: string,
  filename: string,
  _userId: string,
  organizationId: string // ✅ ADDED: Multi-Tenant Security Parameter
): BankTransactionInsert {
  // Convert CRDT/DBIT to signed amount
  const signedAmount = entry.creditDebitIndicator === 'CRDT' ? entry.amount : -entry.amount

  // Serialize bank transaction code
  const _transactionCode = entry.bankTransactionCode
    ? `${entry.bankTransactionCode.domain}/${entry.bankTransactionCode.family}/${entry.bankTransactionCode.subfamily || ''}`
    : undefined

  return {
    bank_account_id: bankAccountId,
    transaction_date: formatDateForAPI(entry.bookingDate),
    value_date: formatDateForAPI(entry.valueDate), // V6.1: Use value_date instead of booking_date
    amount: signedAmount,
    description: entry.description,
    reference: entry.accountServiceReference,
    import_filename: filename,
    raw_data: entry as unknown as Json, // V6.1 Pattern 18: JSONB Json Type Compatibility
    status: 'unmatched',
    organization_id: organizationId, // V6.1: Multi-tenant requirement
    // Note: transaction_code, import_date, user_id not in V6.1 Insert schema
  }
}

// =====================================================
// IMPORT EXECUTION
// =====================================================

export async function executeCAMTImport(
  document: CAMTDocument,
  filename: string,
  bankAccountId: string,
  userId: string,
  organizationId: string // ✅ CRITICAL FIX: Multi-Tenant organization parameter
): Promise<{ success: boolean; importedCount: number; errors: string[] }> {
  try {
    // 1. Check duplicates one more time
    const duplicateCheck = await checkCAMTDuplicates(document, filename, bankAccountId)

    if (duplicateCheck.newEntries.length === 0) {
      return {
        success: false,
        importedCount: 0,
        errors: ['No new entries to import (all duplicates or errors)'],
      }
    }

    // 2. Map entries to database format
    const bankTransactions = duplicateCheck.newEntries.map(
      (entry) =>
        mapCAMTEntryToBankTransaction(entry, bankAccountId, filename, userId, organizationId) // ✅ FIXED: Pass organizationId
    )

    // 3. Insert bank transactions
    const { error: insertError } = await supabase
      .from('bank_transactions')
      .insert(bankTransactions)
      .select('id')

    if (insertError) {
      throw new Error(`Failed to insert transactions: ${insertError.message}`)
    }

    // V6.1: Import tracking handled via import_filename in bank_transactions
    // No session table needed - V6.1 uses direct filename-based duplicate prevention

    return {
      success: true,
      importedCount: duplicateCheck.newEntries.length,
      errors: [],
    }
  } catch (error) {
    console.error('Import execution failed:', error)

    // V6.1: Error tracking handled via application logs
    // No session table needed - import failures logged directly

    return {
      success: false,
      importedCount: 0,
      errors: [error instanceof Error ? error.message : 'Unknown import error'],
    }
  }
}

// =====================================================
// COMPLETE IMPORT WORKFLOW
// =====================================================

// PREVIEW ONLY - NO DATABASE WRITES
export async function previewCAMTFile(
  xmlContent: string,
  filename: string,
  bankAccountId: string
): Promise<{
  success: boolean
  preview?: CAMTImportPreview
  document?: CAMTDocument
  errors: string[]
}> {
  try {
    // 1. Parse XML
    const { parseCAMTXML } = await import('./camtParser')
    const parseResult = await parseCAMTXML(xmlContent)

    if (!parseResult.success || !parseResult.document) {
      return {
        success: false,
        errors: parseResult.errors,
      }
    }

    // 2. Generate preview only - NO IMPORT
    const preview = await generateImportPreview(parseResult.document, filename, bankAccountId)

    return {
      success: true,
      preview,
      document: parseResult.document,
      errors: [],
    }
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error in preview workflow'],
    }
  }
}

// EXECUTE IMPORT - ACTUAL DATABASE WRITES
export async function importCAMTFile(
  xmlContent: string,
  filename: string,
  bankAccountId: string,
  userId: string,
  organizationId: string // ✅ ADDED: Multi-Tenant support
): Promise<{
  success: boolean
  preview?: CAMTImportPreview
  importResult?: { importedCount: number; errors: string[] }
  errors: string[]
}> {
  try {
    // 1. Parse XML
    const { parseCAMTXML } = await import('./camtParser')
    const parseResult = await parseCAMTXML(xmlContent)

    if (!parseResult.success || !parseResult.document) {
      return {
        success: false,
        errors: parseResult.errors,
      }
    }

    // 2. Generate preview
    const preview = await generateImportPreview(parseResult.document, filename, bankAccountId)

    // 3. Execute import ONLY if importable
    if (preview.importable) {
      const importResult = await executeCAMTImport(
        parseResult.document,
        filename,
        bankAccountId,
        userId,
        organizationId // ✅ CRITICAL FIX: Pass organization ID
      )

      return {
        success: importResult.success,
        preview,
        importResult,
        errors: importResult.errors,
      }
    } else {
      return {
        success: false,
        preview,
        errors: ['Import not possible: No new entries or validation errors found'],
      }
    }
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error in import workflow'],
    }
  }
}

// =====================================================
// IMPORT HISTORY
// =====================================================

export async function getImportHistory(bankAccountId: string) {
  // V6.1: Use bank_transactions with import_filename for history tracking
  const { data, error } = await supabase
    .from('bank_transactions')
    .select('import_filename, created_at')
    .eq('bank_account_id', bankAccountId)
    .not('import_filename', 'is', null)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    // console.error('Failed to fetch import history:', error)
    return []
  }

  // Group by filename to get unique imports
  const uniqueImports = new Map()
  data?.forEach((transaction) => {
    if (transaction.import_filename && !uniqueImports.has(transaction.import_filename)) {
      uniqueImports.set(transaction.import_filename, {
        filename: transaction.import_filename,
        imported_at: transaction.created_at,
      })
    }
  })

  return Array.from(uniqueImports.values())
}
