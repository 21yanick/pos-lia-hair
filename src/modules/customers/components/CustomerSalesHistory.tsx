'use client'

import { Calendar, ChevronDown, ChevronRight, Loader2, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/ui/collapsible'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import { useCustomerSales } from '../hooks/useCustomerSales'
import { formatRelativeDate } from '../utils/customerUtils'

interface CustomerSalesHistoryProps {
  customerId: string
}

export function CustomerSalesHistory({ customerId }: CustomerSalesHistoryProps) {
  const { currentOrganization } = useCurrentOrganization()
  const [expandedSales, setExpandedSales] = useState<Set<string>>(new Set())

  const {
    data: sales = [],
    isLoading,
    error,
  } = useCustomerSales(customerId, currentOrganization?.id || '')

  const toggleSaleExpanded = (saleId: string) => {
    setExpandedSales((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(saleId)) {
        newSet.delete(saleId)
      } else {
        newSet.add(saleId)
      }
      return newSet
    })
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash':
        return 'Bargeld'
      case 'twint':
        return 'TWINT'
      case 'sumup':
        return 'Karte'
      default:
        return method
    }
  }

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
      case 'twint':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
      case 'sumup':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
    }
  }

  const totalSales = sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0)

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Verkaufshistorie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2 text-muted-foreground">Lade Verkaufshistorie...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Verkaufshistorie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">
            <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Fehler beim Laden der Verkaufshistorie</p>
            <p className="text-xs mt-1">Bitte versuchen Sie es erneut.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Verkaufshistorie
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sales.length > 0 ? (
          <div className="space-y-4">
            {/* Summary */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">
                {sales.length} Verkauf{sales.length !== 1 ? 'e' : ''}
              </div>
              <div className="font-semibold">CHF {totalSales.toFixed(2)}</div>
            </div>

            {/* Sales List */}
            <div className="space-y-3">
              {sales.map((sale) => {
                const isExpanded = expandedSales.has(sale.id)
                const hasItems = sale.sale_items && sale.sale_items.length > 0

                return (
                  <Collapsible
                    key={sale.id}
                    open={isExpanded}
                    onOpenChange={() => toggleSaleExpanded(sale.id)}
                  >
                    <div className="border border-border rounded-lg overflow-hidden">
                      {/* Sale Header */}
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full h-auto p-3 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-3 w-full min-w-0">
                            <div className="flex items-center gap-2 min-w-0">
                              <Calendar className="h-3 w-3 shrink-0" />
                              <span className="text-sm text-muted-foreground truncate">
                                {formatRelativeDate(sale.created_at)}
                              </span>
                              {hasItems && (
                                <Badge variant="outline" className="text-xs shrink-0">
                                  {sale.sale_items.length}
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                              <Badge
                                variant="secondary"
                                className={`text-xs ${getPaymentMethodColor(sale.payment_method)}`}
                              >
                                {getPaymentMethodLabel(sale.payment_method)}
                              </Badge>
                              <div className="font-semibold">
                                CHF {parseFloat(sale.total_amount).toFixed(2)}
                              </div>
                              {hasItems &&
                                (isExpanded ? (
                                  <ChevronDown className="h-4 w-4 shrink-0" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 shrink-0" />
                                ))}
                            </div>
                          </div>
                        </Button>
                      </CollapsibleTrigger>

                      {/* Sale Items Details */}
                      {hasItems && (
                        <CollapsibleContent className="border-t border-border">
                          <div className="p-3 bg-muted/20 space-y-2">
                            <div className="text-xs font-medium text-muted-foreground mb-2">
                              Gekaufte Artikel:
                            </div>
                            {sale.sale_items.map((saleItem) => (
                              <div
                                key={saleItem.id}
                                className="flex items-start justify-between text-sm py-1 gap-2 min-w-0"
                              >
                                <div className="flex-1 min-w-0">
                                  <span className="font-medium block truncate">
                                    {saleItem.item?.name || 'Unbekannter Artikel'}
                                  </span>
                                  <div className="text-xs text-muted-foreground">
                                    {saleItem.item?.type && <span>({saleItem.item.type})</span>}
                                    {saleItem.quantity && saleItem.quantity > 1 && (
                                      <span className={saleItem.item?.type ? ' • ' : ''}>
                                        {saleItem.quantity}x
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="font-medium shrink-0">
                                  {saleItem.quantity && saleItem.quantity > 1 ? (
                                    <div className="text-right">
                                      <div className="text-xs text-muted-foreground">
                                        {saleItem.quantity}x {parseFloat(saleItem.price).toFixed(2)}
                                      </div>
                                      <div>
                                        CHF{' '}
                                        {(
                                          parseFloat(saleItem.price) * (saleItem.quantity || 1)
                                        ).toFixed(2)}
                                      </div>
                                    </div>
                                  ) : (
                                    <>CHF {parseFloat(saleItem.price).toFixed(2)}</>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      )}
                    </div>
                  </Collapsible>
                )
              })}
            </div>

            {/* "Alle anzeigen" button for many sales */}
            {sales.length >= 5 && (
              <div className="text-center pt-2">
                <button type="button" className="text-sm text-primary hover:underline">
                  Alle Verkäufe anzeigen ({sales.length})
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Noch keine Verkäufe</p>
            <p className="text-xs mt-1">
              Verkäufe werden hier angezeigt, sobald der Kunde etwas kauft.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
