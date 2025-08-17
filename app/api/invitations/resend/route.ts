import { type NextRequest, NextResponse } from 'next/server'
import * as TeamService from '@/shared/services/teamService'

/**
 * POST /api/invitations/resend
 * Resend invitation (creates new JWT token)
 *
 * Since we're using JWT-only approach, this creates a new invitation
 * rather than resending an existing one from a database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, role, organizationId } = body

    if (!email || !role || !organizationId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email, Rolle und Organization ID sind erforderlich',
        },
        { status: 400 }
      )
    }

    if (!['owner', 'admin', 'staff'].includes(role)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Gültige Rolle ist erforderlich (owner, admin, staff)',
        },
        { status: 400 }
      )
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Gültige Email-Adresse ist erforderlich',
        },
        { status: 400 }
      )
    }

    // Delegate to TeamService for business logic and security
    const result = await TeamService.resendInvitation(email, role, organizationId)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    })
  } catch (error) {
    console.error('Resend invitation API error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Unerwarteter Fehler beim Senden der Einladung',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Resend Invitation API',
    usage: 'POST /api/invitations/resend',
    required: ['email', 'role', 'organizationId'],
    note: 'Creates new JWT invitation token (JWT-only approach)',
  })
}
