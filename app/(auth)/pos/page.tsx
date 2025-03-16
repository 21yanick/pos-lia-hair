"use client"

import { useState, useEffect } from "react"
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
import { Search, Trash2, Plus, Minus, Wallet, CreditCard, CheckCircle, Download, Mail, Pencil, Loader2, AlertCircle } from "lucide-react"
import { useItems } from "@/lib/hooks/useItems"
import { useTransactions, type CartItem } from "@/lib/hooks/useTransactions"
import { useRegisterStatus } from "@/lib/hooks/useRegisterStatus"
import { useToast } from "@/lib/hooks/useToast"

export default function POSPage() {
  // Hooks
  const { items, loading: itemsLoading, error: itemsError } = useItems()
  const { createTransaction, loading: transactionLoading, error: transactionError } = useTransactions()
  const { isOpen: isRegisterOpen, loading: registerLoading, error: registerError } = useRegisterStatus()
  const { toast } = useToast()
  
  // UI-State
  const [activeTab, setActiveTab] = useState("services")
  const [searchQuery, setSearchQuery] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"cash" | "twint" | "sumup" | null>(null)
  const [cashReceived, setCashReceived] = useState("")
  const [editingItem, setEditingItem] = useState<CartItem | null>(null)
  const [editPrice, setEditPrice] = useState("")
  const [transactionResult, setTransactionResult] = useState<{
    success: boolean,
    transaction?: any,
    change?: number,
    error?: string
  } | null>(null)

  // Fehlerbehandlung
  useEffect(() => {
    if (itemsError) {
      toast({
        title: "Fehler beim Laden der Produkte",
        description: itemsError,
        variant: "destructive",
      })
    }
    
    if (transactionError) {
      toast({
        title: "Fehler bei der Transaktion",
        description: transactionError,
        variant: "destructive",
      })
    }
    
    if (registerError) {
      toast({
        title: "Fehler beim Laden des Kassenstatus",
        description: registerError,
        variant: "destructive",
      })
    }
  }, [itemsError, transactionError, registerError, toast])

  // Filtern der Produkte/Dienstleistungen
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab =
      (activeTab === "services" && item.type === "service") ||
      (activeTab === "products" && item.type === "product") ||
      (activeTab === "favorites" && item.is_favorite)

    return matchesSearch && matchesTab && item.active // Nur aktive Items anzeigen
  })

  const addToCart = (item: typeof items[0]) => {
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
            price: item.default_price,
            quantity: 1,
            total: item.default_price,
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

  const handlePayment = async () => {
    try {
      // Transaktion erstellen
      const result = await createTransaction({
        total_amount: cartTotal,
        payment_method: selectedPaymentMethod!,
        items: cart,
        received_amount: selectedPaymentMethod === 'cash' && cashReceived ? Number.parseFloat(cashReceived) : undefined,
        notes: cart.length > 3 ? `${cart.length} Produkte/Dienstleistungen` : cart.map(item => item.name).join(', ')
      })

      console.log("Transaktionsergebnis:", result)
      
      // Transaktion speichern für Quittung und andere Informationen
      setTransactionResult(result)
      
      // Dialoge aktualisieren
      setIsPaymentDialogOpen(false)
      
      if (result.success) {
        // Warenkorb leeren nach erfolgreicher Transaktion
        setCart([])
        
        // Bestätigungsdialog anzeigen
        setIsConfirmationDialogOpen(true)
        
        toast({
          title: "Transaktion erfolgreich",
          description: `Zahlung über CHF ${cartTotal.toFixed(2)} wurde verbucht.`,
          variant: "default",
        })
      } else {
        toast({
          title: "Fehler bei der Transaktion",
          description: result.error || "Unbekannter Fehler",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      console.error("Fehler bei der Transaktion:", err)
      toast({
        title: "Fehler bei der Transaktion",
        description: err.message || "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      })
    }
  }

  const startNewSale = () => {
    setCart([])
    setSelectedPaymentMethod(null)
    setCashReceived("")
    setIsConfirmationDialogOpen(false)
    setTransactionResult(null)
  }

  const cashChange = selectedPaymentMethod === "cash" && cashReceived ? Number.parseFloat(cashReceived) - cartTotal : 0

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] gap-4">
      {/* Warnung, wenn Kasse nicht geöffnet ist */}
      {!registerLoading && !isRegisterOpen && (
        <div className="w-full bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
          <h2 className="font-semibold text-yellow-800 flex items-center">
            <AlertCircle className="mr-2" size={18} />
            Kasse ist geschlossen
          </h2>
          <p className="text-yellow-700 mt-1">
            Die Kasse ist derzeit geschlossen. Bitte öffnen Sie zuerst die Kasse auf dem Dashboard, 
            bevor Sie Transaktionen durchführen.
          </p>
          <Button 
            variant="outline" 
            className="mt-2 bg-yellow-100 hover:bg-yellow-200 border-yellow-300"
            onClick={() => window.location.href = "/dashboard"}
          >
            Zum Dashboard
          </Button>
        </div>
      )}
      
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
          {itemsLoading ? (
            <div className="col-span-full flex justify-center items-center py-10">
              <Loader2 size={30} className="animate-spin mr-2" />
              <span>Produkte werden geladen...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <Card
                  key={item.id}
                  className="cursor-pointer hover:border-blue-300 transition-colors"
                  onClick={() => addToCart(item)}
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center h-32">
                    <div className="font-medium text-center mb-2">{item.name}</div>
                    <div className="text-lg font-bold">CHF {item.default_price.toFixed(2)}</div>
                    {item.is_favorite && <span className="text-yellow-500 text-xs mt-1">⭐ Favorit</span>}
                  </CardContent>
                </Card>
              ))}

              {!itemsLoading && filteredItems.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">Keine Einträge gefunden.</div>
              )}
            </div>
          )}
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
                        disabled={transactionLoading}
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
                      disabled={transactionLoading}
                    >
                      <Minus size={14} />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={transactionLoading}
                    >
                      <Plus size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500"
                      onClick={() => removeFromCart(item.id)}
                      disabled={transactionLoading}
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
            disabled={cart.length === 0 || transactionLoading || !isRegisterOpen}
            onClick={() => setIsPaymentDialogOpen(true)}
          >
            {transactionLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird verarbeitet...
              </>
            ) : !isRegisterOpen ? (
              "Kasse geschlossen"
            ) : (
              "Bezahlen"
            )}
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
                transactionLoading ||
                !selectedPaymentMethod ||
                (selectedPaymentMethod === "cash" && (!cashReceived || Number.parseFloat(cashReceived) < cartTotal))
              }
            >
              {transactionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird verarbeitet...
                </>
              ) : (
                "Zahlung abschließen"
              )}
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
                {selectedPaymentMethod === "cash" && transactionResult && (
                  <>
                    <div className="flex justify-between mb-2">
                      <span>Erhalten:</span>
                      <span className="font-medium">CHF {Number.parseFloat(cashReceived).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rückgeld:</span>
                      <span className="font-medium">CHF {(transactionResult.change || 0).toFixed(2)}</span>
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

