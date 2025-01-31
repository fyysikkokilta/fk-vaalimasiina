import React, { Suspense, useContext } from 'react'
import { Card } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import {
  ElectionStep,
  ElectionStepContext
} from '../../contexts/electionStep/ElectionStepContext'
import { LoadingSpinner } from '../shared/LoadingSpinner'
import { NewElection } from './adminSteps/newElection/NewElection'
import { PreviewElection } from './adminSteps/previewElection/PreviewElection'
import { Results } from './adminSteps/results/Results'
import { VotingInspection } from './adminSteps/votingInspection/VotingInspection'

export const Admin = () => {
  const esc = useContext(ElectionStepContext)!
  const { t } = useTranslation('translation', { keyPrefix: 'admin' })

  const renderSwitch = (step: ElectionStep) => {
    switch (step) {
      case 'NEW':
      case 'EDIT':
        return <NewElection />
      case 'PREVIEW':
        return <PreviewElection />
      case 'VOTING':
        return <VotingInspection />
      case 'RESULTS':
        return <Results />
      default:
        return <NewElection />
    }
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Card>
        <Card.Header as="h2">{t('admin')}</Card.Header>
        <Card.Body>{renderSwitch(esc.electionStep)}</Card.Body>
      </Card>
    </Suspense>
  )
}
