'use client'

import { Loader2, Plus, Search } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Switch } from '@/shared/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { type Item, useItems } from '@/shared/hooks/business/useItems'
import { useToast } from '@/shared/hooks/core/useToast'
import { type ProductFormData, useProductActions } from '../hooks/useProductActions'
import { ProductCard } from './ProductCard'
import { ProductDialog } from './ProductDialog'

export function ProductsPage() {
  const { items, loading, error, syncAuthUser } = useItems()
  const { toast } = useToast()
  const {
    handleSaveItem,
    handleToggleFavorite,
    handleToggleActive,
    handleDeleteItem,
    handleManualSync,
    isSubmitting,
  } = useProductActions()

  // UI State
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentItem, setCurrentItem] = useState<Item | null>(null)
  const [syncDialogOpen, setSyncDialogOpen] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)

  // 🚀 Performance-optimiert: Memoized filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter =
        filter === 'all' ||
        (filter === 'services' && item.type === 'service') ||
        (filter === 'products' && item.type === 'product') ||
        (filter === 'favorites' && item.is_favorite)

      return matchesSearch && matchesFilter
    })
  }, [items, searchQuery, filter])

  // 🚀 Performance-optimiert: Memoized event handlers
  const handleOpenDialog = useCallback((item: Item | null = null) => {
    setCurrentItem(item)
    setIsDialogOpen(true)
  }, [])

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false)
    setCurrentItem(null)
  }, [])

  const handleSaveAndClose = useCallback(
    async (formData: ProductFormData, currentItem: Item | null) => {
      // V6.1 Pattern 18: Function Signature Alignment - match ProductDialog expectation
      const success = await handleSaveItem(formData, currentItem)
      if (success) {
        setIsDialogOpen(false)
        setCurrentItem(null)
      }
      return success
    },
    [handleSaveItem]
  )

  // Error handling und automatische Synchronisierung
  useEffect(() => {
    if (!error) return

    // Immer allgemeine Fehlermeldung anzeigen
    toast({
      title: 'Fehler aufgetreten',
      description: error,
      variant: 'destructive',
    })

    // Berechtigungsfehler speziell behandeln
    const isPermissionError =
      error?.includes('nicht berechtigt') ||
      error?.includes('permission') ||
      error?.includes('not authorized') ||
      error?.includes('Forbidden')

    if (isPermissionError) {
      // Wir öffnen schon vorher einen Dialog, um Benutzer zu informieren
      setSyncDialogOpen(true)
      setSyncMessage('Automatische Synchronisierung läuft...')

      // Synchronisierung versuchen
      syncAuthUser()
        .then((result) => {
          if (result.success) {
            setSyncMessage('Synchronisierung erfolgreich! Die Seite wird neu geladen...')

            // Kurze Pause zum Lesen der Meldung
            setTimeout(() => {
              window.location.reload()
            }, 1500)
          } else {
            setSyncMessage(`Fehler bei der Synchronisierung: ${result.error}`)
          }
        })
        .catch((err) => {
          setSyncMessage(`Unerwarteter Fehler: ${err.message}`)
        })
    }
  }, [error, toast, syncAuthUser])

  return (
    <div className="space-y-6">
      {/* Sync Error Warning */}
      {error && (
        <div className="bg-warning/10 border border-warning/20 p-4 rounded-md">
          <h3 className="font-semibold text-warning-foreground mb-2">
            Probleme mit der Datenbankkonfiguration erkannt
          </h3>
          <p className="text-sm text-warning-foreground mb-3">
            Es scheint ein Problem mit den Datenbankberechtigungen zu geben. Möglicherweise ist Ihr
            Benutzer nicht korrekt mit der Datenbank verknüpft.
          </p>
          <Button onClick={handleManualSync} className="bg-warning hover:bg-warning/90">
            Benutzer synchronisieren
          </Button>
        </div>
      )}

      {/* Sync Dialog */}
      {syncDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 max-w-md w-full rounded-lg border">
            <h3 className="font-semibold text-lg mb-3">Benutzer-Synchronisierung</h3>
            <p className="mb-4">{syncMessage}</p>
            <div className="flex justify-end">
              <Button
                onClick={() => setSyncDialogOpen(false)}
                variant="outline"
                disabled={syncMessage === 'Synchronisiere Benutzer...'}
              >
                Schließen
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header with Search and Add Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <Input
              placeholder="Suche nach Produkten oder Dienstleistungen..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="services">Dienstleistungen</SelectItem>
              <SelectItem value="products">Produkte</SelectItem>
              <SelectItem value="favorites">Favoriten</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => handleOpenDialog()} className="flex items-center">
          <Plus className="mr-2" size={16} />
          Produkt hinzufügen
        </Button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-background rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead>Service Details</TableHead>
              <TableHead className="text-right">Preis (CHF)</TableHead>
              <TableHead>Favorit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex justify-center items-center">
                    <Loader2 size={24} className="animate-spin mr-2" />
                    <span>Daten werden geladen...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Keine Einträge gefunden.
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant={item.type === 'service' ? 'default' : 'secondary'}>
                      {item.type === 'service' ? 'Dienstleistung' : 'Produkt'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.type === 'service' ? (
                      <div className="space-y-1">
                        <div className="text-sm font-medium">{item.duration_minutes}min</div>
                        <div className="flex gap-1">
                          {item.requires_booking && (
                            <Badge variant="outline" className="text-xs">
                              Buchbar
                            </Badge>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.default_price != null ? item.default_price.toFixed(2) : '0.00'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleFavorite(item.id, item.is_favorite ?? false)}
                      className={item.is_favorite ? 'text-warning' : 'text-muted-foreground'}
                    >
                      {item.is_favorite ? '⭐' : '☆'}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={item.active ?? true}
                      onCheckedChange={() => handleToggleActive(item.id, item.active ?? true)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(item)}>
                        Bearbeiten
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        Löschen
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 size={24} className="animate-spin mr-2" />
            <span>Daten werden geladen...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Keine Einträge gefunden.</div>
        ) : (
          filteredItems.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              onToggleFavorite={handleToggleFavorite}
              onToggleActive={handleToggleActive}
              onEdit={handleOpenDialog}
              onDelete={handleDeleteItem}
            />
          ))
        )}
      </div>

      {/* Product Dialog with Mobile Scroll Fix */}
      <ProductDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        currentItem={currentItem}
        onSave={handleSaveAndClose}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}
