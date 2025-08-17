'use client'

import { Edit, ExternalLink, Eye, Mail, MapPin, MoreHorizontal, Phone, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Switch } from '@/shared/components/ui/switch'
import { useToast } from '@/shared/hooks/core/useToast'
import { deleteSupplier, updateSupplier } from '@/shared/services/supplierServices'
import type { Supplier } from '@/shared/types/suppliers'
import { SUPPLIER_CATEGORIES } from '@/shared/types/suppliers'

interface SupplierCardProps {
  supplier: Supplier
  onSupplierUpdated: () => void
  onView: (supplier: Supplier) => void
  onEdit: (supplier: Supplier) => void
}

export function SupplierCard({ supplier, onSupplierUpdated, onView, onEdit }: SupplierCardProps) {
  const { toast } = useToast()
  const [actionLoading, setActionLoading] = useState(false)

  const handleToggleActive = async () => {
    setActionLoading(true)
    try {
      await updateSupplier(supplier.id, {
        is_active: !supplier.is_active,
      })

      toast({
        title: 'Erfolg',
        description: `Lieferant wurde ${!supplier.is_active ? 'aktiviert' : 'deaktiviert'}`,
      })

      onSupplierUpdated()
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Status konnte nicht geändert werden',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Möchten Sie "${supplier.name}" wirklich löschen?`)) {
      return
    }

    setActionLoading(true)
    try {
      await deleteSupplier(supplier.id)

      toast({
        title: 'Erfolg',
        description: 'Lieferant wurde gelöscht',
      })

      onSupplierUpdated()
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Lieferant konnte nicht gelöscht werden',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="bg-background border border-border rounded-lg p-4 space-y-3">
      {/* Header Row */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-lg line-clamp-2">{supplier.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              <span className="hidden sm:inline">
                {SUPPLIER_CATEGORIES[supplier.category] || 'Unbekannt'}
              </span>
              <span className="sm:hidden">Kat.</span>
            </Badge>
            <Badge variant={supplier.is_active ? 'default' : 'secondary'} className="text-xs">
              {supplier.is_active ? 'Aktiv' : 'Inaktiv'}
            </Badge>
          </div>

          {/* Location */}
          {supplier.city && (
            <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>
                {supplier.city}
                {supplier.country && supplier.country !== 'CH' && `, ${supplier.country}`}
              </span>
            </div>
          )}

          {/* Notes */}
          {supplier.notes && (
            <div className="mt-2 text-xs text-muted-foreground line-clamp-2">{supplier.notes}</div>
          )}
        </div>

        <div className="flex-shrink-0 ml-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 w-9 p-0" disabled={actionLoading}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(supplier)}>
                <Eye className="mr-2 h-4 w-4" />
                Details anzeigen
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(supplier)}>
                <Edit className="mr-2 h-4 w-4" />
                Bearbeiten
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleActive}>
                <div className="mr-2 h-4 w-4 flex items-center justify-center">
                  {supplier.is_active ? '⏸' : '▶'}
                </div>
                {supplier.is_active ? 'Deaktivieren' : 'Aktivieren'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Löschen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-2">
        {supplier.contact_email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <a
              href={`mailto:${supplier.contact_email}`}
              className="text-primary hover:underline truncate"
            >
              {supplier.contact_email}
            </a>
          </div>
        )}
        {supplier.contact_phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <a href={`tel:${supplier.contact_phone}`} className="text-primary hover:underline">
              {supplier.contact_phone}
            </a>
          </div>
        )}
        {supplier.website && (
          <div className="flex items-center gap-2 text-sm">
            <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <a
              href={supplier.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline truncate"
            >
              Website
            </a>
          </div>
        )}
        {!supplier.contact_email && !supplier.contact_phone && !supplier.website && (
          <div className="text-sm text-muted-foreground">Keine Kontaktdaten</div>
        )}
      </div>

      {/* Controls Row - Mobile-optimiert */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Aktiv</span>
            <Switch
              checked={supplier.is_active}
              onCheckedChange={handleToggleActive}
              disabled={actionLoading}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(supplier)}
            className="h-9 w-9"
            title="Bearbeiten"
            disabled={actionLoading}
          >
            <Edit size={14} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(supplier)}
            className="h-9 w-9"
            title="Details anzeigen"
            disabled={actionLoading}
          >
            <Eye size={14} />
          </Button>
        </div>
      </div>
    </div>
  )
}
