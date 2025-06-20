/**
 * Query Key Factory for React Query
 * 
 * Centralized query key management for:
 * - Type safety
 * - Consistency
 * - Easy invalidation
 * - Multi-tenant support
 * 
 * Query Key Hierarchy:
 * [domain, organizationId, entity, ...filters]
 * 
 * Examples:
 * ['business', 'org123', 'settings']
 * ['business', 'org123', 'sales', { status: 'completed' }]
 * ['business', 'org123', 'items', { category: 'services' }]
 */

export const queryKeys = {
  // ========================================
  // Authentication & User Management
  // ========================================
  auth: {
    all: () => ['auth'] as const,
    user: () => [...queryKeys.auth.all(), 'user'] as const,
    profile: () => [...queryKeys.auth.all(), 'profile'] as const,
    session: () => [...queryKeys.auth.all(), 'session'] as const,
  },
  
  // ========================================
  // Organization Management (Multi-Tenant)
  // ========================================
  organization: {
    all: () => ['organization'] as const,
    lists: () => [...queryKeys.organization.all(), 'list'] as const,
    list: (userId: string) => [...queryKeys.organization.lists(), userId] as const,
    details: () => [...queryKeys.organization.all(), 'detail'] as const,
    detail: (orgId: string) => [...queryKeys.organization.details(), orgId] as const,
    members: (orgId: string) => [...queryKeys.organization.detail(orgId), 'members'] as const,
  },
  
  // ========================================
  // Business Data (Organization-Scoped)
  // ========================================
  business: {
    // Root business queries
    all: (orgId: string) => ['business', orgId] as const,
    
    // Business Settings
    settings: {
      all: (orgId: string) => [...queryKeys.business.all(orgId), 'settings'] as const,
      detail: (orgId: string) => [...queryKeys.business.settings.all(orgId), 'detail'] as const,
    },
    
    // Cash Movements & Balance
    cash: {
      all: (orgId: string) => [...queryKeys.business.all(orgId), 'cash'] as const,
      balance: (orgId: string) => [...queryKeys.business.cash.all(orgId), 'balance'] as const,
      movements: (orgId: string, filters?: any) => [
        ...queryKeys.business.cash.all(orgId), 
        'movements', 
        filters
      ] as const,
    },
    
    // Sales & Transactions
    sales: {
      all: (orgId: string) => [...queryKeys.business.all(orgId), 'sales'] as const,
      lists: (orgId: string) => [...queryKeys.business.sales.all(orgId), 'list'] as const,
      list: (orgId: string, filters?: any) => [
        ...queryKeys.business.sales.lists(orgId), 
        filters
      ] as const,
      details: (orgId: string) => [...queryKeys.business.sales.all(orgId), 'detail'] as const,
      detail: (orgId: string, saleId: string) => [
        ...queryKeys.business.sales.details(orgId), 
        saleId
      ] as const,
      stats: (orgId: string, timeframe?: string) => [
        ...queryKeys.business.sales.all(orgId), 
        'stats', 
        timeframe
      ] as const,
    },
    
    // Products & Services
    items: {
      all: (orgId: string) => [...queryKeys.business.all(orgId), 'items'] as const,
      lists: (orgId: string) => [...queryKeys.business.items.all(orgId), 'list'] as const,
      list: (orgId: string, filters?: any) => [
        ...queryKeys.business.items.lists(orgId), 
        filters
      ] as const,
      active: (orgId: string) => [...queryKeys.business.items.lists(orgId), 'active'] as const,
      favorites: (orgId: string) => [...queryKeys.business.items.lists(orgId), 'favorites'] as const,
      search: (orgId: string, query: string, activeOnly?: boolean) => [
        ...queryKeys.business.items.lists(orgId), 
        'search',
        query,
        activeOnly
      ] as const,
      details: (orgId: string) => [...queryKeys.business.items.all(orgId), 'detail'] as const,
      detail: (orgId: string, itemId: string) => [
        ...queryKeys.business.items.details(orgId), 
        itemId
      ] as const,
      categories: (orgId: string) => [...queryKeys.business.items.all(orgId), 'categories'] as const,
      categoryCounts: (orgId: string) => [...queryKeys.business.items.all(orgId), 'category-counts'] as const,
      optimized: (orgId: string) => [...queryKeys.business.items.all(orgId), 'optimized'] as const,
    },
    
    // Expenses & Financial Operations
    expenses: {
      all: (orgId: string) => [...queryKeys.business.all(orgId), 'expenses'] as const,
      lists: (orgId: string) => [...queryKeys.business.expenses.all(orgId), 'list'] as const,
      list: (orgId: string, filters?: any) => [
        ...queryKeys.business.expenses.lists(orgId), 
        filters
      ] as const,
      dateRange: (orgId: string, startDate: string, endDate: string) => [
        ...queryKeys.business.expenses.lists(orgId), 
        'dateRange',
        startDate,
        endDate
      ] as const,
      currentMonth: (orgId: string) => [
        ...queryKeys.business.expenses.lists(orgId), 
        'currentMonth'
      ] as const,
      byCategory: (orgId: string, category: string) => [
        ...queryKeys.business.expenses.lists(orgId),
        'category',
        category
      ] as const,
      byPaymentMethod: (orgId: string, paymentMethod: string) => [
        ...queryKeys.business.expenses.lists(orgId),
        'paymentMethod',
        paymentMethod
      ] as const,
      details: (orgId: string) => [...queryKeys.business.expenses.all(orgId), 'detail'] as const,
      detail: (orgId: string, expenseId: string) => [
        ...queryKeys.business.expenses.details(orgId), 
        expenseId
      ] as const,
      categories: (orgId: string) => [...queryKeys.business.expenses.all(orgId), 'categories'] as const,
      stats: (orgId: string, timeframe?: string) => [
        ...queryKeys.business.expenses.all(orgId), 
        'stats',
        timeframe
      ] as const,
      grouped: (orgId: string) => [...queryKeys.business.expenses.all(orgId), 'grouped'] as const,
    },
    
    // Banking & Financial Data
    banking: {
      all: (orgId: string) => [...queryKeys.business.all(orgId), 'banking'] as const,
      transactions: (orgId: string, filters?: any) => [
        ...queryKeys.business.banking.all(orgId), 
        'transactions', 
        filters
      ] as const,
      reconciliation: (orgId: string) => [
        ...queryKeys.business.banking.all(orgId), 
        'reconciliation'
      ] as const,
    },
    
    // Reports & Analytics
    reports: {
      all: (orgId: string) => [...queryKeys.business.all(orgId), 'reports'] as const,
      financial: (orgId: string, period?: string) => [
        ...queryKeys.business.reports.all(orgId), 
        'financial', 
        period
      ] as const,
      sales: (orgId: string, period?: string) => [
        ...queryKeys.business.reports.all(orgId), 
        'sales', 
        period
      ] as const,
      performance: (orgId: string, period?: string) => [
        ...queryKeys.business.reports.all(orgId), 
        'performance', 
        period
      ] as const,
    },
    
    // Dashboard-specific queries (granular)
    dashboard: {
      all: (orgId: string) => [...queryKeys.business.all(orgId), 'dashboard'] as const,
      
      // Real-time / High volatility data
      balance: (orgId: string) => [...queryKeys.business.dashboard.all(orgId), 'balance'] as const,
      todayStats: (orgId: string, date: string) => [
        ...queryKeys.business.dashboard.all(orgId), 
        'today-stats', 
        date
      ] as const,
      recentTransactions: (orgId: string, limit?: number) => [
        ...queryKeys.business.dashboard.all(orgId), 
        'recent-transactions', 
        limit
      ] as const,
      
      // Medium volatility data
      weekStats: (orgId: string, weekStart: string) => [
        ...queryKeys.business.dashboard.all(orgId), 
        'week-stats', 
        weekStart
      ] as const,
      monthStats: (orgId: string, monthStart: string) => [
        ...queryKeys.business.dashboard.all(orgId), 
        'month-stats', 
        monthStart
      ] as const,
      recentActivities: (orgId: string, limit?: number) => [
        ...queryKeys.business.dashboard.all(orgId), 
        'recent-activities', 
        limit
      ] as const,
      
      // Low volatility / Historical data
      monthlyTrends: (orgId: string, monthsBack?: number) => [
        ...queryKeys.business.dashboard.all(orgId), 
        'monthly-trends', 
        monthsBack
      ] as const,
      productCount: (orgId: string) => [
        ...queryKeys.business.dashboard.all(orgId), 
        'product-count'
      ] as const,
      yearTotal: (orgId: string, year?: number) => [
        ...queryKeys.business.dashboard.all(orgId), 
        'year-total', 
        year
      ] as const,
    },
    
    // Documents & Files
    documents: {
      all: (orgId: string) => [...queryKeys.business.all(orgId), 'documents'] as const,
      lists: (orgId: string) => [...queryKeys.business.documents.all(orgId), 'list'] as const,
      list: (orgId: string, filters?: any) => [
        ...queryKeys.business.documents.lists(orgId), 
        filters
      ] as const,
      detail: (orgId: string, docId: string) => [
        ...queryKeys.business.documents.all(orgId), 
        'detail', 
        docId
      ] as const,
    },
  },
  
  // ========================================
  // System & Global Data
  // ========================================
  system: {
    all: () => ['system'] as const,
    health: () => [...queryKeys.system.all(), 'health'] as const,
    stats: () => [...queryKeys.system.all(), 'stats'] as const,
    config: () => [...queryKeys.system.all(), 'config'] as const,
  },
} as const

/**
 * Utility functions for query key management
 */
export const queryKeyUtils = {
  /**
   * Invalidate all queries for a specific organization
   */
  invalidateOrganization: (orgId: string) => {
    return queryKeys.business.all(orgId)
  },
  
  /**
   * Invalidate all financial data for an organization
   */
  invalidateFinancialData: (orgId: string) => {
    return [
      queryKeys.business.cash.all(orgId),
      queryKeys.business.sales.all(orgId),
      queryKeys.business.expenses.all(orgId),
      queryKeys.business.banking.all(orgId),
    ]
  },
  
  /**
   * Invalidate all settings and configuration
   */
  invalidateSettings: (orgId: string) => {
    return queryKeys.business.settings.all(orgId)
  },
  
  /**
   * Get all query keys that should be prefetched for a new organization
   */
  prefetchKeys: (orgId: string) => {
    return [
      queryKeys.business.settings.detail(orgId),
      queryKeys.business.cash.balance(orgId),
      queryKeys.business.items.list(orgId),
      queryKeys.business.sales.stats(orgId, 'today'),
    ]
  },
} as const

// Type exports for better TypeScript support
export type QueryKey = readonly unknown[]
export type BusinessQueryKey = ReturnType<typeof queryKeys.business[keyof typeof queryKeys.business]>
export type AuthQueryKey = ReturnType<typeof queryKeys.auth[keyof typeof queryKeys.auth]>
export type OrganizationQueryKey = ReturnType<typeof queryKeys.organization[keyof typeof queryKeys.organization]>

// Export default for convenience
export default queryKeys