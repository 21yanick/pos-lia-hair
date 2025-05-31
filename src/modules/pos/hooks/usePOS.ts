'use client'

import { useState } from 'react'
import { usePOSState } from './usePOSState'
import { useSales } from './useSales'
import { useItems } from '@/shared/hooks/business/useItems'
import type { Item } from '@/shared/hooks/business/useItems'
import type { CartItem, CreateSaleData } from './useSales'

// Warenkorb-Logik Hook
function useCart() {
  const [cart, setCart] = useState<CartItem[]>([])

  const addToCart = (item: Item) => {
    console.log('addToCart called with:', item)
    setCart(prevCart => {
      console.log('Previous cart:', prevCart)
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id)
      console.log('Existing item:', existingItem)
      
      if (existingItem) {
        // Item bereits im Warenkorb -> Menge erhöhen
        const newCart = prevCart.map(cartItem =>
          cartItem.id === item.id
            ? {
                ...cartItem,
                quantity: cartItem.quantity + 1,
                total: cartItem.price * (cartItem.quantity + 1)
              }
            : cartItem
        )
        console.log('Updated cart (existing item):', newCart)
        return newCart
      } else {
        // Neues Item zum Warenkorb hinzufügen
        const newCartItem: CartItem = {
          id: item.id,
          name: item.name,
          price: item.default_price,
          quantity: 1,
          total: item.default_price
        }
        const newCart = [...prevCart, newCartItem]
        console.log('New cart (new item):', newCart)
        return newCart
      }
    })
  }

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId)
      return
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId
          ? {
              ...item,
              quantity: newQuantity,
              total: item.price * newQuantity
            }
          : item
      )
    )
  }

  const updatePrice = (itemId: string, newPrice: number) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId
          ? {
              ...item,
              price: newPrice,
              total: newPrice * item.quantity
            }
          : item
      )
    )
  }

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId))
  }

  const clearCart = () => {
    setCart([])
  }

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0)
  }

  return {
    cart,
    addToCart,
    updateQuantity,
    updatePrice,
    removeFromCart,
    clearCart,
    getCartTotal
  }
}

// Hauptorchestrator Hook für das gesamte POS System
export function usePOS() {
  const posState = usePOSState()
  const sales = useSales()
  const { items, loading: itemsLoading } = useItems()
  const cart = useCart()

  // Kombinierte Funktionen für POS-spezifische Workflows
  const handleAddToCart = (item: Item) => {
    console.log('Adding to cart:', item) // Debug
    cart.addToCart(item)
  }

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    cart.updateQuantity(itemId, newQuantity)
  }

  const handleEditPrice = (item: CartItem) => {
    posState.openEditPriceDialog(item)
  }

  const handleSaveEditedPrice = () => {
    if (posState.editingItem && posState.editPrice) {
      const newPrice = parseFloat(posState.editPrice)
      if (newPrice > 0) {
        cart.updatePrice(posState.editingItem.id, newPrice)
      }
    }
    posState.closeEditPriceDialog()
  }

  const handleDeleteItem = (itemId: string) => {
    posState.openDeleteConfirmation(itemId)
  }

  const handleConfirmDelete = () => {
    if (posState.itemToDelete) {
      cart.removeFromCart(posState.itemToDelete)
    }
    posState.closeDeleteConfirmation()
  }

  const handleCheckout = () => {
    if (cart.cart.length === 0) return
    posState.openPaymentDialog()
  }

  const handlePayment = async (data: CreateSaleData) => {
    const result = await sales.createSale(data)
    
    if (result.success) {
      posState.setTransactionResult({
        success: true,
        transaction: result.sale,
        change: result.change,
        receiptUrl: result.receiptUrl
      })
      posState.closePaymentDialog()
      posState.openConfirmationDialog()
      cart.clearCart()
    } else {
      posState.setTransactionResult({
        success: false,
        error: result.error
      })
    }
  }

  const handleStartNewSale = () => {
    posState.startNewSale()
    cart.clearCart()
  }

  return {
    // Products & Search
    products: {
      items,
      loading: itemsLoading,
      activeTab: posState.activeTab,
      searchQuery: posState.searchQuery,
      onTabChange: posState.setActiveTab,
      onSearchChange: posState.setSearchQuery,
      onClearSearch: posState.clearSearch,
      onAddToCart: handleAddToCart
    },

    // Shopping Cart
    cart: {
      cart: cart.cart,
      total: cart.getCartTotal(),
      loading: sales.loading,
      onUpdateQuantity: handleUpdateQuantity,
      onEditPrice: handleEditPrice,
      onDeleteItem: handleDeleteItem,
      onCheckout: handleCheckout
    },

    // Payment Dialog
    payment: {
      isOpen: posState.isPaymentDialogOpen,
      cartTotal: cart.getCartTotal(),
      cartItems: cart.cart,
      selectedPaymentMethod: posState.selectedPaymentMethod,
      cashReceived: posState.cashReceived,
      loading: sales.loading,
      onPaymentMethodChange: posState.setSelectedPaymentMethod,
      onCashReceivedChange: posState.setCashReceived,
      onPayment: handlePayment,
      onClose: posState.closePaymentDialog
    },

    // Confirmation Dialog
    confirmation: {
      isOpen: posState.isConfirmationDialogOpen,
      selectedPaymentMethod: posState.selectedPaymentMethod,
      cashReceived: posState.cashReceived,
      cartTotal: cart.getCartTotal(),
      transactionResult: posState.transactionResult,
      onStartNewSale: handleStartNewSale,
      onClose: posState.closeConfirmationDialog
    },

    // Edit Price Dialog
    editPrice: {
      isOpen: !!posState.editingItem,
      editingItem: posState.editingItem,
      editPrice: posState.editPrice,
      onEditPriceChange: posState.setEditPrice,
      onSave: handleSaveEditedPrice,
      onClose: posState.closeEditPriceDialog
    },

    // Delete Confirmation Dialog
    deleteConfirm: {
      isOpen: !!posState.itemToDelete,
      onConfirm: handleConfirmDelete,
      onClose: posState.closeDeleteConfirmation
    },

    // State für debugging/monitoring
    debug: {
      salesLoading: sales.loading,
      salesError: sales.error,
      cartCount: cart.cart.length,
      cartTotal: cart.getCartTotal()
    }
  }
}