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
import { Voter } from '../../../../../types/types'
import {
  addVoterCode,
  deleteVoterCode,
  disableVoterCode,
  enableVoterCode,
  getVoterCodes,
} from '../../../api/admin/voter'
import { ElectionContext } from '../../../contexts/election/ElectionContext'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation('translation', {
    keyPrefix: 'admin.voter_management',
  })

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
            <Card.Header as="h2">{t('title')}</Card.Header>
            <Card.Body>
              <Form>
                <Form.Group controlId="formNewVoterCode">
                  <Col>
                    <Row>
                      <Form.Label>{t('generate_new_code')}</Form.Label>
                      <Form.Text className="text-muted">
                        {t('generate_new_code_description')}
                      </Form.Text>
                    </Row>
                    <Button
                      variant="primary"
                      onClick={generateVoterCode}
                      className="mt-3"
                      disabled={voteOngoing}
                    >
                      {t('generate_new_code_button')}
                    </Button>
                  </Col>
                </Form.Group>
                {newVoterCode && (
                  <Alert variant="success" className="mt-3">
                    {t('new_voter_code')}: {newVoterCode}
                  </Alert>
                )}
              </Form>
              <Table striped bordered hover className="mt-4">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{t('voter_code')}</th>
                    <th>{t('activated')}</th>
                    <th>{t('logged_in')}</th>
                    <th>{t('alias')}</th>
                    <th>{t('operations')}</th>
                  </tr>
                </thead>
                <tbody>
                  {voters.map((voter, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{voter.identifier}</td>
                      <td>{voter.active ? t('active') : t('inactive')}</td>
                      <td>{voter.loggedIn ? t('yes') : t('no')}</td>
                      <td>{voter.alias}</td>
                      <td className="d-flex justify-content-center">
                        {voter.active ? (
                          <Button
                            variant="danger"
                            onClick={() => disableVoter(voter.identifier)}
                            className="m-1"
                            disabled={voteOngoing}
                          >
                            {t('deactivate')}
                          </Button>
                        ) : (
                          <Button
                            variant="success"
                            onClick={() => enableVoter(voter.identifier)}
                            className="m-1"
                            disabled={voteOngoing}
                          >
                            {t('activate')}
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
                          {t('remove')}
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
          <Modal.Title>{t('remove_code')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t('remove_code_description')}:&nbsp;
          {selectedVoter}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            {t('cancel_button')}
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              deleteVoter(selectedVoter!)
              handleCloseModal()
            }}
            disabled={voteOngoing}
          >
            {t('remove_code_button')}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
