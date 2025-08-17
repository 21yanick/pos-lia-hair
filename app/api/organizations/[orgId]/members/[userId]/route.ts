import { type NextRequest, NextResponse } from 'next/server'
import * as TeamService from '@/shared/services/teamService'

/**
 * DELETE /api/organizations/[orgId]/members/[userId]
 * Remove a member from the organization
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; userId: string }> }
) {
  try {
    const { orgId, userId } = await params

    if (!orgId || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Organization ID und User ID sind erforderlich',
        },
        { status: 400 }
      )
    }

    // Delegate to TeamService for business logic
    const result = await TeamService.removeMember(orgId, userId)

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
    console.error('Remove member API error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Unerwarteter Fehler beim Entfernen des Mitglieds',
      },
      { status: 500 }
    )
  }
}
