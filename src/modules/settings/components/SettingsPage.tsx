'use client'

import { Calendar, Settings as SettingsIcon, Upload, UserCheck, Users, Wrench } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import { useOrganizationPermissions } from '@/shared/hooks/auth/useOrganizationPermissions'
import { PWAInstallCard } from './PWAInstallCard'

export function SettingsPage() {
  const { currentOrganization, memberships } = useCurrentOrganization()
  const { can, role, isAdmin, isOwner } = useOrganizationPermissions()

  // 🔗 Helper: Organization-aware URL builder
  const getOrgUrl = (path: string) =>
    currentOrganization ? `/org/${currentOrganization.slug}${path}` : path

  // Permission check - only admins and owners can manage team
  const canManageTeam = can('settings.manage_users') || isAdmin || isOwner

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Einstellungen</h1>
        <p className="text-muted-foreground">
          Verwalten Sie Ihre System-Einstellungen und Import-Funktionen
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* PWA Installation */}
        <PWAInstallCard />

        {/* Import-Funktionen */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Upload className="h-5 w-5 text-primary" />
              <CardTitle>Import</CardTitle>
            </div>
            <CardDescription>Importieren Sie historische Daten oder Testdaten</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">• Produkte & Services</p>
              <p className="text-sm text-muted-foreground">• Verkaufs-Historie</p>
              <p className="text-sm text-muted-foreground">• Ausgaben-Historie</p>
              <p className="text-sm text-muted-foreground">• Lieferanten & Partner</p>
              <Button asChild className="w-full mt-4">
                <Link href={getOrgUrl('/settings/import')}>Import-Center öffnen</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Verwaltung */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Wrench className="h-5 w-5 text-amber-600" />
              <CardTitle>Verwaltung</CardTitle>
            </div>
            <CardDescription>Kategorien, Lieferanten und operative Einstellungen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">• Ausgaben-Kategorien</p>
              <p className="text-sm text-muted-foreground">• Lieferanten verwalten</p>
              <p className="text-sm text-muted-foreground">• Lieferanten-Kategorien</p>
              <p className="text-sm text-muted-foreground">• CSV Import & Export</p>
              <Button asChild className="w-full mt-4">
                <Link href={getOrgUrl('/settings/management')}>Verwaltung öffnen</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mein Profil */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle>Mein Profil</CardTitle>
            </div>
            <CardDescription>
              Persönliche Informationen und Sicherheitseinstellungen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">• Name & E-Mail bearbeiten</p>
              <p className="text-sm text-muted-foreground">• Passwort ändern</p>
              <p className="text-sm text-muted-foreground">• Sicherheitseinstellungen</p>
              <Button asChild className="w-full mt-4">
                <Link href={getOrgUrl('/settings/profile')}>Profil bearbeiten</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Geschäfts-Einstellungen */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <SettingsIcon className="h-5 w-5 text-metric-yearly" />
              <CardTitle>Firma</CardTitle>
            </div>
            <CardDescription>Firmendaten und App-Design</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">• Firmendaten & Kontakt</p>
              <p className="text-sm text-muted-foreground">• PDF-Logo & App-Logos</p>
              <p className="text-sm text-muted-foreground">• Währung & Steuersatz</p>
              <Button asChild className="w-full mt-4">
                <Link href={getOrgUrl('/settings/business')}>Firma konfigurieren</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Termin-Einstellungen */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Termine</CardTitle>
            </div>
            <CardDescription>Geschäftszeiten, Urlaubszeiten und Buchungsregeln</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">• Arbeitszeiten & Pausen</p>
              <p className="text-sm text-muted-foreground">• Urlaubszeiten verwalten</p>
              <p className="text-sm text-muted-foreground">• Buchungsregeln & Timeline</p>
              <p className="text-sm text-muted-foreground">• Kalender-Anzeige-Optionen</p>
              <Button asChild className="w-full mt-4">
                <Link href={getOrgUrl('/appointments/settings')}>Termine konfigurieren</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Team Verwaltung - nur für Admins/Owners */}
        {canManageTeam && (
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5 text-primary" />
                <CardTitle>Team Verwaltung</CardTitle>
              </div>
              <CardDescription>
                Team-Mitglieder einladen und Berechtigungen verwalten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">• Neue Mitglieder einladen</p>
                <p className="text-sm text-muted-foreground">• Rollen und Berechtigungen</p>
                <Button asChild className="w-full mt-4">
                  <Link href={getOrgUrl('/settings/team')}>Team verwalten</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
