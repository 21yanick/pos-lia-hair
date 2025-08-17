'use client'

import { Check, ChevronsUpDown, Plus, User } from 'lucide-react'
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
import type { Customer } from '@/shared/services/customerService'
import { createCustomer, searchCustomers } from '@/shared/services/customerService'
import { cn } from '@/shared/utils'

interface CustomerAutocompleteProps {
  value?: Customer | null
  onSelect: (customer: Customer | null) => void
  onCreateNew?: (customer: Customer) => void
  placeholder?: string
  className?: string
  allowCreateNew?: boolean
}

export function CustomerAutocomplete({
  value,
  onSelect,
  onCreateNew,
  placeholder = 'Kunde suchen...',
  className,
  allowCreateNew = true,
}: CustomerAutocompleteProps) {
  const { currentOrganization } = useCurrentOrganization()
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)

  // Search customers when searchValue changes
  useEffect(() => {
    const search = async () => {
      if (searchValue.length < 2 || !currentOrganization) {
        setCustomers([])
        return
      }

      setLoading(true)
      try {
        const results = await searchCustomers(currentOrganization.id, searchValue)
        setCustomers(results)
      } catch (error) {
        console.error('Customer search error:', error)
        setCustomers([])
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(search, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchValue, currentOrganization])

  const handleSelect = (customer: Customer) => {
    onSelect(customer)
    setOpen(false)
    setSearchValue('')
  }

  const handleCreateNew = async () => {
    if (!searchValue.trim() || !currentOrganization || creating) return

    setCreating(true)
    try {
      const newCustomer = await createCustomer(currentOrganization.id, {
        name: searchValue.trim(),
      })

      onSelect(newCustomer)
      onCreateNew?.(newCustomer)
      setOpen(false)
      setSearchValue('')
    } catch (error) {
      console.error('Error creating customer:', error)
    } finally {
      setCreating(false)
    }
  }

  const handleClear = () => {
    onSelect(null)
    setOpen(false)
    setSearchValue('')
  }

  const _displayValue = value ? value.name : ''

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
        >
          <div className="flex items-center">
            {value ? (
              <>
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                <div className="text-left">
                  <div className="font-medium">{value.name}</div>
                  {value.phone && (
                    <div className="text-xs text-muted-foreground">{value.phone}</div>
                  )}
                </div>
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Kunde suchen..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>
              {loading ? (
                <div className="py-6 text-center text-sm text-muted-foreground">Suche läuft...</div>
              ) : creating ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Kunde wird erstellt...
                </div>
              ) : searchValue.length < 2 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Mindestens 2 Zeichen eingeben...
                </div>
              ) : (
                <div className="py-2">
                  <div className="text-center text-sm text-muted-foreground mb-2">
                    Kein Kunde gefunden
                  </div>
                  {searchValue.trim() && allowCreateNew && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={handleCreateNew}
                      disabled={creating}
                    >
                      <Plus className="mr-2 h-4 w-4" />"{searchValue}" als neuen Kunden erstellen
                    </Button>
                  )}
                </div>
              )}
            </CommandEmpty>

            {customers.length > 0 && (
              <CommandGroup>
                {/* Clear selection option */}
                {value && (
                  <CommandItem onSelect={handleClear} className="text-muted-foreground">
                    <div className="flex items-center">
                      <div className="mr-2 h-4 w-4" /> {/* Spacer */}
                      Keine Kundenauswahl
                    </div>
                  </CommandItem>
                )}

                {customers.map((customer) => (
                  <CommandItem
                    key={customer.id}
                    value={customer.name}
                    onSelect={() => handleSelect(customer)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value?.id === customer.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {customer.phone && customer.email
                            ? `${customer.phone} • ${customer.email}`
                            : customer.phone || customer.email || 'Keine Kontaktdaten'}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      <User className="mr-1 h-3 w-3" />
                      Kunde
                    </Badge>
                  </CommandItem>
                ))}

                {searchValue.trim() && allowCreateNew && (
                  <CommandItem onSelect={handleCreateNew} disabled={creating}>
                    <Plus className="mr-2 h-4 w-4" />
                    <span>"{searchValue}" als neuen Kunden erstellen</span>
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
