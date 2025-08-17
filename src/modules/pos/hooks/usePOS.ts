'use client'

import { useCallback, useMemo, useState } from 'react'
import type { Item } from '@/shared/hooks/business/useItems'
import { useItems } from '@/shared/hooks/business/useItems'
import { usePOSState } from '@/shared/hooks/business/usePOSState'
import type { CartItem, CreateSaleData } from '@/shared/hooks/business/useSales'
import { useSales } from '@/shared/hooks/business/useSales'

// Warenkorb-Logik Hook (optimized with useCallback)
function useCart() {
  const [cart, setCart] = useState<CartItem[]>([])

  const addToCart = useCallback((item: Item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id)

      if (existingItem) {
        // Item bereits im Warenkorb -> Menge erhöhen
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? {
                ...cartItem,
                quantity: cartItem.quantity + 1,
                total: cartItem.price * (cartItem.quantity + 1),
              }
            : cartItem
        )
      } else {
        // Neues Item zum Warenkorb hinzufügen
        const newCartItem: CartItem = {
          id: item.id,
          name: item.name,
          price: item.default_price,
          quantity: 1,
          total: item.default_price,
        }
        return [...prevCart, newCartItem]
      }
    })
  }, [])

  const updateQuantity = useCallback((itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart((prevCart) => prevCart.filter((item) => item.id !== itemId))
      return
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: newQuantity,
              total: item.price * newQuantity,
            }
          : item
      )
    )
  }, [])

  const updatePrice = useCallback((itemId: string, newPrice: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === itemId
          ? {
              ...item,
              price: newPrice,
              total: newPrice * item.quantity,
            }
          : item
      )
    )
  }, [])

  const removeFromCart = useCallback((itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId))
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
  }, [])

  const getCartTotal = useCallback(() => {
    return cart.reduce((sum, item) => sum + item.total, 0)
  }, [cart])

  return useMemo(
    () => ({
      cart,
      addToCart,
      updateQuantity,
      updatePrice,
      removeFromCart,
      clearCart,
      getCartTotal,
    }),
    [cart, addToCart, updateQuantity, updatePrice, removeFromCart, clearCart, getCartTotal]
  )
}

// Hauptorchestrator Hook für das gesamte POS System
export function usePOS() {
  const posState = usePOSState()
  const sales = useSales()
  const { items, loading: itemsLoading } = useItems()
  const cart = useCart()

  // Memoized cart total to prevent recalculation on every render
  const cartTotal = useMemo(() => cart.getCartTotal(), [cart.getCartTotal])

  // Kombinierte Funktionen für POS-spezifische Workflows (memoized)
  const handleAddToCart = useCallback(
    (item: Item) => {
      cart.addToCart(item)
    },
    [cart.addToCart]
  )

  const handleUpdateQuantity = useCallback(
    (itemId: string, newQuantity: number) => {
      cart.updateQuantity(itemId, newQuantity)
    },
    [cart.updateQuantity]
  )

  const handleEditPrice = useCallback(
    (item: CartItem) => {
      posState.openEditPriceDialog(item)
    },
    [posState.openEditPriceDialog]
  )

  const handleSaveEditedPrice = useCallback(() => {
    if (posState.editingItem && posState.editPrice) {
      const newPrice = parseFloat(posState.editPrice)
      if (newPrice > 0) {
        cart.updatePrice(posState.editingItem.id, newPrice)
      }
    }
    posState.closeEditPriceDialog()
  }, [posState.editingItem, posState.editPrice, cart.updatePrice, posState.closeEditPriceDialog])

  const handleDeleteItem = useCallback(
    (itemId: string) => {
      posState.openDeleteConfirmation(itemId)
    },
    [posState.openDeleteConfirmation]
  )

  const handleConfirmDelete = useCallback(() => {
    if (posState.itemToDelete) {
      cart.removeFromCart(posState.itemToDelete)
    }
    posState.closeDeleteConfirmation()
  }, [posState.itemToDelete, cart.removeFromCart, posState.closeDeleteConfirmation])

  const handleCheckout = useCallback(() => {
    if (cart.cart.length === 0) return
    posState.openPaymentDialog()
  }, [cart.cart.length, posState.openPaymentDialog])

  const handlePayment = useCallback(
    async (data: CreateSaleData) => {
      const result = await sales.createSale(data)

      if (result.success) {
        // Speichere alle notwendigen Daten für den ConfirmationDialog
        posState.setTransactionResult({
          success: true,
          transaction: result.sale,
          change: result.change,
          receiptUrl: result.receiptUrl,
          amount: cartTotal,
          paymentMethod: posState.selectedPaymentMethod || undefined,
          cashReceived:
            posState.selectedPaymentMethod === 'cash'
              ? parseFloat(posState.cashReceived)
              : undefined,
        })
        posState.closePaymentDialog()
        posState.openConfirmationDialog()
        cart.clearCart()
      } else {
        posState.setTransactionResult({
          success: false,
          error: result.error,
        })
      }
    },
    [sales.createSale, cartTotal, posState, cart.clearCart]
  )

  const handleStartNewSale = useCallback(() => {
    posState.startNewSale()
    cart.clearCart()
  }, [posState.startNewSale, cart.clearCart])

  // Memoized return object to prevent unnecessary re-renders
  return useMemo(
    () => ({
      // Products & Search
      products: {
        items,
        loading: itemsLoading,
        activeTab: posState.activeTab,
        searchQuery: posState.searchQuery,
        onTabChange: posState.setActiveTab,
        onSearchChange: posState.setSearchQuery,
        onClearSearch: posState.clearSearch,
        onAddToCart: handleAddToCart,
      },

      // Shopping Cart
      cart: {
        cart: cart.cart,
        total: cartTotal,
        loading: sales.loading,
        onUpdateQuantity: handleUpdateQuantity,
        onEditPrice: handleEditPrice,
        onDeleteItem: handleDeleteItem,
        onCheckout: handleCheckout,
      },

      // Payment Dialog
      payment: {
        isOpen: posState.isPaymentDialogOpen,
        cartTotal: cartTotal,
        cartItems: cart.cart,
        selectedPaymentMethod: posState.selectedPaymentMethod,
        cashReceived: posState.cashReceived,
        loading: sales.loading,
        selectedCustomer: posState.selectedCustomer, // 🆕 Customer Selection
        onPaymentMethodChange: posState.setSelectedPaymentMethod,
        onCashReceivedChange: posState.setCashReceived,
        onCustomerChange: posState.setSelectedCustomer, // 🆕 Customer Handler
        onPayment: handlePayment,
        onClose: posState.closePaymentDialog,
      },

      // Confirmation Dialog
      confirmation: {
        isOpen: posState.isConfirmationDialogOpen,
        selectedPaymentMethod: posState.selectedPaymentMethod,
        cashReceived: posState.cashReceived,
        cartTotal: cartTotal,
        transactionResult: posState.transactionResult,
        onStartNewSale: handleStartNewSale,
        onClose: posState.closeConfirmationDialog,
      },

      // Edit Price Dialog
      editPrice: {
        isOpen: !!posState.editingItem,
        editingItem: posState.editingItem,
        editPrice: posState.editPrice,
        onEditPriceChange: posState.setEditPrice,
        onSave: handleSaveEditedPrice,
        onClose: posState.closeEditPriceDialog,
      },

      // Delete Confirmation Dialog
      deleteConfirm: {
        isOpen: !!posState.itemToDelete,
        onConfirm: handleConfirmDelete,
        onClose: posState.closeDeleteConfirmation,
      },

      // State für debugging/monitoring
      debug: {
        salesLoading: sales.loading,
        salesError: sales.error,
        cartCount: cart.cart.length,
        cartTotal: cartTotal,
      },
    }),
    [
      // Dependencies for memoization
      items,
      itemsLoading,
      posState,
      cart.cart,
      cartTotal,
      sales.loading,
      sales.error,
      handleAddToCart,
      handleUpdateQuantity,
      handleEditPrice,
      handleDeleteItem,
      handleCheckout,
      handlePayment,
      handleStartNewSale,
      handleSaveEditedPrice,
      handleConfirmDelete,
    ]
  )
}
