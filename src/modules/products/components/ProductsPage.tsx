"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Pencil, Trash2, Star, StarOff, Loader2 } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
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
import { Textarea } from "@/shared/components/ui/textarea"
import { Switch } from "@/shared/components/ui/switch"
import { Badge } from "@/shared/components/ui/badge"
import { useToast } from "@/shared/hooks/core/useToast"
import { useItems, type Item, type ItemInsert } from "@/shared/hooks/business/useItems"

export function ProductsPage() {
  const { items, loading, error, addItem, updateItem, toggleFavorite, toggleActive, deleteItem, syncAuthUser } = useItems()
  const { toast } = useToast()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentItem, setCurrentItem] = useState<Item | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [syncDialogOpen, setSyncDialogOpen] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "service" as "service" | "product",
    default_price: "",
    is_favorite: false,
    active: true,
    // Service-specific fields
    duration_minutes: "",
    requires_booking: true,
    booking_buffer_minutes: "0",
  })

  // Zeige Fehler an und versuche automatische Synchronisierung
  useEffect(() => {
    if (!error) return

    // Immer allgemeine Fehlermeldung anzeigen
    toast({
      title: "Fehler aufgetreten",
      description: error,
      variant: "destructive",
    })

    // Berechtigungsfehler speziell behandeln
    const isPermissionError = error?.includes('nicht berechtigt') || 
                              error?.includes('permission') || 
                              error?.includes('not authorized') ||
                              error?.includes('Forbidden');
    
    if (isPermissionError) {
      // console.log('Berechtigungsfehler erkannt, versuche Auth-Benutzer zu synchronisieren...');
      
      // Wir öffnen schon vorher einen Dialog, um Benutzer zu informieren
      setSyncDialogOpen(true);
      setSyncMessage("Automatische Synchronisierung läuft...");
      
      // Synchronisierung versuchen
      syncAuthUser().then(result => {
        if (result.success) {
          setSyncMessage("Synchronisierung erfolgreich! Die Seite wird neu geladen...");
          
          // Kurze Pause zum Lesen der Meldung
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          setSyncMessage(`Fehler bei der Synchronisierung: ${result.error}`);
        }
      }).catch(err => {
        setSyncMessage(`Unerwarteter Fehler: ${err.message}`);
      });
    }
  }, [error, toast, syncAuthUser])

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

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter =
      filter === "all" ||
      (filter === "services" && item.type === "service") ||
      (filter === "products" && item.type === "product") ||
      (filter === "favorites" && item.is_favorite)

    return matchesSearch && matchesFilter
  })

  const handleOpenDialog = (item: Item | null = null) => {
    if (item) {
      setCurrentItem(item)
      setFormData({
        name: item.name,
        type: item.type,
        default_price: item.default_price.toString(),
        is_favorite: item.is_favorite ?? false,
        active: item.active ?? true,
        // Service-specific fields
        duration_minutes: item.duration_minutes?.toString() ?? "",
        requires_booking: item.requires_booking ?? true,
        booking_buffer_minutes: item.booking_buffer_minutes?.toString() ?? "0",
      })
    } else {
      setCurrentItem(null)
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
    setIsDialogOpen(true)
  }

  const handleSaveItem = async () => {
    setIsSubmitting(true)
    
    try {
      const itemData: ItemInsert = {
        name: formData.name,
        type: formData.type,
        default_price: parseFloat(formData.default_price),
        is_favorite: formData.is_favorite,
        active: formData.active,
        // Service-specific fields
        duration_minutes: formData.type === 'service' && formData.duration_minutes ? 
          parseInt(formData.duration_minutes) : null,
        requires_booking: formData.type === 'service' ? formData.requires_booking : false,
        booking_buffer_minutes: formData.type === 'service' && formData.booking_buffer_minutes ? 
          parseInt(formData.booking_buffer_minutes) : 0,
      }

      if (currentItem) {
        // Update existing item
        const { error } = await updateItem({
          id: currentItem.id,
          ...itemData
        })
        
        if (error) {
          toast({
            title: "Fehler",
            description: `Fehler beim Aktualisieren: ${error}`,
            variant: "destructive",
          })
          return
        }
        
        toast({
          title: "Erfolg",
          description: "Produkt erfolgreich aktualisiert",
        })
      } else {
        // Add new item
        const { error } = await addItem(itemData)
        
        if (error) {
          toast({
            title: "Fehler",
            description: `Fehler beim Hinzufügen: ${error}`,
            variant: "destructive",
          })
          return
        }
        
        toast({
          title: "Erfolg",
          description: "Produkt erfolgreich hinzugefügt",
        })
      }

      setIsDialogOpen(false)
    } catch (err) {
      console.error("Fehler beim Speichern:", err)
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleFavorite = async (id: string, currentValue: boolean) => {
    const { error } = await toggleFavorite(id, currentValue)
    
    if (error) {
      toast({
        title: "Fehler",
        description: `Fehler beim Ändern des Favoriten-Status: ${error}`,
        variant: "destructive",
      })
    }
  }

  const handleToggleActive = async (id: string, currentValue: boolean) => {
    const { error } = await toggleActive(id, currentValue)
    
    if (error) {
      toast({
        title: "Fehler",
        description: `Fehler beim Ändern des Aktiv-Status: ${error}`,
        variant: "destructive",
      })
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (confirm("Sind Sie sicher, dass Sie dieses Produkt löschen möchten?")) {
      const { error } = await deleteItem(id)
      
      if (error) {
        toast({
          title: "Fehler",
          description: `Fehler beim Löschen: ${error}`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Erfolg",
          description: "Produkt erfolgreich gelöscht",
        })
      }
    }
  }

  // Manuell Auth-Benutzer synchronisieren
  const handleManualSync = async () => {
    setSyncDialogOpen(true)
    setSyncMessage("Synchronisiere Benutzer...")
    try {
      const result = await syncAuthUser()
      if (result.success) {
        setSyncMessage("Synchronisierung erfolgreich! Die Seite wird neu geladen...")
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        setSyncMessage(`Fehler: ${result.error}`)
      }
    } catch (err: any) {
      setSyncMessage(`Fehler: ${err.message}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Sync-Dialog */}
      {error && (
        <div className="bg-warning/10 border border-warning/20 p-4 rounded-md">
          <h3 className="font-semibold text-warning-foreground mb-2">Probleme mit der Datenbankkonfiguration erkannt</h3>
          <p className="text-sm text-warning-foreground mb-3">
            Es scheint ein Problem mit den Datenbankberechtigungen zu geben. Möglicherweise ist Ihr Benutzer nicht korrekt mit der Datenbank verknüpft.
          </p>
          <Button onClick={handleManualSync} className="bg-warning hover:bg-warning/90">
            Benutzer synchronisieren
          </Button>
        </div>
      )}
      
      {/* Sync-Dialog */}
      {syncDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 max-w-md w-full rounded-lg border">
            <h3 className="font-semibold text-lg mb-3">Benutzer-Synchronisierung</h3>
            <p className="mb-4">{syncMessage}</p>
            <div className="flex justify-end">
              <Button 
                onClick={() => setSyncDialogOpen(false)}
                variant="outline"
                disabled={syncMessage === "Synchronisiere Benutzer..."}
              >
                Schließen
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
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
                    <Badge variant={item.type === "service" ? "default" : "secondary"}>
                      {item.type === "service" ? "Dienstleistung" : "Produkt"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.type === "service" ? (
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {item.duration_minutes}min
                        </div>
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
                      className={item.is_favorite ? "text-warning" : "text-muted-foreground"}
                    >
                      {item.is_favorite ? <Star size={18} /> : <StarOff size={18} />}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Switch checked={item.active ?? true} onCheckedChange={() => handleToggleActive(item.id, item.active ?? true)} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}>
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash2 size={16} />
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
          <div className="text-center py-8 text-muted-foreground">
            Keine Einträge gefunden.
          </div>
        ) : (
          filteredItems.map((item) => (
            <div key={item.id} className="bg-background border border-border rounded-lg p-4 space-y-3">
              {/* Header Row */}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-lg truncate">{item.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={item.type === "service" ? "default" : "secondary"}>
                      {item.type === "service" ? "Dienstleistung" : "Produkt"}
                    </Badge>
                    {item.is_favorite && (
                      <Badge variant="outline" className="text-warning border-warning">
                        ⭐ Favorit
                      </Badge>
                    )}
                  </div>
                  {/* Service details for mobile */}
                  {item.type === "service" && (
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

              {/* Controls Row */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Favorit:</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleFavorite(item.id, item.is_favorite ?? false)}
                      className={`h-8 w-8 ${item.is_favorite ? "text-warning" : "text-muted-foreground"}`}
                    >
                      {item.is_favorite ? <Star size={16} /> : <StarOff size={16} />}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Aktiv:</span>
                    <Switch 
                      checked={item.active ?? true} 
                      onCheckedChange={() => handleToggleActive(item.id, item.active ?? true)}
                      size="sm"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenDialog(item)}>
                    <Pencil size={14} className="mr-1" />
                    Bearbeiten
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentItem ? "Produkt bearbeiten" : "Neues Produkt hinzufügen"}</DialogTitle>
            <DialogDescription>
              Füllen Sie die Felder aus, um{" "}
              {currentItem ? "das Produkt zu aktualisieren" : "ein neues Produkt hinzuzufügen"}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
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

                <div className="flex items-center justify-between">
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

            <div className="flex items-center justify-between">
              <Label htmlFor="is_favorite">Als Favorit markieren</Label>
              <Switch
                id="is_favorite"
                checked={formData.is_favorite}
                onCheckedChange={(checked) => setFormData({ ...formData, is_favorite: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="active">Aktiv</Label>
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleSaveItem} 
              disabled={isSubmitting || !formData.name || !formData.default_price || 
                       (formData.type === 'service' && !formData.duration_minutes)}
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
    </div>
  )
}