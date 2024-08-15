import React, { useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { Container, Navbar, Card, Button } from 'react-bootstrap'
import { Admin } from './components/admin/Admin'
import { Voter } from './components/voter/Voter'
import { ElectionStepProvider } from './contexts/electionStep/ElectionStepContext'
import { ElectionProvider } from './contexts/election/ElectionContext'
import { Flip, ToastContainer } from 'react-toastify'

import 'react-toastify/scss/main.scss'
import { useTranslation } from 'react-i18next'

function App() {
  const { i18n, t } = useTranslation('translation', { keyPrefix: 'app' })

  useEffect(() => {
    document.title = t('title')
  }, [i18n.language, t])

  return (
    <Container>
      <Navbar bg="primary" variant="dark" className="box-shadow">
        <Container>
          <Navbar.Brand href="/">{t('title')}</Navbar.Brand>
          <Navbar.Text>
            <a href="/admin">{t('admin')}</a>
          </Navbar.Text>
          {i18n.language === 'en' ? (
            <Button
              variant="outline-light"
              onClick={() => i18n.changeLanguage('fi')}
            >
              Suomeksi
            </Button>
          ) : (
            <Button
              variant="outline-light"
              onClick={() => i18n.changeLanguage('en')}
            >
              In English
            </Button>
          )}
        </Container>
      </Navbar>
      <Container className="mt-4">
        <Card className="box-shadow">
          <Card.Body className="fii-background">
            <ElectionProvider>
              <Router>
                <Routes>
                  <Route
                    path="/admin/*"
                    element={
                      <ElectionStepProvider>
                        <Admin />
                      </ElectionStepProvider>
                    }
                  />
                  <Route path="/" element={<Voter />} />
                </Routes>
              </Router>
            </ElectionProvider>
          </Card.Body>
        </Card>
      </Container>
      <Navbar bg="primary" variant="dark" className="box-shadow mt-4">
        <Container className="center">
          <Navbar.Text>
            <a href={t('footer_link')}>www.fyysikkokilta.fi</a>
          </Navbar.Text>
        </Container>
      </Navbar>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        transition={Flip}
      />
    </Container>
  )
}

export default App
