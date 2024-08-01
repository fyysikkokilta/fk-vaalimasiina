import React, { useContext, useEffect, useState } from 'react'
import {
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Modal,
  Alert,
} from 'react-bootstrap'
import { Voter } from '../../../../types/types'
import {
  addVoterCode,
  deleteVoterCode,
  disableVoterCode,
  enableVoterCode,
  getVoterCodes,
} from '../../../api/admin/voter'
import { ElectionContext } from '../../../contexts/election/ElectionContext'

const sortVoters = (voters: Voter[]) => {
  return voters.sort((a, b) => {
    if (a.active && !b.active) {
      return -1
    }
    if (!a.active && b.active) {
      return 1
    }
    return a.identifier.localeCompare(b.identifier)
  })
}

export const VoterMain = () => {
  const { election } = useContext(ElectionContext)!
  const [voters, setVoters] = useState<Voter[]>([])
  const [newVoterCode, setNewVoterCode] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedVoter, setSelectedVoter] = useState<string | null>(null)

  const fetchAndSetVoterCodes = async () => {
    const response = await getVoterCodes()
    if (!response.ok) {
      return
    }
    setVoters(sortVoters(response.data))
  }

  useEffect(() => {
    fetchAndSetVoterCodes()
    const interval = setInterval(() => fetchAndSetVoterCodes(), 3000)
    return () => clearInterval(interval)
  }, [])

  const voteOngoing = election?.status === 'ONGOING'

  const generateVoterCode = async () => {
    if (voteOngoing) {
      return
    }
    const identifier = `VOTER-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`

    const response = await addVoterCode(identifier)
    if (!response.ok) {
      return
    }
    setVoters((prev) => [...prev, response.data])
    setNewVoterCode(identifier)
  }

  const deleteVoter = async (identifier: string) => {
    if (voteOngoing) {
      return
    }
    const response = await deleteVoterCode(identifier)
    if (!response.ok) {
      return
    }
    setVoters((prev) =>
      prev.filter((voter) => voter.identifier !== response.data.identifier)
    )
  }

  const disableVoter = async (identifier: string) => {
    if (voteOngoing) {
      return
    }
    const response = await disableVoterCode(identifier)
    if (!response.ok) {
      return
    }
    setVoters((prev) =>
      prev.map((voter) =>
        voter.identifier === response.data.identifier ? response.data : voter
      )
    )
  }

  const enableVoter = async (identifier: string) => {
    if (voteOngoing) {
      return
    }
    const response = await enableVoterCode(identifier)
    if (!response.ok) {
      return
    }
    setVoters((prev) =>
      prev.map((voter) =>
        voter.identifier === response.data.identifier ? response.data : voter
      )
    )
  }

  const handleCloseModal = () => setShowModal(false)
  const handleShowModal = (voter: string) => {
    if (voteOngoing) {
      return
    }
    setSelectedVoter(voter)
    setShowModal(true)
  }

  return (
    <>
      <Row>
        <Col>
          <Card>
            <Card.Header as="h2">Äänestäjähallinta</Card.Header>
            <Card.Body>
              <Form>
                <Form.Group controlId="formNewVoterCode">
                  <Col>
                    <Row>
                      <Form.Label>Generoi uusi äänestäjäkoodi</Form.Label>
                      <Form.Text className="text-muted">
                        Äänestäjäkoodi on uniikki koodi, joka annetaan
                        äänestäjälle.
                      </Form.Text>
                    </Row>
                    <Button
                      variant="primary"
                      onClick={generateVoterCode}
                      className="mt-3"
                      disabled={voteOngoing}
                    >
                      Generoi
                    </Button>
                  </Col>
                </Form.Group>
                {newVoterCode && (
                  <Alert variant="success" className="mt-3">
                    Uusi äänestäjäkoodi: {newVoterCode}
                  </Alert>
                )}
              </Form>
              <Table striped bordered hover className="mt-4">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Äänestäjäkoodi</th>
                    <th>Aktivoitu</th>
                    <th>Kirjautunut</th>
                    <th>Alias</th>
                    <th>Toiminnot</th>
                  </tr>
                </thead>
                <tbody>
                  {voters.map((voter, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{voter.identifier}</td>
                      <td>{voter.active ? 'Aktiivinen' : 'Disabloitu'}</td>
                      <td>{voter.loggedIn ? 'Kyllä' : 'Ei'}</td>
                      <td>{voter.alias}</td>
                      <td className="d-flex justify-content-center">
                        {voter.active ? (
                          <Button
                            variant="danger"
                            onClick={() => disableVoter(voter.identifier)}
                            className="m-1"
                            disabled={voteOngoing}
                          >
                            Disabloi
                          </Button>
                        ) : (
                          <Button
                            variant="success"
                            onClick={() => enableVoter(voter.identifier)}
                            className="m-1"
                            disabled={voteOngoing}
                          >
                            Aktivoi
                          </Button>
                        )}
                        <Button
                          variant="danger"
                          onClick={() => {
                            handleShowModal(voter.identifier)
                          }}
                          className="m-1"
                          disabled={voteOngoing}
                        >
                          Poista
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Poista koodi</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Oletko varma, että haluat poistaa koodin:&nbsp;
          {selectedVoter}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Peruuta
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              deleteVoter(selectedVoter!)
              handleCloseModal()
            }}
            disabled={voteOngoing}
          >
            Poista
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
