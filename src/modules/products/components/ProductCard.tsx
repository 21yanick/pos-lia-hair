'use client'

import { Pencil, Star, StarOff, Trash2 } from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Switch } from '@/shared/components/ui/switch'
import type { Item } from '@/shared/hooks/business/useItems'

interface ProductCardProps {
  item: Item
  onToggleFavorite: (id: string, currentValue: boolean) => Promise<void>
  onToggleActive: (id: string, currentValue: boolean) => Promise<void>
  onEdit: (item: Item) => void
  onDelete: (id: string) => Promise<void>
}

export function ProductCard({
  item,
  onToggleFavorite,
  onToggleActive,
  onEdit,
  onDelete,
}: ProductCardProps) {
  return (
    <div className="bg-background border border-border rounded-lg p-4 space-y-3">
      {/* Header Row */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-lg truncate">{item.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={item.type === 'service' ? 'default' : 'secondary'}>
              {item.type === 'service' ? 'Dienstleistung' : 'Produkt'}
            </Badge>
            {item.is_favorite && (
              <Badge variant="outline" className="text-warning border-warning">
                ⭐ Favorit
              </Badge>
            )}
          </div>
          {/* Service details for mobile */}
          {item.type === 'service' && (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {item.duration_minutes}min
              </Badge>
              {item.requires_booking && (
                <Badge variant="outline" className="text-xs">
                  Buchbar
                </Badge>
              )}
            </div>
          )}
        </div>
        <div className="text-right flex-shrink-0 ml-4">
          <div className="text-xl font-bold">
            {item.default_price != null ? item.default_price.toFixed(2) : '0.00'} CHF
          </div>
        </div>
      </div>

      {/* Controls Row - Mobile-optimiert */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleFavorite(item.id, item.is_favorite ?? false)}
            className={`h-9 w-9 ${item.is_favorite ? 'text-warning' : 'text-muted-foreground'}`}
            title={item.is_favorite ? 'Favorit entfernen' : 'Als Favorit markieren'}
          >
            {item.is_favorite ? <Star size={16} /> : <StarOff size={16} />}
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Aktiv</span>
            <Switch
              checked={item.active ?? true}
              onCheckedChange={() => onToggleActive(item.id, item.active ?? true)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(item)}
            className="h-9 w-9"
            title="Bearbeiten"
          >
            <Pencil size={14} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-9 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => onDelete(item.id)}
            title="Löschen"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </div>
  )
}
