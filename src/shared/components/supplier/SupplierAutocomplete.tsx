'use client'

import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import { searchSuppliers } from '@/shared/services/supplierServices'
import type { Supplier, SupplierSearchResult } from '@/shared/types/suppliers'
import { SUPPLIER_CATEGORIES } from '@/shared/types/suppliers'
import { cn } from '@/shared/utils'

interface SupplierAutocompleteProps {
  value?: Supplier | null
  onSelect: (supplier: Supplier | null) => void
  onCreateNew: (name: string) => void
  placeholder?: string
  className?: string
}

export function SupplierAutocomplete({
  value,
  onSelect,
  onCreateNew,
  placeholder = 'Lieferant suchen...',
  className,
}: SupplierAutocompleteProps) {
  const { currentOrganization } = useCurrentOrganization()
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [suppliers, setSuppliers] = useState<SupplierSearchResult[]>([])
  const [loading, setLoading] = useState(false)

  // Search suppliers when searchValue changes
  useEffect(() => {
    const search = async () => {
      if (searchValue.length < 2 || !currentOrganization) {
        setSuppliers([])
        return
      }

      setLoading(true)
      try {
        const results = await searchSuppliers(searchValue, currentOrganization.id, {
          active_only: true,
          limit: 10,
        })
        setSuppliers(results)
      } catch (error) {
        console.error('Supplier search error:', error)
        setSuppliers([])
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(search, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchValue, currentOrganization])

  const handleSelect = (supplier: SupplierSearchResult) => {
    // Convert SupplierSearchResult to Supplier format for onSelect
    const fullSupplier: Supplier = {
      id: supplier.id,
      name: supplier.name,
      normalized_name: supplier.normalized_name,
      category: supplier.category,
      contact_email: null,
      contact_phone: null,
      website: null,
      address_line1: null,
      address_line2: null,
      postal_code: null,
      city: null,
      country: 'CH',
      iban: null,
      vat_number: null,
      is_active: true,
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: null,
      organization_id: currentOrganization?.id || null, // 🔒 Multi-Tenant Security
    }

    onSelect(fullSupplier)
    setOpen(false)
    setSearchValue('')
  }

  const handleCreateNew = () => {
    if (searchValue.trim()) {
      onCreateNew(searchValue.trim())
      setOpen(false)
      setSearchValue('')
    }
  }

  const displayValue = value ? value.name : ''

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
        >
          {displayValue || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Lieferant suchen..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>
              {loading ? (
                <div className="py-6 text-center text-sm text-muted-foreground">Suche läuft...</div>
              ) : searchValue.length < 2 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Mindestens 2 Zeichen eingeben...
                </div>
              ) : (
                <div className="py-2">
                  <div className="text-center text-sm text-muted-foreground mb-2">
                    Kein Lieferant gefunden
                  </div>
                  {searchValue.trim() && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={handleCreateNew}
                    >
                      <Plus className="mr-2 h-4 w-4" />"{searchValue}" erstellen
                    </Button>
                  )}
                </div>
              )}
            </CommandEmpty>

            {suppliers.length > 0 && (
              <CommandGroup>
                {suppliers.map((supplier) => (
                  <CommandItem
                    key={supplier.id}
                    value={supplier.name}
                    onSelect={() => handleSelect(supplier)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value?.id === supplier.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div>
                        <div className="font-medium">{supplier.name}</div>
                        {supplier.usage_count > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {supplier.usage_count} Ausgaben
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {SUPPLIER_CATEGORIES[supplier.category]}
                    </Badge>
                  </CommandItem>
                ))}

                {searchValue.trim() && (
                  <CommandItem onSelect={handleCreateNew}>
                    <Plus className="mr-2 h-4 w-4" />
                    <span>"{searchValue}" erstellen</span>
                  </CommandItem>
                )}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
