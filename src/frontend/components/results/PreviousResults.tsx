import React, { useEffect, useState } from 'react'
import { Card } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'

import { calculateSTVResult, VotingResult } from '../../algorithm/stvAlgorithm'
import { client, RouterOutput } from '../../api/trpc'
import { ElectionResults } from '../shared/ElectionResults'
import { LoadingSpinner } from '../shared/LoadingSpinner'

export const PreviousResults = () => {
  const { electionId } = useParams<{ electionId: string }>()
  const [election, setElection] = useState<
    RouterOutput['elections']['getCompletedWithId']['election'] | null
  >(null)
  const [votingResult, setVotingResult] = useState<VotingResult | null>(null)
  const { t } = useTranslation('translation', { keyPrefix: 'previous_results' })

  useEffect(() => {
    void (async () => {
      if (!electionId) {
        return
      }
      const { election, ballots, voterCount } =
        await client.elections.getCompletedWithId.query({
          electionId
        })

      setElection(election)
      setVotingResult(calculateSTVResult(election, ballots, voterCount))
    })()
  }, [electionId])

  if (!election || !votingResult) {
    return <LoadingSpinner />
  }

  return (
    <Card>
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
