'use client'

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Label } from "@/shared/components/ui/label"
import { Switch } from "@/shared/components/ui/switch"
import { type Item } from "@/shared/hooks/business/useItems"
import { type ProductFormData } from "../hooks/useProductActions"

interface ProductDialogProps {
  isOpen: boolean
  onClose: () => void
  currentItem: Item | null
  onSave: (formData: ProductFormData, currentItem: Item | null) => Promise<boolean>
  isSubmitting: boolean
}

export function ProductDialog({ 
  isOpen, 
  onClose, 
  currentItem, 
  onSave, 
  isSubmitting 
}: ProductDialogProps) {
  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    type: "service",
    default_price: "",
    is_favorite: false,
    active: true,
    // Service-specific fields
    duration_minutes: "60",
    requires_booking: true,
    booking_buffer_minutes: "0",
  })

  // Initialize form data when dialog opens
  useEffect(() => {
    if (isOpen) {
      if (currentItem) {
        setFormData({
          name: currentItem.name,
          type: currentItem.type,
          default_price: currentItem.default_price.toString(),
          is_favorite: currentItem.is_favorite ?? false,
          active: currentItem.active ?? true,
          // Service-specific fields
          duration_minutes: currentItem.duration_minutes?.toString() ?? "",
          requires_booking: currentItem.requires_booking ?? true,
          booking_buffer_minutes: currentItem.booking_buffer_minutes?.toString() ?? "0",
        })
      } else {
        setFormData({
          name: "",
          type: "service",
          default_price: "",
          is_favorite: false,
          active: true,
          // Service-specific fields with defaults
          duration_minutes: "60", // Default 1 hour for new services
          requires_booking: true,
          booking_buffer_minutes: "0",
        })
      }
    }
  }, [isOpen, currentItem])

  // Reset service fields when type changes
  useEffect(() => {
    if (formData.type === 'product') {
      setFormData(prev => ({
        ...prev,
        duration_minutes: "",
        requires_booking: false,
        booking_buffer_minutes: "0",
      }))
    } else if (formData.type === 'service' && !formData.duration_minutes) {
      setFormData(prev => ({
        ...prev,
        duration_minutes: "60",
        requires_booking: true,
        booking_buffer_minutes: "0",
      }))
    }
  }, [formData.type])

  const handleSave = async () => {
    const success = await onSave(formData, currentItem)
    if (success) {
      onClose()
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{currentItem ? "Produkt bearbeiten" : "Neues Produkt hinzufügen"}</DialogTitle>
          <DialogDescription>
            Füllen Sie die Felder aus, um{" "}
            {currentItem ? "das Produkt zu aktualisieren" : "ein neues Produkt hinzuzufügen"}.
          </DialogDescription>
        </DialogHeader>

        {/* 🚀 Mobile Scroll Fix: Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-1 py-4 space-y-4 min-h-0">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Typ</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value: "service" | "product") => 
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Typ auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="service">Dienstleistung</SelectItem>
                <SelectItem value="product">Produkt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="default_price">Preis (CHF)</Label>
            <Input
              id="default_price"
              type="number"
              step="0.05"
              min="0"
              value={formData.default_price}
              onChange={(e) => setFormData({ ...formData, default_price: e.target.value })}
            />
          </div>

          {/* Service-specific fields */}
          {formData.type === 'service' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="duration_minutes">Dauer (Minuten) *</Label>
                <Input
                  id="duration_minutes"
                  type="number"
                  min="5"
                  max="480"
                  placeholder="z.B. 60"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Standard-Dauer für diesen Service (5-480 Minuten)
                </p>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="space-y-1">
                  <Label htmlFor="requires_booking">Im Buchungssystem verfügbar</Label>
                  <p className="text-xs text-muted-foreground">
                    Service kann für Termine gebucht werden
                  </p>
                </div>
                <Switch
                  id="requires_booking"
                  checked={formData.requires_booking}
                  onCheckedChange={(checked) => setFormData({ ...formData, requires_booking: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="booking_buffer_minutes">Pufferzeit (Minuten)</Label>
                <Input
                  id="booking_buffer_minutes"
                  type="number"
                  min="0"
                  max="60"
                  placeholder="0"
                  value={formData.booking_buffer_minutes}
                  onChange={(e) => setFormData({ ...formData, booking_buffer_minutes: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Zusätzliche Zeit zwischen Terminen (0-60 Minuten)
                </p>
              </div>
            </>
          )}

          <div className="flex items-center justify-between py-2">
            <Label htmlFor="is_favorite">Als Favorit markieren</Label>
            <Switch
              id="is_favorite"
              checked={formData.is_favorite}
              onCheckedChange={(checked) => setFormData({ ...formData, is_favorite: checked })}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <Label htmlFor="active">Aktiv</Label>
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
            />
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 pt-4">
          <Button 
            variant="outline" 
            onClick={handleClose} 
            disabled={isSubmitting}
          >
            Abbrechen
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={
              isSubmitting || 
              !formData.name || 
              !formData.default_price || 
              (formData.type === 'service' && !formData.duration_minutes)
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird gespeichert...
              </>
            ) : (
              "Speichern"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}