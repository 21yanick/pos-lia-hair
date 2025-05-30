"use client"

import { Loader2, Search, X, Scissors, Package, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useItems } from "@/lib/hooks/business/useItems"
import type { ProductTab } from "../hooks/usePOSState"
import type { Item } from "@/lib/hooks/business/useItems"

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
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            placeholder="Suche nach Produkten oder Dienstleistungen..."
            className="pl-12 pr-12 h-12 text-base bg-background/50 backdrop-blur-sm border-border focus:border-primary focus:ring-primary/20 rounded-xl shadow-sm"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 rounded-lg hover:bg-accent"
              onClick={onClearSearch}
            >
              <X size={18} />
            </Button>
          )}
        </div>

        {/* Moderne Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as ProductTab)} className="w-full">
          <TabsList className="w-full h-12 p-1 bg-muted/70 backdrop-blur-sm rounded-xl grid grid-cols-3">
            <TabsTrigger 
              value="favorites" 
              className="text-sm font-medium px-4 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-category-favorite flex items-center gap-2"
            >
              <Heart size={16} />
              <span className="hidden sm:inline">Favoriten</span>
              <span className="sm:hidden">Favs</span>
            </TabsTrigger>
            <TabsTrigger 
              value="services" 
              className="text-sm font-medium px-4 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-category-service flex items-center gap-2"
            >
              <Scissors size={16} />
              <span className="hidden sm:inline">Dienstleistungen</span>
              <span className="sm:hidden">Services</span>
            </TabsTrigger>
            <TabsTrigger 
              value="products" 
              className="text-sm font-medium px-4 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-category-product flex items-center gap-2"
            >
              <Package size={16} />
              <span className="hidden sm:inline">Produkte</span>
              <span className="sm:hidden">Products</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Produkt-Grid */}
      <div className="flex-1 h-0 overflow-y-auto bg-gradient-to-br from-muted/50 to-background/80 backdrop-blur-sm rounded-2xl border border-border shadow-sm p-6">
        {itemsLoading ? (
          <div className="flex flex-col justify-center items-center py-16">
            <div className="relative">
              <Loader2 size={40} className="animate-spin text-primary" />
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse"></div>
            </div>
            <span className="mt-4 text-muted-foreground font-medium">Produkte werden geladen...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className={`group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl border-0 shadow-sm relative overflow-hidden ${
                  item.type === "service" 
                    ? "bg-gradient-to-br from-category-service-bg to-category-service/5 hover:from-category-service/10 hover:to-category-service/5" 
                    : "bg-gradient-to-br from-category-product-bg to-category-product/5 hover:from-category-product/10 hover:to-category-product/5"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Product clicked:', item.name); // Debug
                  onAddToCart(item);
                }}
              >
                <CardContent className="p-4 flex flex-col items-center justify-center h-full min-h-[140px] relative">
                  {/* Favorite Badge */}
                  {item.is_favorite && (
                    <div className="absolute top-2 right-2 bg-category-favorite text-category-favorite-foreground rounded-full p-1.5 shadow-lg z-10">
                      <Heart size={16} className="fill-current" />
                    </div>
                  )}
                  
                  {/* Service/Product Icon */}
                  <div className={`mb-4 p-3 rounded-xl ${
                    item.type === "service" 
                      ? "bg-category-service/20 text-category-service" 
                      : "bg-category-product/20 text-category-product"
                  }`}>
                    {item.type === "service" ? (
                      <Scissors size={24} />
                    ) : (
                      <Package size={24} />
                    )}
                  </div>
                  
                  {/* Item Name */}
                  <div className="font-semibold text-center mb-4 line-clamp-2 w-full text-base leading-tight text-foreground">
                    {item.name}
                  </div>
                  
                  {/* Price */}
                  <div className={`text-base font-semibold px-3 py-1.5 rounded-lg ${
                    item.type === "service"
                      ? "bg-category-service/10 text-category-service"
                      : "bg-category-product/10 text-category-product"
                  }`}>
                    CHF {item.default_price.toFixed(2)}
                  </div>
                  
                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-background/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"></div>
                </CardContent>
              </Card>
            ))}

            {!itemsLoading && filteredItems.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground">
                <div className="p-4 bg-muted rounded-full mb-4">
                  <Search size={32} className="text-muted-foreground" />
                </div>
                <p className="text-lg font-medium mb-2">Keine Einträge gefunden</p>
                <p className="text-sm">Versuchen Sie eine andere Suche oder wählen Sie einen anderen Tab</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}