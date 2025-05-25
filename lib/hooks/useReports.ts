'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { formatDateForAPI, getSwissDayRange } from '@/lib/utils/dateUtils'
import { useDailySummaries } from './useDailySummaries'

// Type für die vereinfachten Transaktionsdaten im Dashboard
export type DashboardTransaction = {
  id: string
  time: string
  amount: number
  method: 'cash' | 'twint' | 'sumup'
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
  })
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [dashboardError, setDashboardError] = useState<string | null>(null)

  // Daily summaries Hook für erweiterte Funktionalitäten
  const dailySummariesHook = useDailySummaries()

  // Datum für heute formatieren (YYYY-MM-DD) in Schweizer Zeitzone
  const today = formatDateForAPI(new Date())

  // Dashboard-Statistiken laden (migriert von useDashboardStats)
  const loadDashboardStats = async () => {
    try {
      setDashboardLoading(true)
      setDashboardError(null)
      
      console.log('🔍 Loading dashboard stats for date:', today)

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
      
      console.log('📊 Sales data loaded:', sales?.length || 0, 'sales found')

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
        
        setDashboardStats({
          todayRevenue: 0,
          todayTransactions: 0,
          weekRevenue,
          monthRevenue,
          activeProducts: activeProductsCount,
          paymentMethods: { cash: 0, twint: 0, sumup: 0 },
          recentTransactions,
        })
        return
      }

      // Nur abgeschlossene Verkäufe für die Berechnungen verwenden
      const completedSales = sales.filter(s => s.status === 'completed')
      console.log('✅ Completed sales found:', completedSales.length)
      
      if (completedSales.length === 0) {
        console.log('ℹ️ No completed sales found for today')
        setDashboardStats({
          todayRevenue: 0,
          todayTransactions: 0,
          weekRevenue: 0,
          monthRevenue: 0,
          activeProducts: activeProductsCount,
          paymentMethods: { cash: 0, twint: 0, sumup: 0 },
          recentTransactions: [],
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
      })
      setDashboardError(err?.message || 'Fehler beim Laden der Daten')
    } finally {
      setDashboardLoading(false)
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