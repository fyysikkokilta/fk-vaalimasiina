import { createContext, Dispatch, SetStateAction } from 'react'

import { Election } from '../../../../types/types'

type ElectionContextType = {
  election: Election | null
  setElection: Dispatch<SetStateAction<Election | null>>
}

export const ElectionContext = createContext<ElectionContextType | null>(null)
