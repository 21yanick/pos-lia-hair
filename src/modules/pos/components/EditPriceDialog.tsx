"use client"

import { CheckCircle, Pencil } from "lucide-react"
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
import type { CartItem } from "../hooks/useSales"

interface EditPriceDialogProps {
  isOpen: boolean
  editingItem: CartItem | null
  editPrice: string
  onEditPriceChange: (price: string) => void
  onSave: () => void
  onClose: () => void
}

export function EditPriceDialog({
  isOpen,
  editingItem,
  editPrice,
  onEditPriceChange,
  onSave,
  onClose,
}: EditPriceDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-xl font-bold flex items-center">
            <div className="mr-3 p-2 bg-primary/10 rounded-xl">
              <Pencil className="text-primary" size={20} />
            </div>
            Preis bearbeiten
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground mt-2">
            Passen Sie den Preis für <span className="font-semibold text-foreground">{editingItem?.name}</span> an.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="editPrice" className="text-base font-semibold">
                Neuer Preis (CHF)
              </Label>
              <Input
                id="editPrice"
                type="number"
                step="0.05"
                min="0"
                placeholder="0.00"
                value={editPrice}
                onChange={(e) => onEditPriceChange(e.target.value)}
                className="text-lg h-12 mt-2"
                autoFocus
              />
            </div>
            
            {editingItem && (
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ursprünglicher Preis:</span>
                  <span className="font-semibold">CHF {editingItem.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Menge:</span>
                  <span className="font-semibold">{editingItem.quantity}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Neuer Gesamtpreis:</span>
                  <span className="font-bold text-primary">
                    CHF {((parseFloat(editPrice) || 0) * editingItem.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Abbrechen
          </Button>
          <Button 
            onClick={onSave}
            disabled={!editPrice || parseFloat(editPrice) < 0}
            className="w-full sm:w-auto"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Preis speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}