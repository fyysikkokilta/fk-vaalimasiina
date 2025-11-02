'use client'

import { useAction } from 'next-safe-action/hooks'
import { toast } from 'react-toastify'

import { closeElection } from '~/actions/admin/closeElection'
import AdminNavigation from '~/components/AdminNavigation'
import ElectionResults from '~/components/ElectionResults'
import type { ElectionStepProps } from '~/data/getAdminElection'
import { ElectionStep } from '~/settings/electionStepSettings'

export default function Results({
  election,
  ballots,
  voters
}: ElectionStepProps) {
  const { execute, isPending } = useAction(closeElection, {
    onSuccess: ({ data }) => {
      if (data?.message) {
        toast.success(data.message)
      }
    },
    onError: ({ error }) => {
      if (error.serverError) {
        toast.error(error.serverError)
      }
    }
  })

  return (
    <AdminNavigation
      electionStep={ElectionStep.RESULTS}
      disableNext={isPending}
      onNext={() => execute({ electionId: election.electionId })}
    >
      <ElectionResults
        election={election}
        ballots={ballots}
        voterCount={voters.length}
      />
    </AdminNavigation>
  )
}
