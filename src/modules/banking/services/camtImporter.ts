// =====================================================
// CAMT.053 Importer - Database Integration & Duplicate Detection
// =====================================================
// Purpose: Import parsed CAMT data into database with duplicate prevention

import { 
  CAMTDocument,
  CAMTEntry,
  CAMTDuplicateCheck,
  CAMTImportPreview,
  BankTransactionInsert,
  BankImportSessionInsert
} from '../types/camt'
import { supabase } from '@/shared/lib/supabase/client'
import { formatDateForAPI } from '@/shared/utils/dateUtils'

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
    const { data: fileCheck } = await supabase
      .rpc('check_file_already_imported' as any, {
        p_filename: filename,
        p_bank_account_id: bankAccountId
      })
    
    const fileAlreadyImported = fileCheck === true
    
    // 2. PERIOD-LEVEL CHECK: Do we have transactions in this date range?
    const { data: periodCheck } = await supabase
      .rpc('check_period_overlap' as any, {
        p_from_date: formatDateForAPI(statement.fromDateTime),
        p_to_date: formatDateForAPI(statement.toDateTime),
        p_bank_account_id: bankAccountId
      })
    
    const periodOverlap = periodCheck === true
    
    // 3. REFERENCE-LEVEL CHECK: Which AcctSvcrRef already exist?
    const references = entries.map(entry => entry.accountServiceReference)
    const { data: duplicateRefs } = await supabase
      .rpc('check_duplicate_references' as any, {
        p_references: references,
        p_bank_account_id: bankAccountId
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
      periodOverlap
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
      periodOverlap: false
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
  const importable = duplicateCheck.newEntries.length > 0 && duplicateCheck.errorEntries.length === 0
  
  return {
    filename,
    statement: document.statement,
    duplicateCheck,
    importable
  }
}

// =====================================================
// DATABASE MAPPING
// =====================================================

function mapCAMTEntryToBankTransaction(
  entry: CAMTEntry,
  bankAccountId: string,
  filename: string,
  userId: string
): BankTransactionInsert {
  // Convert CRDT/DBIT to signed amount
  const signedAmount = entry.creditDebitIndicator === 'CRDT' ? entry.amount : -entry.amount
  
  // Serialize bank transaction code
  const transactionCode = entry.bankTransactionCode 
    ? `${entry.bankTransactionCode.domain}/${entry.bankTransactionCode.family}/${entry.bankTransactionCode.subfamily || ''}`
    : undefined
  
  return {
    bank_account_id: bankAccountId,
    transaction_date: formatDateForAPI(entry.bookingDate),
    booking_date: formatDateForAPI(entry.valueDate),
    amount: signedAmount,
    description: entry.description,
    reference: entry.accountServiceReference,
    transaction_code: transactionCode,
    import_filename: filename,
    import_date: new Date().toISOString(),
    raw_data: entry,
    status: 'unmatched',
    user_id: userId
  }
}

// =====================================================
// IMPORT EXECUTION
// =====================================================

export async function executeCAMTImport(
  document: CAMTDocument,
  filename: string,
  bankAccountId: string,
  userId: string
): Promise<{ success: boolean; importedCount: number; errors: string[] }> {
  
  try {
    // 1. Check duplicates one more time
    const duplicateCheck = await checkCAMTDuplicates(document, filename, bankAccountId)
    
    if (duplicateCheck.newEntries.length === 0) {
      return {
        success: false,
        importedCount: 0,
        errors: ['No new entries to import (all duplicates or errors)']
      }
    }
    
    // 2. Map entries to database format
    const bankTransactions = duplicateCheck.newEntries.map(entry =>
      mapCAMTEntryToBankTransaction(entry, bankAccountId, filename, userId)
    )
    
    // 3. Insert bank transactions
    const { data: insertedTransactions, error: insertError } = await supabase
      .from('bank_transactions')
      .insert(bankTransactions as any)
      .select('id')
    
    if (insertError) {
      throw new Error(`Failed to insert transactions: ${insertError.message}`)
    }
    
    // 4. Create import session record
    const importSession: BankImportSessionInsert = {
      bank_account_id: bankAccountId,
      import_filename: filename,
      import_type: 'camt053',
      total_entries: duplicateCheck.totalEntries,
      new_entries: duplicateCheck.newEntries.length,
      duplicate_entries: duplicateCheck.duplicateEntries.length,
      error_entries: duplicateCheck.errorEntries.length,
      statement_from_date: formatDateForAPI(document.statement.fromDateTime),
      statement_to_date: formatDateForAPI(document.statement.toDateTime),
      status: 'completed',
      imported_by: userId,
      notes: `CAMT.053 import: ${document.statement.statementId}`
    }
    
    const { error: sessionError } = await supabase
      .from('bank_import_sessions' as any)
      .insert(importSession)
    
    if (sessionError) {
      console.warn('Failed to create import session:', sessionError)
      // Don't fail the import if session creation fails
    }
    
    return {
      success: true,
      importedCount: duplicateCheck.newEntries.length,
      errors: []
    }
    
  } catch (error) {
    console.error('Import execution failed:', error)
    
    // Try to create failed import session
    try {
      const failedSession: BankImportSessionInsert = {
        bank_account_id: bankAccountId,
        import_filename: filename,
        import_type: 'camt053',
        total_entries: document.statement.entries.length,
        new_entries: 0,
        duplicate_entries: 0,
        error_entries: document.statement.entries.length,
        statement_from_date: formatDateForAPI(document.statement.fromDateTime),
        statement_to_date: formatDateForAPI(document.statement.toDateTime),
        status: 'failed',
        imported_by: userId,
        notes: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
      
      await supabase.from('bank_import_sessions' as any).insert(failedSession)
    } catch (sessionError) {
      console.warn('Failed to create failed import session:', sessionError)
    }
    
    return {
      success: false,
      importedCount: 0,
      errors: [error instanceof Error ? error.message : 'Unknown import error']
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
        errors: parseResult.errors
      }
    }
    
    // 2. Generate preview only - NO IMPORT
    const preview = await generateImportPreview(parseResult.document, filename, bankAccountId)
    
    return {
      success: true,
      preview,
      document: parseResult.document,
      errors: []
    }
    
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error in preview workflow']
    }
  }
}

// EXECUTE IMPORT - ACTUAL DATABASE WRITES
export async function importCAMTFile(
  xmlContent: string,
  filename: string,
  bankAccountId: string,
  userId: string
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
        errors: parseResult.errors
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
        userId
      )
      
      return {
        success: importResult.success,
        preview,
        importResult,
        errors: importResult.errors
      }
    } else {
      return {
        success: false,
        preview,
        errors: ['Import not possible: No new entries or validation errors found']
      }
    }
    
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error in import workflow']
    }
  }
}

// =====================================================
// IMPORT HISTORY
// =====================================================

export async function getImportHistory(bankAccountId: string) {
  const { data, error } = await supabase
    .from('bank_import_sessions' as any)
    .select('*')
    .eq('bank_account_id', bankAccountId)
    .order('imported_at', { ascending: false })
    .limit(20)
  
  if (error) {
    console.error('Failed to fetch import history:', error)
    return []
  }
  
  return data || []
}