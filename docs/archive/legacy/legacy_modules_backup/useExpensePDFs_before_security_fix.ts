'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/shared/lib/supabase/client'
import type { DocumentWithDetails } from '@/shared/hooks/business/useDocuments'

export type ExpensePDF = DocumentWithDetails & {
  expenseId: string
}

export function useExpensePDFs() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pdfsCache, setPdfsCache] = useState<Record<string, ExpensePDF[]>>({})

  const getStorageUrl = async (filePath: string) => {
    try {
      const { data: urlData, error: urlError } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 3600)
      
      if (urlError) {
        const { data: publicData } = await supabase.storage
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
    if (pdfsCache[expenseId]) {
      return pdfsCache[expenseId]
    }

    try {
      setLoading(true)
      setError(null)

      const { data: documents, error: documentsError } = await supabase
        .from('documents')
        .select('*')
        .eq('type', 'expense_receipt')
        .eq('reference_id', expenseId)
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

      setPdfsCache(prev => ({ ...prev, [expenseId]: enrichedPDFs }))
      return enrichedPDFs

    } catch (err: any) {
      console.error('Fehler beim Laden der Expense PDFs:', err)
      setError(err.message || 'Fehler beim Laden der PDFs')
      return []
    } finally {
      setLoading(false)
    }
  }, [pdfsCache])

  const getExpensePDFsFromCache = useCallback((expenseId: string): ExpensePDF[] => {
    return pdfsCache[expenseId] || []
  }, [pdfsCache])

  const hasExpensePDFs = useCallback((expenseId: string): boolean => {
    const cached = pdfsCache[expenseId]
    return cached ? cached.length > 0 : false
  }, [pdfsCache])

  const invalidateCache = useCallback((expenseId?: string) => {
    if (expenseId) {
      setPdfsCache(prev => {
        const newCache = { ...prev }
        delete newCache[expenseId]
        return newCache
      })
    } else {
      setPdfsCache({})
    }
  }, [])

  const deleteExpensePDF = useCallback(async (documentId: string, expenseId: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data: docData, error: fetchError } = await supabase
        .from('documents')
        .select('file_path')
        .eq('id', documentId)
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
  }, [invalidateCache])

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