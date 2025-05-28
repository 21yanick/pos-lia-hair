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
import type { CartItem } from "@/lib/hooks/business/useSales"

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
              onChange={(e) => onEditPriceChange(e.target.value)}
              className="text-xl py-6"
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="py-6 text-base w-full sm:w-auto"
          >
            Abbrechen
          </Button>
          <Button 
            onClick={onSave}
            className="py-6 text-base w-full sm:w-auto"
          >
            <CheckCircle className="mr-2" size={18} />
            Preis speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}