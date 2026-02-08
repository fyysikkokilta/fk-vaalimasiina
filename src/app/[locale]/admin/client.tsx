'use client'

import type { AdminElection } from '~/data/getAdminElection'

import EditElection from '~/components/adminSteps/EditElection'
import NewElection from '~/components/adminSteps/NewElection'
import PreviewElection from '~/components/adminSteps/PreviewElection'
import Results from '~/components/adminSteps/Results'
import VotingInspection from '~/components/adminSteps/VotingInspection'

export default function Admin({ adminElection }: { adminElection: AdminElection }) {
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
