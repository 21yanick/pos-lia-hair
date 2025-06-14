"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/shared/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Badge } from "@/shared/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import { Loader2, AlertCircle, Edit, Mail, Phone, ExternalLink, MapPin, Building, CreditCard, FileText } from "lucide-react"
import { getSupplierById } from '@/shared/services/supplierServices'
import { SUPPLIER_CATEGORIES } from '@/shared/types/suppliers'
import type { Supplier } from '@/shared/types/suppliers'

interface SupplierViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (supplierId: string) => void
  supplierId: string | null
}

export function SupplierViewDialog({
  open,
  onOpenChange,
  onEdit,
  supplierId
}: SupplierViewDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supplier, setSupplier] = useState<Supplier | null>(null)

  // Load supplier data when dialog opens
  useEffect(() => {
    if (open && supplierId) {
      loadSupplierData()
    }
  }, [open, supplierId])

  const loadSupplierData = async () => {
    if (!supplierId) return

    setLoading(true)
    setError(null)

    try {
      const supplierData = await getSupplierById(supplierId)
      
      if (!supplierData) {
        throw new Error('Lieferant nicht gefunden')
      }

      setSupplier(supplierData)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Fehler beim Laden der Daten')
    } finally {
      setLoading(false)
    }
  }

  // Reset when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSupplier(null)
      setError(null)
    }
    onOpenChange(newOpen)
  }

  const handleEdit = () => {
    if (supplier && onEdit) {
      onEdit(supplier.id)
      handleOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Lieferant Details</span>
            {supplier && (
              <Badge variant={supplier.is_active ? "default" : "secondary"}>
                {supplier.is_active ? 'Aktiv' : 'Inaktiv'}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Detaillierte Informationen zum Lieferanten
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Lade Lieferantendaten...</span>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : supplier ? (
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Building className="h-5 w-5 mr-2" />
                  Grundinformationen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-base font-medium">{supplier.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Kategorie</label>
                    <div className="mt-1">
                      <Badge variant="outline">
                        {SUPPLIER_CATEGORIES[supplier.category]}
                      </Badge>
                    </div>
                  </div>
                </div>
                {supplier.notes && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Notizen</label>
                    <p className="text-sm mt-1 bg-muted p-3 rounded-md">{supplier.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Phone className="h-5 w-5 mr-2" />
                  Kontaktinformationen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {supplier.contact_email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">E-Mail</label>
                        <div>
                          <a 
                            href={`mailto:${supplier.contact_email}`}
                            className="text-primary hover:underline"
                          >
                            {supplier.contact_email}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {supplier.contact_phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Telefon</label>
                        <div>
                          <a 
                            href={`tel:${supplier.contact_phone}`}
                            className="text-primary hover:underline"
                          >
                            {supplier.contact_phone}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {supplier.website && (
                    <div className="flex items-center space-x-3">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Website</label>
                        <div>
                          <a 
                            href={supplier.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {supplier.website}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {!supplier.contact_email && !supplier.contact_phone && !supplier.website && (
                    <p className="text-sm text-muted-foreground italic">
                      Keine Kontaktinformationen hinterlegt
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            {(supplier.address_line1 || supplier.city || supplier.postal_code) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <MapPin className="h-5 w-5 mr-2" />
                    Adressinformationen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {supplier.address_line1 && (
                      <p>{supplier.address_line1}</p>
                    )}
                    {supplier.address_line2 && (
                      <p>{supplier.address_line2}</p>
                    )}
                    <p>
                      {supplier.postal_code && supplier.postal_code + ' '}
                      {supplier.city}
                      {supplier.country && supplier.country !== 'CH' && `, ${supplier.country}`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Business Information */}
            {(supplier.iban || supplier.vat_number) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Geschäftsinformationen
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {supplier.iban && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">IBAN</label>
                      <p className="font-mono text-sm">{supplier.iban}</p>
                    </div>
                  )}
                  {supplier.vat_number && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">UID-Nummer</label>
                      <p className="font-mono text-sm">{supplier.vat_number}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <FileText className="h-5 w-5 mr-2" />
                  Systeminformationen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-muted-foreground">Erstellt am</label>
                    <p>{new Date(supplier.created_at).toLocaleDateString('de-CH')}</p>
                  </div>
                  <div>
                    <label className="text-muted-foreground">Letzte Änderung</label>
                    <p>{new Date(supplier.updated_at).toLocaleDateString('de-CH')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Schließen
          </Button>
          {supplier && onEdit && (
            <Button
              type="button"
              onClick={handleEdit}
            >
              <Edit className="mr-2 h-4 w-4" />
              Bearbeiten
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}