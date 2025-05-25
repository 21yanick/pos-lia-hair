'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'
import { useDocumentGeneration } from './useDocumentGeneration'

// Typen für Verkäufe (ersetzt Transaktionen)
export type Sale = Database['public']['Tables']['sales']['Row']
export type SaleInsert = Omit<Database['public']['Tables']['sales']['Insert'], 'id' | 'created_at'>
export type SaleUpdate = Partial<Omit<Database['public']['Tables']['sales']['Update'], 'id' | 'created_at'>> & { id: string }

// Typen für Verkaufsposten (ersetzt Transaktionsposten)
export type SaleItem = Database['public']['Tables']['sale_items']['Row']
export type SaleItemInsert = Omit<Database['public']['Tables']['sale_items']['Insert'], 'id'>

// Typ für den Warenkorb (bleibt gleich)
export type CartItem = {
  id: string        // Item ID aus der Datenbank
  name: string      // Name des Items
  price: number     // Preis pro Stück (kann vom Standard-Preis abweichen)
  quantity: number  // Menge
  total: number     // Gesamtpreis (Preis × Menge)
}

// Typ für die Erstellung einer kompletten Verkaufstransaktion
export type CreateSaleData = {
  total_amount: number
  payment_method: 'cash' | 'twint' | 'sumup'
  notes?: string | null
  items: CartItem[]
  received_amount?: number  // Nur für Bargeld-Zahlungen: Erhaltener Betrag
}

export function useSales() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sales, setSales] = useState<Sale[]>([])
  const [currentSale, setCurrentSale] = useState<Sale | null>(null)
  const { generateReceipt } = useDocumentGeneration()

  // Verkauf erstellen mit allen Posten
  const createSale = async (data: CreateSaleData) => {
    try {
      setLoading(true)
      setError(null)

      // 1. Benutzer-ID abrufen
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) {
        throw new Error('Nicht angemeldet. Bitte melden Sie sich an.')
      }
      const userId = userData.user.id

      // 2. Verkauf erstellen
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          total_amount: data.total_amount,
          payment_method: data.payment_method,
          status: 'completed',  // Standard-Status für neue Verkäufe
          notes: data.notes || null,
          user_id: userId,
        })
        .select()
        .single()

      if (saleError) {
        console.error('Fehler beim Erstellen des Verkaufs:', saleError)
        throw saleError
      }

      // 3. Verkaufsposten für jedes Item im Warenkorb erstellen
      const saleItems: SaleItemInsert[] = data.items.map(item => ({
        sale_id: sale.id,
        item_id: item.id,
        price: item.price,
        notes: null  // Optional: Anmerkungen zum Posten
      }))

      // 4. Alle Verkaufsposten in einer Operation einfügen
      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems)

      if (itemsError) {
        console.error('Fehler beim Erstellen der Verkaufsposten:', itemsError)
        throw itemsError
      }
      
      console.log('Verkaufsposten erfolgreich erstellt:', saleItems.length)

      // 5. Bargeld-Bewegung erstellen, wenn es eine Barzahlung ist
      if (data.payment_method === 'cash') {
        const { error: cashError } = await supabase
          .from('cash_movements')
          .insert({
            amount: data.total_amount,
            type: 'cash_in',
            description: `Barzahlung (Verkauf: ${sale.id})`,
            reference_type: 'sale',
            reference_id: sale.id,
            user_id: userId
          })

        if (cashError) {
          console.error('Fehler beim Erstellen der Bargeld-Bewegung:', cashError)
          // Hier keine Exception werfen, da der Verkauf selbst erfolgreich war
        }
      }

      // 6. Aktuelle Verkauf setzen für das UI
      setCurrentSale(sale)
      
      // 7. Automatisch eine Quittung für diesen Verkauf erstellen
      let receiptResult: any
      try {
        receiptResult = await createReceiptPDF(sale, data.items)
      } catch (docErr) {
        console.error('Fehler bei der automatischen Quittungserstellung:', docErr)
        // Wir werfen hier keinen Fehler, damit der Verkauf selbst erfolgreich bleibt
      }
      
      // 8. Lokale Liste aktualisieren
      setSales(prev => [sale, ...prev])

      return { 
        success: true, 
        sale,
        receiptUrl: receiptResult?.publicUrl,
        change: data.payment_method === 'cash' && data.received_amount 
          ? data.received_amount - data.total_amount 
          : 0
      }

    } catch (err: any) {
      console.error('Fehler beim Verkauf:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Moderne Quittungs-PDF erstellen mit @react-pdf/renderer
  const createReceiptPDF = async (sale: Sale, items: CartItem[]) => {
    const React = await import('react')
    const { ReceiptPDF } = await import('@/components/pdf/ReceiptPDF')
    
    return await generateReceipt(
      React.createElement(ReceiptPDF, { sale, items }),
      sale.id,
      sale.payment_method
    )
  }

  // Verkäufe für den aktuellen Tag laden
  const loadTodaySales = async () => {
    try {
      setLoading(true)
      setError(null)

      const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
      
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          sale_items (
            *,
            item:items (name)
          )
        `)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Fehler beim Laden der Verkäufe:', error)
        throw error
      }

      setSales(data || [])
      return { success: true, data }
    } catch (err: any) {
      console.error('Fehler beim Laden der Verkäufe:', err)
      setError(err.message || 'Fehler beim Laden der Daten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Verkauf stornieren
  const cancelSale = async (saleId: string) => {
    try {
      setLoading(true)
      setError(null)

      // Status des Verkaufs auf 'cancelled' ändern
      const { data, error } = await supabase
        .from('sales')
        .update({ 
          status: 'cancelled'
        })
        .eq('id', saleId)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Wenn es eine Barzahlung war, eine Bargeld-Bewegung für die Rückerstattung erstellen
      if (data.payment_method === 'cash') {
        // Benutzer-ID abrufen
        const { data: userData } = await supabase.auth.getUser()
        if (!userData?.user) {
          throw new Error('Nicht angemeldet. Bitte melden Sie sich an.')
        }
        const userId = userData.user.id

        // Ausgabe als Bargeld-Bewegung verbuchen
        const { error: cashError } = await supabase
          .from('cash_movements')
          .insert({
            amount: data.total_amount,
            type: 'cash_out',
            description: `Stornierung (Verkauf: ${saleId})`,
            reference_type: 'sale',
            reference_id: saleId,
            user_id: userId
          })

        if (cashError) {
          console.error('Fehler beim Erstellen der Bargeld-Bewegung für Stornierung:', cashError)
          // Hier keine Exception werfen, da die Stornierung selbst erfolgreich war
        }
      }

      // Lokale Liste aktualisieren
      setSales(prev => 
        prev.map(s => s.id === saleId ? data : s)
      )

      return { success: true, sale: data }
    } catch (err: any) {
      console.error('Fehler beim Stornieren des Verkaufs:', err)
      setError(err.message || 'Fehler beim Stornieren')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Verkäufe für Datumsbereich laden
  const getSalesForDateRange = async (startDate: string, endDate: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return { success: true, sales: data }
    } catch (err: any) {
      console.error('Fehler beim Laden der Verkäufe für Datumsbereich:', err)
      setError(err.message || 'Fehler beim Laden der Verkäufe')
      return { success: false, error: err.message, sales: [] }
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    sales,
    currentSale,
    createSale,
    loadTodaySales,
    getSalesForDateRange,
    cancelSale
  }
}