"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Wallet, CreditCard, Receipt, TrendingDown, ShoppingCart } from "lucide-react"

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

interface RecentActivitiesProps {
  activities: ActivityItem[]
  loading?: boolean
}

export function RecentActivities({ activities, loading = false }: RecentActivitiesProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Letzte Aktivitäten</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex justify-between items-center p-3 border rounded">
                <div className="space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded w-24" />
                  <div className="h-3 bg-muted animate-pulse rounded w-32" />
                </div>
                <div className="h-6 bg-muted animate-pulse rounded w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Letzte Aktivitäten</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center">
            <p className="text-muted-foreground">Keine Aktivitäten verfügbar.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Aktivitäten nach Datum sortieren (neueste zuerst)
  const sortedActivities = [...activities].sort((a, b) => 
    new Date(b.date + (b.time || '')).getTime() - new Date(a.date + (a.time || '')).getTime()
  )

  const formatDate = (dateStr: string, timeStr?: string) => {
    const date = new Date(dateStr)
    const dateDisplay = date.toLocaleDateString('de-CH', { 
      day: '2-digit', 
      month: '2-digit',
      weekday: 'short'
    })
    
    if (timeStr) {
      return `${dateDisplay} ${timeStr}`
    }
    return dateDisplay
  }

  const getActivityIcon = (activity: ActivityItem) => {
    if (activity.type === 'sale') {
      return <ShoppingCart size={16} className="text-success" />
    } else {
      return <TrendingDown size={16} className="text-destructive" />
    }
  }

  const getPaymentMethodIcon = (paymentMethod: string) => {
    switch (paymentMethod) {
      case 'cash':
        return <Wallet size={14} className="text-payment-cash" />
      case 'twint':
        return <Wallet size={14} className="text-payment-twint" />
      case 'sumup':
        return <CreditCard size={14} className="text-payment-sumup" />
      case 'bank':
        return <CreditCard size={14} className="text-payment-sumup" />
      default:
        return <Receipt size={14} className="text-muted-foreground" />
    }
  }

  const getPaymentMethodLabel = (paymentMethod: string) => {
    switch (paymentMethod) {
      case 'cash': return 'Bar'
      case 'twint': return 'TWINT'
      case 'sumup': return 'SumUp'
      case 'bank': return 'Bank'
      default: return paymentMethod
    }
  }

  const getActivityDescription = (activity: ActivityItem) => {
    if (activity.type === 'sale') {
      return 'Verkauf'
    } else {
      return activity.category || 'Ausgabe'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Letzte Aktivitäten ({activities.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sortedActivities.map((activity) => (
            <div 
              key={activity.id} 
              className={`flex justify-between items-center p-3 border rounded-md hover:bg-accent ${
                activity.type === 'expense' ? 'border-l-4 border-l-destructive/20' : 'border-l-4 border-l-success/20'
              }`}
            >
              <div className="flex items-center gap-3">
                {getActivityIcon(activity)}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {formatDate(activity.date, activity.time)}
                    </span>
                    <Badge 
                      variant={activity.type === 'sale' ? "default" : "outline"} 
                      className="text-xs"
                    >
                      {getActivityDescription(activity)}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {activity.description}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    {getPaymentMethodIcon(activity.paymentMethod)}
                    {getPaymentMethodLabel(activity.paymentMethod)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-medium ${
                  activity.type === 'sale' ? 'text-success' : 'text-destructive'
                }`}>
                  {activity.type === 'sale' ? '+' : '-'}CHF {Math.abs(activity.amount).toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}