'use client'

import { useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import { supabase } from '@/lib/supabase/client'

// Dokumenttypen für das System (kompatibel mit Supabase Schema)
export type DocumentType = 
  | 'receipt'           // Quittungen (POS-Verkäufe)
  | 'daily_report'      // Tagesabschlüsse
  | 'monthly_report'    // Monatsabschlüsse
  | 'yearly_report'     // Jahresabschlüsse
  | 'expense_receipt'   // Ausgaben-Belege

// Basis-Interface für alle PDF-Generatoren
export interface PDFGenerationOptions {
  type: DocumentType
  filename: string
  autoDownload?: boolean
  autoUpload?: boolean
  metadata?: Record<string, any>
}

// Upload-Konfiguration für verschiedene Dokumenttypen
const UPLOAD_PATHS: Record<DocumentType, string> = {
  receipt: 'documents/receipts',
  daily_report: 'documents/daily_reports',
  monthly_report: 'documents/monthly_reports',
  yearly_report: 'documents/yearly_reports',
  expense_receipt: 'documents/expense_receipts'
}

export function useDocumentGeneration() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Zentrale PDF-Generierungs-Funktion
  const generatePDF = async (
    component: React.ReactElement<any>,
    options: PDFGenerationOptions
  ) => {
    try {
      setLoading(true)
      setError(null)

      console.log(`🔧 Generiere PDF: ${options.type} - ${options.filename}`)

      // PDF aus React-Komponente erstellen
      const blob = await pdf(component).toBlob()
      const file = new File([blob], options.filename, { type: 'application/pdf' })

      // Auto-Download wenn explizit gewünscht
      if (options.autoDownload === true) {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = options.filename
        a.click()
        URL.revokeObjectURL(url)
      }

      // Auto-Upload wenn gewünscht
      let uploadPath: string | undefined
      if (options.autoUpload !== false) {
        uploadPath = await uploadToStorage(file, options)
      }

      console.log(`✅ PDF erfolgreich generiert: ${options.filename}`)

      return {
        success: true,
        blob,
        file,
        uploadPath,
        publicUrl: uploadPath ? getPublicUrl(uploadPath) : undefined
      }

    } catch (err: any) {
      console.error(`❌ Fehler bei PDF-Generierung (${options.type}):`, err)
      setError(err.message || 'PDF-Generierung fehlgeschlagen')
      return {
        success: false,
        error: err.message
      }
    } finally {
      setLoading(false)
    }
  }

  // Upload zu Supabase Storage
  const uploadToStorage = async (
    file: File,
    options: PDFGenerationOptions
  ): Promise<string> => {
    console.log(`☁️ Lade PDF zu Storage hoch: ${options.type}`)

    const uploadPath = `${UPLOAD_PATHS[options.type]}/${options.filename}`
    
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(uploadPath, file, {
        cacheControl: '3600',
        upsert: true // Überschreiben falls bereits vorhanden
      })

    if (uploadError) {
      console.error('❌ Upload-Fehler:', uploadError)
      throw uploadError
    }

    // Dokument-Eintrag in DB erstellen
    await createDocumentRecord(uploadPath, options)

    return uploadPath
  }

  // Dokument-Eintrag in Datenbank erstellen
  const createDocumentRecord = async (
    filePath: string,
    options: PDFGenerationOptions
  ) => {
    console.log(`🗃️ Erstelle Dokument-Eintrag: ${options.type}`)

    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) {
      throw new Error('Benutzer nicht angemeldet')
    }

    const documentData = {
      type: options.type,
      reference_id: options.metadata?.referenceId || null,
      file_path: filePath,
      payment_method: options.metadata?.paymentMethod || null,
      document_date: options.metadata?.documentDate || new Date().toISOString().split('T')[0],
      user_id: userData.user.id
    }

    const { error: documentError } = await supabase
      .from('documents')
      .upsert(documentData)

    if (documentError) {
      console.error('❌ Fehler beim Erstellen des Dokument-Eintrags:', documentError)
      throw documentError
    }

    console.log(`✅ Dokument-Eintrag erstellt: ${options.type}`)
  }

  // Public URL für hochgeladene Datei abrufen
  const getPublicUrl = (filePath: string): string => {
    const { data } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)
    
    return data.publicUrl
  }

  // Signed URL für private Dateien abrufen
  const getSignedUrl = async (filePath: string, expiresIn = 3600): Promise<string> => {
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(filePath, expiresIn)

    if (error) {
      throw error
    }

    return data.signedUrl
  }

  // Spezifische Generator-Funktionen für verschiedene Dokumenttypen
  const generateReceipt = (component: React.ReactElement<any>, saleId: string, paymentMethod: string) => {
    return generatePDF(component, {
      type: 'receipt',
      filename: `quittung-${saleId}.pdf`,
      metadata: {
        referenceId: saleId,
        paymentMethod,
        documentDate: new Date().toISOString().split('T')[0]
      }
    })
  }

  const generateDailyReport = (component: React.ReactElement<any>, reportDate: string, summaryId: string) => {
    return generatePDF(component, {
      type: 'daily_report',
      filename: `tagesabschluss-${reportDate}.pdf`,
      metadata: {
        referenceId: summaryId,
        documentDate: reportDate
      }
    })
  }

  const generateMonthlyReport = (component: React.ReactElement<any>, month: string, year: number) => {
    return generatePDF(component, {
      type: 'monthly_report',
      filename: `monatsabschluss-${year}-${month.padStart(2, '0')}.pdf`,
      metadata: {
        documentDate: `${year}-${month.padStart(2, '0')}-01`
      }
    })
  }

  const generateYearlyReport = (component: React.ReactElement<any>, year: number) => {
    return generatePDF(component, {
      type: 'yearly_report',
      filename: `jahresabschluss-${year}.pdf`,
      metadata: {
        documentDate: `${year}-01-01`
      }
    })
  }

  const generateExpenseReceipt = (component: React.ReactElement<any>, expenseId: string, paymentMethod: string) => {
    return generatePDF(component, {
      type: 'expense_receipt',
      filename: `ausgabe-${expenseId}.pdf`,
      metadata: {
        referenceId: expenseId,
        paymentMethod,
        documentDate: new Date().toISOString().split('T')[0]
      }
    })
  }

  return {
    loading,
    error,
    
    // Zentrale Funktion
    generatePDF,
    
    // Spezifische Generatoren
    generateReceipt,
    generateDailyReport,
    generateMonthlyReport,
    generateYearlyReport,
    generateExpenseReceipt,
    
    // Utility-Funktionen
    getPublicUrl,
    getSignedUrl,
    uploadToStorage
  }
}