/**
 * Authentication Service Functions
 *
 * Pure business logic functions for authentication and user management
 * Extracted from useItems hook for better separation of concerns
 *
 * Features:
 * - User synchronization between Auth and Database
 * - Automatic user creation for new auth users
 * - Error handling and retry logic
 * - Type safety
 */

'use client'

import { supabase } from '@/shared/lib/supabase/client'
import type { Database } from '@/types/database'

// ========================================
// Types
// ========================================

export type User = Database['public']['Tables']['users']['Row']

export type SyncAuthUserResult =
  | {
      success: true
      user: User
    }
  | {
      success: false
      error: string
    }

// ========================================
// Core Authentication Operations
// ========================================

/**
 * Get current authenticated user
 */
export async function getCurrentAuthUser() {
  const { data: authData } = await supabase.auth.getUser()
  return authData?.user || null
}

/**
 * Check if current user exists in database
 */
export async function checkUserExists(userId: string): Promise<User | null> {
  const { data: existingUser, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = Not found
    // console.error('Error checking user existence:', error)
    throw new Error('Fehler beim Prüfen der Benutzerdaten')
  }

  return existingUser || null
}

/**
 * Create a new user in the database from auth user
 */
export async function createUserFromAuth(authUser: any): Promise<User> {
  const { data: newUser, error } = await supabase
    .from('users')
    .insert({
      id: authUser.id, // Use auth user ID
      name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Benutzer',
      username: authUser.email?.split('@')[0] || 'user',
      email: authUser.email || '',
      role: 'admin', // Default role for new users
      active: true,
    })
    .select()
    .single()

  if (error) {
    // console.error('Error creating user:', error)
    throw new Error('Fehler beim Erstellen des Benutzers')
  }

  return newUser
}

/**
 * Synchronize auth user with users table
 * Creates user if doesn't exist, returns existing user if found
 */
export async function syncAuthUser(): Promise<SyncAuthUserResult> {
  try {
    // Get current auth user
    const authUser = await getCurrentAuthUser()

    if (!authUser) {
      // console.error('No authenticated user found')
      return {
        success: false,
        error: 'Kein eingeloggter Benutzer gefunden',
      }
    }

    // Check if user exists in database
    const existingUser = await checkUserExists(authUser.id)

    if (existingUser) {
      return {
        success: true,
        user: existingUser,
      }
    }

    // Create new user if doesn't exist
    const newUser = await createUserFromAuth(authUser)

    // console.log('User successfully synchronized:', newUser.id)
    return {
      success: true,
      user: newUser,
    }
  } catch (err: any) {
    console.error('Error synchronizing auth user:', err)
    return {
      success: false,
      error: err.message || 'Fehler bei der Benutzer-Synchronisierung',
    }
  }
}

/**
 * Ensure user exists with retry logic
 * Useful for initialization flows where user might not exist yet
 */
export async function ensureUserExists(maxRetries = 3): Promise<SyncAuthUserResult> {
  let lastError = ''

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await syncAuthUser()

      if (result.success) {
        return result
      }

      lastError = result.error

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * 2 ** (attempt - 1), 5000)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    } catch (err: any) {
      lastError = err.message

      if (attempt < maxRetries) {
        const delay = Math.min(1000 * 2 ** (attempt - 1), 5000)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  return {
    success: false,
    error: `Benutzer-Synchronisierung nach ${maxRetries} Versuchen fehlgeschlagen: ${lastError}`,
  }
}

// ========================================
// User Profile Operations
// ========================================

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<User, 'name' | 'username' | 'email'>>
): Promise<SyncAuthUserResult> {
  try {
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      // console.error('Error updating user profile:', error)
      throw error
    }

    return {
      success: true,
      user: updatedUser,
    }
  } catch (err: any) {
    console.error('Error in updateUserProfile:', err)
    return {
      success: false,
      error: err.message || 'Fehler beim Aktualisieren des Benutzerprofils',
    }
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const { data: user, error } = await supabase.from('users').select('*').eq('id', userId).single()

    if (error && error.code !== 'PGRST116') {
      // console.error('Error getting user by ID:', error)
      throw error
    }

    return user || null
  } catch (err: any) {
    console.error('Error in getUserById:', err)
    return null
  }
}

// ========================================
// Session Management
// ========================================

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentAuthUser()
  return !!user
}

/**
 * Get current session
 */
export async function getCurrentSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

/**
 * Sign out user
 */
export async function signOut(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      // console.error('Error signing out:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    console.error('Error in signOut:', err)
    return { success: false, error: err.message || 'Fehler beim Abmelden' }
  }
}
