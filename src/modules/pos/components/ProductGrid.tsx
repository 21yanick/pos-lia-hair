"use client"

import { Loader2, Search, X, Scissors, Package, Heart } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Badge } from "@/shared/components/ui/badge"
import { useItems } from "@/shared/hooks/business/useItems"
import type { ProductTab } from "@/shared/hooks/business/usePOSState"
import type { Item } from "@/shared/hooks/business/useItems"

interface ProductGridProps {
  activeTab: ProductTab
  searchQuery: string
  onTabChange: (tab: ProductTab) => void
  onSearchChange: (query: string) => void
  onClearSearch: () => void
  onAddToCart: (item: Item) => void
}

export function ProductGrid({
  activeTab,
  searchQuery,
  onTabChange,
  onSearchChange,
  onClearSearch,
  onAddToCart,
}: ProductGridProps) {
  const { items, loading: itemsLoading } = useItems()

  // Filtern der Produkte/Dienstleistungen
  const filteredItems = (items || []).filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab =
      (activeTab === "services" && item.type === "service") ||
      (activeTab === "products" && item.type === "product") ||
      (activeTab === "favorites" && item.is_favorite)

    return matchesSearch && matchesTab && item.active // Nur aktive Items anzeigen
  })

  return (
    <div className="w-full md:w-2/3 flex flex-col h-full">
      {/* Header mit Suchfeld und Tabs */}
      <div className="mb-4 space-y-3 flex-shrink-0">
        {/* Suchfeld */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Suche nach Produkten..."
            className="pl-10 pr-10 h-10"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
              onClick={onClearSearch}
            >
              <X size={16} />
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as ProductTab)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Heart size={14} />
              <span className="hidden sm:inline">Favoriten</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Scissors size={14} />
              <span className="hidden sm:inline">Services</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package size={14} />
              <span className="hidden sm:inline">Produkte</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Produkt-Grid */}
      <div className="flex-1 overflow-y-auto">
        {itemsLoading ? (
          <div className="flex flex-col justify-center items-center py-16">
            <Loader2 size={32} className="animate-spin text-primary" />
            <span className="mt-4 text-muted-foreground">Laden...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  onAddToCart(item);
                }}
              >
                <CardContent className="p-4 flex flex-col items-center text-center min-h-[120px]">
                  {/* Favorite Badge */}
                  {item.is_favorite && (
                    <div className="self-end mb-2">
                      <Heart size={14} className="text-accent fill-current" />
                    </div>
                  )}
                  
                  {/* Service/Product Icon */}
                  <div className={`mb-3 p-2 rounded-md ${
                    item.type === "service" 
                      ? "bg-primary/10 text-primary" 
                      : "bg-secondary/80 text-secondary-foreground"
                  }`}>
                    {item.type === "service" ? (
                      <Scissors size={18} />
                    ) : (
                      <Package size={18} />
                    )}
                  </div>
                  
                  {/* Item Name */}
                  <div className="font-medium text-sm mb-3 line-clamp-2 flex-1">
                    {item.name}
                  </div>
                  
                  {/* Price */}
                  <div className="text-sm font-semibold">
                    CHF {item.default_price.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
            ))}

            {!itemsLoading && filteredItems.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Search size={24} className="mb-3" />
                <p className="font-medium mb-1">Keine Einträge gefunden</p>
                <p className="text-sm">Andere Suche oder Tab versuchen</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}