import React, { useContext, useEffect, useState } from 'react'
import { Button, Container, Form, ListGroup } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import { Voter } from '../../../../../../types/types'
import { abortVoting, endVoting } from '../../../../api/admin/elections'
import { changeVoterEmail, getVoters } from '../../../../api/admin/voters'
import { ElectionStepContext } from '../../../../contexts/electionStep/ElectionStepContext'
import { LoadingSpinner } from '../../../shared/LoadingSpinner'
import { AdminNavigation } from '../adminNavigation/AdminNavigation'

export const VotingInspection = () => {
  const [voters, setVoters] = useState<Voter[] | null>(null)
  const { election, setElection } = useContext(ElectionStepContext)!
  const { t } = useTranslation('translation', {
    keyPrefix: 'admin.admin_main.voting_inspection'
  })

  const [oldEmail, setOldEmail] = useState('')
  const [newEmail, setNewEmail] = useState('')

  const fetchAndSetRemainingVoters = async (electionId: string) => {
    const response = await getVoters(electionId)
    if (!response.ok) {
      return
    }
    setVoters(response.data)
  }

  useEffect(() => {
    if (!election) return
    void fetchAndSetRemainingVoters(election.electionId)

    const interval = setInterval(
      () => void fetchAndSetRemainingVoters(election.electionId),
      3000
    )

    return () => clearInterval(interval)
  }, [election])

  if (!election || !voters) {
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

  const handleEmailChange = async () => {
    const response = await changeVoterEmail(oldEmail, newEmail)
    if (!response.ok) {
      return
    }
    setOldEmail('')
    setNewEmail('')
    toast.success(t('email_changed'))
  }

  const remainingVoters = voters.filter((voter) => !voter.hasVoted)
  const votersWhoVoted = voters.filter((voter) => voter.hasVoted)

  const validNewEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)

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
              {t('voters')}: {voters.length}
            </span>
          </ListGroup.Item>
        </ListGroup>
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
          <Button
            onClick={() => void handleEmailChange()}
            disabled={!validNewEmail}
          >
            {t('change_email')}
          </Button>
        </Form>
      </Container>
    </>
  )
}
