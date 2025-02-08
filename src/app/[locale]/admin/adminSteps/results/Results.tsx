import React from 'react'

import { calculateSTVResult } from '~/algorithm/stvAlgorithm'
import { ElectionStep } from '~/app/[locale]/admin/adminSteps/electionStepSetting'
import ElectionResults from '~/components/ElectionResults'
import { useRouter } from '~/i18n/routing'
import { trpc } from '~/trpc/client'

import { AdminProps } from '../../client'
import AdminNavigation from '../adminNavigation/AdminNavigation'

export default function Results({ election }: AdminProps) {
  const close = trpc.admin.elections.close.useMutation()
  const utils = trpc.useUtils()
  const router = useRouter()

  const handleCloseElection = (electionId: string) => {
    close.mutate(
      {
        electionId
      },
      {
        onSuccess() {
          void utils.admin.elections.findCurrent.invalidate()
        },
        onError(error) {
          const code = error?.data?.code
          if (code === 'NOT_FOUND') {
            router.refresh()
          }
        }
      }
    )
  }

  if (!election) {
    return null // Should never happen
  }

  const { ballots, voters } = election
  const voterCount = voters.length

  return (
    <>
      <AdminNavigation
        electionStep={ElectionStep.RESULTS}
        onNext={() => handleCloseElection(election.electionId)}
      />
      <ElectionResults
        election={election}
        votingResult={calculateSTVResult(election, ballots, voterCount)}
      />
    </>
  )
}
