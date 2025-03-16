'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

// Typen für Lieferantenrechnungen
export type SupplierInvoice = Database['public']['Tables']['supplier_invoices']['Row']
export type SupplierInvoiceInsert = Omit<Database['public']['Tables']['supplier_invoices']['Insert'], 'id' | 'created_at' | 'updated_at'>
export type SupplierInvoiceUpdate = Partial<Omit<Database['public']['Tables']['supplier_invoices']['Update'], 'id' | 'created_at' | 'updated_at'>> & { id: string }

// Zusammenfassungstyp für Übersicht
export type SupplierInvoiceSummary = {
  total: number
  pendingTotal: number
  paidTotal: number
}

export function useSupplierInvoices() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [invoices, setInvoices] = useState<SupplierInvoice[]>([])
  const [summary, setSummary] = useState<SupplierInvoiceSummary>({
    total: 0,
    pendingTotal: 0,
    paidTotal: 0
  })

  // Alle Lieferantenrechnungen laden
  const loadInvoices = async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('supplier_invoices')
        .select('*')
        .order('invoice_date', { ascending: false })

      // Filter nach Zeitraum
      if (startDate && endDate) {
        query = query
          .gte('invoice_date', startDate)
          .lte('invoice_date', endDate)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        throw fetchError
      }

      setInvoices(data || [])
      updateSummary(data || [])
      return { success: true, data }
    } catch (err: any) {
      console.error('Fehler beim Laden der Lieferantenrechnungen:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Neue Lieferantenrechnung erstellen
  const createInvoice = async (invoice: SupplierInvoiceInsert) => {
    try {
      setLoading(true)
      setError(null)

      // Benutzer-ID abrufen
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) {
        throw new Error('Nicht angemeldet. Bitte melden Sie sich an.')
      }

      // Neue Rechnung erstellen
      const newInvoice = {
        ...invoice,
        user_id: userData.user.id
      }

      const { data, error: insertError } = await supabase
        .from('supplier_invoices')
        .insert(newInvoice)
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      // Bei Barzahlung einen entsprechenden Kassenbucheintrag erstellen
      if (invoice.status === 'paid' && invoice.payment_date) {
        // Kassenbucheintrag für die Barrechnung erstellen
        const { error: registerError } = await supabase
          .from('cash_register')
          .insert({
            date: invoice.payment_date,
            type: 'expense',
            amount: invoice.amount,
            description: `Lieferantenrechnung: ${invoice.supplier_name} (${invoice.invoice_number})`,
            user_id: userData.user.id
          })

        if (registerError) {
          console.error('Fehler beim Erstellen des Kassenbucheintrags:', registerError)
          // Wir werfen hier keinen Fehler, da die Hauptoperation erfolgreich war
        }
      }

      // Lokale Liste aktualisieren
      setInvoices(prev => [data as SupplierInvoice, ...prev])
      updateSummary([data as SupplierInvoice, ...invoices])

      return { success: true, data }
    } catch (err: any) {
      console.error('Fehler beim Erstellen der Lieferantenrechnung:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Lieferantenrechnung aktualisieren
  const updateInvoice = async (invoice: SupplierInvoiceUpdate) => {
    try {
      setLoading(true)
      setError(null)

      // Benutzer-ID abrufen
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) {
        throw new Error('Nicht angemeldet. Bitte melden Sie sich an.')
      }

      // Aktuelle Daten der Rechnung abrufen
      const { data: currentInvoice, error: fetchError } = await supabase
        .from('supplier_invoices')
        .select('*')
        .eq('id', invoice.id)
        .single()

      if (fetchError) {
        throw fetchError
      }

      // Rechnung aktualisieren
      const { data, error: updateError } = await supabase
        .from('supplier_invoices')
        .update({
          ...invoice,
          updated_at: new Date().toISOString()
        })
        .eq('id', invoice.id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      // Prüfen, ob der Status von "pending" auf "paid" geändert wurde
      // und ob ein Zahlungsdatum gesetzt wurde
      if (
        currentInvoice.status === 'pending' && 
        invoice.status === 'paid' && 
        invoice.payment_date
      ) {
        // Kassenbucheintrag für die Barrechnung erstellen
        const { error: registerError } = await supabase
          .from('cash_register')
          .insert({
            date: invoice.payment_date,
            type: 'expense',
            amount: data.amount,
            description: `Lieferantenrechnung: ${data.supplier_name} (${data.invoice_number})`,
            user_id: userData.user.id
          })

        if (registerError) {
          console.error('Fehler beim Erstellen des Kassenbucheintrags:', registerError)
          // Wir werfen hier keinen Fehler, da die Hauptoperation erfolgreich war
        }
      }

      // Lokale Liste aktualisieren
      setInvoices(prev => prev.map(inv => inv.id === invoice.id ? data : inv))
      updateSummary(invoices.map(inv => inv.id === invoice.id ? data : inv))

      return { success: true, data }
    } catch (err: any) {
      console.error('Fehler beim Aktualisieren der Lieferantenrechnung:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Lieferantenrechnung löschen
  const deleteInvoice = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const { error: deleteError } = await supabase
        .from('supplier_invoices')
        .delete()
        .eq('id', id)

      if (deleteError) {
        throw deleteError
      }

      // Lokale Liste aktualisieren
      const updatedInvoices = invoices.filter(inv => inv.id !== id)
      setInvoices(updatedInvoices)
      updateSummary(updatedInvoices)

      return { success: true }
    } catch (err: any) {
      console.error('Fehler beim Löschen der Lieferantenrechnung:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Lieferantenrechnungen nach Text durchsuchen
  const searchInvoices = async (searchTerm: string) => {
    try {
      setLoading(true)
      setError(null)

      // Suche in Lieferantenname oder Rechnungsnummer
      const { data, error: searchError } = await supabase
        .from('supplier_invoices')
        .select('*')
        .or(`supplier_name.ilike.%${searchTerm}%,invoice_number.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%`)
        .order('invoice_date', { ascending: false })

      if (searchError) {
        throw searchError
      }

      setInvoices(data || [])
      updateSummary(data || [])
      return { success: true, data }
    } catch (err: any) {
      console.error('Fehler bei der Suche:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Zusammenfassung aktualisieren
  const updateSummary = (data: SupplierInvoice[]) => {
    const total = data.reduce((sum, inv) => sum + inv.amount, 0)
    const pendingTotal = data.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0)
    const paidTotal = data.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0)

    setSummary({
      total,
      pendingTotal,
      paidTotal
    })
  }

  return {
    loading,
    error,
    invoices,
    summary,
    loadInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    searchInvoices
  }
}