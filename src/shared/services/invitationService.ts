import jwt from 'jsonwebtoken'
import { supabase } from '@/shared/lib/supabase/client'

// JWT Secret - in production, this should be a strong secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'

// Token expires in 7 days
const TOKEN_EXPIRY = '7d'

export interface InvitationPayload {
  organizationId: string
  organizationName: string
  organizationSlug: string
  email: string
  role: 'staff' | 'admin' | 'owner'
  invitedBy: string // User ID who sent the invitation
  invitedByName: string // Name of the inviter
}

export interface DecodedInvitation extends InvitationPayload {
  iat: number // Issued at
  exp: number // Expires at
}

// Organization data structure from database
export interface OrganizationData {
  id: string
  name: string
  slug: string
  active: boolean
}

// Organization membership record from organization_users table
export interface OrganizationMembership {
  id: string
  organization_id: string
  user_id: string
  role: 'staff' | 'admin' | 'owner'
  invited_by: string | null
  joined_at: string
  created_at: string
  active: boolean
}

// Return type for acceptInvitation function
export interface AcceptInvitationResult {
  success: true
  organization: OrganizationData
  membership: OrganizationMembership
  role: 'staff' | 'admin' | 'owner'
}

/**
 * Creates a secure JWT invitation token
 */
export function createInvitationToken(payload: InvitationPayload): string {
  try {
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
      issuer: 'lia-hair-pos',
      audience: 'lia-hair-users',
    })

    return token
  } catch (error) {
    console.error('Failed to create invitation token:', error)
    throw new Error('Token creation failed')
  }
}

/**
 * Verifies and decodes an invitation token
 */
export function verifyInvitationToken(token: string): DecodedInvitation {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'lia-hair-pos',
      audience: 'lia-hair-users',
    }) as DecodedInvitation

    return decoded
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Einladung ist abgelaufen')
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Ungültige Einladung')
    } else {
      console.error('Token verification error:', error)
      throw new Error('Token-Verifikation fehlgeschlagen')
    }
  }
}

/**
 * Sends an invitation email with JWT token
 */
export async function sendInvitation({
  organizationId,
  email,
  role,
  invitedBy,
}: {
  organizationId: string
  email: string
  role: 'staff' | 'admin' | 'owner'
  invitedBy: string
}) {
  try {
    // 1. Get organization details
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('name, slug')
      .eq('id', organizationId)
      .single()

    if (orgError || !organization) {
      throw new Error('Organisation nicht gefunden')
    }

    // 2. Get inviter details
    const { data: inviter, error: inviterError } = await supabase
      .from('users')
      .select('name')
      .eq('id', invitedBy)
      .single()

    if (inviterError || !inviter) {
      throw new Error('Einladender Benutzer nicht gefunden')
    }

    // 3. Create JWT token
    const token = createInvitationToken({
      organizationId,
      organizationName: organization.name,
      organizationSlug: organization.slug,
      email,
      role,
      invitedBy,
      invitedByName: inviter.name,
    })

    // 4. Send email via emailService
    const { sendInvitationEmail } = await import('./emailService')

    const result = await sendInvitationEmail({
      to: email,
      inviterName: inviter.name,
      organizationName: organization.name,
      inviteToken: token,
      role,
    })

    return {
      success: true,
      token, // For debugging/testing
      result,
    }
  } catch (error) {
    console.error('Failed to send invitation:', error)
    throw error
  }
}

/**
 * Accepts an invitation and creates organization membership
 */
export async function acceptInvitation(
  token: string,
  userId: string
): Promise<AcceptInvitationResult> {
  try {
    // 1. Verify and decode token
    const invitation = verifyInvitationToken(token)

    // 2. Check if organization still exists and is active
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, slug, active')
      .eq('id', invitation.organizationId)
      .eq('active', true)
      .single()

    if (orgError || !organization) {
      throw new Error('Organisation nicht gefunden oder inaktiv')
    }

    // 3. Check if user is already a member
    const { data: existingMembership } = await supabase
      .from('organization_users')
      .select('id')
      .eq('organization_id', invitation.organizationId)
      .eq('user_id', userId)
      .single()

    if (existingMembership) {
      throw new Error('Sie sind bereits Mitglied dieser Organisation')
    }

    // 4. Create organization membership
    const { data: membership, error: membershipError } = await supabase
      .from('organization_users')
      .insert({
        organization_id: invitation.organizationId,
        user_id: userId,
        role: invitation.role,
        invited_by: invitation.invitedBy,
      })
      .select()
      .single()

    if (membershipError) {
      console.error('Failed to create membership:', membershipError)
      throw new Error('Mitgliedschaft konnte nicht erstellt werden')
    }

    return {
      success: true,
      organization,
      membership,
      role: invitation.role,
    }
  } catch (error) {
    console.error('Failed to accept invitation:', error)
    throw error
  }
}

/**
 * Validates invitation token without accepting it (for preview)
 */
export async function validateInvitation(token: string) {
  try {
    const invitation = verifyInvitationToken(token)

    // Check if organization still exists
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, slug, active')
      .eq('id', invitation.organizationId)
      .eq('active', true)
      .single()

    if (orgError || !organization) {
      throw new Error('Organisation nicht gefunden oder inaktiv')
    }

    return {
      valid: true,
      invitation,
      organization,
    }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Ungültige Einladung',
    }
  }
}
