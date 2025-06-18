'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Building2, ImageIcon, Smartphone } from 'lucide-react'
import { useBusinessSettings } from '@/shared/hooks/business/useBusinessSettings'
import { CompanyInfoForm } from './CompanyInfoForm'
import { LogoUploadSection } from './LogoUploadSection'
import { AppLogoUploadSection } from './AppLogoUploadSection'
import { SettingsHeader } from '@/shared/components/settings/SettingsHeader'

export function BusinessSettingsPage() {
  const { settings, loading, isConfigured } = useBusinessSettings()
  const [activeTab, setActiveTab] = useState('company')

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Navigation */}
      <SettingsHeader
        title="Firma"
        description="Firmendaten, Logos und Design-Einstellungen"
        badge={{
          text: isConfigured ? "Konfiguriert" : "Nicht konfiguriert",
          variant: isConfigured ? "default" : "secondary"
        }}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="company" className="flex items-center space-x-2">
            <Building2 className="h-4 w-4" />
            <span>Firmendaten</span>
          </TabsTrigger>
          <TabsTrigger value="pdf-logo" className="flex items-center space-x-2">
            <ImageIcon className="h-4 w-4" />
            <span>PDF-Logo</span>
          </TabsTrigger>
          <TabsTrigger value="app-logos" className="flex items-center space-x-2">
            <Smartphone className="h-4 w-4" />
            <span>App-Logos</span>
          </TabsTrigger>
        </TabsList>

        {/* Firmendaten Tab */}
        <TabsContent value="company">
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle>Firmendaten</CardTitle>
              <CardDescription>
                Grundlegende Informationen über Ihr Unternehmen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CompanyInfoForm />
            </CardContent>
          </Card>
        </TabsContent>

        {/* PDF Logo Tab */}
        <TabsContent value="pdf-logo">
          <Card className="border-l-4 border-l-accent">
            <CardHeader>
              <CardTitle>PDF-Logo</CardTitle>
              <CardDescription>
                Logo für PDFs, Belege und Quittungen hochladen und verwalten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LogoUploadSection />
            </CardContent>
          </Card>
        </TabsContent>

        {/* App Logos Tab */}
        <TabsContent value="app-logos">
          <AppLogoUploadSection />
        </TabsContent>
      </Tabs>
    </div>
  )
}