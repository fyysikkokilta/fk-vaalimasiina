'use client'

import { useTranslations } from 'next-intl'
import { InferSafeActionFnInput } from 'next-safe-action'
import { useAction } from 'next-safe-action/hooks'
import React, { useState } from 'react'
import { toast } from 'react-toastify'

import { createElection } from '~/actions/admin/createElection'
import AdminNavigation from '~/components/AdminNavigation'
import ElectionForm from '~/components/ElectionForm'
import { ElectionStep } from '~/settings/electionStepSettings'

export default function NewElection() {
  const [newCandidate, setNewCandidate] = useState('')
  const [newElection, setNewElection] = useState<
    InferSafeActionFnInput<typeof createElection>['parsedInput']
  >({
    title: '',
    description: '',
    seats: 0,
    candidates: [] as unknown as [string, ...string[]]
  })

  const t = useTranslations('NewElection')

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
      candidates: [...electionState.candidates, candidateName]
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
        candidates: updatedCandidates as [string, ...string[]]
      }
    })
  }

  const { execute, isPending, result } = useAction(createElection, {
    onSuccess: ({ data }) => {
      if (data?.message) {
        toast.success(data.message)
      }
    },
    onError: ({ error }) => {
      if (error.serverError) {
        toast.error(error.serverError)
      } else {
        toast.error(t('invalid_election_data'))
      }
    }
  })

  return (
    <AdminNavigation
      disableNext={isPending}
      electionStep={ElectionStep.NEW}
      onNext={() => execute(newElection)}
    >
      <ElectionForm
        result={result}
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
