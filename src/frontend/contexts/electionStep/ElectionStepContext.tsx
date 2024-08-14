import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from 'react'
import { electionStepSettings } from './electionStepSetting'
import { fetchStatus } from '../../api/admin/status'
import { useCookies } from 'react-cookie'

type ElectionStep = keyof typeof electionStepSettings

type StepSettings = {
  title: string
  nextButton: string
  nextStep: ElectionStep
  backButton?: string
  previousStep?: ElectionStep
}

type ElectionStepContextType = {
  stepSettings: StepSettings | null
  electionStep: ElectionStep | null
  setElectionStep: Dispatch<SetStateAction<ElectionStep | null>>
}

export const ElectionStepContext =
  createContext<ElectionStepContextType | null>(null)

export const ElectionStepProvider = ({ children }) => {
  const [cookies] = useCookies(['admin-token'])
  const [electionStep, setElectionStep] = useState<ElectionStep | null>(null)

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
