import React from 'react'
import { Route, Routes, NavLink } from 'react-router-dom'

import styles from './admin.module.scss'
import { AdminMain } from './adminMain/AdminMain'
import { VoterMain } from './voters/VoterMain'
import { Card, Container } from 'react-bootstrap'
import { useCookies } from 'react-cookie'
import { AdminLogin } from './login/AdminLogin'
import { useTranslation } from 'react-i18next'

export const Admin = () => {
  const [cookies] = useCookies(['admin-token'])
  const { t } = useTranslation('translation', { keyPrefix: 'admin' })

  if (!cookies['admin-token']) {
    return <AdminLogin />
  }

  return (
    <Card className="box-shadow m-5">
      <Card.Header>
        <h1>{t('admin')}</h1>
      </Card.Header>
      <Card.Body>
        <Container className={styles.adminTabLinkContainer}>
          <NavLink className={styles.adminTabLink} to="">
            {t('main')}
          </NavLink>
          <NavLink className={styles.adminTabLink} to="voters">
            {t('voters')}
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
