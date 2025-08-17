import { User } from 'lucide-react'
import { ProfileForm } from '@/modules/settings/components/profile/ProfileForm'
import { SettingsHeader } from '@/shared/components/settings/SettingsHeader'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'

export default function ProfileSettingsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <SettingsHeader
        title="Mein Profil"
        description="Verwalten Sie Ihre persönlichen Informationen und Sicherheitseinstellungen"
      />

      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle>Profil-Einstellungen</CardTitle>
          </div>
          <CardDescription>Aktualisieren Sie Ihre persönlichen Daten und Passwort</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm />
        </CardContent>
      </Card>
    </div>
  )
}
