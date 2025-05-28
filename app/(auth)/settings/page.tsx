import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Upload, 
  Settings as SettingsIcon, 
  Users, 
  Download,
  Database
} from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Einstellungen</h1>
        <p className="text-muted-foreground">
          Verwalten Sie Ihre System-Einstellungen und Import-Funktionen
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        {/* Import-Funktionen */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Upload className="h-5 w-5 text-blue-600" />
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
              <Button asChild className="w-full mt-4">
                <Link href="/settings/import">
                  Import-Center öffnen
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Export/Backup */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Download className="h-5 w-5 text-green-600" />
              <CardTitle>Export & Backup</CardTitle>
            </div>
            <CardDescription>
              Exportieren Sie Ihre Daten für Backup oder Migration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                • Vollständiger Daten-Export
              </p>
              <p className="text-sm text-muted-foreground">
                • Backup-Archive erstellen
              </p>
              <p className="text-sm text-muted-foreground">
                • Selektive Exports
              </p>
              <Button variant="outline" className="w-full mt-4" disabled>
                Bald verfügbar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Geschäfts-Einstellungen */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <SettingsIcon className="h-5 w-5 text-purple-600" />
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
              <Users className="h-5 w-5 text-orange-600" />
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
              <Database className="h-5 w-5 text-gray-600" />
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