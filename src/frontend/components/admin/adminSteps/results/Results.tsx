import React, { useContext, useEffect, useState } from 'react'

import {
  calculateSTVResult,
  VotingResult
} from '../../../../algorithm/stvAlgorithm'
import { client } from '../../../../api/trpc'
import { ElectionStepContext } from '../../../../contexts/electionStep/ElectionStepContext'
import { ElectionResults } from '../../../shared/ElectionResults'
import { LoadingSpinner } from '../../../shared/LoadingSpinner'
import { AdminNavigation } from '../adminNavigation/AdminNavigation'

export const Results = () => {
  const { election, setElection } = useContext(ElectionStepContext)!
  const [votingResult, setVotingResult] = useState<VotingResult | null>(null)

  useEffect(() => {
    void (async () => {
      if (!election) {
        return
      }
      // Fetch voting results
      const { ballots, voterCount } = await client.admin.votes.getWithId.query({
        electionId: election.electionId
      })

      setVotingResult(calculateSTVResult(election, ballots, voterCount))
    })()
  }, [election])

  if (!election || !votingResult) {
    return <LoadingSpinner />
  }

  const handleCloseElection = async () => {
    const { status } = await client.admin.elections.close.mutate({
      electionId: election.electionId
    })
    setElection((election) => ({ ...election!, status }))
    return true
  }

  return (
    <>
      <AdminNavigation onNext={handleCloseElection} />
      {!votingResult || !election ? (
        <LoadingSpinner />
      ) : (
        <ElectionResults election={election} votingResult={votingResult} />
      )}
    </>
  )
}
