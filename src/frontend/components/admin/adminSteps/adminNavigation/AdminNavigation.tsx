import React, { useContext } from 'react'
import { ElectionStepContext } from '../../../../contexts/electionStep/ElectionStepContext'
import { Button, Card } from 'react-bootstrap'

import styles from './adminNavigation.module.scss'

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
  onNext,
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
    <Card.Header className={styles.electionNavigationContainer}>
      <Button
        disabled={disablePrevious}
        className={!stepSettings.backButton ? styles.hidden : ''}
        variant="light"
        onClick={prevStep}
      >
        {stepSettings.backButton}
      </Button>
      <Card.Header as="h2">{stepSettings.title}</Card.Header>
      <Button disabled={disableNext} variant="light" onClick={nextStep}>
        {stepSettings.nextButton}
      </Button>
    </Card.Header>
  )
}
