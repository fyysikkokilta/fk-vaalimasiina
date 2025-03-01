'use client'

import { useSuspenseQuery } from '@tanstack/react-query'

import { useTRPC } from '~/trpc/client'

import EditElection from './_adminSteps/EditElection'
import NewElection from './_adminSteps/NewElection'
import PreviewElection from './_adminSteps/PreviewElection'
import Results from './_adminSteps/Results'
import VotingInspection from './_adminSteps/VotingInspection'

export default function Admin() {
  const trpc = useTRPC()
  const { data: election } = useSuspenseQuery(
    trpc.admin.elections.findCurrent.queryOptions()
  )
  if (!election) {
    return <NewElection />
  }

  switch (election.status) {
    case 'UPDATING':
      return <EditElection election={election} />
    case 'CREATED':
      return <PreviewElection election={election} />
    case 'ONGOING':
      return <VotingInspection election={election} />
    case 'FINISHED':
      return <Results election={election} />
  }
}
