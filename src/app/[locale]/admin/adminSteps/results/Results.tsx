import React, { useContext } from 'react'

import { calculateSTVResult } from '~/algorithm/stvAlgorithm'
import ElectionResults from '~/components/ElectionResults'
import { ElectionStepContext } from '~/contexts/electionStep/ElectionStepContext'
import { useRouter } from '~/i18n/routing'
import { trpc } from '~/trpc/client'

import AdminNavigation from '../adminNavigation/AdminNavigation'

export default function Results() {
  const { election, setElection } = useContext(ElectionStepContext)!
  const [{ ballots, voterCount }] = trpc.admin.votes.getWithId.useSuspenseQuery(
    {
      electionId: election!.electionId
    }
  )
  const close = trpc.admin.elections.close.useMutation()
  const router = useRouter()

  const handleCloseElection = (electionId: string) => {
    close.mutate(
      {
        electionId
      },
      {
        onSuccess() {
          setElection((election) => ({ ...election!, status: 'CLOSED' }))
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

  return (
    <>
      <AdminNavigation
        onNext={() => handleCloseElection(election.electionId)}
      />
      <ElectionResults
        election={election}
        votingResult={calculateSTVResult(election, ballots, voterCount)}
      />
    </>
  )
}
