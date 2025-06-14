"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Badge } from "@/shared/components/ui/badge"
import { useToast } from "@/shared/hooks/core/useToast"
import { Plus, Search, Filter, Users, Building2, Upload } from "lucide-react"
import { SupplierCreateDialog } from '@/shared/components/supplier/SupplierCreateDialog'
import { SupplierList } from './SupplierList'
import { getSuppliers } from '@/shared/services/supplierServices'
import { SUPPLIER_CATEGORIES } from '@/shared/types/suppliers'
import { supabase } from "@/shared/lib/supabase/client"
import type { Supplier, SupplierCategory } from '@/shared/types/suppliers'
import Link from 'next/link'

export function SuppliersPage() {
  const { toast } = useToast()
  
  // State
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  
  // Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [activeFilter, setActiveFilter] = useState<string>('all')
  
  // Stats State
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    categories: {} as Record<SupplierCategory, number>
  })

  // Load current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (userData?.user) {
        setCurrentUserId(userData.user.id)
      }
    }
    getCurrentUser()
  }, [])

  // Load suppliers
  const loadSuppliers = async () => {
    setLoading(true)
    try {
      const { data, count } = await getSuppliers({
        active_only: activeFilter === 'active',
        category: categoryFilter !== 'all' ? categoryFilter as SupplierCategory : undefined,
        search: searchQuery || undefined
      })
      
      setSuppliers(data)
      
      // Calculate stats
      const activeCount = data.filter(s => s.is_active).length
      const categoryStats = data.reduce((acc, supplier) => {
        acc[supplier.category] = (acc[supplier.category] || 0) + 1
        return acc
      }, {} as Record<SupplierCategory, number>)
      
      setStats({
        total: count || data.length,
        active: activeCount,
        categories: categoryStats
      })
      
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Lieferanten konnten nicht geladen werden",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Load suppliers on mount and filter changes
  useEffect(() => {
    loadSuppliers()
  }, [searchQuery, categoryFilter, activeFilter])

  // Handle supplier created
  const handleSupplierCreated = (supplier: Supplier) => {
    loadSuppliers() // Refresh list
    toast({
      title: "Erfolg",
      description: "Lieferant wurde erfolgreich erstellt"
    })
  }

  // Filtered stats for display
  const displayStats = {
    ...stats,
    filtered: suppliers.length
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Lieferanten</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Lieferanten und Geschäftspartner
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" asChild>
            <Link href="/settings/import">
              <Upload className="h-4 w-4 mr-2" />
              CSV Import
            </Link>
          </Button>
          
          {currentUserId && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Neuer Lieferant
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {displayStats.filtered !== displayStats.total && `${displayStats.filtered} gefiltert`}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktiv</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayStats.active}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((displayStats.active / displayStats.total) * 100) || 0}% der Lieferanten
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Kategorie</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {Object.keys(displayStats.categories).length > 0 ? (
              <>
                <div className="text-2xl font-bold">
                  {Math.max(...Object.values(displayStats.categories))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {SUPPLIER_CATEGORIES[
                    Object.entries(displayStats.categories)
                      .reduce((a, b) => a[1] > b[1] ? a : b)[0] as SupplierCategory
                  ]}
                </p>
              </>
            ) : (
              <div className="text-2xl font-bold">-</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kategorien</CardTitle>
            <Badge variant="secondary">{Object.keys(displayStats.categories).length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(displayStats.categories).length}</div>
            <p className="text-xs text-muted-foreground">
              verschiedene Kategorien
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter & Suche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nach Namen suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Kategorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kategorien</SelectItem>
                {Object.entries(SUPPLIER_CATEGORIES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label} ({displayStats.categories[key as SupplierCategory] || 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Active Filter */}
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="active">Nur Aktive</SelectItem>
                <SelectItem value="inactive">Nur Inaktive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Suppliers List */}
      <Card>
        <CardHeader>
          <CardTitle>Lieferanten ({suppliers.length})</CardTitle>
          <CardDescription>
            Übersicht aller Lieferanten mit Details und Aktionen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SupplierList 
            suppliers={suppliers}
            loading={loading}
            onSupplierUpdated={loadSuppliers}
          />
        </CardContent>
      </Card>

      {/* Create Dialog */}
      {currentUserId && (
        <SupplierCreateDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSuccess={handleSupplierCreated}
          userId={currentUserId}
        />
      )}
    </div>
  )
}