'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'
import { getSwissDayRange } from '@/lib/utils/dateUtils'

// Typen für Tagesabschlüsse (ersetzt DailyReports)
export type DailySummary = Database['public']['Tables']['daily_summaries']['Row']
export type DailySummaryInsert = Omit<Database['public']['Tables']['daily_summaries']['Insert'], 'id' | 'created_at'>
export type DailySummaryUpdate = Partial<Omit<Database['public']['Tables']['daily_summaries']['Update'], 'id' | 'created_at'>> & { id: string }

// Typ für die automatisch berechnete Zusammenfassung
export type CalculatedSummary = {
  salesCash: number
  salesTwint: number
  salesSumup: number
  salesTotal: number
  expensesCash: number
  expensesBank: number
  expensesTotal: number
  netCash: number
  transactionCount: number
}

export function useDailySummaries() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>([])
  const [currentDailySummary, setCurrentDailySummary] = useState<DailySummary | null>(null)

  // Tagesabschluss erstellen mit automatischer Berechnung
  const createDailySummary = async (date: string, cashStarting: number, cashEnding: number, notes?: string) => {
    try {
      setLoading(true)
      setError(null)

      // Benutzer-ID abrufen
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) {
        throw new Error('Nicht angemeldet. Bitte melden Sie sich an.')
      }
      const userId = userData.user.id

      // Prüfen, ob bereits ein Abschluss für dieses Datum existiert
      const { data: existingSummary, error: checkError } = await supabase
        .from('daily_summaries')
        .select('*')
        .eq('report_date', date)
        .maybeSingle()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      // Wenn bereits ein Abschluss existiert, aktualisieren statt neu erstellen
      if (existingSummary) {
        console.log('Existierender Tagesabschluss gefunden - wird aktualisiert statt neu erstellt')
        
        // Automatische Berechnung über Supabase-Funktion ausführen
        const { error: calcError } = await supabase.rpc('calculate_daily_summary', {
          summary_date: date
        })

        if (calcError) {
          console.error('Fehler bei der automatischen Berechnung:', calcError)
        }

        // Bargeld-Werte und Status aktualisieren
        const cashDifference = cashEnding - cashStarting
        const { data: updatedSummary, error: updateError } = await supabase
          .from('daily_summaries')
          .update({
            cash_starting: cashStarting,
            cash_ending: cashEnding,
            cash_difference: cashDifference,
            status: 'closed',
            notes: notes || null,
            closed_at: new Date().toISOString(),
            user_id: userId
          })
          .eq('id', existingSummary.id)
          .select()
          .single()

        if (updateError) {
          throw updateError
        }

        // Status aktualisieren
        setCurrentDailySummary(updatedSummary)
        setDailySummaries(prev => prev.map(s => s.id === existingSummary.id ? updatedSummary : s))

        return { success: true, summary: updatedSummary }
      }

      // Automatische Berechnung über Supabase-Funktion ausführen
      const { error: calcError } = await supabase.rpc('calculate_daily_summary', {
        summary_date: date
      })

      if (calcError) {
        console.error('Fehler bei der automatischen Berechnung:', calcError)
        // Fallback: Manuelle Berechnung
        const calculated = await calculateDailySummary(date)
        if (!calculated.success) {
          throw new Error('Fehler bei der Berechnung der Tagesabschlüsse')
        }
      }

      // Tagesabschluss aus der Datenbank abrufen (wurde durch calculate_daily_summary erstellt/aktualisiert)
      const { data: summary, error: fetchError } = await supabase
        .from('daily_summaries')
        .select('*')
        .eq('report_date', date)
        .single()

      if (fetchError) {
        throw fetchError
      }

      // Bargeld-Werte und Status aktualisieren
      const cashDifference = cashEnding - cashStarting
      const { data: updatedSummary, error: updateError } = await supabase
        .from('daily_summaries')
        .update({
          cash_starting: cashStarting,
          cash_ending: cashEnding,
          cash_difference: cashDifference,
          status: 'closed',
          notes: notes || null,
          closed_at: new Date().toISOString(),
          user_id: userId
        })
        .eq('id', summary.id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      // Status aktualisieren
      setCurrentDailySummary(updatedSummary)
      setDailySummaries(prev => [updatedSummary, ...prev])

      return { success: true, summary: updatedSummary }
    } catch (err: any) {
      console.error('Fehler beim Erstellen des Tagesabschlusses:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Tagesabschluss für ein bestimmtes Datum abrufen
  const getDailySummaryByDate = async (date: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('daily_summaries')
        .select('*')
        .eq('report_date', date)
        .maybeSingle()

      if (error) {
        console.error('Datenbankfehler beim Abrufen des Tagesabschlusses:', error)
        throw error
      }

      if (!data) {
        console.log(`Kein Tagesabschluss für das Datum ${date} gefunden.`)
        return { success: false, error: `Kein Tagesabschluss für das Datum ${date} gefunden.` }
      }

      console.log(`Tagesabschluss gefunden:`, data)
      setCurrentDailySummary(data)
      return { success: true, summary: data }
    } catch (err: any) {
      console.error('Fehler beim Abrufen des Tagesabschlusses:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Alle Tagesabschlüsse laden
  const loadDailySummaries = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('daily_summaries')
        .select('*')
        .order('report_date', { ascending: false })

      if (error) {
        throw error
      }

      setDailySummaries(data)
      return { success: true, summaries: data }
    } catch (err: any) {
      console.error('Fehler beim Laden der Tagesabschlüsse:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Berechnung der Tageseinnahmen und -ausgaben nach Zahlungsart
  const calculateDailySummary = async (date: string): Promise<{ success: boolean; summary?: CalculatedSummary; error?: string }> => {
    try {
      setLoading(true)
      setError(null)

      // Parse Swiss date and get UTC range
      const swissDate = new Date(date + 'T12:00:00')
      const { start, end } = getSwissDayRange(swissDate)

      // Verkäufe für den Tag abrufen
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .eq('status', 'completed')
        .gte('created_at', start)
        .lte('created_at', end)

      if (salesError) {
        console.error('Datenbankfehler bei der Berechnung der Verkäufe:', salesError)
        throw salesError
      }

      // Ausgaben für den Tag abrufen
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('payment_date', date)

      if (expensesError) {
        console.error('Datenbankfehler bei der Berechnung der Ausgaben:', expensesError)
        throw expensesError
      }

      // Verkäufe nach Zahlungsart summieren
      let salesCash = 0
      let salesTwint = 0
      let salesSumup = 0

      if (sales && Array.isArray(sales)) {
        sales.forEach(sale => {
          if (sale.payment_method === 'cash') {
            salesCash += sale.total_amount
          } else if (sale.payment_method === 'twint') {
            salesTwint += sale.total_amount
          } else if (sale.payment_method === 'sumup') {
            salesSumup += sale.total_amount
          }
        })
      }

      // Ausgaben nach Zahlungsart summieren
      let expensesCash = 0
      let expensesBank = 0

      if (expenses && Array.isArray(expenses)) {
        expenses.forEach(expense => {
          if (expense.payment_method === 'cash') {
            expensesCash += expense.amount
          } else if (expense.payment_method === 'bank') {
            expensesBank += expense.amount
          }
        })
      }

      const salesTotal = salesCash + salesTwint + salesSumup
      const expensesTotal = expensesCash + expensesBank
      const netCash = salesCash - expensesCash

      const summary: CalculatedSummary = {
        salesCash,
        salesTwint,
        salesSumup,
        salesTotal,
        expensesCash,
        expensesBank,
        expensesTotal,
        netCash,
        transactionCount: sales?.length || 0
      }

      return { success: true, summary }
    } catch (err: any) {
      console.error('Fehler bei der Berechnung der Tageszusammenfassung:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Verkäufe für einen bestimmten Tag abrufen
  const getSalesForDate = async (date: string) => {
    try {
      setLoading(true)
      setError(null)

      // Parse Swiss date and get UTC range for database query
      const swissDate = new Date(date + 'T12:00:00') // Midday to avoid DST issues
      const { start, end } = getSwissDayRange(swissDate)
      
      console.log('🔍 getSalesForDate Debug:')
      console.log('Input Swiss Date:', date)
      console.log('Parsed Swiss Date:', swissDate)
      console.log('UTC Range:', { start, end })
      console.log('Current Zeit:', new Date().toISOString())

      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          sale_items (
            *,
            item:items (name)
          )
        `)
        .gte('created_at', start)
        .lte('created_at', end)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Datenbankfehler beim Abrufen der Verkäufe:', error)
        throw error
      }

      console.log('🔍 getSalesForDate Ergebnis:')
      console.log('Anzahl Verkäufe gefunden:', data?.length || 0)
      if (data && data.length > 0) {
        console.log('Erste Verkauf created_at:', data[0].created_at)
        console.log('Letzte Verkauf created_at:', data[data.length - 1].created_at)
      }

      return { success: true, sales: data || [] }
    } catch (err: any) {
      console.error('Fehler beim Abrufen der Verkäufe:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message, sales: [] }
    } finally {
      setLoading(false)
    }
  }

  // Ausgaben für einen bestimmten Tag abrufen
  const getExpensesForDate = async (date: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('payment_date', date)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Datenbankfehler beim Abrufen der Ausgaben:', error)
        throw error
      }

      return { success: true, expenses: data || [] }
    } catch (err: any) {
      console.error('Fehler beim Abrufen der Ausgaben:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message, expenses: [] }
    } finally {
      setLoading(false)
    }
  }

  // Aktuellen Bargeld-Bestand abrufen
  const getCurrentCashBalance = async () => {
    try {
      const { data, error } = await supabase.rpc('get_current_cash_balance')

      if (error) {
        console.error('Fehler beim Abrufen des Bargeld-Bestands:', error)
        throw error
      }

      return { success: true, balance: data || 0 }
    } catch (err: any) {
      console.error('Fehler beim Abrufen des Bargeld-Bestands:', err)
      return { success: false, error: err.message, balance: 0 }
    }
  }

  // Bargeld-Bewegungen für einen bestimmten Tag abrufen
  const getCashMovementsForDate = async (date: string) => {
    try {
      setLoading(true)
      setError(null)

      // Parse Swiss date and get UTC range for database query
      const swissDate = new Date(date + 'T12:00:00')
      const { start, end } = getSwissDayRange(swissDate)

      const { data, error } = await supabase
        .from('cash_movements')
        .select('*')
        .gte('created_at', start)
        .lte('created_at', end)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Datenbankfehler beim Abrufen der Bargeld-Bewegungen:', error)
        throw error
      }

      return { success: true, movements: data || [] }
    } catch (err: any) {
      console.error('Fehler beim Abrufen der Bargeld-Bewegungen:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message, movements: [] }
    } finally {
      setLoading(false)
    }
  }

  // Bargeld-Bewegungen für einen ganzen Monat abrufen
  const getCashMovementsForMonth = async (monthStart: Date, monthEnd: Date) => {
    try {
      setLoading(true)
      setError(null)

      // Convert to UTC for database query
      const startUTC = new Date(monthStart.getFullYear(), monthStart.getMonth(), monthStart.getDate()).toISOString()
      const endUTC = new Date(monthEnd.getFullYear(), monthEnd.getMonth(), monthEnd.getDate(), 23, 59, 59).toISOString()

      const { data, error } = await supabase
        .from('cash_movements')
        .select('*')
        .gte('created_at', startUTC)
        .lte('created_at', endUTC)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Datenbankfehler beim Abrufen der Bargeld-Bewegungen:', error)
        throw error
      }

      return { success: true, movements: data || [] }
    } catch (err: any) {
      console.error('Fehler beim Abrufen der Bargeld-Bewegungen:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message, movements: [] }
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    dailySummaries,
    currentDailySummary,
    createDailySummary,
    getDailySummaryByDate,
    loadDailySummaries,
    calculateDailySummary,
    getSalesForDate,
    getExpensesForDate,
    getCurrentCashBalance,
    getCashMovementsForDate,
    getCashMovementsForMonth
  }
}