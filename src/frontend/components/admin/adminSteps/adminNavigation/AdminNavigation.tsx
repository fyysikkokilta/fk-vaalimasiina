import React, { useContext } from 'react'
import { Button, Card, Col, Row } from 'react-bootstrap'

import { ElectionStepContext } from '../../../../contexts/electionStep/ElectionStepContext'

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
    if (stepSettings.nextButton && !disableNext) {
      if (await onNext()) {
        setElectionStep(stepSettings.nextStep)
      }
    }
  }

  const prevStep = async () => {
    if (
      stepSettings.backButton &&
      stepSettings.previousStep &&
      !disablePrevious
    ) {
      if (await onBack()) {
        setElectionStep(stepSettings.previousStep)
      }
    }
  }

  return (
    <>
      <Row className="d-flex mx-auto mb-3">
        <Card.Header as="h3">{stepSettings.title}</Card.Header>
      </Row>
      <Row className="mx-2">
        <Col>
          <Button
            disabled={disablePrevious}
            variant="secondary"
            hidden={!stepSettings.backButton}
            onClick={prevStep}
            className="float-start"
          >
            {stepSettings.backButton}
          </Button>
        </Col>
        <Col>
          <Button
            disabled={disableNext}
            variant="secondary"
            hidden={!stepSettings.nextButton}
            onClick={nextStep}
            className="float-end"
          >
            {stepSettings.nextButton}
          </Button>
        </Col>
      </Row>
    </>
  )
}
