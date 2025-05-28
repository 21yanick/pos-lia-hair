"use client"

import { CreditCard, Loader2, Minus, Pencil, Plus, Trash2, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
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
    <div className="w-full md:w-1/3 flex flex-col h-full bg-white rounded-md border border-gray-200">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-xl font-semibold flex items-center">
          <Wallet className="mr-2" size={20} />
          Warenkorb
          <span className="ml-2 text-sm bg-primary text-white rounded-full px-2 py-0.5">
            {cart.length}
          </span>
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {cart.length === 0 ? (
          <div className="text-center py-12 text-gray-500 flex flex-col items-center">
            <Wallet className="mb-2 text-gray-300" size={48} />
            <p>Der Warenkorb ist leer.</p>
            <p className="text-sm text-gray-400">Wählen Sie Artikel aus.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div 
                key={item.id} 
                className="flex flex-col p-3 border rounded-md hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium truncate mr-2" style={{ maxWidth: "calc(100% - 80px)" }}>
                    {item.name}
                  </div>
                  <div className="font-medium whitespace-nowrap">
                    CHF {item.total.toFixed(2)}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-sm text-gray-500 whitespace-nowrap mr-1">
                      CHF {item.price.toFixed(2)}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:bg-blue-50 hover:text-blue-600"
                      title="Preis bearbeiten"
                      onClick={() => onEditPrice(item)}
                      disabled={loading}
                    >
                      <Pencil size={14} />
                    </Button>
                  </div>

                  <div className="flex items-center">
                    <div className="flex items-center gap-1 border rounded-md overflow-hidden">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-none"
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={loading}
                      >
                        <Minus size={14} />
                      </Button>
                      <span className="w-8 text-center text-base font-medium">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-none"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={loading}
                      >
                        <Plus size={14} />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600 ml-1"
                      onClick={() => onDeleteItem(item.id)}
                      disabled={loading}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-between py-2">
          <span className="font-medium">Zwischensumme</span>
          <span>CHF {cartTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-3 text-xl font-bold">
          <span>Gesamtbetrag</span>
          <span>CHF {cartTotal.toFixed(2)}</span>
        </div>

        <Button
          className="w-full mt-4 py-5 md:py-6 text-base md:text-lg"
          size="lg"
          disabled={cart.length === 0 || loading}
          onClick={onCheckout}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Wird verarbeitet...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-5 w-5" />
              Bezahlen
            </>
          )}
        </Button>
      </div>
    </div>
  )
}