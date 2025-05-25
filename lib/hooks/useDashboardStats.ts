'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { format } from 'date-fns'

// Type für die vollständigen Verkaufsdaten
type Sale = {
  id: string
  total_amount: number
  payment_method: 'cash' | 'twint' | 'sumup'
  status: 'completed' | 'cancelled' | 'refunded'
  created_at: string | null
  notes: string | null
  user_id: string
}

// Type für die vereinfachten Transaktionsdaten im Dashboard
export type DashboardTransaction = {
  id: string
  time: string
  amount: number
  method: 'cash' | 'twint' | 'sumup'
}

// Type für die Statistiken
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

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Datum für heute formatieren (YYYY-MM-DD)
  const today = format(new Date(), 'yyyy-MM-dd')

  // Funktion zum Laden der Verkaufsdaten
  const loadTodayStats = async () => {
    try {
      setLoading(true)
      setError(null)

      // Heutige Verkäufe abrufen
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)
        .order('created_at', { ascending: false })
        .limit(20)
      
      if (salesError) {
        console.error('Fehler beim Laden der Verkäufe:', 
          salesError.message || 'Unbekannter Datenbankfehler')
        setError(salesError.message || 'Fehler beim Laden der Verkäufe')
        return
      }

      // Aktive Produkte zählen
      const { data: items, error: itemsError } = await supabase
        .from('items')
        .select('id')
        .eq('active', true)

      const activeProductsCount = items?.length || 0

      if (!sales || sales.length === 0) {
        // Keine Verkäufe für heute
        setStats({
          todayRevenue: 0,
          todayTransactions: 0,
          weekRevenue: 0,
          monthRevenue: 0,
          activeProducts: activeProductsCount,
          paymentMethods: {
            cash: 0,
            twint: 0,
            sumup: 0,
          },
          recentTransactions: [],
        })
        return
      }

      // Nur abgeschlossene Verkäufe für die Berechnungen verwenden
      const completedSales = sales.filter(
        (s: Sale) => s.status === 'completed'
      )
      
      // Wenn keine abgeschlossenen Verkäufe vorhanden sind
      if (completedSales.length === 0) {
        setStats({
          todayRevenue: 0,
          todayTransactions: 0,
          weekRevenue: 0,
          monthRevenue: 0,
          activeProducts: activeProductsCount,
          paymentMethods: {
            cash: 0,
            twint: 0,
            sumup: 0,
          },
          recentTransactions: [],
        })
        return
      }
      
      // Gesamtumsatz heute berechnen
      const todayRevenue = completedSales.reduce(
        (sum: number, s: Sale) => sum + s.total_amount,
        0
      )

      // Nach Zahlungsmethode aufteilen
      const cashTotal = completedSales
        .filter((s: Sale) => s.payment_method === 'cash')
        .reduce((sum: number, s: Sale) => sum + s.total_amount, 0)

      const twintTotal = completedSales
        .filter((s: Sale) => s.payment_method === 'twint')
        .reduce((sum: number, s: Sale) => sum + s.total_amount, 0)

      const sumupTotal = completedSales
        .filter((s: Sale) => s.payment_method === 'sumup')
        .reduce((sum: number, s: Sale) => sum + s.total_amount, 0)

      // Neueste 5 Verkäufe für die Anzeige formatieren
      const recentTransactions: DashboardTransaction[] = completedSales
        .slice(0, 5)
        .map((s: Sale) => ({
          id: s.id,
          time: s.created_at ? new Date(s.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }) : '00:00',
          amount: s.total_amount,
          method: s.payment_method,
        }))

      // Wochenumsatz (vereinfacht - letzten 7 Tage)
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - 7)
      const { data: weekSales } = await supabase
        .from('sales')
        .select('total_amount')
        .eq('status', 'completed')
        .gte('created_at', weekStart.toISOString())

      const weekRevenue = weekSales?.reduce((sum, s) => sum + s.total_amount, 0) || 0

      // Monatsumsatz (vereinfacht - letzten 30 Tage)
      const monthStart = new Date()
      monthStart.setDate(monthStart.getDate() - 30)
      const { data: monthSales } = await supabase
        .from('sales')
        .select('total_amount')
        .eq('status', 'completed')
        .gte('created_at', monthStart.toISOString())

      const monthRevenue = monthSales?.reduce((sum, s) => sum + s.total_amount, 0) || 0

      // Dashboard-Statistiken setzen
      setStats({
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
      console.error('Fehler beim Laden der Dashboard-Statistik:', 
        err?.message || 'Unbekannter Fehler')
      
      // Leere Statistiken setzen im Fehlerfall
      setStats({
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
      
      setError(err?.message || 'Fehler beim Laden der Daten')
    } finally {
      setLoading(false)
    }
  }

  // Statistiken beim ersten Laden abrufen
  useEffect(() => {
    loadTodayStats()
  }, [])

  // Funktion zum manuellen Neuladen der Statistiken
  const refreshStats = () => loadTodayStats()

  return {
    stats,
    loading,
    error,
    refreshStats,
  }
}