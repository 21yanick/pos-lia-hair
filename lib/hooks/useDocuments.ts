'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

// Typen für Dokumente
export type Document = Database['public']['Tables']['documents']['Row']
export type DocumentInsert = Omit<Database['public']['Tables']['documents']['Insert'], 'id' | 'created_at'>
export type DocumentUpdate = Partial<Omit<Database['public']['Tables']['documents']['Update'], 'id' | 'created_at'>> & { id: string }

// Erweiterte Dokumenttypen für die Benutzeroberfläche
export type DocumentWithDetails = Document & {
  displayName?: string
  fileSize?: number
  fileType?: string
  url?: string
  amount?: number
  status?: string
  referenceDetails?: {
    amount?: number
    date?: string
    status?: string
    supplier?: string
    invoiceNumber?: string
    payment_method?: 'cash' | 'twint' | 'sumup'
  }
}

// Zusammenfassungstyp für Übersicht
export type DocumentSummary = {
  total: number
  byType: {
    receipt: number
    daily_report: number
    monthly_report: number
    supplier_invoice: number
  }
}

export type DocumentFilter = {
  type?: 'receipt' | 'daily_report' | 'monthly_report' | 'supplier_invoice'
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
      supplier_invoice: 0
    }
  })

  // Hilfsfunktion für Storage URL
  const getStorageUrl = async (filePath: string) => {
    try {
      // Nur den Pfad ohne Bucket-Prefix verwenden
      const path = filePath.startsWith('documents/') ? filePath : `documents/${filePath}`
      
      const { data } = await supabase.storage
        .from('documents')
        .getPublicUrl(path)
      
      return data.publicUrl
    } catch (err) {
      console.error("Fehler beim Abrufen der Storage URL:", err)
      return ""
    }
  }

  // Alle Dokumente laden oder Transaktionen ohne Dokumente mit anzeigen
  const loadDocuments = async (filter?: DocumentFilter) => {
    try {
      setLoading(true)
      setError(null)

      // Bei Bedarf kann die Migration ausgeführt werden
      try {
        // Prüfen ob der Bucket existiert
        const { data: buckets } = await supabase
          .storage
          .listBuckets()
        
        const documentsBucketExists = buckets?.some(bucket => bucket.name === 'documents')
        
        if (!documentsBucketExists) {
          console.warn("Storage Bucket 'documents' existiert nicht!")
          setError("Storage Bucket 'documents' existiert nicht! Bitte die Migration '02_storage_buckets.sql' ausführen.")
        }
      } catch (bucketErr) {
        console.error("Fehler beim Prüfen des Storage Buckets:", bucketErr)
      }

      // 1. Dokumente abrufen
      // Basis-Query
      let documentsQuery = supabase
        .from('documents')
        .select(`
          *,
          users(name)
        `)
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

      // Suche nach Referenz-ID
      if (filter?.searchTerm) {
        documentsQuery = documentsQuery.or(`reference_id.ilike.%${filter.searchTerm}%`)
      }

      const { data: documentsData, error: fetchError } = await documentsQuery

      if (fetchError) {
        throw fetchError
      }
      
      // 2. Wenn wir Transaktionen (Quittungen) anzeigen, auch alle Transaktionen holen
      // und virtuelle Dokumente für die erstellen, die noch kein Dokument haben
      const virtualDocuments: any[] = []
      
      if (!filter?.type || filter?.type === 'receipt') {
        // Alle Transaktionen abrufen
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100) // Limit setzen, um Performanceprobleme zu vermeiden
        
        if (!transactionsError && transactionsData) {
          // Für jede Transaktion prüfen, ob bereits ein Dokument existiert
          for (const transaction of transactionsData) {
            const hasDocument = documentsData?.some(doc => 
              doc.type === 'receipt' && doc.reference_id === transaction.id
            )
            
            // Wenn kein Dokument existiert, ein virtuelles Dokument erstellen
            if (!hasDocument) {
              const { data: userData } = await supabase.auth.getUser()
              const userId = userData?.user?.id
              
              virtualDocuments.push({
                id: `virtual-${transaction.id}`,
                type: 'receipt',
                reference_id: transaction.id,
                file_path: 'virtuell', // Da noch kein physisches Dokument existiert
                user_id: userId || transaction.user_id,
                created_at: transaction.created_at,
                isVirtual: true // Markierung für virtuelle Dokumente
              })
            }
          }
        }
      }
      
      // Die virtuellen Dokumente mit den echten Dokumenten kombinieren
      const combinedData = [...(documentsData || []), ...virtualDocuments]

      // Dokumente mit zusätzlichen Details anreichern
      const enhancedDocuments: DocumentWithDetails[] = []
      
      for (const doc of combinedData) {
        try {
          // Storage URL für die Datei abrufen (nur wenn kein virtuelles Dokument)
          const url = doc.isVirtual ? '' : await getStorageUrl(doc.file_path)
          
          // Display Name und referenzierte Daten basierend auf Typ
          let displayName = '';
          let fileSize = 0;
          let fileType = '';
          let amount = 0;
          let status = '';
          let referenceDetails = {};
          
          // Dateityp aus dem Dateipfad extrahieren
          const pathParts = doc.file_path.split('.');
          if (pathParts.length > 1) {
            fileType = pathParts.pop()!.toLowerCase();
          }
          
          // Je nach Dokumenttyp weitere Daten abrufen
          switch (doc.type) {
            case 'receipt': {
              // Transaktionsdaten abrufen
              const { data: transactionData, error: transactionError } = await supabase
                .from('transactions')
                .select('total_amount, payment_method, status, created_at')
                .eq('id', doc.reference_id)
                .single();
              
              if (!transactionError && transactionData) {
                amount = transactionData.total_amount;
                status = transactionData.status;
                
                displayName = `Quittung-${new Date(transactionData.created_at).toLocaleDateString('de-CH')}-${doc.reference_id.substring(0, 8)}`;
                
                referenceDetails = {
                  amount: transactionData.total_amount,
                  status: transactionData.status,
                  payment_method: transactionData.payment_method,
                  date: transactionData.created_at
                };
              } else {
                displayName = `Quittung-${new Date(doc.created_at).toLocaleDateString('de-CH')}-${doc.reference_id.substring(0, 8)}`;
              }
              break;
            }
            
            case 'daily_report': {
              // Tagesberichtsdaten abrufen
              const { data: reportData, error: reportError } = await supabase
                .from('daily_reports')
                .select('date, cash_total, twint_total, sumup_total, status')
                .eq('id', doc.reference_id)
                .single();
              
              if (!reportError && reportData) {
                // Summe aller Zahlungsmethoden
                amount = reportData.cash_total + reportData.twint_total + reportData.sumup_total;
                status = reportData.status;
                
                displayName = `Tagesabschluss-${reportData.date}`;
                
                referenceDetails = {
                  amount,
                  date: reportData.date,
                  status: reportData.status
                };
              } else {
                displayName = `Tagesabschluss-${new Date(doc.created_at).toLocaleDateString('de-CH')}`;
              }
              break;
            }
            
            case 'monthly_report': {
              // Monatsberichtsdaten - hier könnten wir noch keine echten Daten haben
              displayName = `Monatsabschluss-${new Date(doc.created_at).toLocaleDateString('de-CH', { year: 'numeric', month: 'long' })}`;
              break;
            }
            
            case 'supplier_invoice': {
              // Lieferantenrechnungsdaten abrufen
              const { data: invoiceData, error: invoiceError } = await supabase
                .from('supplier_invoices')
                .select('supplier_name, invoice_number, amount, status, invoice_date, due_date')
                .eq('id', doc.reference_id)
                .single();
              
              if (!invoiceError && invoiceData) {
                amount = invoiceData.amount;
                status = invoiceData.status;
                
                displayName = `Lieferantenrechnung-${invoiceData.supplier_name}-${invoiceData.invoice_number}`;
                
                referenceDetails = {
                  amount: invoiceData.amount,
                  status: invoiceData.status,
                  date: invoiceData.invoice_date,
                  supplier: invoiceData.supplier_name,
                  invoiceNumber: invoiceData.invoice_number
                };
              } else {
                displayName = `Lieferantenrechnung-${doc.reference_id.substring(0, 8)}`;
              }
              break;
            }
            
            default:
              displayName = doc.file_path.split('/').pop() || 'Unbekanntes Dokument';
          }
          
          // Dokument mit zusätzlichen Details hinzufügen
          enhancedDocuments.push({
            ...doc,
            displayName,
            fileSize,
            fileType,
            url,
            amount,
            status,
            referenceDetails,
            isVirtual: doc.isVirtual || false
          });
        } catch (err) {
          console.error(`Fehler beim Verarbeiten des Dokuments ${doc.id}:`, err);
          // Dokument trotzdem hinzufügen, aber ohne URL
          enhancedDocuments.push({
            ...doc,
            displayName: doc.file_path.split('/').pop() || 'Unbekanntes Dokument',
            fileType: doc.file_path.split('.').pop()?.toLowerCase() || 'unbekannt',
            isVirtual: doc.isVirtual || false
          });
        }
      }

      setDocuments(enhancedDocuments)
      updateSummary(enhancedDocuments)
      return { success: true, data: enhancedDocuments }
    } catch (err: any) {
      console.error('Fehler beim Laden der Dokumente:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Neues Dokument hochladen und speichern
  const uploadDocument = async (file: File, type: 'receipt' | 'daily_report' | 'monthly_report' | 'supplier_invoice', referenceId: string, customName?: string) => {
    try {
      setLoading(true)
      setError(null)

      // Benutzer-ID abrufen
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) {
        throw new Error('Nicht angemeldet. Bitte melden Sie sich an.')
      }

      // Dateiname generieren (mit Zeitstempel um Eindeutigkeit zu gewährleisten)
      const timestamp = new Date().getTime()
      const fileExtension = file.name.split('.').pop()
      const fileName = customName
        ? `${customName.replace(/\s+/g, '-')}-${timestamp}.${fileExtension}`
        : `${type}-${timestamp}.${fileExtension}`
      
      // Pfad in Supabase Storage
      const filePath = `documents/${type}/${fileName}`

      // Datei zu Supabase Storage hochladen
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw uploadError
      }

      // Dokument-Eintrag in der Datenbank erstellen
      const newDocument: DocumentInsert = {
        type,
        reference_id: referenceId,
        file_path: filePath,
        user_id: userData.user.id
      }

      const { data, error: insertError } = await supabase
        .from('documents')
        .insert(newDocument)
        .select()
        .single()

      if (insertError) {
        // Falls der DB-Eintrag fehlschlägt, Datei aus Storage löschen
        await supabase.storage
          .from('documents')
          .remove([filePath])
        throw insertError
      }

      // Falls es sich um eine Lieferantenrechnung handelt, die supplierInvoice aktualisieren
      if (type === 'supplier_invoice') {
        const { error: updateError } = await supabase
          .from('supplier_invoices')
          .update({ document_id: data.id })
          .eq('id', referenceId)

        if (updateError) {
          console.error('Fehler beim Verknüpfen mit Lieferantenrechnung:', updateError)
          // Wir werfen hier keinen Fehler, da die Hauptoperation erfolgreich war
        }
      }

      // Öffentliche URL der Datei abrufen
      const url = await getStorageUrl(filePath)

      // Dokument mit zusätzlichen Details
      const documentWithDetails: DocumentWithDetails = {
        ...data,
        displayName: customName || fileName,
        fileSize: file.size,
        fileType: fileExtension?.toLowerCase() || '',
        url
      }

      // Lokale Liste aktualisieren
      setDocuments(prev => [documentWithDetails, ...prev])
      updateSummary([documentWithDetails, ...documents])

      return { success: true, data: documentWithDetails }
    } catch (err: any) {
      console.error('Fehler beim Hochladen des Dokuments:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Dokument löschen
  const deleteDocument = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      // Zuerst Dokument-Details abrufen, um den Dateipfad zu erhalten
      const { data: docData, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) {
        throw fetchError
      }

      // Dokument aus der Datenbank löschen
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)

      if (deleteError) {
        throw deleteError
      }

      // Falls es sich um eine Lieferantenrechnung handelt, das Dokument-Feld auf NULL setzen
      if (docData.type === 'supplier_invoice') {
        const { error: updateError } = await supabase
          .from('supplier_invoices')
          .update({ document_id: null })
          .eq('id', docData.reference_id)

        if (updateError) {
          console.error('Fehler beim Aktualisieren der Lieferantenrechnung:', updateError)
          // Nicht kritisch, daher nur loggen
        }
      }

      // Datei aus dem Storage löschen
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([docData.file_path])

      if (storageError) {
        console.error('Fehler beim Löschen der Datei aus dem Storage:', storageError)
        // Wir werfen hier keinen Fehler, da die Datenbank-Operation erfolgreich war
      }

      // Lokale Liste aktualisieren
      const updatedDocuments = documents.filter(doc => doc.id !== id)
      setDocuments(updatedDocuments)
      updateSummary(updatedDocuments)

      return { success: true }
    } catch (err: any) {
      console.error('Fehler beim Löschen des Dokuments:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Dokumente nach Text durchsuchen
  const searchDocuments = async (searchTerm: string) => {
    return loadDocuments({ searchTerm })
  }

  // PDF generieren für Transaktionen, Tagesberichte oder Lieferantenrechnungen
  const generatePDF = async (
    type: 'receipt' | 'daily_report' | 'monthly_report' | 'supplier_invoice',
    referenceId: string,
    customName?: string
  ) => {
    try {
      setLoading(true)
      setError(null)

      // Hier würde die PDF-Generierungslogik kommen
      // Als Platzhalter geben wir einen Fehler zurück, da die PDF-Generierung
      // noch nicht implementiert ist

      throw new Error('PDF-Generierung ist noch nicht implementiert')

      /* PLATZHALTER FÜR ZUKÜNFTIGE IMPLEMENTIERUNG:

      // Benutzer-ID abrufen
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) {
        throw new Error('Nicht angemeldet. Bitte melden Sie sich an.')
      }

      // Daten für PDF je nach Typ abrufen
      let pdfData;
      switch (type) {
        case 'receipt':
          pdfData = await fetchTransactionData(referenceId);
          break;
        case 'daily_report':
          pdfData = await fetchDailyReportData(referenceId);
          break;
        case 'monthly_report':
          pdfData = await fetchMonthlyReportData(referenceId);
          break;
        case 'supplier_invoice':
          pdfData = await fetchSupplierInvoiceData(referenceId);
          break;
      }

      // PDF mit geeigneter Bibliothek erstellen
      const pdfBlob = await createPDF(type, pdfData);

      // PDF speichern und zurückgeben
      const uploadResult = await uploadDocument(
        new File([pdfBlob], `${customName || type}-${new Date().getTime()}.pdf`, { type: 'application/pdf' }),
        type,
        referenceId,
        customName
      );

      return uploadResult;
      */

    } catch (err: any) {
      console.error('Fehler bei der PDF-Generierung:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Zusammenfassung aktualisieren
  const updateSummary = (data: Document[]) => {
    const total = data.length
    const receiptCount = data.filter(doc => doc.type === 'receipt').length
    const dailyReportCount = data.filter(doc => doc.type === 'daily_report').length
    const monthlyReportCount = data.filter(doc => doc.type === 'monthly_report').length
    const supplierInvoiceCount = data.filter(doc => doc.type === 'supplier_invoice').length

    setSummary({
      total,
      byType: {
        receipt: receiptCount,
        daily_report: dailyReportCount,
        monthly_report: monthlyReportCount,
        supplier_invoice: supplierInvoiceCount
      }
    })
  }

  return {
    loading,
    error,
    documents,
    summary,
    loadDocuments,
    uploadDocument,
    deleteDocument,
    searchDocuments,
    generatePDF
  }
}