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
  const { election } = useContext(ElectionContext)!
  const [votingResult, setVotingResult] = useState<VotingResult | null>(null)

  useEffect(() => {
    (async () => {
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

  return (
    <>
      <AdminNavigation
        disableNavigation={false}
        onNext={() => closeElection(election.electionId)}
      />
      {!votingResult || !election ? (
        <LoadingSpinner />
      ) : (
        <ElectionResults election={election} votingResult={votingResult} />
      )}
    </>
  )
}
