export type Voter = {
  voterId: string
  electionId: string
  email: string
  votingId: string
  hasVoted: boolean
  createdAt: string
  updatedAt: string
}

export type ElectionData = {
  title: string
  description: string
  amountToElect: number
  candidates: CandidateData[]
}

export type ElectionStatus = 'CREATED' | 'ONGOING' | 'FINISHED' | 'CLOSED'

export type Election = {
  electionId: string
  title: string
  description: string
  amountToElect: number
  candidates: Candidate[]
  status: ElectionStatus
  createdAt: string
  updatedAt: string
}

export type CandidateData = {
  name: string
}

export type Candidate = {
  candidateId: string
  electionId: string
  name: string
  createdAt: string
  updatedAt: string
}

export type Vote = {
  voteId: string
  ballotId: string
  electionId: string
  candidateId: string
  preferenceNumber: number
  createdAt: string
  updatedAt: string
}

export type VoteData = {
  electionId: string
  ballot: { candidateId: string; preferenceNumber: number }[]
}
