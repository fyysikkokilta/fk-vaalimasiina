import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { Container, Navbar, Card } from 'react-bootstrap'
import { Admin } from './components/admin/Admin'
import { Voter } from './components/voter/Voter'
import { ElectionStepProvider } from './contexts/electionStep/ElectionStepContext'
import { ElectionProvider } from './contexts/election/ElectionContext'
import { Flip, ToastContainer } from 'react-toastify'

import 'react-toastify/scss/main.scss'

function App() {
  return (
    <Container>
      <Navbar bg="primary" variant="dark" className="box-shadow">
        <Container>
          <Navbar.Brand href="/">Fyysikkokillan vaalimasiina</Navbar.Brand>
          <Navbar.Text>
            <a href="/admin">Admin</a>
          </Navbar.Text>
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
            <a href="https://www.fyysikkokilta.fi">www.fyysikkokilta.fi</a>
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
