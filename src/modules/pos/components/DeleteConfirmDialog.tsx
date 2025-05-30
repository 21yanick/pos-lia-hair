"use client"

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface DeleteConfirmDialogProps {
  isOpen: boolean
  onConfirm: () => void
  onClose: () => void
}

export function DeleteConfirmDialog({
  isOpen,
  onConfirm,
  onClose,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Trash2 className="text-destructive mr-2" size={20} />
            Artikel aus Warenkorb entfernen
          </DialogTitle>
          <DialogDescription>
            Möchten Sie diesen Artikel wirklich aus dem Warenkorb entfernen?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Abbrechen
          </Button>
          <Button 
            onClick={onConfirm}
            variant="destructive"
            className="w-full sm:w-auto"
          >
            <Trash2 className="mr-2" size={16} />
            Entfernen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}