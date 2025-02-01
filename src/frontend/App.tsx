import 'react-toastify/scss/main.scss'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink, loggerLink } from '@trpc/client'
import React, { Suspense, useState } from 'react'
import { Button, Card, Container, Nav, Navbar } from 'react-bootstrap'
import { Cookies, useCookies } from 'react-cookie'
import { useTranslation } from 'react-i18next'
import {
  BrowserRouter as Router,
  NavLink,
  Route,
  Routes
} from 'react-router-dom'
import { Flip, ToastContainer } from 'react-toastify'

import { Admin } from './components/admin/Admin'
import { AdminLogin } from './components/admin/login/AdminLogin'
import { Audit } from './components/audit/Audit'
import { Info } from './components/info/Info'
import { PreviousElectionList } from './components/results/PreviousElectionList'
import { PreviousResults } from './components/results/PreviousResults'
import { LoadingSpinner } from './components/shared/LoadingSpinner'
import { Vote } from './components/vote/Vote'
import { ElectionStepProvider } from './contexts/electionStep/ElectionStepProvider'
import { errorLink, trpc } from './trpc/trpc'

const APP_TITLE = process.env.BRANDING_HEADER_TITLE_TEXT
const APP_HOME_LINK = process.env.BRANDING_FOOTER_HOME_LINK
const APP_HOME_TEXT = process.env.BRANDING_FOOTER_HOME_TEXT

function App() {
  const { i18n, t } = useTranslation('translation', { keyPrefix: 'app' })
  const [cookies] = useCookies(['admin-token'])
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        errorLink,
        loggerLink({
          enabled: (opts) =>
            Boolean(import.meta.env.DEV) ||
            (opts.direction === 'down' && opts.result instanceof Error)
        }),
        httpBatchLink({
          url: '/trpc',
          headers() {
            const cookies = new Cookies()
            const adminToken = cookies.get('admin-token') as string | undefined

            return {
              authorization: adminToken ? `Bearer ${adminToken}` : ''
            }
          }
        })
      ]
    })
  )

  const isEnglish = i18n.language === 'en'

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <header>
            <Navbar
              bg="primary"
              variant="dark"
              expand="lg"
              className="box-shadow"
            >
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
                      !cookies['admin-token'] ? (
                        <AdminLogin />
                      ) : (
                        <Suspense fallback={<LoadingSpinner />}>
                          <ElectionStepProvider>
                            <Admin />
                          </ElectionStepProvider>
                        </Suspense>
                      )
                    }
                  />
                  <Route
                    path="/audit"
                    element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <Audit />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/elections/:electionId"
                    element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <PreviousResults />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/elections"
                    element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <PreviousElectionList />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/vote/:voterId"
                    element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <Vote />
                      </Suspense>
                    }
                  />
                  <Route
                    path="*"
                    element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <Info />
                      </Suspense>
                    }
                  />
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
      </QueryClientProvider>
    </trpc.Provider>
  )
}

export default App
