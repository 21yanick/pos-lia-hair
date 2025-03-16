"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, Trash2, Plus, Minus, Wallet, CreditCard, CheckCircle, Download, Mail, Pencil } from "lucide-react"

// Mock data
const mockItems = [
  { id: "1", name: "Damen Haarschnitt", type: "service", price: 65.0, isFavorite: true },
  { id: "2", name: "Herren Haarschnitt", type: "service", price: 45.0, isFavorite: true },
  { id: "3", name: "Kinder Haarschnitt", type: "service", price: 35.0, isFavorite: false },
  { id: "4", name: "Färben", type: "service", price: 85.0, isFavorite: true },
  { id: "5", name: "Strähnen", type: "service", price: 95.0, isFavorite: false },
  { id: "6", name: "Shampoo", type: "product", price: 18.5, isFavorite: false },
  { id: "7", name: "Conditioner", type: "product", price: 16.5, isFavorite: false },
  { id: "8", name: "Haarspray", type: "product", price: 22.0, isFavorite: true },
  { id: "9", name: "Styling Gel", type: "product", price: 19.5, isFavorite: false },
]

type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
  total: number
}

export default function POSPage() {
  const [activeTab, setActiveTab] = useState("services")
  const [searchQuery, setSearchQuery] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"cash" | "twint" | "sumup" | null>(null)
  const [cashReceived, setCashReceived] = useState("")
  const [editingItem, setEditingItem] = useState<CartItem | null>(null)
  const [editPrice, setEditPrice] = useState("")

  const filteredItems = mockItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab =
      (activeTab === "services" && item.type === "service") ||
      (activeTab === "products" && item.type === "product") ||
      (activeTab === "favorites" && item.isFavorite)

    return matchesSearch && matchesTab
  })

  const addToCart = (item: (typeof mockItems)[0]) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((cartItem) => cartItem.id === item.id)

      if (existingItemIndex >= 0) {
        // Item already in cart, increase quantity
        const updatedCart = [...prevCart]
        updatedCart[existingItemIndex].quantity += 1
        updatedCart[existingItemIndex].total =
          updatedCart[existingItemIndex].quantity * updatedCart[existingItemIndex].price
        return updatedCart
      } else {
        // Add new item to cart
        return [
          ...prevCart,
          {
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1,
            total: item.price,
          },
        ]
      }
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId))
  }

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            quantity: newQuantity,
            total: newQuantity * item.price,
          }
        }
        return item
      })
    })
  }

  const openEditPriceDialog = (item: CartItem) => {
    setEditingItem(item)
    setEditPrice(item.price.toString())
  }

  const saveEditedPrice = () => {
    if (!editingItem) return

    const newPrice = Number.parseFloat(editPrice)
    if (isNaN(newPrice) || newPrice <= 0) return

    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.id === editingItem.id) {
          return {
            ...item,
            price: newPrice,
            total: item.quantity * newPrice,
          }
        }
        return item
      })
    })
    setEditingItem(null)
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0)

  const handlePayment = () => {
    // Here would be the API call to process the payment
    console.log("Processing payment with method:", selectedPaymentMethod)
    setIsPaymentDialogOpen(false)
    setIsConfirmationDialogOpen(true)
  }

  const startNewSale = () => {
    setCart([])
    setSelectedPaymentMethod(null)
    setCashReceived("")
    setIsConfirmationDialogOpen(false)
  }

  const cashChange = selectedPaymentMethod === "cash" && cashReceived ? Number.parseFloat(cashReceived) - cartTotal : 0

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] gap-4">
      {/* Left side - Products/Services */}
      <div className="md:w-2/3 flex flex-col h-full">
        <div className="mb-4 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Suche nach Produkten oder Dienstleistungen..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
            <TabsList>
              <TabsTrigger value="services">Dienstleistungen</TabsTrigger>
              <TabsTrigger value="products">Produkte</TabsTrigger>
              <TabsTrigger value="favorites">Favoriten</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex-1 overflow-y-auto bg-white rounded-md border border-gray-200 p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className="cursor-pointer hover:border-blue-300 transition-colors"
                onClick={() => addToCart(item)}
              >
                <CardContent className="p-4 flex flex-col items-center justify-center h-32">
                  <div className="font-medium text-center mb-2">{item.name}</div>
                  <div className="text-lg font-bold">CHF {item.price.toFixed(2)}</div>
                </CardContent>
              </Card>
            ))}

            {filteredItems.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">Keine Einträge gefunden.</div>
            )}
          </div>
        </div>
      </div>

      {/* Right side - Cart */}
      <div className="md:w-1/3 flex flex-col h-full bg-white rounded-md border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Warenkorb</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Der Warenkorb ist leer.</div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-500 flex items-center">
                      CHF {item.price.toFixed(2)}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-1"
                        onClick={() => openEditPriceDialog(item)}
                      >
                        <Pencil size={12} />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus size={14} />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>

                  <div className="w-24 text-right font-medium">CHF {item.total.toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex justify-between py-2">
            <span className="font-medium">Zwischensumme</span>
            <span>CHF {cartTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 text-lg font-bold">
            <span>Gesamtbetrag</span>
            <span>CHF {cartTotal.toFixed(2)}</span>
          </div>

          <Button
            className="w-full mt-4"
            size="lg"
            disabled={cart.length === 0}
            onClick={() => setIsPaymentDialogOpen(true)}
          >
            Bezahlen
          </Button>
        </div>
      </div>

      {/* Edit Price Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Preis bearbeiten</DialogTitle>
            <DialogDescription>Passen Sie den Preis für {editingItem?.name} an.</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preis (CHF)</Label>
              <Input
                id="price"
                type="number"
                step="0.05"
                min="0"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>
              Abbrechen
            </Button>
            <Button onClick={saveEditedPrice}>Speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Zahlung</DialogTitle>
            <DialogDescription>Wählen Sie die Zahlungsmethode und schließen Sie den Verkauf ab.</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <Button
                variant={selectedPaymentMethod === "cash" ? "default" : "outline"}
                className="flex flex-col items-center justify-center h-24"
                onClick={() => setSelectedPaymentMethod("cash")}
              >
                <Wallet className="mb-2" />
                <span>Bar</span>
              </Button>
              <Button
                variant={selectedPaymentMethod === "twint" ? "default" : "outline"}
                className="flex flex-col items-center justify-center h-24"
                onClick={() => setSelectedPaymentMethod("twint")}
              >
                <Wallet className="mb-2" />
                <span>Twint</span>
              </Button>
              <Button
                variant={selectedPaymentMethod === "sumup" ? "default" : "outline"}
                className="flex flex-col items-center justify-center h-24"
                onClick={() => setSelectedPaymentMethod("sumup")}
              >
                <CreditCard className="mb-2" />
                <span>SumUp</span>
              </Button>
            </div>

            {selectedPaymentMethod === "cash" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cash-received">Erhaltener Betrag (CHF)</Label>
                  <Input
                    id="cash-received"
                    type="number"
                    step="0.05"
                    min={cartTotal}
                    placeholder="0.00"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                  />
                </div>

                {cashReceived && Number.parseFloat(cashReceived) >= cartTotal && (
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>Rückgeld:</span>
                    <span className="font-bold">CHF {cashChange.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 p-3 bg-gray-50 rounded">
              <div className="flex justify-between font-bold">
                <span>Gesamtbetrag:</span>
                <span>CHF {cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button
              onClick={handlePayment}
              disabled={
                !selectedPaymentMethod ||
                (selectedPaymentMethod === "cash" && (!cashReceived || Number.parseFloat(cashReceived) < cartTotal))
              }
            >
              Zahlung abschließen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmationDialogOpen} onOpenChange={setIsConfirmationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center text-center">
              <CheckCircle className="text-green-500 mr-2" size={24} />
              Zahlung erfolgreich
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded">
                <div className="flex justify-between mb-2">
                  <span>Zahlungsmethode:</span>
                  <span className="font-medium">
                    {selectedPaymentMethod === "cash" && "Bar"}
                    {selectedPaymentMethod === "twint" && "Twint"}
                    {selectedPaymentMethod === "sumup" && "SumUp"}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Betrag:</span>
                  <span className="font-medium">CHF {cartTotal.toFixed(2)}</span>
                </div>
                {selectedPaymentMethod === "cash" && (
                  <>
                    <div className="flex justify-between mb-2">
                      <span>Erhalten:</span>
                      <span className="font-medium">CHF {Number.parseFloat(cashReceived).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rückgeld:</span>
                      <span className="font-medium">CHF {cashChange.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-col space-y-2">
                <Button variant="outline" className="flex items-center justify-center">
                  <Download className="mr-2" size={16} />
                  Quittung herunterladen
                </Button>
                <Button variant="outline" className="flex items-center justify-center">
                  <Mail className="mr-2" size={16} />
                  Quittung per E-Mail senden
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={startNewSale} className="w-full">
              Neuer Verkauf
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

