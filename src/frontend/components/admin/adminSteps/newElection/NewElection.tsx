import React, { useContext, useEffect, useState } from 'react'
import { Button, Col, Form, ListGroup, Row } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import { ElectionStepContext } from '../../../../contexts/electionStep/ElectionStepContext'
import { RouterInput, trpc } from '../../../../trpc/trpc'
import { LoadingSpinner } from '../../../shared/LoadingSpinner'
import { AdminNavigation } from '../adminNavigation/AdminNavigation'

// Used for both creating a new election and editing an existing one

export const NewElection = () => {
  const { electionStep } = useContext(ElectionStepContext)!
  const { election, setElection } = useContext(ElectionStepContext)!
  const [newElection, setNewElection] = useState<
    RouterInput['admin']['elections']['create']
  >({
    title: '',
    description: '',
    seats: 0,
    candidates: []
  })
  const [newCandidate, setNewCandidate] = useState('')
  const { t } = useTranslation('translation', {
    keyPrefix: 'admin.admin_main.new_election'
  })
  const create = trpc.admin.elections.create.useMutation()
  const update = trpc.admin.elections.update.useMutation()

  useEffect(() => {
    if (electionStep === 'EDIT' && election) {
      setNewElection(election)
    }
  }, [electionStep, election])

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    isNumber: boolean = false
  ) => {
    setNewElection((electionState) => ({
      ...electionState,
      [event.target.name]: isNumber
        ? parseInt(event.target.value)
        : event.target.value
    }))
  }

  const addCandidate = (candidateName: string) => {
    setNewElection((electionState) => ({
      ...electionState,
      candidates: [...electionState.candidates, { name: candidateName }]
    }))
    setNewCandidate('')
  }

  const removeCandidate = (index: number) => {
    setNewElection((electionState) => {
      const updatedCandidates = electionState.candidates.filter(
        (_, i) => i !== index
      )

      return {
        ...electionState,
        candidates: updatedCandidates
      }
    })
  }

  const handleSubmit = async () => {
    if (electionStep === 'NEW') {
      const election = await create.mutateAsync(newElection)
      setElection(election)
    } else {
      if (!election) {
        return false
      }
      const updatedElection = await update.mutateAsync({
        electionId: election.electionId,
        ...newElection
      })
      setElection(updatedElection)
    }
    return true
  }

  const disabled = !(
    newElection.title &&
    newElection.description &&
    newElection.seats &&
    newElection.seats > 0 &&
    newElection.candidates.length
  )

  if (electionStep === 'EDIT' && !election) {
    return <LoadingSpinner />
  }

  return (
    <>
      <AdminNavigation disableNext={disabled} onNext={handleSubmit} />
      <Form className="mt-3">
        <Row>
          <Col>
            <Form.Group className="mb-3" controlId="title">
              <Form.Label>{t('election_title')}</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={newElection.title}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="description">
              <Form.Label>{t('description')}</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={newElection.description}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="seats">
              <Form.Label>{t('seats')}</Form.Label>
              <Form.Control
                type="number"
                name="seats"
                value={newElection.seats}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange(e, true)
                }
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group className="mb-3" controlId="newCandidate">
              <Form.Label>{t('new_candidate')}</Form.Label>
              <Form.Control
                value={newCandidate}
                type="text"
                onChange={(e) => setNewCandidate(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="addCandidate">
              <Button
                variant="dark"
                disabled={!newCandidate}
                onClick={() => addCandidate(newCandidate)}
              >
                {t('add_candidate')}
              </Button>
            </Form.Group>
            <Form.Group className="mb-3" controlId="candidates">
              <Form.Label>{t('candidates')}</Form.Label>
              <ListGroup>
                {newElection.candidates.map((candidate, i) => (
                  <ListGroup.Item key={i}>
                    <Row>
                      <Col className="d-flex align-items-center">
                        <b>{candidate.name}</b>
                      </Col>
                      <Col className="text-end">
                        <Button
                          variant="dark"
                          onClick={() => removeCandidate(i)}
                        >
                          {t('remove_candidate')}
                        </Button>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Form.Group>
          </Col>
        </Row>
      </Form>
    </>
  )
}
