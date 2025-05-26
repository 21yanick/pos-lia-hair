"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Pencil, Trash2, Star, StarOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/lib/hooks/core/useToast"
import { useItems, type Item, type ItemInsert } from "@/lib/hooks/business/useItems"

export default function ProductsPage() {
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
      console.log('Berechtigungsfehler erkannt, versuche Auth-Benutzer zu synchronisieren...');
      
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
        is_favorite: item.is_favorite,
        active: item.active,
      })
    } else {
      setCurrentItem(null)
      setFormData({
        name: "",
        type: "service",
        default_price: "",
        is_favorite: false,
        active: true,
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
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
          <h3 className="font-semibold text-yellow-800 mb-2">Probleme mit der Datenbankkonfiguration erkannt</h3>
          <p className="text-sm text-yellow-700 mb-3">
            Es scheint ein Problem mit den Datenbankberechtigungen zu geben. Möglicherweise ist Ihr Benutzer nicht korrekt mit der Datenbank verknüpft.
          </p>
          <Button onClick={handleManualSync} className="bg-yellow-500 hover:bg-yellow-600">
            Benutzer synchronisieren
          </Button>
        </div>
      )}
      
      {/* Sync-Dialog */}
      {syncDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-md w-full rounded-lg">
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
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

      <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead className="text-right">Preis (CHF)</TableHead>
              <TableHead>Favorit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex justify-center items-center">
                    <Loader2 size={24} className="animate-spin mr-2" />
                    <span>Daten werden geladen...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
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
                  <TableCell className="text-right">{item.default_price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleFavorite(item.id, item.is_favorite)}
                      className={item.is_favorite ? "text-yellow-500" : "text-gray-400"}
                    >
                      {item.is_favorite ? <Star size={18} /> : <StarOff size={18} />}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Switch checked={item.active} onCheckedChange={() => handleToggleActive(item.id, item.active)} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}>
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
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
              disabled={isSubmitting || !formData.name || !formData.default_price}
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

