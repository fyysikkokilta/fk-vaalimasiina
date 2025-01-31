import { createContext, Dispatch, SetStateAction } from 'react'

import { RouterOutput } from '../../api/trpc'
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
  election: RouterOutput['admin']['elections']['findCurrent'] | null
  setElection: Dispatch<
    SetStateAction<RouterOutput['admin']['elections']['findCurrent'] | null>
  >
  stepSettings: StepSettings | null
  electionStep: ElectionStep | null
  setElectionStep: Dispatch<SetStateAction<ElectionStep | null>>
}

export const ElectionStepContext =
  createContext<ElectionStepContextType | null>(null)
