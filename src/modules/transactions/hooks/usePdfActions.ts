'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/shared/lib/supabase/client'
import { useDocuments } from '@/shared/hooks/business/useDocuments'
import { useSales } from '@/shared/hooks/business/useSales'
import { useExpenses } from '@/shared/hooks/business/useExpenses'
import { useOrganization } from '@/shared/contexts/OrganizationContext'
import type { UnifiedTransaction } from '../types/unifiedTransactions'

export function usePdfActions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 🔒 SECURITY: Multi-Tenant Organization Context
  const { currentOrganization } = useOrganization()

  const { getStorageUrl } = useDocuments()
  const { createReceiptPDF } = useSales()
  const { generatePlaceholderReceipt } = useExpenses()

  // PDF öffnen/herunterladen
  const viewPdf = useCallback(async (transaction: UnifiedTransaction): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true)
      setError(null)

      // 🔒 CRITICAL SECURITY: Organization required
      if (!currentOrganization) {
        throw new Error('Keine Organization ausgewählt.')
      }

      if (!transaction.document_id) {
        throw new Error('Keine Dokument-ID gefunden')
      }

      // Dokument-Details laden mit ORGANIZATION SECURITY
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .select('file_path, file_name, type')
        .eq('id', transaction.document_id)
        .eq('organization_id', currentOrganization.id) // 🔒 SECURITY: Organization-scoped
        .single()

      if (docError) {
        throw new Error(`Dokument nicht gefunden: ${docError.message}`)
      }

      if (!docData?.file_path) {
        throw new Error('PDF-Pfad nicht gefunden')
      }

      // Signed URL generieren
      const pdfUrl = await getStorageUrl(docData.file_path)
      
      if (!pdfUrl) {
        throw new Error('PDF-URL konnte nicht generiert werden')
      }

      // PDF in neuem Tab öffnen
      window.open(pdfUrl, '_blank', 'noopener,noreferrer')

      return { success: true }

    } catch (err: any) {
      const errorMessage = err.message || 'Fehler beim Öffnen des PDFs'
      console.error('❌ PDF View Error:', err)
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [getStorageUrl, currentOrganization])

  // Fehlendes PDF generieren
  const generatePdf = useCallback(async (transaction: UnifiedTransaction): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true)
      setError(null)

      // 🔒 CRITICAL SECURITY: Organization required
      if (!currentOrganization) {
        throw new Error('Keine Organization ausgewählt.')
      }

      if (transaction.transaction_type === 'sale') {
        // Sale Details laden für Receipt PDF mit ORGANIZATION SECURITY
        const { data: saleData, error: saleError } = await supabase
          .from('sales')
          .select(`
            *,
            sale_items (
              id,
              item_id,
              price,
              notes,
              items (
                id,
                name,
                type,
                default_price
              )
            )
          `)
          .eq('id', transaction.id)
          .eq('organization_id', currentOrganization.id) // 🔒 SECURITY: Organization-scoped
          .single()

        if (saleError) {
          throw new Error(`Verkaufsdaten nicht gefunden: ${saleError.message}`)
        }

        // Cart Items für PDF vorbereiten
        const cartItems = saleData.sale_items?.map((item: any) => ({
          id: item.item_id,
          name: item.items?.name || 'Unbekanntes Produkt',
          category: item.items?.type === 'service' ? 'Dienstleistung' : 
                    item.items?.type === 'product' ? 'Produkt' : 'Sonstiges',
          price: item.price,
          quantity: 1, // Default: 1 Stück pro sale_item Eintrag
          total: item.price
        })) || []

        // Receipt PDF generieren
        await createReceiptPDF(saleData, cartItems)

      } else if (transaction.transaction_type === 'expense') {
        // Placeholder Receipt für Ausgabe generieren
        await generatePlaceholderReceipt(transaction.id)

      } else {
        throw new Error(`PDF-Generierung für Typ "${transaction.transaction_type}" nicht unterstützt`)
      }

      return { success: true }

    } catch (err: any) {
      const errorMessage = err.message || 'Fehler beim Generieren des PDFs'
      console.error('❌ PDF Generation Error:', err)
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [createReceiptPDF, generatePlaceholderReceipt, currentOrganization])

  // PDF-Aktion basierend auf Status ausführen
  const handlePdfAction = useCallback(async (transaction: UnifiedTransaction): Promise<{ success: boolean; error?: string }> => {
    if (transaction.pdf_status === 'available') {
      return await viewPdf(transaction)
    } else if (transaction.pdf_status === 'missing') {
      return await generatePdf(transaction)
    } else {
      return { 
        success: false, 
        error: `PDF-Aktion für Status "${transaction.pdf_status}" nicht verfügbar` 
      }
    }
  }, [viewPdf, generatePdf])

  // PDF direkt herunterladen (statt öffnen)
  const downloadPdf = useCallback(async (transaction: UnifiedTransaction): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true)
      setError(null)

      // 🔒 CRITICAL SECURITY: Organization required
      if (!currentOrganization) {
        throw new Error('Keine Organization ausgewählt.')
      }

      if (!transaction.document_id) {
        throw new Error('Keine Dokument-ID gefunden')
      }

      const { data: docData, error: docError } = await supabase
        .from('documents')
        .select('file_path, file_name')
        .eq('id', transaction.document_id)
        .eq('organization_id', currentOrganization.id) // 🔒 SECURITY: Organization-scoped
        .single()

      if (docError || !docData?.file_path) {
        throw new Error('Dokument nicht gefunden')
      }

      const pdfUrl = await getStorageUrl(docData.file_path)
      
      if (!pdfUrl) {
        throw new Error('PDF-URL konnte nicht generiert werden')
      }

      // PDF herunterladen
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = docData.file_name || `${transaction.receipt_number}.pdf`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      return { success: true }

    } catch (err: any) {
      const errorMessage = err.message || 'Fehler beim Herunterladen des PDFs'
      console.error('❌ PDF Download Error:', err)
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [getStorageUrl, currentOrganization])

  // Bulk PDF Download (ZIP-Archiv)
  const downloadMultiplePdfs = useCallback(async (transactions: UnifiedTransaction[]): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true)
      setError(null)

      // 🔒 CRITICAL SECURITY: Organization required
      if (!currentOrganization) {
        throw new Error('Keine Organization ausgewählt.')
      }

      // Nur Transaktionen mit verfügbaren PDFs
      const availableTransactions = transactions.filter(tx => tx.pdf_status === 'available' && tx.document_id)
      
      if (availableTransactions.length === 0) {
        throw new Error('Keine PDFs zum Download verfügbar')
      }

      // JSZip dynamisch laden
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()

      // PDFs zu ZIP hinzufügen mit ORGANIZATION SECURITY
      for (const transaction of availableTransactions) {
        try {
          const { data: docData } = await supabase
            .from('documents')
            .select('file_path, file_name')
            .eq('id', transaction.document_id!)
            .eq('organization_id', currentOrganization.id) // 🔒 SECURITY: Organization-scoped
            .single()

          if (docData?.file_path) {
            const pdfUrl = await getStorageUrl(docData.file_path)
            
            if (pdfUrl) {
              const response = await fetch(pdfUrl)
              const pdfBlob = await response.blob()
              const fileName = docData.file_name || `${transaction.receipt_number}.pdf`
              zip.file(fileName, pdfBlob)
            }
          }
        } catch (err) {
          console.warn(`Fehler beim Laden von PDF ${transaction.receipt_number}:`, err)
        }
      }

      // ZIP generieren und herunterladen
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const zipUrl = URL.createObjectURL(zipBlob)
      
      const link = document.createElement('a')
      link.href = zipUrl
      link.download = `Transaktionen_PDFs_${new Date().toISOString().split('T')[0]}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(zipUrl)

      return { success: true }

    } catch (err: any) {
      const errorMessage = err.message || 'Fehler beim Erstellen des ZIP-Archivs'
      console.error('❌ Bulk PDF Download Error:', err)
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [getStorageUrl, currentOrganization])

  return {
    // State
    loading,
    error,
    
    // Main Actions
    handlePdfAction,   // Intelligente Aktion basierend auf Status
    viewPdf,          // PDF öffnen
    downloadPdf,      // PDF herunterladen
    generatePdf,      // PDF generieren
    
    // Bulk Actions
    downloadMultiplePdfs
  }
}