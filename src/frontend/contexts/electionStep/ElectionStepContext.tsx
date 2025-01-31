import { createContext, Dispatch, SetStateAction } from 'react'

import { RouterOutput } from '../../trpc/trpc'
import { electionStepSettingsFinnish } from './electionStepSetting'

export type ElectionStep = keyof typeof electionStepSettingsFinnish

export type StepSettings = {
  title: string
  nextButton: string
  nextStep: ElectionStep
  backButton?: string
  previousStep?: ElectionStep
}

export type Election = Exclude<
  RouterOutput['admin']['elections']['findCurrent'],
  null
>

type ElectionStepContextType = {
  election: Election
  setElection: Dispatch<SetStateAction<Election>>
  stepSettings: StepSettings
  electionStep: ElectionStep
  setElectionStep: Dispatch<SetStateAction<ElectionStep>>
}

export const ElectionStepContext =
  createContext<ElectionStepContextType | null>(null)
