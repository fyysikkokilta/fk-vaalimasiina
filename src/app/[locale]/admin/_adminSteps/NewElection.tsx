'use client'

import { useMutation } from '@tanstack/react-query'
import React, { useState } from 'react'

import AdminNavigation from '~/components/AdminNavigation'
import ElectionForm from '~/components/ElectionForm'
import { ElectionStep } from '~/settings/electionStepSettings'
import { RouterInput, useTRPC } from '~/trpc/client'

export default function NewElection() {
  const trpc = useTRPC()
  const create = useMutation(trpc.admin.elections.create.mutationOptions())
  const [newCandidate, setNewCandidate] = useState('')
  const [newElection, setNewElection] = useState<
    RouterInput['admin']['elections']['create']
  >({
    title: '',
    description: '',
    seats: 0,
    candidates: []
  })

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    isNumber: boolean = false
  ) => {
    setNewElection((electionState) => ({
      ...electionState,
      [event.target.name]: isNumber
        ? parseInt(event.target.value, 10) || ''
        : event.target.value
    }))
  }

  const addCandidate = (candidateName: string) => {
    setNewElection((electionState) => ({
      ...electionState,
      candidates: [...electionState.candidates, { name: candidateName }]
    }))
    setNewCandidate('')
  }

  const removeCandidate = (index: number) => {
    setNewElection((electionState) => {
      const updatedCandidates = electionState.candidates.filter(
        (_, i) => i !== index
      )

      return {
        ...electionState,
        candidates: updatedCandidates
      }
    })
  }

  const handleSubmit = async () => {
    await create.mutateAsync(newElection)
  }

  const disabled = !(
    newElection.title &&
    newElection.description &&
    newElection.seats > 0 &&
    newElection.candidates.length >= newElection.seats
  )

  return (
    <AdminNavigation
      electionStep={ElectionStep.NEW}
      disableNext={disabled}
      onNext={handleSubmit}
    >
      <ElectionForm
        election={newElection}
        newCandidate={newCandidate}
        setNewCandidate={setNewCandidate}
        handleChange={handleChange}
        addCandidate={addCandidate}
        removeCandidate={removeCandidate}
      />
    </AdminNavigation>
  )
}
