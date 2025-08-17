import { type NextRequest, NextResponse } from 'next/server'
import { InvitationService } from '@/shared/services/invitationService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ error: 'Token ist erforderlich' }, { status: 400 })
    }

    // Validate invitation token
    const validation = await InvitationService.validateInvitation(token)

    if (!validation.valid) {
      return NextResponse.json(
        {
          valid: false,
          error: validation.error,
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      invitation: {
        organizationName: validation.invitation?.organizationName,
        organizationSlug: validation.invitation?.organizationSlug,
        role: validation.invitation?.role,
        invitedByName: validation.invitation?.invitedByName,
        email: validation.invitation?.email,
        expiresAt: validation.invitation?.exp
          ? new Date(validation.invitation.exp * 1000).toISOString()
          : undefined,
      },
      organization: validation.organization,
    })
  } catch (error) {
    console.error('Validate invitation API error:', error)

    return NextResponse.json(
      {
        valid: false,
        error: 'Token-Validierung fehlgeschlagen',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Invitation Validation API',
    usage: 'POST /api/invitations/validate',
    required: ['token'],
  })
}
