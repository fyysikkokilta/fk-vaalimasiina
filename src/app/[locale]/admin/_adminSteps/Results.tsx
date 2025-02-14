'use client'

import React from 'react'

import { calculateSTVResult } from '~/algorithm/stvAlgorithm'
import AdminNavigation from '~/components/AdminNavigation'
import ElectionResults from '~/components/ElectionResults'
import { ElectionStep } from '~/settings/electionStepSettings'
import { RouterOutput, trpc } from '~/trpc/client'

export default function Results({
  election
}: {
  election: Exclude<RouterOutput['admin']['elections']['findCurrent'], null>
}) {
  const close = trpc.admin.elections.close.useMutation()

  const handleCloseElection = async () => {
    await close.mutateAsync({
      electionId: election.electionId
    })
  }

  const { ballots, voters } = election
  const voterCount = voters.length

  return (
    <AdminNavigation
      electionStep={ElectionStep.RESULTS}
      onNext={handleCloseElection}
    >
      <ElectionResults
        election={election}
        votingResult={calculateSTVResult(election, ballots, voterCount)}
      />
    </AdminNavigation>
  )
}
