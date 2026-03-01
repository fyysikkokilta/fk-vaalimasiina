/* eslint-disable react/jsx-no-literals */
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Text
} from '@react-email/components'

const EmailTemplate = ({
  election,
  votingLinkFi,
  votingLinkEn,
  branding
}: {
  election: { title: string; description: string; seats: number }
  votingLinkFi: string
  votingLinkEn: string
  branding: {
    footerText?: string
    footerLink?: string
    primaryColor?: string
    secondaryColor?: string
    headerTitle?: string
  }
}) => {
  const primaryColor = branding.primaryColor ?? '#fbdb1d'
  const secondaryColor = branding.secondaryColor ?? '#201e1e'
  const headerTitle = branding.headerTitle ?? 'Vaalimasiina'

  return (
    <Html>
      <Head>
        <title>{headerTitle}</title>
      </Head>
      <Body
        style={{
          fontFamily: 'Source Sans Pro, sans-serif',
          backgroundColor: '#f5f5f5',
          margin: 0,
          padding: 0,
          color: secondaryColor
        }}
      >
        <Container
          style={{
            maxWidth: '600px',
            margin: '20px auto',
            backgroundColor: '#ffffff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Heading
            style={{
              color: '#ffffff',
              backgroundColor: secondaryColor,
              padding: '10px',
              textAlign: 'center',
              fontWeight: 'bold'
            }}
          >
            {headerTitle}
          </Heading>
          <Text style={{ fontStyle: 'italic' }}>In English below</Text>
          <Text>Tervetuloa äänestämään vaaleissa!</Text>
          <Text>
            <strong>Vaalin nimi:</strong> {election.title}
          </Text>
          <Text>
            <strong>Vaalin kuvaus:</strong> {election.description}
          </Text>
          <Text>
            <strong>Valittavien määrä:</strong> {election.seats}
          </Text>
          <Text>
            Voit äänestää vain kerran eikä omaa ääntä voi muuttaa äänestämisen jälkeen.
            Äänestyslinkki on henkilökohtainen, ethän jaa sitä eteenpäin.
          </Text>
          <Button
            href={votingLinkFi}
            style={{
              display: 'block',
              width: 'max-content',
              margin: '10px auto',
              padding: '10px 20px',
              backgroundColor: primaryColor,
              color: secondaryColor,
              textDecoration: 'none',
              borderRadius: '5px'
            }}
          >
            Äänestä tästä
          </Button>
          <Hr />
          <Text style={{ fontStyle: 'italic' }}>Suomeksi yllä</Text>
          <Text>Welcome to vote in the elections!</Text>
          <Text>
            <strong>Election name:</strong> {election.title}
          </Text>
          <Text>
            <strong>Election description:</strong> {election.description}
          </Text>
          <Text>
            <strong>Seats:</strong> {election.seats}
          </Text>
          <Text>
            You can only vote once and you cannot change your vote after voting. The voting link is
            personal, please do not share it.
          </Text>
          <Button
            href={votingLinkEn}
            style={{
              display: 'block',
              width: 'max-content',
              margin: '10px auto',
              padding: '10px 20px',
              backgroundColor: primaryColor,
              color: secondaryColor,
              textDecoration: 'none',
              borderRadius: '5px'
            }}
          >
            Vote here
          </Button>
          {branding.footerText || branding.footerLink ? (
            <div
              style={{
                textAlign: 'center',
                fontSize: '14px',
                color: secondaryColor,
                marginTop: '20px'
              }}
            >
              {branding.footerText && <Text>{branding.footerText}</Text>}
              {branding.footerLink && (
                <Link href={branding.footerLink}>
                  {branding.footerLink.replace(/^https?:\/\//, '')}
                </Link>
              )}
            </div>
          ) : null}
        </Container>
      </Body>
    </Html>
  )
}

export default EmailTemplate
