import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult
} from '@hello-pangea/dnd'
import React, { useEffect, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Col,
  ListGroup,
  Modal,
  Row
} from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'

import { client, RouterOutput } from '../../api/trpc'
import { LoadingSpinner } from '../shared/LoadingSpinner'

export const Vote = () => {
  const { voterId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [disableVote, setDisableVote] = useState(false)
  const [confirmingVote, setConfirmingVote] = useState(false)
  const [voter, setVoter] = useState<
    RouterOutput['voters']['getWithId']['voter'] | null
  >(null)
  const [election, setElection] = useState<
    RouterOutput['voters']['getWithId']['election'] | null
  >(null)
  const [ballotId, setBallotId] = useState('')
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])
  const [availableCandidates, setAvailableCandidates] = useState<string[]>([])
  const { t } = useTranslation('translation', { keyPrefix: 'voter.vote' })

  const handleDragStart = () => {
    setDisableVote(true)
  }

  const handleDragEnd = (result: DropResult<string>) => {
    if (!result.destination) {
      return
    }
    const destinationIndex = result.destination.index

    const candidateId = result.draggableId

    if (
      result.source.droppableId === 'availableCandidates' &&
      result.destination.droppableId === 'selectedCandidates'
    ) {
      const candidate = availableCandidates.find(
        (candidate) => candidate === candidateId
      )
      if (candidate) {
        setSelectedCandidates((prev) => {
          const newCandidates = [...prev]
          newCandidates.splice(destinationIndex, 0, candidate)
          return newCandidates
        })
        setAvailableCandidates((prev) => prev.filter((c) => c !== candidateId))
      }
    }

    if (
      result.source.droppableId === 'selectedCandidates' &&
      result.destination.droppableId === 'selectedCandidates'
    ) {
      setSelectedCandidates((prev) => {
        const newCandidates = [...prev]
        const [removed] = newCandidates.splice(result.source.index, 1)
        newCandidates.splice(destinationIndex, 0, removed)
        return newCandidates
      })
    }

    if (
      result.source.droppableId === 'selectedCandidates' &&
      result.destination.droppableId === 'availableCandidates'
    ) {
      setAvailableCandidates((prev) => {
        const newCandidates = [...prev]
        newCandidates.splice(destinationIndex, 0, candidateId)
        return newCandidates
      })
      setSelectedCandidates((prev) => prev.filter((c) => c !== candidateId))
    }

    if (
      result.source.droppableId === 'availableCandidates' &&
      result.destination.droppableId === 'availableCandidates'
    ) {
      const [removed] = availableCandidates.splice(result.source.index, 1)
      availableCandidates.splice(destinationIndex, 0, removed)
    }
    setDisableVote(false)
  }

  const handleDoubleClickAdd = (event: React.MouseEvent<HTMLElement>) => {
    const candidateId = event.currentTarget.id
    setSelectedCandidates((prev) => [...prev, candidateId])
    setAvailableCandidates((prev) => prev.filter((c) => c !== candidateId))
  }

  const handleDoubleClickRemove = (event: React.MouseEvent<HTMLElement>) => {
    const candidateId = event.currentTarget.id
    setAvailableCandidates((prev) => [...prev, candidateId])
    setSelectedCandidates((prev) => prev.filter((c) => c !== candidateId))
  }

  useEffect(() => {
    void (async () => {
      if (!voterId) {
        await navigate('/')
        return
      }

      const { voter, election } = await client.voters.getWithId.query({
        voterId
      })
      setLoading(false)
      setVoter(voter)
      setElection(election)
      setAvailableCandidates(election.candidates.map((c) => c.candidateId))
      setLoading(false)
    })()
  }, [navigate, voterId])

  if (loading) {
    return <LoadingSpinner />
  }

  const handleVote = async () => {
    if (!voterId) {
      return
    }
    setDisableVote(true)
    setConfirmingVote(false)
    const { ballotId } = await client.votes.post.mutate({
      voterId,
      ballot: selectedCandidates.map((candidateId, i) => ({
        candidateId,
        preferenceNumber: i + 1
      }))
    })

    setDisableVote(false)
    setBallotId(ballotId)
    setVoter((prev) => ({ ...prev!, hasVoted: true }))
  }

  const handleVoteConfirmation = () => {
    setConfirmingVote(true)
  }

  const handleVoteCancel = () => {
    setConfirmingVote(false)
  }

  const getCandidateName = (candidateId: string) => {
    return election?.candidates.find((c) => c.candidateId === candidateId)?.name
  }

  const getBallotCode = async () => {
    if (!ballotId) {
      return
    }
    await navigator.clipboard.writeText(ballotId)
    toast.success(t('audit_copied_to_clipboard'))
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

  return (
    <>
      <Card>
        <Card.Header as="h2">{t('title')}</Card.Header>
        <Card.Header as="h4">{election.title}</Card.Header>
        <Card.Body>
          <Button className="mb-3" onClick={() => navigate('/')}>
            {t('back_to_frontpage')}
          </Button>
          <Card.Text>{election.description}</Card.Text>
          {voter.hasVoted ? (
            <Alert variant="success" className="text-center">
              <Alert.Heading>
                {ballotId ? t('thanks_for_voting') : t('already_voted')}
              </Alert.Heading>
              {ballotId && (
                <>
                  <p>{t('audit_info')}</p>
                  <Button variant="primary" onClick={getBallotCode}>
                    {t('audit_button')}
                  </Button>
                </>
              )}
            </Alert>
          ) : (
            <>
              <div className="my-3">
                <b>{t('vote_instruction')}</b>
              </div>
              <DragDropContext
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <Row>
                  <Col md={6}>
                    <h5>{t('your_ballot')}</h5>
                    <Droppable droppableId="selectedCandidates">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="mb-3 p-2 border rounded"
                          id="selected-candidates"
                          style={{
                            minHeight: '200px',
                            backgroundColor: '#f8f9fa'
                          }}
                        >
                          <ListGroup>
                            {selectedCandidates.map((candidateId, index) => (
                              <Draggable
                                key={candidateId}
                                draggableId={candidateId}
                                index={index}
                              >
                                {(provided) => (
                                  <ListGroup.Item
                                    ref={provided.innerRef}
                                    id={candidateId}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="d-flex align-items-center mb-2"
                                    onDoubleClick={handleDoubleClickRemove}
                                  >
                                    {index + 1}. &nbsp;{' '}
                                    {getCandidateName(candidateId)}
                                  </ListGroup.Item>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </ListGroup>
                        </div>
                      )}
                    </Droppable>
                  </Col>
                  <Col md={6}>
                    <h5>{t('available_candidates')}</h5>
                    <Droppable droppableId="availableCandidates">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="mb-3 p-2 border rounded"
                          id="available-candidates"
                          style={{
                            minHeight: '200px',
                            backgroundColor: '#f8f9fa'
                          }}
                        >
                          <ListGroup>
                            {availableCandidates.map((candidateId, index) => (
                              <Draggable
                                key={candidateId}
                                draggableId={candidateId}
                                index={index}
                              >
                                {(provided) => (
                                  <ListGroup.Item
                                    ref={provided.innerRef}
                                    id={candidateId}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="d-flex align-items-center mb-2"
                                    onDoubleClick={handleDoubleClickAdd}
                                  >
                                    {getCandidateName(candidateId)}
                                  </ListGroup.Item>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </ListGroup>
                        </div>
                      )}
                    </Droppable>
                  </Col>
                </Row>
              </DragDropContext>
              <div className="d-flex justify-content-center mt-3">
                <Button
                  variant="primary"
                  onClick={handleVoteConfirmation}
                  disabled={disableVote}
                >
                  {t('submit_vote')}
                </Button>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
      <Modal show={confirmingVote} onHide={handleVoteCancel}>
        <Modal.Header closeButton>
          <Modal.Title>{t('confirm_vote')}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <p>{t('confirm_vote_description')}</p>
          {selectedCandidates.length > 0 ? (
            <ListGroup>
              {selectedCandidates.map((candidateId, index) => (
                <ListGroup.Item key={candidateId}>
                  {index + 1}. &nbsp; {getCandidateName(candidateId)}
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <Alert variant="danger" className="text-center mx-5">
              {t('empty_ballot')}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleVoteCancel}>
            {t('cancel')}
          </Button>
          <Button variant="primary" onClick={handleVote}>
            {t('confirm')}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
