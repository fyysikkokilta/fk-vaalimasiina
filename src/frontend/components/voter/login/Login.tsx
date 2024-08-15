import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap'
import { useCookies } from 'react-cookie'
import { login } from '../../../api/login'
import { getVoterStatus } from '../../../api/voter'
import { useTranslation } from 'react-i18next'

export const Login = () => {
  const [cookies, setCookie, removeCookie] = useCookies(['token', 'alias'])
  const [identifier, setIdentifier] = useState('')
  const [alias, setAlias] = useState('')
  const { t } = useTranslation("translation", { keyPrefix: "voter.login" })

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
            <Card.Header as="h2">{t("title")}</Card.Header>
            <Card.Body>
              <Card.Text>
                {t("intro")}
              </Card.Text>
              <Card.Text>
                {t("intro_2")}
              </Card.Text>
              <Card.Text>
                <b>{t("code")}</b>
                <br />
                {t("code_description")}
              </Card.Text>
              <Card.Text>
                <b>{t("alias")}</b>
                <br />
                {t("alias_description")}
              </Card.Text>
              <Card.Text>
                <b>{t("notice")}</b>
              </Card.Text>
              <Form>
                <Form.Group controlId="formIdentifier">
                  <Form.Label className="mt-3">{t("code")}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={t("code_instruction")}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                </Form.Group>
                <Form.Group controlId="formAlias">
                  <Form.Label className="mt-3">{t("alias")}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={t("alias_instruction")}
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
                  {t("login_button")}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
