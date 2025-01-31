import React from 'react'
import { Card } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'

import { calculateSTVResult } from '../../algorithm/stvAlgorithm'
import { trpc } from '../../trpc/trpc'
import { ElectionResults } from '../shared/ElectionResults'

export const PreviousResults = () => {
  const { electionId } = useParams<{ electionId: string }>()
  const [{ election, ballots, voterCount }] =
    trpc.elections.getCompletedWithId.useSuspenseQuery({
      electionId: electionId!
    })
  const { t } = useTranslation('translation', { keyPrefix: 'previous_results' })

  return (
    <Card>
      <Card.Header as="h2">{t('title')}</Card.Header>
      <Card.Body>
        <div className="d-flex justify-content-center mb-3">
          <Link to="/elections" className="btn btn-secondary">
            {t('back_to_list')}
          </Link>
        </div>
        <ElectionResults
          election={election}
          votingResult={calculateSTVResult(election, ballots, voterCount)}
        />
      </Card.Body>
    </Card>
  )
}
