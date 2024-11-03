import React, { useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { Container, Navbar, Card, Button, Nav } from 'react-bootstrap'
import { Admin } from './components/admin/Admin'
import { Vote } from './components/vote/Vote'
import { ElectionStepProvider } from './contexts/electionStep/ElectionStepContext'
import { ElectionProvider } from './contexts/election/ElectionContext'
import { Flip, ToastContainer } from 'react-toastify'

import 'react-toastify/scss/main.scss'
import { useTranslation } from 'react-i18next'
import { PreviousElectionList } from './components/results/PreviousElectionList'
import { PreviousResults } from './components/results/PreviousResults'
import { Info } from './components/info/Info'

function App() {
  const { i18n, t } = useTranslation('translation', { keyPrefix: 'app' })

  useEffect(() => {
    document.title = t('title')
  }, [i18n.language, t])

  const isEnglish = i18n.language === 'en'

  return (
    <Container>
      <Navbar bg="primary" variant="dark" expand="lg" className="box-shadow">
        <Container>
          <Navbar.Brand href="/">{t('title')}</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="/">{t('main')}</Nav.Link>
              <Nav.Link href="/elections">{t('previous_results')}</Nav.Link>
              <Nav.Link href="/admin">{t('admin')}</Nav.Link>
            </Nav>
              <Button
                variant="outline-light"
                onClick={() => i18n.changeLanguage(isEnglish ? 'fi' : 'en')}
              >
                {isEnglish ? 'Suomeksi' : 'In English'}
              </Button>
          </Navbar.Collapse>
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
                  <Route
                    path="/elections/:electionId"
                    element={<PreviousResults />}
                  />
                  <Route path="/elections" element={<PreviousElectionList />} />
                  <Route path="/vote/:votingId" element={<Vote />} />
                  <Route path="*" element={<Info />} />
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
