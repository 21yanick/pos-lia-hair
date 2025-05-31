'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/shared/lib/supabase/client'
import { formatDateForAPI, getSwissDayRange } from '@/shared/utils/dateUtils'
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
      
      console.log('🔍 Loading dashboard stats for date:', today)
      console.log('🔍 Current Date Object:', new Date())
      console.log('🔍 Current UTC:', new Date().toISOString())

      // Heutige Verkäufe mit korrekter Schweizer Zeitzone abrufen
      const { start, end } = getSwissDayRange(new Date())
      console.log('🔍 Dashboard UTC Range:', { start, end })
      
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
      
      console.log('🔍 Dashboard Sales gefunden:', sales?.length || 0)
      if (sales && sales.length > 0) {
        console.log('🔍 Erste Sale created_at:', sales[0].created_at)
        console.log('🔍 Letzte Sale created_at:', sales[sales.length - 1].created_at)
      }

      // Aktive Produkte zählen
      const { data: items } = await supabase
        .from('items')
        .select('id')
        .eq('active', true)

      const activeProductsCount = items?.length || 0

      // Wochenumsatz und Monatsumsatz IMMER berechnen (unabhängig von heutigen Verkäufen)
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - 7)
      const { data: weekSales } = await supabase
        .from('sales')
        .select('total_amount')
        .eq('status', 'completed')
        .gte('created_at', weekStart.toISOString())

      const weekRevenue = weekSales?.reduce((sum, s) => sum + s.total_amount, 0) || 0
      console.log('📅 Week revenue:', weekRevenue, 'from', weekSales?.length || 0, 'sales since', weekStart.toISOString())

      const monthStart = new Date()
      monthStart.setDate(monthStart.getDate() - 30)
      const { data: monthSales } = await supabase
        .from('sales')
        .select('total_amount')
        .eq('status', 'completed')
        .gte('created_at', monthStart.toISOString())

      const monthRevenue = monthSales?.reduce((sum, s) => sum + s.total_amount, 0) || 0
      console.log('📅 Month revenue:', monthRevenue, 'from', monthSales?.length || 0, 'sales since', monthStart.toISOString())

      if (!sales || sales.length === 0) {
        console.log('ℹ️ No sales found for today, but showing week/month data')
        
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
      console.log('✅ Completed sales found:', completedSales.length)
      
      if (completedSales.length === 0) {
        console.log('ℹ️ No completed sales found for today')
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
      
      // Gesamtumsatz heute berechnen
      const todayRevenue = completedSales.reduce((sum, s) => sum + s.total_amount, 0)
      console.log('💰 Today revenue calculated:', todayRevenue)

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
        const startDate = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0]
        const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0]
        
        // Sales für den Monat
        const { data: sales } = await supabase
          .from('sales')
          .select('total_amount')
          .eq('status', 'completed')
          .gte('created_at', startDate + 'T00:00:00')
          .lte('created_at', endDate + 'T23:59:59')
        
        // Expenses für den Monat
        const { data: expenses } = await supabase
          .from('expenses')
          .select('amount')
          .gte('payment_date', startDate)
          .lte('payment_date', endDate)
        
        const revenue = sales?.reduce((sum, s) => sum + s.total_amount, 0) || 0
        const expenseTotal = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0
        const profit = revenue - expenseTotal
        
        months.push({
          month: startDate,
          revenue,
          expenses: expenseTotal,
          profit,
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
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
      
      // Sales
      const { data: sales } = await supabase
        .from('sales')
        .select('total_amount')
        .eq('status', 'completed')
        .gte('created_at', startDate + 'T00:00:00')
        .lte('created_at', endDate + 'T23:59:59')
      
      // Expenses
      const { data: expenses } = await supabase
        .from('expenses')
        .select('amount')
        .gte('payment_date', startDate)
        .lte('payment_date', endDate)
      
      const revenue = sales?.reduce((sum, s) => sum + s.total_amount, 0) || 0
      const expenseTotal = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0
      
      return {
        revenue,
        expenses: expenseTotal,
        profit: revenue - expenseTotal
      }
    } catch (error) {
      console.error('Fehler beim Laden der Monatsdaten:', error)
      return { revenue: 0, expenses: 0, profit: 0 }
    }
  }

  // Letzte 30 Tage Trend
  const getLast30DaysTrend = async () => {
    try {
      const now = new Date()
      const last30Start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const prev30Start = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const prev30End = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      // Letzte 30 Tage
      const { data: recentSales } = await supabase
        .from('sales')
        .select('total_amount')
        .eq('status', 'completed')
        .gte('created_at', last30Start + 'T00:00:00')
      
      // Vorherige 30 Tage
      const { data: prevSales } = await supabase
        .from('sales')
        .select('total_amount')
        .eq('status', 'completed')
        .gte('created_at', prev30Start + 'T00:00:00')
        .lte('created_at', prev30End + 'T23:59:59')
      
      const recentRevenue = recentSales?.reduce((sum, s) => sum + s.total_amount, 0) || 0
      const prevRevenue = prevSales?.reduce((sum, s) => sum + s.total_amount, 0) || 0
      
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
      const yearStart = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]
      
      // Sales
      const { data: sales } = await supabase
        .from('sales')
        .select('total_amount')
        .eq('status', 'completed')
        .gte('created_at', yearStart + 'T00:00:00')
      
      // Expenses
      const { data: expenses } = await supabase
        .from('expenses')
        .select('amount')
        .gte('payment_date', yearStart)
      
      const revenue = sales?.reduce((sum, s) => sum + s.total_amount, 0) || 0
      const expenseTotal = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0
      
      return {
        revenue,
        expenses: expenseTotal,
        profit: revenue - expenseTotal
      }
    } catch (error) {
      console.error('Fehler beim Laden der Jahresdaten:', error)
      return { revenue: 0, expenses: 0, profit: 0 }
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