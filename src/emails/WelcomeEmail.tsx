import { Body, Button, Container, Head, Hr, Html, Section, Text } from '@react-email/components'

interface WelcomeEmailProps {
  userName: string
  organizationName: string
  dashboardLink: string
  isOwner?: boolean
}

export const WelcomeEmail = ({
  userName = 'Benutzer',
  organizationName = 'Dein Business',
  dashboardLink = 'https://pos.example.ch',
  isOwner = false,
}: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={title}>Willkommen bei Ledgr! 🎉</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={greeting}>Hallo {userName}!</Text>

            <Text style={paragraph}>
              {isOwner
                ? `Herzlichen Glückwunsch! Dein Business "${organizationName}" wurde erfolgreich eingerichtet.`
                : `Willkommen im Team von "${organizationName}"! Dein Account wurde erfolgreich erstellt.`}
            </Text>

            <Text style={paragraph}>
              Du kannst jetzt das professionelle Business System nutzen:
            </Text>

            {/* Features List */}
            <Section style={featureList}>
              <Text style={featureItem}>✨ Verkäufe erfassen und verwalten</Text>
              <Text style={featureItem}>💰 Kassenbuch und Banking Integration</Text>
              <Text style={featureItem}>📊 Umsatz Reports und Statistiken</Text>
              <Text style={featureItem}>👥 Team- und Kundenverwaltung</Text>
              <Text style={featureItem}>🧾 Automatische Belege und Rechnungen</Text>
            </Section>

            {/* CTA Button */}
            <Section style={buttonSection}>
              <Button href={dashboardLink} style={button}>
                Zum Dashboard
              </Button>
            </Section>

            {isOwner && (
              <Section style={tipSection}>
                <Text style={tipTitle}>💡 Erste Schritte:</Text>
                <Text style={tipText}>
                  1. Lade dein Team ein
                  <br />
                  2. Füge deine ersten Dienstleistungen hinzu
                  <br />
                  3. Führe deinen ersten Verkauf durch
                </Text>
              </Section>
            )}
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Bei Fragen sind wir gerne da. Viel Erfolg mit deinem digitalen Business!
            </Text>
            <Text style={footerText}>Dein Ledgr Team</Text>
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

const featureList = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
}

const featureItem = {
  fontSize: '14px',
  color: '#333333',
  margin: '8px 0',
  lineHeight: '1.5',
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
  maxWidth: '200px',
  margin: '0 auto',
}

const tipSection = {
  backgroundColor: '#fff3cd',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
}

const tipTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#856404',
  margin: '0 0 12px 0',
}

const tipText = {
  fontSize: '14px',
  color: '#856404',
  lineHeight: '1.6',
  margin: '0',
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

export default WelcomeEmail
