'use client'

import EditElection from './_adminSteps/EditElection'
import NewElection from './_adminSteps/NewElection'
import PreviewElection from './_adminSteps/PreviewElection'
import Results from './_adminSteps/Results'
import VotingInspection from './_adminSteps/VotingInspection'
import { AdminPageProps } from './page'

export default function Admin({
  adminElection
}: {
  adminElection: AdminPageProps
}) {
  if (!adminElection) {
    return <NewElection />
  }

  switch (adminElection.election.status) {
    case 'UPDATING':
      return <EditElection {...adminElection} />
    case 'CREATED':
      return <PreviewElection {...adminElection} />
    case 'ONGOING':
      return <VotingInspection {...adminElection} />
    case 'FINISHED':
      return <Results {...adminElection} />
  }
}
