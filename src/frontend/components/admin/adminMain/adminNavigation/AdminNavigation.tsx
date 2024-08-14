import React, { useContext } from 'react'
import { ElectionStepContext } from '../../../../contexts/electionStep/ElectionStepContext'
import { Button, Card } from 'react-bootstrap'

import styles from './adminNavigation.module.scss'

type AdminNavigationProps = {
  disableNavigation?: boolean
  onBack?: () => Promise<unknown>
  onNext: () => Promise<unknown>
}

export const AdminNavigation = ({
  disableNavigation,
  onBack = () => Promise.resolve(),
  onNext,
}: AdminNavigationProps) => {
  const { stepSettings, setElectionStep } = useContext(ElectionStepContext)!

  if (!stepSettings) {
    return null
  }

  const nextStep = async () => {
    if (stepSettings.nextButton) {
      await onNext()
      setElectionStep(stepSettings.nextStep)
    }
  }

  const prevStep = async () => {
    if (stepSettings.backButton && stepSettings.previousStep) {
      await onBack()
      setElectionStep(stepSettings.previousStep)
    }
  }

  return (
    <Card.Header className={styles.electionNavigationContainer}>
      <Button
        disabled={disableNavigation}
        className={!stepSettings.backButton ? styles.hidden : ''}
        variant="light"
        onClick={prevStep}
      >
        {stepSettings.backButton}
      </Button>
      <Card.Header as="h2">{stepSettings.title}</Card.Header>
      <Button disabled={disableNavigation} variant="light" onClick={nextStep}>
        {stepSettings.nextButton}
      </Button>
    </Card.Header>
  )
}
