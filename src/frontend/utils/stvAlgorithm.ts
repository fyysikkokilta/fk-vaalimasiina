import seedrandom from 'seedrandom'
import _lodash, { orderBy } from 'lodash'
import { Candidate, Ballot } from '../../../types/types'

type CandidateId = Candidate['candidateId']

type BallotData = CandidateId[]

interface WeightedVote {
  weight: number
  vote: BallotData
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
  tieBreaker?: boolean
}

export type VotingResult = {
  totalVoters: number
  totalVotes: number
  roundResults: VotingRoundResult[]
  winners: CandidateId[]
  ballots: BallotData[]
}

const getCurrentVoteCountsOfCandidates = (
  voteMap: VoteMap
): [CandidateId, number][] => {
  const counts: [CandidateId, number][] = []
  voteMap.forEach((votes, id) => {
    const totalVotes = votes.reduce((sum, v) => sum + v.weight, 0.0)
    counts.push([id, totalVotes])
  })
  return counts
}

const findNextPreference = (
  voteMap: VoteMap,
  vote: BallotData
): CandidateId | undefined => {
  return vote.find((c) => voteMap.has(c))
}

const dropOneCandidate = (
  voteMap: VoteMap,
  quota: number,
  round: number,
  electionId: string,
  previouslySelectedCandidates: Set<CandidateId>
): VotingRoundResult => {
  const voteCounts = getCurrentVoteCountsOfCandidates(voteMap)
  voteCounts.sort((a, b) => a[1] - b[1])

  const minVotes = voteCounts[0][1]
  const candidatesWithMinVotes = voteCounts.filter(
    ([, votes]) => votes === minVotes
  )

  /**
   * If there is a tie, we need to randomly select one of the candidates
   * to be dropped. However, we need to make sure that the result is the same
   * every time the function is called with the same election ballots. To
   * achieve this, we seed the random number generator with the election ID.
   * This way, the random number generator will always produce the same
   * sequence of random numbers for the same election.
   *
   * Since the election ID is pretty much random, this should is enough to
   * ensure that the result is random but always the same for the same election.
   */

  seedrandom(electionId, { global: true })
  const _ = _lodash.runInContext()

  const candidateToBeDropped = _.shuffle(candidatesWithMinVotes)[0]

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
    .concat(
      Array.from(previouslySelectedCandidates).map((c) => ({
        data: { id: c, voteCount: quota },
        isSelected: true,
      }))
    )

  return {
    round,
    quota,
    candidateResults,
    droppedCandidate: {
      id: candidateToBeDropped[0],
      voteCount: candidateToBeDropped[1],
    },
    tieBreaker: candidatesWithMinVotes.length > 1,
  }
}

const transferSurplusVotes = (
  voteMap: VoteMap,
  electedCandidates: Set<CandidateId>,
  quota: number,
  round: number,
  previouslySelectedCandidates: Set<CandidateId>
): VotingRoundResult => {
  const voteCounts = getCurrentVoteCountsOfCandidates(voteMap)

  electedCandidates.forEach((candidate) => {
    const votesOfWinner = voteMap.get(candidate)!
    const totalVotes = votesOfWinner.reduce((sum, v) => sum + v.weight, 0)
    const surplus = totalVotes - quota

    voteMap.delete(candidate)

    if (surplus > 0) {
      votesOfWinner.forEach((vote) => {
        vote.weight = (vote.weight / totalVotes) * surplus
        const secondaryPreference = findNextPreference(voteMap, vote.vote)
        if (secondaryPreference) {
          voteMap.get(secondaryPreference)!.push(vote)
        }
      })
    }
  })

  const candidateResults = voteCounts
    .map(([c, v]) => ({
      data: { id: c, voteCount: v },
      isSelected: electedCandidates.has(c),
    }))
    .concat(
      Array.from(previouslySelectedCandidates)
        .filter((c) => !electedCandidates.has(c))
        .map((c) => ({
          data: { id: c, voteCount: quota },
          isSelected: true,
        }))
    )

  return {
    round,
    quota,
    candidateResults,
    droppedCandidate: null,
  }
}

export const calculateSTVResult = (
  candidates: Candidate[],
  ballots: Ballot[],
  numberOfSeats: number,
  electionId: string
): VotingResult => {
  const roundResults: VotingRoundResult[] = []
  let winnerCount = 0
  let votingIsFinished = false
  let round = 1

  const nonEmptyBallots = ballots.filter((ballot) => ballot.votes.length > 0)
  const nonEmptyVoteCount = nonEmptyBallots.length
  const quota = Math.floor(nonEmptyVoteCount / (numberOfSeats + 1)) + 1

  const voteMap: VoteMap = new Map()
  candidates.forEach((c) => voteMap.set(c.candidateId, []))

  const previouslySelectedCandidates = new Set<CandidateId>()

  nonEmptyBallots.forEach(({ votes }) => {
    const candidateIds = orderBy(votes, 'preferenceNumber').map(
      (v) => v.candidateId
    )
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

    electedCandidates.forEach((c) => previouslySelectedCandidates.add(c))

    let roundResult: VotingRoundResult
    if (electedCandidates.size > 0) {
      roundResult = transferSurplusVotes(
        voteMap,
        electedCandidates,
        quota,
        round,
        previouslySelectedCandidates
      )
    } else {
      roundResult = dropOneCandidate(
        voteMap,
        quota,
        round,
        electionId,
        previouslySelectedCandidates
      )
    }

    roundResults.push(roundResult)
    winnerCount += electedCandidates.size
    round += 1

    if (winnerCount === numberOfSeats || voteMap.size === 0) {
      votingIsFinished = true
    }
  }

  const winners = roundResults[roundResults.length - 1].candidateResults
    .filter((result) => result.isSelected)
    .map((result) => result.data.id)

  return {
    totalVoters: ballots.length,
    totalVotes: nonEmptyVoteCount,
    roundResults,
    winners,
    ballots: ballots.map((b) => b.votes.map((v) => v.candidateId)),
  }
}
