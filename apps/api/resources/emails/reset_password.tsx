import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface ResetPasswordEmailProps {
  code: string
}

export const ResetPasswordEmail = ({ code }: ResetPasswordEmailProps) => {
  const currentYear = new Date().getFullYear()

  return (
    <Html>
      <Head />
      <Preview>Your Atlas password reset code</Preview>
      <Body style={main}>
        <Container style={page}>
          <Section style={card}>
            <Text style={brand}>ATLAS</Text>
            <Heading as="h1" style={title}>
              Reset your password
            </Heading>
            <Text style={text}>
              Enter this code in the Atlas app to choose a new password. It expires in 30 minutes.
            </Text>
            <Section style={codeBox}>
              <Text style={codeText}>{code}</Text>
            </Section>
            <Hr style={divider} />
            <Text style={footnote}>
              If you did not request a password reset, you can safely ignore this email.
            </Text>
          </Section>
          <Text style={footer}>© {currentYear} Atlas</Text>
        </Container>
      </Body>
    </Html>
  )
}

export default ResetPasswordEmail

const main = {
  backgroundColor: '#f6f6f7',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  margin: '0',
  padding: '0',
}

const page = {
  margin: '0 auto',
  maxWidth: '480px',
  padding: '64px 24px 40px',
  width: '100%',
}

const card = {
  backgroundColor: '#ffffff',
  border: '1px solid #e4e4e7',
  borderRadius: '12px',
  padding: '40px 32px',
}

const brand = {
  color: '#dc2626',
  fontSize: '12px',
  fontWeight: '600',
  letterSpacing: '0.2em',
  margin: '0 0 24px',
  textAlign: 'center' as const,
}

const title = {
  color: '#18181b',
  fontSize: '22px',
  fontWeight: '600',
  letterSpacing: '-0.02em',
  margin: '0 0 12px',
  textAlign: 'center' as const,
}

const text = {
  color: '#52525b',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 24px',
  textAlign: 'center' as const,
}

const codeBox = {
  backgroundColor: '#f4f4f5',
  border: '1px solid #e4e4e7',
  borderRadius: '8px',
  padding: '20px 16px',
}

const codeText = {
  color: '#18181b',
  fontFamily: 'ui-monospace,SFMono-Regular,Menlo,monospace',
  fontSize: '28px',
  fontWeight: '600',
  letterSpacing: '0.18em',
  margin: '0',
  textAlign: 'center' as const,
}

const divider = {
  borderColor: '#e4e4e7',
  margin: '28px 0 20px',
}

const footnote = {
  color: '#a1a1aa',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '0',
  textAlign: 'center' as const,
}

const footer = {
  color: '#a1a1aa',
  fontSize: '12px',
  margin: '24px 0 0',
  textAlign: 'center' as const,
}
