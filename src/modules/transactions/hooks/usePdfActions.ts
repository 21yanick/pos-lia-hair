'use client'

import { useCallback, useRef } from 'react'
import { supabase } from '@/shared/lib/supabase/client'
import { useDocuments } from '@/shared/hooks/business/useDocuments'
import { useSales } from '@/shared/hooks/business/useSales'
import { useExpenses } from '@/shared/hooks/business/useExpenses'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import { useUpdateTransaction, useGeneratePdf } from './useTransactionsQuery'
import { pdfManager } from '@/shared/services/pdfManager'
import { toast } from 'sonner'
import type { UnifiedTransaction } from '../types/unifiedTransactions'

export function usePdfActions() {
  const { currentOrganization } = useCurrentOrganization()
  const { getStorageUrl } = useDocuments()
  const { createReceiptPDF } = useSales()
  const { generatePlaceholderReceipt } = useExpenses()
  const updateTransaction = useUpdateTransaction()
  const generatePdfMutation = useGeneratePdf()

  // Track if action is in progress to prevent double execution
  const actionInProgress = useRef(false)
  
  /**
   * View PDF with proper resource management
   */
  const viewPdf = useCallback(async (transaction: UnifiedTransaction) => {
    // Prevent double execution on mobile
    if (actionInProgress.current) return false
    actionInProgress.current = true
    if (!currentOrganization) {
      toast.error('Keine Organization ausgewählt')
      return false
    }

    if (!transaction.document_id) {
      toast.error('Kein PDF verfügbar')
      return false
    }

    try {
      // Get document info
      const { data: doc, error } = await supabase
        .from('documents')
        .select('file_path, file_name')
        .eq('id', transaction.document_id)
        .eq('organization_id', currentOrganization.id)
        .single()

      if (error || !doc?.file_path) {
        toast.error('PDF nicht gefunden')
        return false
      }

      // Get signed URL
      const pdfUrl = await getStorageUrl(doc.file_path)
      if (!pdfUrl || pdfUrl === '') {
        toast.error('PDF konnte nicht geladen werden')
        return false
      }

      // Open with resource manager
      pdfManager.open(transaction.id, pdfUrl)
      return true

    } catch (err) {
      toast.error('Fehler beim Öffnen des PDFs')
      return false
    } finally {
      // Release lock after short delay to prevent double tap
      setTimeout(() => {
        actionInProgress.current = false
      }, 500)
    }
  }, [currentOrganization, getStorageUrl])

  /**
   * Generate missing PDF
   */
  const generatePdf = useCallback(async (transaction: UnifiedTransaction) => {
    // Prevent double execution on mobile
    if (actionInProgress.current) return false
    actionInProgress.current = true
    
    if (!currentOrganization) {
      toast.error('Keine Organization ausgewählt')
      actionInProgress.current = false
      return false
    }

    const toastId = toast.loading('PDF wird generiert...')

    try {
      if (transaction.transaction_type === 'sale') {
        // Load sale details
        const { data: sale, error } = await supabase
          .from('sales')
          .select(`
            *,
            sale_items (
              id,
              item_id,
              price,
              notes,
              items (id, name, type, default_price)
            )
          `)
          .eq('id', transaction.id)
          .eq('organization_id', currentOrganization.id)
          .single()

        if (error || !sale) {
          throw new Error('Verkaufsdaten nicht gefunden')
        }

        // Prepare cart items
        const cartItems = sale.sale_items?.map((item: any) => ({
          id: item.item_id,
          name: item.items?.name || 'Unbekanntes Produkt',
          category: item.items?.type === 'service' ? 'Dienstleistung' : 'Produkt',
          price: item.price,
          quantity: 1,
          total: item.price
        })) || []

        // Generate PDF
        await createReceiptPDF(sale, cartItems)

      } else if (transaction.transaction_type === 'expense') {
        // Generate placeholder
        await generatePlaceholderReceipt(transaction.id)

      } else {
        throw new Error('PDF-Generierung für diesen Typ nicht verfügbar')
      }

      // Trigger transaction update
      await generatePdfMutation.mutateAsync(transaction.id)
      
      toast.success('PDF erfolgreich generiert', { id: toastId })
      return true

    } catch (err: any) {
      toast.error(err.message || 'Fehler beim Generieren', { id: toastId })
      return false
    } finally {
      // Release lock after short delay
      setTimeout(() => {
        actionInProgress.current = false
      }, 500)
    }
  }, [currentOrganization, createReceiptPDF, generatePlaceholderReceipt, generatePdfMutation])

  /**
   * Smart action based on PDF status
   */
  const handlePdfAction = useCallback(async (transaction: UnifiedTransaction) => {
    if (transaction.pdf_status === 'available') {
      return await viewPdf(transaction)
    } else if (transaction.pdf_status === 'missing') {
      return await generatePdf(transaction)
    }
    return false
  }, [viewPdf, generatePdf])

  /**
   * Download PDF
   */
  const downloadPdf = useCallback(async (transaction: UnifiedTransaction) => {
    if (!currentOrganization || !transaction.document_id) {
      toast.error('PDF nicht verfügbar')
      return false
    }

    try {
      const { data: doc, error } = await supabase
        .from('documents')
        .select('file_path, file_name')
        .eq('id', transaction.document_id)
        .eq('organization_id', currentOrganization.id)
        .single()

      if (error || !doc?.file_path) {
        toast.error('PDF nicht gefunden')
        return false
      }

      const pdfUrl = await getStorageUrl(doc.file_path)
      if (!pdfUrl) {
        toast.error('PDF konnte nicht geladen werden')
        return false
      }

      // Create download link
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = doc.file_name || `${transaction.receipt_number}.pdf`
      link.click()

      toast.success('PDF heruntergeladen')
      return true

    } catch (err) {
      toast.error('Fehler beim Herunterladen')
      return false
    }
  }, [currentOrganization, getStorageUrl])

  /**
   * Bulk download PDFs
   */
  const downloadMultiplePdfs = useCallback(async (transactions: UnifiedTransaction[]) => {
    if (!currentOrganization) {
      toast.error('Keine Organization ausgewählt')
      return false
    }

    const pdfsToDownload = transactions.filter(tx => 
      tx.pdf_status === 'available' && tx.document_id
    )

    if (pdfsToDownload.length === 0) {
      toast.error('Keine PDFs zum Download verfügbar')
      return false
    }

    const toastId = toast.loading('Erstelle ZIP-Archiv...')

    try {
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()

      // Add PDFs to ZIP
      for (const tx of pdfsToDownload) {
        const { data: doc } = await supabase
          .from('documents')
          .select('file_path, file_name')
          .eq('id', tx.document_id!)
          .eq('organization_id', currentOrganization.id)
          .single()

        if (doc?.file_path) {
          const pdfUrl = await getStorageUrl(doc.file_path)
          if (pdfUrl) {
            const response = await fetch(pdfUrl)
            const blob = await response.blob()
            zip.file(doc.file_name || `${tx.receipt_number}.pdf`, blob)
          }
        }
      }

      // Generate and download ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const zipUrl = URL.createObjectURL(zipBlob)
      
      const link = document.createElement('a')
      link.href = zipUrl
      link.download = `PDFs_${new Date().toISOString().split('T')[0]}.zip`
      link.click()
      
      // Cleanup
      setTimeout(() => URL.revokeObjectURL(zipUrl), 100)
      
      toast.success('ZIP-Archiv heruntergeladen', { id: toastId })
      return true

    } catch (err) {
      toast.error('Fehler beim Erstellen des Archivs', { id: toastId })
      return false
    }
  }, [currentOrganization, getStorageUrl])

  return {
    // Main actions
    handlePdfAction,
    viewPdf,
    generatePdf,
    downloadPdf,
    downloadMultiplePdfs,
    
    // Loading states from mutations
    isGenerating: generatePdfMutation.isPending,
    isUpdating: updateTransaction.isPending,
  }
}