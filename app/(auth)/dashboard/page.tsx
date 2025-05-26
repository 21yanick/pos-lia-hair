"use client"

import { useState, useEffect } from "react"
import { ShoppingCart, FileText, BookOpen, BarChart4, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/lib/hooks/core/useToast"
import { useReports } from "@/lib/hooks/business/useReports"

export default function Dashboard() {
  // Hooks
  const {
    dashboardStats: stats,
    loading: statsLoading,
    error: statsError,
    refreshDashboard: refreshStats
  } = useReports()
  
  const { toast } = useToast()
  
  // Fehlerbehandlung für Dashboard-Statistiken
  useEffect(() => {
    if (statsError) {
      toast({
        title: "Fehler beim Laden der Statistiken",
        description: statsError,
        variant: "destructive"
      });
    }
  }, [statsError, toast]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Überblick über Ihr POS-System
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

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:bg-accent transition-colors" 
              onClick={() => window.location.href = '/pos'}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              POS System
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Verkäufe und Transaktionen
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => window.location.href = '/products'}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Produkte
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Produkte & Dienstleistungen verwalten
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => window.location.href = '/reports'}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Berichte
            </CardTitle>
            <BarChart4 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Verkaufs- und Finanzberichte
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => window.location.href = '/documents'}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Dokumente
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Belege und Quittungen
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Heutige Umsätze
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : `CHF ${stats?.todayRevenue?.toFixed(2) || "0.00"}`}
            </div>
            <p className="text-xs text-muted-foreground">
              +{stats?.todayTransactions || 0} Transaktionen heute
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Wöchentliche Umsätze
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : `CHF ${stats?.weekRevenue?.toFixed(2) || "0.00"}`}
            </div>
            <p className="text-xs text-muted-foreground">
              Diese Woche
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monatliche Umsätze
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : `CHF ${stats?.monthRevenue?.toFixed(2) || "0.00"}`}
            </div>
            <p className="text-xs text-muted-foreground">
              Dieser Monat
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aktive Produkte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : stats?.activeProducts || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Verfügbare Artikel
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Letzte Aktivitäten</CardTitle>
          <CardDescription>
            Übersicht der neuesten Transaktionen
          </CardDescription>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className="text-center py-4">
              Lade Aktivitäten...
            </div>
          ) : stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
            <div className="space-y-2">
              {stats.recentTransactions.slice(0, 5).map((transaction: any, index: number) => (
                <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <p className="text-sm font-medium">
                      {transaction.method === 'cash' ? 'Barzahlung' : 
                       transaction.method === 'twint' ? 'TWINT' : 'Karte'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.time}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">CHF {transaction.amount.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{transaction.method}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              Keine Aktivitäten gefunden
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}