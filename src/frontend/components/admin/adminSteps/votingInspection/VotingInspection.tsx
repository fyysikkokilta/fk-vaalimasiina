import React, { useContext, useEffect, useState } from 'react'
import { Button, Container, Form, ListGroup } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import { client, RouterOutput } from '../../../../api/trpc'
import { ElectionStepContext } from '../../../../contexts/electionStep/ElectionStepContext'
import { LoadingSpinner } from '../../../shared/LoadingSpinner'
import { AdminNavigation } from '../adminNavigation/AdminNavigation'

export const VotingInspection = () => {
  const [voters, setVoters] = useState<
    RouterOutput['admin']['voters']['getAll'] | null
  >(null)
  const { election, setElection } = useContext(ElectionStepContext)!
  const { t } = useTranslation('translation', {
    keyPrefix: 'admin.admin_main.voting_inspection'
  })

  const [oldEmail, setOldEmail] = useState('')
  const [newEmail, setNewEmail] = useState('')

  const fetchAndSetRemainingVoters = async (electionId: string) => {
    const voters = await client.admin.voters.getAll.query({ electionId })
    setVoters(voters)
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
    const { status } = await client.admin.elections.abortVoting.mutate({
      electionId: election.electionId
    })

    setElection((election) => ({ ...election!, status }))
    return true
  }

  const handleEndVoting = async () => {
    const { status } = await client.admin.elections.endVoting.mutate({
      electionId: election.electionId
    })

    setElection((election) => ({ ...election!, status }))
    return true
  }

  const handleEmailChange = async () => {
    await client.admin.voters.updateEmail.mutate({
      oldEmail,
      newEmail
    })
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
