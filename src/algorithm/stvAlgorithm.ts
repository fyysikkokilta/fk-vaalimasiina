// This file implements the Single Transferable Vote (STV) algorithm.
// It calculates the election result using the STV method based on the given ballots,
// election configuration, and voter count.
// The quota used is the Droop quota

import type { ElectionStepProps } from '~/data/getAdminElection'
import type { ElectionPageProps } from '~/data/getElection'

import { shuffleWithSeed } from './shuffleWithSeed'

export type Election =
  | ElectionPageProps['election']
  | ElectionStepProps['election']

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

// Function to compute the current vote counts for each candidate based on the voteMap.
// voteMap is a Map where keys are candidate IDs and values are arrays of votes (each with a weight).
const getCurrentVoteCountsOfCandidates = (
  voteMap: VoteMap
): [CandidateId, number][] => {
  // Initialize an empty array to hold tuples of candidate IDs and their total votes.
  const counts: [CandidateId, number][] = []
  // Iterate over each candidate in the vote map.
  voteMap.forEach((votes, id) => {
    // Sum the weights of all votes for the candidate.
    const totalVotes = votes.reduce((sum, v) => sum + v.weight, 0.0)
    // Add the candidate ID and the computed total votes to the counts array.
    counts.push([id, totalVotes])
  })
  // Return the array of [CandidateId, totalVotes] tuples.
  return counts
}

// Function to find the next candidate preference from a ballot.
// It returns the first candidate in the ballot (ordered by preference)
// that is still present in the voteMap.
const findNextPreference = (
  voteMap: VoteMap,
  vote: BallotData
): CandidateId | undefined => {
  return vote.find((c) => voteMap.has(c))
}

const EPSILON = 1e-10
// A small constant to handle imprecision in floating-point arithmetic.

// The main function to calculate the STV election result. This function uses multiple rounds
// to either elect candidates or eliminate them, redistributing votes until all seats are filled
// or no votes can be redistributed.
export const calculateSTVResult = (
  election: Election, // The election configuration, including candidates and number of seats.
  ballots: Ballot[], // Array of ballots cast in the election.
  voterCount: number // The expected number of voters.
): VotingResult => {
  // Array to hold the results for each counting round.
  const roundResults: VotingRoundResult[] = []
  // Flag to indicate when the counting process is finished.
  let votingIsFinished = false
  // Counter for the rounds, starting at 1.
  let round = 1

  // Compute the total number of ballots cast.
  const totalVotes = ballots.length

  // If the number of ballots does not match the expected voter count, return an invalid result.
  if (totalVotes !== voterCount) {
    return {
      validResult: false,
      totalVotes,
      voterCount
    }
  }
  // Filter out ballots that did not contain any votes.
  const nonEmptyBallots = ballots.filter((ballot) => ballot.votes.length > 0)
  // Count how many ballots have at least one vote.
  const nonEmptyVotes = nonEmptyBallots.length
  // Calculate the election quota using the Droop quota formula:
  // quota = floor(nonEmptyVotes / (seats + 1)) + 1
  const quota = Math.floor(nonEmptyVotes / (election.seats + 1)) + 1

  // Initialize a vote map for each candidate with an empty list of votes.
  const voteMap: VoteMap = new Map()
  election.candidates.forEach((c) => voteMap.set(c.candidateId, []))

  // Sets to keep track of the candidates who have won (winners) and those who have been eliminated (losers).
  const winnerSet = new Set<CandidateId>()
  const loserSet = new Set<CandidateId>()

  // Process each ballot that is not empty.
  nonEmptyBallots.forEach(({ votes }) => {
    // Sort the candidate preferences in each ballot by their rank (the lower rank, the higher the preference).
    const candidateIds = votes
      .sort((a, b) => a.rank - b.rank)
      .map((v) => v.candidateId)
    // Select the candidate with the highest preference (first in order).
    const id = candidateIds[0]
    if (id) {
      // Retrieve the votes currently assigned to this candidate from voteMap.
      const weightedVotes = voteMap.get(id)!
      // Add this ballot's vote with full weight (1.0) to the candidate.
      weightedVotes.push({ weight: 1.0, vote: candidateIds })
    }
  })

  // Begin the iterative STV rounds.
  while (!votingIsFinished) {
    // Safety check: if rounds exceed the number of candidates plus one, throw an error.
    if (round > election.candidates.length + 1) {
      throw new Error('Too many voting rounds!')
    }

    // Determine if we should "accept" all remaining candidates without further elimination.
    // This is the case when the combined count of remaining candidates and winners is less than or equal to the available seats.
    const acceptAllCandidates = voteMap.size + winnerSet.size <= election.seats

    // Get the current vote counts for each candidate that still has votes in voteMap.
    const voteCounts = getCurrentVoteCountsOfCandidates(voteMap)
    // Identify candidates whose total votes meet or exceed the quota, or all remaining if acceptance applies.
    const electedCandidates = new Set(
      voteCounts
        .filter(([, votes]) => votes >= quota || acceptAllCandidates)
        .map(([id]) => id)
    )
    // Find the minimum vote count among all candidate vote counts.
    const minVotes = Math.min(...voteCounts.map(([, votes]) => votes))

    // Use EPSILON to handle potential floating-point errors when comparing votes.
    // Find candidates with vote counts within EPSILON of the minimum.
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

    // Randomly select one of the candidates to be dropped in case of a tie.
    const candidateToBeDropped =
      electedCandidates.size === 0
        ? shuffleWithSeed(candidatesWithMinVotes, election.electionId)[0]
        : null

    if (electedCandidates.size > 0) {
      // There are winners in this round.
      // For each candidate that meets or exceeds the quota:
      electedCandidates.forEach((candidate) => {
        // Retrieve all votes allocated to this candidate.
        const votesOfWinner = voteMap.get(candidate)!
        // Compute the candidate's total votes.
        const totalVotes = votesOfWinner.reduce((sum, v) => sum + v.weight, 0)
        // Calculate the surplus votes (votes exceeding the quota).
        const surplus = totalVotes - quota

        // Remove the candidate from the voteMap as they are now elected.
        voteMap.delete(candidate)

        // If there is a surplus of votes, redistribute them proportionally.
        if (surplus > 0) {
          votesOfWinner.forEach((vote) => {
            // Adjust each vote's weight proportional to the surplus.
            vote.weight = (vote.weight / totalVotes) * surplus
            // Find the next preferred candidate who is still active in voteMap.
            const secondaryPreference = findNextPreference(voteMap, vote.vote)
            if (secondaryPreference) {
              // Add the weighted vote to the secondary candidate.
              voteMap.get(secondaryPreference)!.push(vote)
            }
          })
        }
      })
    } else {
      // No candidate reached the quota in this round; eliminate the candidate with the fewest votes.
      // Get the votes for the candidate to be dropped.
      const votesOfDroppedCandidate = voteMap.get(candidateToBeDropped![0])!
      // Remove this candidate from the voteMap.
      voteMap.delete(candidateToBeDropped![0])

      // Redistribute votes from the eliminated candidate.
      votesOfDroppedCandidate.forEach((vote) => {
        // Find the next preferred candidate still in the voteMap.
        const secondaryPreference = findNextPreference(voteMap, vote.vote)
        if (secondaryPreference) {
          // Add the vote to the secondary candidate.
          voteMap.get(secondaryPreference)!.push(vote)
        }
      })
    }

    // Prepare a combined list of candidate vote counts
    // and include winners (with a full quota) and losers (with zero votes)
    const candidateResults: CandidateResult[] = voteCounts
      .concat(Array.from(winnerSet).map((c) => [c, quota]))
      .concat(Array.from(loserSet).map((c) => [c, 0]))
      .map(([c, v]) => ({
        id: c, // Candidate identifier.
        name: election.candidates.find((c2) => c2.candidateId === c)!.name, // Retrieve candidate name from the election data.
        voteCount: v, // Total votes (might be surplus, quota, or zero).
        isSelected: winnerSet.has(c) || electedCandidates.has(c), // Mark candidate as selected if they are in the winners set or elected this round.
        isSelectedThisRound: electedCandidates.has(c), // Specifically indicate if the candidate was elected in this round.
        isEliminated: loserSet.has(c) || c === candidateToBeDropped?.[0], // Mark candidate as eliminated if in loser set or if dropped in this round.
        isEliminatedThisRound: c === candidateToBeDropped?.[0] // Only true for the candidate eliminated during this round.
      }))
      // Sort the candidates alphabetically by name.
      .sort((a, b) => a.name.localeCompare(b.name))

    // Add newly elected candidates to the overall winner set.
    electedCandidates.forEach((c) => winnerSet.add(c))
    // If a candidate was eliminated in this round, add them to the loser set.
    if (candidateToBeDropped) {
      loserSet.add(candidateToBeDropped[0])
    }

    // Save the round's result:
    // - The round number.
    // - Candidate results for that round.
    // - The count of votes that remain unallocated (empty votes).
    // - Whether a tie-breaker (random elimination) occurred.
    roundResults.push({
      round,
      candidateResults,
      emptyVotes:
        totalVotes -
        candidateResults.reduce((sum, { voteCount }) => sum + voteCount, 0),
      tieBreaker:
        candidatesWithMinVotes.length > 1 && electedCandidates.size === 0
    })

    // Increment the round counter.
    round += 1

    // Termination condition: if the number of winners equals the available seats
    // or if there are no more candidates left in the voteMap, finish voting.
    if (winnerSet.size === election.seats || voteMap.size === 0) {
      votingIsFinished = true
    }
  }

  // Prepare the final list of winners by converting the winner set to an array of candidate details.
  const winners = Array.from(winnerSet)
    .map((c) => ({
      id: c,
      name: election.candidates.find((c2) => c2.candidateId === c)!.name
    }))
    // Sort the winners alphabetically by name.
    .sort((a, b) => a.name.localeCompare(b.name))

  // Return the valid voting result with all relevant details.
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
