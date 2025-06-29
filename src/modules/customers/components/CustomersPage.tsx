'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, Plus, Users, Loader2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import { useCustomersQuery } from '../hooks/useCustomersQuery'
import { matchesSearchQuery } from '../utils/customerUtils'
import { CustomerCard } from './CustomerCard'
import { CustomerCreateDialog } from './CustomerCreateDialog'

export function CustomersPage() {
  const { currentOrganization } = useCurrentOrganization()
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  
  // Use debounced search query for API calls
  const [debouncedQuery, setDebouncedQuery] = useState('')
  
  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [searchQuery])

  const { 
    data: customers = [], 
    isLoading, 
    error 
  } = useCustomersQuery(currentOrganization?.id || '', debouncedQuery)

  // Client-side filtering for immediate feedback
  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return customers
    return customers.filter(customer => matchesSearchQuery(customer, searchQuery))
  }, [customers, searchQuery])

  const handleCreateSuccess = () => {
    // Dialog will close automatically, query will refetch
  }

  if (!currentOrganization) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Lade Organisation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Kunden</h1>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Neuen Kunden erstellen
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Kunde suchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-destructive font-medium">Fehler beim Laden der Kunden</p>
              <p className="text-sm text-muted-foreground mt-1">
                Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <div className="mt-3 pt-3 border-t">
                  <Skeleton className="h-3 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State - No Customers */}
      {!isLoading && !error && filteredCustomers.length === 0 && !searchQuery && (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Noch keine Kunden</h3>
              <p className="text-muted-foreground mb-6">
                Erstellen Sie Ihren ersten Kunden, um loszulegen.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Ersten Kunden erstellen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State - No Search Results */}
      {!isLoading && !error && filteredCustomers.length === 0 && searchQuery && (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Keine Kunden gefunden</h3>
              <p className="text-muted-foreground mb-6">
                Keine Kunden entsprechen Ihrer Suche "{searchQuery}".
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setSearchQuery('')}>
                  Suche zurücksetzen
                </Button>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Neuen Kunden erstellen
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Grid */}
      {!isLoading && !error && filteredCustomers.length > 0 && (
        <>
          {/* Results Count */}
          <div className="text-sm text-muted-foreground">
            {filteredCustomers.length} Kunde{filteredCustomers.length !== 1 ? 'n' : ''} 
            {searchQuery && ` für "${searchQuery}"`}
          </div>

          {/* Customer Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCustomers.map((customer) => (
              <CustomerCard 
                key={customer.id} 
                customer={customer}
              />
            ))}
          </div>
        </>
      )}

      {/* Create Dialog */}
      <CustomerCreateDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  )
}