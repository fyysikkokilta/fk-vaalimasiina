import React from 'react'
import { Route, Routes, NavLink } from 'react-router-dom'

import styles from './admin.module.scss'
import { AdminMain } from './adminMain/AdminMain'
import { VoterMain } from './voters/VoterMain'
import { Card, Container } from 'react-bootstrap'
import { useCookies } from 'react-cookie'
import { AdminLogin } from './login/AdminLogin'

export const Admin = () => {
  const [cookies] = useCookies(['admin-token'])

  if (!cookies['admin-token']) {
    return <AdminLogin />
  }

  return (
    <Card className="box-shadow m-5">
      <Card.Header>
        <h1>Admin</h1>
      </Card.Header>
      <Card.Body>
        <Container className={styles.adminTabLinkContainer}>
          <NavLink className={styles.adminTabLink} to="">
            Etusivu
          </NavLink>
          <NavLink className={styles.adminTabLink} to="voters">
            Äänestäjät
          </NavLink>
        </Container>
        <Routes>
          <Route path="/" element={<AdminMain />} />
          <Route path="voters" element={<VoterMain />} />
        </Routes>
      </Card.Body>
    </Card>
  )
}
