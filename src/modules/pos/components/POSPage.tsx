"use client"

import { usePOS } from '../hooks/usePOS'
import { ProductGrid } from './ProductGrid'
import { ShoppingCart } from './ShoppingCart'
import { PaymentDialog } from './PaymentDialog'
import { ConfirmationDialog } from './ConfirmationDialog'
import { EditPriceDialog } from './EditPriceDialog'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'

export function POSPage() {
  const pos = usePOS()

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-4">
      {/* Universal Layout für alle Bildschirmgrößen */}
      <div className="flex flex-col md:flex-row h-full">
        {/* Left side - Products/Services */}
        <ProductGrid {...pos.products} />

        {/* Right side - Cart */}
        <ShoppingCart {...pos.cart} />
      </div>

      {/* Edit Price Dialog */}
      <EditPriceDialog {...pos.editPrice} />

      {/* Payment Dialog */}
      <PaymentDialog {...pos.payment} />

      {/* Confirmation Dialog */}
      <ConfirmationDialog {...pos.confirmation} />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog {...pos.deleteConfirm} />
    </div>
  )
}