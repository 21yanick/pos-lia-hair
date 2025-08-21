import { type NextRequest, NextResponse } from 'next/server'
import { sendInvitation } from '@/shared/services/invitationService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { organizationId, email, role } = body

    // Validate required fields
    if (!organizationId || !email || !role) {
      return NextResponse.json(
        { error: 'organizationId, email und role sind erforderlich' },
        { status: 400 }
      )
    }

    // Validate role
    if (!['staff', 'admin', 'owner'].includes(role)) {
      return NextResponse.json(
        { error: 'Ungültige Rolle. Erlaubt: staff, admin, owner' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Ungültiges E-Mail-Format' }, { status: 400 })
    }

    // Get current user from auth (simplified - you might want proper auth middleware)
    // For now, we'll expect the invitedBy to be passed in the request
    const { invitedBy } = body

    if (!invitedBy) {
      return NextResponse.json({ error: 'invitedBy (User ID) ist erforderlich' }, { status: 400 })
    }

    // Send invitation
    const _result = await sendInvitation({
      organizationId,
      email,
      role,
      invitedBy,
    })

    return NextResponse.json({
      success: true,
      message: `Einladung an ${email} gesendet`,
      data: {
        email,
        role,
        organizationId,
      },
    })
  } catch (error) {
    console.error('Send invitation API error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler'

    return NextResponse.json(
      {
        error: 'Einladung konnte nicht gesendet werden',
        details: errorMessage,
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Invitation Send API',
    usage: 'POST /api/invitations/send',
    required: ['organizationId', 'email', 'role', 'invitedBy'],
  })
}
