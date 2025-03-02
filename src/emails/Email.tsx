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
import * as React from 'react'

const EmailTemplate = ({
  election,
  votingLinkFi,
  votingLinkEn,
  branding
}: {
  election: { title: string; description: string; seats: number }
  votingLinkFi: string
  votingLinkEn: string
  branding: { footerText?: string; footerLink?: string }
}) => (
  <Html>
    <Head>
      <title>Vaalimasiina</title>
    </Head>
    <Body
      style={{
        fontFamily: 'Source Sans Pro, sans-serif',
        backgroundColor: '#f5f5f5',
        margin: 0,
        padding: 0,
        color: '#201e1e'
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
            backgroundColor: '#201e1e',
            padding: '10px',
            textAlign: 'center',
            fontWeight: 'bold'
          }}
        >
          Vaalimasiina
        </Heading>
        <Text style={{ fontStyle: 'italic' }}>In English below</Text>
        <Text>Tervetuloa äänestämään Fyysikkokillan vaaleissa!</Text>
        <Text>
          <strong>Äänestyksen nimi:</strong> {election.title}
        </Text>
        <Text>
          <strong>Äänestyksen kuvaus:</strong> {election.description}
        </Text>
        <Text>
          <strong>Valittavien määrä:</strong> {election.seats}
        </Text>
        <Text>
          Voit äänestää vain kerran eikä omaa ääntä voi muuttaa äänestämisen
          jälkeen. Äänestyslinkki on henkilökohtainen, ethän jaa sitä eteenpäin.
        </Text>
        <Button
          href={votingLinkFi}
          style={{
            display: 'block',
            width: 'max-content',
            margin: '10px auto',
            padding: '10px 20px',
            backgroundColor: '#fbdb1d',
            color: '#201e1e',
            textDecoration: 'none',
            borderRadius: '5px'
          }}
        >
          Äänestä tästä
        </Button>
        <Hr />
        <Text style={{ fontStyle: 'italic' }}>Suomeksi yllä</Text>
        <Text>Welcome to vote in the elections of the Guild of Physics!</Text>
        <Text>
          <strong>Election name:</strong> {election.title}
        </Text>
        <Text>
          <strong>Election description:</strong> {election.description}
        </Text>
        <Text>
          <strong>Amount to elect:</strong> {election.seats}
        </Text>
        <Text>
          You can only vote once and you cannot change your vote after voting.
          The voting link is personal, please do not share it.
        </Text>
        <Button
          href={votingLinkEn}
          style={{
            display: 'block',
            width: 'max-content',
            margin: '10px auto',
            padding: '10px 20px',
            backgroundColor: '#fbdb1d',
            color: '#201e1e',
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
              color: '#201e1e',
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

export default EmailTemplate
