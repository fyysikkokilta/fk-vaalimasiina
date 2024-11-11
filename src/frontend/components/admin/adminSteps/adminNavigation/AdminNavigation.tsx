import React, { useContext } from 'react'
import { ElectionStepContext } from '../../../../contexts/electionStep/ElectionStepContext'
import { Button, Card } from 'react-bootstrap'

type AdminNavigationProps = {
  disablePrevious?: boolean
  disableNext?: boolean
  onBack?: () => Promise<boolean>
  onNext: () => Promise<boolean>
}

export const AdminNavigation = ({
  disablePrevious = false,
  disableNext = false,
  onBack = () => Promise.resolve(true),
  onNext
}: AdminNavigationProps) => {
  const { stepSettings, setElectionStep } = useContext(ElectionStepContext)!

  if (!stepSettings) {
    return null
  }

  const nextStep = async () => {
    if (stepSettings.nextButton) {
      if (await onNext()) {
        setElectionStep(stepSettings.nextStep)
      }
    }
  }

  const prevStep = async () => {
    if (stepSettings.backButton && stepSettings.previousStep) {
      if (await onBack()) {
        setElectionStep(stepSettings.previousStep)
      }
    }
  }

  return (
    <Card.Header className="d-flex">
      <Button
        disabled={disablePrevious}
        variant="light"
        hidden={!stepSettings.backButton}
        onClick={prevStep}
      >
        {stepSettings.backButton}
      </Button>
      <Card.Header as="h3" className="m-auto">
        {stepSettings.title}
      </Card.Header>
      <Button
        disabled={disableNext}
        variant="light"
        hidden={!stepSettings.nextButton}
        onClick={nextStep}
      >
        {stepSettings.nextButton}
      </Button>
    </Card.Header>
  )
}
