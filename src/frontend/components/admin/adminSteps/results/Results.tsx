import React, { useContext } from 'react'

import { calculateSTVResult } from '../../../../algorithm/stvAlgorithm'
import { ElectionStepContext } from '../../../../contexts/electionStep/ElectionStepContext'
import { trpc } from '../../../../trpc/trpc'
import { ElectionResults } from '../../../shared/ElectionResults'
import { AdminNavigation } from '../adminNavigation/AdminNavigation'

export const Results = () => {
  const { election, setElection } = useContext(ElectionStepContext)!
  const [{ ballots, voterCount }] = trpc.admin.votes.getWithId.useSuspenseQuery(
    {
      electionId: election.electionId
    }
  )
  const close = trpc.admin.elections.close.useMutation()

  const handleCloseElection = async (electionId: string) => {
    const { status } = await close.mutateAsync({
      electionId
    })
    setElection((election) => ({ ...election, status }))
    return true
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
