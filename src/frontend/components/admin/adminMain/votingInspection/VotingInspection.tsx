import React, { useState, useEffect, useContext } from 'react'

import styles from './votingInspection.module.scss'
import { Button, Col, Container, ListGroup } from 'react-bootstrap'
import { AdminNavigation } from '../adminNavigation/AdminNavigation'
import { ElectionContext } from '../../../../contexts/election/ElectionContext'
import { LoadingSpinner } from '../../../shared/LoadingSpinner'
import {
  getActiveVoterCount,
  getVotersRemaining,
} from '../../../../api/admin/voter'
import { abortVoting, endVoting } from '../../../../api/admin/elections'
import { useTranslation } from 'react-i18next'
import { Voter } from '../../../../../../types/types'

export const VotingInspection = () => {
  const [activeVoterCount, setActiveVoterCount] = useState<number | null>(null)
  const [remainingVoters, setRemainingVoters] = useState<Voter[] | null>(null)
  const [showRemainingVoters, setShowRemainingVoters] = useState(false)
  const { election, setElection } = useContext(ElectionContext)!
  const { t } = useTranslation('translation', {
    keyPrefix: 'admin.admin_main.voting_inspection',
  })

  useEffect(() => {
    (async () => {
      const response = await getActiveVoterCount()
      if (!response.ok) {
        return
      }
      setActiveVoterCount(response.data)
    })()
  }, [])

  const fetchAndSetRemainingVoters = async (electionId: string) => {
    const response = await getVotersRemaining(electionId)
    if (!response.ok) {
      return
    }
    setRemainingVoters(response.data)
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

  if (!election || !activeVoterCount || !remainingVoters) {
    return <LoadingSpinner />
  }

  const handleAbortVoting = async () => {
    // TODO: Maybe show a confirmation dialog
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
                {t('given_votes')}: {activeVoterCount - remainingVoters.length}
              </span>
            </ListGroup.Item>
            <ListGroup.Item>
              <span className={styles.votingStatus}>
                {t('voters')}: {activeVoterCount}
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
              {remainingVoters.map((voter, index) => (
                <ListGroup.Item key={index}>{voter.alias}</ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
      </Container>
    </>
  )
}
