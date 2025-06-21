'use client'

import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { ArrowLeft, Building2 } from 'lucide-react'
import Link from 'next/link'

export default function CreateOrganizationPage() {
  return (
    <div className="container mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <Link href="/organizations">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zur Auswahl
          </Button>
        </Link>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Neue Organisation erstellen</h1>
          <p className="text-muted-foreground mt-2">
            Erstellen Sie eine neue Organisation für Ihr Unternehmen.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <CardTitle>Organisation erstellen</CardTitle>
          <CardDescription>
            Diese Funktion wird in Week 4 implementiert.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground mb-6">
            Während der Multi-Tenant Implementation wird hier ein vollständiges 
            Formular zur Organisation-Erstellung verfügbar sein.
          </p>
          
          <div className="space-y-4">
            <div className="text-left space-y-2">
              <h4 className="font-medium">Geplante Features:</h4>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Organisation Name & Slug</li>
                <li>Geschäftsinformationen</li>
                <li>Logo Upload</li>
                <li>Grundeinstellungen</li>
              </ul>
            </div>
            
            <Link href="/organizations">
              <Button className="w-full">
                Zurück zur Organisation-Auswahl
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}