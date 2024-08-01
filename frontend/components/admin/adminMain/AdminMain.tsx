import React, { useContext } from 'react'

import { NewElection } from './newElection/NewElection'
import { PreviewElection } from './previewElection/PreviewElection'
import { ElectionStepContext } from '../../../contexts/electionStep/ElectionStepContext'
import { VotingInspection } from './votingInspection/VotingInspection'
import { Results } from './results/Results'
import { Card } from 'react-bootstrap'

export const AdminMain = () => {
  const step = useContext(ElectionStepContext)!.electionStep
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

  return <Card>{renderSwitch()}</Card>
}
