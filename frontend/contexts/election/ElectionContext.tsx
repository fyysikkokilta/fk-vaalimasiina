import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from 'react'

import { Election } from '../../../types/types'
import { fetchCurrentElection } from '../../api/elections'

type ElectionContextType = {
  election: Election | null
  setElection: Dispatch<SetStateAction<Election | null>>
}

export const ElectionContext = createContext<ElectionContextType | null>(null)

export const ElectionProvider = ({ children }) => {
  const [election, setElection] = useState<Election | null>(null)

  useEffect(() => {
    ;(async () => {
      const response = await fetchCurrentElection()

      if (!response.ok) {
        return
      }

      setElection(response.data[0])
    })()
  }, [])

  return (
    <ElectionContext.Provider value={{ election, setElection }}>
      {children}
    </ElectionContext.Provider>
  )
}
