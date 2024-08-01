import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap'
import { useCookies } from 'react-cookie'
import { login } from '../../../api/login'
import { getVoterStatus } from '../../../api/voter'

export const Login = () => {
  const [cookies, setCookie, removeCookie] = useCookies(['token', 'alias'])
  const [identifier, setIdentifier] = useState('')
  const [alias, setAlias] = useState('')

  useEffect(() => {
    (async () => {
      if (!cookies.token) {
        return
      }
      const response = await getVoterStatus(cookies.token)

      if (!response.ok) {
        removeCookie('token')
        return
      }

      if (!response.data.loggedIn) {
        removeCookie('token')
      }
    })()
  }, [cookies.token, removeCookie, setCookie])

  const handleLogin = async () => {
    if (!identifier || !alias) {
      return
    }

    const response = await login(alias, identifier)

    if (!response.ok || !response.data.loggedIn) {
      return
    }
    setCookie('alias', response.data.alias)
    setCookie('token', response.data.voterId)
  }

  return (
    <Container className="mt-5 mb-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="box-shadow">
            <Card.Header as="h2">Kirjaudu sisään</Card.Header>
            <Card.Body>
              <Card.Text>
                Tervetuloa Fyysikkokillan vaalimasiinaan! Kirjaudu sisään
                antamalla kirjautumiskoodisi alla olevaan kenttään. Jos sinulla
                ei ole vielä kirjautumiskoodia, kerro siitä vaalitoimitsijalle.
              </Card.Text>
              <Card.Text>
                Äänestää saavat vain killan varsinaiset jäsenet. Jos olet saanut
                kirjautumiskoodin, mutta et ole varsinainen jäsen, kerro siitä
                vaalitoimitsijalle pikimmiten. Tällöin saamasi kirjautumiskoodi
                mitätöidään.
              </Card.Text>
              <Card.Text>
                <b>Kirjautumiskoodi</b>
                <br />
                Saat kirjautumiskoodin vaalitoimitsijoilta. Se mitätöidään, jos
                poistut vaalilähetyksestä. Tarvitset uuden koodin, jos palaat
                äänestämään.
              </Card.Text>
              <Card.Text>
                <b>Alias</b>
                <br />
                Alias on nimimerkkisi, joka näkyy vaalilähetyksessä. Voit
                käyttää oikeaa nimeäsi tai keksiä jotain muuta.
              </Card.Text>
              <Card.Text>
                <b>Muista aina ilmoittaa poistuessasi oman koodisi!</b>
              </Card.Text>
              <Form>
                <Form.Group controlId="formIdentifier">
                  <Form.Label className="mt-3">Kirjautumiskoodi</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Syötä kirjautumiskoodisi"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                </Form.Group>
                <Form.Group controlId="formAlias">
                  <Form.Label className="mt-3">Alias</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Syötä aliaksesi"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                  />
                </Form.Group>
                <Button
                  className="mt-3"
                  variant="primary"
                  onClick={handleLogin}
                  disabled={!identifier || !alias}
                >
                  Kirjaudu
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
