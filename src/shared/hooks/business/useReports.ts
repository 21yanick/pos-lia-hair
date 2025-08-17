/**
 * React Query-powered Reports Hook
 *
 * High-performance replacement for useReports with:
 * - Granular caching strategies
 * - Optimized parallel queries
 * - Background refetching
 * - Smart cache invalidation
 * - 100% Legacy compatibility
 */

'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
// Legacy compatibility imports
import { useCashBalance } from '@/shared/hooks/business/useCashBalance'
import { cacheConfig, queryKeys } from '@/shared/lib/react-query'
// Import optimized service functions
import {
  type ActivityItem,
  type DashboardTransaction,
  getCurrentCashBalance,
  getMonthlyTrends,
  getMonthStats,
  getProductCount,
  getRecentActivities,
  getRecentTransactions,
  getTodayStats,
  getWeekStats,
  getYearTotal,
  type MonthlyData,
  type MonthStatsData,
  type TodayStatsData,
  type WeekStatsData,
  type YearTotalData,
} from '@/shared/services/dashboardService'

// ========================================
// Legacy Compatible Types
// ========================================

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
  // New Dashboard data
  dashboardStatsData: DashboardStatsData
  monthlyTrendData: MonthlyData[]
  recentActivities: ActivityItem[]
}

interface UseReportsQueryReturn {
  // Dashboard-specific data (Legacy Compatible)
  dashboardStats: DashboardStats
  loading: boolean
  error: string | null
  refreshDashboard: () => Promise<void>

  // Cash Balance Functions (delegated, Legacy Compatible)
  getCurrentCashBalance: () => Promise<{ success: boolean; balance: number }>
  getCashMovementsForMonth: (start: Date, end: Date) => Promise<any>
  getCashMovementsForDate: (date: string) => Promise<any>
  cashLoading: boolean
  cashError: string | null
}

/**
 * React Query-powered Reports Hook
 *
 * Features:
 * - Granular queries with optimal caching
 * - Background refetching for real-time data
 * - Parallel loading for performance
 * - Legacy-compatible interface
 * - Smart invalidation strategies
 */
export function useReports(): UseReportsQueryReturn {
  const { currentOrganization } = useCurrentOrganization()
  const queryClient = useQueryClient()

  const organizationId = currentOrganization?.id
  const today = new Date().toISOString().split('T')[0]
  const currentYear = new Date().getFullYear()

  // Legacy cash balance hook for delegation
  const cashBalanceHook = useCashBalance()

  // ========================================
  // Granular Dashboard Queries
  // ========================================

  // Real-time data (high volatility)
  const {
    data: cashBalance = 0,
    isLoading: isBalanceLoading,
    error: balanceError,
  } = useQuery({
    queryKey: queryKeys.business.dashboard.balance(organizationId || ''),
    queryFn: () => getCurrentCashBalance(organizationId!),
    enabled: !!organizationId,
    ...cacheConfig.dashboard.balance,
    refetchInterval: cacheConfig.dashboard.balance.refetchInterval,
  })

  const {
    data: todayStatsData,
    isLoading: isTodayLoading,
    error: todayError,
  } = useQuery<TodayStatsData>({
    queryKey: queryKeys.business.dashboard.todayStats(organizationId || '', today),
    queryFn: () => getTodayStats(organizationId!),
    enabled: !!organizationId,
    ...cacheConfig.dashboard.todayStats,
    refetchOnWindowFocus: cacheConfig.dashboard.todayStats.refetchOnWindowFocus,
  })

  const {
    data: recentTransactions = [],
    isLoading: isTransactionsLoading,
    error: transactionsError,
  } = useQuery<DashboardTransaction[]>({
    queryKey: queryKeys.business.dashboard.recentTransactions(organizationId || '', 10),
    queryFn: () => getRecentTransactions(organizationId!, 10),
    enabled: !!organizationId,
    ...cacheConfig.dashboard.recentTransactions,
  })

  // Medium volatility data
  const {
    data: weekStatsData,
    isLoading: isWeekLoading,
    error: weekError,
  } = useQuery<WeekStatsData>({
    queryKey: queryKeys.business.dashboard.weekStats(organizationId || '', ''),
    queryFn: () => getWeekStats(organizationId!),
    enabled: !!organizationId,
    ...cacheConfig.dashboard.weekStats,
  })

  const {
    data: monthStatsData,
    isLoading: isMonthLoading,
    error: monthError,
  } = useQuery<MonthStatsData>({
    queryKey: queryKeys.business.dashboard.monthStats(organizationId || '', ''),
    queryFn: () => getMonthStats(organizationId!),
    enabled: !!organizationId,
    ...cacheConfig.dashboard.monthStats,
  })

  const {
    data: recentActivities = [],
    isLoading: isActivitiesLoading,
    error: activitiesError,
  } = useQuery<ActivityItem[]>({
    queryKey: queryKeys.business.dashboard.recentActivities(organizationId || '', 10),
    queryFn: () => getRecentActivities(organizationId!, 10),
    enabled: !!organizationId,
    ...cacheConfig.dashboard.recentActivities,
  })

  // Low volatility / Historical data
  const {
    data: monthlyTrendData = [],
    isLoading: isTrendsLoading,
    error: trendsError,
  } = useQuery<MonthlyData[]>({
    queryKey: queryKeys.business.dashboard.monthlyTrends(organizationId || '', 12),
    queryFn: () => getMonthlyTrends(organizationId!, 12),
    enabled: !!organizationId,
    ...cacheConfig.dashboard.monthlyTrends,
  })

  const {
    data: productCount = 0,
    isLoading: isProductsLoading,
    error: productsError,
  } = useQuery<number>({
    queryKey: queryKeys.business.dashboard.productCount(organizationId || ''),
    queryFn: () => getProductCount(organizationId!),
    enabled: !!organizationId,
    ...cacheConfig.dashboard.productCount,
  })

  const {
    data: yearTotalData,
    isLoading: isYearLoading,
    error: yearError,
  } = useQuery<YearTotalData>({
    queryKey: queryKeys.business.dashboard.yearTotal(organizationId || '', currentYear),
    queryFn: () => getYearTotal(organizationId!, currentYear),
    enabled: !!organizationId,
    ...cacheConfig.dashboard.yearTotal,
  })

  // ========================================
  // Combined Loading and Error States
  // ========================================
  const isLoading =
    isBalanceLoading ||
    isTodayLoading ||
    isTransactionsLoading ||
    isWeekLoading ||
    isMonthLoading ||
    isActivitiesLoading ||
    isTrendsLoading ||
    isProductsLoading ||
    isYearLoading

  const error =
    balanceError ||
    todayError ||
    transactionsError ||
    weekError ||
    monthError ||
    activitiesError ||
    trendsError ||
    productsError ||
    yearError

  // ========================================
  // Legacy Compatible Data Assembly
  // ========================================

  // Calculate last 30 days trend (simplified for now)
  const calculateLast30DaysTrend = (): {
    revenue: number
    trend: 'up' | 'down' | 'stable'
    percentage: number
  } => {
    const currentMonthRevenue = monthStatsData?.revenue || 0
    const previousMonthRevenue =
      monthlyTrendData && monthlyTrendData.length >= 2
        ? monthlyTrendData[monthlyTrendData.length - 2]?.revenue || 0
        : 0

    if (previousMonthRevenue === 0) {
      return { revenue: currentMonthRevenue, trend: 'stable', percentage: 0 }
    }

    const percentageChange =
      ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100

    return {
      revenue: currentMonthRevenue,
      trend: percentageChange > 5 ? 'up' : percentageChange < -5 ? 'down' : 'stable',
      percentage: Math.abs(percentageChange),
    }
  }

  // Assemble legacy-compatible dashboard stats
  const dashboardStats: DashboardStats = {
    // Today's data
    todayRevenue: todayStatsData?.revenue || 0,
    todayTransactions: todayStatsData?.transactions || 0,

    // Week/Month data
    weekRevenue: weekStatsData?.revenue || 0,
    monthRevenue: monthStatsData?.revenue || 0,

    // Products
    activeProducts: productCount || 0,

    // Payment methods (from today's stats)
    paymentMethods: todayStatsData?.paymentMethods || { cash: 0, twint: 0, sumup: 0 },

    // Recent data
    recentTransactions: recentTransactions || [],

    // Extended dashboard data
    dashboardStatsData: {
      cashBalance: cashBalance || 0,
      thisMonth: {
        revenue: monthStatsData?.revenue || 0,
        expenses: monthStatsData?.expenses || 0,
        profit: monthStatsData?.profit || 0,
      },
      last30Days: calculateLast30DaysTrend(),
      yearTotal: {
        revenue: yearTotalData?.revenue || 0,
        expenses: yearTotalData?.expenses || 0,
        profit: yearTotalData?.profit || 0,
      },
    },
    monthlyTrendData: monthlyTrendData || [],
    recentActivities: recentActivities || [],
  }

  // ========================================
  // Refresh Function (Legacy Compatible)
  // ========================================
  const refreshDashboard = async (): Promise<void> => {
    if (!organizationId) return

    // Invalidate all dashboard queries for fresh data
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: queryKeys.business.dashboard.balance(organizationId),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.business.dashboard.todayStats(organizationId, today),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.business.dashboard.recentTransactions(organizationId, 10),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.business.dashboard.weekStats(organizationId, ''),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.business.dashboard.monthStats(organizationId, ''),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.business.dashboard.recentActivities(organizationId, 10),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.business.dashboard.monthlyTrends(organizationId, 12),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.business.dashboard.productCount(organizationId),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.business.dashboard.yearTotal(organizationId, currentYear),
      }),
    ])
  }

  // ========================================
  // Legacy Compatible Return Interface
  // ========================================
  return {
    // Dashboard-specific data (Legacy Compatible)
    dashboardStats,
    loading: isLoading,
    error: error?.message || null,
    refreshDashboard,

    // Cash Balance Functions (delegated to maintain compatibility)
    getCurrentCashBalance: cashBalanceHook.getCurrentCashBalance,
    getCashMovementsForMonth: cashBalanceHook.getCashMovementsForMonth,
    getCashMovementsForDate: cashBalanceHook.getCashMovementsForDate,
    cashLoading: cashBalanceHook.loading,
    cashError: cashBalanceHook.error,
  }
}

// Export types for compatibility
export type {
  ActivityItem,
  DashboardTransaction,
  MonthlyData,
} from '@/shared/services/dashboardService'
