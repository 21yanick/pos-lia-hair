"use client"

import { useState, useEffect } from "react"
import { Button } from "@/shared/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/shared/components/ui/dialog"
import { Label } from "@/shared/components/ui/label"
import { Separator } from "@/shared/components/ui/separator"
import { Badge } from "@/shared/components/ui/badge"
import { CustomerAutocomplete } from '@/shared/components/customer/CustomerAutocomplete'
import { useTransactionCustomer } from '../hooks/useTransactionCustomer'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import type { Customer } from '@/shared/services/customerService'
import type { UnifiedTransaction } from '../types/unifiedTransactions'
import { Loader2, Users, X } from "lucide-react"

interface CustomerAssignDialogProps {
  transaction: UnifiedTransaction
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CustomerAssignDialog({ 
  transaction, 
  open, 
  onOpenChange 
}: CustomerAssignDialogProps) {
  const { currentOrganization } = useCurrentOrganization()
  const { assignCustomer, isAssigning } = useTransactionCustomer(currentOrganization?.id || '')
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  // Initialize with current customer
  useEffect(() => {
    if (transaction.customer_id && transaction.customer_name) {
      setSelectedCustomer({
        id: transaction.customer_id,
        name: transaction.customer_name,
        phone: null,
        email: null,
        organization_id: currentOrganization?.id || '',
        created_by: '',
        is_active: true,
        created_at: '',
        updated_at: ''
      })
    } else {
      setSelectedCustomer(null)
    }
  }, [transaction, currentOrganization])

  const handleSave = async () => {
    if (!currentOrganization?.id) return

    try {
      await assignCustomer({
        transactionId: transaction.id,
        customer: selectedCustomer
      })
      
      // Close dialog on success
      onOpenChange(false)
    } catch (error) {
      // Error handling is done in the hook with toast
      console.error('Error assigning customer:', error)
    }
  }

  const handleRemoveCustomer = () => {
    setSelectedCustomer(null)
  }

  // Only allow customer assignment for sales
  const canAssignCustomer = transaction.transaction_type === 'sale'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-bold flex items-center">
            <div className="mr-3 p-2 bg-primary/10 rounded-xl">
              <Users className="text-primary" size={20} />
            </div>
            Kunde zuweisen
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground mt-2">
            Weise einen Kunden zu dieser Transaktion zu
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Transaction Info */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline" className="text-xs">
                {transaction.type_code}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {transaction.receipt_number}
              </span>
            </div>
            <p className="text-sm font-medium">{transaction.description}</p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-muted-foreground">
                {transaction.date_only} • {transaction.time_only}
              </span>
              <span className="font-bold">
                CHF {transaction.amount.toFixed(2)}
              </span>
            </div>
          </div>

          <Separator />

          {/* Customer Assignment */}
          {canAssignCustomer ? (
            <div className="space-y-4">
              <Label className="text-base font-semibold">
                Kunde auswählen
              </Label>
              
              <CustomerAutocomplete
                value={selectedCustomer}
                onSelect={setSelectedCustomer}
                placeholder="Kunde suchen oder erstellen..."
                allowCreateNew={true}
                className="w-full"
              />

              {selectedCustomer && (
                <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      {selectedCustomer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{selectedCustomer.name}</p>
                      {(selectedCustomer.phone || selectedCustomer.email) && (
                        <p className="text-xs text-muted-foreground">
                          {selectedCustomer.phone || selectedCustomer.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveCustomer}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <X size={16} />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="mx-auto mb-3" size={24} />
              <p>Nur Verkäufe können Kunden zugewiesen werden</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
            disabled={isAssigning}
          >
            Abbrechen
          </Button>
          
          {canAssignCustomer && (
            <Button 
              onClick={handleSave}
              disabled={isAssigning}
              className="w-full sm:w-auto"
            >
              {isAssigning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Speichern...
                </>
              ) : (
                <>
                  <Users className="mr-2 h-4 w-4" />
                  {selectedCustomer ? 'Kunde zuweisen' : 'Kunde entfernen'}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}