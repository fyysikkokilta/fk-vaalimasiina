import 'react-toastify/scss/main.scss'

import React from 'react'
import { Button, Card, Container, Nav, Navbar } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import {
  BrowserRouter as Router,
  NavLink,
  Route,
  Routes
} from 'react-router-dom'
import { Flip, ToastContainer } from 'react-toastify'

import { Admin } from './components/admin/Admin'
import { Audit } from './components/audit/Audit'
import { Info } from './components/info/Info'
import { PreviousElectionList } from './components/results/PreviousElectionList'
import { PreviousResults } from './components/results/PreviousResults'
import { Vote } from './components/vote/Vote'
import { ElectionStepProvider } from './contexts/electionStep/ElectionStepProvider'

const APP_TITLE = import.meta.env.VITE_BRANDING_HEADER_TITLE_TEXT as
  | string
  | undefined
const APP_HOME_LINK = import.meta.env.VITE_BRANDING_FOOTER_HOME_LINK as
  | string
  | undefined
const APP_HOME_TEXT = import.meta.env.VITE_BRANDING_FOOTER_HOME_TEXT as
  | string
  | undefined

function App() {
  const { i18n, t } = useTranslation('translation', { keyPrefix: 'app' })

  const isEnglish = i18n.language === 'en'

  return (
    <Router>
      <header>
        <Navbar bg="primary" variant="dark" expand="lg" className="box-shadow">
          <Container>
            <Navbar.Brand>{APP_TITLE}</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link as={NavLink} to="/">
                  {t('main')}
                </Nav.Link>
                <Nav.Link as={NavLink} to="/audit">
                  {t('audit')}
                </Nav.Link>
                <Nav.Link as={NavLink} to="/elections">
                  {t('previous_results')}
                </Nav.Link>
                <Nav.Link as={NavLink} to="/admin">
                  {t('admin')}
                </Nav.Link>
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
      </header>
      <main>
        <Card className="fii-background">
          <div id="main-content" className="my-4 mx-5 box-shadow">
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
          </div>
        </Card>
      </main>
      <footer>
        <Navbar bg="primary" variant="dark" className="box-shadow">
          <Container className="center">
            <Navbar.Text>
              <a href={APP_HOME_LINK}>{APP_HOME_TEXT}</a>
            </Navbar.Text>
          </Container>
        </Navbar>
      </footer>
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
    </Router>
  )
}

export default App
