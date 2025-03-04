'use client'

import React from 'react'

import { protectedCreateElection } from '~/actions/admin/election/createElection'
import AdminNavigation from '~/components/AdminNavigation'
import ElectionForm from '~/components/ElectionForm'
import { ElectionStep } from '~/settings/electionStepSettings'

export default function NewElection() {
  const createElectionAction = protectedCreateElection
  return (
    <AdminNavigation
      electionStep={ElectionStep.NEW}
      tKey="admin.admin_main.new_election"
      onNext={createElectionAction}
    >
      <ElectionForm />
    </AdminNavigation>
  )
}
