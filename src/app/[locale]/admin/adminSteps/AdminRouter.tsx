'use client'

import { useTranslations } from 'next-intl'
import { useContext } from 'react'

import TitleWrapper from '~/components/TitleWrapper'
import {
  ElectionStep,
  ElectionStepContext
} from '~/contexts/electionStep/ElectionStepContext'

import NewElection from './newElection/NewElection'
import PreviewElection from './previewElection/PreviewElection'
import Results from './results/Results'
import VotingInspection from './votingInspection/VotingInspection'

export default function AdminRouter() {
  const esc = useContext(ElectionStepContext)!
  const t = useTranslations('admin')

  const renderSwitch = (step: ElectionStep) => {
    switch (step) {
      case 'NEW':
      case 'EDIT':
        return <NewElection />
      case 'PREVIEW':
        return <PreviewElection />
      case 'VOTING':
        return <VotingInspection />
      case 'RESULTS':
        return <Results />
      default:
        return <NewElection />
    }
  }

  return (
    <TitleWrapper title={t('title')}>
      {renderSwitch(esc.electionStep)}
    </TitleWrapper>
  )
}
