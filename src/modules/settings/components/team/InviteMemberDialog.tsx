'use client'

import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/shared/components/ui/select'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Badge } from '@/shared/components/ui/badge'
import { 
  Mail, 
  Crown, 
  Shield, 
  User, 
  Send, 
  Copy,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import { useAuth } from '@/shared/hooks/auth/useAuth'

interface InviteMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Role = 'staff' | 'admin' | 'owner'

const ROLE_CONFIG = {
  staff: {
    label: 'Mitarbeiter',
    description: 'Kann Verkäufe durchführen und grundlegende Funktionen nutzen',
    icon: User,
    color: 'default'
  },
  admin: {
    label: 'Administrator', 
    description: 'Vollzugriff auf Business-Funktionen, keine User-Verwaltung',
    icon: Shield,
    color: 'secondary'
  },
  owner: {
    label: 'Inhaber',
    description: 'Vollzugriff inklusive Team-Verwaltung und Organisation-Einstellungen', 
    icon: Crown,
    color: 'destructive'
  }
} as const

export function InviteMemberDialog({ open, onOpenChange }: InviteMemberDialogProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('staff')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [inviteLink, setInviteLink] = useState('')

  const { currentOrganization } = useCurrentOrganization()
  const { user } = useAuth()

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSendInvitation = async () => {
    if (!validateEmail(email)) {
      setError('Bitte geben Sie eine gültige E-Mail-Adresse ein')
      return
    }

    if (!currentOrganization || !user) {
      setError('Organisation oder Benutzer nicht gefunden')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/invitations/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId: currentOrganization.id,
          email: email.trim(),
          role,
          invitedBy: user.id,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess(`Einladung erfolgreich an ${email} gesendet!`)
        
        // Generate invite link for copying
        // Note: In real implementation, the backend should return the token
        setInviteLink(`${window.location.origin}/register?invite=<token-will-be-generated>`)
        
        // Reset form
        setEmail('')
        setRole('staff')
        
        // Auto-close after success
        setTimeout(() => {
          onOpenChange(false)
          setSuccess('')
          setInviteLink('')
        }, 3000)
      } else {
        setError(data.error || 'Fehler beim Senden der Einladung')
      }
    } catch (err) {
      console.error('Invitation error:', err)
      setError('Netzwerkfehler. Bitte versuchen Sie es erneut.')
    } finally {
      setIsLoading(false)
    }
  }

  const copyInviteLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink)
      // Could add toast notification here
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    // Reset form when closing
    setTimeout(() => {
      setEmail('')
      setRole('staff')
      setError('')
      setSuccess('')
      setInviteLink('')
    }, 150)
  }

  const selectedRoleConfig = ROLE_CONFIG[role]
  const RoleIcon = selectedRoleConfig.icon

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Neues Team-Mitglied einladen
          </DialogTitle>
          <DialogDescription>
            Senden Sie eine Einladung per E-Mail an ein neues Team-Mitglied
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail-Adresse</Label>
            <Input
              id="email"
              type="email"
              placeholder="max@beispiel.ch"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">Rolle</Label>
            <Select value={role} onValueChange={(value: Role) => setRole(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Rolle auswählen" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_CONFIG).map(([roleKey, config]) => {
                  const Icon = config.icon
                  return (
                    <SelectItem key={roleKey} value={roleKey}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{config.label}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            
            {/* Role Description */}
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <RoleIcon className="h-4 w-4" />
                <Badge variant={selectedRoleConfig.color as any} className="text-xs">
                  {selectedRoleConfig.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedRoleConfig.description}
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{success}</span>
                {inviteLink && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={copyInviteLink}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Link kopieren
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleSendInvitation}
            disabled={isLoading || !email.trim()}
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent mr-2" />
                Wird gesendet...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Einladung senden
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}