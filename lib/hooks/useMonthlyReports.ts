'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

// Typen für Monatsberichte
export type MonthlyReport = Database['public']['Tables']['monthly_reports']['Row']
export type MonthlyReportInsert = Omit<Database['public']['Tables']['monthly_reports']['Insert'], 'id' | 'created_at' | 'updated_at'>
export type MonthlyReportUpdate = Partial<Omit<Database['public']['Tables']['monthly_reports']['Update'], 'id' | 'created_at' | 'updated_at'>> & { id: string }

// Typ für die Zusammenfassung der Monatseinnahmen
export type MonthlySummary = {
  cashTotal: number
  twintTotal: number
  sumupTotal: number
  totalRevenue: number
  transactionCount: number
  servicesTotal: number
  productsTotal: number
  avgDailyRevenue: number
  previousMonthRevenue?: number
}

// Typ für Top-Dienstleistungen/-Produkte
export type TopItem = {
  name: string
  count: number
  total: number
}

// Typ für Tagesumsätze
export type DailyRevenue = {
  day: string
  total: number
}

export function useMonthlyReports() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [monthlyReports, setMonthlyReports] = useState<MonthlyReport[]>([])
  const [currentMonthlyReport, setCurrentMonthlyReport] = useState<MonthlyReport | null>(null)

  // Monatsbericht für einen bestimmten Monat abrufen
  const getMonthlyReportByDate = async (year: number, month: number) => {
    try {
      setLoading(true)
      setError(null)

      // Benutzer-ID abrufen für RLS
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) {
        return { success: false, error: 'Nicht angemeldet. Bitte melden Sie sich an.' }
      }

      const { data, error } = await supabase
        .from('monthly_reports')
        .select('*')
        .eq('year', year)
        .eq('month', month)
        .maybeSingle()

      if (error) {
        console.error('Datenbankfehler beim Abrufen des Monatsberichts:', error)
        throw error
      }

      // Wenn kein Bericht gefunden wurde
      if (!data) {
        console.log(`Kein Monatsbericht für ${month}/${year} gefunden.`)
        setCurrentMonthlyReport(null)
        return { success: false, error: `Kein Monatsbericht für ${month}/${year} gefunden.` }
      }

      console.log(`Monatsbericht gefunden:`, data)
      setCurrentMonthlyReport(data as MonthlyReport)
      return { success: true, report: data as MonthlyReport }
    } catch (err: any) {
      console.error('Fehler beim Abrufen des Monatsberichts:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Alle Monatsberichte laden
  const loadMonthlyReports = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('monthly_reports')
        .select('*')
        .order('year', { ascending: false })
        .order('month', { ascending: false })

      if (error) {
        throw error
      }

      setMonthlyReports(data as MonthlyReport[])
      return { success: true, reports: data }
    } catch (err: any) {
      console.error('Fehler beim Laden der Monatsberichte:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Monatsbericht erstellen
  const createMonthlyReport = async (data: MonthlyReportInsert) => {
    try {
      setLoading(true)
      setError(null)

      console.log("Versuche, Monatsbericht zu erstellen:", {
        year: data.year,
        month: data.month,
        totalRevenue: data.total_revenue
      });

      // Benutzer-ID abrufen für RLS
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) {
        console.error('Nicht authentifiziert beim Erstellen des Monatsberichts');
        return { success: false, error: 'Nicht angemeldet. Bitte melden Sie sich an.' }
      }

      // Prüfen, ob bereits ein Bericht für diesen Monat existiert
      const { data: existingReport, error: checkError } = await supabase
        .from('monthly_reports')
        .select('*')
        .eq('year', data.year)
        .eq('month', data.month)
        .maybeSingle()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Fehler beim Prüfen auf existierenden Monatsbericht:', checkError);
        throw checkError
      }

      if (existingReport) {
        console.log('Bericht existiert bereits, wird aktualisiert:', existingReport);
        return await updateMonthlyReport(existingReport.id, {
          total_revenue: data.total_revenue,
          cash_total: data.cash_total,
          twint_total: data.twint_total,
          sumup_total: data.sumup_total,
          status: data.status,
          notes: data.notes
        });
      }

      // Neuen Monatsbericht erstellen
      const { data: report, error: createError } = await supabase
        .from('monthly_reports')
        .insert({
          ...data,
          user_id: userData.user.id // Explizit User-ID setzen
        })
        .select()
        .single()

      if (createError) {
        console.error('Fehler beim Erstellen des Monatsberichts in der Datenbank:', createError);
        throw createError
      }

      console.log('Monatsbericht erfolgreich erstellt:', report);

      // Status aktualisieren
      setCurrentMonthlyReport(report as MonthlyReport)
      setMonthlyReports(prev => [report as MonthlyReport, ...prev])

      return { success: true, report }
    } catch (err: any) {
      console.error('Fehler beim Erstellen des Monatsberichts:', err);
      // Detailliertere Fehlerinformationen ausgeben
      if (err.code) {
        console.error('Fehlercode:', err.code);
      }
      if (err.details) {
        console.error('Fehlerdetails:', err.details);
      }
      if (err.hint) {
        console.error('Fehlerhinweis:', err.hint);
      }
      
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { 
        success: false, 
        error: err.message || 'Ein unbekannter Fehler ist aufgetreten'
      }
    } finally {
      setLoading(false)
    }
  }

  // Monatsbericht aktualisieren
  const updateMonthlyReport = async (id: string, updates: Partial<MonthlyReportUpdate>) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('monthly_reports')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Status aktualisieren
      setCurrentMonthlyReport(currentMonthlyReport?.id === id ? data as MonthlyReport : currentMonthlyReport)
      setMonthlyReports(prev => prev.map(report => report.id === id ? data as MonthlyReport : report))

      return { success: true, report: data }
    } catch (err: any) {
      console.error('Fehler beim Aktualisieren des Monatsberichts:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Monatsbericht schließen
  const closeMonthlyReport = async (reportId: string, notes?: string) => {
    try {
      setLoading(true)
      setError(null)

      // Monatsbericht aktualisieren
      const { data, error } = await supabase
        .from('monthly_reports')
        .update({
          status: 'closed',
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
      setCurrentMonthlyReport(data as MonthlyReport)
      setMonthlyReports(prev => prev.map(report => report.id === reportId ? data as MonthlyReport : report))

      return { success: true, report: data }
    } catch (err: any) {
      console.error('Fehler beim Schließen des Monatsberichts:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Alle Tagesberichte für einen Monat mit dem Monatsbericht verknüpfen
  const linkDailyReportsToMonthly = async (monthlyReportId: string, year: number, month: number) => {
    try {
      setLoading(true)
      setError(null)

      // Benutzer-ID abrufen für RLS
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) {
        return { success: false, error: 'Nicht angemeldet. Bitte melden Sie sich an.' }
      }

      // Erster Tag des Monats
      const startDate = new Date(year, month - 1, 1)
      // Erster Tag des nächsten Monats
      const endDate = new Date(year, month, 1)
      
      // Datum-Strings für die DB-Abfrage
      const startDateStr = startDate.toISOString().split('T')[0]
      const endDateStr = endDate.toISOString().split('T')[0]

      console.log(`Verknüpfe Tagesberichte von ${startDateStr} bis ${endDateStr} mit Monatsbericht ${monthlyReportId}`)

      const { data, error } = await supabase
        .from('daily_reports')
        .update({ monthly_report_id: monthlyReportId })
        .gte('date', startDateStr)
        .lt('date', endDateStr)
        .select()

      if (error) {
        throw error
      }

      return { success: true, linkedReports: data }
    } catch (err: any) {
      console.error('Fehler beim Verknüpfen der Tagesberichte:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Berechnung der Monatseinnahmen und Statistiken
  const calculateMonthlySummary = async (year: number, month: number) => {
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
            transactionCount: 0,
            servicesTotal: 0,
            productsTotal: 0,
            avgDailyRevenue: 0
          } as MonthlySummary
        }
      }

      // Erster Tag des Monats
      const startDate = new Date(year, month - 1, 1)
      // Erster Tag des nächsten Monats
      const endDate = new Date(year, month, 1)
      
      // Datum-Strings für die DB-Abfrage
      const startDateStr = startDate.toISOString().split('T')[0]
      const endDateStr = endDate.toISOString().split('T')[0]

      // Anzahl der Tage im Monat für Durchschnittsberechnung
      const daysInMonth = new Date(year, month, 0).getDate()

      // 1. Summen aus Tagesberichten abrufen
      const { data: dailyReports, error: dailyError } = await supabase
        .from('daily_reports')
        .select('cash_total, twint_total, sumup_total, status')
        .gte('date', startDateStr)
        .lt('date', endDateStr)
        .eq('status', 'closed') // Nur abgeschlossene Berichte

      if (dailyError) {
        console.error('Datenbankfehler beim Abrufen der Tagesberichte:', dailyError)
        throw dailyError
      }

      // Log für Debugging
      console.log("Gefundene Tagesberichte:", dailyReports?.length || 0, "Berichte");
      if (dailyReports && dailyReports.length > 0) {
        console.log("Beispiel Tagesbericht:", dailyReports[0]);
      } else {
        console.log("Keine Tagesberichte gefunden für den Zeitraum:", startDateStr, "bis", endDateStr);
      }

      // 2. Alle abgeschlossenen Transaktionen für den Monat abrufen
      const { data: transactions, error: transactionError } = await supabase
        .from('transactions')
        .select(`
          id, 
          total_amount, 
          payment_method, 
          status, 
          created_at,
          transaction_items (
            price,
            item:items (type)
          )
        `)
        .eq('status', 'completed')
        .gte('created_at', `${startDateStr}T00:00:00`)
        .lt('created_at', `${endDateStr}T23:59:59`)
        
      // Log für Debugging
      console.log("Gefundene Transaktionen:", transactions?.length || 0, "Transaktionen");
      if (transactions && transactions.length > 0) {
        console.log("Beispiel Transaktion:", transactions[0]);
      } else {
        console.log("Keine Transaktionen gefunden für den Zeitraum:", startDateStr, "bis", endDateStr);
      }

      if (transactionError) {
        console.error('Datenbankfehler beim Abrufen der Transaktionen:', transactionError)
        throw transactionError
      }

      // 3. Vormonatsumsatz für Vergleich abrufen
      const prevMonth = month === 1 ? 12 : month - 1
      const prevYear = month === 1 ? year - 1 : year
      
      const { data: prevMonthReport, error: prevMonthError } = await supabase
        .from('monthly_reports')
        .select('total_revenue')
        .eq('year', prevYear)
        .eq('month', prevMonth)
        .maybeSingle()

      if (prevMonthError && prevMonthError.code !== 'PGRST116') {
        console.error('Datenbankfehler beim Abrufen des Vormonatsberichts:', prevMonthError)
      }

      // Summen berechnen
      let cashTotal = 0
      let twintTotal = 0
      let sumupTotal = 0
      let servicesTotal = 0
      let productsTotal = 0

      // Summen aus Tagesberichten
      if (dailyReports && Array.isArray(dailyReports)) {
        dailyReports.forEach(report => {
          cashTotal += report.cash_total || 0
          twintTotal += report.twint_total || 0
          sumupTotal += report.sumup_total || 0
        })
      }

      // Dienstleistungen/Produkte aus Transaktionen berechnen
      if (transactions && Array.isArray(transactions)) {
        transactions.forEach(transaction => {
          if (transaction.transaction_items && Array.isArray(transaction.transaction_items)) {
            transaction.transaction_items.forEach(item => {
              if (item.item && item.item.type === 'service') {
                servicesTotal += item.price || 0
              } else if (item.item && item.item.type === 'product') {
                productsTotal += item.price || 0
              }
            })
          }
        })
      }

      // Alternative Berechnung direkt aus den Transaktionen
      // Wenn keine Tagesberichte existieren oder diese 0 sind, aber Transaktionen vorhanden sind,
      // summieren wir die Zahlungen direkt aus den Transaktionen
      if ((cashTotal === 0 && twintTotal === 0 && sumupTotal === 0) && transactions && transactions.length > 0) {
        console.log("Keine Daten aus Tagesberichten, versuche direkte Berechnung aus Transaktionen...");
        
        transactions.forEach(transaction => {
          if (transaction.payment_method === 'cash') {
            cashTotal += transaction.total_amount || 0;
          } else if (transaction.payment_method === 'twint') {
            twintTotal += transaction.total_amount || 0;
          } else if (transaction.payment_method === 'sumup') {
            sumupTotal += transaction.total_amount || 0;
          }
        });
        
        console.log("Direkt aus Transaktionen berechnet:", {
          cashTotal, twintTotal, sumupTotal
        });
      }

      // Berechne Gesamtumsatz aus allen Quellen
      // Wir nehmen hier den Höchstwert aus beiden Berechnungsmethoden
      const totalFromPayments = cashTotal + twintTotal + sumupTotal;
      const totalFromItems = servicesTotal + productsTotal;
      
      // Wenn beide Werte 0 sind, aber Transaktionen existieren, verwenden wir die Gesamtbeträge
      let totalRevenue = Math.max(totalFromPayments, totalFromItems);
      if (totalRevenue === 0 && transactions && transactions.length > 0) {
        totalRevenue = transactions.reduce((sum, t) => sum + (t.total_amount || 0), 0);
        console.log("Gesamtumsatz direkt aus Transaktionen berechnet:", totalRevenue);
      }
      
      const avgDailyRevenue = totalRevenue / daysInMonth;
      
      // Wenn die Summe der Items nicht zum Gesamtumsatz passt, protokollieren wir dies für Debugging
      if (Math.abs(totalFromPayments - totalFromItems) > 0.01) {
        console.warn("Diskrepanz zwischen Zahlungsarten und Items festgestellt:", {
          totalFromPayments,
          totalFromItems,
          difference: totalFromPayments - totalFromItems
        });
      }
      
      // Protokollieren für Debugging
      console.log("Berechnungsdetails:", {
        cashTotal,
        twintTotal,
        sumupTotal,
        servicesTotal,
        productsTotal,
        calculatedTotalFromPayments,
        calculatedTotalFromItems,
        totalRevenue
      })

      // Zusammenfassung erstellen
      const summary: MonthlySummary = {
        cashTotal,
        twintTotal,
        sumupTotal,
        totalRevenue,
        transactionCount: transactions?.length || 0,
        servicesTotal,
        productsTotal,
        avgDailyRevenue,
        previousMonthRevenue: prevMonthReport?.total_revenue
      }

      return { success: true, summary }
    } catch (err: any) {
      console.error('Fehler bei der Berechnung der Monatseinnahmen:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { 
        success: false, 
        error: err.message,
        summary: {
          cashTotal: 0,
          twintTotal: 0,
          sumupTotal: 0,
          totalRevenue: 0,
          transactionCount: 0,
          servicesTotal: 0,
          productsTotal: 0,
          avgDailyRevenue: 0
        } as MonthlySummary
      }
    } finally {
      setLoading(false)
    }
  }

  // Tagesumsätze für den Monat abrufen (für Diagramm)
  const getDailyRevenuesForMonth = async (year: number, month: number) => {
    try {
      setLoading(true)
      setError(null)

      // Benutzer-ID abrufen für RLS
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) {
        return { success: false, error: 'Nicht angemeldet. Bitte melden Sie sich an.', dailyRevenues: [] }
      }

      // Erster Tag des Monats
      const startDate = new Date(year, month - 1, 1)
      // Erster Tag des nächsten Monats
      const endDate = new Date(year, month, 1)
      
      // Datum-Strings für die DB-Abfrage
      const startDateStr = startDate.toISOString().split('T')[0]
      const endDateStr = endDate.toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('daily_reports')
        .select('date, cash_total, twint_total, sumup_total')
        .gte('date', startDateStr)
        .lt('date', endDateStr)
        .order('date', { ascending: true })

      if (error) {
        console.error('Datenbankfehler beim Abrufen der Tagesumsätze:', error)
        throw error
      }

      // Umsätze pro Tag formatieren
      const dailyRevenues: DailyRevenue[] = (data || []).map(report => {
        const day = new Date(report.date).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' })
        const total = (report.cash_total || 0) + (report.twint_total || 0) + (report.sumup_total || 0)
        return { day, total }
      })

      return { success: true, dailyRevenues }
    } catch (err: any) {
      console.error('Fehler beim Abrufen der Tagesumsätze:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message, dailyRevenues: [] }
    } finally {
      setLoading(false)
    }
  }

  // Top-Dienstleistungen/-Produkte für den Monat abrufen
  const getTopItemsForMonth = async (year: number, month: number, itemType: 'service' | 'product', limit: number = 5) => {
    try {
      setLoading(true)
      setError(null)

      // Benutzer-ID abrufen für RLS
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) {
        return { success: false, error: 'Nicht angemeldet. Bitte melden Sie sich an.', topItems: [] }
      }

      // Erster Tag des Monats
      const startDate = new Date(year, month - 1, 1)
      // Erster Tag des nächsten Monats
      const endDate = new Date(year, month, 1)
      
      // Datum-Strings für die DB-Abfrage
      const startDateStr = startDate.toISOString().split('T')[0]
      const endDateStr = endDate.toISOString().split('T')[0]

      // Alle Items mit Transaktionen für den Monat abrufen
      const { data, error } = await supabase
        .from('transaction_items')
        .select(`
          price,
          item:items (id, name, type),
          transaction:transactions (created_at)
        `)
        .gte('transaction.created_at', `${startDateStr}T00:00:00`)
        .lt('transaction.created_at', `${endDateStr}T23:59:59`)
        .eq('item.type', itemType)
        .order('price', { ascending: false })

      if (error) {
        console.error('Datenbankfehler beim Abrufen der Top-Items:', error)
        throw error
      }

      // Items gruppieren und aufsummieren
      const itemMap: Record<string, { name: string, count: number, total: number }> = {}
      
      if (data && Array.isArray(data)) {
        data.forEach(item => {
          if (item.item && item.price) {
            const id = item.item.id
            const name = item.item.name
            
            if (!itemMap[id]) {
              itemMap[id] = { name, count: 0, total: 0 }
            }
            
            itemMap[id].count += 1
            itemMap[id].total += item.price
          }
        })
      }

      // In Array umwandeln und nach Gesamtbetrag sortieren
      const topItems: TopItem[] = Object.values(itemMap)
        .sort((a, b) => b.total - a.total)
        .slice(0, limit)

      return { success: true, topItems }
    } catch (err: any) {
      console.error('Fehler beim Abrufen der Top-Items:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message, topItems: [] }
    } finally {
      setLoading(false)
    }
  }

  // Monatsabschluss durchführen
  const performMonthlyClose = async (year: number, month: number, notes?: string) => {
    try {
      setLoading(true)
      setError(null)

      console.log(`Starte Monatsabschluss für ${month}/${year}`);

      // Benutzer-ID abrufen für RLS
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) {
        console.error('Nicht authentifiziert beim Monatsabschluss');
        return { success: false, error: 'Nicht angemeldet. Bitte melden Sie sich an.' }
      }

      // 1. Monatszusammenfassung berechnen
      console.log("Berechne Monatszusammenfassung...");
      const summaryResult = await calculateMonthlySummary(year, month)
      if (!summaryResult.success) {
        console.error("Fehler bei der Berechnung der Monatszusammenfassung:", summaryResult.error);
        throw new Error(summaryResult.error || 'Fehler bei der Berechnung der Monatszusammenfassung')
      }

      const summary = summaryResult.summary
      console.log("Zusammenfassung berechnet:", {
        cashTotal: summary.cashTotal,
        twintTotal: summary.twintTotal,
        sumupTotal: summary.sumupTotal,
        totalRevenue: summary.totalRevenue
      });

      // 2. Prüfen, ob bereits ein Bericht existiert
      console.log("Prüfe auf existierenden Monatsbericht...");
      const reportResult = await getMonthlyReportByDate(year, month)
      console.log("Prüfungsergebnis:", reportResult);
      
      let monthlyReportId: string
      
      if (reportResult.success && reportResult.report) {
        console.log("Vorhandener Bericht gefunden, aktualisiere...");
        // Bestehenden Bericht aktualisieren
        const updateResult = await updateMonthlyReport(reportResult.report.id, {
          total_revenue: summary.totalRevenue,
          cash_total: summary.cashTotal,
          twint_total: summary.twintTotal,
          sumup_total: summary.sumupTotal,
          status: 'closed',
          notes: notes || null
        })
        
        if (!updateResult.success) {
          console.error("Fehler beim Aktualisieren des Monatsberichts:", updateResult.error);
          throw new Error(updateResult.error || 'Fehler beim Aktualisieren des Monatsberichts')
        }
        
        monthlyReportId = reportResult.report.id
        console.log("Bericht aktualisiert, ID:", monthlyReportId);
      } else {
        console.log("Erstelle neuen Monatsbericht...");
        // Neuen Bericht erstellen
        const createData = {
          year,
          month,
          total_revenue: summary.totalRevenue,
          cash_total: summary.cashTotal,
          twint_total: summary.twintTotal,
          sumup_total: summary.sumupTotal,
          status: 'closed',
          notes: notes || null,
          user_id: userData.user.id // Explizit User-ID setzen
        };
        console.log("Daten für neuen Bericht:", createData);
        
        const createResult = await createMonthlyReport(createData)
        console.log("Ergebnis der Berichtserstellung:", createResult);
        
        if (!createResult.success) {
          console.error("Fehler beim Erstellen des Monatsberichts:", createResult.error);
          throw new Error(createResult.error || 'Fehler beim Erstellen des Monatsberichts')
        }
        
        if (!createResult.report || !createResult.report.id) {
          console.error("Kein Bericht oder Bericht-ID in der Antwort");
          throw new Error('Keine Bericht-ID erhalten')
        }
        
        monthlyReportId = createResult.report.id
        console.log("Neuer Bericht erstellt, ID:", monthlyReportId);
      }

      // 3. Tagesberichte mit dem Monatsbericht verknüpfen
      console.log("Verknüpfe Tagesberichte mit Monatsbericht...");
      const linkResult = await linkDailyReportsToMonthly(monthlyReportId, year, month)
      if (!linkResult.success) {
        console.warn('Fehler beim Verknüpfen der Tagesberichte:', linkResult.error)
        // Wir werfen hier keine Exception, da der Hauptprozess erfolgreich war
      } else {
        console.log("Tagesberichte erfolgreich verknüpft:", linkResult.linkedReports?.length || 0, "Berichte");
      }

      console.log("Monatsabschluss erfolgreich abgeschlossen");
      return { 
        success: true, 
        report: { id: monthlyReportId, year, month, status: 'closed' },
        summary 
      }
    } catch (err: any) {
      console.error('Fehler beim Durchführen des Monatsabschlusses:', err);
      // Detailliertere Fehlerinformationen ausgeben
      if (err.code) {
        console.error('Fehlercode:', err.code);
      }
      if (err.details) {
        console.error('Fehlerdetails:', err.details);
      }
      if (err.hint) {
        console.error('Fehlerhinweis:', err.hint);
      }
      if (err.stack) {
        console.error('Stack Trace:', err.stack);
      }
      
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { 
        success: false, 
        error: err.message || 'Ein unbekannter Fehler ist aufgetreten. Bitte prüfen Sie die Konsole für mehr Details.'
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    monthlyReports,
    currentMonthlyReport,
    getMonthlyReportByDate,
    loadMonthlyReports,
    createMonthlyReport,
    updateMonthlyReport,
    closeMonthlyReport,
    calculateMonthlySummary,
    getDailyRevenuesForMonth,
    getTopItemsForMonth,
    performMonthlyClose
  }
}