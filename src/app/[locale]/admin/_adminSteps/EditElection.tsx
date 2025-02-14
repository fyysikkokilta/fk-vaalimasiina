'use client'

import React, { useState } from 'react'

import AdminNavigation from '~/components/AdminNavigation'
import ElectionForm from '~/components/ElectionForm'
import { ElectionStep } from '~/settings/electionStepSettings'
import { RouterInput, RouterOutput, trpc } from '~/trpc/client'

export default function EditElection({
  election
}: {
  election: Exclude<RouterOutput['admin']['elections']['findCurrent'], null>
}) {
  const update = trpc.admin.elections.update.useMutation()
  const cancelEditing = trpc.admin.elections.cancelEditing.useMutation()
  const [newCandidate, setNewCandidate] = useState('')
  const [updatedElection, setUpdatedElection] =
    useState<RouterInput['admin']['elections']['update']>(election)

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    isNumber: boolean = false
  ) => {
    setUpdatedElection((electionState) => ({
      ...electionState,
      [event.target.name]: isNumber
        ? parseInt(event.target.value, 10) || ''
        : event.target.value
    }))
  }

  const addCandidate = (candidateName: string) => {
    setUpdatedElection((electionState) => ({
      ...electionState,
      candidates: [...electionState.candidates, { name: candidateName }]
    }))
    setNewCandidate('')
  }

  const removeCandidate = (index: number) => {
    setUpdatedElection((electionState) => {
      const updatedCandidates = electionState.candidates.filter(
        (_, i) => i !== index
      )

      return {
        ...electionState,
        candidates: updatedCandidates
      }
    })
  }

  const handleCancelEditing = async () => {
    await cancelEditing.mutateAsync({
      electionId: election.electionId
    })
  }

  const handleSubmit = async () => {
    await update.mutateAsync({
      ...updatedElection
    })
  }

  const disabled = !(
    updatedElection.title &&
    updatedElection.description &&
    updatedElection.seats > 0 &&
    updatedElection.candidates.length >= updatedElection.seats
  )

  return (
    <AdminNavigation
      electionStep={ElectionStep.EDIT}
      disableNext={disabled}
      onBack={handleCancelEditing}
      onNext={handleSubmit}
    >
      <ElectionForm
        election={updatedElection}
        newCandidate={newCandidate}
        setNewCandidate={setNewCandidate}
        handleChange={handleChange}
        addCandidate={addCandidate}
        removeCandidate={removeCandidate}
      />
    </AdminNavigation>
  )
}
