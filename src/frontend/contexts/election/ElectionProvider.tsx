import React, { ReactNode, useEffect, useState } from 'react'

import { Election } from '../../../../types/types'
import { fetchCurrentElection } from '../../api/elections'
import { ElectionContext } from './ElectionContext'

export const ElectionProvider = ({ children }: { children: ReactNode }) => {
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
