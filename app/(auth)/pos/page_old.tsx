"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
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
import { useItems } from "@/lib/hooks/business/useItems"
import { useSales, type CartItem } from "@/lib/hooks/business/useSales"
import { useToast } from "@/lib/hooks/core/useToast"

export default function POSPage() {
  // Hooks
  const { items, loading: itemsLoading, error: itemsError } = useItems()
  const { createSale, loading: transactionLoading, error: transactionError } = useSales()
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
    receiptUrl?: string,
    error?: string
  } | null>(null)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)

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
    
    // Register error removed - simplified workflow
  }, [itemsError, transactionError, toast])

  // Filtern der Produkte/Dienstleistungen
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab =
      (activeTab === "services" && item.type === "service") ||
      (activeTab === "products" && item.type === "product") ||
      (activeTab === "favorites" && item.is_favorite)

    return matchesSearch && matchesTab && item.active // Nur aktive Items anzeigen
  })

  // Korrigierte addToCart-Funktion
  const addToCart = (item: typeof items[0]) => {
    setCart((prevCart) => {
      // Finde das Item, falls es bereits im Warenkorb ist
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id)
      
      if (existingItem) {
        // Wenn das Item bereits existiert, erhöhe die Menge um 1
        return prevCart.map(cartItem => 
          cartItem.id === item.id 
            ? {
                ...cartItem,
                quantity: cartItem.quantity + 1,
                total: (cartItem.quantity + 1) * cartItem.price
              } 
            : cartItem
        )
      } else {
        // Item hinzufügen, wenn es noch nicht im Warenkorb ist
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

  const openDeleteConfirmation = (itemId: string) => {
    setItemToDelete(itemId)
  }

  const handleDeleteConfirmed = () => {
    if (itemToDelete) {
      setCart((prevCart) => prevCart.filter((item) => item.id !== itemToDelete))
      setItemToDelete(null)
    }
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
      const result = await createSale({
        total_amount: cartTotal,
        payment_method: selectedPaymentMethod!,
        items: cart,
        received_amount: selectedPaymentMethod === 'cash' && cashReceived ? Number.parseFloat(cashReceived) : undefined,
        notes: cart.length > 3 ? `${cart.length} Produkte/Dienstleistungen` : cart.map(item => item.name).join(', ')
      })
      
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

  // Automatisch Rückgeld berechnen
  useEffect(() => {
    if (selectedPaymentMethod === "cash" && cashReceived) {
      const receivedAmount = Number.parseFloat(cashReceived)
      if (!isNaN(receivedAmount)) {
        // Hier passiert nichts, da die Berechnung bereits direkt im Render stattfindet
        // Die Variable cashChange wird bereits oben definiert und aktualisiert sich automatisch
      }
    }
  }, [selectedPaymentMethod, cashReceived, cartTotal])

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-4">
      {/* Note: Register status check removed - simplified workflow */}
      
      {/* Universal Layout für alle Bildschirmgrößen */}
      <div className="flex flex-col md:flex-row h-full">
        {/* Left side - Products/Services */}
        <div className="w-full md:w-2/3 flex flex-col h-full md:pr-4 mb-4 md:mb-0">
          <div className="mb-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Suche nach Produkten oder Dienstleistungen..."
                className="pl-10 h-12 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setSearchQuery("")}
                >
                  <Trash2 size={16} />
                </Button>
              )}
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList className="w-full h-12 grid grid-cols-3">
                <TabsTrigger value="services" className="text-base px-4 py-2">Dienstleistungen</TabsTrigger>
                <TabsTrigger value="products" className="text-base px-4 py-2">Produkte</TabsTrigger>
                <TabsTrigger value="favorites" className="text-base px-4 py-2">Favoriten</TabsTrigger>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {filteredItems.map((item) => (
                  <Card
                    key={item.id}
                    className={`cursor-pointer hover:shadow-md transition-all ${
                      item.type === "service" 
                        ? "bg-blue-50 hover:border-blue-300" 
                        : "bg-green-50 hover:border-green-300"
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      addToCart(item);
                    }}
                  >
                    <CardContent className="p-3 md:p-4 flex flex-col items-center justify-center h-auto min-h-[120px] md:min-h-[140px]">
                      <div className="absolute top-2 right-2">
                        {item.is_favorite && <span className="text-yellow-500 text-xs">⭐</span>}
                      </div>
                      
                      <div className={`text-xs font-medium uppercase mb-1 ${
                        item.type === "service" ? "text-blue-600" : "text-green-600"
                      }`}>
                        {item.type === "service" ? 
                          (window.innerWidth < 640 ? "Dienstl." : "Dienstleistung") : 
                          "Produkt"}
                      </div>
                      
                      <div className="font-medium text-center mb-2 line-clamp-2 w-full overflow-hidden text-sm md:text-base">
                        {item.name}
                      </div>
                      <div className="text-base md:text-lg font-bold">CHF {item.default_price.toFixed(2)}</div>
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
                          onClick={() => openEditPriceDialog(item)}
                          disabled={transactionLoading}
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
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={transactionLoading}
                          >
                            <Minus size={14} />
                          </Button>
                          <span className="w-8 text-center text-base font-medium">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-none"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={transactionLoading}
                          >
                            <Plus size={14} />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600 ml-1"
                          onClick={() => openDeleteConfirmation(item.id)}
                          disabled={transactionLoading}
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
              disabled={cart.length === 0 || transactionLoading}
              onClick={() => setIsPaymentDialogOpen(true)}
            >
              {transactionLoading ? (
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
      </div>

      {/* Edit Price Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <Pencil className="mr-2" size={20} />
              Preis bearbeiten
            </DialogTitle>
            <DialogDescription className="text-base">
              Passen Sie den Preis für <span className="font-medium">{editingItem?.name}</span> an.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <div className="space-y-4">
              <Label htmlFor="price" className="text-base">Preis (CHF)</Label>
              <Input
                id="price"
                type="number"
                step="0.05"
                min="0"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                className="text-xl py-6"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setEditingItem(null)}
              className="py-6 text-base w-full sm:w-auto"
            >
              Abbrechen
            </Button>
            <Button 
              onClick={saveEditedPrice}
              className="py-6 text-base w-full sm:w-auto"
            >
              <CheckCircle className="mr-2" size={18} />
              Preis speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <CreditCard className="mr-2" />
              Zahlung
            </DialogTitle>
            <DialogDescription>Wählen Sie die Zahlungsmethode und schließen Sie den Verkauf ab.</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Button
                variant={selectedPaymentMethod === "cash" ? "default" : "outline"}
                className={`flex flex-col items-center justify-center h-28 rounded-lg transition-all ${
                  selectedPaymentMethod === "cash" ? "ring-2 ring-primary shadow-md" : ""
                }`}
                onClick={() => setSelectedPaymentMethod("cash")}
              >
                <Wallet className="mb-2" size={28} />
                <span className="text-base">Bar</span>
              </Button>
              <Button
                variant={selectedPaymentMethod === "twint" ? "default" : "outline"}
                className={`flex flex-col items-center justify-center h-28 rounded-lg transition-all ${
                  selectedPaymentMethod === "twint" ? "ring-2 ring-primary shadow-md" : ""
                }`}
                onClick={() => setSelectedPaymentMethod("twint")}
              >
                <svg 
                  className="mb-2" 
                  width="28" 
                  height="28" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M5 7v10h14V7H5z" fill={selectedPaymentMethod === "twint" ? "white" : "currentColor"} />
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM7.5 12c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zm4.5 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm0-6c-.83 0-1.5-.67-1.5-1.5S11.17 7.5 12 7.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5 6c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" fill={selectedPaymentMethod === "twint" ? "white" : "currentColor"} />
                </svg>
                <span className="text-base">Twint</span>
              </Button>
              <Button
                variant={selectedPaymentMethod === "sumup" ? "default" : "outline"}
                className={`flex flex-col items-center justify-center h-28 rounded-lg transition-all ${
                  selectedPaymentMethod === "sumup" ? "ring-2 ring-primary shadow-md" : ""
                }`}
                onClick={() => setSelectedPaymentMethod("sumup")}
              >
                <CreditCard className="mb-2" size={28} />
                <span className="text-base">SumUp</span>
              </Button>
            </div>

            {selectedPaymentMethod === "cash" && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="cash-received" className="text-base">Erhaltener Betrag (CHF)</Label>
                  <Input
                    id="cash-received"
                    type="number"
                    step="0.05"
                    min={cartTotal}
                    placeholder="0.00"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    className="text-lg py-6"
                  />
                </div>

                {cashReceived && Number.parseFloat(cashReceived) >= cartTotal && (
                  <div className="flex justify-between p-3 bg-green-100 rounded-lg border border-green-200">
                    <span className="font-medium text-green-800">Rückgeld:</span>
                    <span className="font-bold text-green-800">CHF {cashChange.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">Gesamtbetrag:</span>
                <span className="font-bold text-xl">CHF {cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)} className="w-full sm:w-auto text-base py-6">
              Abbrechen
            </Button>
            <Button
              onClick={handlePayment}
              disabled={
                transactionLoading ||
                !selectedPaymentMethod ||
                (selectedPaymentMethod === "cash" && (!cashReceived || Number.parseFloat(cashReceived) < cartTotal))
              }
              className="w-full sm:w-auto text-base py-6"
            >
              {transactionLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Wird verarbeitet...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2" size={18} />
                  Zahlung abschließen
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmationDialogOpen} onOpenChange={setIsConfirmationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center text-center text-xl">
              <CheckCircle className="text-green-500 mr-2" size={28} />
              Zahlung erfolgreich
            </DialogTitle>
          </DialogHeader>

          <div className="py-6">
            <div className="space-y-6">
              <div className="p-5 bg-green-50 rounded-lg border border-green-200">
                <div className="mb-4 pb-2 border-b border-green-200">
                  <h3 className="font-semibold text-green-800">Transaktionsdetails</h3>
                </div>
                
                <div className="flex justify-between mb-3">
                  <span>Zahlungsmethode:</span>
                  <span className="font-medium">
                    {selectedPaymentMethod === "cash" && "Barzahlung"}
                    {selectedPaymentMethod === "twint" && "Twint"}
                    {selectedPaymentMethod === "sumup" && "SumUp (Karte)"}
                  </span>
                </div>
                <div className="flex justify-between mb-3">
                  <span>Betrag:</span>
                  <span className="font-medium">CHF {cartTotal.toFixed(2)}</span>
                </div>
                {selectedPaymentMethod === "cash" && transactionResult && (
                  <>
                    <div className="flex justify-between mb-3">
                      <span>Erhalten:</span>
                      <span className="font-medium">CHF {Number.parseFloat(cashReceived).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-1 pt-2 border-t border-green-200">
                      <span>Rückgeld:</span>
                      <span className="font-bold">CHF {(transactionResult.change || 0).toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="flex items-center justify-center py-6 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                  onClick={() => {
                    if (transactionResult?.receiptUrl) {
                      console.log('Opening PDF URL:', transactionResult.receiptUrl)
                      window.open(transactionResult.receiptUrl, '_blank')
                    } else {
                      console.error('No receipt URL available:', transactionResult)
                      toast({
                        title: "PDF nicht verfügbar",
                        description: "Die Quittung konnte nicht erstellt werden.",
                        variant: "destructive",
                      })
                    }
                  }}
                  disabled={!transactionResult?.receiptUrl}
                >
                  <Download className="mr-2" size={20} />
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-normal">Herunterladen</span>
                    <span className="text-xs text-blue-600">PDF Quittung</span>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center justify-center py-6 bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                  onClick={() => {
                    toast({
                      title: "E-Mail-Versand",
                      description: "E-Mail-Funktion noch nicht implementiert.",
                    })
                  }}
                >
                  <Mail className="mr-2" size={20} />
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-normal">Per E-Mail</span>
                    <span className="text-xs text-purple-600">Senden</span>
                  </div>
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={startNewSale} className="w-full py-6 text-lg">
              <CheckCircle className="mr-2" size={20} />
              Neuer Verkauf starten
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl">
              <Trash2 className="text-red-500 mr-2" size={20} />
              Artikel aus Warenkorb entfernen
            </DialogTitle>
            <DialogDescription>
              Möchten Sie diesen Artikel wirklich aus dem Warenkorb entfernen?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setItemToDelete(null)}
              className="w-full sm:w-auto"
            >
              Abbrechen
            </Button>
            <Button 
              onClick={handleDeleteConfirmed}
              variant="destructive"
              className="w-full sm:w-auto"
            >
              <Trash2 className="mr-2" size={16} />
              Entfernen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}