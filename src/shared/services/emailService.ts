import { Resend } from 'resend';
import { InviteUserEmail } from '@/src/emails/InviteUserEmail';
import { WelcomeEmail } from '@/src/emails/WelcomeEmail';

// Initialize Resend only when needed to prevent build-time errors
function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY environment variable is required');
  }
  return new Resend(process.env.RESEND_API_KEY);
}

interface SendInviteEmailProps {
  to: string;
  inviterName: string;
  organizationName: string;
  inviteToken: string;
  role: 'staff' | 'admin' | 'owner';
}

interface SendWelcomeEmailProps {
  to: string;
  userName: string;
  organizationName: string;
  organizationSlug: string;
  isOwner?: boolean;
}

export class EmailService {
  
  /**
   * Sendet eine Einladungs-Email an einen neuen User
   */
  static async sendInvitationEmail({
    to,
    inviterName,
    organizationName,
    inviteToken,
    role,
  }: SendInviteEmailProps) {
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/register?invite=${inviteToken}`;
    
    try {
      const resend = getResendClient();
      const { data, error } = await resend.emails.send({
        from: `${organizationName} <einladung@lia-hair.ch>`,
        to: [to],
        subject: `Einladung zu ${organizationName} - Lia Hair POS`,
        react: InviteUserEmail({
          inviterName,
          organizationName,
          inviteLink,
          role,
        }),
      });

      if (error) {
        console.error('Failed to send invitation email:', error);
        throw new Error(`Email sending failed: ${error.message}`);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Email service error:', error);
      throw error;
    }
  }

  /**
   * Sendet eine Willkommens-Email an einen neuen User
   */
  static async sendWelcomeEmail({
    to,
    userName,
    organizationName,
    organizationSlug,
    isOwner = false,
  }: SendWelcomeEmailProps) {
    const dashboardLink = `${process.env.NEXT_PUBLIC_APP_URL}/org/${organizationSlug}/dashboard`;
    
    try {
      const resend = getResendClient();
      const { data, error } = await resend.emails.send({
        from: `Lia Hair POS <willkommen@lia-hair.ch>`,
        to: [to],
        subject: isOwner 
          ? `Willkommen bei Lia Hair POS! Dein Salon "${organizationName}" ist bereit` 
          : `Willkommen im Team von "${organizationName}"`,
        react: WelcomeEmail({
          userName,
          organizationName,
          dashboardLink,
          isOwner,
        }),
      });

      if (error) {
        console.error('Failed to send welcome email:', error);
        throw new Error(`Email sending failed: ${error.message}`);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Email service error:', error);
      throw error;
    }
  }

  /**
   * Sendet eine Test-Email (für Debugging)
   */
  static async sendTestEmail(to: string) {
    try {
      const resend = getResendClient();
      const { data, error } = await resend.emails.send({
        from: 'Lia Hair POS <test@lia-hair.ch>',
        to: [to],
        subject: '🧪 Lia Hair POS Test Email',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Test Email erfolgreich! ✅</h1>
            <p>Das Email System funktioniert korrekt.</p>
            <p style="color: #666; font-size: 14px;">
              Timestamp: ${new Date().toISOString()}
            </p>
          </div>
        `,
      });

      if (error) {
        throw new Error(`Test email failed: ${error.message}`);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Test email error:', error);
      throw error;
    }
  }
}