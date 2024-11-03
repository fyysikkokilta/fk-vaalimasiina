import React, { useContext, useEffect, useState } from 'react'
import { AdminNavigation } from '../adminNavigation/AdminNavigation'
import { ElectionContext } from '../../../../contexts/election/ElectionContext'
import {
  calculateSTVResult,
  VotingResult,
} from '../../../../utils/stvAlgorithm'
import { getVotesForElection } from '../../../../api/admin/votes'
import { LoadingSpinner } from '../../../shared/LoadingSpinner'
import { closeElection } from '../../../../api/admin/elections'
import { ElectionResults } from '../../../shared/ElectionResults'

export const Results = () => {
  const { election, setElection } = useContext(ElectionContext)!
  const [votingResult, setVotingResult] = useState<VotingResult | null>(null)

  useEffect(() => {
    // eslint-disable-next-line no-extra-semi
    ;(async () => {
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
          election.candidates,
          response.data,
          election.amountToElect
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
