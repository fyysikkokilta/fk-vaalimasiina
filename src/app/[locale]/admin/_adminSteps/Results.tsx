'use client'

import React from 'react'

import { protectedCloseElection } from '~/actions/admin/election/closeElection'
import AdminNavigation from '~/components/AdminNavigation'
import ElectionResults from '~/components/ElectionResults'
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

  return (
    <AdminNavigation
      electionStep={ElectionStep.RESULTS}
      tKey="results"
      onNext={closeElectionAction}
    >
      <ElectionResults
        election={election}
        ballots={ballots}
        voterCount={voters.length}
      />
    </AdminNavigation>
  )
}
