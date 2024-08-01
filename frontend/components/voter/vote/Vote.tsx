import React, { useState, useEffect, useContext } from 'react'
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  ListGroup,
  Row,
  Col,
} from 'react-bootstrap'
import { LoadingSpinner } from '../../shared/LoadingSpinner'
import { useCookies } from 'react-cookie'
import { ElectionContext } from '../../../contexts/election/ElectionContext'
import { getVoterStatus } from '../../../api/voter'
import { logout } from '../../../api/login'
import { vote, checkIfAlreadyVoted } from '../../../api/vote'

export const Vote = () => {
  const { election } = useContext(ElectionContext)!
  const [cookies, , removeCookie] = useCookies(['token'])
  const [loading, setLoading] = useState(true)
  const [hasVoted, setHasVoted] = useState(false)
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])

  useEffect(() => {
    (async () => {
      if (!cookies.token) {
        return
      }

      const statusResponse = await getVoterStatus(cookies.token)

      if (!statusResponse.ok) {
        removeCookie('token')
        setLoading(false)
        return
      }

      if (!statusResponse.data.active || !statusResponse.data.loggedIn) {
        removeCookie('token')
      }

      if (!election) {
        setLoading(false)
        return
      }

      const votedResponse = await checkIfAlreadyVoted(
        cookies.token,
        election.electionId
      )
      if (!votedResponse.ok) {
        setLoading(false)
        return
      }
      setHasVoted(votedResponse.data)
      setLoading(false)
    })()
  }, [cookies.token, election, removeCookie])

  if (loading) {
    return <LoadingSpinner />
  }

  const handleVote = async () => {
    if (!cookies.token) {
      return
    }
    const response = await vote(
      cookies.token,
      election!.electionId!,
      selectedCandidates
    )

    if (!response.ok) {
      return
    }

    setHasVoted(true)
    setSelectedCandidates([])
  }

  const handleRemove = (candidateId: string) => {
    setSelectedCandidates(selectedCandidates.filter((id) => id !== candidateId))
  }

  const handleLogout = async () => {
    const response = await logout(cookies.token)

    if (!response.ok) {
      return
    }

    removeCookie('token')
  }

  if (!election || election.status !== 'ONGOING') {
    return (
      <Container id="vote-container" className="mt-5 mb-5">
        <Row className="justify-content-center">
          <Col md={6}>
            <Card className="box-shadow">
              <Card.Header as="h2">Äänestäminen</Card.Header>
              <Alert
                className="mx-5 d-flex flex-column text-center"
                variant="info"
              >
                <Alert.Heading className="mb-3">
                  Ei vaaleja käynnissä
                </Alert.Heading>
                <p>
                  Sinulle kerrotaan, kun äänestäminen alkaa ja voit päivittää
                  sivun
                </p>
              </Alert>
              <Col className="d-flex justify-content-center">
                <Button className="mb-3" onClick={handleLogout}>
                  Kirjaudu ulos
                </Button>
              </Col>
            </Card>
          </Col>
        </Row>
      </Container>
    )
  }

  const filteredCandidates = election.candidates.filter(
    (candidate) => !selectedCandidates.includes(candidate.candidateId)
  )

  return (
    <Container id="vote-container" className="mt-5 mb-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="box-shadow">
            <Card.Header as="h2">Äänestäminen</Card.Header>
            <Card.Header as="h4">{election.title}</Card.Header>
            <Card.Body>
              <Card.Text>{election.description}</Card.Text>
              {hasVoted ? (
                <Alert variant="success">Olet jo äänestänyt</Alert>
              ) : (
                <Form>
                  <Form.Group>
                    <Row>
                      <Form.Text>
                        Valitse ehdokkaat haluamassasi järjestyksessä ja paina
                        "Äänestä" äänestääksesi
                      </Form.Text>
                      <Form.Label className="mt-3">
                        <b>Ehdokkaat</b>
                      </Form.Label>
                      {election.candidates.length > 0 ? (
                        <>
                          <Form.Control
                            as="select"
                            onChange={(e) => {
                              if (!e.target.value) {
                                return
                              }
                              setSelectedCandidates([
                                ...selectedCandidates,
                                e.target.value,
                              ])
                            }}
                          >
                            <option value="">Valitse ehdokas</option>
                            {filteredCandidates.map((candidate) => (
                              <option
                                key={candidate.candidateId}
                                value={candidate.candidateId}
                              >
                                {candidate.name}
                              </option>
                            ))}
                          </Form.Control>
                          <ListGroup>
                            {selectedCandidates.map((candidateId, index) => {
                              const candidate = election.candidates.find(
                                (candidate) =>
                                  candidate.candidateId === candidateId
                              )!
                              return (
                                <ListGroup.Item
                                  key={candidateId}
                                  className="d-flex align-items-center mb-3"
                                >
                                  {index + 1}. &nbsp; {candidate.name}{' '}
                                  <Button
                                    className="ms-auto"
                                    onClick={() => handleRemove(candidateId)}
                                  >
                                    Poista
                                  </Button>
                                </ListGroup.Item>
                              )
                            })}
                          </ListGroup>
                        </>
                      ) : (
                        <Alert variant="warning">Ei vielä ehdokkaita</Alert>
                      )}
                    </Row>
                  </Form.Group>
                  <Button variant="primary" onClick={handleVote}>
                    Äänestä
                  </Button>
                </Form>
              )}
              <Col className="d-flex justify-content-center">
                <Button className="mb-3" onClick={handleLogout}>
                  Kirjaudu ulos
                </Button>
              </Col>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
