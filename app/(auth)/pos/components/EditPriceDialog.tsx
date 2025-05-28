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
        <DialogHeader className="pb-6">
          <DialogTitle className="text-xl font-bold flex items-center">
            <div className="mr-3 p-2 bg-blue-100 rounded-xl">
              <Pencil className="text-blue-600" size={20} />
            </div>
            Preis bearbeiten
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 mt-2">
            Passen Sie den Preis für <span className="font-semibold text-gray-800">{editingItem?.name}</span> an.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="space-y-4">
            <Label htmlFor="price" className="text-base font-semibold text-gray-700">Preis (CHF)</Label>
            <Input
              id="price"
              type="number"
              step="0.05"
              min="0"
              value={editPrice}
              onChange={(e) => onEditPriceChange(e.target.value)}
              className="text-2xl py-4 text-center bg-gray-50/50 border-gray-300 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl"
              placeholder="0.00"
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="py-4 text-base w-full sm:w-auto rounded-xl border-gray-300 hover:bg-gray-50"
          >
            Abbrechen
          </Button>
          <Button 
            onClick={onSave}
            className="py-4 text-base w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] rounded-xl"
          >
            <CheckCircle className="mr-2" size={18} />
            Preis speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}