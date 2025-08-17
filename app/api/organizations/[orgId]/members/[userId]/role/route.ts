import { type NextRequest, NextResponse } from 'next/server'
import * as TeamService from '@/shared/services/teamService'

/**
 * PATCH /api/organizations/[orgId]/members/[userId]/role
 * Change a member's role in the organization
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; userId: string }> }
) {
  try {
    const { orgId, userId } = await params
    const body = await request.json()
    const { role } = body

    if (!orgId || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Organization ID und User ID sind erforderlich',
        },
        { status: 400 }
      )
    }

    if (!role || !['owner', 'admin', 'staff'].includes(role)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Gültige Rolle ist erforderlich (owner, admin, staff)',
        },
        { status: 400 }
      )
    }

    // Delegate to TeamService for business logic
    const result = await TeamService.changeRole(orgId, userId, role)

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
      data: result.member,
      message: result.message,
    })
  } catch (error) {
    console.error('Change role API error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Unerwarteter Fehler beim Ändern der Rolle',
      },
      { status: 500 }
    )
  }
}
