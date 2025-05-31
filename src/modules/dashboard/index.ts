// Dashboard Module - Public API

export { default as DashboardPage } from './components/DashboardPage'
export { DashboardStats } from './components/DashboardStats'
export { MonthlyTrendChart } from './components/MonthlyTrendChart'
export { RecentActivities } from './components/RecentActivities'

// Re-export types
export type { DashboardStatsData } from './components/DashboardStats'
export type { MonthlyData } from './components/MonthlyTrendChart'
export type { ActivityItem } from './components/RecentActivities'