'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

// Typen für Transaktionsdaten
export type Transaction = Database['public']['Tables']['transactions']['Row']
export type TransactionInsert = Omit<Database['public']['Tables']['transactions']['Insert'], 'id' | 'created_at' | 'updated_at'>
export type TransactionUpdate = Partial<Omit<Database['public']['Tables']['transactions']['Update'], 'id' | 'created_at' | 'updated_at'>> & { id: string }

// Typen für Transaktionsposten
export type TransactionItem = Database['public']['Tables']['transaction_items']['Row']
export type TransactionItemInsert = Omit<Database['public']['Tables']['transaction_items']['Insert'], 'id'>

// Typ für den Warenkorb
export type CartItem = {
  id: string        // Item ID aus der Datenbank
  name: string      // Name des Items
  price: number     // Preis pro Stück (kann vom Standard-Preis abweichen)
  quantity: number  // Menge
  total: number     // Gesamtpreis (Preis × Menge)
}

// Typ für die Erstellung einer kompletten Transaktion mit allen Posten
export type CreateTransactionData = {
  total_amount: number
  payment_method: 'cash' | 'twint' | 'sumup'
  notes?: string | null
  items: CartItem[]
  received_amount?: number  // Nur für Bargeld-Zahlungen: Erhaltener Betrag
}

export function useTransactions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null)

  // Transaktion erstellen mit allen Posten
  const createTransaction = async (data: CreateTransactionData) => {
    try {
      setLoading(true)
      setError(null)

      // 1. Benutzer-ID abrufen
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) {
        throw new Error('Nicht angemeldet. Bitte melden Sie sich an.')
      }
      const userId = userData.user.id
      
      // 1.1 Prüfen, ob die Kasse geöffnet ist
      const today = new Date().toISOString().split('T')[0]
      const { data: registerStatus, error: registerError } = await supabase
        .from('register_status')
        .select('*')
        .eq('date', today)
        .eq('status', 'open')
        .maybeSingle()
      
      if (registerError && registerError.code !== 'PGRST116') {
        throw new Error(`Fehler beim Prüfen des Kassenstatus: ${registerError.message}`)
      }
      
      if (!registerStatus) {
        throw new Error('Die Kasse ist nicht geöffnet. Bitte öffnen Sie zuerst die Kasse, bevor Sie Transaktionen durchführen.')
      }

      // 2. Transaktion erstellen
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          total_amount: data.total_amount,
          payment_method: data.payment_method,
          status: 'completed',  // Standard-Status für neue Transaktionen
          notes: data.notes || null,
          user_id: userId,
          // daily_report_id wird später gesetzt, wenn der Tagesabschluss gemacht wird
        })
        .select()
        .single()

      if (transactionError) {
        console.error('Fehler beim Erstellen der Transaktion:', transactionError)
        throw transactionError
      }

      // 3. Transaktionsposten für jedes Item im Warenkorb erstellen
      const transactionItems: TransactionItemInsert[] = data.items.map(item => ({
        transaction_id: transaction.id,
        item_id: item.id,
        price: item.price,
        notes: null  // Optional: Anmerkungen zum Posten
      }))

      // 4. Alle Transaktionsposten in einer Operation einfügen
      const { error: itemsError } = await supabase
        .from('transaction_items')
        .insert(transactionItems)

      if (itemsError) {
        console.error('Fehler beim Erstellen der Transaktionsposten:', itemsError)
        // Ideally, we would roll back the transaction here, but that requires more complex setup
        throw itemsError
      }
      
      console.log('Transaktionsposten erfolgreich erstellt:', transactionItems.length)

      // 5. Neuen Kassenbucheintrag erstellen, wenn es eine Barzahlung ist
      if (data.payment_method === 'cash' && data.received_amount) {
        const change = data.received_amount - data.total_amount

        // Den Kassenzugang verbuchen
        const { error: registerError } = await supabase
          .from('cash_register')
          .insert({
            date: new Date().toISOString().split('T')[0],  // YYYY-MM-DD Format
            type: 'income',
            amount: data.total_amount,
            description: `Barzahlung (Transaktion: ${transaction.id})`,
            user_id: userId
          })

        if (registerError) {
          console.error('Fehler beim Erstellen des Kassenbucheintrags:', registerError)
          // Hier keine Exception werfen, da die Transaktion selbst erfolgreich war
        }
      }

      // 6. Aktuelle Transaktion setzen für das UI
      setCurrentTransaction(transaction)
      
      // 7. Automatisch ein Dokument für diese Transaktion erstellen (Quittung)
      try {
        // Einfache PDF-Quittung erstellen
        const pdfDoc = await PDFDocument.create()
        const page = pdfDoc.addPage([595.28, 841.89]) // A4
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
        
        const { width, height } = page.getSize()
        const fontSize = 12
        const padding = 50
        
        // Titel
        page.drawText('QUITTUNG', {
          x: padding,
          y: height - padding,
          size: 24,
          font: boldFont,
          color: rgb(0, 0, 0),
        })
        
        // Datum
        const dateStr = new Date().toLocaleDateString('de-CH')
        page.drawText(`Datum: ${dateStr}`, {
          x: padding,
          y: height - padding - 40,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        })
        
        // Transaktions-ID
        page.drawText(`Belegnummer: ${transaction.id}`, {
          x: padding,
          y: height - padding - 60,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        })
        
        // Gesamtbetrag
        page.drawText(`Gesamtbetrag: CHF ${transaction.total_amount.toFixed(2)}`, {
          x: padding,
          y: height - padding - 100,
          size: fontSize + 2,
          font: boldFont,
          color: rgb(0, 0, 0),
        })
        
        // Zahlungsmethode
        const paymentMethod = transaction.payment_method === 'cash' 
          ? 'Barzahlung' 
          : transaction.payment_method === 'twint' 
            ? 'TWINT' 
            : 'SumUp (Karte)'
            
        page.drawText(`Zahlungsart: ${paymentMethod}`, {
          x: padding,
          y: height - padding - 120,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        })
        
        // Artikel auflisten
        page.drawText('Artikel:', {
          x: padding,
          y: height - padding - 160,
          size: fontSize,
          font: boldFont,
          color: rgb(0, 0, 0),
        })
        
        // Benutzer-ID
        page.drawText(`Mitarbeiter: ${userId}`, {
          x: padding,
          y: height - padding - 400,
          size: fontSize - 2,
          font,
          color: rgb(0, 0, 0),
        })
        
        // PDF in Bytes umwandeln
        const pdfBytes = await pdfDoc.save()
        
        // Als Datei für Storage vorbereiten
        const fileName = `quittung-${transaction.id}.pdf`
        const file = new File([pdfBytes], fileName, { type: 'application/pdf' })
        
        // Dateiname generieren
        const timestamp = new Date().getTime()
        const filePath = `documents/receipt/${fileName}`
        
        // Datei zu Supabase Storage hochladen
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })
          
        if (uploadError) {
          console.error('Fehler beim Hochladen der PDF:', uploadError)
          // Wir werfen hier keinen Fehler, damit die Transaktion selbst erfolgreich bleibt
        } else {
          // Dokument-Eintrag in der Datenbank erstellen
          const newDocument = {
            type: 'receipt' as 'receipt' | 'daily_report' | 'monthly_report' | 'supplier_invoice',
            reference_id: transaction.id,
            file_path: filePath,
            user_id: userId
          }
          
          const { error: documentError } = await supabase
            .from('documents')
            .insert(newDocument)
          
          if (documentError) {
            console.error('Fehler beim Erstellen des Dokumenteneintrags:', documentError)
            // Wir werfen hier keinen Fehler, damit die Transaktion selbst erfolgreich bleibt
          }
        }
      } catch (docErr) {
        console.error('Fehler bei der automatischen Dokumentenerstellung:', docErr)
        // Wir werfen hier keinen Fehler, damit die Transaktion selbst erfolgreich bleibt
      }
      
      // 8. Lokale Liste aktualisieren
      setTransactions(prev => [transaction, ...prev])

      return { 
        success: true, 
        transaction,
        change: data.payment_method === 'cash' && data.received_amount 
          ? data.received_amount - data.total_amount 
          : 0
      }

    } catch (err: any) {
      console.error('Fehler bei der Transaktion:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Transaktionen für den aktuellen Tag laden
  const loadTodayTransactions = async () => {
    try {
      setLoading(true)
      setError(null)

      const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
      
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          transaction_items (
            *,
            item:items (name)
          )
        `)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Fehler beim Laden der Transaktionen:', error)
        throw error
      }

      setTransactions(data || [])
      return { success: true, data }
    } catch (err: any) {
      console.error('Fehler beim Laden der Transaktionen:', err)
      setError(err.message || 'Fehler beim Laden der Daten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Transaktion stornieren
  const cancelTransaction = async (transactionId: string) => {
    try {
      setLoading(true)
      setError(null)

      // Status der Transaktion auf 'cancelled' ändern
      const { data, error } = await supabase
        .from('transactions')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Wenn es eine Barzahlung war, einen Kassenbucheintrag für die Rückerstattung erstellen
      if (data.payment_method === 'cash') {
        // Benutzer-ID abrufen
        const { data: userData } = await supabase.auth.getUser()
        if (!userData?.user) {
          throw new Error('Nicht angemeldet. Bitte melden Sie sich an.')
        }
        const userId = userData.user.id

        // Ausgabe im Kassenbuch verbuchen
        const { error: registerError } = await supabase
          .from('cash_register')
          .insert({
            date: new Date().toISOString().split('T')[0],
            type: 'expense',
            amount: data.total_amount,
            description: `Stornierung (Transaktion: ${transactionId})`,
            user_id: userId
          })

        if (registerError) {
          console.error('Fehler beim Erstellen des Kassenbucheintrags für Stornierung:', registerError)
          // Hier keine Exception werfen, da die Stornierung selbst erfolgreich war
        }
      }

      // Lokale Liste aktualisieren
      setTransactions(prev => 
        prev.map(t => t.id === transactionId ? data : t)
      )

      return { success: true, transaction: data }
    } catch (err: any) {
      console.error('Fehler beim Stornieren der Transaktion:', err)
      setError(err.message || 'Fehler beim Stornieren')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    transactions,
    currentTransaction,
    createTransaction,
    loadTodayTransactions,
    cancelTransaction
  }
}