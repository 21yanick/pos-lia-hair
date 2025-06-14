"use client"

import { useState } from 'react'
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu"
import { useToast } from "@/shared/hooks/core/useToast"
import { MoreHorizontal, Edit, Eye, Trash2, ExternalLink, Mail, Phone } from "lucide-react"
import { SUPPLIER_CATEGORIES } from '@/shared/types/suppliers'
import { updateSupplier, deleteSupplier } from '@/shared/services/supplierServices'
import { SupplierEditDialog } from '@/shared/components/supplier/SupplierEditDialog'
import { SupplierViewDialog } from '@/shared/components/supplier/SupplierViewDialog'
import type { Supplier } from '@/shared/types/suppliers'

interface SupplierListProps {
  suppliers: Supplier[]
  loading: boolean
  onSupplierUpdated: () => void
}

export function SupplierList({ suppliers, loading, onSupplierUpdated }: SupplierListProps) {
  const { toast } = useToast()
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null)

  const handleToggleActive = async (supplier: Supplier) => {
    setActionLoading(supplier.id)
    try {
      await updateSupplier(supplier.id, {
        is_active: !supplier.is_active
      })
      
      toast({
        title: "Erfolg",
        description: `Lieferant wurde ${!supplier.is_active ? 'aktiviert' : 'deaktiviert'}`
      })
      
      onSupplierUpdated()
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Status konnte nicht geändert werden",
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (supplier: Supplier) => {
    if (!confirm(`Möchten Sie "${supplier.name}" wirklich löschen?`)) {
      return
    }

    setActionLoading(supplier.id)
    try {
      await deleteSupplier(supplier.id)
      
      toast({
        title: "Erfolg",
        description: "Lieferant wurde gelöscht"
      })
      
      onSupplierUpdated()
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Lieferant konnte nicht gelöscht werden",
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  // Dialog handlers
  const handleView = (supplier: Supplier) => {
    setSelectedSupplierId(supplier.id)
    setViewDialogOpen(true)
  }

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplierId(supplier.id)
    setEditDialogOpen(true)
  }

  const handleEditFromView = (supplierId: string) => {
    setSelectedSupplierId(supplierId)
    setViewDialogOpen(false)
    setEditDialogOpen(true)
  }

  const handleEditSuccess = (updatedSupplier: Supplier) => {
    toast({
      title: "Erfolg",
      description: "Lieferant wurde erfolgreich aktualisiert"
    })
    onSupplierUpdated()
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">Lade Lieferanten...</div>
      </div>
    )
  }

  if (suppliers.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">Keine Lieferanten gefunden</div>
        <p className="text-sm text-muted-foreground mt-1">
          Erstellen Sie Ihren ersten Lieferanten oder passen Sie die Filter an
        </p>
      </div>
    )
  }

  return (
    <>
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Kategorie</TableHead>
            <TableHead>Kontakt</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((supplier) => (
            <TableRow key={supplier.id}>
              {/* Name & Details */}
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{supplier.name}</div>
                  {supplier.city && (
                    <div className="text-sm text-muted-foreground">
                      {supplier.city}
                      {supplier.country && supplier.country !== 'CH' && `, ${supplier.country}`}
                    </div>
                  )}
                  {supplier.notes && (
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {supplier.notes}
                    </div>
                  )}
                </div>
              </TableCell>

              {/* Category */}
              <TableCell>
                <Badge variant="outline">
                  {SUPPLIER_CATEGORIES[supplier.category]}
                </Badge>
              </TableCell>

              {/* Contact */}
              <TableCell>
                <div className="space-y-1">
                  {supplier.contact_email && (
                    <div className="flex items-center text-sm">
                      <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                      <a 
                        href={`mailto:${supplier.contact_email}`}
                        className="text-primary hover:underline"
                      >
                        {supplier.contact_email}
                      </a>
                    </div>
                  )}
                  {supplier.contact_phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                      <a 
                        href={`tel:${supplier.contact_phone}`}
                        className="text-primary hover:underline"
                      >
                        {supplier.contact_phone}
                      </a>
                    </div>
                  )}
                  {supplier.website && (
                    <div className="flex items-center text-sm">
                      <ExternalLink className="h-3 w-3 mr-1 text-muted-foreground" />
                      <a 
                        href={supplier.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Website
                      </a>
                    </div>
                  )}
                  {!supplier.contact_email && !supplier.contact_phone && !supplier.website && (
                    <div className="text-sm text-muted-foreground">
                      Keine Kontaktdaten
                    </div>
                  )}
                </div>
              </TableCell>

              {/* Status */}
              <TableCell>
                <Badge variant={supplier.is_active ? "default" : "secondary"}>
                  {supplier.is_active ? 'Aktiv' : 'Inaktiv'}
                </Badge>
              </TableCell>

              {/* Actions */}
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="h-8 w-8 p-0"
                      disabled={actionLoading === supplier.id}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => handleView(supplier)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Details anzeigen
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      onClick={() => handleEdit(supplier)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Bearbeiten
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={() => handleToggleActive(supplier)}>
                      <div className="mr-2 h-4 w-4 flex items-center justify-center">
                        {supplier.is_active ? '⏸' : '▶'}
                      </div>
                      {supplier.is_active ? 'Deaktivieren' : 'Aktivieren'}
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      onClick={() => handleDelete(supplier)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Löschen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>

    {/* View Dialog */}
    <SupplierViewDialog
      open={viewDialogOpen}
      onOpenChange={setViewDialogOpen}
      onEdit={handleEditFromView}
      supplierId={selectedSupplierId}
    />

    {/* Edit Dialog */}
    <SupplierEditDialog
      open={editDialogOpen}
      onOpenChange={setEditDialogOpen}
      onSuccess={handleEditSuccess}
      supplierId={selectedSupplierId}
    />
  </>
  )
}