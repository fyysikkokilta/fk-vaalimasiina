import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { Container, Navbar, Card, Button, Nav } from 'react-bootstrap'
import { Admin } from './components/admin/Admin'
import { Vote } from './components/vote/Vote'
import { Flip, ToastContainer } from 'react-toastify'

import 'react-toastify/scss/main.scss'
import { useTranslation } from 'react-i18next'
import { PreviousElectionList } from './components/results/PreviousElectionList'
import { PreviousResults } from './components/results/PreviousResults'
import { Info } from './components/info/Info'
import { Audit } from './components/audit/Audit'
import { ElectionStepProvider } from './contexts/electionStep/ElectionStepProvider'
import { ElectionProvider } from './contexts/election/ElectionProvider'

const APP_TITLE = import.meta.env.VITE_BRANDING_HEADER_TITLE_TEXT
const APP_HOME_LINK = import.meta.env.VITE_BRANDING_FOOTER_HOME_LINK
const APP_HOME_TEXT = import.meta.env.VITE_BRANDING_FOOTER_HOME_TEXT

function App() {
  const { i18n, t } = useTranslation('translation', { keyPrefix: 'app' })

  const isEnglish = i18n.language === 'en'

  return (
    <Container>
      <Navbar bg="primary" variant="dark" expand="lg" className="box-shadow">
        <Container>
          <Navbar.Brand href="/">{APP_TITLE}</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="/">{t('main')}</Nav.Link>
              <Nav.Link href="/audit">{t('audit')}</Nav.Link>
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
                  <Route path="/audit" element={<Audit />} />
                  <Route
                    path="/elections/:electionId"
                    element={<PreviousResults />}
                  />
                  <Route path="/elections" element={<PreviousElectionList />} />
                  <Route path="/vote/:voterId" element={<Vote />} />
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
            <a href={APP_HOME_LINK}>{APP_HOME_TEXT}</a>
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
