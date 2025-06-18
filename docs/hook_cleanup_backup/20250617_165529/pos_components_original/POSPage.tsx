"use client"

import { usePOS } from '../hooks/usePOS'
import { useOrganization } from '@/shared/contexts/OrganizationContext'
import { ProductGrid } from './ProductGrid'
import { ShoppingCart } from './ShoppingCart'
import { PaymentDialog } from './PaymentDialog'
import { ConfirmationDialog } from './ConfirmationDialog'
import { EditPriceDialog } from './EditPriceDialog'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'

export function POSPage() {
  const { currentOrganization, loading } = useOrganization()
  const pos = usePOS()

  console.log('🔍 DEBUG POSPage: currentOrganization:', currentOrganization)
  console.log('🔍 DEBUG POSPage: loading:', loading)

  // Wait for organization to load before showing POS
  if (loading || !currentOrganization) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {loading ? 'Lade Organization...' : 'Keine Organization verfügbar'}
          </p>
        </div>
      </div>
    )
  }

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