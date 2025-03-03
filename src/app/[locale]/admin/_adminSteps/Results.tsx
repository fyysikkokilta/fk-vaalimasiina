'use client'

import { useMutation } from '@tanstack/react-query'
import React from 'react'

import AdminNavigation from '~/components/AdminNavigation'
import ElectionResults from '~/components/ElectionResults'
import { ElectionStep } from '~/settings/electionStepSettings'
import { RouterOutput, useTRPC } from '~/trpc/client'

export default function Results({
  election
}: {
  election: NonNullable<RouterOutput['admin']['elections']['findCurrent']>
}) {
  const trpc = useTRPC()
  const close = useMutation(trpc.admin.elections.close.mutationOptions())

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
        ballots={ballots}
        voterCount={voterCount}
      />
    </AdminNavigation>
  )
}
