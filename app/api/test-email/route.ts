import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST() {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        {
          error: 'RESEND_API_KEY nicht konfiguriert',
        },
        { status: 500 }
      )
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    const { data, error } = await resend.emails.send({
      from: 'Ledgr <noreply@example.ch>',
      to: ['bullenmarkt@pm.me'],
      subject: '🎉 Ledgr Email Test',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Email System funktioniert! 🚀</h1>
          <p>Hallo!</p>
          <p>Das ist eine Test-Email von deinem Ledgr System.</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>✅ Erfolgreich konfiguriert:</h3>
            <ul>
              <li>Resend API Integration</li>
              <li>DNS Records (example.ch)</li>
              <li>Email Templates Ready</li>
            </ul>
          </div>
          <p style="color: #666;">
            Nächste Schritte: Invitation System implementieren!
          </p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #999;">
            Gesendet von Ledgr System
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Test Email successfully sent!',
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to send email',
        details: error,
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Email Test API is ready',
    endpoint: 'POST /api/test-email',
  })
}
