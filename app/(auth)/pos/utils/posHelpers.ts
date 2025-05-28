import type { CartItem } from "@/lib/hooks/business/useSales"
import type { Item } from "@/lib/hooks/business/useItems"

export const addItemToCart = (cart: CartItem[], item: Item): CartItem[] => {
  // Finde das Item, falls es bereits im Warenkorb ist
  const existingItem = cart.find((cartItem) => cartItem.id === item.id)
  
  if (existingItem) {
    // Wenn das Item bereits existiert, erhöhe die Menge um 1
    return cart.map(cartItem => 
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
      ...cart,
      {
        id: item.id,
        name: item.name,
        price: item.default_price,
        quantity: 1,
        total: item.default_price,
      },
    ]
  }
}

export const updateCartItemQuantity = (cart: CartItem[], itemId: string, newQuantity: number): CartItem[] => {
  if (newQuantity < 1) return cart

  return cart.map((item) => {
    if (item.id === itemId) {
      return {
        ...item,
        quantity: newQuantity,
        total: newQuantity * item.price,
      }
    }
    return item
  })
}

export const updateCartItemPrice = (cart: CartItem[], itemId: string, newPrice: number): CartItem[] => {
  if (isNaN(newPrice) || newPrice <= 0) return cart

  return cart.map((item) => {
    if (item.id === itemId) {
      return {
        ...item,
        price: newPrice,
        total: item.quantity * newPrice,
      }
    }
    return item
  })
}

export const removeItemFromCart = (cart: CartItem[], itemId: string): CartItem[] => {
  return cart.filter((item) => item.id !== itemId)
}

export const calculateCartTotal = (cart: CartItem[]): number => {
  return cart.reduce((sum, item) => sum + item.total, 0)
}

export const calculateCashChange = (cashReceived: string, cartTotal: number): number => {
  const receivedAmount = Number.parseFloat(cashReceived)
  if (isNaN(receivedAmount)) return 0
  return receivedAmount - cartTotal
}