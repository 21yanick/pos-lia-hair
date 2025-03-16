'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { format } from 'date-fns'

// Type für die vollständigen Transaktionsdaten
type Transaction = {
  id: string
  total_amount: number
  payment_method: 'cash' | 'twint' | 'sumup'
  status: 'completed' | 'cancelled' | 'refunded'
  created_at: string
  notes: string | null
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
  revenue: number
  transactions: number
  paymentMethods: {
    cash: number
    twint: number
    sumup: number
  }
  recentTransactions: DashboardTransaction[]
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    revenue: 0,
    transactions: 0,
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

  // Funktion zum Laden der Transaktionsdaten
  const loadTodayStats = async () => {
    try {
      setLoading(true)
      setError(null)

      // Heutige Transaktionen abrufen
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20) // Begrenzen wir auf 20 Transaktionen für bessere Performance
      
      // Logge nur, falls ein Fehler vorliegt (mit konkreter Fehlermeldung)
      if (transactionsError) {
        console.error('Fehler beim Laden der Transaktionen:', 
          transactionsError.message || 'Unbekannter Datenbankfehler')
        setError(transactionsError.message || 'Fehler beim Laden der Transaktionen')
        return
      }

      if (!transactions || transactions.length === 0) {
        // Keine Transaktionen für heute, leere Statistiken zurückgeben
        setStats({
          revenue: 0,
          transactions: 0,
          paymentMethods: {
            cash: 0,
            twint: 0,
            sumup: 0,
          },
          recentTransactions: [],
        })
        return
      }

      // Filter für heutige Transaktionen mit Status "completed"
      const todayISO = today + 'T00:00:00';  // Beginnt um 00:00 Uhr
      const tomorrowISO = format(new Date(new Date().setDate(new Date().getDate() + 1)), 'yyyy-MM-dd') + 'T00:00:00';
      
      const todayTransactions = transactions.filter((t: Transaction) => {
        const txDate = new Date(t.created_at);
        const txDateISO = txDate.toISOString();
        return txDateISO >= todayISO && txDateISO < tomorrowISO;
      });
      
      // Nur abgeschlossene Transaktionen für die Berechnungen verwenden
      const completedTransactions = todayTransactions.filter(
        (t: Transaction) => t.status === 'completed'
      );
      
      // Wenn keine abgeschlossenen Transaktionen vorhanden sind
      if (completedTransactions.length === 0) {
        setStats({
          revenue: 0,
          transactions: 0,
          paymentMethods: {
            cash: 0,
            twint: 0,
            sumup: 0,
          },
          recentTransactions: [],
        });
        return;
      }
      
      // Gesamtumsatz berechnen
      const totalRevenue = completedTransactions.reduce(
        (sum: number, t: Transaction) => sum + t.total_amount,
        0
      )

      // Nach Zahlungsmethode aufteilen
      const cashTotal = completedTransactions
        .filter((t: Transaction) => t.payment_method === 'cash')
        .reduce((sum: number, t: Transaction) => sum + t.total_amount, 0)

      const twintTotal = completedTransactions
        .filter((t: Transaction) => t.payment_method === 'twint')
        .reduce((sum: number, t: Transaction) => sum + t.total_amount, 0)

      const sumupTotal = completedTransactions
        .filter((t: Transaction) => t.payment_method === 'sumup')
        .reduce((sum: number, t: Transaction) => sum + t.total_amount, 0)

      // Neueste 5 Transaktionen für die Anzeige formatieren
      const recentTransactions: DashboardTransaction[] = completedTransactions
        .slice(0, 5)
        .map((t: Transaction) => ({
          id: t.id,
          // Zeit extrahieren und formatieren (HH:MM)
          time: new Date(t.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          amount: t.total_amount,
          method: t.payment_method,
        }))

      // Dashboard-Statistiken setzen
      setStats({
        revenue: totalRevenue,
        transactions: completedTransactions.length,
        paymentMethods: {
          cash: cashTotal,
          twint: twintTotal,
          sumup: sumupTotal,
        },
        recentTransactions,
      })
    } catch (err: any) {
      // Fehler-Handling mit besseren Fehlermeldungen
      console.error('Fehler beim Laden der Dashboard-Statistik:', 
        err?.message || 'Unbekannter Fehler')
      
      // Leere Statistiken setzen im Fehlerfall
      setStats({
        revenue: 0,
        transactions: 0,
        paymentMethods: {
          cash: 0,
          twint: 0,
          sumup: 0,
        },
        recentTransactions: [],
      })
      
      // Fehlermeldung für UI setzen
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