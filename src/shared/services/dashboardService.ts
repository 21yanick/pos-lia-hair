/**
 * Optimized Dashboard Service Functions
 * 
 * High-performance database queries designed for React Query caching
 * 
 * Performance Features:
 * - Batch queries instead of N+1 loops
 * - Parallel execution where possible
 * - Optimized SELECT statements
 * - RPC functions for complex calculations
 * - Minimal data transfer
 */

'use client'

import { supabase } from '@/shared/lib/supabase/client'
import { formatDateForAPI, getSwissDayRange, getFirstDayOfMonth, getLastDayOfMonth } from '@/shared/utils/dateUtils'

// ========================================
// Types (imported from legacy for compatibility)
// ========================================

export type DashboardTransaction = {
  id: string
  time: string
  amount: number
  method: 'cash' | 'twint' | 'sumup'
}

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

export type TodayStatsData = {
  revenue: number
  transactions: number
  paymentMethods: {
    cash: number
    twint: number
    sumup: number
  }
}

export type WeekStatsData = {
  revenue: number
  transactionCount: number
}

export type MonthStatsData = {
  revenue: number
  expenses: number
  profit: number
}

export type YearTotalData = {
  revenue: number
  expenses: number
  profit: number
}

// ========================================
// Real-time / High Volatility Queries
// ========================================

/**
 * Get current cash balance (optimized)
 * Uses existing RPC function - already optimized
 */
export async function getCurrentCashBalance(orgId: string): Promise<number> {
  const { data, error } = await supabase.rpc('get_current_cash_balance_for_org', {
    org_id: orgId
  })

  if (error) {
    // console.error('Error loading cash balance:', error)
    throw new Error('Fehler beim Laden des Kassenstands')
  }

  return data || 0
}

/**
 * Get today's statistics (optimized single query)
 */
export async function getTodayStats(orgId: string, date?: string): Promise<TodayStatsData> {
  const targetDate = date || new Date().toISOString().split('T')[0]
  const { start, end } = getSwissDayRange(targetDate)

  const { data: sales, error } = await supabase
    .from('sales')
    .select('id, total_amount, payment_method')
    .eq('organization_id', orgId)
    .eq('status', 'completed')
    .gte('created_at', start)
    .lte('created_at', end)

  if (error) {
    // console.error('Error loading today stats:', error)
    throw new Error('Fehler beim Laden der Tagesstatistiken')
  }

  // Client-side aggregation for optimal performance
  const todayStats = (sales || []).reduce((acc, sale) => {
    const amount = parseFloat(sale.total_amount) || 0
    acc.revenue += amount
    acc.transactions += 1
    
    // Payment method aggregation
    const method = sale.payment_method as 'cash' | 'twint' | 'sumup'
    if (method && acc.paymentMethods[method] !== undefined) {
      acc.paymentMethods[method] += amount
    }
    
    return acc
  }, {
    revenue: 0,
    transactions: 0,
    paymentMethods: { cash: 0, twint: 0, sumup: 0 }
  })

  return todayStats
}

/**
 * Get recent transactions (optimized limit & select)
 */
export async function getRecentTransactions(orgId: string, limit = 10): Promise<DashboardTransaction[]> {
  const { data: sales, error } = await supabase
    .from('sales')
    .select('id, total_amount, payment_method, created_at')
    .eq('organization_id', orgId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    // console.error('Error loading recent transactions:', error)
    throw new Error('Fehler beim Laden der letzten Transaktionen')
  }

  return (sales || []).map(sale => ({
    id: sale.id,
    time: new Date(sale.created_at).toLocaleTimeString('de-CH', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    amount: parseFloat(sale.total_amount) || 0,
    method: sale.payment_method as 'cash' | 'twint' | 'sumup'
  }))
}

// ========================================
// Medium Volatility Queries
// ========================================

/**
 * Get week statistics (optimized date range)
 */
export async function getWeekStats(orgId: string, weekStart?: string): Promise<WeekStatsData> {
  const startDate = weekStart ? new Date(weekStart) : (() => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(now)
    monday.setDate(now.getDate() + mondayOffset)
    return monday
  })()

  const { data: sales, error } = await supabase
    .from('sales')
    .select('id, total_amount')
    .eq('organization_id', orgId)
    .eq('status', 'completed')
    .gte('created_at', startDate.toISOString())

  if (error) {
    // console.error('Error loading week stats:', error)
    throw new Error('Fehler beim Laden der Wochenstatistiken')
  }

  return (sales || []).reduce((acc, sale) => {
    acc.revenue += parseFloat(sale.total_amount) || 0
    acc.transactionCount += 1
    return acc
  }, { revenue: 0, transactionCount: 0 })
}

/**
 * Get month statistics (optimized)
 */
export async function getMonthStats(orgId: string, monthStart?: string): Promise<MonthStatsData> {
  const startDate = monthStart ? new Date(monthStart) : getFirstDayOfMonth(new Date())
  const endDate = getLastDayOfMonth(startDate)

  // Parallel queries for sales and expenses
  const [salesResult, expensesResult] = await Promise.all([
    supabase
      .from('sales')
      .select('total_amount')
      .eq('organization_id', orgId)
      .eq('status', 'completed')
      .gte('created_at', formatDateForAPI(startDate))
      .lte('created_at', formatDateForAPI(endDate)),
    
    supabase
      .from('expenses')
      .select('amount')
      .eq('organization_id', orgId)
      .gte('payment_date', formatDateForAPI(startDate))
      .lte('payment_date', formatDateForAPI(endDate))
  ])

  if (salesResult.error) {
    // console.error('Error loading month sales:', salesResult.error)
    throw new Error('Fehler beim Laden der Monatsumsätze')
  }

  if (expensesResult.error) {
    // console.error('Error loading month expenses:', expensesResult.error)
    throw new Error('Fehler beim Laden der Monatsausgaben')
  }

  const revenue = (salesResult.data || []).reduce((sum, sale) => 
    sum + (parseFloat(sale.total_amount) || 0), 0)
  
  const expenses = (expensesResult.data || []).reduce((sum, expense) => 
    sum + (parseFloat(expense.amount) || 0), 0)

  return {
    revenue,
    expenses,
    profit: revenue - expenses
  }
}

/**
 * Get recent activities (optimized parallel queries)
 */
export async function getRecentActivities(orgId: string, limit = 10): Promise<ActivityItem[]> {
  // Parallel queries for sales and expenses
  const [salesResult, expensesResult] = await Promise.all([
    supabase
      .from('sales')
      .select('id, created_at, total_amount, payment_method')
      .eq('organization_id', orgId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(Math.ceil(limit / 2)), // Split limit between sales and expenses
    
    supabase
      .from('expenses')
      .select('id, created_at, amount, category, description, payment_method')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(Math.ceil(limit / 2))
  ])

  if (salesResult.error) {
    // console.error('Error loading recent sales:', salesResult.error)
    throw new Error('Fehler beim Laden der letzten Verkäufe')
  }

  if (expensesResult.error) {
    // console.error('Error loading recent expenses:', expensesResult.error)
    throw new Error('Fehler beim Laden der letzten Ausgaben')
  }

  // Merge and sort activities
  const activities: ActivityItem[] = [
    ...(salesResult.data || []).map(sale => ({
      id: sale.id,
      date: sale.created_at.split('T')[0],
      time: new Date(sale.created_at).toLocaleTimeString('de-CH', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      type: 'sale' as const,
      description: `Verkauf #${sale.id.slice(0, 8)}`,
      amount: parseFloat(sale.total_amount) || 0,
      paymentMethod: sale.payment_method as 'cash' | 'twint' | 'sumup'
    })),
    ...(expensesResult.data || []).map(expense => ({
      id: expense.id,
      date: expense.created_at.split('T')[0],
      time: new Date(expense.created_at).toLocaleTimeString('de-CH', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      type: 'expense' as const,
      description: expense.description || `${expense.category}`,
      amount: parseFloat(expense.amount) || 0,
      paymentMethod: expense.payment_method as 'cash' | 'twint' | 'sumup' | 'bank',
      category: expense.category
    }))
  ]

  // Sort by created_at and limit
  return activities
    .sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`)
      const dateB = new Date(`${b.date} ${b.time}`)
      return dateB.getTime() - dateA.getTime()
    })
    .slice(0, limit)
}

// ========================================
// Low Volatility / Historical Queries
// ========================================

/**
 * Get monthly trends (OPTIMIZED: Single batch query instead of N+1 loop)
 */
export async function getMonthlyTrends(orgId: string, monthsBack = 12): Promise<MonthlyData[]> {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setMonth(endDate.getMonth() - monthsBack + 1)
  startDate.setDate(1) // First day of the start month

  // Single optimized query for all months
  const [salesResult, expensesResult] = await Promise.all([
    supabase
      .from('sales')
      .select('total_amount, created_at')
      .eq('organization_id', orgId)
      .eq('status', 'completed')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString()),
    
    supabase
      .from('expenses')
      .select('amount, payment_date')
      .eq('organization_id', orgId)
      .gte('payment_date', formatDateForAPI(startDate))
      .lte('payment_date', formatDateForAPI(endDate))
  ])

  if (salesResult.error) {
    // console.error('Error loading monthly sales trends:', salesResult.error)
    throw new Error('Fehler beim Laden der Monats-Trends (Verkäufe)')
  }

  if (expensesResult.error) {
    // console.error('Error loading monthly expenses trends:', expensesResult.error)
    throw new Error('Fehler beim Laden der Monats-Trends (Ausgaben)')
  }

  // Client-side aggregation by month (faster than DB GROUP BY for this use case)
  const monthlyData: { [key: string]: { revenue: number; expenses: number } } = {}

  // Aggregate sales by month
  ;(salesResult.data || []).forEach(sale => {
    const monthKey = sale.created_at.substring(0, 7) // YYYY-MM
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { revenue: 0, expenses: 0 }
    }
    monthlyData[monthKey].revenue += parseFloat(sale.total_amount) || 0
  })

  // Aggregate expenses by month
  ;(expensesResult.data || []).forEach(expense => {
    const monthKey = expense.payment_date.substring(0, 7) // YYYY-MM
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { revenue: 0, expenses: 0 }
    }
    monthlyData[monthKey].expenses += parseFloat(expense.amount) || 0
  })

  // Convert to array and fill missing months
  const result: MonthlyData[] = []
  for (let i = monthsBack - 1; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const monthKey = date.toISOString().substring(0, 7)
    
    const data = monthlyData[monthKey] || { revenue: 0, expenses: 0 }
    
    result.push({
      month: monthKey,
      monthName: date.toLocaleDateString('de-CH', { month: 'short', year: 'numeric' }),
      revenue: data.revenue,
      expenses: data.expenses,
      profit: data.revenue - data.expenses
    })
  }

  return result
}

/**
 * Get active product count (optimized count query)
 */
export async function getProductCount(orgId: string): Promise<number> {
  const { count, error } = await supabase
    .from('items')
    .select('id', { count: 'exact', head: true }) // count: 'exact' for accurate count
    .eq('organization_id', orgId)
    .eq('active', true)

  if (error) {
    // console.error('Error loading product count:', error)
    throw new Error('Fehler beim Laden der Produktanzahl')
  }

  return count || 0
}

/**
 * Get year total (optimized for current year)
 */
export async function getYearTotal(orgId: string, year?: number): Promise<YearTotalData> {
  const targetYear = year || new Date().getFullYear()
  const startDate = new Date(targetYear, 0, 1) // January 1st
  const endDate = new Date(targetYear, 11, 31) // December 31st

  // Parallel queries for the entire year
  const [salesResult, expensesResult] = await Promise.all([
    supabase
      .from('sales')
      .select('total_amount')
      .eq('organization_id', orgId)
      .eq('status', 'completed')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString()),
    
    supabase
      .from('expenses')
      .select('amount')
      .eq('organization_id', orgId)
      .gte('payment_date', formatDateForAPI(startDate))
      .lte('payment_date', formatDateForAPI(endDate))
  ])

  if (salesResult.error) {
    // console.error('Error loading year sales:', salesResult.error)
    throw new Error('Fehler beim Laden der Jahresumsätze')
  }

  if (expensesResult.error) {
    // console.error('Error loading year expenses:', expensesResult.error)
    throw new Error('Fehler beim Laden der Jahresausgaben')
  }

  const revenue = (salesResult.data || []).reduce((sum, sale) => 
    sum + (parseFloat(sale.total_amount) || 0), 0)
  
  const expenses = (expensesResult.data || []).reduce((sum, expense) => 
    sum + (parseFloat(expense.amount) || 0), 0)

  return {
    revenue,
    expenses,
    profit: revenue - expenses
  }
}

// ========================================
// Utility Functions
// ========================================

/**
 * Get organization ID with error handling
 */
export async function getCurrentOrganizationId(): Promise<string> {
  // This would normally come from context, but for service functions we might need to fetch it
  // For now, assume it's passed to each function
  throw new Error('Organization ID must be provided to service functions')
}