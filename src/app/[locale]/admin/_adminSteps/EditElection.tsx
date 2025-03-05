'use client'

import React from 'react'

import { protectedCancelEditing } from '~/actions/admin/election/cancelEditing'
import { protectedEditElection } from '~/actions/admin/election/editElection'
import AdminNavigation from '~/components/AdminNavigation'
import ElectionForm from '~/components/ElectionForm'
import { useToastedActionState } from '~/hooks/useToastedActionState'
import { ElectionStep } from '~/settings/electionStepSettings'

import { ElectionStepProps } from '../page'

export default function EditElection({ election }: ElectionStepProps) {
  const cancelEditingAction = protectedCancelEditing.bind(
    null,
    election.electionId
  )
  const editElectionAction = protectedEditElection.bind(
    null,
    election.electionId
  )

  const [, cancelEditing, cancelEditingPending] = useToastedActionState(
    cancelEditingAction,
    {
      success: false,
      message: ''
    },
    'admin.admin_main.new_election'
  )

  const [editElectionState, editElection, editElectionPending] =
    useToastedActionState(
      editElectionAction,
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
      electionStep={ElectionStep.EDIT}
      disablePrevious={cancelEditingPending}
      disableNext={editElectionPending}
      onBack={cancelEditing}
      onNext={editElection}
    >
      <ElectionForm election={election} state={editElectionState} />
    </AdminNavigation>
  )
}
