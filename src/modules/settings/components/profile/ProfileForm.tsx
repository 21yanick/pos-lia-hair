'use client'

import { AlertCircle, Loader2, Lock, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Separator } from '@/shared/components/ui/separator'
import { useAuth } from '@/shared/hooks/auth/useAuth'
import { useProfile } from '@/shared/hooks/auth/useProfile'

export function ProfileForm() {
  const { user } = useAuth()
  const { updating, changingPassword, updateProfile, changePassword } = useProfile()
  const [error, setError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  // Profile form data
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
  })

  // Password form data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Load user data
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
      })
    }
  }, [user])

  // Handle profile input changes
  const handleProfileChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  // Handle password input changes
  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }))
    setPasswordError(null)
  }

  // Submit profile updates
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Basic validation
    if (!profileData.name.trim()) {
      setError('Name ist erforderlich')
      return
    }

    if (!profileData.email.trim()) {
      setError('E-Mail ist erforderlich')
      return
    }

    try {
      await updateProfile(profileData)
    } catch (_error) {
      setError('Fehler beim Speichern des Profils')
    }
  }

  // Submit password change
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)

    // Basic validation
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setPasswordError('Alle Passwort-Felder sind erforderlich')
      return
    }

    try {
      await changePassword(passwordData)
      // Clear form on success
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (_error) {
      // Error already handled in hook
    }
  }

  return (
    <div className="space-y-8">
      {/* Profile Information */}
      <form onSubmit={handleProfileSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Grunddaten</h3>
            </div>
            <p className="text-sm text-muted-foreground">Ihre persönlichen Informationen</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => handleProfileChange('name', e.target.value)}
                placeholder="Ihr vollständiger Name"
                className="bg-background border-input"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-Mail *</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => handleProfileChange('email', e.target.value)}
                placeholder="ihre@email.ch"
                className="bg-background border-input"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={updating}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {updating ? 'Speichere...' : 'Profil speichern'}
          </Button>
        </div>
      </form>

      <Separator />

      {/* Password Change */}
      <form onSubmit={handlePasswordSubmit} className="space-y-6">
        {passwordError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{passwordError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Lock className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Passwort ändern</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Aktualisieren Sie Ihr Passwort für mehr Sicherheit
            </p>
          </div>

          <div className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Aktuelles Passwort</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                placeholder="Ihr aktuelles Passwort"
                className="bg-background border-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Neues Passwort</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                placeholder="Mindestens 6 Zeichen"
                className="bg-background border-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                placeholder="Neues Passwort wiederholen"
                className="bg-background border-input"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={changingPassword} variant="outline">
            {changingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {changingPassword ? 'Ändere...' : 'Passwort ändern'}
          </Button>
        </div>
      </form>
    </div>
  )
}
