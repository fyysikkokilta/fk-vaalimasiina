export type VoterData = {
  identifier: string
  active: boolean
  loggedIn: boolean
  alias: string
}

export type Voter = {
  voterId: string
  identifier: string
  alias: string
  loggedIn: boolean
  active: boolean
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
