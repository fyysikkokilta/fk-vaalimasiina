import React, { ReactNode, useEffect, useState } from 'react'
import {
  electionStepSettingsFinnish,
  electionStepSettingsEnglish
} from './electionStepSetting'
import { fetchStatus } from '../../api/admin/status'
import { useCookies } from 'react-cookie'
import { useTranslation } from 'react-i18next'
import {
  ElectionStep,
  ElectionStepContext,
  StepSettings
} from './ElectionStepContext'

export const ElectionStepProvider = ({ children }: { children: ReactNode }) => {
  const [cookies] = useCookies(['admin-token'])
  const [electionStep, setElectionStep] = useState<ElectionStep | null>(null)
  const { i18n } = useTranslation()

  const electionStepSettings =
    i18n.language === 'fi'
      ? electionStepSettingsFinnish
      : electionStepSettingsEnglish

  useEffect(() => {
    ;(async () => {
      if (!cookies['admin-token']) {
        return
      }
      const response = await fetchStatus()
      if (!response.ok) {
        return
      }
      setElectionStep(response.data.status as ElectionStep)
    })()
  }, [cookies])

  const stepSettings = electionStep
    ? (electionStepSettings[electionStep] as StepSettings)
    : null
  return (
    <ElectionStepContext.Provider
      value={{ stepSettings, electionStep, setElectionStep }}
    >
      {children}
    </ElectionStepContext.Provider>
  )
}
