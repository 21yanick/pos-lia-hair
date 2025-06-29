'use client'

import { useState } from 'react'
import type { CartItem } from './useSales'
import type { Customer } from '@/shared/services/customerService'

// Typen für Zahlungsmethoden
export type PaymentMethod = 'cash' | 'twint' | 'sumup'

// Typ für Tab-Auswahl
export type ProductTab = 'services' | 'products' | 'favorites'

// Typ für Transaktionsergebnis
export type TransactionResult = {
  success: boolean
  transaction?: any
  change?: number
  receiptUrl?: string
  error?: string
  amount?: number              // Enhanced: for POS display purposes
  paymentMethod?: PaymentMethod // Enhanced: for confirmation dialog
  cashReceived?: number        // Enhanced: for cash payment tracking
}

export function usePOSState() {
  // Tab und Such-States
  const [activeTab, setActiveTab] = useState<ProductTab>("favorites")
  const [searchQuery, setSearchQuery] = useState("")

  // Dialog-States
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CartItem | null>(null)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)

  // Payment-States
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null)
  const [cashReceived, setCashReceived] = useState("")
  const [editPrice, setEditPrice] = useState("")

  // 🆕 Customer-State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  // Transaktionsergebnis
  const [transactionResult, setTransactionResult] = useState<TransactionResult | null>(null)

  // Dialog-Helper Funktionen
  const openPaymentDialog = () => setIsPaymentDialogOpen(true)
  const closePaymentDialog = () => {
    setIsPaymentDialogOpen(false)
    setSelectedPaymentMethod(null)
    setCashReceived("")
    // Note: Customer bleibt ausgewählt für nächste Transaktion
  }

  const openConfirmationDialog = () => setIsConfirmationDialogOpen(true)
  const closeConfirmationDialog = () => {
    setIsConfirmationDialogOpen(false)
    setTransactionResult(null)
  }

  const openEditPriceDialog = (item: CartItem) => {
    setEditingItem(item)
    setEditPrice(item.price.toString())
  }
  const closeEditPriceDialog = () => {
    setEditingItem(null)
    setEditPrice("")
  }

  const openDeleteConfirmation = (itemId: string) => {
    setItemToDelete(itemId)
  }
  const closeDeleteConfirmation = () => {
    setItemToDelete(null)
  }

  // Reset-Funktion für neuen Verkauf
  const startNewSale = () => {
    setSelectedPaymentMethod(null)
    setCashReceived("")
    setTransactionResult(null)
    setSelectedCustomer(null) // 🆕 Customer zurücksetzen
    closeConfirmationDialog()
  }

  // Such-Helper
  const clearSearch = () => setSearchQuery("")

  return {
    // Tab & Search States
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    clearSearch,

    // Dialog States
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

    // Payment States
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    cashReceived,
    setCashReceived,
    editPrice,
    setEditPrice,

    // 🆕 Customer States
    selectedCustomer,
    setSelectedCustomer,

    // Transaction Result
    transactionResult,
    setTransactionResult,

    // Helper Functions
    startNewSale,
  }
}