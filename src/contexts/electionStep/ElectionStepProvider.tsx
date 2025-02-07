import { useLocale } from 'next-intl'
import React, { ReactNode, useEffect, useState } from 'react'

import { RouterOutput, trpc } from '~/trpc/client'

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

export default function ElectionStepProvider({
  children
}: {
  children: ReactNode
}) {
  const [initialElection] = trpc.admin.elections.findCurrent.useSuspenseQuery()

  const [election, setElection] = useState<Election | null>(initialElection)
  const [electionStep, setElectionStep] = useState<ElectionStep>(
    getElectionStep(initialElection)
  )
  const locale = useLocale()

  useEffect(() => {
    setElectionStep(getElectionStep(election))
  }, [election])

  const electionStepSettings =
    locale === 'fi' ? electionStepSettingsFinnish : electionStepSettingsEnglish

  return (
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
  )
}
