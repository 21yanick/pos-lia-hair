'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

// Typen für Tagesberichte
export type DailyReport = Database['public']['Tables']['daily_reports']['Row']
export type DailyReportInsert = Omit<Database['public']['Tables']['daily_reports']['Insert'], 'id' | 'created_at' | 'updated_at'>
export type DailyReportUpdate = Partial<Omit<Database['public']['Tables']['daily_reports']['Update'], 'id' | 'created_at' | 'updated_at'>> & { id: string }

// Typ für die Zusammenfassung der Tageseinnahmen nach Zahlungsart
export type DailySummary = {
  cashTotal: number
  twintTotal: number
  sumupTotal: number
  totalRevenue: number
  transactionCount: number
}

export function useDailyReports() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([])
  const [currentDailyReport, setCurrentDailyReport] = useState<DailyReport | null>(null)

  // Tagesbericht erstellen
  const createDailyReport = async (data: DailyReportInsert) => {
    try {
      setLoading(true)
      setError(null)

      // Prüfen, ob bereits ein Bericht für dieses Datum existiert
      const { data: existingReport, error: checkError } = await supabase
        .from('daily_reports')
        .select('*')
        .eq('date', data.date)
        .maybeSingle()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (existingReport) {
        throw new Error(`Es existiert bereits ein Tagesbericht für ${data.date}.`)
      }

      // Neuen Tagesbericht erstellen
      const { data: report, error: createError } = await supabase
        .from('daily_reports')
        .insert(data)
        .select()
        .single()

      if (createError) {
        throw createError
      }

      // Alle Transaktionen für diesen Tag mit dem Bericht verknüpfen
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ daily_report_id: report.id })
        .eq('status', 'completed') // Nur abgeschlossene Transaktionen
        .gte('created_at', `${data.date}T00:00:00`)
        .lte('created_at', `${data.date}T23:59:59`)

      if (updateError) {
        console.error('Fehler beim Verknüpfen der Transaktionen:', updateError)
        // Wir werfen hier keine Exception, da der Bericht selbst erfolgreich erstellt wurde
      }

      // Auch alle Kassenbucheinträge für diesen Tag mit dem Bericht verknüpfen
      const { error: registerError } = await supabase
        .from('cash_register')
        .update({ daily_report_id: report.id })
        .eq('date', data.date)

      if (registerError) {
        console.error('Fehler beim Verknüpfen der Kassenbucheinträge:', registerError)
        // Wir werfen hier keine Exception, da der Bericht selbst erfolgreich erstellt wurde
      }

      // Status aktualisieren
      setCurrentDailyReport(report as DailyReport)
      setDailyReports(prev => [report as DailyReport, ...prev])

      return { success: true, report }
    } catch (err: any) {
      console.error('Fehler beim Erstellen des Tagesberichts:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Tagesbericht für ein bestimmtes Datum abrufen
  const getDailyReportByDate = async (date: string) => {
    try {
      setLoading(true)
      setError(null)

      // Benutzer-ID abrufen für RLS
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) {
        return { success: false, error: 'Nicht angemeldet. Bitte melden Sie sich an.' }
      }

      const { data, error } = await supabase
        .from('daily_reports')
        .select('*')
        .eq('date', date)
        .maybeSingle() // Verwende maybeSingle statt single, um 404-Fehler zu vermeiden

      if (error) {
        console.error('Datenbankfehler beim Abrufen des Tagesberichts:', error)
        throw error
      }

      // Wenn kein Bericht gefunden wurde
      if (!data) {
        console.log(`Kein Tagesbericht für das Datum ${date} gefunden.`)
        return { success: false, error: `Kein Tagesbericht für das Datum ${date} gefunden.` }
      }

      console.log(`Tagesbericht gefunden:`, data)
      setCurrentDailyReport(data as DailyReport)
      return { success: true, report: data as DailyReport }
    } catch (err: any) {
      console.error('Fehler beim Abrufen des Tagesberichts:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Alle Tagesberichte laden
  const loadDailyReports = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('daily_reports')
        .select('*')
        .order('date', { ascending: false })

      if (error) {
        throw error
      }

      setDailyReports(data as DailyReport[])
      return { success: true, reports: data }
    } catch (err: any) {
      console.error('Fehler beim Laden der Tagesberichte:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Tagesbericht aktualisieren
  const updateDailyReport = async (id: string, updates: Partial<DailyReportUpdate>) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('daily_reports')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Status aktualisieren
      setCurrentDailyReport(currentDailyReport?.id === id ? data as DailyReport : currentDailyReport)
      setDailyReports(prev => prev.map(report => report.id === id ? data as DailyReport : report))

      return { success: true, report: data }
    } catch (err: any) {
      console.error('Fehler beim Aktualisieren des Tagesberichts:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Berechnung der Tageseinnahmen nach Zahlungsart
  const calculateDailySummary = async (date: string) => {
    try {
      setLoading(true)
      setError(null)

      // Benutzer-ID abrufen für RLS
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) {
        return { 
          success: false, 
          error: 'Nicht angemeldet. Bitte melden Sie sich an.',
          summary: {
            cashTotal: 0,
            twintTotal: 0,
            sumupTotal: 0,
            totalRevenue: 0,
            transactionCount: 0
          } as DailySummary
        }
      }

      // Alle abgeschlossenen Transaktionen für den spezifizierten Tag abrufen
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('status', 'completed')
        .gte('created_at', `${date}T00:00:00`)
        .lte('created_at', `${date}T23:59:59`)

      if (error) {
        console.error('Datenbankfehler bei der Berechnung der Tageseinnahmen:', error)
        throw error
      }

      // Summen nach Zahlungsart berechnen
      let cashTotal = 0
      let twintTotal = 0
      let sumupTotal = 0

      // Sicherstellen, dass transactions ein Array ist
      if (transactions && Array.isArray(transactions)) {
        transactions.forEach(transaction => {
          if (transaction.payment_method === 'cash') {
            cashTotal += transaction.total_amount
          } else if (transaction.payment_method === 'twint') {
            twintTotal += transaction.total_amount
          } else if (transaction.payment_method === 'sumup') {
            sumupTotal += transaction.total_amount
          }
        })
      }

      const totalRevenue = cashTotal + twintTotal + sumupTotal

      return {
        success: true,
        summary: {
          cashTotal,
          twintTotal,
          sumupTotal,
          totalRevenue,
          transactionCount: transactions?.length || 0
        } as DailySummary
      }
    } catch (err: any) {
      console.error('Fehler bei der Berechnung der Tageseinnahmen:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { 
        success: false, 
        error: err.message,
        summary: {
          cashTotal: 0,
          twintTotal: 0,
          sumupTotal: 0,
          totalRevenue: 0,
          transactionCount: 0
        } as DailySummary
      }
    } finally {
      setLoading(false)
    }
  }

  // Transaktionen für einen bestimmten Tag abrufen
  const getTransactionsForDate = async (date: string) => {
    try {
      setLoading(true)
      setError(null)

      // Benutzer-ID abrufen für RLS
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) {
        return { success: false, error: 'Nicht angemeldet. Bitte melden Sie sich an.', transactions: [] }
      }

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          transaction_items (
            *,
            item:items (name)
          )
        `)
        .gte('created_at', `${date}T00:00:00`)
        .lte('created_at', `${date}T23:59:59`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Datenbankfehler beim Abrufen der Transaktionen:', error)
        throw error
      }

      // Leeres Array zurückgeben, wenn keine Daten gefunden wurden
      return { success: true, transactions: data || [] }
    } catch (err: any) {
      console.error('Fehler beim Abrufen der Transaktionen:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message, transactions: [] }
    } finally {
      setLoading(false)
    }
  }

  // Tagesbericht schließen
  const closeDailyReport = async (reportId: string, endingCash: number, notes?: string) => {
    try {
      setLoading(true)
      setError(null)

      // Tagesbericht aktualisieren
      const { data, error } = await supabase
        .from('daily_reports')
        .update({
          status: 'closed',
          ending_cash: endingCash,
          notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Status aktualisieren
      setCurrentDailyReport(data as DailyReport)
      setDailyReports(prev => prev.map(report => report.id === reportId ? data as DailyReport : report))

      return { success: true, report: data }
    } catch (err: any) {
      console.error('Fehler beim Schließen des Tagesberichts:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    dailyReports,
    currentDailyReport,
    createDailyReport,
    getDailyReportByDate,
    loadDailyReports,
    updateDailyReport,
    calculateDailySummary,
    getTransactionsForDate,
    closeDailyReport
  }
}