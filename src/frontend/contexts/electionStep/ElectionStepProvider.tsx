import React, { ReactNode, useEffect, useState } from 'react'
import {
  electionStepSettingsFinnish,
  electionStepSettingsEnglish
} from './electionStepSetting'
import { useCookies } from 'react-cookie'
import { useTranslation } from 'react-i18next'
import {
  ElectionStep,
  ElectionStepContext,
  StepSettings
} from './ElectionStepContext'
import { Election } from '../../../../types/types'
import { fetchCurrentElection } from '../../api/admin/elections'

const getElectionStep = (election: Election | null): ElectionStep => {
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
  const [election, setElection] = useState<Election | null>(null)
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
      const response = await fetchCurrentElection()
      if (!response.ok) {
        return
      }
      setElection(response.data)
      setElectionStep(getElectionStep(response.data))
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
