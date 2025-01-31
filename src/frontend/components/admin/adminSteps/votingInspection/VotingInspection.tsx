import React, { useContext, useEffect, useState } from 'react'
import { Button, Container, Form, ListGroup } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import { ElectionStepContext } from '../../../../contexts/electionStep/ElectionStepContext'
import { trpc } from '../../../../trpc/trpc'
import { AdminNavigation } from '../adminNavigation/AdminNavigation'

export const VotingInspection = () => {
  const { election, setElection } = useContext(ElectionStepContext)!
  const [voters, { refetch }] = trpc.admin.voters.getAll.useSuspenseQuery({
    electionId: election.electionId
  })
  const abort = trpc.admin.elections.abortVoting.useMutation()
  const end = trpc.admin.elections.endVoting.useMutation()
  const updateEmail = trpc.admin.voters.updateEmail.useMutation()
  const { t } = useTranslation('translation', {
    keyPrefix: 'admin.admin_main.voting_inspection'
  })

  const [oldEmail, setOldEmail] = useState('')
  const [newEmail, setNewEmail] = useState('')

  useEffect(() => {
    if (!election) return
    void refetch()

    const interval = setInterval(() => void refetch(), 3000)

    return () => clearInterval(interval)
  }, [election, refetch])

  const handleAbortVoting = async (electionId: string) => {
    const { status } = await abort.mutateAsync({
      electionId
    })

    setElection((election) => ({ ...election, status }))
    return true
  }

  const handleEndVoting = async (electionId: string) => {
    const { status } = await end.mutateAsync({
      electionId
    })

    setElection((election) => ({ ...election, status }))
    return true
  }

  const handleEmailChange = async () => {
    await updateEmail.mutateAsync({
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
        onBack={() => handleAbortVoting(election.electionId)}
        onNext={() => handleEndVoting(election.electionId)}
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
