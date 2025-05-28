"use client"

import { Loader2, Search, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useItems } from "@/lib/hooks/business/useItems"
import type { ProductTab } from "@/lib/hooks/business/usePOSState"
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
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab =
      (activeTab === "services" && item.type === "service") ||
      (activeTab === "products" && item.type === "product") ||
      (activeTab === "favorites" && item.is_favorite)

    return matchesSearch && matchesTab && item.active // Nur aktive Items anzeigen
  })

  return (
    <div className="w-full md:w-2/3 flex flex-col h-full md:pr-4 mb-4 md:mb-0">
      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Suche nach Produkten oder Dienstleistungen..."
            className="pl-10 h-12 text-lg"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={onClearSearch}
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
        <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as ProductTab)} className="w-full sm:w-auto">
          <TabsList className="w-full h-12 grid grid-cols-3">
            <TabsTrigger value="services" className="text-base px-4 py-2">Dienstleistungen</TabsTrigger>
            <TabsTrigger value="products" className="text-base px-4 py-2">Produkte</TabsTrigger>
            <TabsTrigger value="favorites" className="text-base px-4 py-2">Favoriten</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-y-auto bg-white rounded-md border border-gray-200 p-4">
        {itemsLoading ? (
          <div className="col-span-full flex justify-center items-center py-10">
            <Loader2 size={30} className="animate-spin mr-2" />
            <span>Produkte werden geladen...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className={`cursor-pointer hover:shadow-md transition-all ${
                  item.type === "service" 
                    ? "bg-blue-50 hover:border-blue-300" 
                    : "bg-green-50 hover:border-green-300"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  onAddToCart(item);
                }}
              >
                <CardContent className="p-3 md:p-4 flex flex-col items-center justify-center h-auto min-h-[120px] md:min-h-[140px]">
                  <div className="absolute top-2 right-2">
                    {item.is_favorite && <span className="text-yellow-500 text-xs">⭐</span>}
                  </div>
                  
                  <div className={`text-xs font-medium uppercase mb-1 ${
                    item.type === "service" ? "text-blue-600" : "text-green-600"
                  }`}>
                    {item.type === "service" ? 
                      (window.innerWidth < 640 ? "Dienstl." : "Dienstleistung") : 
                      "Produkt"}
                  </div>
                  
                  <div className="font-medium text-center mb-2 line-clamp-2 w-full overflow-hidden text-sm md:text-base">
                    {item.name}
                  </div>
                  <div className="text-base md:text-lg font-bold">CHF {item.default_price.toFixed(2)}</div>
                </CardContent>
              </Card>
            ))}

            {!itemsLoading && filteredItems.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">Keine Einträge gefunden.</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}