'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/shared/lib/supabase/client'
import { formatDateForAPI, getSwissDayRange, getFirstDayOfMonth, getLastDayOfMonth } from '@/shared/utils/dateUtils'
import { useDailySummaries } from '@/shared/hooks/business/useDailySummaries'
import { useExpenses } from './useExpenses'

// Type für die vereinfachten Transaktionsdaten im Dashboard
export type DashboardTransaction = {
  id: string
  time: string
  amount: number
  method: 'cash' | 'twint' | 'sumup'
}

// Typen für das neue Dashboard
export type ActivityItem = {
  id: string
  date: string
  type: 'sale' | 'expense'
  description: string
  amount: number
  paymentMethod: 'cash' | 'twint' | 'sumup' | 'bank'
  category?: string
  time?: string
}

export type MonthlyData = {
  month: string
  revenue: number
  expenses: number
  profit: number
  monthName: string
}

export type DashboardStatsData = {
  cashBalance: number
  thisMonth: {
    revenue: number
    expenses: number
    profit: number
  }
  last30Days: {
    revenue: number
    trend: 'up' | 'down' | 'stable'
    percentage: number
  }
  yearTotal: {
    revenue: number
    expenses: number
    profit: number
  }
}

// Type für die Statistiken (erweitert von useDashboardStats)
export type DashboardStats = {
  todayRevenue: number
  todayTransactions: number
  weekRevenue: number
  monthRevenue: number
  activeProducts: number
  paymentMethods: {
    cash: number
    twint: number
    sumup: number
  }
  recentTransactions: DashboardTransaction[]
  // Neue Dashboard-Daten
  dashboardStatsData: DashboardStatsData
  monthlyTrendData: MonthlyData[]
  recentActivities: ActivityItem[]
}

// Kombinierter Hook für alle Report-Funktionalitäten
export function useReports() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    todayRevenue: 0,
    todayTransactions: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    activeProducts: 0,
    paymentMethods: {
      cash: 0,
      twint: 0,
      sumup: 0,
    },
    recentTransactions: [],
    dashboardStatsData: {
      cashBalance: 0,
      thisMonth: { revenue: 0, expenses: 0, profit: 0 },
      last30Days: { revenue: 0, trend: 'stable', percentage: 0 },
      yearTotal: { revenue: 0, expenses: 0, profit: 0 }
    },
    monthlyTrendData: [],
    recentActivities: []
  })
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [dashboardError, setDashboardError] = useState<string | null>(null)

  // Hooks für erweiterte Funktionalitäten
  const dailySummariesHook = useDailySummaries()
  const expensesHook = useExpenses()

  // WICHTIG: Verwende das gleiche Datum wie alle anderen Systeme
  // Das ist der aktuelle Tag in Schweizer Zeit (YYYY-MM-DD)
  const today = formatDateForAPI(new Date())

  // Dashboard-Statistiken laden (migriert von useDashboardStats)
  const loadDashboardStats = async () => {
    try {
      setDashboardLoading(true)
      setDashboardError(null)
      

      // Heutige Verkäufe mit korrekter Schweizer Zeitzone abrufen
      const { start, end } = getSwissDayRange(new Date())
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .gte('created_at', start)
        .lte('created_at', end)
        .order('created_at', { ascending: false })
        .limit(20)
      
      if (salesError) {
        console.error('❌ Fehler beim Laden der Verkäufe:', salesError.message)
        setDashboardError(salesError.message || 'Fehler beim Laden der Verkäufe')
        return
      }
      

      // Aktive Produkte zählen
      const { data: items } = await supabase
        .from('items')
        .select('id')
        .eq('active', true)

      const activeProductsCount = items?.length || 0

      // Wochenumsatz und Monatsumsatz IMMER berechnen (unabhängig von heutigen Verkäufen)
      // Verwende getRevenueBreakdown() für korrekte Netto-Berechnung nach Abzug Provider-Gebühren
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - 7)
      const { data: weekSales } = await supabase
        .from('sales')
        .select('id, total_amount, payment_method')
        .eq('status', 'completed')
        .gte('created_at', weekStart.toISOString())

      const { netRevenue: weekRevenue } = await getRevenueBreakdown(weekSales || [])

      const monthStart = new Date()
      monthStart.setDate(monthStart.getDate() - 30)
      const { data: monthSales } = await supabase
        .from('sales')
        .select('id, total_amount, payment_method')
        .eq('status', 'completed')
        .gte('created_at', monthStart.toISOString())

      const { netRevenue: monthRevenue } = await getRevenueBreakdown(monthSales || [])

      if (!sales || sales.length === 0) {
        
        // Fallback: Zeige die letzten 5 Transaktionen aus der Woche
        const { data: recentSales } = await supabase
          .from('sales')
          .select('*')
          .eq('status', 'completed')
          .gte('created_at', weekStart.toISOString())
          .order('created_at', { ascending: false })
          .limit(5)
        
        const recentTransactions: DashboardTransaction[] = recentSales?.slice(0, 5).map(s => ({
          id: s.id,
          time: s.created_at ? new Date(s.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }) : '00:00',
          amount: s.total_amount,
          method: s.payment_method,
        })) || []
        
        // Erweiterte Dashboard-Daten laden auch bei leeren heutigen Sales
        const enhancedDashboardData = await loadEnhancedDashboardData()

        setDashboardStats({
          todayRevenue: 0,
          todayTransactions: 0,
          weekRevenue,
          monthRevenue,
          activeProducts: activeProductsCount,
          paymentMethods: { cash: 0, twint: 0, sumup: 0 },
          recentTransactions,
          dashboardStatsData: enhancedDashboardData.statsData,
          monthlyTrendData: enhancedDashboardData.trendData,
          recentActivities: enhancedDashboardData.activities
        })
        return
      }

      // Nur abgeschlossene Verkäufe für die Berechnungen verwenden
      const completedSales = sales.filter(s => s.status === 'completed')
      if (completedSales.length === 0) {
        // Erweiterte Dashboard-Daten laden auch bei no completed sales
        const enhancedDashboardData = await loadEnhancedDashboardData()

        setDashboardStats({
          todayRevenue: 0,
          todayTransactions: 0,
          weekRevenue: 0,
          monthRevenue: 0,
          activeProducts: activeProductsCount,
          paymentMethods: { cash: 0, twint: 0, sumup: 0 },
          recentTransactions: [],
          dashboardStatsData: enhancedDashboardData.statsData,
          monthlyTrendData: enhancedDashboardData.trendData,
          recentActivities: enhancedDashboardData.activities
        })
        return
      }
      
      // Gesamtumsatz heute berechnen (KORRIGIERT: Brutto-Umsatz als Hauptzahl)
      const { grossRevenue: todayRevenue, totalProviderFees: todayFees } = await getRevenueBreakdown(completedSales)

      // Nach Zahlungsmethode aufteilen
      const cashTotal = completedSales
        .filter(s => s.payment_method === 'cash')
        .reduce((sum, s) => sum + s.total_amount, 0)

      const twintTotal = completedSales
        .filter(s => s.payment_method === 'twint')
        .reduce((sum, s) => sum + s.total_amount, 0)

      const sumupTotal = completedSales
        .filter(s => s.payment_method === 'sumup')
        .reduce((sum, s) => sum + s.total_amount, 0)

      // Neueste 5 Verkäufe für die Anzeige formatieren
      const recentTransactions: DashboardTransaction[] = completedSales
        .slice(0, 5)
        .map(s => ({
          id: s.id,
          time: s.created_at ? new Date(s.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }) : '00:00',
          amount: s.total_amount,
          method: s.payment_method,
        }))

      // Week/Month revenue wurde bereits oben berechnet

      // Erweiterte Dashboard-Daten laden
      const enhancedDashboardData = await loadEnhancedDashboardData()

      // Dashboard-Statistiken setzen
      setDashboardStats({
        todayRevenue,
        todayTransactions: completedSales.length,
        weekRevenue,
        monthRevenue,
        activeProducts: activeProductsCount,
        paymentMethods: {
          cash: cashTotal,
          twint: twintTotal,
          sumup: sumupTotal,
        },
        recentTransactions,
        dashboardStatsData: enhancedDashboardData.statsData,
        monthlyTrendData: enhancedDashboardData.trendData,
        recentActivities: enhancedDashboardData.activities
      })
    } catch (err: any) {
      console.error('Fehler beim Laden der Dashboard-Statistik:', err?.message)
      setDashboardStats({
        todayRevenue: 0,
        todayTransactions: 0,
        weekRevenue: 0,
        monthRevenue: 0,
        activeProducts: 0,
        paymentMethods: { cash: 0, twint: 0, sumup: 0 },
        recentTransactions: [],
        dashboardStatsData: {
          cashBalance: 0,
          thisMonth: { revenue: 0, expenses: 0, profit: 0 },
          last30Days: { revenue: 0, trend: 'stable', percentage: 0 },
          yearTotal: { revenue: 0, expenses: 0, profit: 0 }
        },
        monthlyTrendData: [],
        recentActivities: []
      })
      setDashboardError(err?.message || 'Fehler beim Laden der Daten')
    } finally {
      setDashboardLoading(false)
    }
  }

  // Berechnet Revenue-Kennzahlen (Brutto, Netto, Fees) für eine Liste von Sales
  // REPARIERT: Verwendet zuverlässige Standard-Fees statt fehlerhafter provider_reports
  const getRevenueBreakdown = async (sales: any[]) => {
    if (!sales || sales.length === 0) {
      return { netRevenue: 0, totalProviderFees: 0, grossRevenue: 0 }
    }

    // Standard Provider-Gebührensätze (zuverlässig für Development & Dashboard)
    const STANDARD_FEES = {
      cash: 0,       // Keine Gebühren bei Bargeld
      twint: 0.013,  // 1.3% (offizieller Twint-Satz)
      sumup: 0.015   // 1.5% (offizieller SumUp-Satz)
    }

    let netRevenue = 0
    let totalProviderFees = 0
    let grossRevenue = 0
    
    for (const sale of sales) {
      grossRevenue += sale.total_amount
      
      // Berechne Provider-Fees basierend auf Payment-Method
      const feeRate = STANDARD_FEES[sale.payment_method as keyof typeof STANDARD_FEES] || 0
      const estimatedFees = sale.total_amount * feeRate
      
      netRevenue += sale.total_amount - estimatedFees
      totalProviderFees += estimatedFees
      
    }
    
    return { netRevenue, totalProviderFees, grossRevenue }
  }

  // Erweiterte Dashboard-Daten laden
  const loadEnhancedDashboardData = async () => {
    try {
      // 1. Cash Balance abrufen
      const { success: cashSuccess, balance: cashBalance } = await dailySummariesHook.getCurrentCashBalance()
      
      // 2. Monatsdaten für die letzten 12 Monate abrufen
      const monthlyTrendData = await loadMonthlyTrendData()
      
      // 3. Dieser Monat Daten
      const thisMonth = await getThisMonthData()
      
      // 4. Letzte 30 Tage Trend
      const last30Days = await getLast30DaysTrend()
      
      // 5. Jahres-Total
      const yearTotal = await getYearTotalData()
      
      // 6. Recent Activities (Sales + Expenses)
      const recentActivities = await getRecentActivities()
      
      return {
        statsData: {
          cashBalance: cashSuccess ? cashBalance : 0,
          thisMonth,
          last30Days,
          yearTotal
        },
        trendData: monthlyTrendData,
        activities: recentActivities
      }
    } catch (error) {
      console.error('Fehler beim Laden der erweiterten Dashboard-Daten:', error)
      return {
        statsData: {
          cashBalance: 0,
          thisMonth: { revenue: 0, expenses: 0, profit: 0 },
          last30Days: { revenue: 0, trend: 'stable' as const, percentage: 0 },
          yearTotal: { revenue: 0, expenses: 0, profit: 0 }
        },
        trendData: [],
        activities: []
      }
    }
  }

  // Monatsdaten für Chart
  const loadMonthlyTrendData = async (): Promise<MonthlyData[]> => {
    try {
      const months = []
      const now = new Date()
      
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        // KORRIGIERT: Swiss-aware month boundaries
        const firstDay = getFirstDayOfMonth(date)
        const lastDay = getLastDayOfMonth(date)
        const startDate = formatDateForAPI(firstDay)
        const endDate = formatDateForAPI(lastDay)
        
        // Sales für den Monat (mit payment_method für Provider-Gebühren)
        const { data: sales } = await supabase
          .from('sales')
          .select('id, total_amount, payment_method')
          .eq('status', 'completed')
          .gte('created_at', startDate + 'T00:00:00')
          .lte('created_at', endDate + 'T23:59:59')
        
        // Expenses für den Monat
        const { data: expenses } = await supabase
          .from('expenses')
          .select('amount')
          .gte('payment_date', startDate)
          .lte('payment_date', endDate)
        
        // Revenue-Breakdown berechnen (Brutto, Netto, Fees)
        const { grossRevenue, netRevenue, totalProviderFees } = await getRevenueBreakdown(sales || [])
        const expenseTotal = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0
        const profit = netRevenue - expenseTotal
        
        months.push({
          month: startDate,
          revenue: grossRevenue,  // Chart zeigt Brutto-Umsätze
          expenses: expenseTotal,
          profit,  // Profit bleibt Netto minus Expenses
          monthName: date.toLocaleDateString('de-CH', { month: 'short' })
        })
      }
      
      return months
    } catch (error) {
      console.error('Fehler beim Laden der Monatsdaten:', error)
      return []
    }
  }

  // Dieser Monat Daten
  const getThisMonthData = async () => {
    try {
      const now = new Date()
      // KORRIGIERT: Verwende Swiss-aware date utilities statt naive JavaScript Date
      const firstDay = getFirstDayOfMonth(now)
      const lastDay = getLastDayOfMonth(now)
      const startDate = formatDateForAPI(firstDay)
      const endDate = formatDateForAPI(lastDay)
      
      
      // Sales (mit payment_method für Provider-Gebühren)
      const { data: sales } = await supabase
        .from('sales')
        .select('id, total_amount, payment_method')
        .eq('status', 'completed')
        .gte('created_at', startDate + 'T00:00:00')
        .lte('created_at', endDate + 'T23:59:59')
      
      
      // Expenses
      const { data: expenses } = await supabase
        .from('expenses')
        .select('amount')
        .gte('payment_date', startDate)
        .lte('payment_date', endDate)
      
      
      // Revenue-Breakdown berechnen (Brutto, Netto, Fees)
      const { netRevenue, totalProviderFees, grossRevenue } = await getRevenueBreakdown(sales || [])
      const expenseTotal = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0
      
      
      const result = {
        revenue: grossRevenue,  // Dashboard zeigt Brutto-Umsatz als Hauptzahl
        expenses: expenseTotal,
        profit: netRevenue - expenseTotal,  // Gewinn = Netto-Revenue minus Expenses
        grossRevenue,
        providerFees: totalProviderFees
      }
      
      return result
    } catch (error) {
      console.error('Fehler beim Laden der Monatsdaten:', error)
      return { revenue: 0, expenses: 0, profit: 0, grossRevenue: 0, providerFees: 0 }
    }
  }

  // Letzte 30 Tage Trend
  const getLast30DaysTrend = async () => {
    try {
      const now = new Date()
      const last30Start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const prev30Start = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const prev30End = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      // Letzte 30 Tage (mit payment_method für Provider-Gebühren)
      const { data: recentSales } = await supabase
        .from('sales')
        .select('id, total_amount, payment_method')
        .eq('status', 'completed')
        .gte('created_at', last30Start + 'T00:00:00')
      
      // Vorherige 30 Tage (mit payment_method für Provider-Gebühren)
      const { data: prevSales } = await supabase
        .from('sales')
        .select('id, total_amount, payment_method')
        .eq('status', 'completed')
        .gte('created_at', prev30Start + 'T00:00:00')
        .lte('created_at', prev30End + 'T23:59:59')
      
      // Brutto-Umsätze berechnen (für 30-Tage Trend)
      const { grossRevenue: recentRevenue } = await getRevenueBreakdown(recentSales || [])
      const { grossRevenue: prevRevenue } = await getRevenueBreakdown(prevSales || [])
      
      let trend: 'up' | 'down' | 'stable' = 'stable'
      let percentage = 0
      
      if (prevRevenue > 0) {
        percentage = ((recentRevenue - prevRevenue) / prevRevenue) * 100
        if (percentage > 5) trend = 'up'
        else if (percentage < -5) trend = 'down'
      }
      
      return {
        revenue: recentRevenue,
        trend,
        percentage: Math.abs(percentage)
      }
    } catch (error) {
      console.error('Fehler beim Laden des 30-Tage Trends:', error)
      return { revenue: 0, trend: 'stable' as const, percentage: 0 }
    }
  }

  // Jahres-Total
  const getYearTotalData = async () => {
    try {
      const now = new Date()
      // KORRIGIERT: Swiss-aware year start
      const yearStartDate = new Date(now.getFullYear(), 0, 1) // 1. Januar
      const yearStart = formatDateForAPI(yearStartDate)
      
      // Sales (mit payment_method für Provider-Gebühren)
      const { data: sales } = await supabase
        .from('sales')
        .select('id, total_amount, payment_method')
        .eq('status', 'completed')
        .gte('created_at', yearStart + 'T00:00:00')
      
      // Expenses
      const { data: expenses } = await supabase
        .from('expenses')
        .select('amount')
        .gte('payment_date', yearStart)
      
      // Revenue-Breakdown berechnen (Brutto, Netto, Fees)
      const { netRevenue, totalProviderFees, grossRevenue } = await getRevenueBreakdown(sales || [])
      const expenseTotal = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0
      
      return {
        revenue: grossRevenue,  // Dashboard zeigt Brutto-Umsatz als Hauptzahl
        expenses: expenseTotal,
        profit: netRevenue - expenseTotal,  // Gewinn = Netto-Revenue minus Expenses
        grossRevenue,
        providerFees: totalProviderFees
      }
    } catch (error) {
      console.error('Fehler beim Laden der Jahresdaten:', error)
      return { revenue: 0, expenses: 0, profit: 0, grossRevenue: 0, providerFees: 0 }
    }
  }

  // Recent Activities
  const getRecentActivities = async (): Promise<ActivityItem[]> => {
    try {
      const activities: ActivityItem[] = []
      
      // Letzte 10 Sales
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(10)

      if (salesError) {
        console.error('Error loading sales for activities:', salesError)
      }
      
      // Letzte 10 Expenses
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (expensesError) {
        console.error('Error loading expenses for activities:', expensesError)
      }
      
      // Sales zu Activities konvertieren
      sales?.forEach(sale => {
        activities.push({
          id: sale.id,
          date: sale.created_at?.split('T')[0] || '',
          time: sale.created_at ? new Date(sale.created_at).toLocaleTimeString('de-CH', {
            hour: '2-digit',
            minute: '2-digit'
          }) : '',
          type: 'sale',
          description: 'Verkauf',
          amount: sale.total_amount,
          paymentMethod: sale.payment_method,
        })
      })
      
      // Expenses zu Activities konvertieren
      expenses?.forEach(expense => {
        activities.push({
          id: expense.id,
          date: expense.payment_date,
          type: 'expense',
          description: expense.description || 'Ausgabe',
          amount: expense.amount,
          paymentMethod: expense.payment_method,
          category: expense.category
        })
      })
      
      // Nach Datum sortieren (neueste zuerst)
      const sortedActivities = activities
        .sort((a, b) => {
          try {
            // Sichere Date-Konstruktion mit Fallbacks
            let dateStringA = a.date || '1970-01-01'
            let dateStringB = b.date || '1970-01-01'
            
            // Für Sales: time ist bereits im Format "HH:MM"
            if (a.time && !a.time.includes('T')) {
              dateStringA += 'T' + a.time + ':00'
            } else if (a.time) {
              dateStringA += a.time
            } else {
              dateStringA += 'T12:00:00'
            }
            
            if (b.time && !b.time.includes('T')) {
              dateStringB += 'T' + b.time + ':00'
            } else if (b.time) {
              dateStringB += b.time
            } else {
              dateStringB += 'T12:00:00'
            }
            
            const dateA = new Date(dateStringA)
            const dateB = new Date(dateStringB)
            
            // Prüfe auf ungültige Dates
            if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
              return 0
            }
            
            return dateB.getTime() - dateA.getTime()
          } catch (error) {
            console.error('Date sorting error:', error)
            return 0
          }
        })
        .slice(0, 10)
      
      return sortedActivities
        
    } catch (error) {
      console.error('Fehler beim Laden der Recent Activities:', error)
      return []
    }
  }

  // Statistiken beim ersten Laden abrufen
  useEffect(() => {
    loadDashboardStats()
  }, [])

  // Daily summaries destructuring ohne Konflikte
  const { loading: dailyLoading, error: dailyError, ...dailyFunctions } = dailySummariesHook

  // Öffentliche API: Dashboard-Funktionen + Daily Summaries
  return {
    // Dashboard-spezifische Daten
    dashboardStats,
    loading: dashboardLoading,
    error: dashboardError,
    refreshDashboard: loadDashboardStats,
    
    // Daily Summaries Funktionen (delegiert, ohne Konflikte)
    ...dailyFunctions,
    dailyLoading,
    dailyError,
  }
}