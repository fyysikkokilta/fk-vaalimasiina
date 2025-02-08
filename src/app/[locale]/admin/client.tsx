'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import {
  ElectionStep,
  electionStepSettingsEnglish,
  electionStepSettingsFinnish
} from '~/app/[locale]/admin/adminSteps/electionStepSetting'
import TitleWrapper from '~/components/TitleWrapper'
import { RouterOutput, trpc } from '~/trpc/client'

import NewElection from './adminSteps/newElection/NewElection'
import PreviewElection from './adminSteps/previewElection/PreviewElection'
import Results from './adminSteps/results/Results'
import VotingInspection from './adminSteps/votingInspection/VotingInspection'

export type AdminProps = {
  election: RouterOutput['admin']['elections']['findCurrent']
}

const getElectionStep = (
  election: RouterOutput['admin']['elections']['findCurrent'] | null
) => {
  if (!election) {
    return ElectionStep.NEW
  }
  if (election.status === 'CREATED') {
    return ElectionStep.PREVIEW
  }
  if (election.status === 'ONGOING') {
    return ElectionStep.VOTING
  }
  if (election.status === 'FINISHED') {
    return ElectionStep.RESULTS
  }
  return ElectionStep.NEW
}

export default function AdminRouter() {
  const [election] = trpc.admin.elections.findCurrent.useSuspenseQuery()

  const [electionStep, setElectionStep] = useState<ElectionStep>(
    getElectionStep(election)
  )
  const locale = useLocale()

  useEffect(() => {
    setElectionStep(getElectionStep(election))
  }, [election])

  const electionStepSettings =
    locale === 'fi' ? electionStepSettingsFinnish : electionStepSettingsEnglish

  const previousStep = () => {
    if (!electionStepSettings[electionStep].previousStep) return
    setElectionStep(electionStepSettings[electionStep].previousStep)
  }

  const t = useTranslations('admin')

  const renderSwitch = (step: ElectionStep) => {
    switch (step) {
      case ElectionStep.NEW:
      case ElectionStep.EDIT:
        return <NewElection election={election} previousStep={previousStep} />
      case ElectionStep.PREVIEW:
        return (
          <PreviewElection election={election} previousStep={previousStep} />
        )
      case ElectionStep.VOTING:
        return <VotingInspection election={election} />
      case ElectionStep.RESULTS:
        return <Results election={election} />
      default:
        return <NewElection election={election} previousStep={previousStep} />
    }
  }

  return (
    <TitleWrapper title={t('title')}>{renderSwitch(electionStep)}</TitleWrapper>
  )
}
