import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { 
  Upload, 
  Settings as SettingsIcon, 
  Users, 
  Database
} from "lucide-react"

export function SettingsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Einstellungen</h1>
        <p className="text-muted-foreground">
          Verwalten Sie Ihre System-Einstellungen und Import-Funktionen
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        
        {/* Import-Funktionen */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Upload className="h-5 w-5 text-primary" />
              <CardTitle>Import</CardTitle>
            </div>
            <CardDescription>
              Importieren Sie historische Daten oder Testdaten
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                • Produkte & Services
              </p>
              <p className="text-sm text-muted-foreground">
                • Verkaufs-Historie
              </p>
              <p className="text-sm text-muted-foreground">
                • Ausgaben-Historie
              </p>
              <p className="text-sm text-muted-foreground">
                • Lieferanten & Partner
              </p>
              <Button asChild className="w-full mt-4">
                <Link href="/settings/import">
                  Import-Center öffnen
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Lieferanten-Verwaltung */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle>Lieferanten</CardTitle>
            </div>
            <CardDescription>
              Verwalten Sie Ihre Lieferanten und Geschäftspartner
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                • Lieferanten erstellen & bearbeiten
              </p>
              <p className="text-sm text-muted-foreground">
                • Kategorien & Kontaktdaten
              </p>
              <p className="text-sm text-muted-foreground">
                • Ausgaben-Verknüpfung
              </p>
              <p className="text-sm text-muted-foreground">
                • CSV Import & Export
              </p>
              <Button asChild className="w-full mt-4">
                <Link href="/settings/suppliers">
                  Lieferanten verwalten
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Geschäfts-Einstellungen */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <SettingsIcon className="h-5 w-5 text-metric-yearly" />
              <CardTitle>Geschäft</CardTitle>
            </div>
            <CardDescription>
              Grundeinstellungen für Ihr Geschäft
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                • Geschäftsinformationen
              </p>
              <p className="text-sm text-muted-foreground">
                • Öffnungszeiten
              </p>
              <p className="text-sm text-muted-foreground">
                • Preiseinstellungen
              </p>
              <Button variant="outline" className="w-full mt-4" disabled>
                Bald verfügbar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Benutzer-Verwaltung */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-warning" />
              <CardTitle>Benutzer</CardTitle>
            </div>
            <CardDescription>
              Benutzer-Accounts und Berechtigungen verwalten
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                • Benutzer hinzufügen/entfernen
              </p>
              <p className="text-sm text-muted-foreground">
                • Rollen & Berechtigungen
              </p>
              <p className="text-sm text-muted-foreground">
                • Login-Einstellungen
              </p>
              <Button variant="outline" className="w-full mt-4" disabled>
                Bald verfügbar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System-Info */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-muted-foreground" />
              <CardTitle>System</CardTitle>
            </div>
            <CardDescription>
              System-Informationen und Wartung
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                • Datenbankstatus
              </p>
              <p className="text-sm text-muted-foreground">
                • Performance-Statistiken
              </p>
              <p className="text-sm text-muted-foreground">
                • Wartungs-Tools
              </p>
              <Button variant="outline" className="w-full mt-4" disabled>
                Bald verfügbar
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}