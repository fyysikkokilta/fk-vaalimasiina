import React, { useEffect, useState } from 'react'
import { calculateSTVResult, VotingResult } from '../../utils/stvAlgorithm'
import { ElectionResults } from '../shared/ElectionResults'
import { LoadingSpinner } from '../shared/LoadingSpinner'
import { Election } from '../../../../types/types'
import { getVotesForElection } from '../../api/votes'
import { fetchElectionById } from '../../api/elections'
import { NavLink, useParams } from 'react-router-dom'
import { Card } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

export const PreviousResults = () => {
  const { electionId } = useParams<{ electionId: string }>()
  const [election, setElection] = useState<Election | null>(null)
  const [votingResult, setVotingResult] = useState<VotingResult | null>(null)
  const { t } = useTranslation('translation', { keyPrefix: 'previous_results' })

  useEffect(() => {
    ;(async () => {
      // Fetch election
      const electionResponse = await fetchElectionById(electionId!)

      if (!electionResponse.ok) {
        return
      }

      const election = electionResponse.data

      if (election.status !== 'CLOSED') {
        return
      }

      setElection(election)

      // Fetch voting results
      const response = await getVotesForElection(election.electionId)

      if (!response.ok) {
        return
      }

      setVotingResult(calculateSTVResult(election, response.data))
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
              <NavLink to="/elections" className="btn btn-secondary">
                {t('back_to_list')}
              </NavLink>
            </div>
            <ElectionResults election={election} votingResult={votingResult} />
          </>
        )}
      </Card.Body>
    </Card>
  )
}
