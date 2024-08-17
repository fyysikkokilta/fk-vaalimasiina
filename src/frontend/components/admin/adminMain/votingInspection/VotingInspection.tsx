import React, { useState, useEffect, useContext } from 'react'

import styles from './votingInspection.module.scss'
import { Col, Container, ListGroup } from 'react-bootstrap'
import { AdminNavigation } from '../adminNavigation/AdminNavigation'
import { ElectionContext } from '../../../../contexts/election/ElectionContext'
import { LoadingSpinner } from '../../../shared/LoadingSpinner'
import { VotingStatus } from '../../../../../../types/types'
import { getVoteCount } from '../../../../api/admin/votes'
import { getActiveVoterCount } from '../../../../api/admin/voter'
import { endVoting } from '../../../../api/admin/elections'
import { useTranslation } from 'react-i18next'

export const VotingInspection = () => {
  const [votingStatus, setVotingStatus] = useState<VotingStatus | null>(null)
  const { election, setElection } = useContext(ElectionContext)!
  const { t } = useTranslation('translation', {
    keyPrefix: 'admin.admin_main.voting_inspection',
  })

  const fetchAndSetVotingStatus = async (electionId: string) => {
    const promises = await Promise.all([
      getVoteCount(electionId),
      getActiveVoterCount(),
    ])
    if (!promises[0].ok || !promises[1].ok) {
      return null
    }
    const [voteCount, voterCount] = [promises[0].data, promises[1].data]
    if (voteCount === null || voterCount === null) {
      return null
    }
    setVotingStatus({
      amountOfVotes: voteCount,
      amountOfVoters: voterCount,
    })
  }

  useEffect(() => {
    if (!election) return
    fetchAndSetVotingStatus(election.electionId)

    const interval = setInterval(
      () => fetchAndSetVotingStatus(election.electionId),
      3000
    )

    return () => clearInterval(interval)
  }, [election])

  if (!election || !votingStatus) {
    return <LoadingSpinner />
  }

  const handleEndVoting = async () => {
    await endVoting(election.electionId)
    setElection((election) => ({ ...election!, status: 'FINISHED' }))
  }

  return (
    <>
      <AdminNavigation
        disableNavigation={
          votingStatus.amountOfVotes !== votingStatus.amountOfVoters
        }
        onNext={handleEndVoting}
      />
      <Container className={styles.votingInspectionContainer}>
        <Col>
          <h3>{election.title}</h3>
          <p>{election.description}</p>
          <ListGroup>
            <ListGroup.Item>
              <span className={styles.votingStatus}>
                {t('given_votes')}: {votingStatus.amountOfVotes}
              </span>
            </ListGroup.Item>
            <ListGroup.Item>
              <span className={styles.votingStatus}>
                {t('voters')}: {votingStatus.amountOfVoters}
              </span>
            </ListGroup.Item>
          </ListGroup>
        </Col>
      </Container>
    </>
  )
}
