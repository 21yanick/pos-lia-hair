/**
 * PDF Archive Service
 *
 * Handles timestamp-based PDF archiving for audit trail
 * - No version number collisions
 * - Unlimited regenerations
 * - Full traceability
 */

import { supabase } from '@/shared/lib/supabase/client'
import type {
  DocumentArchiveUpdate,
  DocumentLinkUpdate,
  DocumentWithVersioning,
} from '@/types/database'

/**
 * Archive old PDF with timestamp-based filename
 *
 * Naming Convention:
 * - Original: quittung-abc-123.pdf
 * - Archive: quittung-abc-123-archived-2025-10-14T15-30-00.pdf
 *
 * @param transactionId - Sale or Expense ID
 * @param transactionType - 'sale' or 'expense'
 * @param organizationId - Multi-tenant isolation
 * @param reason - Why archived: 'customer_changed' | 'correction' | 'data_fix'
 * @returns Archived document ID or null if no PDF exists
 */
export const archiveOldPdf = async (
  transactionId: string,
  transactionType: 'sale' | 'expense',
  organizationId: string,
  reason: 'customer_changed' | 'correction' | 'data_fix'
): Promise<string | null> => {
  // 1. Get current active PDF
  const { data: oldDoc, error } = await supabase
    .from('documents')
    .select('id, file_path, created_at')
    .eq('reference_id', transactionId)
    .eq('type', transactionType === 'sale' ? 'receipt' : 'expense_receipt')
    .eq('organization_id', organizationId)
    .is('replacement_reason', null) // Only active PDFs (not already archived)
    .maybeSingle()

  if (error || !oldDoc) {
    console.log('No active PDF found to archive')
    return null
  }

  // 2. Generate timestamp-based archived filename
  // Defensive: created_at should always exist (PostgreSQL DEFAULT now()), but handle null
  const createdAt = oldDoc.created_at ? new Date(oldDoc.created_at) : new Date()
  const timestamp = createdAt
    .toISOString()
    .replace(/[:.]/g, '-') // Remove colons and dots: 2025-10-14T15:30:00 → 2025-10-14T15-30-00
    .substring(0, 19) // Keep only date + time (no milliseconds/timezone)

  // Transform filename: quittung-abc-123.pdf → quittung-abc-123-archived-2025-10-14T15-30-00.pdf
  const oldPath = oldDoc.file_path
  const archivedPath = oldPath.replace('.pdf', `-archived-${timestamp}.pdf`)

  // 3. Move file in storage (atomic operation)
  const { error: moveError } = await supabase.storage.from('documents').move(oldPath, archivedPath)

  if (moveError) {
    console.error('Failed to move PDF to archive:', moveError)
    return null
  }

  // 4. Update document record (mark as archived)
  const updateData: DocumentArchiveUpdate = {
    file_path: archivedPath,
    replacement_reason: reason,
    notes: `Archived at ${new Date().toISOString()} - Reason: ${reason}`,
  }

  const { error: updateError } = await supabase
    .from('documents')
    .update(updateData as Record<string, unknown>)
    .eq('id', oldDoc.id)

  if (updateError) {
    console.error('Failed to update document record:', updateError)
    return null
  }

  console.log(`✅ PDF archived: ${archivedPath}`)
  return oldDoc.id
}

/**
 * Link old PDF to new PDF (audit trail chain)
 *
 * Creates bidirectional link for traceability:
 * - Old document has replaced_by → new document
 * - New document can query "replaced what" via reverse lookup
 *
 * @param oldDocId - Archived document ID
 * @param newDocId - New/current document ID
 */
export const linkPdfVersions = async (oldDocId: string, newDocId: string): Promise<void> => {
  const linkData: DocumentLinkUpdate = {
    replaced_by: newDocId,
  }

  const { error } = await supabase
    .from('documents')
    .update(linkData as Record<string, unknown>)
    .eq('id', oldDocId)

  if (error) {
    console.error('Failed to link PDF versions:', error)
  } else {
    console.log(`✅ PDF versions linked: ${oldDocId} → ${newDocId}`)
  }
}

/**
 * Get PDF version history for a transaction
 *
 * @param transactionId - Sale or Expense ID
 * @param organizationId - Multi-tenant isolation
 * @returns Array of document versions (newest first)
 */
export const getPdfVersionHistory = async (
  transactionId: string,
  organizationId: string
): Promise<
  Array<{
    id: string
    file_path: string
    created_at: string | null
    replacement_reason: string | null
    is_current: boolean
  }>
> => {
  const { data, error } = await supabase
    .from('documents')
    .select('id, file_path, created_at')
    .eq('reference_id', transactionId)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error || !data) {
    console.error('Failed to get PDF history:', error)
    return []
  }

  // Map documents with versioning info (columns added in migration 07)
  return data.map((doc) => {
    const docWithVersioning = doc as unknown as DocumentWithVersioning
    return {
      ...doc,
      replacement_reason: docWithVersioning.replacement_reason || null,
      is_current:
        docWithVersioning.replacement_reason === null ||
        docWithVersioning.replacement_reason === undefined,
    }
  })
}
