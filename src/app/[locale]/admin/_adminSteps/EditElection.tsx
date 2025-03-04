'use client'

import React from 'react'

import { protectedCancelEditing } from '~/actions/admin/election/cancelEditing'
import { protectedEditElection } from '~/actions/admin/election/editElection'
import AdminNavigation from '~/components/AdminNavigation'
import ElectionForm from '~/components/ElectionForm'
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

  return (
    <AdminNavigation
      electionStep={ElectionStep.EDIT}
      tKey="admin.admin_main.new_election"
      onBack={cancelEditingAction}
      onNext={editElectionAction}
    >
      <ElectionForm election={election} />
    </AdminNavigation>
  )
}
