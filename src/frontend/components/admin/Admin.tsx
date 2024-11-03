import React, { useContext } from 'react'
import { Card } from 'react-bootstrap'
import { useCookies } from 'react-cookie'
import { AdminLogin } from './login/AdminLogin'
import { useTranslation } from 'react-i18next'
import { ElectionStepContext } from '../../contexts/electionStep/ElectionStepContext'
import { NewElection } from './adminSteps/newElection/NewElection'
import { PreviewElection } from './adminSteps/previewElection/PreviewElection'
import { VotingInspection } from './adminSteps/votingInspection/VotingInspection'
import { Results } from './adminSteps/results/Results'

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
    <Card className="box-shadow m-5">
      <Card.Header>
        <h1>{t('admin')}</h1>
      </Card.Header>
      <Card.Body>{renderSwitch()}</Card.Body>
    </Card>
  )
}
