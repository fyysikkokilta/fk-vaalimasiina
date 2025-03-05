'use client'

import React from 'react'

import { protectedCreateElection } from '~/actions/admin/election/createElection'
import AdminNavigation from '~/components/AdminNavigation'
import ElectionForm from '~/components/ElectionForm'
import { useToastedActionState } from '~/hooks/useToastedActionState'
import { ElectionStep } from '~/settings/electionStepSettings'

export default function NewElection() {
  const createElectionAction = protectedCreateElection

  const [createElectionState, createElection, createElectionPending] =
    useToastedActionState(
      createElectionAction,
      {
        success: false,
        message: '',
        errors: { formErrors: [], fieldErrors: {} },
        formData: new FormData()
      },
      'admin.admin_main.new_election'
    )

  return (
    <AdminNavigation
      disableNext={createElectionPending}
      electionStep={ElectionStep.NEW}
      onNext={createElection}
    >
      <ElectionForm state={createElectionState} />
    </AdminNavigation>
  )
}
