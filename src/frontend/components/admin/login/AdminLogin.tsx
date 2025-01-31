import React, { useState } from 'react'
import { Button, Card, Col, Form, Row } from 'react-bootstrap'
import { useCookies } from 'react-cookie'
import { useTranslation } from 'react-i18next'

import { client } from '../../../api/trpc'

export const AdminLogin = () => {
  const [, setCookie] = useCookies(['admin-token'])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { t } = useTranslation('translation', { keyPrefix: 'admin.login' })

  const handleLogin = async () => {
    const token = await client.admin.login.authenticate.mutate({
      username,
      password
    })
    setCookie('admin-token', token)
  }
  return (
    <Card>
      <Card.Header as="h2">{t('title')}</Card.Header>
      <Card.Body>
        <Row className="justify-content-center">
          <Col md={6}>
            <Form>
              <Form.Group className="mb-3" controlId="username">
                <Form.Label>{t('username')}</Form.Label>
                <Form.Control
                  placeholder={t('username')}
                  onChange={(e) => {
                    setUsername(e.target.value)
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="password">
                <Form.Label>{t('password')}</Form.Label>
                <Form.Control
                  type="password"
                  placeholder={t('password')}
                  onChange={(e) => {
                    setPassword(e.target.value)
                  }}
                />
              </Form.Group>

              <Button variant="primary" onClick={handleLogin}>
                {t('login_button')}
              </Button>
            </Form>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}
