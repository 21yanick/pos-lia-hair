'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Tag, Users, Wrench, Building2 } from 'lucide-react'
import { ExpenseCategoriesForm } from '../business/ExpenseCategoriesForm'
import { SupplierCategoriesForm } from '../business/SupplierCategoriesForm'
import { SuppliersPage } from '../suppliers/SuppliersPage'
import { SettingsHeader } from '@/shared/components/settings/SettingsHeader'

// Tab Configuration
const TABS = [
  {
    id: 'expense-categories',
    label: 'Ausgaben-Kategorien',
    icon: Tag,
    title: 'Ausgaben-Kategorien'
  },
  {
    id: 'suppliers', 
    label: 'Lieferanten',
    icon: Building2,
    title: 'Lieferanten'
  },
  {
    id: 'supplier-categories',
    label: 'Lieferanten-Kategorien', 
    icon: Users,
    title: 'Lieferanten-Kategorien'
  }
] as const

export function ManagementSettingsPage() {
  const [activeTab, setActiveTab] = useState('expense-categories')

  return (
    <div className="container mx-auto px-2 py-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <SettingsHeader
        title="Verwaltung"
        description="Kategorien und operative Einstellungen für Ihr Business"
      />

      {/* Mobile: Dropdown Navigation */}
      <div className="md:hidden">
        <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Navigation auswählen" />
          </SelectTrigger>
          <SelectContent>
            {TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <SelectItem key={tab.id} value={tab.id}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop: Button Navigation */}
      <div className="hidden md:flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <Button 
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center space-x-2 whitespace-nowrap"
              title={tab.title}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </Button>
          )
        })}
      </div>

      {/* Content - Conditional Rendering */}
      {activeTab === 'expense-categories' && (
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Tag className="h-5 w-5 text-primary" />
              <CardTitle>Ausgaben-Kategorien</CardTitle>
            </div>
            <CardDescription>
              Verwalten Sie Kategorien für die Ausgaben-Erfassung
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExpenseCategoriesForm />
          </CardContent>
        </Card>
      )}

      {activeTab === 'suppliers' && (
        <SuppliersPage hideHeader={true} />
      )}

      {activeTab === 'supplier-categories' && (
        <Card className="border-l-4 border-l-accent">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-accent" />
              <CardTitle>Lieferanten-Kategorien</CardTitle>
            </div>
            <CardDescription>
              Verwalten Sie Kategorien für die Lieferanten-Organisation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SupplierCategoriesForm />
          </CardContent>
        </Card>
      )}
    </div>
  )
}