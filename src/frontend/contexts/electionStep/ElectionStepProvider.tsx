import React, { ReactNode, useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { useTranslation } from 'react-i18next'

import { client, RouterOutput } from '../../api/trpc'
import {
  ElectionStep,
  ElectionStepContext,
  StepSettings
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
  const [cookies] = useCookies(['admin-token'])
  const [election, setElection] = useState<
    RouterOutput['admin']['elections']['findCurrent'] | null
  >(null)
  const [electionStep, setElectionStep] = useState<ElectionStep | null>(null)
  const { i18n } = useTranslation()

  const electionStepSettings =
    i18n.language === 'fi'
      ? electionStepSettingsFinnish
      : electionStepSettingsEnglish

  useEffect(() => {
    void (async () => {
      if (!cookies['admin-token']) {
        return
      }
      const election = await client.admin.elections.findCurrent.query()
      setElection(election)
      setElectionStep(getElectionStep(election))
    })()
  }, [cookies])

  const stepSettings = electionStep
    ? (electionStepSettings[electionStep] as StepSettings)
    : null
  return (
    <ElectionStepContext.Provider
      value={{
        election,
        setElection,
        stepSettings,
        electionStep,
        setElectionStep
      }}
    >
      {children}
    </ElectionStepContext.Provider>
  )
}
