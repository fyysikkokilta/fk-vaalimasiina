'use client'

import React from 'react'

import { protectedCloseElection } from '~/actions/admin/election/closeElection'
import AdminNavigation from '~/components/AdminNavigation'
import ElectionResults from '~/components/ElectionResults'
import { useToastedActionState } from '~/hooks/useToastedActionState'
import { ElectionStep } from '~/settings/electionStepSettings'

import { ElectionStepProps } from '../page'

export default function Results({
  election,
  ballots,
  voters
}: ElectionStepProps) {
  const closeElectionAction = protectedCloseElection.bind(
    null,
    election.electionId
  )

  const [, closeElection, closeElectionPending] = useToastedActionState(
    closeElectionAction,
    {
      success: false,
      message: ''
    },
    'results'
  )

  return (
    <AdminNavigation
      electionStep={ElectionStep.RESULTS}
      disableNext={closeElectionPending}
      onNext={closeElection}
    >
      <ElectionResults
        election={election}
        ballots={ballots}
        voterCount={voters.length}
      />
    </AdminNavigation>
  )
}
