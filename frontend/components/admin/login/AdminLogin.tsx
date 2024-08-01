import React, { useState } from 'react'
import { Form, Button, Card, Row, Col } from 'react-bootstrap'
import { login } from '../../../api/admin/login'
import { useCookies } from 'react-cookie'

export const AdminLogin = () => {
  const [, setCookie] = useCookies(['admin-token'])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async () => {
    const response = await login(username, password)

    if (!response.ok) {
      return
    }

    setCookie('admin-token', response.data)
  }
  return (
    <Card className="box-shadow m-5">
      <Card.Header>
        <h1>Admin login</h1>
      </Card.Header>
      <Card.Body>
        <Row className="justify-content-center">
          <Col md={6}>
            <Form>
              <Form.Group className="mb-3" controlId="username">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  placeholder="Username"
                  onChange={(e) => {
                    setUsername(e.target.value)
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="password">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Password"
                  onChange={(e) => {
                    setPassword(e.target.value)
                  }}
                />
              </Form.Group>

              <Button variant="primary" onClick={handleLogin}>
                Submit
              </Button>
            </Form>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}
