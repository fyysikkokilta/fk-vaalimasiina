import React, { useContext, useEffect, useState } from 'react'

import { closeElection } from '../../../../api/admin/elections'
import { getVotesForElection } from '../../../../api/admin/votes'
import { ElectionStepContext } from '../../../../contexts/electionStep/ElectionStepContext'
import {
  calculateSTVResult,
  VotingResult
} from '../../../../utils/stvAlgorithm'
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
      const response = await getVotesForElection(election.electionId)

      if (!response.ok) {
        return
      }

      setVotingResult(
        calculateSTVResult(
          election,
          response.data.ballots,
          response.data.voterCount
        )
      )
    })()
  }, [election])

  if (!election || !votingResult) {
    return <LoadingSpinner />
  }

  const handleCloseElection = async () => {
    const response = await closeElection(election.electionId)
    if (!response.ok) {
      return false
    }
    setElection((election) => ({ ...election!, status: 'CLOSED' }))
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
