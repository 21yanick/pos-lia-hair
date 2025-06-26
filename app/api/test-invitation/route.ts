import { NextResponse } from 'next/server';
import { InvitationService } from '@/shared/services/invitationService';

export async function POST() {
  try {
    // Test JWT token creation and validation
    const testPayload = {
      organizationId: 'test-org-id',
      organizationName: 'Test Salon',
      organizationSlug: 'test-salon',
      email: 'bullenmarkt@pm.me',
      role: 'staff' as const,
      invitedBy: 'test-user-id',
      invitedByName: 'Test Admin',
    };

    // 1. Create JWT token
    console.log('Creating invitation token...');
    const token = InvitationService.createInvitationToken(testPayload);
    console.log('Token created:', token.substring(0, 50) + '...');

    // 2. Verify JWT token
    console.log('Verifying invitation token...');
    const decoded = InvitationService.verifyInvitationToken(token);
    console.log('Token verified:', {
      organizationName: decoded.organizationName,
      email: decoded.email,
      role: decoded.role,
      expiresAt: new Date(decoded.exp * 1000).toISOString(),
    });

    // 3. Test validation endpoint
    console.log('Testing validation endpoint...');
    const validation = await InvitationService.validateInvitation(token);
    console.log('Validation result:', validation);

    return NextResponse.json({
      success: true,
      message: 'JWT Invitation System funktioniert perfekt!',
      tests: {
        tokenCreation: '✅ Token erfolgreich erstellt',
        tokenVerification: '✅ Token erfolgreich verifiziert', 
        validation: validation.valid ? '✅ Validation erfolgreich' : '❌ Validation fehlgeschlagen',
      },
      data: {
        token: token.substring(0, 50) + '...',
        decoded: {
          organizationName: decoded.organizationName,
          email: decoded.email,
          role: decoded.role,
          expiresAt: new Date(decoded.exp * 1000).toISOString(),
        },
        inviteLink: `${process.env.NEXT_PUBLIC_APP_URL}/register?invite=${token}`,
      },
    });

  } catch (error) {
    console.error('JWT test error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'JWT Test fehlgeschlagen',
      details: error instanceof Error ? error.message : 'Unbekannter Fehler',
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'JWT Invitation Test API',
    usage: 'POST /api/test-invitation',
    description: 'Tests JWT token creation, verification, and validation',
  });
}