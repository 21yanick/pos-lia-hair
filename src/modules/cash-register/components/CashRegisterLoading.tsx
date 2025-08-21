import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/shared/components/ui/card'

export default function CashRegisterLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Kassenbuch</h1>
          <p className="text-muted-foreground">Übersicht aller Bargeldbewegungen</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
        </div>
      </div>

      {/* Skeleton for current balance and daily summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Main Balance Card Skeleton */}
        <Card className="col-span-1 md:col-span-1 shadow-md border-0 overflow-hidden">
          <div className="h-2 w-full bg-muted"></div>
          <CardHeader className="pb-2">
            <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
          <CardFooter className="pt-0 pb-4 flex justify-center">
            <div className="h-8 w-28 bg-muted rounded"></div>
          </CardFooter>
        </Card>

        {/* Daily Summary Card Skeleton */}
        <Card className="col-span-1 md:col-span-2 shadow-md border-0">
          <div className="h-2 w-full bg-muted"></div>
          <CardHeader className="pb-2">
            <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => (
                <div
                  key={`skeleton-cash-register-${i + 1}`}
                  className="flex flex-col items-center p-3 rounded-lg bg-muted/50"
                >
                  <div className="h-6 w-6 bg-muted rounded-full mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Card Skeleton */}
      <Card className="shadow-md border-0 overflow-hidden mb-6">
        <div className="h-2 w-full bg-muted"></div>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="h-10 bg-muted rounded w-full md:w-3/4"></div>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="h-10 bg-muted rounded w-1/2"></div>
              <div className="h-10 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Skeleton */}
      <Card className="shadow-md border-0 overflow-hidden">
        <div className="h-2 w-full bg-muted"></div>
        <CardHeader className="pb-2">
          <div className="h-5 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col justify-center items-center py-20 space-y-3">
            <Loader2 className="h-10 w-10 animate-spin text-gray-300" />
            <div className="h-5 bg-muted rounded w-48"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
