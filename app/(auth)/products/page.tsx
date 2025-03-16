"use client"

import { useState } from "react"
import { Search, Plus, Pencil, Trash2, Star, StarOff } from "lucide-react"
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

// Mock data
const mockProducts = [
  {
    id: "1",
    name: "Damen Haarschnitt",
    type: "service",
    price: 65.0,
    description: "Standardschnitt für Damen",
    isFavorite: true,
    isActive: true,
  },
  {
    id: "2",
    name: "Herren Haarschnitt",
    type: "service",
    price: 45.0,
    description: "Standardschnitt für Herren",
    isFavorite: true,
    isActive: true,
  },
  {
    id: "3",
    name: "Kinder Haarschnitt",
    type: "service",
    price: 35.0,
    description: "Schnitt für Kinder bis 12 Jahre",
    isFavorite: false,
    isActive: true,
  },
  {
    id: "4",
    name: "Färben",
    type: "service",
    price: 85.0,
    description: "Komplettes Färben",
    isFavorite: true,
    isActive: true,
  },
  {
    id: "5",
    name: "Strähnen",
    type: "service",
    price: 95.0,
    description: "Strähnen mit Folie",
    isFavorite: false,
    isActive: true,
  },
  {
    id: "6",
    name: "Shampoo",
    type: "product",
    price: 18.5,
    description: "Professionelles Shampoo",
    isFavorite: false,
    isActive: true,
  },
  {
    id: "7",
    name: "Conditioner",
    type: "product",
    price: 16.5,
    description: "Pflegender Conditioner",
    isFavorite: false,
    isActive: true,
  },
  {
    id: "8",
    name: "Haarspray",
    type: "product",
    price: 22.0,
    description: "Starker Halt",
    isFavorite: true,
    isActive: true,
  },
  {
    id: "9",
    name: "Styling Gel",
    type: "product",
    price: 19.5,
    description: "Für flexiblen Halt",
    isFavorite: false,
    isActive: false,
  },
]

type Product = (typeof mockProducts)[0]

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "service",
    price: "",
    description: "",
    isFavorite: false,
    isActive: true,
  })

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter =
      filter === "all" ||
      (filter === "services" && product.type === "service") ||
      (filter === "products" && product.type === "product") ||
      (filter === "favorites" && product.isFavorite)

    return matchesSearch && matchesFilter
  })

  const handleOpenDialog = (product: Product | null = null) => {
    if (product) {
      setCurrentProduct(product)
      setFormData({
        name: product.name,
        type: product.type,
        price: product.price.toString(),
        description: product.description,
        isFavorite: product.isFavorite,
        isActive: product.isActive,
      })
    } else {
      setCurrentProduct(null)
      setFormData({
        name: "",
        type: "service",
        price: "",
        description: "",
        isFavorite: false,
        isActive: true,
      })
    }
    setIsDialogOpen(true)
  }

  const handleSaveProduct = () => {
    const newProduct = {
      id: currentProduct?.id || Date.now().toString(),
      name: formData.name,
      type: formData.type as "service" | "product",
      price: Number.parseFloat(formData.price),
      description: formData.description,
      isFavorite: formData.isFavorite,
      isActive: formData.isActive,
    }

    if (currentProduct) {
      // Update existing product
      setProducts((prevProducts) => prevProducts.map((p) => (p.id === currentProduct.id ? newProduct : p)))
    } else {
      // Add new product
      setProducts((prevProducts) => [...prevProducts, newProduct])
    }

    setIsDialogOpen(false)
  }

  const toggleFavorite = (id: string) => {
    setProducts((prevProducts) => prevProducts.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)))
  }

  const toggleActive = (id: string) => {
    setProducts((prevProducts) => prevProducts.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p)))
  }

  const handleDeleteProduct = (id: string) => {
    if (confirm("Sind Sie sicher, dass Sie dieses Produkt löschen möchten?")) {
      setProducts((prevProducts) => prevProducts.filter((p) => p.id !== id))
    }
  }

  return (
    <div className="space-y-6">
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
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Keine Einträge gefunden.
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <Badge variant={product.type === "service" ? "default" : "secondary"}>
                      {product.type === "service" ? "Dienstleistung" : "Produkt"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavorite(product.id)}
                      className={product.isFavorite ? "text-yellow-500" : "text-gray-400"}
                    >
                      {product.isFavorite ? <Star size={18} /> : <StarOff size={18} />}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Switch checked={product.isActive} onCheckedChange={() => toggleActive(product.id)} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(product)}>
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={() => handleDeleteProduct(product.id)}
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
            <DialogTitle>{currentProduct ? "Produkt bearbeiten" : "Neues Produkt hinzufügen"}</DialogTitle>
            <DialogDescription>
              Füllen Sie die Felder aus, um{" "}
              {currentProduct ? "das Produkt zu aktualisieren" : "ein neues Produkt hinzuzufügen"}.
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
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
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
              <Label htmlFor="price">Preis (CHF)</Label>
              <Input
                id="price"
                type="number"
                step="0.05"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung (optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="favorite">Als Favorit markieren</Label>
              <Switch
                id="favorite"
                checked={formData.isFavorite}
                onCheckedChange={(checked) => setFormData({ ...formData, isFavorite: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="active">Aktiv</Label>
              <Switch
                id="active"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSaveProduct} disabled={!formData.name || !formData.price}>
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

