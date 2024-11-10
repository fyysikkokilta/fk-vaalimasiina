import React, { useEffect, useState } from 'react'
import { calculateSTVResult, VotingResult } from '../../utils/stvAlgorithm'
import { ElectionResults } from '../shared/ElectionResults'
import { LoadingSpinner } from '../shared/LoadingSpinner'
import { Election } from '../../../../types/types'
import { fetchCompletedElectionWithVotes } from '../../api/elections'
import { Link, useParams } from 'react-router-dom'
import { Card } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

export const PreviousResults = () => {
  const { electionId } = useParams<{ electionId: string }>()
  const [election, setElection] = useState<Election | null>(null)
  const [votingResult, setVotingResult] = useState<VotingResult | null>(null)
  const { t } = useTranslation('translation', { keyPrefix: 'previous_results' })

  useEffect(() => {
    void (async () => {
      // Fetch election
      const electionResponse = await fetchCompletedElectionWithVotes(
        electionId!
      )

      if (!electionResponse.ok) {
        return
      }
      const election = electionResponse.data.election
      const ballots = electionResponse.data.ballots

      setElection(election)
      setVotingResult(calculateSTVResult(election, ballots))
    })()
  }, [electionId])

  if (!election || !votingResult) {
    return <LoadingSpinner />
  }

  return (
    <Card className="box-shadow m-5">
      <Card.Header as="h2">{t('title')}</Card.Header>
      <Card.Body>
        {!votingResult || !election ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="d-flex justify-content-center mb-3">
              <Link to="/elections" className="btn btn-secondary">
                {t('back_to_list')}
              </Link>
            </div>
            <ElectionResults election={election} votingResult={votingResult} />
          </>
        )}
      </Card.Body>
    </Card>
  )
}
