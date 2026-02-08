'use client'

import { InferSafeActionFnInput } from 'next-safe-action'
import { useAction } from 'next-safe-action/hooks'
import { useState } from 'react'

import { createElection } from '~/actions/admin/createElection'
import AdminNavigation from '~/components/AdminNavigation'
import ElectionForm from '~/components/ElectionForm'
import { ElectionStep } from '~/settings/electionStepSettings'

const ELECTION_FORM_ID = 'election-form'

export default function NewElection() {
  const [newElection, setNewElection] = useState<
    InferSafeActionFnInput<typeof createElection>['parsedInput']
  >({
    title: '',
    description: '',
    seats: 0,
    votingMethod: 'STV',
    candidates: []
  })

  const addCandidate = (candidateName: string) => {
    setNewElection((electionState) => ({
      ...electionState,
      candidates: [...electionState.candidates, candidateName]
    }))
  }

  const removeCandidate = (index: number) => {
    setNewElection((electionState) => {
      const updatedCandidates = electionState.candidates.filter((_, i) => i !== index)

      return {
        ...electionState,
        candidates: updatedCandidates
      }
    })
  }

  const { execute, status: createActionStatus } = useAction(createElection)

  return (
    <AdminNavigation
      electionStep={ElectionStep.NEW}
      formId={ELECTION_FORM_ID}
      nextActionStatus={createActionStatus}
      onNext={() => {}}
    >
      <ElectionForm
        formId={ELECTION_FORM_ID}
        election={newElection}
        addCandidate={addCandidate}
        removeCandidate={removeCandidate}
        onValidSubmit={(data) => execute(data)}
      />
    </AdminNavigation>
  )
}
