"use client"

import { useState, useEffect } from "react"
import { useItems } from "@/lib/hooks/business/useItems"
import { useSales, type CartItem, type CreateSaleData } from "@/lib/hooks/business/useSales"
import { useToast } from "@/lib/hooks/core/useToast"
import { usePOSState } from "@/lib/hooks/business/usePOSState"

// Komponenten
import { ProductGrid } from "./components/ProductGrid"
import { ShoppingCart } from "./components/ShoppingCart"
import { PaymentDialog } from "./components/PaymentDialog"
import { ConfirmationDialog } from "./components/ConfirmationDialog"
import { EditPriceDialog } from "./components/EditPriceDialog"
import { DeleteConfirmDialog } from "./components/DeleteConfirmDialog"

// Utils
import {
  addItemToCart,
  updateCartItemQuantity,
  updateCartItemPrice,
  removeItemFromCart,
  calculateCartTotal,
} from "./utils/posHelpers"

export default function POSPage() {
  // Business Hooks (bestehende Architektur)
  const { items, loading: itemsLoading, error: itemsError } = useItems()
  const { createSale, loading: transactionLoading, error: transactionError } = useSales()
  const { toast } = useToast()
  
  // UI State Hook (neu)
  const {
    // Tab & Search
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    clearSearch,
    
    // Dialogs
    isPaymentDialogOpen,
    openPaymentDialog,
    closePaymentDialog,
    
    isConfirmationDialogOpen,
    openConfirmationDialog,
    closeConfirmationDialog,
    
    editingItem,
    openEditPriceDialog,
    closeEditPriceDialog,
    
    itemToDelete,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    
    // Payment
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    cashReceived,
    setCashReceived,
    editPrice,
    setEditPrice,
    
    // Transaction Result
    transactionResult,
    setTransactionResult,
    
    // Helpers
    startNewSale,
  } = usePOSState()

  // Warenkorb State (bleibt Business Logic)
  const [cart, setCart] = useState<CartItem[]>([])

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
  }, [itemsError, transactionError, toast])

  // Cart Handler Functions
  const handleAddToCart = (item: typeof items[0]) => {
    setCart(prevCart => addItemToCart(prevCart, item))
  }

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    setCart(prevCart => updateCartItemQuantity(prevCart, itemId, newQuantity))
  }

  const handleEditPrice = (item: CartItem) => {
    openEditPriceDialog(item)
  }

  const handleSaveEditedPrice = () => {
    if (!editingItem) return

    const newPrice = Number.parseFloat(editPrice)
    if (isNaN(newPrice) || newPrice <= 0) return

    setCart(prevCart => updateCartItemPrice(prevCart, editingItem.id, newPrice))
    closeEditPriceDialog()
  }

  const handleDeleteItem = (itemId: string) => {
    openDeleteConfirmation(itemId)
  }

  const handleDeleteConfirmed = () => {
    if (itemToDelete) {
      setCart(prevCart => removeItemFromCart(prevCart, itemToDelete))
      closeDeleteConfirmation()
    }
  }

  // Payment Handler
  const handlePayment = async (data: CreateSaleData) => {
    try {
      const result = await createSale(data)
      
      setTransactionResult(result)
      closePaymentDialog()
      
      if (result.success) {
        // Warenkorb leeren nach erfolgreicher Transaktion
        setCart([])
        
        // Bestätigungsdialog anzeigen
        openConfirmationDialog()
        
        toast({
          title: "Transaktion erfolgreich",
          description: `Zahlung über CHF ${data.total_amount.toFixed(2)} wurde verbucht.`,
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

  const handleStartNewSale = () => {
    setCart([])
    startNewSale()
  }

  const cartTotal = calculateCartTotal(cart)

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-4">
      {/* Universal Layout für alle Bildschirmgrößen */}
      <div className="flex flex-col md:flex-row h-full">
        
        {/* Left side - Products/Services */}
        <ProductGrid
          activeTab={activeTab}
          searchQuery={searchQuery}
          onTabChange={setActiveTab}
          onSearchChange={setSearchQuery}
          onClearSearch={clearSearch}
          onAddToCart={handleAddToCart}
        />

        {/* Right side - Cart */}
        <ShoppingCart
          cart={cart}
          loading={transactionLoading}
          onUpdateQuantity={handleUpdateQuantity}
          onEditPrice={handleEditPrice}
          onDeleteItem={handleDeleteItem}
          onCheckout={openPaymentDialog}
        />
      </div>

      {/* Edit Price Dialog */}
      <EditPriceDialog
        isOpen={!!editingItem}
        editingItem={editingItem}
        editPrice={editPrice}
        onEditPriceChange={setEditPrice}
        onSave={handleSaveEditedPrice}
        onClose={closeEditPriceDialog}
      />

      {/* Payment Dialog */}
      <PaymentDialog
        isOpen={isPaymentDialogOpen}
        cartTotal={cartTotal}
        cartItems={cart}
        selectedPaymentMethod={selectedPaymentMethod}
        cashReceived={cashReceived}
        loading={transactionLoading}
        onPaymentMethodChange={setSelectedPaymentMethod}
        onCashReceivedChange={setCashReceived}
        onPayment={handlePayment}
        onClose={closePaymentDialog}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmationDialogOpen}
        selectedPaymentMethod={selectedPaymentMethod}
        cashReceived={cashReceived}
        cartTotal={cartTotal}
        transactionResult={transactionResult}
        onStartNewSale={handleStartNewSale}
        onClose={closeConfirmationDialog}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={!!itemToDelete}
        onConfirm={handleDeleteConfirmed}
        onClose={closeDeleteConfirmation}
      />
    </div>
  )
}