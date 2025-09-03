import { Body, Button, Container, Head, Hr, Html, Section, Text } from '@react-email/components'

interface InviteUserEmailProps {
  inviterName: string
  organizationName: string
  inviteLink: string
  role: 'staff' | 'admin' | 'owner'
}

export const InviteUserEmail = ({
  inviterName = 'Teammitglied',
  organizationName = 'Salon',
  inviteLink = 'https://pos.example.ch/register?invite=token',
  role = 'staff',
}: InviteUserEmailProps) => {
  const roleText = {
    staff: 'Mitarbeiter',
    admin: 'Administrator',
    owner: 'Inhaber',
  }

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={title}>Einladung zu {organizationName}</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={greeting}>Hallo!</Text>

            <Text style={paragraph}>
              <strong>{inviterName}</strong> hat dich zu <strong>{organizationName}</strong>{' '}
              eingeladen.
            </Text>

            <Text style={paragraph}>
              Du wirst als <strong>{roleText[role]}</strong> hinzugefügt und kannst das Ledgr System
              nutzen.
            </Text>

            {/* CTA Button */}
            <Section style={buttonSection}>
              <Button href={inviteLink} style={button}>
                Einladung annehmen
              </Button>
            </Section>

            <Text style={smallText}>Oder kopiere diesen Link in deinen Browser:</Text>
            <Text style={linkText}>{inviteLink}</Text>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>Diese Einladung läuft in 7 Tagen ab.</Text>
            <Text style={footerText}>Ledgr - Dein Business in einer App</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const header = {
  padding: '32px 40px',
  backgroundColor: '#000000',
}

const title = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#ffffff',
  textAlign: 'center' as const,
  margin: '0',
}

const content = {
  padding: '40px 40px 0',
}

const greeting = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#333333',
  marginBottom: '24px',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#333333',
  marginBottom: '16px',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#000000',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '16px 32px',
  maxWidth: '280px',
  margin: '0 auto',
}

const smallText = {
  fontSize: '14px',
  color: '#666666',
  textAlign: 'center' as const,
  marginBottom: '8px',
}

const linkText = {
  fontSize: '14px',
  color: '#0066cc',
  textAlign: 'center' as const,
  wordBreak: 'break-all' as const,
  marginBottom: '32px',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '32px 0',
}

const footer = {
  padding: '0 40px',
}

const footerText = {
  fontSize: '12px',
  color: '#999999',
  textAlign: 'center' as const,
  margin: '8px 0',
}

export default InviteUserEmail
