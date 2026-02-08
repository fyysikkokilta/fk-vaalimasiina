'use client'

import { useAction } from 'next-safe-action/hooks'

import { closeElection } from '~/actions/admin/closeElection'
import AdminNavigation from '~/components/AdminNavigation'
import ElectionResults from '~/components/ElectionResults'
import type { ElectionStepProps } from '~/data/getAdminElection'
import { ElectionStep } from '~/settings/electionStepSettings'

export default function Results({ election, ballots, voters }: ElectionStepProps) {
  const { execute, status: closeActionStatus } = useAction(closeElection)

  return (
    <AdminNavigation
      electionStep={ElectionStep.RESULTS}
      nextActionStatus={closeActionStatus}
      onNext={() => execute({ electionId: election.electionId })}
    >
      <ElectionResults
        election={election}
        ballots={ballots}
        voterCount={voters.length}
        showAllImmediately={false}
      />
    </AdminNavigation>
  )
}
