import type { ElectionPageProps } from '~/app/[locale]/elections/[electionId]/page'
import type { RouterOutput, TestRouterOutput } from '~/trpc/client'

import { shuffleWithSeed } from './shuffleWithSeed'

export type Election =
  | ElectionPageProps['election']
  | NonNullable<RouterOutput['admin']['elections']['findCurrent']>
  | TestRouterOutput['elections']['create']

export type Ballot = ElectionPageProps['ballots'][number]

type CandidateId = Election['candidates'][number]['candidateId']

type BallotData = CandidateId[]

interface WeightedVote {
  weight: number
  vote: BallotData
}

type VoteMap = Map<CandidateId, WeightedVote[]>

interface CandidateResult {
  id: CandidateId
  name: string
  voteCount: number
  isSelectedThisRound: boolean
  isSelected: boolean
  isEliminatedThisRound: boolean
  isEliminated: boolean
}

interface VotingRoundResult {
  round: number
  candidateResults: CandidateResult[]
  emptyVotes: number
  tieBreaker?: boolean
}

interface Winner {
  id: CandidateId
  name: string
}

export type ValidVotingResult = {
  validResult: true
  totalVotes: number
  nonEmptyVotes: number
  quota: number
  roundResults: VotingRoundResult[]
  winners: Winner[]
  ballots: Ballot[]
}

export type InvalidVotingResult = {
  validResult: false
  totalVotes: number
  voterCount: number
}

export type VotingResult = ValidVotingResult | InvalidVotingResult

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

const EPSILON = 1e-10

export const calculateSTVResult = (
  election: Election,
  ballots: Ballot[],
  voterCount: number
): VotingResult => {
  const roundResults: VotingRoundResult[] = []
  let votingIsFinished = false
  let round = 1

  const totalVotes = ballots.length

  if (totalVotes !== voterCount) {
    return {
      validResult: false,
      totalVotes,
      voterCount
    }
  }
  const nonEmptyBallots = ballots.filter((ballot) => ballot.votes.length > 0)
  const nonEmptyVotes = nonEmptyBallots.length
  const quota = Math.floor(nonEmptyVotes / (election.seats + 1)) + 1

  const voteMap: VoteMap = new Map()
  election.candidates.forEach((c) => voteMap.set(c.candidateId, []))

  const winnerSet = new Set<CandidateId>()
  const loserSet = new Set<CandidateId>()

  nonEmptyBallots.forEach(({ votes }) => {
    const candidateIds = votes
      .sort((a, b) => a.rank - b.rank)
      .map((v) => v.candidateId)
    const id = candidateIds[0]
    if (id) {
      const weightedVotes = voteMap.get(id)!
      weightedVotes.push({ weight: 1.0, vote: candidateIds })
    }
  })

  while (!votingIsFinished) {
    if (round > election.candidates.length + 1) {
      throw new Error('Too many voting rounds!')
    }

    const acceptAllCandidates = voteMap.size + winnerSet.size <= election.seats

    const voteCounts = getCurrentVoteCountsOfCandidates(voteMap)
    const electedCandidates = new Set(
      voteCounts
        .filter(([, votes]) => votes >= quota || acceptAllCandidates)
        .map(([id]) => id)
    )
    const minVotes = Math.min(...voteCounts.map(([, votes]) => votes))

    // Using epsilon to avoid floating point comparison issues
    const candidatesWithMinVotes = voteCounts.filter(
      ([, votes]) => votes <= minVotes + EPSILON
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

    const candidateToBeDropped =
      electedCandidates.size === 0
        ? shuffleWithSeed(candidatesWithMinVotes, election.electionId)[0]
        : null

    if (electedCandidates.size > 0) {
      // There are winners this round
      // Distribute surplus votes
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
    } else {
      // There are no winners this round
      // Eliminate the candidate with the least votes
      // and distribute their votes
      const votesOfDroppedCandidate = voteMap.get(candidateToBeDropped![0])!
      voteMap.delete(candidateToBeDropped![0])

      votesOfDroppedCandidate.forEach((vote) => {
        const secondaryPreference = findNextPreference(voteMap, vote.vote)
        if (secondaryPreference) {
          voteMap.get(secondaryPreference)!.push(vote)
        }
      })
    }

    const candidateResults: CandidateResult[] = voteCounts
      .concat(Array.from(winnerSet).map((c) => [c, quota]))
      .concat(Array.from(loserSet).map((c) => [c, 0]))
      .map(([c, v]) => ({
        id: c,
        name: election.candidates.find((c2) => c2.candidateId === c)!.name,
        voteCount: v,
        isSelected: winnerSet.has(c) || electedCandidates.has(c),
        isSelectedThisRound: electedCandidates.has(c),
        isEliminated: loserSet.has(c) || c === candidateToBeDropped?.[0],
        isEliminatedThisRound: c === candidateToBeDropped?.[0]
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    electedCandidates.forEach((c) => winnerSet.add(c))
    if (candidateToBeDropped) {
      loserSet.add(candidateToBeDropped[0])
    }

    roundResults.push({
      round,
      candidateResults,
      emptyVotes:
        totalVotes -
        candidateResults.reduce((sum, { voteCount }) => sum + voteCount, 0),
      tieBreaker:
        candidatesWithMinVotes.length > 1 && electedCandidates.size === 0
    })

    round += 1

    if (winnerSet.size === election.seats || voteMap.size === 0) {
      votingIsFinished = true
    }
  }

  const winners = Array.from(winnerSet)
    .map((c) => ({
      id: c,
      name: election.candidates.find((c2) => c2.candidateId === c)!.name
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  return {
    validResult: true,
    totalVotes,
    nonEmptyVotes,
    quota,
    roundResults,
    winners,
    ballots
  }
}
