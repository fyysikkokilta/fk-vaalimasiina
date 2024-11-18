import React, { useContext } from 'react'
import { Card } from 'react-bootstrap'
import { useCookies } from 'react-cookie'
import { useTranslation } from 'react-i18next'

import { ElectionStepContext } from '../../contexts/electionStep/ElectionStepContext'
import { NewElection } from './adminSteps/newElection/NewElection'
import { PreviewElection } from './adminSteps/previewElection/PreviewElection'
import { Results } from './adminSteps/results/Results'
import { VotingInspection } from './adminSteps/votingInspection/VotingInspection'
import { AdminLogin } from './login/AdminLogin'

export const Admin = () => {
  const [cookies] = useCookies(['admin-token'])
  const step = useContext(ElectionStepContext)!.electionStep
  const { t } = useTranslation('translation', { keyPrefix: 'admin' })

  if (!cookies['admin-token']) {
    return <AdminLogin />
  }
  const renderSwitch = () => {
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
    <Card>
      <Card.Header as="h2">{t('admin')}</Card.Header>
      <Card.Body>{renderSwitch()}</Card.Body>
    </Card>
  )
}
