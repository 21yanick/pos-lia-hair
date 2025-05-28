"use client"

import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/lib/hooks/core/useToast"
import { useReports } from "@/lib/hooks/business/useReports"
import { MonthlyTrendChart } from "./components/MonthlyTrendChart"
import { DashboardStats } from "./components/DashboardStats"
import { RecentActivities } from "./components/RecentActivities"

export default function Dashboard() {
  const {
    dashboardStats: stats,
    loading: statsLoading,
    error: statsError,
    refreshDashboard: refreshStats
  } = useReports()
  
  const { toast } = useToast()

  const handleRefreshStats = async () => {
    try {
      await refreshStats()
      toast({
        title: "Aktualisiert",
        description: "Dashboard-Statistiken wurden erfolgreich aktualisiert.",
      })
    } catch (err: any) {
      toast({
        title: "Fehler",
        description: "Statistiken konnten nicht aktualisiert werden.",
        variant: "destructive"
      })
    }
  }

  if (statsError) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Überblick über Ihr Salon-Geschäft
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Fehler beim Laden: {statsError}</p>
            <Button onClick={handleRefreshStats}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Erneut versuchen
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Rentabilitäts-Übersicht für Ihr Salon-Geschäft
          </p>
        </div>
        <Button 
          onClick={handleRefreshStats}
          disabled={statsLoading}
          variant="outline"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${statsLoading ? 'animate-spin' : ''}`} />
          Aktualisieren
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <DashboardStats 
        data={stats.dashboardStatsData} 
        loading={statsLoading} 
      />

      {/* Chart and Activities Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MonthlyTrendChart 
          data={stats.monthlyTrendData} 
          loading={statsLoading} 
        />
        <RecentActivities 
          activities={stats.recentActivities} 
          loading={statsLoading} 
        />
      </div>
    </div>
  )
}