import React, { useState, useEffect } from 'react'
import { Card, Form, Button, Alert, ListGroup, Row, Col } from 'react-bootstrap'
import { LoadingSpinner } from '../shared/LoadingSpinner'
import { vote } from '../../api/vote'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { getVoterWithElection } from '../../api/voters'
import { Election, Voter } from '../../../../types/types'

export const Vote = () => {
  const { voterId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [voter, setVoter] = useState<Voter | null>(null)
  const [election, setElection] = useState<Election | null>(null)
  const [ballotId, setBallotId] = useState('')
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])
  const { t } = useTranslation('translation', { keyPrefix: 'voter.vote' })

  useEffect(() => {
    void (async () => {
      if (!voterId) {
        navigate('/')
        return
      }

      const voterResponse = await getVoterWithElection(voterId)
      if (!voterResponse.ok) {
        setLoading(false)
        return
      }
      setVoter(voterResponse.data.voter)
      setElection(voterResponse.data.election)
      setLoading(false)
    })()
  }, [navigate, voterId])

  if (loading) {
    return <LoadingSpinner />
  }

  const handleVote = async () => {
    const response = await vote(voter!.voterId, selectedCandidates)

    if (!response.ok) {
      return
    }

    setBallotId(response.data)
    setVoter((prev) => ({ ...prev!, hasVoted: true }))
    setSelectedCandidates([])
  }

  const handleRemove = (candidateId: string) => {
    setSelectedCandidates(selectedCandidates.filter((id) => id !== candidateId))
  }

  if (
    !election ||
    election.status !== 'ONGOING' ||
    voter?.electionId !== election.electionId
  ) {
    return (
      <Card>
        <Card.Header as="h2">{t('title')}</Card.Header>
        <Alert className="mx-5 d-flex flex-column text-center" variant="info">
          <Alert.Heading className="mb-3">
            {t('election_not_ongoing')}
          </Alert.Heading>
          <p>{t('election_not_ongoing_description')}</p>
        </Alert>
        <Col className="d-flex justify-content-center">
          <Button className="mb-3" onClick={() => navigate('/')}>
            {t('back_to_frontpage')}
          </Button>
        </Col>
      </Card>
    )
  }

  const filteredCandidates = election.candidates.filter(
    (candidate) => !selectedCandidates.includes(candidate.candidateId)
  )

  return (
    <Card>
      <Card.Header as="h2">{t('title')}</Card.Header>
      <Card.Header as="h4">{election.title}</Card.Header>
      <Card.Body>
        <Card.Text>{election.description}</Card.Text>
        {voter.hasVoted ? (
          <Alert variant="success">
            <Alert.Heading>{t('already_voted')}</Alert.Heading>
            {ballotId && (
              <>
                <p>{t('audit_info')}</p>
                <span>
                  {t('ballot_id')}: <b>{ballotId}</b>
                </span>
              </>
            )}
          </Alert>
        ) : (
          <Form>
            <Form.Group>
              <Row>
                <Form.Text>
                  <b>{t('vote_instruction')}</b>
                </Form.Text>
                <Form.Label className="mt-3">
                  <b>{t('candidates')}</b>
                </Form.Label>
                {election.candidates.length > 0 ? (
                  <>
                    <Form.Control
                      as="select"
                      onChange={(e) => {
                        if (!e.target.value) {
                          return
                        }
                        setSelectedCandidates((prev) => [
                          ...prev,
                          e.target.value
                        ])
                      }}
                    >
                      <option value="">{t('candidates_instruction')}</option>
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
                          (candidate) => candidate.candidateId === candidateId
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
                              {t('remove_selection')}
                            </Button>
                          </ListGroup.Item>
                        )
                      })}
                    </ListGroup>
                  </>
                ) : (
                  <Alert variant="warning">{t('no_candidates')}</Alert>
                )}
              </Row>
            </Form.Group>
            <Button variant="primary" onClick={handleVote}>
              {t('vote_button')}
            </Button>
          </Form>
        )}
        <Col className="d-flex justify-content-center">
          <Button className="mb-3" onClick={() => navigate('/')}>
            {t('back_to_frontpage')}
          </Button>
        </Col>
      </Card.Body>
    </Card>
  )
}
