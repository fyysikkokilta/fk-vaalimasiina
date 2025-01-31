import React, { ReactNode, Suspense, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { LoadingSpinner } from '../../components/shared/LoadingSpinner'
import { RouterOutput, trpc } from '../../trpc/trpc'
import {
  Election,
  ElectionStep,
  ElectionStepContext
} from './ElectionStepContext'
import {
  electionStepSettingsEnglish,
  electionStepSettingsFinnish
} from './electionStepSetting'

const getElectionStep = (
  election: RouterOutput['admin']['elections']['findCurrent'] | null
): ElectionStep => {
  if (!election) {
    return 'NEW'
  }
  if (election.status === 'CREATED') {
    return 'PREVIEW'
  }
  if (election.status === 'ONGOING') {
    return 'VOTING'
  }
  if (election.status === 'FINISHED') {
    return 'RESULTS'
  }
  return 'NEW'
}

export const ElectionStepProvider = ({ children }: { children: ReactNode }) => {
  const { i18n } = useTranslation()

  const [initialElection] = trpc.admin.elections.findCurrent.useSuspenseQuery()
  const [election, setElection] = useState<Election>(
    initialElection || {
      electionId: '',
      title: '',
      description: '',
      seats: 0,
      status: 'CREATED',
      candidates: []
    }
  )
  const [electionStep, setElectionStep] = useState<ElectionStep>(
    getElectionStep(initialElection)
  )

  const electionStepSettings =
    i18n.language === 'fi'
      ? electionStepSettingsFinnish
      : electionStepSettingsEnglish

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ElectionStepContext.Provider
        value={{
          election,
          setElection,
          stepSettings: electionStepSettings[electionStep],
          electionStep,
          setElectionStep
        }}
      >
        {children}
      </ElectionStepContext.Provider>
    </Suspense>
  )
}
