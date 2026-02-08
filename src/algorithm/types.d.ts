/**
 * Central type definitions for the voting algorithms (STV and majority).
 * All types used by stvAlgorithm and majorityAlgorithm are defined here.
 */

import type { ElectionStepProps } from '~/data/getAdminElection'
import type { ElectionPageProps } from '~/data/getElection'

// ─── Shared (data layer) ─────────────────────────────────────────────────────

/** Election as provided by getElection (public) or getAdminElection (admin). */
export type Election = ElectionPageProps['election'] | ElectionStepProps['election']

/** Single ballot with votes (candidateId + rank). */
export type Ballot = ElectionPageProps['ballots'][number]

export type CandidateId = Election['candidates'][number]['candidateId']

// ─── STV algorithm ───────────────────────────────────────────────────────────

export type BallotData = CandidateId[]

export interface WeightedVote {
  weight: number
  vote: BallotData
}

export type VoteMap = Map<CandidateId, WeightedVote[]>

export interface CandidateResult {
  id: CandidateId
  name: string
  voteCount: number
  isSelectedThisRound: boolean
  isSelected: boolean
  isEliminatedThisRound: boolean
  isEliminated: boolean
}

export interface VotingRoundResult {
  round: number
  candidateResults: CandidateResult[]
  emptyVotes: number
  tieBreaker?: boolean
}

export interface Winner {
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

// ─── Majority algorithm ──────────────────────────────────────────────────────

export interface MajorityCandidateResult {
  id: CandidateId
  name: string
  voteCount: number
}

export interface MajorityWinner {
  id: CandidateId
  name: string
}

export type ValidMajorityResult = {
  validResult: true
  totalVotes: number
  nonEmptyVotes: number
  candidateResults: MajorityCandidateResult[]
  winners: MajorityWinner[]
  ballots: MajorityBallot[]
}

export type InvalidMajorityResult = {
  validResult: false
  totalVotes: number
  voterCount: number
}

export type MajorityResult = ValidMajorityResult | InvalidMajorityResult
