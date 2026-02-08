// Plain majority (plurality) voting: one choice per voter, winners are top N by vote count.

import type {
  Ballot,
  CandidateId,
  Election,
  MajorityCandidateResult,
  MajorityResult,
  MajorityWinner
} from './types'

import { shuffleWithSeed } from './shuffleWithSeed'

export function calculateMajorityResult(
  election: Election,
  ballots: Ballot[],
  voterCount: number
): MajorityResult {
  const totalVotes = ballots.length

  if (totalVotes !== voterCount) {
    return {
      validResult: false,
      totalVotes,
      voterCount
    }
  }

  const nonEmptyBallots = ballots.filter((b) => b.votes.length > 0)
  const nonEmptyVotes = nonEmptyBallots.length

  // Count votes: for each ballot use only first preference (rank 1)
  const countByCandidate = new Map<CandidateId, number>()
  for (const c of election.candidates) {
    countByCandidate.set(c.candidateId, 0)
  }
  for (const ballot of nonEmptyBallots) {
    const sorted = ballot.votes.toSorted((a, b) => a.rank - b.rank)
    const first = sorted[0]
    if (first && countByCandidate.has(first.candidateId)) {
      countByCandidate.set(first.candidateId, (countByCandidate.get(first.candidateId) ?? 0) + 1)
    }
  }

  const candidateResults: MajorityCandidateResult[] = election.candidates
    .map((c) => ({
      id: c.candidateId,
      name: c.name,
      voteCount: countByCandidate.get(c.candidateId) ?? 0
    }))
    .toSorted((a, b) => a.name.localeCompare(b.name))

  // Top N by vote count; only candidates with at least one vote can win. Ties broken deterministically by seed.
  let remaining = [...candidateResults]
    .filter((c) => c.voteCount > 0)
    .toSorted((a, b) => b.voteCount - a.voteCount)
  const seats = Math.min(election.seats, remaining.length)
  const winners: MajorityWinner[] = []

  for (let i = 0; i < seats && remaining.length > 0; i++) {
    const topVoteCount = remaining[0].voteCount
    const tier = remaining.filter((c) => c.voteCount === topVoteCount)
    const shuffled = shuffleWithSeed(tier, `${election.electionId}-${i}`)
    const chosen = shuffled[0]
    if (chosen) {
      winners.push({ id: chosen.id, name: chosen.name })
      remaining = remaining.filter((c) => c.id !== chosen.id)
    }
  }

  return {
    validResult: true,
    totalVotes,
    nonEmptyVotes,
    candidateResults,
    winners: winners.toSorted((a, b) => a.name.localeCompare(b.name)),
    ballots
  }
}
