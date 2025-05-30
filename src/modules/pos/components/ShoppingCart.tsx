"use client"

import { CreditCard, Loader2, Minus, Pencil, Plus, Trash2, ShoppingBag, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { CartItem } from "../hooks/useSales"

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
    <div className="w-full md:w-1/3 flex flex-col h-full bg-gradient-to-br from-muted/50 to-background rounded-2xl border border-border shadow-sm backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5 rounded-t-2xl">
        <h2 className="text-xl font-bold flex items-center text-foreground">
          <div className="mr-3 p-2 bg-primary/10 rounded-xl">
            <ShoppingBag className="text-primary" size={20} />
          </div>
          Warenkorb
          {cart && cart.length > 0 && (
            <Badge className="ml-3 bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1">
              {cart.length}
            </Badge>
          )}
        </h2>
      </div>

      {/* Das URSPRÜNGLICHE Layout: flex-1 + overflow-y-auto */}
      <div className="flex-1 overflow-y-auto p-4">
        {!cart || cart.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground flex flex-col items-center">
            <div className="p-4 bg-muted rounded-full mb-4">
              <ShoppingBag className="text-muted-foreground" size={32} />
            </div>
            <p className="text-lg font-medium mb-2">Der Warenkorb ist leer</p>
            <p className="text-sm text-muted-foreground">Wählen Sie Artikel aus der Produktauswahl</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cart && cart.map((item, index) => (
              <div 
                key={item.id} 
                className="group bg-background/60 backdrop-blur-sm border border-border rounded-xl p-4 hover:shadow-md transition-all duration-200 hover:bg-background/80"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 mr-3">
                    <div className="font-semibold text-foreground text-sm leading-tight mb-1">
                      {item.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs px-2 py-1 bg-muted/80">
                        CHF {item.price.toFixed(2)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-primary/10 hover:text-primary rounded-md"
                        title="Preis bearbeiten"
                        onClick={() => onEditPrice(item)}
                        disabled={loading}
                      >
                        <Pencil size={12} />
                      </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-foreground text-base">
                      CHF {item.total.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center bg-muted rounded-lg p-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-md hover:bg-background hover:shadow-sm"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      disabled={loading}
                    >
                      <Minus size={14} />
                    </Button>
                    <span className="mx-3 font-semibold text-foreground min-w-[20px] text-center">
                      {item.quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-md hover:bg-background hover:shadow-sm"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      disabled={loading}
                    >
                      <Plus size={14} />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive rounded-lg"
                    title="Artikel entfernen"
                    onClick={() => onDeleteItem(item.id)}
                    disabled={loading}
                  >
                    <Trash2 size={16} />
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