'use client'

import type { AdminElection } from '~/data/getAdminElection'

import EditElection from './_adminSteps/EditElection'
import NewElection from './_adminSteps/NewElection'
import PreviewElection from './_adminSteps/PreviewElection'
import Results from './_adminSteps/Results'
import VotingInspection from './_adminSteps/VotingInspection'

export default function Admin({
  adminElection
}: {
  adminElection: AdminElection
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
