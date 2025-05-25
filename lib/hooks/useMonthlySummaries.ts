'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

// Typen für Monatsabschlüsse (analog zu DailySummaries)
export type MonthlySummary = {
  id: string
  year: number
  month: number
  sales_cash: number
  sales_twint: number
  sales_sumup: number
  sales_total: number
  expenses_cash: number
  expenses_bank: number
  expenses_total: number
  transaction_count: number
  avg_daily_revenue: number
  status: 'draft' | 'closed'
  notes: string | null
  user_id: string
  created_at: string | null
  closed_at: string | null
}

export type MonthlySummaryInsert = {
  year: number
  month: number
  sales_cash?: number
  sales_twint?: number
  sales_sumup?: number
  sales_total?: number
  expenses_cash?: number
  expenses_bank?: number
  expenses_total?: number
  transaction_count?: number
  avg_daily_revenue?: number
  status?: 'draft' | 'closed'
  notes?: string | null
  user_id: string
}

export type MonthlySummaryUpdate = Partial<MonthlySummaryInsert> & { id: string }

export function useMonthlySummaries() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [monthlySummaries, setMonthlySummaries] = useState<MonthlySummary[]>([])
  const [currentMonthlySummary, setCurrentMonthlySummary] = useState<MonthlySummary | null>(null)

  // Monatsabschluss erstellen mit automatischer Berechnung
  const createMonthlySummary = async (year: number, month: number, notes?: string) => {
    console.log("🔧 createMonthlySummary gestartet", { year, month, notes })
    try {
      setLoading(true)
      setError(null)

      // Benutzer-ID abrufen
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) {
        throw new Error('Nicht angemeldet. Bitte melden Sie sich an.')
      }
      const userId = userData.user.id
      console.log("👤 User ID:", userId)

      // Prüfen, ob bereits ein Abschluss für diesen Monat existiert
      const { data: existingSummary, error: checkError } = await supabase
        .from('monthly_summaries')
        .select('*')
        .eq('year', year)
        .eq('month', month)
        .maybeSingle()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (existingSummary) {
        throw new Error(`Für ${month}/${year} existiert bereits ein Monatsabschluss.`)
      }

      // Automatische Berechnung über Datenbankfunktion
      console.log("🗃️ Rufe calculate_monthly_summary auf...")
      const { error: calcError } = await supabase.rpc('calculate_monthly_summary', {
        summary_year: year,
        summary_month: month
      })

      if (calcError) {
        console.error("❌ Fehler bei calculate_monthly_summary:", calcError)
        throw calcError
      }
      console.log("✅ calculate_monthly_summary erfolgreich")

      // Den erstellten Abschluss abrufen
      console.log("📊 Hole erstellte Monthly Summary...")
      const { data: summary, error: fetchError } = await supabase
        .from('monthly_summaries')
        .select('*')
        .eq('year', year)
        .eq('month', month)
        .single()

      if (fetchError) {
        console.error("❌ Fehler beim Abrufen der erstellten Summary:", fetchError)
        throw fetchError
      }
      console.log("✅ Monthly Summary gefunden:", summary)

      // Notizen hinzufügen falls angegeben
      let finalSummary = summary
      if (notes) {
        const { data: updatedSummary, error: updateError } = await supabase
          .from('monthly_summaries')
          .update({ notes })
          .eq('id', summary.id)
          .select()
          .single()

        if (updateError) {
          throw updateError
        }
        
        finalSummary = updatedSummary
        setCurrentMonthlySummary(updatedSummary)
        setMonthlySummaries(prev => [updatedSummary, ...prev.filter(s => s.id !== updatedSummary.id)])
      } else {
        setCurrentMonthlySummary(summary)
        setMonthlySummaries(prev => [summary, ...prev.filter(s => s.id !== summary.id)])
      }

      return { success: true, summary: finalSummary }
    } catch (err: any) {
      console.error('Fehler beim Erstellen des Monatsabschlusses:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Monatsabschluss by Jahr/Monat abrufen
  const getMonthlySummaryByDate = async (year: number, month: number) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('monthly_summaries')
        .select('*')
        .eq('year', year)
        .eq('month', month)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      setCurrentMonthlySummary(data)
      return { success: true, summary: data }
    } catch (err: any) {
      console.error('Fehler beim Laden des Monatsabschlusses:', err)
      setError(err.message || 'Fehler beim Laden der Daten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Monatsabschluss schließen
  const closeMonthlySummary = async (id: string, notes?: string) => {
    try {
      setLoading(true)
      setError(null)

      const updateData: Partial<MonthlySummary> = {
        status: 'closed',
        closed_at: new Date().toISOString()
      }

      if (notes) {
        updateData.notes = notes
      }

      const { data, error } = await supabase
        .from('monthly_summaries')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      setCurrentMonthlySummary(data)
      setMonthlySummaries(prev => prev.map(s => s.id === id ? data : s))

      return { success: true, summary: data }
    } catch (err: any) {
      console.error('Fehler beim Schließen des Monatsabschlusses:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Alle Monatsabschlüsse laden
  const loadMonthlySummaries = async (limit?: number) => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('monthly_summaries')
        .select('*')
        .order('year', { ascending: false })
        .order('month', { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      setMonthlySummaries(data || [])
      return { success: true, summaries: data }
    } catch (err: any) {
      console.error('Fehler beim Laden der Monatsabschlüsse:', err)
      setError(err.message || 'Fehler beim Laden der Daten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Monatsabschluss aktualisieren (nur im draft status)
  const updateMonthlySummary = async (id: string, updates: Partial<MonthlySummaryUpdate>) => {
    try {
      setLoading(true)
      setError(null)

      // Prüfen ob noch im Draft-Status
      const { data: currentSummary } = await supabase
        .from('monthly_summaries')
        .select('status')
        .eq('id', id)
        .single()

      if (currentSummary?.status === 'closed') {
        throw new Error('Geschlossene Monatsabschlüsse können nicht bearbeitet werden')
      }

      const { data, error } = await supabase
        .from('monthly_summaries')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      setCurrentMonthlySummary(data)
      setMonthlySummaries(prev => prev.map(s => s.id === id ? data : s))

      return { success: true, summary: data }
    } catch (err: any) {
      console.error('Fehler beim Aktualisieren des Monatsabschlusses:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    monthlySummaries,
    currentMonthlySummary,
    setCurrentMonthlySummary,
    createMonthlySummary,
    getMonthlySummaryByDate,
    closeMonthlySummary,
    loadMonthlySummaries,
    updateMonthlySummary
  }
}