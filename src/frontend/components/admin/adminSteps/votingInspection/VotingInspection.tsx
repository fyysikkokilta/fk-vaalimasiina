import React, { useState, useEffect, useContext } from 'react'

import styles from './votingInspection.module.scss'
import { Button, Col, Container, ListGroup } from 'react-bootstrap'
import { AdminNavigation } from '../adminNavigation/AdminNavigation'
import { ElectionContext } from '../../../../contexts/election/ElectionContext'
import { LoadingSpinner } from '../../../shared/LoadingSpinner'
import {
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

  useEffect(() => {
    (async () => {
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

  const remainingVoters = allVoters.filter(
    (voter) => !votersWhoVoted.find((v) => v.voterId === voter.voterId)
  )

  return (
    <>
      <AdminNavigation
        disableNext={remainingVoters.length > 0}
        onBack={handleAbortVoting}
        onNext={handleEndVoting}
      />
      <Container className={styles.votingInspectionContainer}>
        <Col>
          <h3>{election.title}</h3>
          <p>{election.description}</p>
          <ListGroup>
            <ListGroup.Item>
              <span className={styles.votingStatus}>
                {t('given_votes')}: {votersWhoVoted.length}
              </span>
            </ListGroup.Item>
            <ListGroup.Item>
              <span className={styles.votingStatus}>
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
            <ListGroup className="mt-3">
              {remainingVoters.map((voter) => (
                <ListGroup.Item key={voter.voterId}>{voter.email}</ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
      </Container>
    </>
  )
}
