'use client'

import { CreditCard, Loader2, Minus, Pencil, Plus, ShoppingBag, Trash2, Zap } from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Separator } from '@/shared/components/ui/separator'
import type { CartItem } from '@/shared/hooks/business/useSales'

interface ShoppingCartProps {
  cart: CartItem[]
  loading: boolean
  onUpdateQuantity: (itemId: string, newQuantity: number) => void
  onEditPrice: (item: CartItem) => void
  onDeleteItem: (itemId: string) => void
  onCheckout: () => void
}

export function ShoppingCart({
  cart,
  loading,
  onUpdateQuantity,
  onEditPrice,
  onDeleteItem,
  onCheckout,
}: ShoppingCartProps) {
  const cartTotal = cart?.reduce((sum, item) => sum + item.total, 0) || 0

  return (
    <div className="w-full md:w-1/3 flex flex-col h-full border rounded-lg">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center">
          <ShoppingBag className="mr-2" size={18} />
          Warenkorb
          {cart && cart.length > 0 && (
            <Badge className="ml-2" variant="secondary">
              {cart.length}
            </Badge>
          )}
        </h2>
      </div>

      {/* Das URSPRÜNGLICHE Layout: flex-1 + overflow-y-auto */}
      <div className="flex-1 overflow-y-auto p-4">
        {!cart || cart.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ShoppingBag className="mx-auto mb-3" size={24} />
            <p className="font-medium mb-1">Warenkorb ist leer</p>
            <p className="text-sm">Artikel hinzufügen</p>
          </div>
        ) : (
          <div className="space-y-2">
            {cart &&
              cart.map((item, index) => (
                <div key={item.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-medium text-sm mb-1">{item.name}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          CHF {item.price.toFixed(2)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => onEditPrice(item)}
                          disabled={loading}
                        >
                          <Pencil size={10} />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm font-semibold">CHF {item.total.toFixed(2)}</div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={loading}
                      >
                        <Minus size={12} />
                      </Button>
                      <span className="mx-3 text-sm font-medium min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={loading}
                      >
                        <Plus size={12} />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive"
                      onClick={() => onDeleteItem(item.id)}
                      disabled={loading}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Checkout-Bereich */}
      {cart && cart.length > 0 && (
        <div className="p-4 border-t border-border bg-gradient-to-r from-secondary/5 to-primary/5 rounded-b-2xl">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground text-sm">Zwischensumme</span>
              <span className="font-semibold text-foreground">CHF {cartTotal.toFixed(2)}</span>
            </div>
            <Separator className="bg-border/50" />
            <div className="flex justify-between items-center mt-2">
              <span className="text-lg font-bold text-foreground">Total</span>
              <span className="text-xl font-bold text-primary">CHF {cartTotal.toFixed(2)}</span>
            </div>
          </div>
          <Button
            onClick={onCheckout}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Verarbeiten...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Zur Kasse
                <Zap className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
