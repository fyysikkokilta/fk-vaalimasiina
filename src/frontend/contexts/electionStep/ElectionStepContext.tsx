import { createContext, Dispatch, SetStateAction } from 'react'
import { electionStepSettingsFinnish } from './electionStepSetting'

export type ElectionStep = keyof typeof electionStepSettingsFinnish

export type StepSettings = {
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
