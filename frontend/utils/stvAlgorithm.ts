import { Candidate, Vote } from '../../types/types'

import shuffle from 'lodash/shuffle'

type CandidateId = Candidate['candidateId']

type Ballot = Vote['candidateIds']

interface WeightedVote {
  weight: number
  vote: Ballot
}

type VoteMap = Map<CandidateId, WeightedVote[]>

interface CandidateResultData {
  id: CandidateId
  voteCount: number
}

interface PassingCandidateResult {
  data: CandidateResultData
  isSelected: boolean
}

interface VotingRoundResult {
  round: number
  quota: number
  candidateResults: PassingCandidateResult[]
  droppedCandidate: CandidateResultData | null
}

export type VotingResult = {
  totalVoters: number
  totalVotes: number
  roundResults: VotingRoundResult[]
  winners: CandidateId[]
}

const getCurrentVoteCountsOfCandidates = (
  voteMap: VoteMap
): [CandidateId, number][] => {
  const counts: [CandidateId, number][] = []
  voteMap.forEach((votes, id) => {
    const totalVotes = votes.reduce((sum, v) => sum + v.weight, 0)
    counts.push([id, totalVotes])
  })
  return counts
}

const findNextPreference = (
  voteMap: VoteMap,
  vote: Ballot
): CandidateId | undefined => {
  return vote.find((c) => voteMap.has(c))
}

const dropOneCandidate = (
  voteMap: VoteMap,
  quota: number,
  round: number
): VotingRoundResult => {
  const voteCounts = getCurrentVoteCountsOfCandidates(voteMap)
  voteCounts.sort((a, b) => a[1] - b[1])

  const minVotes = voteCounts[0][1]
  const candidatesWithMinVotes = voteCounts.filter(
    ([, votes]) => votes === minVotes
  )
  const candidateToBeDropped = shuffle(candidatesWithMinVotes)[0] // TODO

  const votesOfDroppedCandidate = voteMap.get(candidateToBeDropped[0])!
  voteMap.delete(candidateToBeDropped[0])

  votesOfDroppedCandidate.forEach((vote) => {
    const secondaryPreference = findNextPreference(voteMap, vote.vote)
    if (secondaryPreference) {
      voteMap.get(secondaryPreference)!.push(vote)
    }
  })

  const candidateResults = voteCounts
    .map(([c, v]) => ({
      data: { id: c, voteCount: v },
      isSelected: false,
    }))
    .filter((result) => result.data.id !== candidateToBeDropped[0])

  return {
    round,
    quota,
    candidateResults,
    droppedCandidate: {
      id: candidateToBeDropped[0],
      voteCount: candidateToBeDropped[1],
    },
  }
}

const transferSurplusVotes = (
  voteMap: VoteMap,
  electedCandidates: Set<CandidateId>,
  quota: number,
  round: number
): VotingRoundResult => {
  const voteCounts = getCurrentVoteCountsOfCandidates(voteMap)
  voteCounts.sort((a, b) => b[1] - a[1])

  electedCandidates.forEach((candidate) => {
    const votes = voteMap.get(candidate)!
    const totalVotes = votes.reduce((sum, v) => sum + v.weight, 0)
    const surplus = totalVotes - quota

    if (surplus > 0) {
      votes.forEach((vote) => {
        vote.weight = (vote.weight / totalVotes) * surplus
        const secondaryPreference = findNextPreference(voteMap, vote.vote)
        if (secondaryPreference) {
          voteMap.get(secondaryPreference)!.push(vote)
        }
      })
    }

    voteMap.delete(candidate)
  })

  const candidateResults = voteCounts.map(([c, v]) => ({
    data: { id: c, voteCount: v },
    isSelected: electedCandidates.has(c),
  }))

  return {
    round,
    quota,
    candidateResults: candidateResults,
    droppedCandidate: null,
  }
}

export const calculateSTVResult = (
  candidates: Candidate[],
  votes: Vote[],
  numberOfSeats: number
): VotingResult => {
  const roundResults: VotingRoundResult[] = []
  let winnerCount = 0
  let votingIsFinished = false
  let round = 1

  const nonEmptyVotes = votes.filter((vote) => vote.candidateIds.length > 0)
  const nonEmptyVoteCount = nonEmptyVotes.length
  const quota = Math.floor(nonEmptyVoteCount / (numberOfSeats + 1)) + 1

  const voteMap: VoteMap = new Map()
  candidates.forEach((c) => voteMap.set(c.candidateId, []))

  votes.forEach(({ candidateIds }) => {
    const id = candidateIds[0]
    if (id) {
      const weightedVotes = voteMap.get(id)!
      weightedVotes.push({ weight: 1.0, vote: candidateIds })
    }
  })

  while (!votingIsFinished) {
    if (round > candidates.length + 1) {
      throw new Error('Too many voting rounds!')
    }

    const acceptAllCandidates = voteMap.size + winnerCount <= numberOfSeats

    const electedCandidates = new Set(
      getCurrentVoteCountsOfCandidates(voteMap)
        .filter(([, votes]) => votes >= quota || acceptAllCandidates)
        .map(([id]) => id)
    )

    let roundResult: VotingRoundResult
    if (electedCandidates.size > 0) {
      roundResult = transferSurplusVotes(
        voteMap,
        electedCandidates,
        quota,
        round
      )
    } else {
      roundResult = dropOneCandidate(voteMap, quota, round)
    }

    roundResults.push(roundResult)
    winnerCount += electedCandidates.size
    round += 1

    if (winnerCount === numberOfSeats || voteMap.size === 0) {
      votingIsFinished = true
    }
  }

  const winners = roundResults
    .flatMap((res) => res.candidateResults.filter((c) => c.isSelected))
    .map((c) => c.data.id)

  return {
    totalVoters: votes.length,
    totalVotes: nonEmptyVoteCount,
    roundResults,
    winners,
  }
}
