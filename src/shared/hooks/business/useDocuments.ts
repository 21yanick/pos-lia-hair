'use client'

import { useState } from 'react'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import { supabase } from '@/shared/lib/supabase/client'
import { generateDocumentDisplayName } from '@/shared/utils/documentHelpers'
import type { Database } from '@/types/database'

// Typen für Dokumente
export type Document = Database['public']['Tables']['documents']['Row']
export type DocumentInsert = Omit<
  Database['public']['Tables']['documents']['Insert'],
  'id' | 'created_at'
>
export type DocumentUpdate = Partial<
  Omit<Database['public']['Tables']['documents']['Update'], 'id' | 'created_at'>
> & { id: string }

// Erweiterte Dokumenttypen für die Benutzeroberfläche
export type DocumentWithDetails = Document & {
  displayName?: string
  description?: string
  fileSize?: number
  fileType?: string
  url?: string
  amount?: number
  status?: string
  icon?: unknown
  badgeColor?: string
}

// Zusammenfassungstyp für Übersicht
export type DocumentSummary = {
  total: number
  byType: {
    receipt: number
    daily_report: number
    monthly_report: number
    expense_receipt: number
  }
}

export type DocumentFilter = {
  type?: 'receipt' | 'daily_report' | 'monthly_report' | 'expense_receipt'
  startDate?: string
  endDate?: string
  searchTerm?: string
}

export function useDocuments() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [documents, setDocuments] = useState<DocumentWithDetails[]>([])
  const [summary, setSummary] = useState<DocumentSummary>({
    total: 0,
    byType: {
      receipt: 0,
      daily_report: 0,
      monthly_report: 0,
      expense_receipt: 0,
    },
  })

  // 🔒 SECURITY: Multi-Tenant Organization Context
  const { currentOrganization } = useCurrentOrganization()

  // Hilfsfunktion für Storage URL (GEFIXT: Kein doppeltes documents/ Prefix)
  const getStorageUrl = async (filePath: string) => {
    try {
      // filePath ist bereits korrekt (z.B. "receipts/receipt_*.pdf")
      // NICHT nochmal documents/ hinzufügen!

      // Signed URL für das PDF abrufen (funktioniert auch bei private buckets)
      const { data: urlData, error: urlError } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 3600) // URL gültig für 1 Stunde

      if (urlError) {
        // console.error("Fehler beim Erstellen der Signed URL:", urlError)
        // Fallback auf Public URL versuchen
        const { data: publicData } = await supabase.storage.from('documents').getPublicUrl(filePath)
        return publicData.publicUrl
      }

      return urlData.signedUrl
    } catch (err) {
      console.error('Fehler beim Abrufen der Storage URL:', err)
      return null
    }
  }

  // Alle Dokumente laden
  const loadDocuments = async (filter?: DocumentFilter) => {
    try {
      setLoading(true)
      setError(null)

      // 🔒 CRITICAL SECURITY: Organization required
      if (!currentOrganization) {
        throw new Error('Keine Organization ausgewählt. Bitte wählen Sie eine Organization.')
      }

      // Storage Bucket Check entfernt - der Bucket existiert bereits

      // 1. Dokumente abrufen mit ORGANIZATION SECURITY
      let documentsQuery = supabase
        .from('documents')
        .select('*')
        .eq('organization_id', currentOrganization.id) // 🔒 SECURITY: Organization-scoped
        .order('created_at', { ascending: false })

      // Filter nach Dokumenttyp
      if (filter?.type) {
        documentsQuery = documentsQuery.eq('type', filter.type)
      }

      // Filter nach Datum
      if (filter?.startDate && filter?.endDate) {
        documentsQuery = documentsQuery
          .gte('created_at', filter.startDate)
          .lte('created_at', filter.endDate)
      }

      const { data: documentsData, error: documentsError } = await documentsQuery

      if (documentsError) {
        setError(`Fehler beim Laden der Dokumente: ${documentsError.message}`)
        return { success: false, error: documentsError.message }
      }

      // Dokumente mit Details anreichern
      const enrichedDocs: DocumentWithDetails[] = await Promise.all(
        (documentsData || []).map(async (doc) => {
          let url = ''
          if (doc.file_path) {
            url = (await getStorageUrl(doc.file_path)) || '' // V6.1 Pattern 17: Null Safety - null → string transformation
          }

          // Betrag und Status aus verknüpften Tabellen laden
          let amount: number | undefined
          let status: string | undefined

          try {
            if (doc.type === 'expense_receipt' && doc.reference_id) {
              // Betrag aus expenses Tabelle laden mit ORGANIZATION SECURITY
              const { data: expenseData } = await supabase
                .from('expenses')
                .select('amount')
                .eq('id', doc.reference_id)
                .eq('organization_id', currentOrganization.id) // 🔒 SECURITY: Organization-scoped
                .single()

              if (expenseData) {
                amount = expenseData.amount
              }
            } else if (doc.type === 'receipt' && doc.reference_id) {
              // Betrag aus sales Tabelle laden mit ORGANIZATION SECURITY
              const { data: saleData } = await supabase
                .from('sales')
                .select('total_amount, status')
                .eq('id', doc.reference_id)
                .eq('organization_id', currentOrganization.id) // 🔒 SECURITY: Organization-scoped
                .single()

              if (saleData) {
                amount = saleData.total_amount
                status = saleData.status
              }
            } else if (doc.type === 'daily_report' && doc.reference_id) {
              // Status aus daily_summaries Tabelle laden mit ORGANIZATION SECURITY
              const { data: summaryData } = await supabase
                .from('daily_summaries')
                .select('status, sales_total')
                .eq('id', doc.reference_id)
                .eq('organization_id', currentOrganization.id) // 🔒 SECURITY: Organization-scoped
                .single()

              if (summaryData) {
                status = summaryData.status
                amount = summaryData.sales_total
              }
            }
          } catch (_err) {
            // console.log('Konnte verknüpfte Daten nicht laden:', err)
          }

          // Bessere Dokumentnamen generieren
          const displayInfo = generateDocumentDisplayName(
            doc.type,
            doc.created_at || new Date().toISOString(),
            doc.reference_id || undefined,
            amount,
            doc.payment_method || undefined,
            status,
            doc.document_date || undefined
          )

          return {
            ...doc,
            url,
            amount,
            status,
            displayName: displayInfo.displayName,
            description: displayInfo.description,
            icon: undefined, // V6.1 Pattern 19: Schema Property Alignment - icon not in DocumentDisplayInfo
            badgeColor: undefined, // V6.1 Pattern 19: Schema Property Alignment - badgeColor not in DocumentDisplayInfo
            fileType: doc.file_path ? doc.file_path.split('.').pop() : 'pdf',
          }
        })
      )

      // Filter nach Suchbegriff
      let filteredDocs = enrichedDocs
      if (filter?.searchTerm) {
        const searchTermLower = filter.searchTerm.toLowerCase() // V6.1 Pattern 17: Null Safety - extract and validate search term
        filteredDocs = enrichedDocs.filter(
          (doc) =>
            doc.displayName?.toLowerCase().includes(searchTermLower) ||
            doc.type.toLowerCase().includes(searchTermLower)
        )
      }

      setDocuments(filteredDocs)

      // Zusammenfassung berechnen
      const receiptCount = documentsData?.filter((doc) => doc.type === 'receipt').length || 0
      const dailyReportCount =
        documentsData?.filter((doc) => doc.type === 'daily_report').length || 0
      const monthlyReportCount =
        documentsData?.filter((doc) => doc.type === 'monthly_report').length || 0
      const expenseReceiptCount =
        documentsData?.filter((doc) => doc.type === 'expense_receipt').length || 0

      setSummary({
        total: documentsData?.length || 0,
        byType: {
          receipt: receiptCount,
          daily_report: dailyReportCount,
          monthly_report: monthlyReportCount,
          expense_receipt: expenseReceiptCount,
        },
      })

      return { success: true, documents: filteredDocs }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Unbekannter Fehler beim Laden der Dokumente'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  // Dokument hochladen
  const uploadDocument = async (
    file: File,
    type: 'receipt' | 'daily_report' | 'monthly_report' | 'expense_receipt',
    referenceId: string,
    customName?: string
  ) => {
    try {
      setLoading(true)
      setError(null)

      // 🔒 CRITICAL SECURITY: Organization required
      if (!currentOrganization) {
        throw new Error('Keine Organization ausgewählt.')
      }

      const fileName = customName || `${type}_${Date.now()}_${file.name}`
      const filePath = `${type}/${fileName}`

      // Datei zu Supabase Storage hochladen
      const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file)

      if (uploadError) {
        throw new Error(`Upload-Fehler: ${uploadError.message}`)
      }

      // Document-Eintrag in der Datenbank erstellen
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) {
        throw new Error('Benutzer nicht authentifiziert')
      }

      const documentData: DocumentInsert = {
        type,
        reference_id: referenceId,
        file_path: filePath,
        document_date: new Date().toISOString().split('T')[0],
        payment_method: null,
        user_id: user.user.id,
        organization_id: currentOrganization.id, // 🔒 SECURITY: Organization-scoped
      }

      const { error: dbError } = await supabase.from('documents').insert(documentData)

      if (dbError) {
        throw new Error(`Datenbank-Fehler: ${dbError.message}`)
      }

      return { success: true, filePath, fileName }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Fehler beim Hochladen des Dokuments'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  // Dokument löschen
  const deleteDocument = async (documentId: string) => {
    try {
      setLoading(true)
      setError(null)

      // 🔒 CRITICAL SECURITY: Organization required
      if (!currentOrganization) {
        throw new Error('Keine Organization ausgewählt.')
      }

      // Dokumentdaten abrufen, um den Dateipfad zu erhalten mit ORGANIZATION SECURITY
      const { data: docData, error: fetchError } = await supabase
        .from('documents')
        .select('file_path')
        .eq('id', documentId)
        .eq('organization_id', currentOrganization.id) // 🔒 SECURITY: Organization-scoped
        .single()

      if (fetchError) {
        throw new Error(`Fehler beim Abrufen der Dokumentdaten: ${fetchError.message}`)
      }

      // Datei aus Storage löschen
      if (docData?.file_path) {
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([docData.file_path])

        if (storageError) {
          // console.warn('Warnung: Datei konnte nicht aus Storage gelöscht werden:', storageError.message)
        }
      }

      // Datenbankeintrag löschen mit ORGANIZATION SECURITY
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)
        .eq('organization_id', currentOrganization.id) // 🔒 SECURITY: Organization-scoped

      if (dbError) {
        throw new Error(`Datenbank-Fehler: ${dbError.message}`)
      }

      return { success: true }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Fehler beim Löschen des Dokuments'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  // Dokument generieren (für PDFs)
  const generateDocument = async (
    type: 'receipt' | 'daily_report' | 'monthly_report' | 'expense_receipt',
    referenceId: string,
    data: unknown
  ) => {
    try {
      setLoading(true)
      setError(null)

      // 🔒 CRITICAL SECURITY: Organization required
      if (!currentOrganization) {
        throw new Error('Keine Organization ausgewählt.')
      }

      // Hier würde die PDF-Generierung stattfinden
      // Für jetzt erstellen wir nur einen Datenbankeintrag
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) {
        throw new Error('Benutzer nicht authentifiziert')
      }

      const fileName = `${type}_${referenceId}_${Date.now()}.pdf`
      const filePath = `${type}/${fileName}`

      const documentData: DocumentInsert = {
        type,
        reference_id: referenceId,
        file_path: filePath,
        document_date: new Date().toISOString().split('T')[0],
        payment_method:
          data && typeof data === 'object' && 'payment_method' in data
            ? (data as { payment_method?: string }).payment_method || null
            : null,
        user_id: user.user.id,
        organization_id: currentOrganization.id, // 🔒 SECURITY: Organization-scoped
      }

      const { error: dbError } = await supabase.from('documents').insert(documentData)

      if (dbError) {
        throw new Error(`Datenbank-Fehler: ${dbError.message}`)
      }

      return { success: true, filePath, fileName }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Fehler beim Generieren des Dokuments'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  return {
    documents,
    summary,
    loading,
    error,
    loadDocuments,
    uploadDocument,
    deleteDocument,
    generateDocument,
    getStorageUrl,
  }
}
