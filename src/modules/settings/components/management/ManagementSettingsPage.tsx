'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Tag, Users, Wrench, Building2 } from 'lucide-react'
import { ExpenseCategoriesForm } from '../business/ExpenseCategoriesForm'
import { SupplierCategoriesForm } from '../business/SupplierCategoriesForm'
import { SuppliersPage } from '../suppliers/SuppliersPage'
import { SettingsHeader } from '@/shared/components/settings/SettingsHeader'

export function ManagementSettingsPage() {
  const [activeTab, setActiveTab] = useState('expense-categories')

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <SettingsHeader
        title="Verwaltung"
        description="Kategorien und operative Einstellungen für Ihr Business"
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="expense-categories" className="flex items-center space-x-2">
            <Tag className="h-4 w-4" />
            <span>Ausgaben-Kategorien</span>
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex items-center space-x-2">
            <Building2 className="h-4 w-4" />
            <span>Lieferanten</span>
          </TabsTrigger>
          <TabsTrigger value="supplier-categories" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Lieferanten-Kategorien</span>
          </TabsTrigger>
        </TabsList>

        {/* Ausgaben-Kategorien Tab */}
        <TabsContent value="expense-categories">
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
        </TabsContent>

        {/* Lieferanten Tab */}
        <TabsContent value="suppliers">
          <SuppliersPage hideHeader={true} />
        </TabsContent>

        {/* Lieferanten-Kategorien Tab */}
        <TabsContent value="supplier-categories">
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
        </TabsContent>
      </Tabs>
    </div>
  )
}