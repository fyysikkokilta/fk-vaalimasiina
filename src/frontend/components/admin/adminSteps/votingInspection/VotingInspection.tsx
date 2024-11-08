import React, { useState, useEffect, useContext } from 'react'

import { Button, Col, Container, Form, ListGroup, Row } from 'react-bootstrap'
import { AdminNavigation } from '../adminNavigation/AdminNavigation'
import { ElectionContext } from '../../../../contexts/election/ElectionContext'
import { LoadingSpinner } from '../../../shared/LoadingSpinner'
import {
  changeVoterEmail,
  getAllVotersForElection,
  getVotersWhoVoted,
} from '../../../../api/admin/voters'
import { abortVoting, endVoting } from '../../../../api/admin/elections'
import { useTranslation } from 'react-i18next'
import { Voter } from '../../../../../../types/types'

export const VotingInspection = () => {
  const [allVoters, setAllVoters] = useState<Voter[] | null>(null)
  const [votersWhoVoted, setVotersWhoVoted] = useState<Voter[] | null>(null)
  const [showRemainingVoters, setShowRemainingVoters] = useState(false)
  const { election, setElection } = useContext(ElectionContext)!
  const { t } = useTranslation('translation', {
    keyPrefix: 'admin.admin_main.voting_inspection',
  })

  const [oldEmail, setOldEmail] = useState('')
  const [newEmail, setNewEmail] = useState('')

  useEffect(() => {
    ;(async () => {
      if (!election) return
      const response = await getAllVotersForElection(election.electionId)
      if (!response.ok) {
        return
      }
      setAllVoters(response.data)
    })()
  }, [election])

  const fetchAndSetRemainingVoters = async (electionId: string) => {
    const response = await getVotersWhoVoted(electionId)
    if (!response.ok) {
      return
    }
    setVotersWhoVoted(response.data)
  }

  useEffect(() => {
    if (!election) return
    fetchAndSetRemainingVoters(election.electionId)

    const interval = setInterval(
      () => fetchAndSetRemainingVoters(election.electionId),
      3000
    )

    return () => clearInterval(interval)
  }, [election])

  if (!election || !allVoters || !votersWhoVoted) {
    return <LoadingSpinner />
  }

  const handleAbortVoting = async () => {
    const response = await abortVoting(election.electionId)
    if (!response.ok) {
      return false
    }
    setElection((election) => ({ ...election!, status: 'CREATED' }))
    return true
  }

  const handleEndVoting = async () => {
    const response = await endVoting(election.electionId)
    if (!response.ok) {
      return false
    }
    setElection((election) => ({ ...election!, status: 'FINISHED' }))
    return true
  }

  const toggleRemainingVoters = () => {
    setShowRemainingVoters(!showRemainingVoters)
  }

  const handleEmailChange = async () => {
    const voterId = allVoters.find((v) => v.email === oldEmail)!.voterId
    const response = await changeVoterEmail(voterId, newEmail)
    if (!response.ok) {
      return
    }
    setAllVoters((previous) =>
      previous!.map((voter) => ({
        ...voter,
        email: voter.voterId === voterId ? newEmail : voter.email,
      }))
    )
    setOldEmail('')
    setNewEmail('')
  }

  const remainingVoters = allVoters.filter(
    (voter) => !votersWhoVoted.find((v) => v.voterId === voter.voterId)
  )

  const validOldEmail = !!allVoters.find((v) => v.email === oldEmail)
  const validNewEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)
  const newEmailNotInOtherEmails = allVoters.every((v) => v.email !== newEmail)
  const validEmailChange =
    validOldEmail && validNewEmail && newEmailNotInOtherEmails

  return (
    <>
      <AdminNavigation
        disableNext={remainingVoters.length > 0}
        onBack={handleAbortVoting}
        onNext={handleEndVoting}
      />
      <Container className="d-flex flex-column align-items-center">
        <h3>{election.title}</h3>
        <p>{election.description}</p>
        <ListGroup>
          <ListGroup.Item>
            <span>
              {t('given_votes')}: {votersWhoVoted.length}
            </span>
          </ListGroup.Item>
          <ListGroup.Item>
            <span>
              {t('voters')}: {allVoters.length}
            </span>
          </ListGroup.Item>
        </ListGroup>
        <Button onClick={toggleRemainingVoters} className="mt-3">
          {showRemainingVoters
            ? t('hide_remaining_voters')
            : t('show_remaining_voters')}
        </Button>
        {showRemainingVoters && (
          <>
            <Form className="mt-3">
              <Form.Group controlId="oldEmail">
                <Form.Label>{t('old_email')}</Form.Label>
                <Form.Control
                  type="email"
                  value={oldEmail}
                  onChange={(e) => setOldEmail(e.target.value)}
                />
              </Form.Group>
              <Form.Group controlId="newEmail">
                <Form.Label>{t('new_email')}</Form.Label>
                <Form.Control
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </Form.Group>
              <Button onClick={handleEmailChange} disabled={!validEmailChange}>
                {t('change_email')}
              </Button>
            </Form>
            <ListGroup className="mt-3 w-100">
              <h4 className="text-center mb-3">{t('remaining_voters')}</h4>
              <Row>
                {remainingVoters.map((voter) => (
                  <Col key={voter.voterId} sm={3} className="px-0 text-center">
                    <ListGroup.Item>{voter.email}</ListGroup.Item>
                  </Col>
                ))}
              </Row>
            </ListGroup>
          </>
        )}
      </Container>
    </>
  )
}
