'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

// Typen für Kassenbucheinträge
export type CashRegisterEntry = Database['public']['Tables']['cash_register']['Row']
export type CashRegisterEntryInsert = Omit<Database['public']['Tables']['cash_register']['Insert'], 'id' | 'created_at' | 'updated_at'>
export type CashRegisterEntrySummary = {
  dailyIncome: number
  dailyExpense: number
  monthlyIncome: number
  monthlyExpense: number
}

export function useCashRegister() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [entries, setEntries] = useState<CashRegisterEntry[]>([])
  const [summary, setSummary] = useState<CashRegisterEntrySummary>({
    dailyIncome: 0,
    dailyExpense: 0,
    monthlyIncome: 0,
    monthlyExpense: 0
  })

  // Kassenbucheinträge laden (optional gefiltert nach Datum)
  const loadEntries = async (date?: string, startDate?: string, endDate?: string) => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('cash_register')
        .select('*')
        .order('created_at', { ascending: false })

      // Filter nach einem einzelnen Datum
      if (date) {
        query = query.eq('date', date)
      }

      // Filter nach Zeitraum
      if (startDate && endDate) {
        query = query
          .gte('date', startDate)
          .lte('date', endDate)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        throw fetchError
      }

      setEntries(data || [])
      return { success: true, data }
    } catch (err: any) {
      console.error('Fehler beim Laden der Kassenbucheinträge:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Kassenbucheintrag erstellen
  const createEntry = async (entry: CashRegisterEntryInsert) => {
    try {
      setLoading(true)
      setError(null)

      // Benutzer-ID abrufen
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) {
        throw new Error('Nicht angemeldet. Bitte melden Sie sich an.')
      }

      // Kassenstatus prüfen (optional - wir erlauben manuelle Einträge auch bei geschlossener Kasse)
      const today = new Date().toISOString().split('T')[0]
      
      // Kassenbucheintrag erstellen
      const newEntry = {
        ...entry,
        user_id: userData.user.id
      }

      const { data, error: insertError } = await supabase
        .from('cash_register')
        .insert(newEntry)
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      // Lokale Liste aktualisieren
      setEntries(prev => [data as CashRegisterEntry, ...prev])

      // Wenn es der gleiche Tag ist, auch die Zusammenfassung aktualisieren
      if (entry.date === today) {
        updateSummary()
      }

      return { success: true, data }
    } catch (err: any) {
      console.error('Fehler beim Erstellen des Kassenbucheintrags:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Zusammenfassung der Ein- und Ausgänge berechnen
  const updateSummary = async () => {
    try {
      setLoading(true)
      
      // Heutiges Datum und erster Tag des Monats
      const today = new Date().toISOString().split('T')[0]
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
      
      // Einträge für den heutigen Tag abrufen
      const { data: todayEntries, error: todayError } = await supabase
        .from('cash_register')
        .select('*')
        .eq('date', today)
      
      if (todayError) {
        throw todayError
      }
      
      // Einträge für den aktuellen Monat abrufen
      const { data: monthEntries, error: monthError } = await supabase
        .from('cash_register')
        .select('*')
        .gte('date', firstDayOfMonth)
        .lte('date', today)
      
      if (monthError) {
        throw monthError
      }
      
      // Tägliche Summen berechnen
      const dailyIncome = todayEntries
        ? todayEntries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0)
        : 0
      
      const dailyExpense = todayEntries
        ? todayEntries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0)
        : 0
      
      // Monatliche Summen berechnen
      const monthlyIncome = monthEntries
        ? monthEntries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0)
        : 0
      
      const monthlyExpense = monthEntries
        ? monthEntries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0)
        : 0
      
      // Status aktualisieren
      setSummary({
        dailyIncome,
        dailyExpense,
        monthlyIncome,
        monthlyExpense
      })
      
      return {
        success: true,
        summary: {
          dailyIncome,
          dailyExpense,
          monthlyIncome,
          monthlyExpense
        }
      }
    } catch (err: any) {
      console.error('Fehler beim Berechnen der Zusammenfassung:', err)
      setError(err.message || 'Fehler beim Berechnen der Zusammenfassung')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Kassenbucheinträge nach Beschreibung suchen
  const searchEntries = async (searchTerm: string) => {
    try {
      setLoading(true)
      setError(null)

      // Suche in der Beschreibung
      const { data, error: searchError } = await supabase
        .from('cash_register')
        .select('*')
        .ilike('description', `%${searchTerm}%`)
        .order('created_at', { ascending: false })

      if (searchError) {
        throw searchError
      }

      setEntries(data || [])
      return { success: true, data }
    } catch (err: any) {
      console.error('Fehler bei der Suche:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    entries,
    summary,
    loadEntries,
    createEntry,
    updateSummary,
    searchEntries
  }
}