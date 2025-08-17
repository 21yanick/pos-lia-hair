'use client'

import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/shared/lib/supabase/client'
import { useAuth } from './useAuth'

interface ProfileFormData {
  name: string
  email: string
}

interface PasswordChangeData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface UseProfileReturn {
  // State
  updating: boolean
  changingPassword: boolean

  // Actions
  updateProfile: (data: ProfileFormData) => Promise<void>
  changePassword: (data: PasswordChangeData) => Promise<void>
}

export function useProfile(): UseProfileReturn {
  const { user } = useAuth()
  const [updating, setUpdating] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  // Update user profile (name, email)
  const updateProfile = useCallback(
    async (data: ProfileFormData) => {
      if (!user) throw new Error('Nicht angemeldet')

      try {
        setUpdating(true)

        // Update auth user (email)
        if (data.email !== user.email) {
          const { error: authError } = await supabase.auth.updateUser({
            email: data.email,
          })
          if (authError) throw authError
        }

        // Update database user (name)
        const { error: dbError } = await supabase
          .from('users')
          .update({
            name: data.name,
            email: data.email,
          })
          .eq('id', user.id)

        if (dbError) throw dbError

        toast.success('Profil erfolgreich aktualisiert')
      } catch (error) {
        console.error('Error updating profile:', error)
        toast.error('Fehler beim Aktualisieren des Profils')
        throw error
      } finally {
        setUpdating(false)
      }
    },
    [user]
  )

  // Change password
  const changePassword = useCallback(
    async (data: PasswordChangeData) => {
      if (!user) throw new Error('Nicht angemeldet')

      try {
        setChangingPassword(true)

        // Validate passwords match
        if (data.newPassword !== data.confirmPassword) {
          throw new Error('Passwörter stimmen nicht überein')
        }

        // Validate password strength
        if (data.newPassword.length < 6) {
          throw new Error('Passwort muss mindestens 6 Zeichen lang sein')
        }

        // Update password in Supabase Auth
        const { error } = await supabase.auth.updateUser({
          password: data.newPassword,
        })

        if (error) throw error

        toast.success('Passwort erfolgreich geändert')
      } catch (error) {
        console.error('Error changing password:', error)
        if (error instanceof Error) {
          toast.error(error.message)
        } else {
          toast.error('Fehler beim Ändern des Passworts')
        }
        throw error
      } finally {
        setChangingPassword(false)
      }
    },
    [user]
  )

  return {
    updating,
    changingPassword,
    updateProfile,
    changePassword,
  }
}
