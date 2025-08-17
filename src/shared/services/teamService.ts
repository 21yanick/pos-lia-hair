/**
 * Team Management Service Functions
 *
 * Pure business logic functions for team management operations
 * Follows existing service patterns from salesService.ts and authService.ts
 *
 * Features:
 * - Multi-tenant security (organization-scoped)
 * - Permission-based access control (owner > admin > staff)
 * - Self-action prevention (users can't modify themselves)
 * - Comprehensive error handling
 * - JWT-based invitation system integration
 */

'use client'

import { supabase } from '@/shared/lib/supabase/client'
import type { Database } from '@/types/database'

// ========================================
// Types
// ========================================

export type OrganizationUser = Database['public']['Tables']['organization_users']['Row']
export type Role = 'owner' | 'admin' | 'staff'

export type RemoveMemberResult =
  | {
      success: true
      message: string
    }
  | {
      success: false
      error: string
    }

export type ChangeRoleResult =
  | {
      success: true
      member: OrganizationUser
      message: string
    }
  | {
      success: false
      error: string
    }

export type ResendInvitationResult =
  | {
      success: true
      message: string
      token?: string // For debugging
    }
  | {
      success: false
      error: string
    }

// ========================================
// Security & Validation
// ========================================

/**
 * Get current user ID with validation
 */
export async function getCurrentUserId(): Promise<string> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) {
    throw new Error('Nicht angemeldet. Bitte melden Sie sich an.')
  }
  return userData.user.id
}

/**
 * Validate organization ID
 */
export function validateOrganizationId(organizationId: string | undefined): string {
  if (!organizationId) {
    throw new Error('Keine Organization ausgewählt. Multi-Tenant Sicherheit verletzt.')
  }
  return organizationId
}

/**
 * Get user's role in organization
 */
export async function getUserRole(organizationId: string, userId: string): Promise<Role | null> {
  const { data, error } = await supabase
    .from('organization_users')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .eq('active', true)
    .single()

  if (error || !data) {
    return null
  }

  return data.role as Role
}

/**
 * Check if user can manage target member
 */
export function canManageMember(userRole: Role, targetRole: Role, isTargetSelf: boolean): boolean {
  // Can't manage yourself
  if (isTargetSelf) return false

  // Owner can manage everyone except other owners
  if (userRole === 'owner' && targetRole !== 'owner') return true

  // Admin can manage staff only
  if (userRole === 'admin' && targetRole === 'staff') return true

  return false
}

// ========================================
// Core Team Operations
// ========================================

/**
 * Remove a member from the organization
 */
export async function removeMember(
  organizationId: string,
  targetUserId: string
): Promise<RemoveMemberResult> {
  try {
    // Security validation
    const validOrgId = validateOrganizationId(organizationId)
    const currentUserId = await getCurrentUserId()

    // Prevent self-removal
    if (currentUserId === targetUserId) {
      return {
        success: false,
        error: 'Sie können sich nicht selbst aus dem Team entfernen.',
      }
    }

    // Get current user's role
    const userRole = await getUserRole(validOrgId, currentUserId)
    if (!userRole) {
      return {
        success: false,
        error: 'Sie sind kein Mitglied dieser Organisation.',
      }
    }

    // Get target member's data
    const { data: targetMember, error: targetError } = await supabase
      .from('organization_users')
      .select('role, user_id')
      .eq('organization_id', validOrgId)
      .eq('user_id', targetUserId)
      .eq('active', true)
      .single()

    if (targetError || !targetMember) {
      return {
        success: false,
        error: 'Mitglied nicht gefunden oder bereits entfernt.',
      }
    }

    // Permission check
    if (!canManageMember(userRole, targetMember.role as Role, false)) {
      return {
        success: false,
        error: 'Keine Berechtigung, dieses Mitglied zu entfernen.',
      }
    }

    // Remove member (soft delete by setting active = false)
    const { error: removeError } = await supabase
      .from('organization_users')
      .update({ active: false })
      .eq('organization_id', validOrgId)
      .eq('user_id', targetUserId)

    if (removeError) {
      console.error('❌ Fehler beim Entfernen des Mitglieds:', removeError)
      throw removeError
    }

    return {
      success: true,
      message: 'Mitglied wurde erfolgreich aus dem Team entfernt.',
    }
  } catch (err: any) {
    console.error('❌ Fehler beim Entfernen des Mitglieds:', err)
    return {
      success: false,
      error: err.message || 'Fehler beim Entfernen des Mitglieds',
    }
  }
}

/**
 * Change a member's role in the organization
 */
export async function changeRole(
  organizationId: string,
  targetUserId: string,
  newRole: Role
): Promise<ChangeRoleResult> {
  try {
    // Security validation
    const validOrgId = validateOrganizationId(organizationId)
    const currentUserId = await getCurrentUserId()

    // Prevent self-role-change
    if (currentUserId === targetUserId) {
      return {
        success: false,
        error: 'Sie können Ihre eigene Rolle nicht ändern.',
      }
    }

    // Get current user's role
    const userRole = await getUserRole(validOrgId, currentUserId)
    if (!userRole) {
      return {
        success: false,
        error: 'Sie sind kein Mitglied dieser Organisation.',
      }
    }

    // Get target member's current data
    const { data: targetMember, error: targetError } = await supabase
      .from('organization_users')
      .select('*')
      .eq('organization_id', validOrgId)
      .eq('user_id', targetUserId)
      .eq('active', true)
      .single()

    if (targetError || !targetMember) {
      return {
        success: false,
        error: 'Mitglied nicht gefunden.',
      }
    }

    // Permission check for current role
    if (!canManageMember(userRole, targetMember.role as Role, false)) {
      return {
        success: false,
        error: 'Keine Berechtigung, die Rolle dieses Mitglieds zu ändern.',
      }
    }

    // Permission check for new role (can't promote to owner unless you're owner)
    if (newRole === 'owner' && userRole !== 'owner') {
      return {
        success: false,
        error: 'Nur der Inhaber kann andere zu Inhabern machen.',
      }
    }

    // Check if role is actually changing
    if (targetMember.role === newRole) {
      return {
        success: false,
        error: 'Das Mitglied hat bereits diese Rolle.',
      }
    }

    // Update role
    const { data: updatedMember, error: updateError } = await supabase
      .from('organization_users')
      .update({ role: newRole })
      .eq('organization_id', validOrgId)
      .eq('user_id', targetUserId)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Fehler beim Ändern der Rolle:', updateError)
      throw updateError
    }

    const roleLabels = {
      owner: 'Inhaber',
      admin: 'Administrator',
      staff: 'Mitarbeiter',
    }

    return {
      success: true,
      member: updatedMember,
      message: `Rolle wurde erfolgreich zu ${roleLabels[newRole]} geändert.`,
    }
  } catch (err: any) {
    console.error('❌ Fehler beim Ändern der Rolle:', err)
    return {
      success: false,
      error: err.message || 'Fehler beim Ändern der Rolle',
    }
  }
}

/**
 * Resend invitation to a user (creates new JWT token)
 */
export async function resendInvitation(
  email: string,
  role: Role,
  organizationId: string
): Promise<ResendInvitationResult> {
  try {
    // Security validation
    const validOrgId = validateOrganizationId(organizationId)
    const currentUserId = await getCurrentUserId()

    // Get current user's role for permission check
    const userRole = await getUserRole(validOrgId, currentUserId)
    if (!userRole) {
      return {
        success: false,
        error: 'Sie sind kein Mitglied dieser Organisation.',
      }
    }

    // Permission check for inviting with specific role
    if (role === 'owner' && userRole !== 'owner') {
      return {
        success: false,
        error: 'Nur der Inhaber kann andere als Inhaber einladen.',
      }
    }

    if (role === 'admin' && userRole === 'staff') {
      return {
        success: false,
        error: 'Mitarbeiter können keine Administratoren einladen.',
      }
    }

    // Use existing invitation service to send new invitation
    const { InvitationService } = await import('./invitationService')

    const result = await InvitationService.sendInvitation({
      organizationId: validOrgId,
      email,
      role,
      invitedBy: currentUserId,
    })

    return {
      success: true,
      message: 'Einladung wurde erfolgreich erneut gesendet.',
      token: result.token, // For debugging
    }
  } catch (err: any) {
    console.error('❌ Fehler beim erneuten Senden der Einladung:', err)
    return {
      success: false,
      error: err.message || 'Fehler beim Senden der Einladung',
    }
  }
}

// ========================================
// Utility Functions
// ========================================

/**
 * Get member count for organization
 */
export async function getMemberCount(organizationId: string): Promise<number> {
  const validOrgId = validateOrganizationId(organizationId)

  const { count, error } = await supabase
    .from('organization_users')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', validOrgId)
    .eq('active', true)

  if (error) {
    console.error('❌ Fehler beim Zählen der Mitglieder:', error)
    return 0
  }

  return count || 0
}
