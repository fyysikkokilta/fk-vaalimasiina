'use client'

import { InferSafeActionFnInput } from 'next-safe-action'
import { useAction } from 'next-safe-action/hooks'
import { useState } from 'react'

import { cancelEditing } from '~/actions/admin/cancelEditing'
import { editElection } from '~/actions/admin/editElection'
import AdminNavigation from '~/components/AdminNavigation'
import ElectionForm from '~/components/ElectionForm'
import type { ElectionStepProps } from '~/data/getAdminElection'
import { ElectionStep } from '~/settings/electionStepSettings'

const ELECTION_FORM_ID = 'election-form'

export default function EditElection({ election }: ElectionStepProps) {
  const [editedElection, setEditedElection] = useState<
    InferSafeActionFnInput<typeof editElection>['parsedInput']
  >({
    ...election,
    candidates: election.candidates.map((candidate) => candidate.name) as [
      string,
      ...string[]
    ]
  })

  const addCandidate = (candidateName: string) => {
    setEditedElection((electionState) => ({
      ...electionState,
      candidates: [...electionState.candidates, candidateName]
    }))
  }

  const removeCandidate = (index: number) => {
    setEditedElection((electionState) => {
      const updatedCandidates = electionState.candidates.filter(
        (_, i) => i !== index
      )

      return {
        ...electionState,
        candidates: updatedCandidates as [string, ...string[]]
      }
    })
  }

  const { execute: executeCancel, status: cancelActionStatus } =
    useAction(cancelEditing)

  const { execute: executeEdit, status: editActionStatus } =
    useAction(editElection)

  return (
    <AdminNavigation
      electionStep={ElectionStep.EDIT}
      formId={ELECTION_FORM_ID}
      previousActionStatus={cancelActionStatus}
      nextActionStatus={editActionStatus}
      onBack={() => executeCancel({ electionId: election.electionId })}
      onNext={() => {}}
    >
      <ElectionForm
        formId={ELECTION_FORM_ID}
        election={editedElection}
        addCandidate={addCandidate}
        removeCandidate={removeCandidate}
        onValidSubmit={(data) =>
          executeEdit({
            ...data,
            electionId: data.electionId as string
          })
        }
        isEdit={true}
      />
    </AdminNavigation>
  )
}
