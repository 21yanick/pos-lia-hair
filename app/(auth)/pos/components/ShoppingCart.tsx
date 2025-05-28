"use client"

import { CreditCard, Loader2, Minus, Pencil, Plus, Trash2, ShoppingBag, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { CartItem } from "@/lib/hooks/business/useSales"

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
  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0)

  return (
    <div className="w-full md:w-1/3 flex flex-col h-full bg-gradient-to-br from-gray-50/50 to-white rounded-2xl border border-gray-200/60 shadow-sm backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-t-2xl">
        <h2 className="text-xl font-bold flex items-center text-gray-800">
          <div className="mr-3 p-2 bg-blue-100/70 rounded-xl">
            <ShoppingBag className="text-blue-600" size={20} />
          </div>
          Warenkorb
          {cart.length > 0 && (
            <Badge className="ml-3 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1">
              {cart.length}
            </Badge>
          )}
        </h2>
      </div>

      {/* Das URSPRÜNGLICHE Layout: flex-1 + overflow-y-auto */}
      <div className="flex-1 overflow-y-auto p-4">
        {cart.length === 0 ? (
          <div className="text-center py-16 text-gray-500 flex flex-col items-center">
            <div className="p-4 bg-gray-100/70 rounded-full mb-4">
              <ShoppingBag className="text-gray-400" size={32} />
            </div>
            <p className="text-lg font-medium mb-2">Der Warenkorb ist leer</p>
            <p className="text-sm text-gray-400">Wählen Sie Artikel aus der Produktauswahl</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map((item, index) => (
              <div 
                key={item.id} 
                className="group bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl p-4 hover:shadow-md transition-all duration-200 hover:bg-white/80"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 mr-3">
                    <div className="font-semibold text-gray-800 text-sm leading-tight mb-1">
                      {item.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs px-2 py-1 bg-gray-50/80">
                        CHF {item.price.toFixed(2)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-blue-50 hover:text-blue-600 rounded-md"
                        title="Preis bearbeiten"
                        onClick={() => onEditPrice(item)}
                        disabled={loading}
                      >
                        <Pencil size={12} />
                      </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-800 text-base">
                      CHF {item.total.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center bg-gray-100/70 rounded-lg p-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-md hover:bg-white hover:shadow-sm"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      disabled={loading}
                    >
                      <Minus size={14} />
                    </Button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-md hover:bg-white hover:shadow-sm"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      disabled={loading}
                    >
                      <Plus size={14} />
                    </Button>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg"
                    onClick={() => onDeleteItem(item.id)}
                    disabled={loading}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer - fest unten */}
      <div className="p-4 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-blue-50/30 rounded-b-2xl backdrop-blur-sm">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">Zwischensumme</span>
            <span className="text-gray-800 font-semibold">CHF {cartTotal.toFixed(2)}</span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center py-1">
            <span className="text-lg font-bold text-gray-800">Gesamtbetrag</span>
            <span className="text-xl font-bold text-blue-600">CHF {cartTotal.toFixed(2)}</span>
          </div>

          <Button
            className="w-full mt-4 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] rounded-xl"
            size="lg"
            disabled={cart.length === 0 || loading}
            onClick={onCheckout}
          >
            {loading ? (
              <>
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                Wird verarbeitet...
              </>
            ) : (
              <>
                <Zap className="mr-3 h-5 w-5" />
                Zur Kasse ({cart.length} Artikel)
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}