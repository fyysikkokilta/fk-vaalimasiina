import { createContext, Dispatch, SetStateAction } from 'react'
import { electionStepSettingsFinnish } from './electionStepSetting'
import { Election } from '../../../../types/types'

export type ElectionStep = keyof typeof electionStepSettingsFinnish

export type StepSettings = {
  title: string
  nextButton: string
  nextStep: ElectionStep
  backButton?: string
  previousStep?: ElectionStep
}

type ElectionStepContextType = {
  election: Election | null
  setElection: Dispatch<SetStateAction<Election | null>>
  stepSettings: StepSettings | null
  electionStep: ElectionStep | null
  setElectionStep: Dispatch<SetStateAction<ElectionStep | null>>
}

export const ElectionStepContext =
  createContext<ElectionStepContextType | null>(null)
