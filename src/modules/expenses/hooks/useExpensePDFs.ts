'use client'

import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/shared/lib/supabase/client'
import { useOrganization } from '@/shared/contexts/OrganizationContext'
import type { DocumentWithDetails } from '@/shared/hooks/business/useDocuments'

// 🛡️ SECURITY FIXED: useExpensePDFs Hook - Multi-Tenant Organization Security
// ✅ FIXED: All documents queries now organization-scoped
// ✅ FIXED: All documents deletes now organization-scoped  
// ✅ FIXED: Security guards prevent cross-tenant data access

export type ExpensePDF = DocumentWithDetails & {
  expenseId: string
}

// 🔄 GLOBAL CACHE: Shared across all hook instances for real-time sync
let globalPdfsCache: Record<string, ExpensePDF[]> = {}
const cacheSyncCallbacks = new Set<() => void>()

function updateGlobalCache(newCache: Record<string, ExpensePDF[]>) {
  globalPdfsCache = newCache
  // Notify all hook instances about the cache change
  cacheSyncCallbacks.forEach(callback => callback())
}

export function useExpensePDFs() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [localCacheVersion, setLocalCacheVersion] = useState(0)
  
  // 🔒 SECURITY: Multi-Tenant Organization Context
  const { currentOrganization } = useOrganization()

  // 🔄 SYNC: Register for global cache updates
  useEffect(() => {
    const syncCallback = () => setLocalCacheVersion(prev => prev + 1)
    cacheSyncCallbacks.add(syncCallback)
    
    return () => {
      cacheSyncCallbacks.delete(syncCallback)
    }
  }, [])

  // 🛡️ SECURITY GUARD - Consistent across all functions
  const securityGuard = () => {
    if (!currentOrganization) {
      throw new Error('Keine Organization ausgewählt. Multi-Tenant Sicherheit verletzt.')
    }
    return currentOrganization.id
  }

  const getStorageUrl = async (filePath: string) => {
    try {
      const { data: urlData, error: urlError } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 3600)
      
      if (urlError) {
        const { data: publicData } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath)
        return publicData.publicUrl
      }
      
      return urlData.signedUrl
    } catch (err) {
      console.error("Fehler beim Abrufen der Storage URL:", err)
      return ""
    }
  }

  const loadExpensePDFs = useCallback(async (expenseId: string): Promise<ExpensePDF[]> => {
    // 🛡️ VALIDATION: Skip temporary IDs from optimistic updates
    if (expenseId.startsWith('temp-')) {
      console.log('⏳ Skipping PDF load for temporary expense ID:', expenseId)
      return []
    }

    if (globalPdfsCache[expenseId]) {
      return globalPdfsCache[expenseId]
    }

    try {
      setLoading(true)
      setError(null)

      // 🔒 SECURITY: Organization required (CRITICAL FIX)
      const organizationId = securityGuard()

      const { data: documents, error: documentsError } = await supabase
        .from('documents')
        .select('*')
        .eq('type', 'expense_receipt')
        .eq('reference_id', expenseId)
        .eq('organization_id', organizationId) // 🔒 SECURITY: Organization-scoped (CRITICAL FIX)
        .order('created_at', { ascending: false })

      if (documentsError) {
        throw documentsError
      }

      const enrichedPDFs: ExpensePDF[] = await Promise.all(
        (documents || []).map(async (doc) => {
          const url = doc.file_path ? await getStorageUrl(doc.file_path) : ""
          
          return {
            ...doc,
            expenseId,
            url,
            displayName: doc.file_name || `Beleg ${doc.created_at?.split('T')[0]}`,
            description: doc.notes || 'Ausgaben-Beleg',
            fileType: doc.file_path ? doc.file_path.split('.').pop() : 'pdf'
          }
        })
      )

      updateGlobalCache({ ...globalPdfsCache, [expenseId]: enrichedPDFs })
      return enrichedPDFs

    } catch (err: any) {
      console.error('Fehler beim Laden der Expense PDFs:', err)
      setError(err.message || 'Fehler beim Laden der PDFs')
      return []
    } finally {
      setLoading(false)
    }
  }, [currentOrganization, localCacheVersion])

  const getExpensePDFsFromCache = useCallback((expenseId: string): ExpensePDF[] => {
    // 🛡️ VALIDATION: Temporary IDs return empty array
    if (expenseId.startsWith('temp-')) {
      return []
    }
    
    return globalPdfsCache[expenseId] || []
  }, [localCacheVersion])

  const hasExpensePDFs = useCallback((expenseId: string): boolean => {
    // 🛡️ VALIDATION: Temporary IDs never have PDFs
    if (expenseId.startsWith('temp-')) {
      return false
    }
    
    const cached = globalPdfsCache[expenseId]
    return cached ? cached.length > 0 : false
  }, [localCacheVersion])

  const invalidateCache = useCallback((expenseId?: string) => {
    if (expenseId) {
      const newCache = { ...globalPdfsCache }
      delete newCache[expenseId]
      updateGlobalCache(newCache)
    } else {
      updateGlobalCache({})
    }
  }, [])

  const deleteExpensePDF = useCallback(async (documentId: string, expenseId: string) => {
    try {
      setLoading(true)
      setError(null)

      // 🔒 SECURITY: Organization required (CRITICAL FIX)
      const organizationId = securityGuard()

      const { data: docData, error: fetchError } = await supabase
        .from('documents')
        .select('file_path')
        .eq('id', documentId)
        .eq('organization_id', organizationId) // 🔒 SECURITY: Organization-scoped (CRITICAL FIX)
        .single()

      if (fetchError) {
        throw fetchError
      }

      if (docData?.file_path) {
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([docData.file_path])

        if (storageError) {
          console.warn('Warnung: Datei konnte nicht aus Storage gelöscht werden:', storageError.message)
        }
      }

      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)
        .eq('organization_id', organizationId) // 🔒 SECURITY: Organization-scoped delete (CRITICAL FIX)

      if (dbError) {
        throw dbError
      }

      invalidateCache(expenseId)
      return { success: true }

    } catch (err: any) {
      console.error('Fehler beim Löschen des PDFs:', err)
      setError(err.message || 'Fehler beim Löschen des PDFs')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [invalidateCache, currentOrganization])

  return {
    loading,
    error,
    loadExpensePDFs,
    getExpensePDFsFromCache,
    hasExpensePDFs,
    invalidateCache,
    deleteExpensePDF
  }
}